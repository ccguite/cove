'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { getTodaysBookingsClient, getTodaysBlockedSlotsClient } from '@/lib/orders/orderClientService';
import './rooms.css';

/* ─── Types ─────────────────────────────────────────────────────────── */
type Room = {
  id: string;
  name: string;
  slug: string;
  min_pax: number;
  max_pax: number;
  price_per_hour: number;
  description: string | null;
  image_url: string | null;
};

type Booking = {
  id: string; room_id: string; date: string;
  start_time: string; duration_hours: number; status: string;
};

type BlockedSlot = {
  id: string; room_id: string; date: string;
  start_time: string; duration_hours: number; reason: string | null;
};

type Props = {
  rooms: Room[];
  initialBookings: Booking[];
  initialBlocks: BlockedSlot[];
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function getOccupancy(room: Room, bookings: Booking[], blocks: BlockedSlot[], now: Date) {
  const cur = now.getHours() * 60 + now.getMinutes();
  const active = bookings.find(b => {
    if (b.room_id !== room.id) return false;
    const [h, m] = b.start_time.split(':').map(Number);
    const start = h * 60 + m;
    return cur >= start && cur < start + b.duration_hours * 60;
  });
  if (active) {
    const [h, m] = active.start_time.split(':').map(Number);
    const end = h * 60 + m + active.duration_hours * 60;
    const eh = Math.floor(end / 60) % 24, em = end % 60;
    const ap = eh >= 12 ? 'PM' : 'AM';
    return { status: 'occupied' as const, label: `Occupied · Ends ${eh % 12 || 12}:${String(em).padStart(2, '0')} ${ap}` };
  }
  const block = blocks.find(bl => {
    if (bl.room_id !== room.id) return false;
    const [h, m] = bl.start_time.split(':').map(Number);
    const start = h * 60 + m;
    return cur >= start && cur < start + bl.duration_hours * 60;
  });
  if (block) return { status: 'blocked' as const, label: block.reason ? `Blocked: ${block.reason}` : 'Blocked (Admin)' };
  return null;
}

const STATUS_STYLE = {
  occupied: { label: 'Occupied',  color: '#C62828', bg: '#FFEBEE' },
  blocked:  { label: 'Blocked',   color: '#E65100', bg: '#FFF3E0' },
  cleaning: { label: 'Cleaning',  color: '#F57F17', bg: '#FFFDE7' },
  available:{ label: 'Available', color: '#2E7D32', bg: '#E8F5E9' },
};

/* ─── Component ─────────────────────────────────────────────────────── */
export default function RoomsClient({ rooms: initialRooms, initialBookings, initialBlocks }: Props) {
  const supabase = createSupabaseBrowserClient();

  const [rooms, setRooms]           = useState<Room[]>(initialRooms);
  const [bookings, setBookings]     = useState<Booking[]>(initialBookings);
  const [blocks, setBlocks]         = useState<BlockedSlot[]>(initialBlocks);
  const [now, setNow]               = useState(new Date());
  const [cleaningIds, setCleaningIds] = useState<string[]>([]);

  // Edit modal state
  const [editing, setEditing]       = useState<Room | null>(null);
  const [draft, setDraft]           = useState<Partial<Room>>({});
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Clock ── */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* ── Refresh ── */
  const refresh = useCallback(async () => {
    try {
      const [b, bl] = await Promise.all([getTodaysBookingsClient(), getTodaysBlockedSlotsClient()]);
      setBookings(b as Booking[]);
      setBlocks(bl as BlockedSlot[]);
    } catch {}
  }, []);

  /* ── Realtime ── */
  useEffect(() => {
    const ch1 = supabase.channel('rooms-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, refresh)
      .subscribe();
    const ch2 = supabase.channel('rooms-blocks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_slots' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [supabase, refresh]);

  /* ── Open edit modal ── */
  const openEdit = (room: Room) => {
    setEditing(room);
    setDraft({
      name: room.name,
      description: room.description ?? '',
      min_pax: room.min_pax,
      max_pax: room.max_pax,
      price_per_hour: room.price_per_hour,
    });
    setImageFile(null);
    setImagePreview(room.image_url);
  };

  const closeEdit = () => { setEditing(null); setImageFile(null); setImagePreview(null); };

  /* ── Image picker ── */
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ── Save room ── */
  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let imageUrl = editing.image_url;

      // Upload new photo if selected
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `public/rooms/${editing.id}.${ext}`;
        const buf = Buffer.from(await imageFile.arrayBuffer());
        const { error: upErr } = await supabase.storage
          .from('room-photos')
          .upload(path, buf, { contentType: imageFile.type, upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('room-photos').getPublicUrl(path);
        imageUrl = publicUrl;
      }

      // Update room row
      const { error } = await supabase
        .from('rooms')
        .update({
          name:           draft.name,
          description:    draft.description,
          min_pax:        Number(draft.min_pax),
          max_pax:        Number(draft.max_pax),
          price_per_hour: Number(draft.price_per_hour),
          image_url:      imageUrl,
        })
        .eq('id', editing.id);

      if (error) throw error;

      setRooms(prev => prev.map(r =>
        r.id === editing.id
          ? { ...r, ...draft, image_url: imageUrl, min_pax: Number(draft.min_pax), max_pax: Number(draft.max_pax), price_per_hour: Number(draft.price_per_hour) }
          : r
      ));
      showToast('Room updated successfully', 'success');
      closeEdit();
    } catch (err: any) {
      showToast(err.message || 'Failed to update room', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Render ── */
  return (
    <div className="rm-root">
      {/* Room cards */}
      <div className="rm-grid">
        {rooms.map(room => {
          const occ = getOccupancy(room, bookings, blocks, now);
          const isCleaning = cleaningIds.includes(room.id);
          const statusKey = occ?.status ?? (isCleaning ? 'cleaning' : 'available');
          const st = STATUS_STYLE[statusKey];

          return (
            <div key={room.id} className="rm-card">
              {/* Photo */}
              <div className="rm-photo">
                {room.image_url
                  ? <Image src={room.image_url} alt={room.name} fill sizes="(max-width:640px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                  : <div className="rm-photo-placeholder">
                      <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-border)' }}>meeting_room</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontFamily: 'var(--font-body)' }}>No photo yet</span>
                    </div>
                }
              </div>

              {/* Body */}
              <div className="rm-body">
                {/* Status + name */}
                <div className="rm-header">
                  <div>
                    <h3 className="rm-name">{room.name}</h3>
                    <p className="rm-meta">{room.min_pax}–{room.max_pax} guests · ₹{room.price_per_hour}/hr</p>
                  </div>
                  <span className="rm-status-badge" style={{ color: st.color, background: st.bg }}>
                    <span className="rm-dot" style={{ background: st.color }} />
                    {st.label}
                  </span>
                </div>

                {/* Occupancy detail */}
                {occ && (
                  <p className="rm-occ-label">{occ.label}</p>
                )}

                {/* Description */}
                {room.description && (
                  <p className="rm-desc">{room.description}</p>
                )}

                {/* Actions */}
                <div className="rm-actions">
                  <button
                    className="rm-btn rm-btn-clean"
                    disabled={!!occ}
                    onClick={() => setCleaningIds(prev =>
                      prev.includes(room.id) ? prev.filter(id => id !== room.id) : [...prev, room.id]
                    )}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {isCleaning ? 'check_circle' : 'cleaning_services'}
                    </span>
                    {isCleaning ? 'Mark Cleaned' : 'Mark Cleaning'}
                  </button>
                  <button
                    className="rm-btn rm-btn-edit"
                    onClick={() => openEdit(room)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    Edit Room
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="rm-modal-overlay" onClick={closeEdit}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h3 className="rm-modal-title">Edit — {editing.name}</h3>
              <button className="rm-modal-close" onClick={closeEdit} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="rm-modal-body">
              {/* Photo upload */}
              <div className="rm-field">
                <label className="rm-label">Room Photo</label>
                <div
                  className="rm-photo-upload"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="rm-photo-preview" />
                    : <div className="rm-photo-upload-placeholder">
                        <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-border)' }}>add_photo_alternate</span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-disabled)', fontFamily: 'var(--font-body)' }}>Click to upload photo</span>
                      </div>
                  }
                  <div className="rm-photo-upload-overlay">
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff' }}>photo_camera</span>
                    <span style={{ color: '#fff', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600 }}>Change photo</span>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={onImageChange}
                />
              </div>

              {/* Name */}
              <div className="rm-field">
                <label className="rm-label" htmlFor="rm-name">Room Name</label>
                <input
                  id="rm-name"
                  className="rm-input"
                  type="text"
                  value={draft.name ?? ''}
                  onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="rm-field">
                <label className="rm-label" htmlFor="rm-desc">Description</label>
                <textarea
                  id="rm-desc"
                  className="rm-input rm-textarea"
                  rows={3}
                  placeholder="Brief description of this room…"
                  value={draft.description ?? ''}
                  onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Pax + Price */}
              <div className="rm-field-row">
                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-min">Min Guests</label>
                  <input id="rm-min" className="rm-input" type="number" min={1}
                    value={draft.min_pax ?? ''} onChange={e => setDraft(p => ({ ...p, min_pax: Number(e.target.value) }))} />
                </div>
                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-max">Max Guests</label>
                  <input id="rm-max" className="rm-input" type="number" min={1}
                    value={draft.max_pax ?? ''} onChange={e => setDraft(p => ({ ...p, max_pax: Number(e.target.value) }))} />
                </div>
                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-price">Price / hr (₹)</label>
                  <input id="rm-price" className="rm-input" type="number" min={1}
                    value={draft.price_per_hour ?? ''} onChange={e => setDraft(p => ({ ...p, price_per_hour: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div className="rm-modal-footer">
              <button className="rm-btn rm-btn-cancel" onClick={closeEdit} disabled={saving}>Cancel</button>
              <button className="rm-btn rm-btn-save" onClick={handleSave} disabled={saving}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {saving ? 'hourglass_top' : 'save'}
                </span>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="rm-toast" style={toast.type === 'error' ? { background: 'var(--color-error)' } : undefined}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

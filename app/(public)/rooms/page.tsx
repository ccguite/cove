import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Room } from '@/lib/supabase/types';
import './page.css';

const FALLBACK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Husk',
    slug: 'husk',
    min_pax: 1,
    max_pax: 2,
    price_per_hour: 599,
    description: 'An intimate cocoon designed for deep conversations or focused duo work. Features noise-dampening acoustic panels, ambient warm lighting, and slow-brewed tea.',
    created_at: '',
  },
  {
    id: '2',
    name: 'Movietopia',
    slug: 'movietopia',
    min_pax: 3,
    max_pax: 8,
    price_per_hour: 1499,
    description: 'A spacious sanctuary perfect for creative workshops, small celebrations, or team alignments. Features a large raw-edge oak table and smart screen.',
    created_at: '',
  },
];

interface AmenityItem {
  icon: string;
  label: string;
}

const ROOM_AMENITIES: Record<string, AmenityItem[]> = {
  husk: [
    { icon: 'wifi', label: 'High-speed Wi-Fi' },
    { icon: 'power', label: 'Power Outlets' },
    { icon: 'thermostat', label: 'Climate Control' },
  ],
  movietopia: [
    { icon: 'tv', label: 'Smart Screen' },
    { icon: 'edit_note', label: 'Whiteboard' },
    { icon: 'room_service', label: 'Service Call' },
  ],
  haven: [
    { icon: 'tv', label: 'Smart Screen' },
    { icon: 'edit_note', label: 'Whiteboard' },
    { icon: 'room_service', label: 'Service Call' },
  ],
};

const IMAGE_ASSETS: Record<string, string> = {
  husk: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdJW0jE70YaSMOywv8UdVC4mTg6bP5Ro7ri0MpV8TWtF3mrbe9xTc6QoQA5YZnLeU3nx6U8SLZOC5VyofltWjuJ2Wlu3bzLY4Xo1fChfmLg31BZVWi7lnAYDd2XKp5Raq3qklNOmFsn8suMxidcaSJFIb9WDEv44t8Wfc0qhNk_LRN98XPUJrpwrRDLWSSnnIiSrRAKsK0H4EJswl_dywK_-ICXw_QzGXpGhI6MxqRYyttI9fkLvgY8J3JRIzTYJ3JY95OyeZtboX',
  haven: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf4ecYOtvDx-yw1DP6nGsI7Wlel9zFo0FTdv3L4GQY8-pJnG6o5X5H4LH0vIqvDyAAxwx4gZiVWvIiF0i7Bl2IEULGIMCGn9yzNYCab1HJzu1R5NH0dwZpxAqFo3s7PIljqdEo_xqkQd6oTN3Hu613ySqliujbIh7s7D5H87GST0YnA8OTrM4uHOe6oAfQm_TMu8XnBdV06Ellk9PrxTzzMcaVzWevGfVj9H6pn1hV1vIzn9u-gRvre4ooE-uxJRR30EzzIDTlMBXx',
  movietopia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf4ecYOtvDx-yw1DP6nGsI7Wlel9zFo0FTdv3L4GQY8-pJnG6o5X5H4LH0vIqvDyAAxwx4gZiVWvIiF0i7Bl2IEULGIMCGn9yzNYCab1HJzu1R5NH0dwZpxAqFo3s7PIljqdEo_xqkQd6oTN3Hu613ySqliujbIh7s7D5H87GST0YnA8OTrM4uHOe6oAfQm_TMu8XnBdV06Ellk9PrxTzzMcaVzWevGfVj9H6pn1hV1vIzn9u-gRvre4ooE-uxJRR30EzzIDTlMBXx'
};

export default async function RoomsPage() {
  let rooms: Room[] = FALLBACK_ROOMS;

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('rooms').select('*');
    if (data && data.length > 0) {
      rooms = data as Room[];
    }
  } catch {}

  return (
    <div className="rooms-catalog-page">
      <div className="catalog-header">
        <h1 className="catalog-title">Our Private Rooms</h1>
        <p className="catalog-subtitle">
          Discover tranquility in our carefully curated private spaces. Designed for focused work, 
          intimate conversations, or relaxed gatherings.
        </p>
      </div>

      <div className="rooms-grid">
        {rooms.map((room) => (
          <article key={room.id} className="room-card">
            <div className="room-card-img-wrap">
              <Image
                src={room.image_url || IMAGE_ASSETS[room.slug] || IMAGE_ASSETS.husk}
                alt={`${room.name} Room`}
                fill
                className="room-card-img"
              />
              <div className="room-card-badge">
                <span className="material-symbols-outlined room-badge-icon">
                  {room.slug === 'husk' ? 'person' : 'groups'}
                </span>
                {room.slug === 'husk' ? 'Couple Room' : 'Group Room'}
              </div>
            </div>
            <div className="room-card-body">
              <div className="room-card-top-row">
                <div>
                  <h2 className="room-card-name">{room.name}</h2>
                  <p className="room-card-desc">{room.description}</p>
                </div>
                <div className="room-price-pill">
                  <span className="room-price-amount">₹{room.price_per_hour}</span>
                  <span className="room-price-suffix">/ hr</span>
                </div>
              </div>
              
              <div className="room-features-grid">
                {(ROOM_AMENITIES[room.slug] || []).map((amenity) => (
                  <div key={amenity.label} className="room-feature-item">
                    <span className="material-symbols-outlined room-feature-icon">{amenity.icon}</span>
                    <span className="room-feature-label">{amenity.label}</span>
                  </div>
                ))}
              </div>
              
              <Link href={`/rooms/${room.slug}`} className="btn-book-room">
                Select Room
                <span className="material-symbols-outlined btn-arrow">arrow_forward</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

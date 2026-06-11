import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Room } from '@/lib/supabase/types';
import './page.css';

const FALLBACK_ROOMS: Record<string, Room> = {
  husk: {
    id: '1',
    name: 'Husk',
    slug: 'husk',
    min_pax: 1,
    max_pax: 2,
    price_per_hour: 599,
    description: 'An intimate cocoon designed for deep conversations or focused duo work. Features noise-dampening acoustic panels, ambient warm lighting, and a curated selection of slow-brewed teas included.',
    created_at: '',
  },
  haven: {
    id: '2',
    name: 'Haven',
    slug: 'haven',
    min_pax: 3,
    max_pax: 8,
    price_per_hour: 1499,
    description: 'A spacious sanctuary perfect for creative workshops, small celebrations, or team alignments. Features a large raw-edge oak table, comfortable lounge seating, and a smart presentation screen.',
    created_at: '',
  },
};

const AMENITY_DETAILS: Record<string, Array<{ icon: string; title: string; desc: string }>> = {
  husk: [
    { icon: 'wifi', title: 'High-speed Wi-Fi', desc: 'Secure gigabit fiber connection, optimized for video calls.' },
    { icon: 'power', title: 'Power Outlets', desc: 'Ample Type C and universal plugs available directly on the table.' },
    { icon: 'thermostat', title: 'Climate Control', desc: 'Individual AC unit with smart remote to customize your comfort.' },
  ],
  haven: [
    { icon: 'tv', title: 'Smart Screen', desc: '55" Ultra HD display with wireless casting and HDMI inputs.' },
    { icon: 'edit_note', title: 'Whiteboard', desc: 'Magnetic glass whiteboard with markers and cleaning kit provided.' },
    { icon: 'call_receive', title: 'Private Service Call', desc: 'Digital tablet to place café orders directly to your room.' },
  ],
};

const IMAGE_ASSETS: Record<string, string[]> = {
  husk: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdJW0jE70YaSMOywv8UdVC4mTg6bP5Ro7ri0MpV8TWtF3mrbe9xTc6QoQA5YZnLeU3nx6U8SLZOC5VyofltWjuJ2Wlu3bzLY4Xo1fChfmLg31BZVWi7lnAYDd2XKp5Raq3qklNOmFsn8suMxidcaSJFIb9WDEv44t8Wfc0qhNk_LRN98XPUJrpwrRDLWSSnnIiSrRAKsK0H4EJswl_dywK_-ICXw_QzGXpGhI6MxqRYyttI9fkLvgY8J3JRIzTYJ3JY95OyeZtboX',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE'
  ],
  haven: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCf4ecYOtvDx-yw1DP6nGsI7Wlel9zFo0FTdv3L4GQY8-pJnG6o5X5H4LH0vIqvDyAAxwx4gZiVWvIiF0i7Bl2IEULGIMCGn9yzNYCab1HJzu1R5NH0dwZpxAqFo3s7PIljqdEo_xqkQd6oTN3Hu613ySqliujbIh7s7D5H87GST0YnA8OTrM4uHOe6oAfQm_TMu8XnBdV06Ellk9PrxTzzMcaVzWevGfVj9H6pn1hV1vIzn9u-gRvre4ooE-uxJRR30EzzIDTlMBXx',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAy4stc3v1ZsXHPI11viJ9OaOcga4yoNinUm81wBV69w7opV7ZGdnpHkvvP9FLaHgouX-md1MywR_xi2-eTaM4CYptsgJNMfxlWxvZSNl4Mou5keIHfN2Fwp4e4JyLlsLcUjQu64m2DGPNoWUaKOfvJyJlew2D-QJjNyTUlz8404jiGLkw6lB0YuNhOBQRyt-yk-2ZfNJ73etBshM8nv-r1kRBMB7kmyHkbXCKivn_DQafMx2KrFMbqkkWIIIBxUNCD4gN9MgdnyNH-'
  ],
};

// SSG Static Route Generation
export async function generateStaticParams() {
  return [
    { slug: 'husk' },
    { slug: 'haven' },
  ];
}

interface RoomDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params;

  if (slug !== 'husk' && slug !== 'haven') {
    notFound();
  }

  let room: Room = FALLBACK_ROOMS[slug];

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('rooms').select('*').eq('slug', slug).single();
    if (data) {
      room = data as Room;
    }
  } catch {}

  const amenities = AMENITY_DETAILS[slug] || [];
  const images = IMAGE_ASSETS[slug] || [];

  return (
    <div className="room-detail-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/" className="crumb-link">Home</Link>
        <span className="crumb-separator">/</span>
        <Link href="/rooms" className="crumb-link">Rooms</Link>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">{room.name}</span>
      </nav>

      {/* Main Container */}
      <div className="detail-layout">
        {/* Left Column: Visuals & Specs */}
        <div className="detail-main-content">
          <h1 className="room-title">{room.name}</h1>
          <p className="room-subtitle">
            {room.slug === 'husk' ? 'Private Couple Room' : 'Spacious Group Room'}
          </p>

          {/* Photo Gallery */}
          <div className="gallery-showcase">
            <div className="main-image-box">
              <Image
                src={images[0]}
                alt={`${room.name} room view`}
                fill
                priority
                className="gallery-main-image"
              />
            </div>
            <div className="gallery-thumbnails">
              {images.map((img, idx) => (
                <div key={idx} className="thumbnail-box">
                  <Image
                    src={img}
                    alt={`${room.name} thumbnail ${idx + 1}`}
                    fill
                    className="gallery-thumbnail-image"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <section className="section-block">
            <h2 className="section-header">Description</h2>
            <p className="description-text">{room.description}</p>
          </section>

          {/* Specs Grid */}
          <section className="section-block">
            <h2 className="section-header">Specifications</h2>
            <div className="specs-list">
              <div className="spec-item">
                <span className="material-symbols-outlined spec-icon">groups</span>
                <div className="spec-info">
                  <span className="spec-label">Capacity</span>
                  <span className="spec-value">
                    {room.slug === 'husk' ? '1 - 2 guests max' : `${room.min_pax} - ${room.max_pax} guests`}
                  </span>
                </div>
              </div>
              <div className="spec-item">
                <span className="material-symbols-outlined spec-icon">schedule</span>
                <div className="spec-info">
                  <span className="spec-label">Operating Hours</span>
                  <span className="spec-value">10:00 AM - 11:00 PM</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="material-symbols-outlined spec-icon">coffee</span>
                <div className="spec-info">
                  <span className="spec-label">Ambience</span>
                  <span className="spec-value">Korean Minimalist Lounge</span>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities details */}
          <section className="section-block">
            <h2 className="section-header">Amenities & Equipment</h2>
            <div className="amenities-details-grid">
              {amenities.map((item) => (
                <div key={item.title} className="amenity-detail-card">
                  <span className="material-symbols-outlined amenity-detail-icon">{item.icon}</span>
                  <div className="amenity-detail-content">
                    <h3 className="amenity-detail-title">{item.title}</h3>
                    <p className="amenity-detail-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <aside className="detail-sidebar">
          <div className="sticky-booking-card">
            <div className="booking-card-header">
              <span className="booking-rate-label">Hourly Rate</span>
              <span className="booking-rate-value">₹{room.price_per_hour}</span>
            </div>

            <div className="booking-card-info-list">
              <div className="booking-info-item">
                <span className="material-symbols-outlined info-icon">check_circle</span>
                <span>Real-time instant confirmation</span>
              </div>
              <div className="booking-info-item">
                <span className="material-symbols-outlined info-icon">info</span>
                <span>Minimum booking duration is 1 hour</span>
              </div>
              <div className="booking-info-item">
                <span className="material-symbols-outlined info-icon">warning</span>
                <span>Maximum capacity rules strictly enforced</span>
              </div>
            </div>

            <Link href={`/book?room=${room.slug}`} className="btn-booking-card-cta">
              Book Room Now
            </Link>
            
            <p className="booking-card-disclaimer">
              No cancellations or refunds once booking payment is processed via Razorpay.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

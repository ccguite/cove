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
    description: 'An intimate cocoon designed for deep conversations or focused duo work. Features noise-dampening acoustic panels, ambient warm lighting, and a curated selection of slow-brewed teas included.',
    created_at: '',
  },
  {
    id: '2',
    name: 'Haven',
    slug: 'haven',
    min_pax: 3,
    max_pax: 8,
    price_per_hour: 1499,
    description: 'A spacious sanctuary perfect for creative workshops, small celebrations, or team alignments. Features a large raw-edge oak table, comfortable lounge seating, and a smart presentation screen.',
    created_at: '',
  },
];

const ROOM_AMENITIES: Record<string, string[]> = {
  husk: ['High-speed Wi-Fi', 'Power Outlets', 'Climate Control'],
  haven: ['Smart Screen', 'Whiteboard', 'Private Service Call'],
};

const IMAGE_ASSETS: Record<string, string> = {
  husk: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdJW0jE70YaSMOywv8UdVC4mTg6bP5Ro7ri0MpV8TWtF3mrbe9xTc6QoQA5YZnLeU3nx6U8SLZOC5VyofltWjuJ2Wlu3bzLY4Xo1fChfmLg31BZVWi7lnAYDd2XKp5Raq3qklNOmFsn8suMxidcaSJFIb9WDEv44t8Wfc0qhNk_LRN98XPUJrpwrRDLWSSnnIiSrRAKsK0H4EJswl_dywK_-ICXw_QzGXpGhI6MxqRYyttI9fkLvgY8J3JRIzTYJ3JY95OyeZtboX',
  haven: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf4ecYOtvDx-yw1DP6nGsI7Wlel9zFo0FTdv3L4GQY8-pJnG6o5X5H4LH0vIqvDyAAxwx4gZiVWvIiF0i7Bl2IEULGIMCGn9yzNYCab1HJzu1R5NH0dwZpxAqFo3s7PIljqdEo_xqkQd6oTN3Hu613ySqliujbIh7s7D5H87GST0YnA8OTrM4uHOe6oAfQm_TMu8XnBdV06Ellk9PrxTzzMcaVzWevGfVj9H6pn1hV1vIzn9u-gRvre4ooE-uxJRR30EzzIDTlMBXx'
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

      <div className="rooms-list">
        {rooms.map((room) => (
          <article key={room.id} className="room-card">
            <div className="room-card-img-container">
              <Image
                src={IMAGE_ASSETS[room.slug] || IMAGE_ASSETS.husk}
                alt={`${room.name} Room`}
                fill
                className="room-card-image"
              />
              <div className="room-card-badge">
                {room.slug === 'husk' ? 'Couple Room' : 'Group Room'}
              </div>
            </div>
            <div className="room-card-body">
              <div className="room-card-header">
                <div>
                  <h2 className="room-card-title">{room.name}</h2>
                  <div className="room-card-meta">
                    <span className="meta-item">
                      <span className="material-symbols-outlined">person</span>
                      {room.slug === 'husk' ? 'Up to 2 guests' : `${room.min_pax} - ${room.max_pax} guests`}
                    </span>
                    <span className="meta-item">
                      <span className="material-symbols-outlined">payments</span>
                      ₹{room.price_per_hour}/hr
                    </span>
                  </div>
                </div>
                <Link href={`/rooms/${room.slug}`} className="btn-select-room">Select Room</Link>
              </div>
              <p className="room-card-description">{room.description}</p>
              <div className="room-card-tags">
                {(ROOM_AMENITIES[room.slug] || []).map((tag) => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

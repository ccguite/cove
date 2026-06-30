import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Room } from '@/lib/supabase/types';
import './page.css';

// Pre-seeded fallback room details in case database call errors out
const FALLBACK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Husk',
    slug: 'husk',
    min_pax: 1,
    max_pax: 2,
    price_per_hour: 599,
    description: 'The Couple Room — an intimate space designed for two.',
    created_at: '',
  },
  {
    id: '2',
    name: 'Haven',
    slug: 'haven',
    min_pax: 3,
    max_pax: 8,
    price_per_hour: 1499,
    description: 'The Group Room — a social space for 3 to 8 guests.',
    created_at: '',
  },
];

// Seeded static featured menu items teaser
const FEATURED_MENU_TEASERS = [
  { 
    id: 'm1', 
    name: 'Premium Croffle', 
    category: 'Croffles', 
    price: 220, 
    description: 'Freshly baked buttery croissant-waffle topped with vanilla bean ice cream and organic maple glaze.',
    image: '/images/croffles/classic-butter.png'
  },
  { 
    id: 'm2', 
    name: 'Specialty Einspänner', 
    category: 'Signature Drinks', 
    price: 180, 
    description: 'Espresso topped with a thick, rich layer of sweet cold cream, served in the traditional Seoul style.',
    image: '/images/menu/einspanner.png'
  },
  { 
    id: 'm3', 
    name: 'Mizo Specialty Latte', 
    category: 'Hot Coffees', 
    price: 160, 
    description: 'Double shot espresso combined with textured milk and a hint of local honey.',
    image: '/images/menu/mizo-latte.png'
  },
];

// Pre-selected high-res photography URLs
const IMAGE_ASSETS = {
  hero: '/images/home/hero.png',
  about: '/images/home/about.png',
  catCafe: '/images/experiences/cat.png',
  billiards: '/images/experiences/pool.png',
  studio: '/images/experiences/booth.png'
};

export default async function Page() {
  let rooms: Room[] = FALLBACK_ROOMS;

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('rooms').select('*');
    if (data && data.length > 0) {
      rooms = data as Room[];
    }
  } catch {}

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <Image
            src={IMAGE_ASSETS.hero}
            alt="COVE ambient café interior"
            fill
            priority
            className="hero-bg-img"
          />
          <div className="hero-vignette" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Your Private Escape in Aizawl</h1>
          <p className="hero-description">
            A sanctuary blending Seoul's minimalist café culture with authentic local warmth. 
            Experience curated spaces, artisanal coffee, and unparalleled tranquility.
          </p>
          <div className="hero-btn-group">
            <Link href="/book" className="btn btn-primary-cta">Book a Room</Link>
            <Link href="/order" className="btn btn-secondary-cta">Order Food</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-text-content">
            <span className="section-label">Our Philosophy</span>
            <h2 className="section-title">The Seoul of Aizawl</h2>
            <p className="about-body">
              Step into a space designed to slow down time. Inspired by the refined aesthetics 
              of Korean café culture, COVE is an architectural embrace—a place where tactile 
              minimalism meets the comforting hospitality of Aizawl. Every corner, from our 
              sunlit lounges to our private retreats, is crafted for moments of connection 
              and serene solitude.
            </p>
            <Link href="/about" className="text-link">
              Discover our story
              <span className="material-symbols-outlined icon-arrow">arrow_forward</span>
            </Link>
          </div>
          <div className="about-img-container">
            <div className="aspect-ratio-box-4-5">
              <Image
                src={IMAGE_ASSETS.about}
                alt="Café table setting"
                fill
                className="about-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Preview Section */}
      <section className="rooms-preview-section">
        <div className="rooms-preview-container">
          <div className="section-header-centered">
            <span className="section-label">Private Spaces</span>
            <h2 className="section-title">Our Experience Rooms</h2>
            <p className="section-subtitle">
              Book a room for work sessions, gaming, private movie screenings, or gathering with friends.
            </p>
          </div>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-preview-card">
                <div className="room-card-img-container">
                  <Image
                    src={room.image_url || (room.slug === 'husk' ? IMAGE_ASSETS.about : IMAGE_ASSETS.hero)}
                    alt={room.name}
                    fill
                    className="room-card-img"
                  />
                </div>
                <div className="room-card-content">
                  <div className="room-card-header">
                    <h3 className="room-card-name">{room.name}</h3>
                    <span className="room-card-price">₹{room.price_per_hour}/hr</span>
                  </div>
                  <p className="room-card-desc">{room.description}</p>
                  <div className="room-card-footer">
                    <span className="room-card-capacity">
                      <span className="material-symbols-outlined">groups</span>
                      {room.min_pax === room.max_pax ? `${room.min_pax} guests` : `${room.min_pax} - ${room.max_pax} guests`}
                    </span>
                    <Link href={`/book?room=${room.slug}`} className="btn-card-cta">
                      Book Now
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Teaser Section */}
      <section className="menu-teaser-section">
        <div className="menu-teaser-container">
          <div className="section-header-centered">
            <span className="section-label">On the Menu</span>
            <h2 className="section-title">Seoul Delicacies</h2>
            <p className="section-subtitle">
              Sip and bite into curated coffees and fresh croffles styled after Seoul's finest cafés.
            </p>
          </div>
          <div className="menu-teaser-grid">
            {FEATURED_MENU_TEASERS.map((item) => (
              <div key={item.id} className="menu-teaser-card">
                <div className="menu-teaser-img-container">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="menu-teaser-img"
                  />
                </div>
                <div className="menu-teaser-content">
                  <div className="menu-item-meta">
                    <span className="menu-item-cat">{item.category}</span>
                    <span className="menu-item-price">₹{item.price}</span>
                  </div>
                  <h3 className="menu-item-title">{item.name}</h3>
                  <p className="menu-item-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="menu-teaser-footer">
            <Link href="/menu" className="btn btn-menu-link">View Full Menu</Link>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="features-preview-section">
        <div className="features-preview-container">
          <div className="section-header-centered">
            <span className="section-label">Experiences</span>
            <h2 className="section-title">Experience COVE</h2>
            <p className="section-subtitle">
              Beyond exceptional coffee, discover curated spaces designed for leisure, play, and memories.
            </p>
          </div>
          <div className="features-grid">
            {/* Cat Cafe */}
            <div className="feature-card">
              <div className="feature-img-container">
                <Image
                  src={IMAGE_ASSETS.catCafe}
                  alt="Cat Cafe"
                  fill
                  className="feature-img"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Cat Café</h3>
                <p className="feature-description">
                  Unwind in the company of our gentle resident felines in a dedicated, peaceful sanctuary.
                </p>
              </div>
            </div>
            {/* Billiards Lounge */}
            <div className="feature-card">
              <div className="feature-img-container">
                <Image
                  src={IMAGE_ASSETS.billiards}
                  alt="Billiards Lounge"
                  fill
                  className="feature-img"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Billiards Lounge</h3>
                <p className="feature-description">
                  Enjoy a relaxed game in our stylishly appointed lounge, perfect for evening gatherings.
                </p>
              </div>
            </div>
            {/* Studio Booth */}
            <div className="feature-card">
              <div className="feature-img-container">
                <Image
                  src={IMAGE_ASSETS.studio}
                  alt="Studio Booth"
                  fill
                  className="feature-img"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Studio Booth</h3>
                <p className="feature-description">
                  Capture the moment with our premium, Korean-style self-serve photography studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

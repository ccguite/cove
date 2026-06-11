# Spec: Unit 5 — Public Rooms Page

## Goal

Create the public rooms catalog page at `app/(public)/rooms/page.tsx` and dynamic detail pages at `app/(public)/rooms/[slug]/page.tsx` for the Husk and Haven experience rooms, loading data server-side from the `rooms` table in Supabase, and styling with Vanilla CSS derived from design tokens.

---

## Design

### Rooms Catalog Page (`/rooms`)
- **Header**: Editorial heading "Our Private Rooms" and descriptive tagline.
- **Rooms Grid**: Stacked card layout matching the aesthetic of `private_rooms_cove`. Each room card displays:
  - High-resolution room ambient photo on the left/top (with hover zoom effect).
  - Room type badge (e.g., "Couple Room" or "Group Room").
  - Title (Husk / Haven) in Playfair Display.
  - Price per hour and guest capacity.
  - Summary description.
  - Amenities badges (e.g. Wi-Fi, Power Outlets, Smart Screen, Whiteboard).
  - CTA button: "Select Room" (filled button) or "View Details" linking to `/rooms/[slug]`.
- **Layout**: Adapts from single-column on mobile viewports to two-column on desktop.

### Room Details Page (`/rooms/[slug]`)
- **Breadcrumbs**: Inline breadcrumbs navigation ("Home / Rooms / Husk").
- **Hero & Gallery**: A large full-width image showcase of the selected room, with a row of thumbnail details showing other angles.
- **Specifications Section**: Two-column layout on desktop:
  - **Main Info (Left)**: Detailed room description, detailed pricing rules, operating hours checklist (10:00 AM - 11:00 PM), and highlighted amenities section with icons.
  - **Booking Card (Right, Sticky)**: Fixed-width panel containing a summary of the room price, capacity warning, and a large "Book Room" CTA button (pointing to the booking flow at `/book?room=[slug]`).
- **Slugs Supported**: `/rooms/husk` and `/rooms/haven` generated statically via Next.js `generateStaticParams()` to allow high-speed edge rendering.

### Styling & Tokens
- Page canvas background remains cream (`--color-background`).
- Cards styled with surface (`--color-surface`) and border (`--color-border-subtle`).
- Headers use heading typography scale (`--text-size-headline-md` and `--text-size-headline-lg`).
- Transitions for all hover states (card lift, image scale, button background shifts).

---

## Implementation

### 4.1 Folder Structure
Create files in the following directory layout:

```
cove/
└── app/
    └── (public)/
        └── rooms/
            ├── page.tsx          # Rooms catalog page
            ├── page.css          # Catalog page stylesheet
            └── [slug]/
                ├── page.tsx      # Room details page
                └── page.css      # Detail page stylesheet
```

### 4.2 Room Types
We use the `Room` interface defined in `lib/supabase/types.ts`:
```typescript
export type Room = {
  id: string;
  name: string;
  slug: string;
  min_pax: number;
  max_pax: number;
  price_per_hour: number;
  description: string | null;
  created_at: string;
};
```

---

### 4.3 Rooms Catalog — `app/(public)/rooms/page.tsx`
Create `app/(public)/rooms/page.tsx` to query rooms from Supabase and display the listing:

```tsx
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
```

---

### 4.4 Rooms Catalog Styles — `app/(public)/rooms/page.css`
Create `app/(public)/rooms/page.css` strictly using tokens:

```css
.rooms-catalog-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-8) var(--space-5) var(--space-16);
}

@media (min-width: 768px) {
  .rooms-catalog-page {
    padding: var(--space-12) var(--space-16) var(--space-24);
  }
}

.catalog-header {
  margin-bottom: var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.catalog-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  line-height: var(--text-lh-headline-lg-mobile);
  color: var(--color-text-heading);
  font-weight: 600;
}

@media (min-width: 768px) {
  .catalog-title {
    font-size: var(--text-size-headline-lg);
    line-height: var(--text-lh-headline-lg);
  }
}

.catalog-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  line-height: var(--text-lh-body-lg);
  color: var(--color-text-secondary);
  max-width: 44rem;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.room-card {
  background-color: var(--color-surface-low);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: thin solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.room-card:hover {
  transform: translateY(-4px);
}

.room-card-img-container {
  position: relative;
  width: 100%;
  height: 16rem;
  overflow: hidden;
}

@media (min-width: 768px) {
  .room-card-img-container {
    height: 24rem;
  }
}

.room-card-image {
  object-fit: cover;
  transition: transform 0.5s ease;
}

.room-card:hover .room-card-image {
  transform: scale(1.03);
}

.room-card-badge {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background-color: rgba(254, 249, 241, 0.95);
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 600;
  color: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.room-card-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .room-card-body {
    padding: var(--space-8);
  }
}

.room-card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  border-bottom: thin solid var(--color-border-subtle);
  padding-bottom: var(--space-6);
}

@media (min-width: 640px) {
  .room-card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.room-card-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-md);
  color: var(--color-text-heading);
  font-weight: 600;
  margin-bottom: var(--space-1);
}

.room-card-meta {
  display: flex;
  gap: var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  color: var(--color-text-secondary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-item .material-symbols-outlined {
  font-size: var(--text-size-body-lg);
}

.btn-select-room {
  background-color: var(--color-surface);
  color: var(--color-primary);
  border: thin solid var(--color-border);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  text-align: center;
}

.btn-select-room:hover {
  background-color: var(--color-surface-high);
}

.btn-select-room:active {
  transform: scale(0.97);
}

.room-card-description {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
}

.room-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-badge {
  background-color: var(--color-surface-high);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 500;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}
```

---

### 4.5 Room Details Page — `app/(public)/rooms/[slug]/page.tsx`
Create `app/(public)/rooms/[slug]/page.tsx` dynamically serving detail views:

```tsx
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
  params: { slug: string };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = params;

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
```

---

### 4.6 Room Details Styles — `app/(public)/rooms/[slug]/page.css`
Create `app/(public)/rooms/[slug]/page.css` strictly using tokens:

```css
.room-detail-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-16);
}

@media (min-width: 768px) {
  .room-detail-page {
    padding: var(--space-6) var(--space-16) var(--space-24);
  }
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.crumb-link {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.crumb-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.crumb-separator {
  color: var(--color-border);
}

.crumb-current {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Page Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
}

@media (min-width: 1024px) {
  .detail-layout {
    grid-template-columns: 1.2fr 0.8fr;
  }
}

.detail-main-content {
  display: flex;
  flex-direction: column;
}

.room-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  line-height: var(--text-lh-headline-lg-mobile);
  color: var(--color-text-heading);
  font-weight: 600;
}

@media (min-width: 768px) {
  .room-title {
    font-size: var(--text-size-headline-lg);
    line-height: var(--text-lh-headline-lg);
  }
}

.room-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
  margin-bottom: var(--space-6);
}

/* Photo Gallery */
.gallery-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.main-image-box {
  position: relative;
  width: 100%;
  height: 18rem;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: thin solid var(--color-border-subtle);
}

@media (min-width: 768px) {
  .main-image-box {
    height: 28rem;
  }
}

.gallery-main-image {
  object-fit: cover;
}

.gallery-thumbnails {
  display: flex;
  gap: var(--space-4);
}

.thumbnail-box {
  position: relative;
  flex: 1;
  height: 4.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: thin solid var(--color-border-subtle);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

@media (min-width: 768px) {
  .thumbnail-box {
    height: 6rem;
  }
}

.thumbnail-box:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.gallery-thumbnail-image {
  object-fit: cover;
}

/* Section Blocks */
.section-block {
  border-bottom: thin solid var(--color-border-subtle);
  padding: var(--space-8) 0;
}

.section-block:last-of-type {
  border-bottom: none;
}

.section-header {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.description-text {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
}

/* Specs list */
.specs-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .specs-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.spec-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background-color: var(--color-surface-low);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: thin solid var(--color-border-subtle);
}

.spec-icon {
  font-size: var(--text-size-headline-sm);
  color: var(--color-primary);
}

.spec-info {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  color: var(--color-text-secondary);
}

.spec-value {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: var(--space-1);
}

/* Amenities list */
.amenities-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.amenity-detail-card {
  display: flex;
  gap: var(--space-4);
  background-color: var(--color-surface);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: thin solid var(--color-border-subtle);
}

.amenity-detail-icon {
  font-size: var(--text-size-headline-sm);
  color: var(--color-accent);
}

.amenity-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.amenity-detail-title {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.amenity-detail-desc {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  line-height: var(--text-lh-body-sm);
  color: var(--color-text-secondary);
}

/* Right Column: Sticky Booking Card */
.detail-sidebar {
  position: relative;
  width: 100%;
}

.sticky-booking-card {
  background-color: var(--color-surface-low);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  border: thin solid var(--color-border);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .sticky-booking-card {
    position: sticky;
    top: 6.5rem; /* desktop nav height + buffer */
  }
}

.booking-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: thin solid var(--color-border-subtle);
  padding-bottom: var(--space-4);
}

.booking-rate-label {
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.booking-rate-value {
  font-family: var(--font-body);
  font-size: var(--text-size-display-number);
  line-height: var(--text-lh-display-number);
  font-weight: 700;
  color: var(--color-accent);
}

.booking-card-info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.booking-info-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.info-icon {
  font-size: var(--text-size-body-md);
}

.info-icon.info-icon {
  color: var(--color-primary);
}

.btn-booking-card-cta {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-booking-card-cta:hover {
  background-color: var(--color-primary-deep);
}

.btn-booking-card-cta:active {
  transform: scale(0.97);
}

.booking-card-disclaimer {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: var(--text-lh-label-sm);
}
```

---

## Dependencies

No additional external npm package installations are required.

---

## Verification Checklist

### Rooms Catalog Page (`/rooms`)
- [ ] Catalog page resolves at `/rooms`.
- [ ] Rendered layout is responsive (adapting cards from stacked single-column on mobile to side-by-side or clean grids on desktop).
- [ ] Room cards render correct dynamic values for capacity and price per hour fetched from Supabase `rooms` table.
- [ ] Tag badges display custom room features (Husk vs Haven fusions).
- [ ] Hover zoom on image gallery works smoothly without breaking container edges.

### Room Details Page (`/rooms/[slug]`)
- [ ] Details page resolves at `/rooms/husk` and `/rooms/haven`.
- [ ] Breadcrumbs link back correctly to Home `/` and Rooms `/rooms`.
- [ ] Main image and thumbnails render with correct URLs.
- [ ] Section blocks (Description, Specifications list, Amenities list) organize specifications clearly.
- [ ] Sticky sidebar card is visible and has a "Book Room Now" button linking to `/book?room=[slug]`.
- [ ] Sidebar follows scrolling behavior and floats cleanly beside the main details on desktop viewports.

### General & SEO
- [ ] Dynamic pages are successfully compiled in SSG mode via `generateStaticParams()`.
- [ ] Correct page titles are assigned: `COVE - Private Rooms` and room-specific titles.
- [ ] `npx tsc --noEmit` runs successfully with zero errors.

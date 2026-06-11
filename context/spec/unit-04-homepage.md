# Spec: Unit 4 — Homepage

## Goal

Create the public homepage at `app/(public)/page.tsx` and a shared public layout at `app/(public)/layout.tsx` containing the global navigation and footer, styled using Vanilla CSS from design tokens, extracting layout patterns, responsive rules, and brand copy from the UI design HTML template.

---

## Design

### Layout & Navigation Structure
- **Desktop Navigation**: Sticky top navigation bar (`TopNavBar`), visible on viewports `768px` and wider (`md:flex`), hidden on mobile. Includes the "COVE" branding, uppercase text links (Home, Rooms, Menu), and a "Book Now" CTA button.
- **Mobile Navigation**:
  - **Top Header**: Simple sticky header displaying "COVE" (`md:hidden`).
  - **Bottom Navigation**: Sticky glassmorphic bottom bar (`BottomNavBar`) fixed at the bottom of the screen (`md:hidden`). Includes icons and labels for: Home, Rooms, Menu, and Book.
- **Shared Footer**: Placed at the bottom of all public pages, displaying "COVE", social media links (Instagram, Facebook), page utility links (Privacy Policy, Contact), and copyright metadata.
- **System Boundary**: The navigation and footer are extracted into the shared directory layout `app/(public)/layout.tsx`. All public routes (`/`, `/rooms`, `/menu`, `/features`) nest inside this layout.

### Homepage Sections
1. **Hero**: Full screen height (`100vh`), containing a dark-tinted image background (espresso overlay), centered typography title (`Your Private Escape in Aizawl`), body description, and buttons: "Book a Room" (espresso filled) and "Order Food" (outlined).
2. **About COVE ("The Seoul of Aizawl")**: Two-column layout on desktop, single-column on mobile. Renders an editorial description, "Discover our story" text link with an arrow icon, and a `4/5` aspect ratio image on the right.
3. **Rooms Preview**: Row/grid showing cards for the two rooms (Husk and Haven). Reads metadata (capacity, name, price) dynamically from the database. Each card features a "Book Now" link.
4. **Features Preview ("Experience COVE")**: Three-column card grid on desktop, single column on mobile. Renders cards for the walk-in experiences: Cat Café, Billiards Lounge, and Studio Booth. Includes hover animations (slight lift and image scale).
5. **Menu Teaser**: Grid showcasing 3–4 featured menu items (drawn from `menu_items` in the database, with static placeholders if the database is unpopulated) and a "View Full Menu" CTA.

### Assets & Icons
- Pre-selected high-resolution lifestyle images from the design HTML are used to maintain visual fidelity.
- **Icons**: Loaded via [Material Symbols Outlined](https://fonts.google.com/icons) to support bottom nav icons and inline indicators.

---

## Implementation

### 3.1 Load Material Symbols in Root Layout
Update the root layout file `app/layout.tsx` to inject the Google Material Symbols stylesheet in the `<head>` of the page:

```tsx
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../styles/global.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COVE — Korean-Inspired Café & Lounge, Aizawl',
  description:
    'COVE is a premium Korean-inspired café and entertainment lounge in Aizawl, Mizoram. Book private rooms, order food, and explore specialty coffee, a cat café, pool table, and photobooth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3.2 Create Shared Public Layout — `app/(public)/layout.tsx`
Create `app/(public)/layout.tsx` to contain the header, nav, and footer:

```tsx
import Link from 'next/link';
import './layout.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell">
      {/* Desktop Navigation */}
      <nav className="desktop-nav" aria-label="Top Navigation">
        <div className="nav-container">
          <Link href="/" className="logo-brand">COVE</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href="/rooms" className="nav-link">Rooms</Link>
            <Link href="/menu" className="nav-link">Menu</Link>
            <Link href="/features" className="nav-link">Features</Link>
          </div>
          <Link href="/book" className="btn-nav-book">Book Now</Link>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <span className="logo-mobile">COVE</span>
      </header>

      {/* Main Page Canvas */}
      <main className="public-main">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Bottom Navigation">
        <Link href="/" className="bottom-nav-item active">
          <span className="material-symbols-outlined icon-fill">home</span>
          <span className="bottom-nav-label">Home</span>
        </Link>
        <Link href="/rooms" className="bottom-nav-item">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="bottom-nav-label">Rooms</span>
        </Link>
        <Link href="/menu" className="bottom-nav-item">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="bottom-nav-label">Menu</span>
        </Link>
        <Link href="/book" className="bottom-nav-item">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="bottom-nav-label">Book</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand-section">
            <span className="footer-logo">COVE</span>
            <p className="footer-address">Café & Lounge. Aizawl, Mizoram.</p>
          </div>
          <div className="footer-links-section">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} COVE Cafe & Lounge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### 3.3 Create Shared Public Layout Styles — `app/(public)/layout.css`
Create `app/(public)/layout.css` using variables from `tokens.css`:

```css
.public-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4.5rem;
  background-color: rgba(254, 249, 241, 0.85); /* background with opacity */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: thin solid var(--color-border-subtle);
  z-index: 100;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
    align-items: center;
  }
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-16);
}

.logo-brand {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-md);
  font-weight: 700;
  color: var(--color-text-heading);
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  text-transform: uppercase;
  letter-spacing: var(--text-ls-label-md);
  font-weight: 600;
}

.nav-link {
  color: var(--color-text-secondary);
  padding: var(--space-1) 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-text-primary);
}

.nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.btn-nav-book {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-nav-book:hover {
  background-color: var(--color-primary-deep);
}

.btn-nav-book:active {
  transform: scale(0.95);
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3.5rem;
  background-color: rgba(254, 249, 241, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: thin solid var(--color-border-subtle);
  padding: 0 var(--space-5);
  z-index: 90;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

.logo-mobile {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  font-weight: 700;
  color: var(--color-text-heading);
}

/* Main Area offset offsets for fixed bars */
.public-main {
  flex-grow: 1;
  padding-top: 3.5rem; /* mobile header height */
  margin-bottom: 4rem; /* mobile bottom nav height */
}

@media (min-width: 768px) {
  .public-main {
    padding-top: 4.5rem; /* desktop header height */
    margin-bottom: 0;
  }
}

/* Mobile Bottom Navigation */
.mobile-bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  background-color: rgba(248, 243, 235, 0.9); /* Surface low */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: thin solid var(--color-border-subtle);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  width: 25%;
  height: 100%;
  transition: transform 0.15s ease;
}

.bottom-nav-item:active {
  transform: scale(0.9);
}

.bottom-nav-item .material-symbols-outlined {
  font-size: var(--text-size-price);
}

.icon-fill {
  font-variation-settings: 'FILL' 1;
}

.bottom-nav-label {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 500;
  margin-top: var(--space-1);
}

.bottom-nav-item.active {
  color: var(--color-primary);
}

/* Footer Section */
.footer {
  background-color: var(--color-surface-white);
  border-top: thin solid var(--color-border-subtle);
  padding: var(--space-12) 0;
}

.footer-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr 2fr;
    padding: 0 var(--space-16);
  }
}

.footer-brand-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-logo {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-md);
  font-weight: 600;
  color: var(--color-text-heading);
}

.footer-address {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.footer-links-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
  align-items: center;
}

@media (min-width: 768px) {
  .footer-links-section {
    justify-content: flex-end;
  }
}

.footer-link {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.footer-copyright {
  grid-column: 1 / -1;
  border-top: thin solid var(--color-border-subtle);
  padding-top: var(--space-6);
  margin-top: var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

@media (min-width: 768px) {
  .footer-copyright {
    text-align: left;
  }
}
```

### 3.4 Create Homepage Component — `app/(public)/page.tsx`
Create `app/(public)/page.tsx` that fetches from Supabase and populates Room previews and Menu previews:

```tsx
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
  { id: 'm1', name: 'Premium Croffle', category: 'Croffles', price: 220, description: 'Freshly baked buttery croissant-waffle topped with vanilla bean ice cream and organic maple glaze.' },
  { id: 'm2', name: 'Specialty Einspänner', category: 'Signature Drinks', price: 180, description: 'Espresso topped with a thick, rich layer of sweet cold cream, served in the traditional Seoul style.' },
  { id: 'm3', name: 'Mizo Specialty Latte', category: 'Hot Coffees', price: 160, description: 'Double shot espresso combined with textured milk and a hint of local mountain honey.' },
];

// Pre-selected high-res photography URLs
const IMAGE_ASSETS = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy4stc3v1ZsXHPI11viJ9OaOcga4yoNinUm81wBV69w7opV7ZGdnpHkvvP9FLaHgouX-md1MywR_xi2-eTaM4CYptsgJNMfxlWxvZSNl4Mou5keIHfN2Fwp4e4JyLlsLcUjQu64m2DGPNoWUaKOfvJyJlew2D-QJjNyTUlz8404jiGLkw6lB0YuNhOBQRyt-yk-2ZfNJ73etBshM8nv-r1kRBMB7kmyHkbXCKivn_DQafMx2KrFMbqkkWIIIBxUNCD4gN9MgdnyNH-',
  about: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE',
  catCafe: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4zrpROIgKvD3zfXD7FO4Jjoasv0Dd-3ZfGyo9p04oZmbOAhL-UAS7KM6QKPCrwkGgiD29ytcUohXyMuY5BPmR1yctX1VGs_WWaspFc4FGeweM2Cs37IvAJvV-AxnmT9973Tf8svyQkb-f8NS8XUJ3NFIdDKNNeKp1uvm9IQ18C-ZiGsk6Hf-d_kVvT953wOrm87--LnyMzw9FhYneYlh_I_B88oZfkMNwDlEssMsZOvjthw4Gd39ZtZz4x82TN9xkzqAuhxjpQ8Q3',
  billiards: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs1M43Z4yCbvTZu8hzNVtRgB4Ntmr-aUYGpyAYsCw6-5VblmaH1E0TNykciEIMYPixQNqAnhWYbOZZIf9pSgDAoNxxEqxFO8zeRUQrPoUU22X0HhYz3jFQiSAJtER78kVmTXEGma1ENckfZZr-kujYSEu_T8nSv3JunXiQgjpEYFHXfMIaaVKep8mw73RghbV57XTnK5XNpoAKeeOFsNiuEwWy3pyMk1CnV_DWEmqD4eMr97IAF6GMIANesm1qEpa4atDwTPMkLVv_',
  studio: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPkXduHrgdofMcig4xo0Zz0z4EB5XfSgLShOLjT6-H4SY5tWnEq4C3Ak_G51vRq4EQiNKuD1XNA5_krzcADh8NT1dccsaIAtfeLfA22HiHHd8TVJefE9Y9O6EmHzHUTd2rVL6DioRkvKANP11RzyasXvGGHqWVSE70vtLM0iyiF5udHQ-et6du95xQ58C0PNFQfzdN-6XLlxqS6s_2fTQUqCHRrfsHQqIWTEz4olj7BmF0sscdgid8bf-EQaaW4vcaKAXqVwWFeKbq'
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
                    src={room.slug === 'husk' ? IMAGE_ASSETS.about : IMAGE_ASSETS.hero}
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
                <div className="menu-item-meta">
                  <span className="menu-item-cat">{item.category}</span>
                  <span className="menu-item-price">₹{item.price}</span>
                </div>
                <h3 className="menu-item-title">{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="menu-teaser-footer">
            <Link href="/menu" className="btn btn-menu-link">View Full Menu</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 3.5 Create Homepage Styles — `app/(public)/page.css`
Create `app/(public)/page.css` incorporating the typography and spacing scales:

```css
.home-page {
  display: flex;
  flex-direction: column;
}

/* Common Section Headers */
.section-label {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--text-ls-label-sm);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  line-height: var(--text-lh-headline-lg-mobile);
  color: var(--color-text-heading);
  margin-top: var(--space-2);
}

@media (min-width: 768px) {
  .section-title {
    font-size: var(--text-size-headline-lg);
    line-height: var(--text-lh-headline-lg);
  }
}

.section-header-centered {
  text-align: center;
  margin-bottom: var(--space-12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.section-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  color: var(--color-text-secondary);
  max-width: 36rem;
  margin-top: var(--space-2);
}

/* Button Resets & Overrides */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  letter-spacing: var(--text-ls-label-md);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
  text-align: center;
}

.btn:active {
  transform: scale(0.97);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: calc(100vh - 3.5rem); /* viewport minus mobile header */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hero-section {
    height: calc(100vh - 4.5rem); /* viewport minus desktop header */
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--color-primary);
  z-index: 0;
}

.hero-bg-img {
  object-fit: cover;
  opacity: 0.65;
  mix-blend-mode: overlay;
}

.hero-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(74, 52, 40, 0.4) 0%, rgba(74, 52, 40, 0.7) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 var(--space-5);
  max-width: 56rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .hero-content {
    padding: 0 var(--space-16);
  }
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  line-height: var(--text-lh-headline-lg-mobile);
  color: var(--color-text-on-dark);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  font-weight: 700;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: var(--text-size-display-xl);
    line-height: var(--text-lh-display-xl);
    letter-spacing: var(--text-ls-display-xl);
  }
}

.hero-description {
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  line-height: var(--text-lh-body-lg);
  color: rgba(245, 240, 232, 0.9);
  max-width: 42rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-btn-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
  width: 100%;
}

@media (min-width: 640px) {
  .hero-btn-group {
    flex-direction: row;
    width: auto;
  }
}

.btn-primary-cta {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-md);
}

.btn-primary-cta:hover {
  background-color: var(--color-primary-deep);
}

.btn-secondary-cta {
  background-color: transparent;
  color: var(--color-text-on-dark);
  border: thin solid var(--color-text-on-dark);
}

.btn-secondary-cta:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* About Section */
.about-section {
  padding: var(--space-24) 0;
  background-color: var(--color-background);
}

.about-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: center;
}

@media (min-width: 1024px) {
  .about-container {
    grid-template-columns: 1.1fr 0.9fr;
    padding: 0 var(--space-16);
  }
}

.about-text-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.about-body {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  color: var(--color-accent);
  margin-top: var(--space-4);
  width: fit-content;
  transition: opacity 0.2s ease;
}

.text-link:hover {
  opacity: 0.8;
}

.icon-arrow {
  font-size: var(--text-size-body-sm);
  transition: transform 0.2s ease;
}

.text-link:hover .icon-arrow {
  transform: translateX(4px);
}

.about-img-container {
  position: relative;
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: thin solid rgba(211, 195, 188, 0.5); /* border subtle */
}

.aspect-ratio-box-4-5 {
  position: relative;
  width: 100%;
  padding-top: 125%; /* 4:5 Aspect Ratio */
}

.about-img {
  object-fit: cover;
}

/* Rooms Preview Section */
.rooms-preview-section {
  padding: var(--space-24) 0;
  background-color: var(--color-surface-low);
  border-top: thin solid var(--color-border-subtle);
  border-bottom: thin solid var(--color-border-subtle);
}

.rooms-preview-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
}

@media (min-width: 768px) {
  .rooms-preview-container {
    padding: 0 var(--space-16);
  }
}

.rooms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  margin-top: var(--space-6);
}

@media (min-width: 768px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.room-preview-card {
  background-color: var(--color-surface-white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: thin solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
}

.room-card-img-container {
  position: relative;
  width: 100%;
  height: 15rem;
}

.room-card-img {
  object-fit: cover;
}

.room-card-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.room-card-name {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
}

.room-card-price {
  font-family: var(--font-body);
  font-size: var(--text-size-price);
  line-height: var(--text-lh-price);
  font-weight: 700;
  color: var(--color-accent);
}

.room-card-desc {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
  margin-top: var(--space-3);
  margin-bottom: var(--space-6);
  flex-grow: 1;
}

.room-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: thin solid var(--color-border-subtle);
  padding-top: var(--space-4);
}

.room-card-capacity {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.room-card-capacity .material-symbols-outlined {
  font-size: var(--text-size-body-lg);
}

.btn-card-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  color: var(--color-primary);
  transition: color 0.2s ease;
}

.btn-card-cta:hover {
  color: var(--color-primary-deep);
}

.btn-card-cta .material-symbols-outlined {
  font-size: var(--text-size-body-sm);
  transition: transform 0.2s ease;
}

.btn-card-cta:hover .material-symbols-outlined {
  transform: translateX(4px);
}

/* Features Preview Section */
.features-preview-section {
  padding: var(--space-24) 0;
  background-color: var(--color-background);
}

.features-preview-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
}

@media (min-width: 768px) {
  .features-preview-container {
    padding: 0 var(--space-16);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: thin solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-img-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.feature-img {
  object-fit: cover;
  transition: transform 0.5s ease;
}

.feature-card:hover .feature-img {
  transform: scale(1.05);
}

.feature-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex-grow: 1;
}

.feature-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
}

.feature-description {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
}

/* Menu Teaser Section */
.menu-teaser-section {
  padding: var(--space-24) 0;
  background-color: var(--color-surface-low);
  border-top: thin solid var(--color-border-subtle);
}

.menu-teaser-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
}

@media (min-width: 768px) {
  .menu-teaser-container {
    padding: 0 var(--space-16);
  }
}

.menu-teaser-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .menu-teaser-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.menu-teaser-card {
  background-color: var(--color-surface-white);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  border: thin solid var(--color-border-subtle);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.menu-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item-cat {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.menu-item-price {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  font-weight: 700;
  color: var(--color-accent);
}

.menu-item-title {
  font-family: var(--font-display);
  font-size: var(--text-size-body-lg);
  font-weight: 600;
  color: var(--color-text-heading);
}

.menu-item-description {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  line-height: var(--text-lh-body-sm);
  color: var(--color-text-secondary);
}

.menu-teaser-footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-12);
}

.btn-menu-link {
  background-color: var(--color-accent);
  color: var(--color-text-on-amber);
  box-shadow: var(--shadow-sm);
}

.btn-menu-link:hover {
  background-color: var(--color-accent-hover);
  box-shadow: var(--shadow-md);
}
```

---

## Dependencies

No extra packages are required. Standard routing and next/image are used.

---

## Verification Checklist

### Navigation & Layout Shell
- [ ] Top sticky navigation bar is visible on viewport widths `768px` and wider, and hidden on mobile viewports.
- [ ] Mobile navigation header ("COVE") and bottom navigation bar are visible on viewports narrower than `768px`, and hidden on desktop.
- [ ] Mobile bottom navigation renders correct Material Icons (home, grid_view, restaurant_menu, calendar_month) with correct labels.
- [ ] Navigation links and buttons scale slightly down on active click (`active:scale-95`).
- [ ] Footer renders correctly at the bottom of the page showing address, social links, and copyright text.

### Visual Aesthetic & Design Tokens
- [ ] Cream page background `#FEF9F1` is active.
- [ ] Playfair Display and Inter render correctly across all headings, cards, and body blocks.
- [ ] Hero section background image fills the viewport with an opacity-overlay mix.
- [ ] Transitions on hover states (buttons background color, text links sliding arrow, feature cards translating upward) work smoothly.
- [ ] Spacing scales (derived from `8px`) are applied.

### Dynamic Data
- [ ] Database query on the `rooms` table executes server-side without error.
- [ ] If database is populated, room card price rates ("₹599/hr" and "₹1499/hr") and description copy load dynamically from Supabase.
- [ ] If database is not populated or offline, fallback hardcoded lists are rendered gracefully.

### SEO & Standards
- [ ] Page title matches: `COVE — Korean-Inspired Café & Lounge, Aizawl`.
- [ ] Meta description is present.
- [ ] The page features exactly one `<h1>` tag (in the Hero section).
- [ ] Semantic structure matches HTML5 tags (`<nav>`, `<header>`, `<main>`, `<section>`, `<footer>`).
- [ ] `npx tsc --noEmit` runs clean with no TypeScript errors.

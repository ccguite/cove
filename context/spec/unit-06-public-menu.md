# Spec: Unit 6 — Public Menu Page

## Goal

Create the public menu page at `app/(public)/menu/page.tsx`, displaying all food and drink categories with individual items fetched server-side from the `menu_items` table, showing sold-out states and seasonal badges, and styling with Vanilla CSS based on design tokens.

---

## Design

### Menu Layout & Categories
- **Category Filter (Desktop Left Sidebar)**: Sticky vertical list of all 11 menu categories. Clicking a category filters the item grid to that category (implemented server-side via `?category=...` query parameters or client-side anchor scrolling).
- **Category Filter (Mobile Horizontal Scroll)**: Horizontal scrollable category bar positioned at the top of the content area, hiding the scrollbar for an elegant feel.
- **Product Grid**: Responsive grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`) displaying item cards:
  - **Standard Card**: Aspect ratio `4/5` image (with zoom-hover effect), category label, price badge, title, short description, and "Add to Order" action button.
  - **Seasonal Card**: Same as standard card, with a decorative badge saying "Seasonal".
  - **Sold Out Card**: Visually distinct greyed-out overlay with a blur filter (`backdrop-blur-[2px]`) and a prominent "Sold Out" badge. The "Add to Order" button is disabled and reads "Unavailable".
- **Cart Sidebar Preview**: Renders a placeholder "Current Order" sidebar on desktop viewports (`xl:flex`) displaying subtotal/total summaries. This is a visual teaser; active cart state and Razorpay checkout are deferred to Unit 10.

---

## Implementation

### 5.1 Seeding Sample Menu Items
To verify the catalog, the database must contain sample records. Execute the following SQL script inside the Supabase SQL editor:

```sql
-- Fetch category IDs to ensure correct mappings
-- (Run this inside the editor to link correctly)

insert into public.menu_items (category_id, name, description, price, is_available, is_seasonal, image_url)
values
  -- Cakes & Pastries
  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Matcha Mille Crepe', 'Delicate handmade crepes layered with premium Uji matcha infused cream.', 240, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuD6KhHz5oWy4_xAnytElGONetbG5OEGnuKtItCj_tl8NO8XDCN-JOnrsEwxrsJRLn5cSHyzEKlVYWd9It_FVzkc_x0f5ro6zLt7eVNr5kI2EUOJOw2m2MfxNFNV-vz5Zy6YvEgAd60Wuh2fB1lWZ1HS1-wDs2YkLwCAe9usu1s_p_zM3qPelxLd_kg9OPARelzim4uG0EiOuoC1F7auYM8-N1UGXy9ol8qPRKmxG5ktXjeNPcGh0oR_FdnD6vW6XNcnSU3oGz6jFzGG'),
  
  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Basque Burnt Cheesecake', 'Caramelized exterior with a meltingly soft, rich cream cheese center.', 260, false, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDdzvNjEBhINIagvJNVE5woQhxyPHM4tVO3yjZYIEDotmRnobqBT3UUtyijNydQ2Fk7iF15pEwHY1DJl0BWKwvVVkgtQI2tqB0nxOmCydBjjUANrobn5C_Q7TkYdWDPeMSbvKalwG3ECiCE1eAc8JqErSozMWn1wpMDIuFSEmBR8FWuuleLDISI72cCqkiwaCquLnBFZhPkMTd21YPbm2LjFrT7OVPmv2SrmtM5FGGieu189r2S0sSLhXh3I0s6-rWXqncR4Z08bCww'),

  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Valrhona Chocolate Tart', 'Warm dark chocolate ganache encased in a buttery tart shell.', 280, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3iTn0cNjk1CwEgESvkmJ40Oj4gbvyQ1FA2u63UZH_iNKnNhJ2nvapbw3ZGdkYT6rTJVvS07x-ELLbqd-MPGPyzeashMrDKR2B_XD6J8FwFM7T3EkRAkrgth8x1o4nIsiWpPZtw-feLA7Aau0yXOShdznUGmQCFPK2avLE5secYi-Uqtn1l3qR0CLfrsXNCjJX57OyhhDWcV3cN7TeJzM1tWtLKqU7rc9WwWvi3ERfwo0LEUR0llNBun1wrX-_zE0GB-AMpw3hznK'),

  -- Croffles
  ((select id from public.menu_categories where name = 'Croffles' limit 1),
   'Strawberry Cream Croffle', 'Buttery croffle topped with fresh local organic strawberries and vanilla whipped cream.', 210, true, true,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuD6KhHz5oWy4_xAnytElGONetbG5OEGnuKtItCj_tl8NO8XDCN-JOnrsEwxrsJRLn5cSHyzEKlVYWd9It_FVzkc_x0f5ro6zLt7eVNr5kI2EUOJOw2m2MfxNFNV-vz5Zy6YvEgAd60Wuh2fB1lWZ1HS1-wDs2YkLwCAe9usu1s_p_zM3qPelxLd_kg9OPARelzim4uG0EiOuoC1F7auYM8-N1UGXy9ol8qPRKmxG5ktXjeNPcGh0oR_FdnD6vW6XNcnSU3oGz6jFzGG'),

  ((select id from public.menu_categories where name = 'Croffles' limit 1),
   'Brown Cheese Croffle', 'Korean-style croffle dusted with caramelized Norwegian brown cheese shavings and maple syrup.', 230, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE'),

  -- Signature Drinks
  ((select id from public.menu_categories where name = 'Signature Drinks' limit 1),
   'Specialty Einspänner', 'Double shot espresso topped with a thick, rich layer of sweet cold cream, served in Seoul style.', 180, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAy4stc3v1ZsXHPI11viJ9OaOcga4yoNinUm81wBV69w7opV7ZGdnpHkvvP9FLaHgouX-md1MywR_xi2-eTaM4CYptsgJNMfxlWxvZSNl4Mou5keIHfN2Fwp4e4JyLlsLcUjQu64m2DGPNoWUaKOfvJyJlew2D-QJjNyTUlz8404jiGLkw6lB0YuNhOBQRyt-yk-2ZfNJ73etBshM8nv-r1kRBMB7kmyHkbXCKivn_DQafMx2KrFMbqkkWIIIBxUNCD4gN9MgdnyNH-'),

  ((select id from public.menu_categories where name = 'Signature Drinks' limit 1),
   'Jeju Matcha Latte', 'Ceremonial-grade green tea latte whisked with steamed organic milk and sweet cane syrup.', 190, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB4zrpROIgKvD3zfXD7FO4Jjoasv0Dd-3ZfGyo9p04oZmbOAhL-UAS7KM6QKPCrwkGgiD29ytcUohXyMuY5BPmR1yctX1VGs_WWaspFc4FGeweM2Cs37IvAJvV-AxnmT9973Tf8svyQkb-f8NS8XUJ3NFIdDKNNeKp1uvm9IQ18C-ZiGsk6Hf-d_kVvT953wOrm87--LnyMzw9FhYneYlh_I_B88oZfkMNwDlEssMsZOvjthw4Gd39ZtZz4x82TN9xkzqAuhxjpQ8Q3'),

  -- Hot Coffees
  ((select id from public.menu_categories where name = 'Hot Coffees' limit 1),
   'Café Latte', 'Double espresso shot with smooth velvety microfoam, featuring balanced local honey tones.', 160, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE')
on conflict do nothing;
```

---

### 5.2 Folder Structure
Files are created in the following directory layout:

```
cove/
└── app/
    └── (public)/
        └── menu/
            ├── page.tsx          # Public menu page
            └── page.css          # Menu page stylesheet
```

---

### 5.3 Menu Component — `app/(public)/menu/page.tsx`
Create `app/(public)/menu/page.tsx` that fetches categories and products, filtering by category search params:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';
import './page.css';

interface MenuPageProps {
  searchParams: { category?: string };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const activeCategoryName = searchParams.category || '';

  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];
  let errorMsg = '';

  try {
    const supabase = createSupabaseServerClient();
    
    // Fetch active categories
    const { data: catData, error: catErr } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (catErr) throw catErr;
    categories = catData as MenuCategory[];

    // Fetch menu items
    const { data: itemData, error: itemErr } = await supabase
      .from('menu_items')
      .select('*')
      .order('name', { ascending: true });

    if (itemErr) throw itemErr;
    items = itemData as MenuItem[];
  } catch (e: any) {
    errorMsg = e.message || 'Failed to query database';
  }

  // Filter items by category if selected
  const filteredItems = activeCategoryName
    ? items.filter((item) => {
        const cat = categories.find((c) => c.name === activeCategoryName);
        return cat ? item.category_id === cat.id : true;
      })
    : items;

  // Group items by category for rendering sections
  const itemsByCategory: Record<string, MenuItem[]> = {};
  categories.forEach((cat) => {
    const catItems = filteredItems.filter((i) => i.category_id === cat.id);
    if (catItems.length > 0) {
      itemsByCategory[cat.name] = catItems;
    }
  });

  return (
    <div className="menu-page-container">
      {/* Category Sidebar/Selector */}
      <aside className="menu-sidebar">
        <h1 className="sidebar-heading">Our Menu</h1>
        
        {/* Mobile horizontal scrolling category selector */}
        <div className="mobile-category-bar">
          <Link
            href="/menu"
            className={`mobile-cat-btn ${!activeCategoryName ? 'active' : ''}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${encodeURIComponent(cat.name)}`}
              className={`mobile-cat-btn ${activeCategoryName === cat.name ? 'active' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Desktop vertical sidebar category links */}
        <nav className="desktop-category-nav">
          <Link
            href="/menu"
            className={`desktop-cat-btn ${!activeCategoryName ? 'active' : ''}`}
          >
            All Items
            <span className="material-symbols-outlined nav-chevron">chevron_right</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${encodeURIComponent(cat.name)}`}
              className={`desktop-cat-btn ${activeCategoryName === cat.name ? 'active' : ''}`}
            >
              {cat.name}
              <span className="material-symbols-outlined nav-chevron">chevron_right</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main product display section */}
      <section className="product-display-section">
        {errorMsg ? (
          <p className="menu-error">Error: {errorMsg}</p>
        ) : Object.keys(itemsByCategory).length === 0 ? (
          <div className="menu-empty">
            <p>No items found. Ensure database migrations and seeds are executed.</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([catName, catItems]) => (
            <div key={catName} className="category-section">
              <h2 className="category-section-title">{catName}</h2>
              <div className="product-grid">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`product-card ${!item.is_available ? 'sold-out' : ''}`}
                  >
                    {/* Sold out overlay */}
                    {!item.is_available && (
                      <div className="sold-out-overlay">
                        <span className="sold-out-badge">Sold Out</span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="product-image-container">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="product-image"
                        />
                      ) : (
                        <div className="image-placeholder">No Photo</div>
                      )}
                      
                      {/* Seasonal badge */}
                      {item.is_seasonal && (
                        <span className="seasonal-badge">Seasonal</span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="product-card-body">
                      <div className="product-header">
                        <h3 className="product-title">{item.name}</h3>
                        <span className="product-price">₹{item.price}</span>
                      </div>
                      <p className="product-desc">{item.description}</p>
                      
                      {item.is_available ? (
                        <button type="button" className="btn-add-to-cart">
                          <span className="material-symbols-outlined">add_shopping_cart</span>
                          Add to Order
                        </button>
                      ) : (
                        <button type="button" className="btn-add-to-cart disabled" disabled>
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Decorative Mock Cart Sidebar (Desktop Only) */}
      <aside className="mock-cart-sidebar">
        <h2 className="cart-title">Current Order</h2>
        <div className="cart-empty-state">
          <span className="material-symbols-outlined cart-empty-icon">shopping_bag</span>
          <p className="cart-empty-text">Your order is empty</p>
          <span className="cart-helper-text">Add items to place a takeaway or delivery order.</span>
        </div>
        <div className="cart-summary-block">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹0</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>₹0</span>
          </div>
          <button className="btn-checkout disabled" disabled>
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}
```

---

### 5.4 Menu Styles — `app/(public)/menu/page.css`
Create `app/(public)/menu/page.css` using tokens:

```css
.menu-page-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-6) var(--space-5) var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

@media (min-width: 1024px) {
  .menu-page-container {
    flex-direction: row;
    padding: var(--space-12) var(--space-16) var(--space-24);
  }
}

/* Sidebar styling */
.menu-sidebar {
  width: 100%;
}

@media (min-width: 1024px) {
  .menu-sidebar {
    width: 16rem;
    position: sticky;
    top: 6.5rem;
    height: fit-content;
  }
}

.sidebar-heading {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  color: var(--color-text-heading);
  margin-bottom: var(--space-6);
  display: none;
}

@media (min-width: 1024px) {
  .sidebar-heading {
    display: block;
  }
}

/* Mobile category selector horizontal bar */
.mobile-category-bar {
  display: flex;
  overflow-x: auto;
  gap: var(--space-2);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-6);
  scrollbar-width: none; /* Hide scrollbar Firefox */
  -ms-overflow-style: none; /* Hide scrollbar IE */
  border-bottom: thin solid var(--color-border-subtle);
}

.mobile-category-bar::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

@media (min-width: 1024px) {
  .mobile-category-bar {
    display: none;
  }
}

.mobile-cat-btn {
  white-space: nowrap;
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 500;
  border-radius: var(--radius-lg);
  border: thin solid var(--color-border-subtle);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.mobile-cat-btn.active {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  border-color: var(--color-primary);
}

/* Desktop category selector navigation list */
.desktop-category-nav {
  display: none;
  flex-direction: column;
  gap: var(--space-1);
}

@media (min-width: 1024px) {
  .desktop-category-nav {
    display: flex;
  }
}

.desktop-cat-btn {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  color: var(--color-text-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.desktop-cat-btn:hover {
  background-color: var(--color-surface-low);
  color: var(--color-text-primary);
}

.desktop-cat-btn.active {
  background-color: var(--color-surface-high);
  color: var(--color-primary);
}

.nav-chevron {
  font-size: var(--text-size-body-sm);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.desktop-cat-btn:hover .nav-chevron,
.desktop-cat-btn.active .nav-chevron {
  opacity: 0.6;
}

/* Products grid column */
.product-display-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.menu-error, .menu-empty {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--space-12) 0;
}

.menu-error {
  color: var(--color-error);
}

.category-section {
  display: flex;
  flex-direction: column;
}

.category-section-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
  border-bottom: thin solid var(--color-border-subtle);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-6);
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Item Card */
.product-card {
  background-color: var(--color-surface-white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: thin solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.product-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  background-color: var(--color-surface-low);
  overflow: hidden;
}

.product-image {
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.04);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  color: var(--color-text-secondary);
}

.seasonal-badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  background-color: var(--color-tertiary);
  color: var(--color-text-on-amber);
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 600;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.product-card-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--space-2);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.product-title {
  font-family: var(--font-display);
  font-size: var(--text-size-body-lg);
  color: var(--color-text-heading);
  font-weight: 600;
}

.product-price {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  font-weight: 700;
  color: var(--color-accent);
}

.product-desc {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  line-height: var(--text-lh-body-sm);
  color: var(--color-text-secondary);
  flex-grow: 1;
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-add-to-cart {
  width: 100%;
  background-color: var(--color-surface-low);
  color: var(--color-primary);
  border: thin solid var(--color-border);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-3) 0;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-add-to-cart:hover {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  border-color: var(--color-primary);
}

.btn-add-to-cart.disabled {
  background-color: var(--color-surface-high);
  color: var(--color-text-disabled);
  border-color: var(--color-border-subtle);
  cursor: not-allowed;
}

/* Sold out cards overrides */
.product-card.sold-out {
  opacity: 0.75;
}

.sold-out-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(254, 249, 241, 0.4);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.sold-out-badge {
  background-color: var(--color-surface-white);
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  text-transform: uppercase;
  letter-spacing: var(--text-ls-label-md);
}

/* Cart sidebar styling (teaser) */
.mock-cart-sidebar {
  display: none;
  width: 20rem;
  background-color: var(--color-surface-low);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: thin solid var(--color-border);
  box-shadow: var(--shadow-md);
  flex-direction: column;
  gap: var(--space-6);
  height: calc(100vh - 10rem);
  position: sticky;
  top: 6.5rem;
}

@media (min-width: 1280px) {
  .mock-cart-sidebar {
    display: flex;
  }
}

.cart-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
  border-bottom: thin solid var(--color-border-subtle);
  padding-bottom: var(--space-3);
  font-weight: 600;
}

.cart-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-grow: 1;
  gap: var(--space-2);
}

.cart-empty-icon {
  font-size: 3rem;
  color: var(--color-text-disabled);
}

.cart-empty-text {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.cart-helper-text {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.cart-summary-block {
  border-top: thin solid var(--color-border-subtle);
  padding-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.cart-summary-row.total {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  color: var(--color-text-heading);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.btn-checkout {
  width: 100%;
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  padding: var(--space-4) 0;
  border-radius: var(--radius-lg);
  text-align: center;
}

.btn-checkout.disabled {
  background-color: var(--color-surface-high);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

---

## Dependencies

No extra packages are needed. Standard database calls and next/image are used.

---

## Verification Checklist

### Menu Listing & Grid
- [ ] Catalog page resolves at `/menu`.
- [ ] Displays all food and drink categories fetched dynamically from the `menu_categories` table.
- [ ] Groups items by category name dynamically.
- [ ] Group grids are fully responsive across breakpoints (1 column on mobile, 2 columns on tablet, 3 columns on wide screens).
- [ ] Visual zoom-hover transition on item images operates smoothly.

### Category Selector
- [ ] Mobile navigation shows horizontal scroll bar with all categories, hiding default browser scrollbars.
- [ ] Desktop navigation lists categories vertically and shows checkmarks/chevrons on active items.
- [ ] Clicking a category filters items by category in the server query (using `?category=...` query URL parameter updates).

### Item Badges & Overlays
- [ ] Seasonal items display the "Seasonal" tag overlay.
- [ ] Sold-out items display a grayed-out overlay with "Sold Out" text.
- [ ] Sold-out button is disabled and reads "Unavailable".

### General & SEO
- [ ] Page fetches database server-side with cache revalidation options.
- [ ] Page title matches: `COVE - Menu & Ordering` or custom SEO variants.
- [ ] `npx tsc --noEmit` runs clean with no compilation issues.

import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';
import './page.css';

interface MenuPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeCategoryName = resolvedSearchParams.category || '';

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

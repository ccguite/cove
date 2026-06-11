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

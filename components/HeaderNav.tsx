'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import HeaderCartIcon from './HeaderCartIcon';

const STAFF_ROLES = new Set(['admin', 'reception', 'kitchen']);

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  // Load auth state and subscribe to changes
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch role from profile table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile && STAFF_ROLES.has(profile.role)) {
          // If staff, treat as guest on the public header and sign out of the customer client session
          setUser(null);
          await supabase.auth.signOut();
          try {
            document.cookie.split(';').forEach((c) => {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
            });
          } catch {}
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile && STAFF_ROLES.has(profile.role)) {
          setUser(null);
          await supabase.auth.signOut();
          try {
            document.cookie.split(';').forEach((c) => {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
            });
          } catch {}
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Click outside detection for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    
    // 1. Clear server-side session cookies
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Server-side logout fetch failed:', e);
    }

    // 2. Clear client memory session
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Client-side sign out failed:', e);
    }

    // 3. Clear all client-side storage & cookies
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'cove-user')) {
          localStorage.removeItem(key);
        }
      }
    } catch {}

    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {}

    try {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    } catch {}

    // 4. Force a full browser page reload and redirect to home
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/menu', label: 'Cafe' },
    { href: '/features', label: 'Experience' },
    { href: '/location', label: 'Location' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Header */}
      <nav className="desktop-nav" aria-label="Top Navigation">
        <div className="nav-container">
          <Link href="/" className="logo-brand">COVE</Link>
          
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="desktop-nav-right">
            {user && (
              <>
                <Link href="/book" className="nav-booking-btn" aria-label="Book a Room">
                  <span className="material-symbols-outlined">calendar_month</span>
                </Link>
                <HeaderCartIcon />
              </>
            )}

            {/* Guest vs Logged In */}
            {user ? (
              <div className="account-dropdown-wrapper" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="nav-account-btn"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  Account <span className={`chevron ${dropdownOpen ? 'up' : 'down'}`}>▼</span>
                </button>
                {dropdownOpen && (
                  <div className="account-dropdown-menu fade-in">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <span className="material-symbols-outlined">account_circle</span>
                      My Account
                    </Link>
                    <Link
                      href="/account?tab=settings"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <span className="material-symbols-outlined">settings</span>
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item btn-dropdown-logout"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="nav-login-link">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <span className="logo-mobile">COVE</span>
        <div className="mobile-header-right">
          {user && (
            <>
              <Link href="/book" className="nav-booking-btn" aria-label="Book a Room">
                <span className="material-symbols-outlined">calendar_month</span>
              </Link>
              <HeaderCartIcon />
            </>
          )}
          {user ? (
            <div className="account-dropdown-wrapper" ref={mobileDropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-account-btn-mobile"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
              {dropdownOpen && (
                <div className="account-dropdown-menu mobile-dropdown fade-in">
                  <div className="mobile-dropdown-header">
                    <span className="mobile-user-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    My Account
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    <span className="material-symbols-outlined">settings</span>
                    Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item btn-dropdown-logout"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="nav-login-link-mobile" aria-label="Login">
              <span className="material-symbols-outlined">login</span>
            </Link>
          )}
        </div>
      </header>
    </>
  );
}

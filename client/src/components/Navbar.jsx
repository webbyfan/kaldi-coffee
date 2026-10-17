import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { t, tr } from '../data/translations';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, openDrawer } = useCart();
  const { lang, toggleLanguage } = useLang();
  const { userInfo, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const NAV_LINKS = [
    { labelKey: 'shop',      to: '/shop' },
    { labelKey: 'wholesale', to: '/wholesale' },
    { labelKey: 'about',     to: '/about' },
    { labelKey: 'journal',   to: '/journal' },
    { labelKey: 'contact',   to: '/contact' },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const clickHandler = (e) => {
      if (!e.target.closest('.navbar__user-menu')) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('click', clickHandler);
    }
    return () => document.removeEventListener('click', clickHandler);
  }, [userMenuOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const isHome = location.pathname === '/';
  const navClass = `navbar ${
    scrolled || drawerOpen || !isHome ? 'navbar--scrolled' : 'navbar--transparent'
  }`;

  return (
    <>
      <header className={navClass} role="banner">
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="Kaldi & Co — Home">
            <span className="navbar__logo-name">Kaldi &amp; Co</span>
            <span className="navbar__logo-tagline">
              {lang === 'am' ? 'ልዩ ቡና · አዲስ አበባ' : 'Specialty Coffee · Addis Ababa'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__links" aria-label="Main navigation">
            {NAV_LINKS.map(({ labelKey, to }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`navbar__link ${isActive ? 'is-active' : ''}`}
                  style={isActive ? { color: 'var(--color-coffee)', fontWeight: 600 } : {}}
                >
                  {tr(t.nav[labelKey], lang)}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Language Toggle */}
            <button
              type="button"
              className="navbar__lang-btn"
              onClick={toggleLanguage}
              aria-label={lang === 'en' ? 'Switch to Amharic' : 'Switch to English'}
              id="language-toggle"
              title={lang === 'en' ? 'Switch to Amharic / አማርኛ' : 'Switch to English'}
            >
              <span className="navbar__lang-flag">{lang === 'en' ? '🇪🇹' : '🌐'}</span>
              <span className="navbar__lang-label">{tr(t.nav.langToggle, lang)}</span>
            </button>

            {/* Cart Button */}
            <button
              type="button"
              className="navbar__cart-btn"
              onClick={openDrawer}
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <svg
                className="navbar__cart-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="navbar__cart-badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Auth Button */}
            {userInfo ? (
              <div className="navbar__user-menu">
                <button
                  type="button"
                  className="navbar__user-pill"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                  aria-label="User account menu"
                >
                  <span className="user-pill-avatar">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span>{userInfo.name.split(' ')[0]}</span>
                  <span className={`user-pill-caret ${userMenuOpen ? 'open' : ''}`}>▼</span>
                </button>

                {userMenuOpen && (
                  <div className="navbar__user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{userInfo.name}</p>
                      <p className="user-dropdown-email">{userInfo.email}</p>
                      {userInfo.isAdmin && (
                        <span style={{ fontSize: '10px', background: '#fdf6ed', color: 'var(--color-caramel)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link to="/my-orders" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <span>📦</span> My Orders
                    </Link>

                    {userInfo.isAdmin && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <span>🛠️</span> Admin Dashboard
                      </Link>
                    )}

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="user-dropdown-item logout"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-outline-dark navbar__order-btn"
                style={{ marginLeft: '0.5rem', padding: '0.45rem 0.85rem' }}
              >
                Log In
              </Link>
            )}

            {/* Order Now CTA — desktop */}
            <Link to="/shop" className="btn btn-primary navbar__order-btn">
              {tr(t.nav.orderNow, lang)}
            </Link>

            {/* Hamburger — mobile */}
            <button
              className={`navbar__hamburger${drawerOpen ? ' is-open' : ''}`}
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label={drawerOpen ? tr(t.nav.closeMenu, lang) : tr(t.nav.openMenu, lang)}
              aria-expanded={drawerOpen}
            >
              <span className="navbar__hamburger-bar" />
              <span className="navbar__hamburger-bar" />
              <span className="navbar__hamburger-bar" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <nav
        className={`navbar__drawer${drawerOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        <ul className="navbar__drawer-links">
          {NAV_LINKS.map(({ labelKey, to }) => (
            <li key={to}>
              <Link
                to={to}
                className="navbar__drawer-link"
                onClick={() => setDrawerOpen(false)}
              >
                {tr(t.nav[labelKey], lang)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar__drawer-cta">
          <Link
            to="/shop"
            className="btn btn-primary"
            onClick={() => setDrawerOpen(false)}
          >
            {tr(t.nav.orderNow, lang)}
          </Link>
          <button
            className="btn btn-outline-dark"
            onClick={() => {
              setDrawerOpen(false);
              openDrawer();
            }}
          >
            {tr(t.nav.viewCart, lang)} {cartCount > 0 && `(${cartCount})`}
          </button>
          
          {userInfo ? (
            <>
              <Link to="/my-orders" className="btn btn-outline-dark" onClick={() => setDrawerOpen(false)}>
                📦 My Orders ({userInfo.name.split(' ')[0]})
              </Link>
              {userInfo.isAdmin && (
                <Link to="/admin" className="btn btn-outline-dark" onClick={() => setDrawerOpen(false)}>
                  🛠️ Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                style={{ color: '#b91c1c' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline-dark" onClick={() => setDrawerOpen(false)}>
              Log In / Register
            </Link>
          )}

          {/* Language toggle in mobile drawer */}
          <button
            type="button"
            className="btn btn-ghost navbar__drawer-lang"
            onClick={toggleLanguage}
          >
            {lang === 'en' ? '🇪🇹 አማርኛ' : '🌐 English'}
          </button>
        </div>
      </nav>
    </>
  );
}

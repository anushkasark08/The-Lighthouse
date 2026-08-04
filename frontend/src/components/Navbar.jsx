import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Tooltip from './Tooltip';
import ConfirmModal from './ConfirmModal';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const languageMenuRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('the-lighthouse-theme') || 'midnight';
    }
    return 'midnight';
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('the-lighthouse-language') || 'EN';
    }
    return 'EN';
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.lang = language === 'HI' ? 'hi' : language === 'GU' ? 'gu' : 'en';
    window.localStorage.setItem('the-lighthouse-theme', themeMode);
    window.localStorage.setItem('the-lighthouse-language', language);
  }, [themeMode, language]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'midnight' ? 'aurora' : 'midnight'));
  };

  const selectLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setLanguageMenuOpen(false);
  };

  const languageLabel = language === 'HI' ? 'हिं' : language === 'GU' ? 'ગુ' : 'EN';

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <span className="navbar__logo-icon" aria-hidden="true">🌊</span>
          <span className="navbar__logo-text">The Lighthouse</span>
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <div className="navbar__links">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to="/menu" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              Menu
            </NavLink>
            <NavLink to="/reserve" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              Reserve & Pre-order
            </NavLink>
          </div>

          <div className="navbar__actions">
            <div className="navbar__control-group" ref={languageMenuRef}>
              <div className="navbar__language">
                <button
                  type="button"
                  className="navbar__control-btn navbar__control-btn--language"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={languageMenuOpen}
                  aria-label={`Select language, currently ${language}`}
                >
                  <span className="navbar__control-label">Lang</span>
                  <span className="navbar__control-value">{languageLabel}</span>
                </button>

                {languageMenuOpen && (
                  <div className="navbar__language-menu" role="menu">
                    <button type="button" className="navbar__language-option" role="menuitem" onClick={() => selectLanguage('EN')}>
                      English
                    </button>
                    <button type="button" className="navbar__language-option" role="menuitem" onClick={() => selectLanguage('HI')}>
                      हिन्दी
                    </button>
                    <button type="button" className="navbar__language-option" role="menuitem" onClick={() => selectLanguage('GU')}>
                      ગુજરાતી
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="navbar__control-btn navbar__control-btn--theme"
                onClick={toggleTheme}
                aria-label={`Switch to ${themeMode === 'midnight' ? 'aurora' : 'midnight'} theme`}
                aria-pressed={themeMode === 'aurora'}
              >
                <span className="navbar__control-icon" aria-hidden="true">
                  {themeMode === 'midnight' ? '🌙' : '✨'}
                </span>
                <span className="navbar__control-label">{themeMode === 'midnight' ? 'Midnight' : 'Aurora'}</span>
              </button>
            </div>

            <NavLink
              to="/reserve"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link nav-link--button ${isActive ? 'nav-link--active' : ''}`}
            >
              Book a Table
            </NavLink>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
                    Admin
                  </NavLink>
                )}
                <div className="navbar__user">
                  <span className="navbar__user-name">Hi, {user.name.split(' ')[0]}</span>
                  <Tooltip content="Sign out of your account" position="bottom">
                    <button className="btn btn-ghost navbar__user-btn" onClick={handleLogoutClick}>Logout</button>
                  </Tooltip>
                </div>
              </>
            ) : (
              <Tooltip content="Sign in to your account" position="bottom">
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn btn-primary navbar__auth-btn">
                  Sign In
                </Link>
              </Tooltip>
            )}

            <Tooltip content="View your cart" position="bottom">
              <button
                type="button"
                className="navbar__cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
              >
                <span aria-hidden="true">🛒</span>
                {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
              </button>
            </Tooltip>
          </div>
        </nav>

        <Tooltip content="Toggle navigation menu" position="bottom">
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </Tooltip>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;
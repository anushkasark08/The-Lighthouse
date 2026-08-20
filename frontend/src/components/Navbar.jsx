import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Tooltip from './Tooltip';
import ConfirmModal from './ConfirmModal';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const handleCartClick = () => {
    setIsCartOpen(true);
    setMenuOpen(false);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🌊</span>
          <span className="navbar__logo-text">The Lighthouse</span>
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/menu" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            {t('nav.menu')}
          </NavLink>
          <NavLink to="/reserve" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            {t('nav.reservation')}
          </NavLink>

          <Tooltip content="View your cart" position="bottom">
            <button type="button" className="navbar__cart-btn" onClick={handleCartClick} aria-label="Open cart">
              🛒
              {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
            </button>
          </Tooltip>

          <div className="navbar__lang" onClick={() => setLangOpen(prev => !prev)}>
            <button type="button" className="navbar__lang-btn">
              {currentLang.label} ▾
            </button>
            {langOpen && (
              <div className="navbar__lang-dropdown">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`navbar__lang-option ${i18n.language === l.code ? 'navbar__lang-option--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); changeLanguage(l.code); }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Admin
                </NavLink>
              )}
              <div className="navbar__user">
                <span className="navbar__user-name">Hi, {user.name.split(' ')[0]}</span>
                <Tooltip content="Sign out of your account" position="bottom">
                  <button className="btn btn-ghost" onClick={handleLogoutClick}>Logout</button>
                </Tooltip>
              </div>
            </>
          ) : (
            <Tooltip content="Sign in to your account" position="bottom">
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn btn-primary">
                Sign In
              </Link>
            </Tooltip>
          )}

        </nav>

        <Tooltip content="Toggle navigation menu" position="bottom">
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
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

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
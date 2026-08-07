import { useState } from 'react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSuccess('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <h2 className="footer-brand-title">The Lighthouse</h2>
            <div className="footer-brand-divider">
              <span className="footer-brand-divider-line" />
              <span className="footer-brand-divider-diamond" />
              <span className="footer-brand-divider-line" />
            </div>
            <p className="footer-tagline">Fine Dining. Reimagined.</p>
            <p className="footer-description">
              A culinary journey that blends timeless flavors with modern artistry. Experience elegance in every detail.
            </p>
            <div className="footer-socials">
              <Tooltip content="Follow us on Instagram" position="top">
                <a
                  href="https://www.instagram.com/thelighthouse.kolkata"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </Tooltip>
              <Tooltip content="Follow us on Facebook" position="top">
                <a
                  href="https://www.facebook.com/thelighthouse.kolkata"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 0-1-1h3z" />
                  </svg>
                </a>
              </Tooltip>
              <Tooltip content="Follow us on X (formerly Twitter)" position="top">
                <a
                  href="https://x.com/thelighthouse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="X"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l16 16M20 4L4 20" />
                  </svg>
                </a>
              </Tooltip>
            </div>
          </div>

          <div className="footer-col footer-col-nav">
            <h3 className="footer-heading">
              Navigation
              <span className="footer-heading-line" />
            </h3>
            <div className="footer-nav-list">
              <Tooltip content="Reserve a dining table" position="top">
                <Link to="/reserve" className="footer-nav-item">
                  <span className="footer-nav-left">
                    <svg className="footer-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2v10M18 12a3 3 0 0 0 3-3V2M18 12a3 3 0 0 1-3-3V2M18 12v10M6 2v7a3 3 0 0 0 6 0V2M9 12v10" />
                    </svg>
                    <span>Reserve a Table</span>
                  </span>
                  <svg className="footer-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip content="View our full dining menu" position="top">
                <Link to="/menu" className="footer-nav-item">
                  <span className="footer-nav-left">
                    <svg className="footer-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Menu</span>
                  </span>
                  <svg className="footer-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip content="Sign in to your account" position="top">
                <Link to="/auth" className="footer-nav-item">
                  <span className="footer-nav-left">
                    <svg className="footer-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Sign In</span>
                  </span>
                  <svg className="footer-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip content="Purchase gift cards" position="top">
                <Link to="/reserve" className="footer-nav-item">
                  <span className="footer-nav-left">
                    <svg className="footer-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>Gift Cards</span>
                  </span>
                  <svg className="footer-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip content="Learn more about our story" position="top">
                <Link to="/" className="footer-nav-item">
                  <span className="footer-nav-left">
                    <svg className="footer-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>About Us</span>
                  </span>
                  <svg className="footer-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Tooltip>
            </div>
          </div>

          <div className="footer-col footer-col-contact">
            <h3 className="footer-heading">
              Contact Us
              <span className="footer-heading-line" />
            </h3>
            <div className="footer-contact-list">
              <Tooltip content="Visit us at Sarat Bose Road, Kolkata" position="top">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="footer-contact-text">
                    <p>42/3, Sarat Bose Road,</p>
                    <p>Kolkata, 700029</p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Call for reservations & inquiries" position="top">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="footer-contact-text">
                    <p>+91 98765 43210</p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Open 7 days a week" position="top">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="footer-contact-text">
                    <p>Mon – Sun</p>
                    <p>7 AM – 11 PM</p>
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="footer-col footer-col-newsletter">
            <h3 className="footer-heading">
              Stay Connected
              <span className="footer-heading-line" />
            </h3>
            <p className="footer-newsletter-text">
              Join our newsletter for exclusive updates, special events &amp; offers.
            </p>
            <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
              <input
                id="newsletter-email"
                type="email"
                required
                className="footer-newsletter-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
              />
              <button type="submit" className="footer-newsletter-btn">
                Subscribe
              </button>
            </form>
            {error && <p className="footer-newsletter-msg error">{error}</p>}
            {success && <p className="footer-newsletter-msg success">{success}</p>}

            <div className="footer-newsletter-divider" />

            <div className="footer-features">
              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 0 0-10 10v2h20v-2a10 10 0 0 0-10-10z" />
                    <line x1="2" y1="18" x2="22" y2="18" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                  </svg>
                </div>
                <span className="footer-feature-label">Finest Cuisine</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A9 9 0 0 1 2 11c0-4.97 4.03-9 9-9a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9z" />
                    <path d="M11 2v9h9" />
                  </svg>
                </div>
                <span className="footer-feature-label">Fresh Ingredients</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 22h8" />
                    <path d="M12 15v7" />
                    <path d="M5 3h14l-7 8-7-8z" />
                  </svg>
                </div>
                <span className="footer-feature-label">Signature Cocktails</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="footer-feature-label">Warm Ambience</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-security">
            <svg className="footer-security-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span className="footer-security-text">
              Your security is important to us. All payments are securely processed.
            </span>
          </div>

          <div className="footer-copyright">
            © {new Date().getFullYear()} The Lighthouse. All rights reserved.
          </div>

          <div className="footer-legal-links">
            <Link to="/privacy" className="footer-legal-link">
              Privacy Policy
            </Link>
            <span className="footer-legal-sep">|</span>
            <Link to="/terms" className="footer-legal-link">
              Terms of Service
            </Link>
            <span className="footer-legal-sep">|</span>
            <Link to="/privacy" className="footer-legal-link">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

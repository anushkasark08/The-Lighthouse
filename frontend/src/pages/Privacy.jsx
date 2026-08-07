import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <main className="legal-page page-enter">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: August 7, 2026</p>

        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, phone number, dietary preferences, and allergen alerts when you create an account or make a reservation.</p>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to process reservations, send confirmation emails, personalize your dining experience, and improve our services.</p>
        </section>

        <section className="legal-section">
          <h2>3. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. Passwords are encrypted using industry-standard bcrypt hashing.</p>
        </section>

        <section className="legal-section">
          <h2>4. Third-Party Services</h2>
          <p>We use Google Maps for location services. Their privacy policy governs data collected through the map embed on our website.</p>
        </section>

        <section className="legal-section">
          <h2>5. Your Rights</h2>
          <p>You may update your account information at any time. To request deletion of your data, please contact us at privacy@thelighthouse.com.</p>
        </section>

        <section className="legal-section">
          <h2>6. Contact Us</h2>
          <p>For privacy-related inquiries, email us at privacy@thelighthouse.com or visit us at 42/3, Sarat Bose Road, Kolkata, 700029.</p>
        </section>
      </div>

      <style>{`
        .legal-page { min-height: 80vh; padding: 8rem 2rem 4rem; }
        .legal-container { max-width: 760px; margin: 0 auto; }
        .legal-back { display: inline-block; margin-bottom: 2rem; color: var(--color-primary); font-size: 0.9rem; transition: opacity var(--transition); }
        .legal-back:hover { opacity: 0.7; }
        .legal-title { font-family: var(--font-serif); font-size: 2.5rem; color: var(--color-text); margin-bottom: 0.5rem; }
        .legal-updated { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 3rem; }
        .legal-section { margin-bottom: 2rem; }
        .legal-section h2 { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text); margin-bottom: 0.75rem; }
        .legal-section p { color: var(--color-text-muted); line-height: 1.7; font-size: 0.95rem; }
      `}</style>
    </main>
  );
};

export default Privacy;

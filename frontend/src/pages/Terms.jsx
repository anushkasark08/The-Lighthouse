import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <main className="legal-page page-enter">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Home</Link>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: August 7, 2026</p>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using The Lighthouse website and services, you agree to be bound by these Terms of Service.</p>
        </section>

        <section className="legal-section">
          <h2>2. Reservations</h2>
          <p>Reservations are subject to availability. We reserve the right to cancel or modify reservations. A valid account is required to make reservations.</p>
        </section>

        <section className="legal-section">
          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration.</p>
        </section>

        <section className="legal-section">
          <h2>4. Reviews and Content</h2>
          <p>By submitting reviews, you grant us a non-exclusive license to display, modify, and distribute your content. We reserve the right to remove inappropriate content.</p>
        </section>

        <section className="legal-section">
          <h2>5. Limitation of Liability</h2>
          <p>The Lighthouse shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
        </section>

        <section className="legal-section">
          <h2>6. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
        </section>

        <section className="legal-section">
          <h2>7. Contact Us</h2>
          <p>For questions about these terms, contact us at legal@thelighthouse.com.</p>
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

export default Terms;

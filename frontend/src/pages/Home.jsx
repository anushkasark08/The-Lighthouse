import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMenuItems } from '../api/menuApi';
import { getReviews, createReview } from '../api/reviewApi';
import MenuCard from '../components/MenuCard';
import { useAuth } from '../context/AuthContext';
import Tooltip from '../components/Tooltip';
import ComparisonSection from '../components/ComparisonSection';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'}>★</span>
    ))}
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      setFormError('Please select a rating.');
      return;
    }
    if (newComment.trim().length < 5) {
      setFormError('Please enter a comment (at least 5 characters).');
      return;
    }
    setSubmittingReview(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const { data } = await createReview({ rating: newRating, comment: newComment });
      setFormSuccess(true);
      setNewRating(0);
      setNewComment('');
      // Prepend new review to the list
      const freshReview = {
        ...data.data,
        user: { name: user?.name || 'Anonymous' }
      };
      setReviews((prev) => [freshReview, ...prev].slice(0, 3));
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    getMenuItems({ tag: 'chef-special' })
      .then(({ data }) => setFeatured((data?.data || []).slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoadingMenu(false));

    getReviews()
      .then(({ data }) => setReviews((data?.data || []).slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <main className="page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: "url('/images/hero-restaurant.jpg')" }} />
        <div className="hero__overlay" />
        <div className="container hero__content">
          <span className="section-label">{t('hero.tagline')}</span>
          <h1 className="hero__title">
            {t('hero.title')}
          </h1>
          <p className="hero__subtitle">
            {t('hero.subtitle')}
          </p>
          <div className="hero__cta">
            <Tooltip content="Start your reservation for tonight" position="top">
              <Link to="/reserve#reservation-form" className="btn btn-primary">{t('hero.reserve_table')}</Link>
            </Tooltip>
            <Tooltip content="Explore our live menu with real-time availability" position="top">
              <Link to="/menu" className="btn btn-outline">{t('hero.explore_menu')}</Link>
            </Tooltip>
          </div>
          <div className="hero__feature-pill">
            <span className="avail-dot available" />
            Live menu availability — know what's on tonight before you arrive
          </div>
        </div>
      </section>

      {/* Reconstructed Comparison / USP Section */}
      <ComparisonSection />

      {/* Chef's Specials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">From the Kitchen</span>
            <h2 className="section-title">Chef's Specials Tonight</h2>
            <div className="divider">
              <div className="divider-line" />
              <div className="divider-diamond" />
              <div className="divider-line right" />
            </div>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Updated live — these are the dishes <em>actually available</em> right now.
            </p>
          </div>
          {loadingMenu ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : featured.length > 0 ? (
            <div className="grid-3">
              {featured.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No specials available right now.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Tooltip content="View all dishes on our full menu" position="top">
              <Link to="/menu" className="btn btn-outline">View Full Menu →</Link>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="section chef-section">
        <div className="container chef-inner">
          <div className="chef-image-wrap">
            <img src="/images/chef.jpg" alt="Head Chef" className="chef-image" />
          </div>
          <div className="chef-content">
            <span className="section-label">Meet Our Chef</span>
            <h2 className="section-title">A Master of Flavour</h2>
            <div className="divider" style={{ justifyContent: 'flex-start' }}>
              <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
            </div>
            <p className="chef-bio">
              With over two decades of culinary artistry, our executive chef crafts every dish from locally sourced, seasonal ingredients.
              The live menu reflects what's freshest today — not yesterday's printed card.
            </p>
            <Tooltip content="Explore our menu before you dine with us" position="top">
              <Link to="/menu" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                Explore the Menu
              </Link>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Guest Experiences</span>
              <h2 className="section-title">What Our Guests Say</h2>
              <div className="divider">
                <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
              </div>
            </div>
            <div className="grid-3">
              {reviews.map((r) => (
                <div key={r._id} className="card review-card">
                  <div className="review-card__inner">
                    <Stars rating={r.rating} />
                    <p className="review-card__comment">"{r.comment}"</p>
                    <div className="review-card__author">
                      <div className="review-card__avatar">{r.user?.name?.[0] || 'G'}</div>
                      <span>{r.user?.name || 'Guest'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leave a Review Section */}
      <section className="section review-form-section" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="section-header">
            <span className="section-label">Your Feedback</span>
            <h2 className="section-title">Leave a Review</h2>
            <div className="divider">
              <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
            </div>
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="review-submit-form glass" style={{ marginTop: 'var(--space-md)' }}>
              {formError && <p className="form-error-msg">⚠️ {formError}</p>}
              {formSuccess && <p className="form-success-msg">✨ Review submitted successfully!</p>}

              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Rating</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-input-btn ${star <= newRating ? 'filled' : 'empty'}`}
                      onClick={() => setNewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label htmlFor="review-comment" className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Review Comment</label>
                <textarea
                  id="review-comment"
                  className="form-input"
                  rows="4"
                  placeholder="Share your dining experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submittingReview}
                style={{ marginTop: 'var(--space-lg)', width: '100%' }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="review-login-prompt glass" style={{ padding: 'var(--space-xl)', textAlign: 'center', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-md)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                Only registered guests can leave reviews.
              </p>
              <Link to="/auth" className="btn btn-outline">Sign In / Register</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <span className="section-label">Tonight at The Lighthouse</span>
          <h2 className="section-title">Ready for an Unforgettable Meal?</h2>
          <p className="section-subtitle" style={{ margin: '1rem auto' }}>
            Explore tonight's live menu, then reserve your table for the perfect evening.
          </p>
          <Tooltip content="View the live menu before reserving your table" position="top">
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
              Explore the Menu
            </Link>
          </Tooltip>
        </div>
      </section>

      <style>{`
        .hero { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; }
        .hero::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 150px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(26, 23, 20, 0.25) 30%,
            rgba(26, 23, 20, 0.75) 70%,
            var(--color-bg) 100%
          );
          pointer-events: none;
          z-index: 2;
        }
        .hero__bg { position: absolute; inset: 0; background-size: cover; background-position: center; transform: scale(1.05); transition: transform 8s ease; }
        .hero:hover .hero__bg { transform: scale(1); }
        .hero__overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(26,23,20,0.85) 0%, rgba(26,23,20,0.5) 100%); }
        .hero__content { position: relative; z-index: 3; max-width: 680px; padding-top: var(--navbar-h); }
        .hero__title { font-family: var(--font-serif); font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; color: var(--color-text); line-height: 1.1; margin: 1rem 0; }
        .hero__subtitle { font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: var(--space-xl); max-width: 500px; }
        .hero__cta { display: flex; gap: var(--space-md); flex-wrap: wrap; }
        .hero__feature-pill { display: inline-flex; align-items: center; gap: 8px; margin-top: var(--space-xl); padding: 0.5rem 1rem; background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.25); border-radius: var(--radius-full); font-size: 0.78rem; color: var(--color-text-muted); }

        .chef-section { background: var(--color-bg-elevated); }
        .chef-inner { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3xl); align-items: center; }
        .chef-image-wrap { border-radius: var(--radius-lg); overflow: hidden; }
        .chef-image { width: 100%; height: 480px; object-fit: cover; }
        .chef-bio { font-size: 1rem; color: var(--color-text-muted); line-height: 1.8; }

        .review-card__inner { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md); }
        .review-card__comment { font-family: var(--font-serif); font-size: 1rem; font-style: italic; color: var(--color-text-muted); line-height: 1.7; flex: 1; }
        .review-card__author { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.85rem; color: var(--color-text-muted); }
        .review-card__avatar { width: 32px; height: 32px; background: var(--color-primary); color: var(--color-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }

        .cta-section { text-align: center; background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-elevated) 100%); }
        .cta-inner { display: flex; flex-direction: column; align-items: center; }

        .review-submit-form {
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
        }
        .star-rating-input {
          display: flex;
          gap: 8px;
        }
        .star-input-btn {
          background: none;
          border: none;
          font-size: 2.2rem;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s ease, color 0.2s ease;
          color: var(--color-border);
        }
        .star-input-btn:hover {
          transform: scale(1.15);
        }
        .star-input-btn.filled {
          color: var(--color-primary);
        }
        .star-input-btn.empty {
          color: var(--color-border);
        }
        .form-error-msg {
          color: var(--color-error);
          background: rgba(224, 92, 92, 0.08);
          border: 1px solid rgba(224, 92, 92, 0.2);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          margin-bottom: var(--space-md);
        }
        .form-success-msg {
          color: var(--color-success);
          background: rgba(76, 175, 125, 0.08);
          border: 1px solid rgba(76, 175, 125, 0.2);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          margin-bottom: var(--space-md);
        }

        @media (max-width: 768px) {
          .chef-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
};

export default Home;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DIETARY_OPTIONS = [
  { value: 'all', label: 'Everything', desc: 'No restrictions' },
  { value: 'veg', label: '🟢 Vegetarian', desc: 'Only veg dishes' },
  { value: 'non-veg', label: '🔴 Non-Vegetarian', desc: 'Includes meat & fish' }
];

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ email: '', phone: '' });

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dietaryPreference: 'all', allergenAlerts: []
  });

  const emailPattern = /^\S+@\S+\.\S+$/;
  const phonePattern = /^[0-9]{10}$/;
  const invalidPhones = ['0000000000', '1111111111', '1234567890', '9999999999'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === 'phone' ? value.replace(/\D/g, '') : value;
    setForm((f) => ({ ...f, [name]: sanitized }));
    setError('');

    if (name === 'email') {
      if (!value) {
        setFeedback((fb) => ({ ...fb, email: '' }));
      } else if (!emailPattern.test(value)) {
        setFeedback((fb) => ({ ...fb, email: 'Please enter a valid email address' }));
      } else {
        setFeedback((fb) => ({ ...fb, email: 'Looks good — we’ll verify the email domain during registration' }));
      }
    }

    if (name === 'phone') {
      if (!value) {
        setFeedback((fb) => ({ ...fb, phone: '' }));
      } else if (!phonePattern.test(value) || invalidPhones.includes(value)) {
        setFeedback((fb) => ({ ...fb, phone: 'Please enter a valid 10-digit mobile number' }));
      } else {
        setFeedback((fb) => ({ ...fb, phone: 'Good phone format — this number helps us confirm your reservation' }));
      }
    }
  };

  const handleAllergenToggle = (allergen) => {
    setForm((f) => ({
      ...f,
      allergenAlerts: f.allergenAlerts.includes(allergen)
        ? f.allergenAlerts.filter((a) => a !== allergen)
        : [...f.allergenAlerts, allergen]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.email || !emailPattern.test(form.email)) {
      setError('Please provide a valid email address before continuing.');
      setLoading(false);
      return;
    }

    if (!isLogin && (!form.phone || !phonePattern.test(form.phone) || invalidPhones.includes(form.phone))) {
      setError('Please enter a valid mobile number so we can keep your reservation secure.');
      setLoading(false);
      return;
    }

    if (!isLogin && (!form.name || !/^[\p{L}\p{M}\s'.-]{2,50}$/u.test(form.name))) {
      setError('Name must contain at least 2 letters and cannot be only symbols.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page page-enter">
      <div className="auth-bg" style={{ backgroundImage: "url('/images/hero-restaurant.jpg')" }} />
      <div className="auth-overlay" />

      <div className="auth-card glass">
        {/* Logo */}
        <div className="auth-logo">
          <span>🌊</span>
          <span className="auth-logo-text">The Lighthouse</span>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
            Create Account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className={`form-input ${feedback.phone && !feedback.phone.includes('Good phone format') ? 'invalid' : ''}`}
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                />
                {feedback.phone && <p className={`input-hint ${feedback.phone.includes('Good phone format') ? 'valid' : 'invalid'}`}>{feedback.phone}</p>}
              </div>

              <p className="auth-note">We verify email domains and mobile format to reduce invalid reservation requests.</p>

              {/* Dietary profile — the differentiator */}
              <div className="form-group">
                <label className="form-label">🥗 Dietary Preference</label>
                <p className="auth-hint">Set once — your menu auto-filters on every visit</p>
                <div className="dietary-options">
                  {DIETARY_OPTIONS.map((opt) => (
                    <label key={opt.value} className={`dietary-option ${form.dietaryPreference === opt.value ? 'selected' : ''}`}>
                      <input type="radio" name="dietaryPreference" value={opt.value} checked={form.dietaryPreference === opt.value} onChange={handleChange} />
                      <span className="dietary-option__label">{opt.label}</span>
                      <span className="dietary-option__desc">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allergen Alerts (optional)</label>
                <div className="allergen-chips">
                  {['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish'].map((a) => (
                    <button
                      key={a} type="button"
                      className={`allergen-chip ${form.allergenAlerts.includes(a) ? 'active' : ''}`}
                      onClick={() => handleAllergenToggle(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <Link to="/" className="auth-back-link">← Back to Home</Link>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: var(--space-xl); }
        .auth-bg { position: fixed; inset: 0; background-size: cover; background-position: center; z-index: 0; }
        .auth-overlay { position: fixed; inset: 0; background: rgba(26,23,20,0.75); z-index: 0; }
        .auth-card { position: relative; z-index: 1; width: 100%; max-width: 480px; border-radius: var(--radius-xl); padding: var(--space-2xl); display: flex; flex-direction: column; gap: var(--space-lg); }
        .auth-logo { display: flex; align-items: center; gap: var(--space-sm); justify-content: center; font-size: 1.8rem; }
        .auth-logo-text { font-family: var(--font-serif); color: var(--color-primary); font-size: 1.5rem; }
        .auth-tabs { display: flex; background: var(--color-surface); border-radius: var(--radius-full); padding: 3px; }
        .auth-tab { flex: 1; padding: 0.6rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 500; color: var(--color-text-muted); transition: all var(--transition); }
        .auth-tab.active { background: var(--color-bg-card); color: var(--color-text); }
        .auth-form { display: flex; flex-direction: column; gap: var(--space-md); }
        .auth-hint { font-size: 0.75rem; color: var(--color-primary); margin-top: -4px; }
        .dietary-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        .dietary-option { display: flex; flex-direction: column; gap: 2px; padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition); }
        .dietary-option input { display: none; }
        .dietary-option.selected { border-color: var(--color-primary); background: rgba(201,169,98,0.06); }
        .dietary-option__label { font-size: 0.9rem; color: var(--color-text); }
        .dietary-option__desc { font-size: 0.75rem; color: var(--color-text-faint); }
        .allergen-chips { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
        .allergen-chip { padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted); transition: all var(--transition); }
        .allergen-chip.active { background: rgba(224,92,92,0.1); border-color: rgba(224,92,92,0.3); color: var(--color-error); }
        .auth-submit { width: 100%; justify-content: center; padding: 1rem; }
        .auth-footer-text { text-align: center; font-size: 0.82rem; color: var(--color-text-muted); }
        .auth-toggle-btn { color: var(--color-primary); font-size: 0.82rem; transition: opacity var(--transition); }
        .auth-toggle-btn:hover { opacity: 0.75; }
        .auth-back-link { text-align: center; font-size: 0.78rem; color: var(--color-text-faint); transition: color var(--transition); }
        .auth-back-link:hover { color: var(--color-primary); }
        .input-hint { margin-top: 0.35rem; font-size: 0.75rem; }
        .input-hint.valid { color: var(--color-success); }
        .input-hint.invalid { color: var(--color-error); }
        .form-input.invalid { border-color: var(--color-error); }
      `}</style>
    </main>
  );
};

export default Auth;

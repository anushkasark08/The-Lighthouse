import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import MenuCard from '../components/MenuCard';
import Tooltip from '../components/Tooltip';
import './Menu.css';

const CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner', 'desserts', 'drinks'];
const CATEGORY_ICONS = {
  all: '🍽️', breakfast: '🍳', lunch: '🥗',
  dinner: '🌙', desserts: '🍰', drinks: '🍸'
};

const CURATED_FILTERS = {
  chefSelection: {
    label: "Chef's Selection",
    icon: '👨‍🍳',
    options: ["Chef's Signature", 'Guest Favorite', 'Seasonal Special', 'New Arrival']
  },
  flavorProfile: {
    label: 'Flavor Profile',
    icon: '🌿',
    options: ['Light & Delicate', 'Rich & Indulgent', 'Spicy & Aromatic']
  },
  diningOccasion: {
    label: 'Dining Occasion',
    icon: '🥂',
    options: ['Date Night', 'Celebration', 'Casual Lunch', 'Executive Dining']
  }
};

const Menu = () => {
  const { user } = useAuth();
  const { items, loading, error, fetchMenu } = useMenu();

  const [category, setCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRecIndex, setSelectedRecIndex] = useState(0);
  const [curatedOpen, setCuratedOpen] = useState(false);
  const [curatedFilters, setCuratedFilters] = useState({
    chefSelection: [],
    flavorProfile: [],
    diningOccasion: []
  });

  const toggleCuratedFilter = useCallback((key, value) => {
    setCuratedFilters(prev => {
      const list = prev[key];
      const next = list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const activeCuratedCount = curatedFilters.chefSelection.length
    + curatedFilters.flavorProfile.length
    + curatedFilters.diningOccasion.length;

  const resetCuratedFilters = () => {
    setCuratedFilters({ chefSelection: [], flavorProfile: [], diningOccasion: [] });
  };

  useEffect(() => {
    const params = {};
    if (user?.role === 'admin') params.showAll = 'true';
    fetchMenu(params);
  }, [user, fetchMenu]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = category === 'all' || item.category === category;
      const matchDiet = dietFilter === 'all'
        || (dietFilter === 'veg' && item.isVeg)
        || (dietFilter === 'non-veg' && !item.isVeg);
      const matchSearch = search === ''
        || item.name.toLowerCase().includes(search.toLowerCase())
        || item.description?.toLowerCase().includes(search.toLowerCase());

      // Curated filters (OR within group, AND across groups)
      const matchChef = curatedFilters.chefSelection.length === 0
        || curatedFilters.chefSelection.some(v => (item.chefSelection || []).includes(v));
      const matchFlavor = curatedFilters.flavorProfile.length === 0
        || curatedFilters.flavorProfile.some(v => (item.flavorProfile || []).includes(v));
      const matchOccasion = curatedFilters.diningOccasion.length === 0
        || curatedFilters.diningOccasion.some(v => (item.diningOccasion || []).includes(v));

      return matchCat && matchDiet && matchSearch && matchChef && matchFlavor && matchOccasion;
    });
  }, [items, category, dietFilter, search, curatedFilters]);

  const chefRecommendations = useMemo(() => {
    const specials = items.filter(item => (item.tags || []).includes('chef-special') || item.averageRating >= 4.5);
    return (specials.length >= 3 ? specials : items).slice(0, 4);
  }, [items]);

  const featuredDish = chefRecommendations[selectedRecIndex] || chefRecommendations[0];

  const handleClearFilters = () => {
    setCategory('all');
    setDietFilter('all');
    setSearch('');
    resetCuratedFilters();
  };

  return (
    <main className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-hero__particles" />
        <div className="container menu-hero__content">
          <span className="section-label">Fine Dining Selection</span>
          <h1 className="menu-hero__title">The Menu</h1>
          <div className="divider-animated">
            <div className="divider-line" />
            <div className="divider-diamond" />
            <div className="divider-line right" />
          </div>
          <p className="section-subtitle">
            Every dish is prepared with culinary precision and <strong className="gold">available right now</strong>.
          </p>
        </div>
      </section>

      {/* The Culinary Promise Section */}
      <div className="culinary-promise-section">
        <div className="promise-grid">
          <div className="promise-card">
            <div className="promise-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4v2m0 0a7 7 0 017 7H5a7 7 0 017-7zm-8 9h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="promise-value">{items.length || '18'}</span>
            <h3 className="promise-title">Chef Curated Recipes</h3>
            <p className="promise-desc">Crafted daily using seasonal ingredients selected by our culinary team.</p>
          </div>

          <div className="promise-card">
            <div className="promise-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 20A9 9 0 0020 11V3h-8a9 9 0 00-9 9 9 9 0 008 8zm0 0v-8" />
              </svg>
            </div>
            <span className="promise-value">100%</span>
            <h3 className="promise-title">Prepared Fresh Daily</h3>
            <p className="promise-desc">Made to order with organic, locally sourced produce delivered each morning.</p>
          </div>

          <div className="promise-card">
            <div className="promise-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="promise-value">4.9★</span>
            <h3 className="promise-title">Loved by Our Guests</h3>
            <p className="promise-desc">Rated exceptionally by discerning fine dining patrons and critics alike.</p>
          </div>

          <div className="promise-card">
            <div className="promise-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <span className="promise-value">Summer</span>
            <h3 className="promise-title">Seasonal Collection</h3>
            <p className="promise-desc">Inspired by peak seasonal flavors and artisanal cooking traditions.</p>
          </div>
        </div>
      </div>

      {/* The Executive Culinary Showcase */}
      {featuredDish && (
        <div className="container">
          <section className="chef-showcase">
            <div className="section-header-editorial">
              <span className="section-label">Executive Selection</span>
              <h2 className="section-title">The Culinary Spotlight</h2>
              <p className="section-subtitle">
                A curated journey through Executive Chef Julian Vance's signature creations.
              </p>
            </div>

            <div className="showcase-container">
              {/* Main Featured Spotlight Panel */}
              <div className="showcase-hero">
                <div className="showcase-hero__image-wrap">
                  <img
                    key={featuredDish._id || featuredDish.id}
                    src={featuredDish.image || '/images/dinner.jpg'}
                    alt={featuredDish.name}
                    className="showcase-hero__image"
                    onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
                  />
                  <div className="showcase-hero__overlay" />
                  <span className="showcase-badge">
                    ✦ Chef's Signature Creation ✦
                  </span>
                </div>

                <div className="showcase-hero__details">
                  <div className="showcase-hero__header">
                    <div>
                      <span className="showcase-category">{featuredDish.category?.toUpperCase()}</span>
                      <h3 className="showcase-title">{featuredDish.name}</h3>
                    </div>
                    <span className="showcase-price">₹{featuredDish.price}</span>
                  </div>

                  <p className="showcase-description">{featuredDish.description}</p>

                  <div className="showcase-chef-note">
                    <span className="note-label">👨‍🍳 Executive Chef Note:</span>
                    <span className="note-text">
                      "Each ingredient is hand-selected to balance warmth, texture, and natural aroma — designed to create an unforgettable dining memory."
                    </span>
                  </div>

                  <div className="showcase-hero__footer">
                    <div className="showcase-rating">
                      <span className="star">★</span>
                      <span className="score">{featuredDish.averageRating ? `${featuredDish.averageRating} / 5.0` : 'No ratings yet'}</span>
                      <span className="reviews">({featuredDish.reviewCount || 0} guest reviews)</span>
                    </div>

                    <div className="showcase-progress">
                      <span className="progress-number">0{selectedRecIndex + 1}</span>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${((selectedRecIndex + 1) / chefRecommendations.length) * 100}%` }}
                        />
                      </div>
                      <span className="progress-number">0{chefRecommendations.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Culinary Chapters Sidebar */}
              <div className="showcase-chapters">
                <h4 className="chapters-heading">Curated Chapters</h4>
                <div className="chapters-list">
                  {chefRecommendations.map((dish, index) => (
                    <button
                      key={dish._id || dish.id}
                      className={`chapter-card ${selectedRecIndex === index ? 'chapter-card--active' : ''}`}
                      onClick={() => setSelectedRecIndex(index)}
                    >
                      <span className="chapter-num">0{index + 1}</span>
                      <div className="chapter-info">
                        <h5 className="chapter-name">{dish.name}</h5>
                        <span className="chapter-meta">
                          {dish.category} · ₹{dish.price}
                        </span>
                      </div>
                      <span className="chapter-arrow">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Navigation & Controls Bar */}
      <div className="menu-sticky-wrapper">
        <div className="container">
          {/* Primary Culinary Category Ribbon */}
          <nav className="category-ribbon" aria-label="Menu categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-ribbon-btn ${category === cat ? 'category-ribbon-btn--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                <span className="category-ribbon-icon">{CATEGORY_ICONS[cat]}</span>
                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </button>
            ))}
          </nav>

          {/* Control Bar: Dietary Switch & Integrated Search */}
          <div className="menu-control-bar">
            {/* Dietary Preference Switch */}
            <div className="diet-ribbon">
              <button
                className={`diet-ribbon-btn ${dietFilter === 'all' ? 'diet-ribbon-btn--active' : ''}`}
                onClick={() => setDietFilter('all')}
              >
                All Culinary
              </button>
              <button
                className={`diet-ribbon-btn ${dietFilter === 'veg' ? 'diet-ribbon-btn--active' : ''}`}
                onClick={() => setDietFilter('veg')}
              >
                🟢 Vegetarian
              </button>
              <button
                className={`diet-ribbon-btn ${dietFilter === 'non-veg' ? 'diet-ribbon-btn--active' : ''}`}
                onClick={() => setDietFilter('non-veg')}
              >
                🔴 Non-Vegetarian
              </button>
            </div>

            {/* Integrated Search */}
            <div className="menu-search-integrated">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by dish name, ingredient, or flavor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="clear-btn"
                  onClick={() => setSearch('')}
                  aria-label="Clear search query"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curate Your Dining Panel */}
      <div className="container">
        <div className="curated-panel">
          <button
            className="curated-panel__toggle"
            onClick={() => setCuratedOpen(prev => !prev)}
          >
            <span className="curated-panel__title">
              <span className="curated-panel__icon">✨</span>
              Curate Your Dining
            </span>
            <span className="curated-panel__meta">
              {activeCuratedCount > 0 && (
                <span className="curated-panel__badge">{activeCuratedCount} active</span>
              )}
              <span className={`curated-panel__arrow ${curatedOpen ? 'curated-panel__arrow--open' : ''}`}>▾</span>
            </span>
          </button>

          {curatedOpen && (
            <div className="curated-panel__body">
              <div className="curated-panel__sections">
                {Object.entries(CURATED_FILTERS).map(([key, { label, icon, options }]) => (
                  <div key={key} className="curated-section">
                    <h4 className="curated-section__heading">
                      <span>{icon}</span> {label}
                    </h4>
                    <div className="curated-section__chips">
                      {options.map(opt => (
                        <button
                          key={opt}
                          className={`curated-chip ${curatedFilters[key].includes(opt) ? 'curated-chip--active' : ''}`}
                          onClick={() => toggleCuratedFilter(key, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {activeCuratedCount > 0 && (
                <div className="curated-panel__footer">
                  <button className="curated-reset-btn" onClick={resetCuratedFilters}>
                    Reset Curation Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Menu Grid Area */}
      <div className="container menu-content-area">
        {!loading && (
          <div className="menu-counter-bar">
            <div>
              <span className="menu-count-badge">{filtered.length}</span>
              <span>{filtered.length === 1 ? 'dish available' : 'dishes available'}</span>
            </div>
            {user?.dietaryPreference && user.dietaryPreference !== 'all' && (
              <span className="menu-count__pref">
                Profile preference: <strong className="gold">{user.dietaryPreference}</strong>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="menu-error">
            <p>⚠️ {error}</p>
            <Tooltip content="Retry fetching menu data" position="top">
              <button className="btn btn-outline" onClick={() => fetchMenu()}>Retry</button>
            </Tooltip>
          </div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty-state">
            <svg className="menu-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v3m0 0a8 8 0 00-8 8h16a8 8 0 00-8-8zM4 14h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            </svg>
            <h3 className="menu-empty-title">No Dishes Match Your Selection</h3>
            <p className="menu-empty-desc">
              We couldn't find any items matching your selected criteria. Try adjusting your dietary preferences or clearing your search.
            </p>
            <button className="btn-reset-filters" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-3" style={{ paddingBottom: 'var(--space-3xl)' }}>
            {filtered.map((item) => (
              <MenuCard key={item._id || item.id} item={item} />
            ))}
          </div>
        )}

        {/* Executive Chef Culinary Philosophy Editorial Spread */}
        <section className="chef-editorial-spread">
          <div className="editorial-watermark">“</div>

          <div className="editorial-grid">
            {/* Left Column: Title & Heritage */}
            <div className="editorial-header-col">
              <span className="section-label">Culinary Philosophy</span>
              <h2 className="editorial-main-title">The Philosophy Behind Every Plate</h2>
              <div className="editorial-accent-line" />
              <span className="editorial-subtitle-tag">Artisanal Excellence since 2026</span>
            </div>

            {/* Right Column: Hero Quote & Signature */}
            <div className="editorial-quote-col">
              <blockquote className="editorial-quote-body">
                "Cooking is an art, but hospitality is an emotion. Every plate served at The Lighthouse is crafted with passion, precision, and the finest seasonal ingredients."
              </blockquote>

              <div className="editorial-signature-block">
                <div className="signature-insignia">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 4v2m0 0a7 7 0 017 7H5a7 7 0 017-7zm-8 9h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="signature-details">
                  <span className="signature-script">Julian Vance</span>
                  <span className="signature-name">Chef Julian Vance</span>
                  <span className="signature-title">Executive Chef & Culinary Director</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Menu;
import { useState } from 'react';

const CHEF_SELECTIONS = [
  "Chef's Special",
  "Executive Signature",
  "Sommelier Choice",
  "Artisanal Recipe",
  "Seasonal Highlight",
  "Masterclass Creation"
];

const FLAVOR_PROFILES = [
  "Smoky & Rich",
  "Tangy & Zesty",
  "Velvety & Creamy",
  "Spicy & Fiery",
  "Umami Savory",
  "Fresh & Herbaceous",
  "Sweet & Delicate"
];

const DINING_OCCASIONS = [
  "Romantic Dinner",
  "Family Feast",
  "Quick & Light Bite",
  "Celebration & Gala",
  "Late Night Indulgence",
  "Executive Business Lunch"
];

const CurateYourDining = ({
  selectedChef,
  onSelectChef,
  selectedFlavor,
  onSelectFlavor,
  selectedOccasion,
  onSelectOccasion,
  onResetCuration
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilters = [];
  if (selectedChef !== 'all') activeFilters.push(selectedChef);
  if (selectedFlavor !== 'all') activeFilters.push(selectedFlavor);
  if (selectedOccasion !== 'all') activeFilters.push(selectedOccasion);

  const activeCount = activeFilters.length;

  return (
    <div className="curate-dining-container">
      <button
        type="button"
        className={`curate-dining-toggle ${isExpanded ? 'active' : ''} ${activeCount > 0 ? 'has-active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="curate-toggle-left">
          <span className="curate-toggle-icon">✨</span>
          <span className="curate-toggle-title">
            Curate Your Dining
            {activeCount > 0 && (
              <span className="curate-header-summary">
                {' • '}{activeFilters.join(' • ')}
              </span>
            )}
          </span>
          {activeCount > 0 && (
            <span className="curate-active-badge">{activeCount} active</span>
          )}
        </div>
        <span className="curate-toggle-arrow">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Active Filter Summary Bar */}
      {activeCount > 0 && (
        <div className="curate-active-bar">
          <span className="curate-active-label">Active Curation:</span>
          <div className="curate-active-tags">
            {selectedChef !== 'all' && (
              <button
                type="button"
                className="curate-active-chip"
                onClick={() => onSelectChef('all')}
                title="Remove Chef's Selection filter"
              >
                <span>👨‍🍳 {selectedChef}</span>
                <span className="chip-remove">✕</span>
              </button>
            )}
            {selectedFlavor !== 'all' && (
              <button
                type="button"
                className="curate-active-chip"
                onClick={() => onSelectFlavor('all')}
                title="Remove Flavor Profile filter"
              >
                <span>🌶️ {selectedFlavor}</span>
                <span className="chip-remove">✕</span>
              </button>
            )}
            {selectedOccasion !== 'all' && (
              <button
                type="button"
                className="curate-active-chip"
                onClick={() => onSelectOccasion('all')}
                title="Remove Dining Occasion filter"
              >
                <span>🍷 {selectedOccasion}</span>
                <span className="chip-remove">✕</span>
              </button>
            )}
            <button
              type="button"
              className="curate-clear-all-btn"
              onClick={onResetCuration}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="curate-dining-drawer">
          <div className="curate-section">
            <div className="curate-section-header">
              <span className="curate-icon">👨‍🍳</span>
              <span className="curate-label">Chef's Selection</span>
            </div>
            <div className="curate-pills">
              <button
                type="button"
                className={`curate-pill ${selectedChef === 'all' ? 'active' : ''}`}
                onClick={() => onSelectChef('all')}
              >
                All Selections
              </button>
              {CHEF_SELECTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`curate-pill ${selectedChef === item ? 'active' : ''}`}
                  onClick={() => onSelectChef(selectedChef === item ? 'all' : item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="curate-section">
            <div className="curate-section-header">
              <span className="curate-icon">🌶️</span>
              <span className="curate-label">Flavor Profile</span>
            </div>
            <div className="curate-pills">
              <button
                type="button"
                className={`curate-pill ${selectedFlavor === 'all' ? 'active' : ''}`}
                onClick={() => onSelectFlavor('all')}
              >
                All Flavors
              </button>
              {FLAVOR_PROFILES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`curate-pill ${selectedFlavor === item ? 'active' : ''}`}
                  onClick={() => onSelectFlavor(selectedFlavor === item ? 'all' : item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="curate-section">
            <div className="curate-section-header">
              <span className="curate-icon">🍷</span>
              <span className="curate-label">Dining Occasion</span>
            </div>
            <div className="curate-pills">
              <button
                type="button"
                className={`curate-pill ${selectedOccasion === 'all' ? 'active' : ''}`}
                onClick={() => onSelectOccasion('all')}
              >
                All Occasions
              </button>
              {DINING_OCCASIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`curate-pill ${selectedOccasion === item ? 'active' : ''}`}
                  onClick={() => onSelectOccasion(selectedOccasion === item ? 'all' : item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <div className="curate-actions">
              <button
                type="button"
                className="curate-reset-btn"
                onClick={onResetCuration}
              >
                ↺ Reset Curation Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurateYourDining;

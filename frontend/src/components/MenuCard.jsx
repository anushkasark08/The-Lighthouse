import { toggleAvailability } from '../api/menuApi';
import { getMenuItems } from '../api/menuApi';
import { getReviews } from '../api/reviewApi';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { useReservation } from '../context/ReservationContext';
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';

const TAG_LABELS = {
  'seasonal':     { label: 'Seasonal', icon: '🍃' },
  'chef-special': { label: "Chef's Special", icon: '👨‍🍳' },
  'popular':      { label: 'Popular', icon: '⭐' },
  'new':          { label: 'New', icon: '✨' },
  'spicy':        { label: 'Spicy', icon: '🌶️' }
};

// Fallback cooking-request options, used when a menu item doesn't yet carry
// its own `cookingOptions` from the backend. Once MenuItem documents store
// owner-configured options per item/category, those take priority (see
// `cookingOptions` below) and this map is only a safety net.
const DEFAULT_COOKING_OPTIONS_BY_CATEGORY = {
  breakfast: ['Mild', 'Medium Spicy', 'Too Spicy', 'Extra Crispy', 'No Onions', 'No Garlic'],
  lunch:     ['Mild', 'Medium Spicy', 'Too Spicy', 'No Onions', 'No Garlic', 'Less Oil'],
  dinner:    ['Mild', 'Medium Spicy', 'Too Spicy', 'No Onions', 'No Garlic', 'Less Oil'],
  desserts:  ['Less Sweet', 'Extra Sweet', 'No Nuts'],
  drinks:    ['Less Sweet', 'Extra Ice', 'No Ice']
};

const DEFAULT_MAX_INSTRUCTIONS_LENGTH = 120;

const MenuCard = ({ item }) => {
  const { updateItem } = useMenu();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { reservationDetails, preOrder, addToPreOrder, updatePreOrderQuantity, hasActiveBookingDetails } = useReservation();
  const [toggling, setToggling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dishReviews, setDishReviews] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cooking Request customization state (per open modal instance)
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  const isAdmin = user?.role === 'admin';
  const itemId = item._id || item.id;

  const preOrderItem = preOrder.find(p => (p.menuItem._id || p.menuItem.id) === itemId);
  const quantity = preOrderItem ? preOrderItem.quantity : 0;

  const handlePreOrderAction = (event) => {
    event.stopPropagation();
    if (!hasActiveBookingDetails()) {
      alert("Please select your reservation date and time first so we can check kitchen availability for that day!");
      navigate('/reserve');
      return;
    }
    addToPreOrder(item);
  };

  const handleIncrement = (event) => {
    event.stopPropagation();
    updatePreOrderQuantity(itemId, quantity + 1);
  };

  const handleDecrement = (event) => {
    event.stopPropagation();
    updatePreOrderQuantity(itemId, quantity - 1);
  };

  // Owner-configured options win if present on the item; otherwise fall
  // back to sensible category defaults so the feature works even before
  // every dish has been configured.
  const cookingOptions = item.cookingOptions?.length
    ? item.cookingOptions
    : (DEFAULT_COOKING_OPTIONS_BY_CATEGORY[item.category] || DEFAULT_COOKING_OPTIONS_BY_CATEGORY.dinner);
  const allowCustomInstructions = item.allowCustomInstructions !== false;
  const maxInstructionsLength = item.customInstructionsMaxLength || DEFAULT_MAX_INSTRUCTIONS_LENGTH;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const [{ data: reviewData }, { data: menuData }] = await Promise.all([
          getReviews(),
          getMenuItems({ category: item.category })
        ]);

        if (!isMounted) return;

        const related = (menuData.data || [])
          .filter((menuItem) => menuItem._id !== item._id && menuItem.category === item.category)
          .slice(0, 3);

        const filteredReviews = (reviewData.data || []).filter((review) => {
          const reviewMenuId = review.menuItem?._id || review.menuItem;
          return reviewMenuId === item._id || reviewMenuId === item.id;
        });

        setDishReviews(filteredReviews);
        setRelatedItems(related);
      } catch (error) {
        console.error('Failed to load dish details', error);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => { isMounted = false; };
  }, [isOpen, item._id, item.category, item.id]);

  const handleToggle = async (event) => {
    event.stopPropagation();
    setToggling(true);
    try {
      const { data } = await toggleAvailability(item._id);
      updateItem(data.data);
    } catch (err) {
      console.error('Toggle failed', err);
    } finally {
      setToggling(false);
    }
  };

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedOptions([]);
    setCustomInstructions('');
    setQuantity(1);
    setAddError(null);
  };

  const toggleCookingOption = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    if (!item.isAvailable) return;

    setAddError(null);
    setAdding(true);
    try {
      await addToCart(item, {
        quantity,
        selectedCookingOptions: selectedOptions,
        customInstructions
      });

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
      setSelectedOptions([]);
      setCustomInstructions('');
      setQuantity(1);
    } catch (err) {
      setAddError(err.response?.data?.error || 'Could not add this to your cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // Quick-add from the card itself, without opening the customization modal
  const handleQuickAdd = async (event) => {
    event.stopPropagation();
    if (!item.isAvailable) return;
    try {
      await addToCart(item, { quantity: 1 });
    } catch (err) {
      console.error('Quick add failed', err);
    }
  };

  return (
    <>
      <article
        className={`menu-card card ${!item.isAvailable ? 'menu-card--unavailable' : ''}`}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="menu-card__image-wrap">
          <img
            src={item.image || '/images/dinner.jpg'}
            alt={item.name}
            className="menu-card__image"
            onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
          />

          <Tooltip content={item.isAvailable ? "Available today" : "Sold out today"} position="top">
            <div className={`menu-card__avail-badge ${item.isAvailable ? 'available' : 'sold-out'}`}>
              <span className={`avail-dot ${item.isAvailable ? 'available' : 'unavailable'}`} />
              {item.isAvailable ? 'Available' : 'Sold Out'}
            </div>
          </Tooltip>

          <Tooltip content={item.isVeg ? 'Vegetarian dish' : 'Non-Vegetarian dish'} position="bottom">
            <div className={`menu-card__diet-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
          </Tooltip>
        </div>

        <div className="menu-card__body">
          <div className="menu-card__tags">
            {(item.tags || []).map((tag) => (
              <Tooltip key={tag} content={`${TAG_LABELS[tag]?.label || tag} dish`} position="top">
                <span className="badge badge-gold">
                  {TAG_LABELS[tag]?.icon} {TAG_LABELS[tag]?.label || tag}
                </span>
              </Tooltip>
            ))}
          </div>

          <h3 className="menu-card__name">{item.name}</h3>
          <p className="menu-card__desc">{item.description}</p>

          <div className="menu-card__footer">
            <span className="menu-card__price">₹{item.price}</span>
            <Tooltip content={`Preparation time: ${item.preparationTime} minutes`} position="top">
              <span className="menu-card__time">⏱ {item.preparationTime} min</span>
            </Tooltip>
          </div>

          <Tooltip content={item.isAvailable ? 'Add to cart, or open dish for cooking requests' : 'Currently sold out'} position="top">
            <button
              type="button"
              className="menu-card__quick-add"
              onClick={handleQuickAdd}
              disabled={!item.isAvailable}
            >
              + Add
            </button>
          </Tooltip>

          {isAdmin && (
            <div className="menu-card__admin" onClick={(event) => event.stopPropagation()}>
              <Tooltip content={item.isAvailable ? "Mark as sold out" : "Mark as available"} position="top">
                <span className="menu-card__admin-label">
                  {item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                </span>
              </Tooltip>
              <Tooltip content="Toggle dish availability" position="top">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={handleToggle}
                    disabled={toggling}
                  />
                  <span className="toggle-slider" />
                </label>
              </Tooltip>
            </div>
          )}
        </div>

        <style>{`
          .menu-card__preorder-row {
            margin-top: var(--space-md);
            border-top: 1px dashed var(--color-border);
            padding-top: var(--space-md);
            display: flex;
            justify-content: stretch;
            align-items: center;
          }
          .btn-preorder {
            width: 100%;
            padding: var(--space-sm) var(--space-md);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
          }
          .preorder-controls {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: space-between;
            border: 1px solid var(--color-primary);
            border-radius: var(--radius-md);
            background: rgba(201, 169, 98, 0.04);
            overflow: hidden;
          }
          .preorder-btn {
            background: none;
            border: none;
            color: var(--color-primary);
            font-size: 1.2rem;
            width: 40px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background var(--transition);
          }
          .preorder-btn:hover {
            background: rgba(201, 169, 98, 0.12);
          }
          .preorder-qty {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-text);
          }

          .menu-card { position: relative; display: flex; flex-direction: column; cursor: pointer; transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition); }
          .menu-card:hover { transform: translateY(-4px); border-color: var(--color-border-hover); box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
          .menu-card--unavailable { opacity: 0.6; }
          .menu-card--unavailable .menu-card__image { filter: grayscale(60%); }
          .menu-card__image-wrap { position: relative; overflow: hidden; height: 200px; }
          .menu-card__image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
          .menu-card:hover .menu-card__image { transform: scale(1.05); }

          .menu-card__avail-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: var(--radius-full);
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            backdrop-filter: blur(8px);
          }
          .menu-card__avail-badge.available { background: rgba(76,175,125,0.2); color: var(--color-success); border: 1px solid rgba(76,175,125,0.3); }
          .menu-card__avail-badge.sold-out  { background: rgba(120,120,120,0.25); color: var(--color-text-muted); border: 1px solid rgba(120,120,120,0.3); }

          .menu-card__diet-dot {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            border: 2px solid;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .menu-card__diet-dot::after {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .menu-card__diet-dot.veg    { border-color: var(--color-success); }
          .menu-card__diet-dot.veg::after { background: var(--color-success); }
          .menu-card__diet-dot.nonveg { border-color: var(--color-error); }
          .menu-card__diet-dot.nonveg::after { background: var(--color-error); }

          .menu-card__body { padding: var(--space-lg); flex: 1; display: flex; flex-direction: column; gap: var(--space-sm); }
          .menu-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
          .menu-card__name { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text); }
          .menu-card__desc { font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.5; flex: 1; }
          .menu-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
          .menu-card__price { font-family: var(--font-serif); font-size: 1.4rem; color: var(--color-primary); }
          .menu-card__time  { font-size: 0.75rem; color: var(--color-text-faint); }

          .menu-card__admin {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: var(--space-md);
            border-top: 1px dashed var(--color-border);
          }
          .menu-card__admin-label { font-size: 0.75rem; color: var(--color-text-faint); }

          .menu-card__quick-add {
            margin-top: var(--space-sm);
            width: 100%;
            padding: 0.55rem 0;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border-hover);
            background: rgba(201, 169, 98, 0.08);
            color: var(--color-primary-light);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background var(--transition), border-color var(--transition);
          }
          .menu-card__quick-add:hover:not(:disabled) { background: rgba(201, 169, 98, 0.18); }
          .menu-card__quick-add:disabled { opacity: 0.4; cursor: not-allowed; }

          .menu-card-detail__backdrop {
            position: fixed;
            inset: 0;
            background: rgba(6, 6, 6, 0.78);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-xl);
            z-index: 2000;
          }
          .menu-card-detail {
            width: min(900px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 18px 60px rgba(0,0,0,0.4);
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
          }
          .menu-card-detail__media { position: relative; min-height: 320px; }
          .menu-card-detail__image { width: 100%; height: 100%; object-fit: cover; }
          .menu-card-detail__content { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-lg); }
          .menu-card-detail__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); }
          .menu-card-detail__title { font-family: var(--font-serif); font-size: 1.8rem; color: var(--color-text); margin: 0.3rem 0 0.2rem; }
          .menu-card-detail__subtitle { font-size: 0.82rem; color: var(--color-text-faint); text-transform: capitalize; }
          .menu-card-detail__price-pill { background: rgba(201,169,98,0.14); border: 1px solid rgba(201,169,98,0.28); color: var(--color-primary); padding: 0.6rem 0.95rem; border-radius: var(--radius-full); font-weight: 600; white-space: nowrap; }
          .menu-card-detail__desc { color: var(--color-text-muted); line-height: 1.8; font-size: 0.96rem; }
          .menu-card-detail__meta { display: flex; flex-wrap: wrap; gap: 0.6rem; }
          .menu-card-detail__tag { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.8rem; border-radius: var(--radius-full); background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 0.8rem; }
          .menu-card-detail__tag.veg { color: var(--color-success); border-color: rgba(76,175,125,0.25); }
          .menu-card-detail__tag.nonveg { color: var(--color-error); border-color: rgba(224,92,92,0.2); }
          .menu-card-detail__reviews { display: flex; flex-direction: column; gap: 0.8rem; }
          .menu-card-detail__reviews h4 { font-family: var(--font-serif); font-size: 1.1rem; color: var(--color-text); margin: 0; }
          .menu-card-detail__review { padding: 0.9rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
          .menu-card-detail__review strong { color: var(--color-text); }
          .menu-card-detail__review p { margin-top: 0.35rem; color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.6; }
          .menu-card-detail__related { display: flex; flex-wrap: wrap; gap: 0.75rem; }
          .menu-card-detail__related-item { padding: 0.7rem 0.85rem; border-radius: var(--radius-md); background: rgba(201,169,98,0.08); color: var(--color-primary); font-size: 0.88rem; border: 1px solid rgba(201,169,98,0.16); }
          .menu-card-detail__close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0,0,0,0.4);
            color: var(--color-text);
            font-size: 1.25rem;
            cursor: pointer;
          }
          @media (max-width: 768px) {
            .menu-card-detail { grid-template-columns: 1fr; }
            .menu-card-detail__media { min-height: 240px; }
            .menu-card-detail__content { padding: var(--space-lg); }
          }

          .cooking-request {
            padding: var(--space-md);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            background: rgba(255,255,255,0.03);
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
          }
          .cooking-request__heading { font-family: var(--font-serif); font-size: 1.05rem; color: var(--color-text); margin: 0; }
          .cooking-request__hint { font-size: 0.82rem; color: var(--color-text-muted); margin: -0.2rem 0 0; }
          .cooking-request__options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .cooking-request__chip {
            padding: 0.4rem 0.85rem;
            border-radius: var(--radius-full);
            border: 1px solid var(--color-border);
            background: transparent;
            color: var(--color-text-muted);
            font-size: 0.82rem;
            cursor: pointer;
            transition: all var(--transition);
          }
          .cooking-request__chip:hover { border-color: var(--color-border-hover); color: var(--color-text); }
          .cooking-request__chip--active {
            background: rgba(201, 169, 98, 0.16);
            border-color: var(--color-primary);
            color: var(--color-primary-light);
          }
          .cooking-request__notes { display: flex; flex-direction: column; gap: 0.3rem; }
          .cooking-request__textarea {
            width: 100%;
            resize: vertical;
            background: var(--color-bg-elevated);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text);
            padding: 0.6rem 0.75rem;
            font-family: var(--font-sans);
            font-size: 0.85rem;
          }
          .cooking-request__textarea:focus { outline: none; border-color: var(--color-primary); }
          .cooking-request__count { align-self: flex-end; font-size: 0.72rem; color: var(--color-text-faint); }

          .qty-stepper { display: inline-flex; align-items: center; gap: 0.9rem; border: 1px solid var(--color-border); border-radius: var(--radius-full); padding: 0.35rem 0.9rem; }
          .qty-stepper button { border: none; background: transparent; color: var(--color-text); font-size: 1.1rem; cursor: pointer; width: 20px; }
          .qty-stepper span { min-width: 18px; text-align: center; color: var(--color-text); font-size: 0.95rem; }

          .menu-card-detail__add-row { display: flex; align-items: center; gap: var(--space-md); }
          .menu-card-detail__add-btn { flex: 1; }
          .cooking-request__error { color: var(--color-error); font-size: 0.85rem; margin: -0.4rem 0 0; }
        `}</style>
      </article>

      {isOpen && (
        <div className="menu-card-detail__backdrop" onClick={handleClose}>
          <div className="menu-card-detail" onClick={(event) => event.stopPropagation()}>
            <div className="menu-card-detail__media">
              <img
                src={item.image || '/images/dinner.jpg'}
                alt={item.name}
                className="menu-card-detail__image"
                onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
              />
              <button type="button" className="menu-card-detail__close" onClick={handleClose} aria-label="Close dish details">×</button>
            </div>
            <div className="menu-card-detail__content">
              <div className="menu-card-detail__header">
                <div>
                  <span className="section-label">Dish Details</span>
                  <h3 className="menu-card-detail__title">{item.name}</h3>
                  <p className="menu-card-detail__subtitle">{item.category} • {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                </div>
                <div className="menu-card-detail__price-pill">₹{item.price}</div>
              </div>

              <p className="menu-card-detail__desc">{item.description}</p>

              <div className="menu-card-detail__meta">
                <span className={`menu-card-detail__tag ${item.isVeg ? 'veg' : 'nonveg'}`}>
                  {item.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
                </span>
                <span className="menu-card-detail__tag">⏱ {item.preparationTime} min</span>
                <span className="menu-card-detail__tag">{item.category}</span>
                {(item.chefSelection || []).map((cs) => (
                  <span key={cs} className="menu-card-detail__tag">👨‍🍳 {cs}</span>
                ))}
                {(item.flavorProfile || []).map((fp) => (
                  <span key={fp} className="menu-card-detail__tag">🌶️ {fp}</span>
                ))}
                {(item.diningOccasion || []).map((doOcc) => (
                  <span key={doOcc} className="menu-card-detail__tag">🍷 {doOcc}</span>
                ))}
              </div>

              <div className="cooking-request">
                <h4 className="cooking-request__heading">🍳 Cooking Request</h4>
                <p className="cooking-request__hint">Let the kitchen know how you'd like this prepared.</p>

                <div className="cooking-request__options">
                  {cookingOptions.map((option) => {
                    const active = selectedOptions.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`cooking-request__chip ${active ? 'cooking-request__chip--active' : ''}`}
                        onClick={() => toggleCookingOption(option)}
                        aria-pressed={active}
                      >
                        {active ? '✓ ' : ''}{option}
                      </button>
                    );
                  })}
                </div>

                {allowCustomInstructions && (
                  <div className="cooking-request__notes">
                    <textarea
                      className="cooking-request__textarea"
                      placeholder="Any other instructions? e.g. no coriander, mild spice"
                      value={customInstructions}
                      maxLength={maxInstructionsLength}
                      onChange={(event) => setCustomInstructions(event.target.value)}
                      rows={2}
                    />
                    <span className="cooking-request__count">
                      {customInstructions.length}/{maxInstructionsLength}
                    </span>
                  </div>
                )}
              </div>

              <div className="menu-card-detail__add-row">
                <div className="qty-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary menu-card-detail__add-btn"
                  onClick={handleAddToCart}
                  disabled={!item.isAvailable || adding}
                >
                  {adding ? 'Adding…' : justAdded ? '✓ Added to Cart' : `Add to Cart · ₹${item.price * quantity}`}
                </button>
              </div>

              {addError && <p className="cooking-request__error">⚠️ {addError}</p>}

              <div className="menu-card-detail__reviews">
                <h4>Guest reviews</h4>
                {loadingDetails ? (
                  <p className="menu-card-detail__desc">Loading reviews...</p>
                ) : dishReviews.length > 0 ? (
                  dishReviews.slice(0, 3).map((review, index) => (
                    <div
                      key={review._id || `${review.user?.name || 'guest'}-${index}`}
                      className="menu-card-detail__review"
                    >
                      <strong>{review.user?.name || 'Guest'}</strong>
                      <p>“{review.comment}”</p>
                    </div>
                  ))
                ) : (
                  <p className="menu-card-detail__desc">No reviews yet for this dish.</p>
                )}
              </div>

              {relatedItems.length > 0 && (
                <div className="menu-card-detail__reviews">
                  <h4>Related dishes</h4>
                  <div className="menu-card-detail__related">
                    {relatedItems.map((relatedItem, index) => (
                      <span
                        key={relatedItem._id || `${relatedItem.name || 'related'}-${index}`}
                        className="menu-card-detail__related-item"
                      >
                        {relatedItem.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCard;
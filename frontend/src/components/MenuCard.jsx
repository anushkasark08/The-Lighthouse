import { toggleAvailability } from '../api/menuApi';
import { getMenuItems } from '../api/menuApi';
import { getReviews } from '../api/reviewApi';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useReservation } from '../context/ReservationContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { preOrder, addToPreOrder, updatePreOrderQuantity, hasActiveBookingDetails } = useReservation();

  const [toggling, setToggling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dishReviews, setDishReviews] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Toppings / variant customization
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
  const preOrderQty = preOrderItem ? preOrderItem.quantity : 0;

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
    updatePreOrderQuantity(itemId, preOrderQty + 1);
  };

  const handleDecrement = (event) => {
    event.stopPropagation();
    updatePreOrderQuantity(itemId, preOrderQty - 1);
  };

  // Owner-configured options win if present on the item; otherwise fall
  // back to sensible category defaults so the feature works even before
  // every dish has been configured.
  const cookingOptions = item.cookingOptions?.length
    ? item.cookingOptions
    : (DEFAULT_COOKING_OPTIONS_BY_CATEGORY[item.category] || DEFAULT_COOKING_OPTIONS_BY_CATEGORY.dinner);
  const allowCustomInstructions = item.allowCustomInstructions !== false;
  const maxInstructionsLength = item.customInstructionsMaxLength || DEFAULT_MAX_INSTRUCTIONS_LENGTH;

  const hasToppingsOrVariants =
    (item.customizations?.toppings?.length > 0) || (item.customizations?.variants?.length > 0);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Reset customization state fresh every time the modal opens for this item
  useEffect(() => {
    if (!isOpen) return;
    setSelectedToppings([]);
    setSelectedVariant(item.customizations?.variants?.[0] || null);
    setSelectedOptions([]);
    setCustomInstructions('');
    setQuantity(1);
    setJustAdded(false);
    setAddError(null);
  }, [isOpen, item._id, item.customizations?.variants]);

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
    setSelectedToppings([]);
    setQuantity(1);
    setAddError(null);
  };

  const toggleCookingOption = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.name === topping.name);
      if (exists) return prev.filter((t) => t.name !== topping.name);
      if (item.customizations?.allowMultipleToppings === false) return [topping];
      return [...prev, topping];
    });
  };

  // ---- Pricing ----
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const variantModifier = selectedVariant?.priceModifier || 0;
  const unitPrice = item.price + toppingsTotal + variantModifier;
  const finalPrice = unitPrice * quantity;

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    if (!item.isAvailable) return;

    setAddError(null);
    setAdding(true);
    try {
      await addToCart(item, {
        quantity,
        unitPrice,
        selectedToppings,
        selectedVariant,
        selectedCookingOptions: selectedOptions,
        customInstructions
      });

      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        setIsOpen(false);
      }, 900);
      setSelectedOptions([]);
      setCustomInstructions('');
      setSelectedToppings([]);
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
      await addToCart(item, { quantity: 1, unitPrice: item.price });
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

          <div className="menu-card__preorder-row" onClick={(event) => event.stopPropagation()}>
            {preOrderQty > 0 ? (
              <div className="preorder-controls">
                <button type="button" className="preorder-btn" onClick={handleDecrement} aria-label="Decrease pre-order quantity">−</button>
                <span className="preorder-qty">{preOrderQty} added for your reservation</span>
                <button type="button" className="preorder-btn" onClick={handleIncrement} aria-label="Increase pre-order quantity">+</button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-preorder"
                onClick={handlePreOrderAction}
                disabled={!item.isAvailable}
              >
                Pre-order for Reservation
              </button>
            )}
          </div>

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

          .menu-card-detail__customize { display: flex; flex-direction: column; gap: 0.9rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
          .menu-card-detail__customize h4 { font-family: var(--font-serif); font-size: 1.05rem; color: var(--color-text); margin: 0; }
          .customize__group { display: flex; flex-direction: column; gap: 0.5rem; }
          .customize__label { font-size: 0.75rem; color: var(--color-text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
          .customize__options { display: flex; flex-wrap: wrap; gap: 0.7rem 1.1rem; }
          .customize__option { display: flex; align-items: center; gap: 0.45rem; font-size: 0.9rem; color: var(--color-text-muted); cursor: pointer; }
          .customize__option input { accent-color: var(--color-primary); cursor: pointer; }
          .customize__quantity { display: flex; align-items: center; gap: 0.9rem; }
          .customize__quantity button {
            width: 30px; height: 30px; border-radius: 50%;
            border: 1px solid var(--color-border); background: transparent;
            color: var(--color-text); font-size: 1rem; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: border-color var(--transition), background var(--transition);
          }
          .customize__quantity button:hover { border-color: var(--color-primary); background: rgba(201,169,98,0.08); }
          .customize__quantity span { min-width: 20px; text-align: center; font-weight: 600; color: var(--color-text); }
          .customize__total {
            display: flex; justify-content: space-between; align-items: center;
            padding-top: 0.75rem; border-top: 1px dashed var(--color-border);
          }
          .customize__total span { font-size: 0.85rem; color: var(--color-text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
          .customize__total strong { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-primary); }
          .customize__add-btn { width: 100%; transition: background var(--transition), transform var(--transition); }
          .customize__add-btn:disabled { opacity: 0.75; cursor: default; }

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
              </div>

              <div className="menu-card-detail__customize" onClick={(event) => event.stopPropagation()}>
                {hasToppingsOrVariants && <h4>Customize your dish</h4>}

                {item.customizations?.variants?.length > 0 && (
                  <div className="customize__group">
                    <span className="customize__label">Choose size / variant</span>
                    <div className="customize__options">
                      {item.customizations.variants.map((variant) => (
                        <label key={variant.name} className="customize__option">
                          <input
                            type="radio"
                            name={`variant-${item._id}`}
                            checked={selectedVariant?.name === variant.name}
                            onChange={() => setSelectedVariant(variant)}
                          />
                          {variant.name}
                          {variant.priceModifier > 0 && <span>&nbsp;(+₹{variant.priceModifier})</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {item.customizations?.toppings?.length > 0 && (
                  <div className="customize__group">
                    <span className="customize__label">Add-ons / toppings</span>
                    <div className="customize__options">
                      {item.customizations.toppings.map((topping) => (
                        <label key={topping.name} className="customize__option">
                          <input
                            type={item.customizations?.allowMultipleToppings === false ? 'radio' : 'checkbox'}
                            name={item.customizations?.allowMultipleToppings === false ? `topping-${item._id}` : undefined}
                            checked={selectedToppings.some((t) => t.name === topping.name)}
                            onChange={() => toggleTopping(topping)}
                          />
                          {topping.name}&nbsp;(+₹{topping.price})
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="cooking-request">
                  <h4 className="cooking-request__heading">Cooking request</h4>
                  <p className="cooking-request__hint">Let the kitchen know how you'd like it prepared.</p>
                  <div className="cooking-request__options">
                    {cookingOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`cooking-request__chip ${selectedOptions.includes(option) ? 'cooking-request__chip--active' : ''}`}
                        onClick={() => toggleCookingOption(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {allowCustomInstructions && (
                    <div className="cooking-request__notes">
                      <textarea
                        className="cooking-request__textarea"
                        rows={2}
                        placeholder="Any other special instructions?"
                        value={customInstructions}
                        maxLength={maxInstructionsLength}
                        onChange={(event) => setCustomInstructions(event.target.value)}
                      />
                      <span className="cooking-request__count">
                        {customInstructions.length}/{maxInstructionsLength}
                      </span>
                    </div>
                  )}
                </div>

                <div className="customize__quantity">
                  <span className="customize__label">Quantity</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="customize__total">
                  <span>Total</span>
                  <strong>₹{finalPrice}</strong>
                </div>

                {addError && <p className="cooking-request__error">{addError}</p>}

                <button
                  type="button"
                  className="btn btn-primary customize__add-btn"
                  onClick={handleAddToCart}
                  disabled={justAdded || adding || !item.isAvailable}
                >
                  {justAdded ? 'Added ✓' : !item.isAvailable ? 'Currently Sold Out' : adding ? 'Adding…' : `Add to Cart — ₹${finalPrice}`}
                </button>
              </div>

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

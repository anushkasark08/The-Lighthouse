import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [actionError, setActionError] = useState(null);

  if (!isOpen) return null;

  const handleRemove = async (cartLineId, name) => {
    try {
      setActionError(null);
      await removeFromCart(cartLineId);
    } catch (err) {
      setActionError(err.response?.data?.error || `Could not remove ${name}. Please try again.`);
    }
  };

  const handleQuantityChange = async (cartLineId, quantity) => {
    try {
      setActionError(null);
      await updateQuantity(cartLineId, quantity);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not update quantity. Please try again.');
    }
  };

  // Rendered via a portal straight into document.body. The navbar applies
  // `backdrop-filter` to itself once scrolled, and CSS containing-block
  // rules mean any `position: fixed` descendant of an element with
  // backdrop-filter/filter/transform gets trapped inside that element's own
  // box instead of the viewport. Since this drawer is triggered from a
  // button inside <Navbar>, rendering it in place would get it clipped to
  // the navbar's ~80px height. The portal sidesteps that entirely.
  return createPortal(
    <div className="cart-drawer__backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="cart-drawer__header">
          <h3>Your Order</h3>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {actionError && <p className="cart-drawer__error">⚠️ {actionError}</p>}
          {cartItems.length === 0 ? (
            <p className="cart-drawer__empty">Your cart is empty. Add a dish from the menu to get started.</p>
          ) : (
            cartItems.map((line) => (
              <div key={line.cartLineId} className="cart-line">
                <img
                  src={line.image || '/images/dinner.jpg'}
                  alt={line.name}
                  className="cart-line__image"
                  onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
                />
                <div className="cart-line__details">
                  <div className="cart-line__top">
                    <span className="cart-line__name">{line.name}</span>
                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => handleRemove(line.cartLineId, line.name)}
                      aria-label={`Remove ${line.name}`}
                    >
                      ×
                    </button>
                  </div>

                  {line.selectedCookingOptions.length > 0 && (
                    <div className="cart-line__options">
                      {line.selectedCookingOptions.map((opt) => (
                        <span key={opt} className="cart-line__option-chip">{opt}</span>
                      ))}
                    </div>
                  )}

                  {line.customInstructions && (
                    <p className="cart-line__note">“{line.customInstructions}”</p>
                  )}

                  <div className="cart-line__bottom">
                    <div className="qty-stepper qty-stepper--sm">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.cartLineId, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.cartLineId, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-line__price">₹{line.price * line.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            <button type="button" className="btn btn-primary cart-drawer__checkout">
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>

      <style>{`
        .cart-drawer__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(6, 6, 6, 0.6);
          backdrop-filter: blur(4px);
          z-index: 5000;
          display: flex;
          justify-content: flex-end;
        }
        .cart-drawer {
          width: min(420px, 100%);
          height: 100%;
          background: var(--color-bg-card);
          border-left: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          animation: cart-slide-in 0.25s ease;
        }
        @keyframes cart-slide-in {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .cart-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--color-border);
        }
        .cart-drawer__header h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--color-text);
        }
        .cart-drawer__close {
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }
        .cart-drawer__body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .cart-drawer__empty {
          color: var(--color-text-muted);
          text-align: center;
          padding: var(--space-2xl) var(--space-md);
        }
        .cart-drawer__error {
          color: var(--color-error);
          font-size: 0.85rem;
          background: rgba(224, 92, 92, 0.08);
          border: 1px solid rgba(224, 92, 92, 0.25);
          border-radius: var(--radius-md);
          padding: 0.6rem 0.8rem;
        }
        .cart-line {
          display: flex;
          gap: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px dashed var(--color-border);
        }
        .cart-line__image {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          object-fit: cover;
          flex-shrink: 0;
        }
        .cart-line__details { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
        .cart-line__top { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-sm); }
        .cart-line__name { font-family: var(--font-serif); font-size: 1.05rem; color: var(--color-text); }
        .cart-line__remove { border: none; background: transparent; color: var(--color-text-faint); font-size: 1.15rem; cursor: pointer; line-height: 1; }
        .cart-line__remove:hover { color: var(--color-error); }
        .cart-line__options { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .cart-line__option-chip {
          font-size: 0.72rem;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          background: rgba(201, 169, 98, 0.1);
          border: 1px solid rgba(201, 169, 98, 0.25);
          color: var(--color-primary-light);
        }
        .cart-line__note {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          font-style: italic;
        }
        .cart-line__bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 0.2rem; }
        .cart-line__price { font-family: var(--font-serif); color: var(--color-primary); font-size: 1.05rem; }

        .qty-stepper { display: inline-flex; align-items: center; gap: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-full); padding: 0.15rem 0.5rem; }
        .qty-stepper button { border: none; background: transparent; color: var(--color-text); font-size: 1rem; cursor: pointer; width: 20px; }
        .qty-stepper span { min-width: 16px; text-align: center; color: var(--color-text); font-size: 0.9rem; }
        .qty-stepper--sm { padding: 0.05rem 0.4rem; }

        .cart-drawer__footer {
          padding: var(--space-lg);
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .cart-drawer__total {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: var(--color-text);
        }
        .cart-drawer__checkout { width: 100%; }
      `}</style>
    </div>,
    document.body
  );
};

export default CartDrawer;
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="cart-drawer__backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="cart-drawer__header">
          <h3>Your Cart</h3>
          <button type="button" className="cart-drawer__close" onClick={onClose} aria-label="Close cart">×</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <p className="cart-drawer__empty-sub">Browse the menu and customize a dish to add it here.</p>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cartItems.map((cartItem) => (
                <div key={cartItem.cartItemId} className="cart-drawer__item">
                  <img
                    src={cartItem.image || '/images/dinner.jpg'}
                    alt={cartItem.name}
                    className="cart-drawer__item-image"
                    onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
                  />

                  <div className="cart-drawer__item-info">
                    <div className="cart-drawer__item-top">
                      <span className="cart-drawer__item-name">{cartItem.name}</span>
                      <button
                        type="button"
                        className="cart-drawer__item-remove"
                        onClick={() => removeFromCart(cartItem.cartItemId)}
                        aria-label={`Remove ${cartItem.name}`}
                      >
                        ×
                      </button>
                    </div>

                    {cartItem.selectedVariant && (
                      <span className="cart-drawer__item-detail">
                        {cartItem.selectedVariant.name}
                        {cartItem.selectedVariant.priceModifier > 0 && ` (+₹${cartItem.selectedVariant.priceModifier})`}
                      </span>
                    )}

                    {cartItem.selectedToppings?.length > 0 && (
                      <span className="cart-drawer__item-detail">
                        {cartItem.selectedToppings.map((t) => t.name).join(', ')}
                      </span>
                    )}

                    <div className="cart-drawer__item-bottom">
                      <div className="cart-drawer__qty">
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-drawer__item-price">₹{cartItem.unitPrice * cartItem.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <button type="button" className="cart-drawer__clear" onClick={clearCart}>
                Clear cart
              </button>
              <div className="cart-drawer__total">
                <span>Total</span>
                <strong>₹{cartTotal}</strong>
              </div>
              <button type="button" className="btn btn-primary cart-drawer__checkout" onClick={() => { onClose(); navigate('/reservation'); }}>
                Proceed to Reserve
              </button>
            </div>
          </>
        )}

        <style>{`
          .cart-drawer__backdrop {
            position: fixed;
            inset: 0;
            background: rgba(6, 6, 6, 0.6);
            backdrop-filter: blur(6px);
            z-index: 2100;
            display: flex;
            justify-content: flex-end;
          }
          .cart-drawer {
            width: min(420px, 100%);
            height: 100%;
            background: var(--color-bg-card);
            border-left: 1px solid var(--color-border);
            box-shadow: -18px 0 60px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            animation: cart-drawer-slide-in 0.25s ease;
          }
          @keyframes cart-drawer-slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
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
            margin: 0;
          }
          .cart-drawer__close {
            border: none;
            background: transparent;
            color: var(--color-text-muted);
            font-size: 1.5rem;
            cursor: pointer;
            line-height: 1;
          }
          .cart-drawer__empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            padding: var(--space-xl);
            text-align: center;
          }
          .cart-drawer__empty p { color: var(--color-text-muted); margin: 0; }
          .cart-drawer__empty-sub { font-size: 0.85rem; color: var(--color-text-faint); }

          .cart-drawer__items {
            flex: 1;
            overflow-y: auto;
            padding: var(--space-md) var(--space-lg);
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
          }
          .cart-drawer__item {
            display: flex;
            gap: var(--space-md);
            padding-bottom: var(--space-md);
            border-bottom: 1px solid var(--color-border);
          }
          .cart-drawer__item-image {
            width: 64px;
            height: 64px;
            border-radius: var(--radius-md);
            object-fit: cover;
            flex-shrink: 0;
          }
          .cart-drawer__item-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            min-width: 0;
          }
          .cart-drawer__item-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .cart-drawer__item-name {
            font-weight: 600;
            color: var(--color-text);
            font-size: 0.95rem;
          }
          .cart-drawer__item-remove {
            border: none;
            background: transparent;
            color: var(--color-text-faint);
            font-size: 1.1rem;
            cursor: pointer;
            line-height: 1;
            flex-shrink: 0;
          }
          .cart-drawer__item-remove:hover { color: var(--color-error); }
          .cart-drawer__item-detail {
            font-size: 0.78rem;
            color: var(--color-text-faint);
          }
          .cart-drawer__item-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.3rem;
          }
          .cart-drawer__qty {
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          .cart-drawer__qty button {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1px solid var(--color-border);
            background: transparent;
            color: var(--color-text);
            cursor: pointer;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cart-drawer__qty span {
            min-width: 16px;
            text-align: center;
            font-size: 0.85rem;
            color: var(--color-text);
          }
          .cart-drawer__item-price {
            font-weight: 600;
            color: var(--color-primary);
            font-size: 0.9rem;
          }

          .cart-drawer__footer {
            padding: var(--space-lg);
            border-top: 1px solid var(--color-border);
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
          }
          .cart-drawer__clear {
            border: none;
            background: transparent;
            color: var(--color-text-faint);
            font-size: 0.8rem;
            cursor: pointer;
            align-self: flex-start;
            text-decoration: underline;
          }
          .cart-drawer__total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
          }
          .cart-drawer__total span {
            font-size: 0.85rem;
            color: var(--color-text-faint);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .cart-drawer__total strong {
            font-family: var(--font-serif);
            font-size: 1.5rem;
            color: var(--color-primary);
          }
          .cart-drawer__checkout { width: 100%; }

          @media (max-width: 480px) {
            .cart-drawer { width: 100%; }
          }
        `}</style>
      </aside>
    </div>,
    document.body
  );
};

export default CartDrawer;
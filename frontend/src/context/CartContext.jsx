import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart
} from '../api/cartApi';

const CartContext = createContext(null);
const GUEST_STORAGE_KEY = 'lh_cart_guest';

// The backend returns cart lines with a populated `menuItem` object and a
// Mongo `_id` for the line itself. Normalize that (and the guest/local
// shape) into one consistent shape the rest of the app can rely on.
const normalizeLine = (line) => ({
  cartLineId: line._id || line.cartLineId,
  menuItemId: line.menuItem?._id || line.menuItem || line.menuItemId,
  name: line.menuItem?.name || line.name,
  price: line.menuItem?.price ?? line.price,
  image: line.menuItem?.image || line.image,
  quantity: line.quantity,
  selectedCookingOptions: line.selectedCookingOptions || [],
  customInstructions: line.customInstructions || ''
});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // ---- Guest cart (no account): persisted to localStorage on this device ----
  useEffect(() => {
    if (user) return;
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    if (user || !hydrated) return;
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, user, hydrated]);

  // ---- Signed-in cart: source of truth lives on the backend ----
  const refreshCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCart();
      setCartItems((data.data.items || []).map(normalizeLine));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshCart();
  }, [user, refreshCart]);

  /**
   * Add a menu item to the cart along with its cooking request preferences.
   * Guests get an optimistic local-only line; signed-in users hit the API
   * and the whole cart is replaced with the server's authoritative state.
   */
  const addToCart = async (menuItem, options = {}) => {
    const {
      quantity = 1,
      selectedCookingOptions = [],
      customInstructions = ''
    } = options;

    if (!user) {
      const newLine = {
        cartLineId: `${menuItem._id || menuItem.id}-${Date.now()}`,
        menuItemId: menuItem._id || menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity,
        selectedCookingOptions,
        customInstructions: customInstructions.trim()
      };
      setCartItems((prev) => [...prev, newLine]);
      return newLine;
    }

    const { data } = await addCartItem({
      menuItemId: menuItem._id || menuItem.id,
      quantity,
      selectedCookingOptions,
      customInstructions: customInstructions.trim()
    });
    const items = (data.data.items || []).map(normalizeLine);
    setCartItems(items);
    return items[items.length - 1];
  };

  const removeFromCart = async (cartLineId) => {
    if (!user) {
      setCartItems((prev) => prev.filter((line) => line.cartLineId !== cartLineId));
      return;
    }
    const { data } = await removeCartItem(cartLineId);
    setCartItems((data.data.items || []).map(normalizeLine));
  };

  const updateQuantity = async (cartLineId, quantity) => {
    const safeQuantity = Math.max(1, quantity);

    if (!user) {
      setCartItems((prev) =>
        prev.map((line) =>
          line.cartLineId === cartLineId ? { ...line, quantity: safeQuantity } : line
        )
      );
      return;
    }

    const { data } = await updateCartItem(cartLineId, { quantity: safeQuantity });
    setCartItems((data.data.items || []).map(normalizeLine));
  };

  const clearCart = async () => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      return;
    }
    await apiClearCart();
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cartItems.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
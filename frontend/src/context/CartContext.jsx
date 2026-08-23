import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'lighthouse_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((menuItem, options = {}) => {
    const entry = {
      menuItemId: menuItem._id || menuItem.id,
      name: menuItem.name,
      image: menuItem.image,
      basePrice: menuItem.price,
      quantity: options.quantity || 1,
      unitPrice: options.unitPrice || menuItem.price,
      selectedToppings: options.selectedToppings || [],
      selectedVariant: options.selectedVariant || null,
      selectedCookingOptions: options.selectedCookingOptions || [],
      customInstructions: options.customInstructions || ''
    };
    const cartItemId = `${entry.menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCartItems((prev) => [...prev, { ...entry, cartItemId }]);
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId, quantity) => {
    setCartItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
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
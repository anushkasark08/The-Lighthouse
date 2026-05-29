# Cart System Documentation

## Overview
A complete shopping cart system has been implemented for The Lighthouse restaurant website. The system allows customers to add menu items to their cart, manage quantities, and place orders with automatic GST calculation.

---

## Features Implemented

### 1. **Add to Cart Functionality**
- ✅ "Add to Cart" button on every menu item
- ✅ Visual feedback when item is added (button changes to "✓ Added")
- ✅ Duplicate items increase quantity instead of creating new entries
- ✅ Automatic cart count badge update

**Implementation Details:**
- Location: Each `.food-content` div contains a `.btn-add-to-cart` button
- Data attributes: `data-id`, `data-name`, `data-price`
- Event: Global click listener on all buttons with class `btn-add-to-cart`

### 2. **Cart Sidebar**
- ✅ Fixed position sidebar that slides in from the right
- ✅ Responsive design (100% width on mobile, max 400px on desktop)
- ✅ Smooth animations on open/close
- ✅ Cart overlay backdrop for better UX
- ✅ Close button (X) and click-outside-to-close functionality

**Location:** `<aside class="cart-sidebar" id="cartSidebar">`

### 3. **Cart Items Display**
Each cart item shows:
- ✅ Item name
- ✅ Individual price (₹)
- ✅ Quantity with increase (+) and decrease (-) buttons
- ✅ Item subtotal (price × quantity)
- ✅ Remove button (×)

**CSS Classes:**
- `.cart-item` - Item container
- `.cart-item-header` - Name and remove button
- `.cart-item-quantity` - Quantity controls
- `.qty-btn` - Increase/decrease buttons

### 4. **Cart Summary & Calculations**
Displays automatically calculated values:
- **Subtotal:** Sum of all item subtotals
- **GST (18%):** 18% tax on subtotal
- **Total Amount:** Subtotal + GST

**Formula:**
```
Subtotal = Σ(item_price × item_quantity)
GST = Subtotal × 0.18
Total = Subtotal + GST
```

**Location:** `<div class="cart-summary" id="cartSummary">`

### 5. **Quantity Controls**
- **Increase (+) Button:** Adds 1 to item quantity
- **Decrease (-) Button:** Subtracts 1, removes item if quantity reaches 0
- Real-time UI update and recalculation

**Classes:**
- `.increase-btn[data-id]` - Increase quantity
- `.decrease-btn[data-id]` - Decrease quantity

### 6. **Cart Count Badge**
- ✅ Displays total number of items in cart
- ✅ Updates automatically with each action
- ✅ Position: Top-right of cart button in navbar
- ✅ Styling: Golden background, dark text

**Location:** `<span class="cart-badge" id="cartBadge">0</span>`

### 7. **Remove Item Functionality**
- ✅ Individual remove button (×) on each item
- ✅ Immediate UI update and recalculation
- ✅ Removes entire item regardless of quantity

**Event:** Click on `.cart-item-remove[data-id]`

### 8. **Order Confirmation Modal**
- ✅ Shows order summary with all items
- ✅ Displays quantity and price for each item
- ✅ Shows subtotal, GST, and total
- ✅ Professional modal design with overlay
- ✅ Close button and click-outside-to-close

**Location:** `<div class="modal" id="orderModal">`

### 9. **Success Confirmation**
After clicking "Place Order":
- ✅ Order confirmation modal displays
- ✅ Success message appears
- ✅ Cart is automatically cleared
- ✅ Button to continue shopping

**Location:** `<div class="modal" id="successModal">`

### 10. **Data Persistence**
- ✅ Cart stored in browser localStorage
- ✅ Key: `lighthouse_cart`
- ✅ Format: JSON stringified array
- ✅ Persists across page refreshes

**Functions:**
- `loadCart()` - Load from localStorage on page load
- `saveCart()` - Save after each action

### 11. **Responsive Design**
Fully responsive across all devices:
- **Desktop (> 1024px):** Fixed 400px width sidebar
- **Tablet (768px - 1024px):** 100% width, adjusted padding
- **Mobile (< 768px):** Full-width slide-in sidebar
- **Small Mobile (< 480px):** Optimized layout and font sizes

**Breakpoints:**
```css
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }
```

---

## Code Structure

### HTML Elements

**Cart Button in Navbar:**
```html
<div class="nav-right">
  <button id="cartToggle" class="cart-btn">
    🛒
    <span class="cart-badge" id="cartBadge">0</span>
  </button>
  ...
</div>
```

**Add to Cart Button (on each item):**
```html
<button class="btn-add-to-cart" 
        data-id="1" 
        data-name="Masala Dosa" 
        data-price="180">
  Add to Cart
</button>
```

**Cart Sidebar:**
```html
<aside class="cart-sidebar" id="cartSidebar">
  <div class="cart-header">...</div>
  <div class="cart-items" id="cartItems">...</div>
  <div class="cart-summary" id="cartSummary">...</div>
  <button class="btn btn-primary" id="confirmOrderBtn">
    Confirm Order
  </button>
</aside>
```

### CSS Styling

**Key CSS Classes:**

| Class | Purpose |
|-------|---------|
| `.cart-btn` | Cart button styling |
| `.cart-badge` | Item count badge |
| `.btn-add-to-cart` | Add to cart button |
| `.cart-sidebar` | Main cart container |
| `.cart-item` | Individual cart item |
| `.qty-btn` | Quantity control buttons |
| `.cart-summary` | Summary section |
| `.modal` | Modal dialogs |
| `.cart-overlay` | Background overlay |

**Colors Used (from root variables):**
- Primary: `var(--color-primary)` - Golden (#c9a962)
- Background: `var(--color-bg)` - Dark (#1a1714)
- Text: `var(--color-text)` - Light (#f5f2ed)
- Border: `var(--color-border)` - Dark gray (#3d3835)

### JavaScript Functions

**Cart Management:**
- `loadCart()` - Load cart from localStorage
- `saveCart()` - Save cart to localStorage
- `addToCart(id, name, price)` - Add item to cart
- `removeFromCart(id)` - Remove item from cart
- `updateQuantity(id, newQuantity)` - Change item quantity

**UI Updates:**
- `updateCartUI()` - Refresh entire cart UI
- `updateCartBadge()` - Update item count badge
- `renderCartItems()` - Render cart items HTML
- `updateCartSummary()` - Update totals display

**Modal Management:**
- `showOrderConfirmation()` - Show order summary modal
- `closeOrderModal()` - Close order summary
- `showSuccessModal()` - Show success message
- `closeSuccessModal()` - Close success and clear cart

**Sidebar Control:**
- `toggleCartSidebar()` - Open/close sidebar
- `closeCartSidebar()` - Close sidebar

**Calculations:**
- `calculateTotals()` - Calculate subtotal, GST, total

---

## Data Structure

### Cart Item Object
```javascript
{
  id: "1",              // String: Item ID from data attribute
  name: "Masala Dosa",  // String: Item name
  price: 180,           // Number: Item price
  quantity: 1           // Number: Item quantity
}
```

### Cart State
```javascript
// Global array
cart = [
  { id: "1", name: "Masala Dosa", price: 180, quantity: 2 },
  { id: "5", name: "Hyderabadi Chicken Biryani", price: 320, quantity: 1 }
]

// Stored in localStorage as JSON string
localStorage.setItem("lighthouse_cart", JSON.stringify(cart))
```

---

## User Flow

### Adding Items
1. User clicks "Add to Cart" button on menu item
2. Item added to cart array (or quantity increased if exists)
3. Cart saved to localStorage
4. Button shows "✓ Added" feedback for 1.5 seconds
5. Cart count badge updates
6. Cart sidebar opens automatically

### Modifying Cart
1. User clicks (+) or (-) buttons to adjust quantity
2. Cart state updated immediately
3. UI recalculates totals in real-time
4. Change persisted to localStorage

### Removing Items
1. User clicks (×) button on cart item
2. Item removed from cart array
3. UI updated, totals recalculated
4. Change persisted to localStorage

### Placing Order
1. User clicks "Confirm Order" button
2. Order Summary modal appears with:
   - All cart items with quantities and prices
   - Subtotal, GST, and Total
3. User confirms by clicking "Place Order"
4. Success modal appears
5. Cart automatically cleared
6. Cart count badge resets to 0
7. Cart sidebar closes

---

## Browser Compatibility

Tested and working on:
- Chrome/Chromium 100+
- Firefox 100+
- Safari 15+
- Edge 100+

**No external libraries used** - Pure vanilla JavaScript

---

## Files Modified

### 1. **index.html**
- Added cart button to navbar with badge
- Added "Add to Cart" button to all 12 menu items
- Added cart sidebar (#cartSidebar)
- Added cart overlay (#cartOverlay)
- Added order summary modal (#orderModal)
- Added success confirmation modal (#successModal)
- **Total changes:** 12 new buttons, 3 new sections (cart, modals)

### 2. **style.css**
- Added `.nav-right` container styling
- Added `.cart-btn` button styling
- Added `.cart-badge` styling
- Added `.btn-add-to-cart` styling
- Added complete `.cart-sidebar` styling with animations
- Added `.cart-item` and controls styling
- Added `.cart-summary` styling
- Added `.modal` and `.modal-success` styling
- Added responsive media queries
- **Total additions:** ~500 lines of CSS

### 3. **script.js**
- Added cart state management functions
- Added add/remove/update quantity functions
- Added UI rendering functions
- Added modal management functions
- Added localStorage persistence
- Added event listeners for all cart interactions
- Added keyboard event handling (Escape to close)
- **Total additions:** ~400 lines of JavaScript

---

## LocalStorage Details

**Storage Key:** `lighthouse_cart`

**Data Format:**
```json
[
  {
    "id": "1",
    "name": "Masala Dosa",
    "price": 180,
    "quantity": 2
  },
  {
    "id": "5",
    "name": "Hyderabadi Chicken Biryani",
    "price": 320,
    "quantity": 1
  }
]
```

**Max Storage:**
- Typically 5-10MB per domain in modern browsers
- This cart will never exceed a few KB

---

## Keyboard Shortcuts

- **Escape Key:** Close cart sidebar, modals (when open)

---

## Edge Cases Handled

✅ Empty cart - Shows "Your cart is empty" message
✅ Quantity 0 - Item automatically removed
✅ Negative quantities - Not allowed (buttons only allow 0 or positive)
✅ Browser back/forward - Cart persists via localStorage
✅ Page refresh - Cart state restored from localStorage
✅ Multiple instances - Each item ID is unique
✅ Special characters in names - Properly escaped in HTML
✅ Mobile resize - Responsive CSS handles all sizes
✅ Touch devices - All buttons are large enough to tap
✅ Accessibility - ARIA labels added to buttons

---

## Performance Considerations

- **No external libraries** - Faster load time
- **Efficient DOM updates** - innerHTML used strategically
- **Event delegation** - Single listener for all add-to-cart buttons
- **LocalStorage access** - Minimized to only necessary operations
- **CSS animations** - GPU accelerated (transform, opacity)

---

## Security Notes

- ⚠️ **Note:** This is a frontend-only cart system
- For production e-commerce: Implement backend validation
- Never trust client-side price validation
- Always verify order on backend before charging
- Implement proper payment gateway integration

---

## Future Enhancement Ideas

1. Add product images to order summary
2. Implement coupon/discount code functionality
3. Add customer notes/special requests
4. Implement quantity limits per item
5. Add "Continue to Checkout" instead of direct order
6. Implement email receipt functionality
7. Add cart persistence across browsers via backend
8. Implement product recommendations
9. Add save cart for later functionality
10. Implement order history

---

## Testing Checklist

- ✅ Add single item
- ✅ Add multiple items
- ✅ Add same item multiple times (quantity increases)
- ✅ Increase quantity
- ✅ Decrease quantity to 0
- ✅ Remove item
- ✅ Cart persists after refresh
- ✅ Cart badge updates correctly
- ✅ GST calculation is correct (18%)
- ✅ Order summary shows correct values
- ✅ Success modal appears
- ✅ Cart clears after confirmation
- ✅ Sidebar closes after confirmation
- ✅ Works on mobile
- ✅ Works on tablet
- ✅ Works on desktop
- ✅ Escape key closes modals/sidebar
- ✅ Click outside closes modals/sidebar

---

## Support & Maintenance

For any issues or updates:
1. Check browser console for errors
2. Clear localStorage if cart appears corrupted
3. Ensure all files (HTML, CSS, JS) are properly linked
4. Test in different browsers
5. Check responsive design on various devices

---

**Last Updated:** May 29, 2026
**Version:** 1.0 (Production Ready)
**Status:** ✅ Fully Functional

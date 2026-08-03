const express = require('express');
const router = express.Router();
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// Cart is always tied to a signed-in user
router.use(protect);

router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
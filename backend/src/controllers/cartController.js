const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

const DEFAULT_MAX_INSTRUCTIONS_LENGTH = 120;

// Fetch (creating if needed) the current user's cart, with dish details populated
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get the current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Cart Error [getCart]:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Add a menu item to the cart, with cooking request preferences
// @route   POST /api/cart/items
// @access  Private
exports.addCartItem = async (req, res) => {
  try {
    const {
      menuItemId,
      quantity = 1,
      selectedCookingOptions = [],
      customInstructions = ''
    } = req.body;

    if (!menuItemId || !mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({ success: false, error: 'A valid menuItemId is required' });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    if (!menuItem.isAvailable) {
      return res.status(400).json({ success: false, error: `${menuItem.name} is currently sold out` });
    }

    // Enforce this dish's own Cooking Request configuration
    if (!menuItem.allowCustomInstructions && customInstructions) {
      return res.status(400).json({
        success: false,
        error: 'Custom instructions are not enabled for this item'
      });
    }

    const maxLength = menuItem.customInstructionsMaxLength ?? DEFAULT_MAX_INSTRUCTIONS_LENGTH;
    if (customInstructions && customInstructions.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Instructions cannot exceed ${maxLength} characters`
      });
    }

    // Only restrict to a fixed list when the owner has configured one for
    // this dish; otherwise accept whatever the client sent (it will be
    // using the category-default fallback list).
    if (menuItem.cookingOptions?.length && Array.isArray(selectedCookingOptions)) {
      const invalid = selectedCookingOptions.filter((opt) => !menuItem.cookingOptions.includes(opt));
      if (invalid.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid cooking option(s): ${invalid.join(', ')}`
        });
      }
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    cart.items.push({
      menuItem: menuItem._id,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      selectedCookingOptions,
      customInstructions: customInstructions.trim()
    });

    await cart.save();
    const populated = await getPopulatedCart(req.user._id);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Cart Error [addCartItem]:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Update a cart line's quantity or cooking request preferences
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, selectedCookingOptions, customInstructions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, error: 'Invalid cart item ID format' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const line = cart.items.id(itemId);
    if (!line) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    if (quantity !== undefined) {
      line.quantity = Math.max(1, parseInt(quantity, 10) || 1);
    }
    if (selectedCookingOptions !== undefined) {
      line.selectedCookingOptions = selectedCookingOptions;
    }
    if (customInstructions !== undefined) {
      line.customInstructions = customInstructions.trim();
    }

    await cart.save();
    const populated = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('Cart Error [updateCartItem]:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Remove a single line item from the cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, error: 'Invalid cart item ID format' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const line = cart.items.id(itemId);
    if (!line) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }
    line.deleteOne();
    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('Cart Error [removeCartItem]:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, data: { items: [] }, message: 'Cart cleared' });
  } catch (error) {
    console.error('Cart Error [clearCart]:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};
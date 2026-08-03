const mongoose = require('mongoose');

// Each cart line is its own dish + cooking request combination, so the
// same dish added twice with different preferences appears as two lines.
const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    // Predefined cooking preferences the customer picked for this line
    // (subset of the menu item's own `cookingOptions`)
    selectedCookingOptions: {
      type: [String],
      default: []
    },
    // Free-text cooking instructions, capped as a hard safety ceiling here;
    // the per-item configurable limit (menuItem.customInstructionsMaxLength)
    // is enforced in the controller since it varies per dish.
    customInstructions: {
      type: String,
      maxlength: [500, 'Instructions cannot be more than 500 characters'],
      default: ''
    }
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
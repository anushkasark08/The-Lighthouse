const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a dish name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks']
    },
    isVeg: {
      type: Boolean,
      required: true,
      default: false
    },
    allergens: {
      type: [String],
      enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish'],
      default: []
    },
    tags: {
      type: [String],
      enum: ['seasonal', 'chef-special', 'popular', 'new', 'spicy'],
      default: []
    },
    // KEY DIFFERENTIATOR: live availability toggle
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: {
      type: String,
      default: ''
    },
    preparationTime: {
      type: Number, // in minutes
      default: 20
    },
    sortOrder: {
      type: Number,
      default: 0
    },

    // ---- NEW FIELDS: nutrition/energy (needed for Energy filter) ----
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0
    },

    // ---- NEW FIELDS: workout fit filter ----
    workoutTags: {
      type: [String],
      enum: ['Post-Workout Fuel', 'Pre-Workout Energy', 'Light & Fresh', 'Indulgent'],
      default: []
    },

    // ---- NEW FIELDS: reviews & popularity ----
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0
    },
    orderCount: {
      type: Number,
      min: 0,
      default: 0
    },
    badge: {
      type: String,
      enum: ['Bestseller', "Chef's Pick", null],
      default: null
    },
    chefSelection: {
      type: [String],
      enum: ["Chef's Special", "Executive Signature", "Sommelier Choice", "Artisanal Recipe", "Seasonal Highlight", "Masterclass Creation"],
      default: []
    },
    flavorProfile: {
      type: [String],
      enum: ["Smoky & Rich", "Tangy & Zesty", "Velvety & Creamy", "Spicy & Fiery", "Umami Savory", "Fresh & Herbaceous", "Sweet & Delicate"],
      default: []
    },
    diningOccasion: {
      type: [String],
      enum: ["Romantic Dinner", "Family Feast", "Quick & Light Bite", "Celebration & Gala", "Late Night Indulgence", "Executive Business Lunch"],
      default: []
    }
  },
  {
    timestamps: true
  }
);

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isVeg: 1, isAvailable: 1 });
menuItemSchema.index({ chefSelection: 1, isAvailable: 1 });
menuItemSchema.index({ flavorProfile: 1, isAvailable: 1 });
menuItemSchema.index({ diningOccasion: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    // Optional: which dish they're reviewing
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// One review per user per menu item (can be removed if multiple reviews per user are allowed)
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

// Recalculates and stores average rating + review count on the linked MenuItem.
// Only runs when a review is actually tied to a dish (menuItem is not null) —
// general restaurant-level reviews are ignored here.
reviewSchema.statics.calcMenuItemRating = async function (menuItemId) {
  if (!menuItemId) return;

  const MenuItem = mongoose.model('MenuItem');

  const stats = await this.aggregate([
    { $match: { menuItem: menuItemId } },
    {
      $group: {
        _id: '$menuItem',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // round to 1 decimal
      reviewCount: stats[0].count
    });
  } else {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      rating: 0,
      reviewCount: 0
    });
  }
};

// Recalculate after a review is created or updated
reviewSchema.post('save', function (doc) {
  doc.constructor.calcMenuItemRating(doc.menuItem);
});


// Recalculate after a review is deleted via review.deleteOne()
// (matches how deleteReview in reviewController.js removes reviews)
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calcMenuItemRating(this.menuItem);
});

module.exports = mongoose.model('Review', reviewSchema);
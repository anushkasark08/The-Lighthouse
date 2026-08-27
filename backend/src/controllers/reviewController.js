const Review = require('../models/Review');
const mongoose = require('mongoose');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.menuItem) {
      if (!mongoose.Types.ObjectId.isValid(req.query.menuItem)) {
        return res.status(400).json({ success: false, error: 'Invalid menuItem ID' });
      }
      filter.menuItem = req.query.menuItem;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('getReviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, menuItem } = req.body;

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
    }

    // Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment is required' });
    }
    const cleanedComment = comment.trim();
    if (cleanedComment.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment cannot exceed 500 characters' });
    }

    // Validate menuItem if provided
    if (menuItem && !mongoose.Types.ObjectId.isValid(menuItem)) {
      return res.status(400).json({ success: false, error: 'Invalid menu item ID' });
    }

    const existing = await Review.findOne({
      user: req.user.id,
      menuItem: menuItem || null
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this item'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      rating: ratingNum,
      comment: cleanedComment,
      menuItem: menuItem || null
    });

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Thank you for your review!'
    });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(400).json({ success: false, error: 'Failed to create review' });
  }
};

// @desc    Delete review (own review or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, data: {}, message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
};

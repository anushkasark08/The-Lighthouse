const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getPersonalizedRecommendations,
    getTrendingDishes,
    getSimilarDishes,
    trackInteraction,
    rateDish,
    getUserHistory,
    getAnalytics
} = require('../controllers/recommendationController');

// Public routes (with optional auth)
router.get('/trending', getTrendingDishes);
router.get('/similar/:dishId', getSimilarDishes);

// Protected routes (require login)
router.get('/personalized', protect, getPersonalizedRecommendations);
router.get('/history', protect, getUserHistory);
router.post('/track', protect, trackInteraction);
router.post('/rate', protect, rateDish);

// Admin only routes
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
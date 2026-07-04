const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getCurrentPrice,
    getPriceDetails,
    getPriceHistory,
    getDemandForecast,
    getPricingRecommendations,
    getPricingAnalytics,
    batchUpdatePrices,
    getPricingSummary
} = require('../controllers/pricingController');

// Public routes
router.get('/dish/:dishId/current', getCurrentPrice);
router.get('/dish/:dishId/details', getPriceDetails);
router.get('/dish/:dishId/history', getPriceHistory);
router.get('/dish/:dishId/forecast', getDemandForecast);
router.get('/dish/:dishId/recommendations', getPricingRecommendations);
router.get('/dish/:dishId/analytics', getPricingAnalytics);
router.get('/summary', getPricingSummary);

// Admin only routes
router.post('/batch-update', protect, authorize('admin'), batchUpdatePrices);

module.exports = router;
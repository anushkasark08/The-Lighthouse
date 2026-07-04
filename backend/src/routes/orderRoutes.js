const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createOrder,
    getOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');

// Protected routes (user)
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin/Staff routes
router.get('/', protect, authorize('staff', 'admin'), getAllOrders);
router.put('/:id/status', protect, authorize('staff', 'admin'), updateOrderStatus);

module.exports = router;
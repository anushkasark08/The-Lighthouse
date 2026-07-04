const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    getTableAvailability
} = require('../controllers/tableController');

// Public routes
router.get('/', getTables);
router.get('/:id', getTable);
router.get('/:id/availability', getTableAvailability);

// Admin only routes
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);

module.exports = router;
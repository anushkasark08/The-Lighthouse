const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createReservation,
  getReservations,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');
const { validate, reservationValidation } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/slots', rateLimiter({ windowMs: 10 * 60 * 1000, max: 60 }), getAvailableSlots);
router.post('/', rateLimiter({ windowMs: 60 * 60 * 1000, max: 6 }), protect, validate(reservationValidation), createReservation);
router.get('/', protect, getReservations);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
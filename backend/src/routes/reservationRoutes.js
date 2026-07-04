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

router.get('/slots', getAvailableSlots);
router.post('/', protect, validate(reservationValidation), createReservation);
router.get('/', protect, getReservations);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
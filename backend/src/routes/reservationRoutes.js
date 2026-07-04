const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createReservation,
  getReservations,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.get('/slots', getAvailableSlots);
router.post('/', protect, createReservation);
router.get('/', protect, getReservations);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
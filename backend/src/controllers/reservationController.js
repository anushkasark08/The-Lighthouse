const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const availabilityService = require('../services/availabilityService');
const emailService = require('../services/emailService');

// @desc    Get available slots
// @route   GET /api/reservations/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, guests } = req.query;

    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Please provide date and guests'
      });
    }

    const result = await availabilityService.getAvailableSlots(date, guests);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const { date, time, guests, specialRequests } = req.body;

    // Check availability
    const availability = await availabilityService.getAvailableSlots(date, guests);
    const selectedSlot = availability.data.slots.find(s => s.time === time);
    
    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    // Get available table
    const availableTables = await Table.find({
      capacity: { $gte: parseInt(guests) },
      isActive: true
    });

    let assignedTable = null;
    for (const table of availableTables) {
      const isAvailable = await availabilityService.checkAvailability(table._id, date, time);
      if (isAvailable) {
        assignedTable = table;
        break;
      }
    }

    if (!assignedTable) {
      return res.status(400).json({
        success: false,
        error: 'No table available for this time slot'
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user.id,
      table: assignedTable._id,
      date: new Date(date),
      time,
      guests: parseInt(guests),
      specialRequests,
      status: 'confirmed'
    });

    // Send confirmation email
    await emailService.sendReservationConfirmation(req.user.email, {
      date,
      time,
      guests,
      specialRequests
    });

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation confirmed! Check your email for details.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('table', 'tableNumber capacity section')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    // Check ownership
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this reservation'
      });
    }

    // Check if reservation is in the future
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel past reservations'
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
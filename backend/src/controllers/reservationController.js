const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const availabilityService = require('../services/availabilityService');
const emailService = require('../services/emailService');

// @desc    Get available slots
// @route   GET /api/reservations/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, guests, seatingPreference } = req.query;

    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Please provide date and guests'
      });
    }

 
    const guestsNum = parseInt(guests, 10);
    if (Number.isNaN(guestsNum) || guestsNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid guests value' });
    }

    const result = await availabilityService.getAvailableSlots(date, guests, seatingPreference);
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
    const { date, time, guests, specialRequests, seatingPreference, preOrder, confirmationChannel, depositAmount } = req.body;

    // Basic validation to avoid malformed requests
    if (!date || !time || !guests) {
      return res.status(400).json({ success: false, error: 'Missing date, time, or guests' });
    }

    const guestsNum = parseInt(guests, 10);
    if (Number.isNaN(guestsNum) || guestsNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid guests count' });
    }

    // Prevent past-date and past-time reservations
    const requestedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (Number.isNaN(requestedDateTime.getTime()) || requestedDateTime <= now) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reservation time slot must be in the future' 
      });
    }

    // Validate user's email
    const email = (req.user && req.user.email) || '';
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(String(email).toLowerCase())) {
      return res.status(400).json({ success: false, error: 'User email is invalid. Please verify your account email.' });
    }

    // Sanitize special requests
    const cleanedSpecialRequests = typeof specialRequests === 'string' ? specialRequests.trim().slice(0, 1000) : '';

    // Check availability
    const availability = await availabilityService.getAvailableSlots(date, guests, seatingPreference);
    const selectedSlot = availability.data.slots.find(s => s.time === time);
    
    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    
    // 1. Get all table IDs that already have a confirmed reservation for this date and time
    const activeReservations = await Reservation.find({
      date: new Date(date),
      time,
      status: { $ne: 'cancelled' }
    }).select('table');

    const bookedTableIds = activeReservations.map(res => res.table);

    // 2. Find a single active table of sufficient capacity that is NOT in the booked IDs list
    const tableQuery = {
      _id: { $nin: bookedTableIds },
      capacity: { $gte: guestsNum },
      isActive: true
    };
    if (seatingPreference && seatingPreference !== 'any') {
      tableQuery.section = seatingPreference;
    }
    
    const assignedTable = await Table.findOne(tableQuery);

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
      guests: guestsNum,
      specialRequests: cleanedSpecialRequests,
      status: 'confirmed',
      seatingPreference: seatingPreference || 'any',
      preOrder: preOrder || [],
      confirmationChannel: confirmationChannel || 'email',
      depositAmount: depositAmount || 0,
      depositPaid: depositAmount > 0
    });

    // Populate table and preOrder menuItem details
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity section')
      .populate('preOrder.menuItem', 'name price image preparationTime');

    // Send confirmation email asynchronously without blocking the client response
    emailService.sendReservationConfirmation(req.user.email, populatedReservation).catch(err => {
      // Log the error internally so developers can investigate email issues, 
      // but do not let it crash the reservation success flow.
      console.error('Email delivery failed for reservation:', reservation._id, err);
    });

    res.status(201).json({
      success: true,
      data: populatedReservation,
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
      .populate('preOrder.menuItem', 'name price image preparationTime')
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
    const dateStr = reservation.date.toISOString().split('T')[0];
    const reservationDateTime = new Date(`${dateStr}T${reservation.time}`);
    const now = new Date();

    if (reservationDateTime < now) {
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
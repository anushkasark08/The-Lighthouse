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
    const { date, time, guests, specialRequests, seatingPreference, preOrder, confirmationChannel } = req.body;

    // Deposit is server-calculated, not client-supplied
    const depositAmount = parseInt(guests, 10) > 4 ? 500 : 0;

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

    // Sanitize and validate special requests
    const cleanedSpecialRequests = typeof specialRequests === 'string' ? specialRequests.trim() : '';
    if (cleanedSpecialRequests.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Special requests cannot exceed 500 characters'
      });
    }

    // Check slot availability first
    const availability = await availabilityService.getAvailableSlots(date, guests, seatingPreference);
    const selectedSlot = availability.data.slots.find(s => s.time === time);

    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    // Atomic table assignment with retry to prevent race conditions.
    // Two concurrent requests can both pass the availability check above,
    // then both try to claim the same table. The partial unique index on
    // {table, date, time} catches duplicates at the DB level — we retry
    // with a different table on DuplicateKeyError.
    const MAX_RETRIES = 3;
    let reservation = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      // Find tables already booked for this slot (excluding cancelled)
      const bookedTableIds = await Reservation.distinct('table', {
        date: new Date(date),
        time,
        status: { $in: ['pending', 'confirmed'] }
      });

      // Pick the smallest qualifying table that is NOT booked (best-fit to avoid waste)
      const tableQuery = {
        _id: { $nin: bookedTableIds },
        capacity: { $gte: guestsNum },
        isActive: true
      };
      if (seatingPreference && seatingPreference !== 'any') {
        tableQuery.section = seatingPreference;
      }

      const candidateTable = await Table.findOne(tableQuery).sort({ capacity: 1 });

      if (!candidateTable) {
        return res.status(400).json({
          success: false,
          error: 'No table available for this time slot'
        });
      }

      try {
        reservation = await Reservation.create({
          user: req.user.id,
          table: candidateTable._id,
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
        break; // success — exit retry loop
      } catch (err) {
        // Duplicate key means another request just claimed this table.
        // Loop again to try the next available table.
        if (err.code === 11000 && attempt < MAX_RETRIES - 1) {
          continue;
        }
        throw err;
      }
    }

    if (!reservation) {
      return res.status(400).json({
        success: false,
        error: 'No table available for this time slot'
      });
    }

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

    // Broadcast real-time alert to staff/admin dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('reservationCreated', {
        id: populatedReservation._id,
        guestName: req.user.name,
        guests: populatedReservation.guests,
        time: populatedReservation.time,
        date: populatedReservation.date,
        table: populatedReservation.table?.tableNumber,
        section: populatedReservation.table?.section
      });
    }

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

    // Broadcast real-time cancellation alert to staff/admin dashboards
    const io = req.app.get('io');
    if (io) {
      const populated = await Reservation.findById(reservation._id)
        .populate('table', 'tableNumber capacity section');
      io.emit('reservationCancelled', {
        id: populated._id,
        guestName: req.user.name,
        guests: populated.guests,
        time: populated.time,
        date: populated.date,
        table: populated.table?.tableNumber,
        section: populated.table?.section
      });
    }

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
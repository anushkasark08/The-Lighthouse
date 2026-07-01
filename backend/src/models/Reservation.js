const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please select a date']
  },
  time: {
    type: String,
    required: [true, 'Please select a time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time']
  },
  guests: {
    type: Number,
    required: [true, 'Please specify number of guests'],
    min: [1, 'Must have at least 1 guest'],
    max: [20, 'Maximum 20 guests allowed']
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
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
  seatingPreference: {
    type: String,
    enum: ['main', 'window', 'private', 'outdoor', 'any'],
    default: 'any'
  },
  preOrder: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  confirmationChannel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms'],
    default: 'email'
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  depositPaid: {
    type: Boolean,
    default: false
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries and race-condition prevention
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ user: 1, status: 1 });

// Enforce unique bookings: A table can only have one active ('pending' or 'confirmed') reservation per date and time slot
reservationSchema.index(
  { table: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
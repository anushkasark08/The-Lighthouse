const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  // Basic Information
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Table must seat at least 1 person'],
    max: [12, 'Table cannot seat more than 12 people']
  },
  section: {
    type: String,
    enum: ['main', 'window', 'private', 'outdoor', 'bar', 'terrace'],
    default: 'main'
  },
  
  // Floor Plan Positioning
  position: {
    x: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0,
      max: 800
    },
    y: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0,
      max: 600
    },
    rotation: { 
      type: Number, 
      default: 0,
      min: -180,
      max: 180
    }
  },
  
  // Visual Properties
  shape: {
    type: String,
    enum: ['circle', 'square', 'rectangle', 'oval'],
    default: 'circle'
  },
  size: {
    width: { 
      type: Number, 
      default: 60,
      min: 30,
      max: 120
    },
    height: { 
      type: Number, 
      default: 60,
      min: 30,
      max: 120
    }
  },
  color: {
    type: String,
    default: '#4CAF50',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isReserved: {
    type: Boolean,
    default: false
  },
  currentReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  },
  
  // Features & Amenities
  features: [{
    type: String,
    enum: [
      'window-view', 
      'outdoor', 
      'private', 
      'wheelchair-accessible', 
      'high-chair',
      'romantic',
      'group-seating',
      'quiet-corner',
      'near-stage',
      'bar-view'
    ]
  }],
  
  // Additional Information
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  minBookingTime: {
    type: Number,
    default: 30, // Minimum booking duration in minutes
    min: 15,
    max: 120
  },
  maxBookingTime: {
    type: Number,
    default: 180, // Maximum booking duration in minutes
    min: 30,
    max: 240
  },
  
  // Pricing (optional for premium tables)
  premiumPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
tableSchema.index({ section: 1, isActive: 1 });
tableSchema.index({ isReserved: 1 });
tableSchema.index({ 'position.x': 1, 'position.y': 1 });

// Virtual field for table display name
tableSchema.virtual('displayName').get(function() {
  return `Table #${this.tableNumber} (${this.capacity} seats)`;
});

// Virtual field for availability status
tableSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.isReserved) return 'reserved';
  return 'available';
});

// Method to check if table can accommodate guests
tableSchema.methods.canAccommodate = function(guests) {
  return this.isActive && this.capacity >= guests;
};

// Method to check if table is available at a specific time
tableSchema.methods.isAvailableAt = async function(date, time) {
  const Reservation = mongoose.model('Reservation');
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const reservation = await Reservation.findOne({
    table: this._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    time: time,
    status: { $in: ['pending', 'confirmed'] }
  });
  
  return !reservation;
};

// Method to get available time slots for a date
tableSchema.methods.getAvailableSlots = async function(date) {
  const Reservation = mongoose.model('Reservation');
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const reservations = await Reservation.find({
    table: this._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  });
  
  const bookedSlots = reservations.map(r => r.time);
  const allSlots = generateTimeSlots();
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
  
  return availableSlots;
};

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  for (let hour = 7; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
}

// Ensure virtual fields are included in JSON output
tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Table', tableSchema);
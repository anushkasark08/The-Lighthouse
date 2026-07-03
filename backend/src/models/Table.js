const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
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
    enum: ['main', 'window', 'private', 'outdoor'],
    default: 'main'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
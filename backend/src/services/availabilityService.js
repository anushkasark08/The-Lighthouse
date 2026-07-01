const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

class AvailabilityService {
  constructor() {
    this.bufferMinutes = 30;
    this.operatingHours = {
      start: '07:00',
      end: '23:00'
    };
  }

  async getAvailableSlots(date, guests) {
    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      throw new Error('Cannot book for past dates');
    }

    // Get available tables
    const availableTables = await Table.find({
      capacity: { $gte: parseInt(guests) },
      isActive: true
    });

    if (availableTables.length === 0) {
      return {
        success: true,
        data: {
          available: false,
          message: 'No tables available for this party size',
          slots: []
        }
      };
    }

    // Get existing reservations for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Generate time slots
    const slots = this.generateTimeSlots();
    
    // Filter available slots
    const availableSlots = slots.map(slot => {
      const slotTime = slot.time;
      const conflictingReservations = reservations.filter(r => r.time === slotTime);
      const isAvailable = conflictingReservations.length < availableTables.length;
      
      return {
        time: slotTime,
        available: isAvailable,
        tablesAvailable: isAvailable ? availableTables.length - conflictingReservations.length : 0
      };
    });

    return {
      success: true,
      data: {
        available: availableSlots.some(s => s.available),
        slots: availableSlots,
        tablesAvailable: availableTables.length,
        date: date,
        guests: parseInt(guests)
      }
    };
  }

  generateTimeSlots() {
    const slots = [];
    const [startHour, startMinute] = this.operatingHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.operatingHours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      slots.push({ time: timeString });
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  }

  async checkAvailability(tableId, date, time) {
    const reservation = await Reservation.findOne({
      table: tableId,
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    return !reservation;
  }
}

module.exports = new AvailabilityService();
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

/**
 * Get all tables with availability status
 */
exports.getTables = async (req, res) => {
    try {
        const { date, time } = req.query;
        
        let tables = await Table.find({ isActive: true });
        
        // If date and time provided, check availability
        if (date && time) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Get reservations for the date and time
            const reservations = await Reservation.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                time: time,
                status: { $in: ['pending', 'confirmed'] }
            });
            
            const reservedTableIds = reservations.map(r => r.table.toString());
            
            tables = tables.map(table => {
                const isReserved = reservedTableIds.includes(table._id.toString());
                return {
                    ...table.toObject(),
                    isAvailable: !isReserved,
                    isReserved: isReserved
                };
            });
        }
        
        res.status(200).json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get single table with availability
 */
exports.getTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.query;
        
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({
                success: false,
                error: 'Table not found'
            });
        }
        
        let isAvailable = true;
        if (date && time) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            const reservation = await Reservation.findOne({
                table: id,
                date: { $gte: startOfDay, $lte: endOfDay },
                time: time,
                status: { $in: ['pending', 'confirmed'] }
            });
            
            isAvailable = !reservation;
        }
        
        res.status(200).json({
            success: true,
            data: {
                ...table.toObject(),
                isAvailable
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Create new table (admin only)
 */
exports.createTable = async (req, res) => {
    try {
        const tableData = req.body;
        
        // Check if table number already exists
        const existingTable = await Table.findOne({ tableNumber: tableData.tableNumber });
        if (existingTable) {
            return res.status(400).json({
                success: false,
                error: 'Table number already exists'
            });
        }
        
        const table = await Table.create(tableData);
        
        res.status(201).json({
            success: true,
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update table (admin only)
 */
exports.updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const table = await Table.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!table) {
            return res.status(404).json({
                success: false,
                error: 'Table not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Delete table (admin only)
 */
exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        
        const table = await Table.findByIdAndDelete(id);
        if (!table) {
            return res.status(404).json({
                success: false,
                error: 'Table not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Table deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get table availability for a specific date/time
 */
exports.getTableAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, guests } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a date'
            });
        }
        
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({
                success: false,
                error: 'Table not found'
            });
        }
        
        // Check if table can accommodate guests
        const canAccommodate = !guests || table.capacity >= parseInt(guests);
        
        // Check availability
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const reservations = await Reservation.find({
            table: id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'confirmed'] }
        });
        
        // Generate available time slots
        const allSlots = this.generateTimeSlots();
        const bookedSlots = reservations.map(r => r.time);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        
        res.status(200).json({
            success: true,
            data: {
                table: table,
                date: date,
                canAccommodate: canAccommodate,
                availableSlots: availableSlots,
                bookedSlots: bookedSlots,
                isFullyBooked: availableSlots.length === 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Generate time slots (helper)
 */
generateTimeSlots() {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            slots.push(time);
        }
    }
    return slots;
}
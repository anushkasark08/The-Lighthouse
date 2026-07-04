const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('../models/Table');

dotenv.config();

const seedTables = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing tables
        await Table.deleteMany();

        const tables = [
            // Window Section
            { tableNumber: 1, capacity: 2, section: 'window', position: { x: 80, y: 60 }, shape: 'circle', size: { width: 50, height: 50 }, features: ['window-view'] },
            { tableNumber: 2, capacity: 2, section: 'window', position: { x: 160, y: 60 }, shape: 'circle', size: { width: 50, height: 50 }, features: ['window-view'] },
            { tableNumber: 3, capacity: 4, section: 'window', position: { x: 80, y: 140 }, shape: 'square', size: { width: 70, height: 70 }, features: ['window-view'] },
            { tableNumber: 4, capacity: 4, section: 'window', position: { x: 160, y: 140 }, shape: 'square', size: { width: 70, height: 70 }, features: ['window-view'] },

            // Main Hall
            { tableNumber: 5, capacity: 2, section: 'main', position: { x: 350, y: 60 }, shape: 'circle', size: { width: 50, height: 50 } },
            { tableNumber: 6, capacity: 4, section: 'main', position: { x: 420, y: 60 }, shape: 'square', size: { width: 70, height: 70 } },
            { tableNumber: 7, capacity: 4, section: 'main', position: { x: 350, y: 140 }, shape: 'square', size: { width: 70, height: 70 } },
            { tableNumber: 8, capacity: 4, section: 'main', position: { x: 420, y: 140 }, shape: 'square', size: { width: 70, height: 70 } },
            { tableNumber: 9, capacity: 6, section: 'main', position: { x: 350, y: 220 }, shape: 'rectangle', size: { width: 100, height: 70 } },
            { tableNumber: 10, capacity: 6, section: 'main', position: { x: 420, y: 220 }, shape: 'rectangle', size: { width: 100, height: 70 } },

            // Private Section
            { tableNumber: 11, capacity: 4, section: 'private', position: { x: 650, y: 60 }, shape: 'square', size: { width: 70, height: 70 }, features: ['private'] },
            { tableNumber: 12, capacity: 6, section: 'private', position: { x: 650, y: 140 }, shape: 'rectangle', size: { width: 90, height: 70 }, features: ['private'] },
            { tableNumber: 13, capacity: 8, section: 'private', position: { x: 650, y: 220 }, shape: 'rectangle', size: { width: 100, height: 80 }, features: ['private'] },

            // Outdoor Section
            { tableNumber: 14, capacity: 2, section: 'outdoor', position: { x: 80, y: 440 }, shape: 'circle', size: { width: 50, height: 50 }, features: ['outdoor'] },
            { tableNumber: 15, capacity: 4, section: 'outdoor', position: { x: 160, y: 440 }, shape: 'square', size: { width: 70, height: 70 }, features: ['outdoor'] },
            { tableNumber: 16, capacity: 4, section: 'outdoor', position: { x: 260, y: 440 }, shape: 'square', size: { width: 70, height: 70 }, features: ['outdoor'] },
            { tableNumber: 17, capacity: 6, section: 'outdoor', position: { x: 350, y: 440 }, shape: 'rectangle', size: { width: 90, height: 70 }, features: ['outdoor'] }
        ];

        await Table.insertMany(tables);
        console.log(`✅ ${tables.length} tables seeded successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding tables:', error);
        process.exit(1);
    }
};

seedTables();
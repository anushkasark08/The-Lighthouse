const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Table = require('../models/Table');

dotenv.config({ path: '../../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();

    // Seed users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@thelighthouse.com',
        password: 'Admin@123',
        phone: '9876543210',
        role: 'admin'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user'
      }
    ]);

    console.log('Users seeded:', users.length);

    // Seed tables
    const tables = await Table.create([
      { tableNumber: 1, capacity: 2, section: 'window', description: 'Romantic window seat' },
      { tableNumber: 2, capacity: 2, section: 'main', description: 'Cozy corner table' },
      { tableNumber: 3, capacity: 4, section: 'main', description: 'Family table' },
      { tableNumber: 4, capacity: 4, section: 'window', description: 'Bright window table' },
      { tableNumber: 5, capacity: 6, section: 'private', description: 'Private dining room' },
      { tableNumber: 6, capacity: 6, section: 'main', description: 'Large group table' },
      { tableNumber: 7, capacity: 8, section: 'private', description: 'VIP private room' },
      { tableNumber: 8, capacity: 2, section: 'outdoor', description: 'Outdoor patio table' },
      { tableNumber: 9, capacity: 4, section: 'outdoor', description: 'Outdoor family table' }
    ]);

    console.log('Tables seeded:', tables.length);

    console.log('✅ Seed data completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
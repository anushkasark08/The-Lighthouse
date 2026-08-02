const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const menuItems = [
  // ── Breakfast ──
  {
    name: 'Idli Sambar',
    description: 'Soft steamed rice cakes served with a tangy lentil soup and fresh coconut chutney.',
    price: 180,
    category: 'breakfast',
    isVeg: true,
    allergens: ['gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Idli_Sambar.jpg',
    preparationTime: 15,
    sortOrder: 1,
    calories: 220,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: ['Artisanal Recipe'],
    flavorProfile: ['Tangy & Zesty', 'Fresh & Herbaceous'],
    diningOccasion: ['Quick & Light Bite', 'Executive Business Lunch']
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy golden crepe filled with spiced potato filling, served with sambar and chutney.',
    price: 220,
    category: 'breakfast',
    isVeg: true,
    allergens: ['gluten'],
    tags: ['popular', 'chef-special'],
    isAvailable: true,
    image: '/images/MasalaDosa.jpg',
    preparationTime: 20,
    sortOrder: 2,
    calories: 310,
    workoutTags: ['Light & Fresh'],
    badge: 'Bestseller',
    chefSelection: ["Chef's Special"],
    flavorProfile: ['Tangy & Zesty', 'Spicy & Fiery'],
    diningOccasion: ['Quick & Light Bite', 'Family Feast']
  },
  {
    name: 'Chicken Keema Dosa',
    description: 'Crispy dosa stuffed with spiced minced chicken, onions and fresh herbs.',
    price: 320,
    category: 'breakfast',
    isVeg: false,
    allergens: ['gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Chicken_Keema_Dosa.jpg',
    preparationTime: 25,
    sortOrder: 3,
    calories: 430,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    chefSelection: ['Executive Signature'],
    flavorProfile: ['Spicy & Fiery', 'Umami Savory'],
    diningOccasion: ['Family Feast', 'Quick & Light Bite']
  },
  // ── Lunch ──
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in a rich, creamy tomato-based gravy. A North Indian classic.',
    price: 380,
    category: 'lunch',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular', 'chef-special'],
    isAvailable: true,
    image: '/images/Paneer_Butter_Masala.jpg',
    preparationTime: 25,
    sortOrder: 1,
    calories: 520,
    workoutTags: ['Indulgent'],
    badge: "Chef's Pick",
    chefSelection: ["Chef's Special", 'Artisanal Recipe'],
    flavorProfile: ['Velvety & Creamy', 'Sweet & Delicate'],
    diningOccasion: ['Family Feast', 'Romantic Dinner']
  },
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a velvety, mildly spiced tomato and cream sauce.',
    price: 420,
    category: 'lunch',
    isVeg: false,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Butter_Chicken.jpg',
    preparationTime: 30,
    sortOrder: 2,
    calories: 590,
    workoutTags: ['Post-Workout Fuel'],
    badge: 'Bestseller',
    chefSelection: ['Executive Signature', 'Sommelier Choice'],
    flavorProfile: ['Velvety & Creamy', 'Smoky & Rich'],
    diningOccasion: ['Family Feast', 'Celebration & Gala']
  },
  {
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice layered with slow-cooked chicken in dum style. A royal delicacy.',
    price: 480,
    category: 'lunch',
    isVeg: false,
    allergens: ['gluten'],
    tags: ['chef-special', 'popular'],
    isAvailable: true,
    image: '/images/Hyderabadi_Chicken_Biryani.jpg',
    preparationTime: 45,
    sortOrder: 3,
    calories: 640,
    workoutTags: ['Post-Workout Fuel'],
    badge: "Chef's Pick",
    chefSelection: ["Chef's Special", 'Masterclass Creation'],
    flavorProfile: ['Smoky & Rich', 'Spicy & Fiery', 'Umami Savory'],
    diningOccasion: ['Celebration & Gala', 'Family Feast', 'Executive Business Lunch']
  },
  // ── Dinner ──
  {
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese in a smoky, spiced masala sauce. Perfect for a fine dining evening.',
    price: 420,
    category: 'dinner',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['chef-special'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 30,
    sortOrder: 1,
    calories: 480,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    chefSelection: ["Chef's Special"],
    flavorProfile: ['Smoky & Rich', 'Spicy & Fiery'],
    diningOccasion: ['Romantic Dinner', 'Executive Business Lunch']
  },
  {
    name: 'Coastal Fish Curry',
    description: 'Fresh catch cooked in a coconut milk base with tangy kokum and coastal spices.',
    price: 540,
    category: 'dinner',
    isVeg: false,
    allergens: ['fish'],
    tags: ['seasonal', 'chef-special'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 35,
    sortOrder: 2,
    calories: 410,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    chefSelection: ['Seasonal Highlight', 'Sommelier Choice'],
    flavorProfile: ['Tangy & Zesty', 'Fresh & Herbaceous'],
    diningOccasion: ['Romantic Dinner', 'Celebration & Gala']
  },
  {
    name: 'Dal Makhani',
    description: 'Slow-simmered black lentils in a rich buttery tomato sauce, finished with cream.',
    price: 340,
    category: 'dinner',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 40,
    sortOrder: 3,
    calories: 380,
    workoutTags: ['Indulgent'],
    badge: null,
    chefSelection: ['Artisanal Recipe'],
    flavorProfile: ['Velvety & Creamy', 'Smoky & Rich'],
    diningOccasion: ['Family Feast', 'Late Night Indulgence']
  },
  // ── Desserts ──
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup. A timeless classic.',
    price: 160,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy', 'gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Gulab_Jamun.jpg',
    preparationTime: 10,
    sortOrder: 1,
    calories: 300,
    workoutTags: ['Indulgent'],
    badge: 'Bestseller',
    chefSelection: ['Artisanal Recipe'],
    flavorProfile: ['Sweet & Delicate', 'Velvety & Creamy'],
    diningOccasion: ['Celebration & Gala', 'Late Night Indulgence']
  },
  {
    name: 'Kulfi',
    description: 'Traditional Indian ice cream in pistachio and rose flavour, served on a stick.',
    price: 180,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy', 'nuts'],
    tags: ['popular', 'seasonal'],
    isAvailable: true,
    image: '/images/Kulfi.jpg',
    preparationTime: 5,
    sortOrder: 2,
    calories: 270,
    workoutTags: ['Indulgent'],
    badge: null,
    chefSelection: ['Seasonal Highlight'],
    flavorProfile: ['Sweet & Delicate', 'Fresh & Herbaceous'],
    diningOccasion: ['Late Night Indulgence', 'Family Feast']
  },
  {
    name: 'Rasmalai',
    description: 'Delicate cottage cheese discs floating in saffron-infused chilled milk.',
    price: 200,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['chef-special'],
    isAvailable: true,
    image: '/images/Rasmalai.jpg',
    preparationTime: 10,
    sortOrder: 3,
    calories: 260,
    workoutTags: ['Indulgent'],
    badge: null,
    chefSelection: ["Chef's Special", 'Executive Signature'],
    flavorProfile: ['Sweet & Delicate', 'Velvety & Creamy'],
    diningOccasion: ['Romantic Dinner', 'Celebration & Gala']
  },
  // ── Drinks ──
  {
    name: 'Mango Lassi',
    description: 'Thick yogurt blended with fresh Alphonso mango pulp and a hint of cardamom.',
    price: 150,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular', 'seasonal'],
    isAvailable: true,
    image: '/images/Mango_Lassi.jpg',
    preparationTime: 5,
    sortOrder: 1,
    calories: 210,
    workoutTags: ['Pre-Workout Energy'],
    badge: null,
    chefSelection: ['Seasonal Highlight'],
    flavorProfile: ['Tangy & Zesty', 'Sweet & Delicate'],
    diningOccasion: ['Quick & Light Bite', 'Family Feast']
  },
  {
    name: 'Masala Chai',
    description: 'Spiced Indian tea brewed with ginger, cardamom, cinnamon and full cream milk.',
    price: 80,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Masala_Chai.jpg',
    preparationTime: 5,
    sortOrder: 2,
    calories: 90,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: ['Artisanal Recipe'],
    flavorProfile: ['Fresh & Herbaceous', 'Spicy & Fiery'],
    diningOccasion: ['Quick & Light Bite', 'Executive Business Lunch']
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Chilled sparkling water with freshly squeezed lime, mint and your choice of sweet or salted.',
    price: 100,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Fresh_Lime_Soda.jpg',
    preparationTime: 3,
    sortOrder: 3,
    calories: 60,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: [],
    flavorProfile: ['Tangy & Zesty', 'Fresh & Herbaceous'],
    diningOccasion: ['Quick & Light Bite', 'Late Night Indulgence']
  },
  {
    name: 'Virgin Mojito',
    description: 'Muddled fresh mint with lime juice, sugar and club soda. Refreshingly cool.',
    price: 180,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: [],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 5,
    sortOrder: 4,
    calories: 70,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: [],
    flavorProfile: ['Tangy & Zesty', 'Fresh & Herbaceous'],
    diningOccasion: ['Romantic Dinner', 'Celebration & Gala']
  },
  {
    name: 'Filter Coffee',
    description: 'South Indian filter coffee — decoction brewed from dark roast, served with frothy milk.',
    price: 90,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 5,
    sortOrder: 5,
    calories: 85,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: ['Artisanal Recipe'],
    flavorProfile: ['Smoky & Rich', 'Umami Savory'],
    diningOccasion: ['Quick & Light Bite', 'Executive Business Lunch']
  },
  {
    name: 'Kokum Sharbat',
    description: 'Chilled kokum concentrate with cumin and rock salt — a Konkan coastal digestive.',
    price: 120,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: ['seasonal', 'new'],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 3,
    sortOrder: 6,
    calories: 50,
    workoutTags: ['Light & Fresh'],
    badge: null,
    chefSelection: ['Seasonal Highlight'],
    flavorProfile: ['Tangy & Zesty', 'Fresh & Herbaceous'],
    diningOccasion: ['Quick & Light Bite', 'Executive Business Lunch']
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lighthouse');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await MenuItem.deleteMany();
    await Review.deleteMany();

    // Seed users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@thelighthouse.com',
        password: 'Admin@123',
        phone: '9876543210',
        role: 'admin',
        dietaryPreference: 'all'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        dietaryPreference: 'veg'
      }
    ]);
    console.log('👤 Users seeded:', users.length);

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
    console.log('🪑 Tables seeded:', tables.length);

    // Seed menu items
    // Note: rating, reviewCount, and orderCount are NOT set here —
    // they use the schema defaults (0) and populate dynamically as
    // real reviews/orders come in through the app.
    const menu = await MenuItem.create(menuItems);
    console.log('🍽️  Menu items seeded:', menu.length);

    // Seed sample reviews (restaurant-level, not tied to a specific dish —
    // see PR notes on Review model scope)
    const reviews = await Review.create([
      {
        user: users[1]._id,
        rating: 5,
        comment: 'The Hyderabadi Biryani is absolutely divine. Best fine dining experience in the city!',
      },
      {
        user: users[1]._id,
        rating: 5,
        comment: 'Rasmalai was heavenly. The ambience matches the quality of food perfectly.',
      }
    ]);
    console.log('⭐ Reviews seeded:', reviews.length);

    console.log('\n✅ Seed data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
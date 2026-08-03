const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./src/config/database');
connectDB();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173', // React dev server
  'http://localhost:5500',  // Legacy Live Server
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'The Lighthouse API is running',
    timestamp: new Date().toISOString(),
    routes: ['/api/auth', '/api/reservations', '/api/menu', '/api/reviews', '/api/cart']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌊 The Lighthouse API running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Menu API:     http://localhost:${PORT}/api/menu`);
  console.log(`🛒 Cart API:     http://localhost:${PORT}/api/cart`);
  console.log(`📅 Reservations: http://localhost:${PORT}/api/reservations\n`);
});

module.exports = app;
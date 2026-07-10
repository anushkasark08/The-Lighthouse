const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const menuRoutes = require('./routes/menu');

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/menu', menuRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;

// Simple reservation storage in-memory for illustration (and mongoose models in tests if needed)
const reservations = [];

const createReservation = async (req, res) => {
  const { name, email, phone, date, time, guests } = req.body;

  if (!name || !email || !date || !time || !guests) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const reservation = { id: reservations.length + 1, name, email, phone, date, time, guests };
  reservations.push(reservation);

  return res.status(201).json({ message: 'Reservation created successfully', reservation });
};

const getReservations = async (req, res) => {
  return res.status(200).json(reservations);
};

module.exports = {
  createReservation,
  getReservations
};

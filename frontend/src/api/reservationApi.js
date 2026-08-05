import api from './client';

export const getAvailableSlots = (date, guests, seatingPreference) =>
  api.get('/reservations/slots', { params: { date, guests, seatingPreference } });

export const createReservation = (data) => api.post('/reservations', data);

export const getMyReservations = () => api.get('/reservations');

export const cancelReservation = (id) => api.delete(`/reservations/${id}`);

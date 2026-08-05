const { createReservation } = require('./reservationController');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const availabilityService = require('../services/availabilityService');
const emailService = require('../services/emailService');

jest.mock('../models/Reservation');
jest.mock('../models/Table');
jest.mock('../services/availabilityService');
jest.mock('../services/emailService');

describe('reservationController - createReservation', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    // Use a date in the future to pass the future date check
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2); // 2 days in the future
    const dateStr = futureDate.toISOString().split('T')[0];

    req = {
      user: {
        id: 'user123',
        email: 'user@example.com'
      },
      body: {
        date: dateStr,
        time: '19:00',
        guests: 4,
        specialRequests: ''
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('should accept reservation when specialRequests is empty', async () => {
    req.body.specialRequests = '';

    availabilityService.getAvailableSlots.mockResolvedValue({
      success: true,
      data: {
        slots: [{ time: '19:00', available: true, tablesAvailable: 2 }]
      }
    });

    Table.findOne.mockResolvedValue({ _id: 'table123', capacity: 4, isActive: true });

    Reservation.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });

    Reservation.create.mockResolvedValue({
      _id: 'res123',
      user: 'user123',
      table: 'table123',
      date: new Date(req.body.date),
      time: '19:00',
      guests: 4,
      specialRequests: '',
      status: 'confirmed'
    });
    Reservation.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis()
    });

    emailService.sendReservationConfirmation.mockResolvedValue();

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: expect.any(String)
    }));
  });

  test('should accept reservation when specialRequests is exactly 500 characters', async () => {
    req.body.specialRequests = 'a'.repeat(500);

    availabilityService.getAvailableSlots.mockResolvedValue({
      success: true,
      data: {
        slots: [{ time: '19:00', available: true, tablesAvailable: 2 }]
      }
    });

    Table.findOne.mockResolvedValue({ _id: 'table123', capacity: 4, isActive: true });

    Reservation.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });

    Reservation.create.mockResolvedValue({
      _id: 'res123',
      specialRequests: 'a'.repeat(500)
    });
    Reservation.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis()
    });

    emailService.sendReservationConfirmation.mockResolvedValue();

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });

  test('should reject reservation with HTTP 400 when specialRequests is 501 characters', async () => {
    req.body.specialRequests = 'a'.repeat(501);

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Special requests cannot exceed 500 characters'
    });

    expect(availabilityService.getAvailableSlots).not.toHaveBeenCalled();
    expect(Reservation.create).not.toHaveBeenCalled();
  });

  test('should reject reservation with HTTP 400 when specialRequests exceeds 1000 characters', async () => {
    req.body.specialRequests = 'a'.repeat(1005);

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Special requests cannot exceed 500 characters'
    });

    expect(Reservation.create).not.toHaveBeenCalled();
  });
});

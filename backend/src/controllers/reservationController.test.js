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

  test('should handle concurrent table collision (E11000) by selecting next available table', async () => {
    availabilityService.getAvailableSlots.mockResolvedValue({
      success: true,
      data: {
        slots: [{ time: '19:00', available: true, tablesAvailable: 2 }]
      }
    });

    Table.findOne
      .mockResolvedValueOnce({ _id: 'table1', capacity: 4, isActive: true })
      .mockResolvedValueOnce({ _id: 'table2', capacity: 4, isActive: true });

    Reservation.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });

    const duplicateError = new Error('E11000 duplicate key error collection');
    duplicateError.code = 11000;

    Reservation.create
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce({
        _id: 'res456',
        user: 'user123',
        table: 'table2',
        date: new Date(req.body.date),
        time: '19:00',
        guests: 4,
        status: 'confirmed'
      });

    Reservation.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis()
    });

    emailService.sendReservationConfirmation.mockResolvedValue();

    await createReservation(req, res);

    expect(Reservation.create).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });

  describe('Concurrency & Parallel Request Simulation', () => {
    test('concurrent requests for same slot assign distinct tables when multiple exist', async () => {
      const dbTables = [
        { _id: 'table1', capacity: 4, isActive: true },
        { _id: 'table2', capacity: 4, isActive: true }
      ];
      const dbReservations = [];

      availabilityService.getAvailableSlots.mockResolvedValue({
        success: true,
        data: { slots: [{ time: '19:00', available: true, tablesAvailable: 2 }] }
      });

      Reservation.find.mockImplementation(({ date, time, status }) => ({
        select: jest.fn().mockImplementation(() => {
          const active = dbReservations.filter(
            r => r.time === time && (status && status.$in ? status.$in.includes(r.status) : r.status !== 'cancelled')
          );
          return Promise.resolve(active.map(r => ({ table: r.table })));
        })
      }));

      Table.findOne.mockImplementation(({ _id, capacity }) => {
        const excluded = (_id && _id.$nin) ? _id.$nin : [];
        const minCap = (typeof capacity === 'object' && capacity.$gte) ? capacity.$gte : capacity;
        const match = dbTables.find(t => !excluded.includes(t._id) && t.capacity >= minCap);
        return Promise.resolve(match || null);
      });

      Reservation.create.mockImplementation((data) => {
        const duplicate = dbReservations.find(
          r => r.table === data.table.toString() && r.time === data.time && ['pending', 'confirmed'].includes(r.status)
        );
        if (duplicate) {
          const err = new Error('E11000 duplicate key error collection');
          err.code = 11000;
          return Promise.reject(err);
        }
        const created = { ...data, _id: `res_${Date.now()}_${Math.random()}` };
        dbReservations.push(created);
        return Promise.resolve(created);
      });

      Reservation.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      emailService.sendReservationConfirmation.mockResolvedValue();

      const req1 = { ...req, user: { id: 'user1', email: 'u1@ex.com' } };
      const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

      const req2 = { ...req, user: { id: 'user2', email: 'u2@ex.com' } };
      const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

      await Promise.all([
        createReservation(req1, res1),
        createReservation(req2, res2)
      ]);

      expect(res1.status).toHaveBeenCalledWith(201);
      expect(res2.status).toHaveBeenCalledWith(201);

      expect(dbReservations.length).toBe(2);
      const assignedTables = dbReservations.map(r => r.table);
      expect(assignedTables).toContain('table1');
      expect(assignedTables).toContain('table2');
      expect(assignedTables[0]).not.toBe(assignedTables[1]);
    });

    test('concurrent requests for same slot assign table to 1st and return 400 (not 500) to 2nd when 1 table remains', async () => {
      const dbTables = [
        { _id: 'table1', capacity: 4, isActive: true }
      ];
      const dbReservations = [];

      availabilityService.getAvailableSlots.mockResolvedValue({
        success: true,
        data: { slots: [{ time: '19:00', available: true, tablesAvailable: 1 }] }
      });

      Reservation.find.mockImplementation(({ date, time, status }) => ({
        select: jest.fn().mockImplementation(() => {
          const active = dbReservations.filter(
            r => r.time === time && (status && status.$in ? status.$in.includes(r.status) : r.status !== 'cancelled')
          );
          return Promise.resolve(active.map(r => ({ table: r.table })));
        })
      }));

      Table.findOne.mockImplementation(({ _id, capacity }) => {
        const excluded = (_id && _id.$nin) ? _id.$nin : [];
        const minCap = (typeof capacity === 'object' && capacity.$gte) ? capacity.$gte : capacity;
        const match = dbTables.find(t => !excluded.includes(t._id) && t.capacity >= minCap);
        return Promise.resolve(match || null);
      });

      Reservation.create.mockImplementation((data) => {
        const duplicate = dbReservations.find(
          r => r.table === data.table.toString() && r.time === data.time && ['pending', 'confirmed'].includes(r.status)
        );
        if (duplicate) {
          const err = new Error('E11000 duplicate key error collection');
          err.code = 11000;
          return Promise.reject(err);
        }
        const created = { ...data, _id: `res_${Date.now()}_${Math.random()}` };
        dbReservations.push(created);
        return Promise.resolve(created);
      });

      Reservation.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      emailService.sendReservationConfirmation.mockResolvedValue();

      const req1 = { ...req, user: { id: 'user1', email: 'u1@ex.com' } };
      const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

      const req2 = { ...req, user: { id: 'user2', email: 'u2@ex.com' } };
      const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

      await Promise.all([
        createReservation(req1, res1),
        createReservation(req2, res2)
      ]);

      const statuses = [res1.status.mock.calls[0][0], res2.status.mock.calls[0][0]];
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);
      expect(statuses).not.toContain(500);

      expect(dbReservations.length).toBe(1);
      expect(dbReservations[0].table).toBe('table1');
    });
  });
});

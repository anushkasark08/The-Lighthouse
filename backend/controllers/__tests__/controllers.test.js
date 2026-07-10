const authController = require('../authController');
const reservationController = require('../reservationController');
const menuController = require('../menuController');

describe('Backend Controllers Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('authController', () => {
    test('register should return 400 if validation fails', async () => {
      req.body = { username: '' };
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });

    test('register should successfully register user', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: 'testuser' }));
    });

    test('login should fail with invalid credentials', async () => {
      req.body = { username: 'testuser', password: 'wrong' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('login should succeed with valid credentials', async () => {
      req.body = { username: 'admin', password: 'password' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  });

  describe('reservationController', () => {
    test('createReservation should return 400 if fields are missing', async () => {
      req.body = { name: 'Vansh' };
      await reservationController.createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createReservation should succeed with valid input', async () => {
      req.body = {
        name: 'Vansh',
        email: 'vansh@example.com',
        phone: '1234567890',
        date: '2026-07-20',
        time: '19:00',
        guests: 4
      };
      await reservationController.createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('getReservations should retrieve list', async () => {
      await reservationController.getReservations(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('menuController', () => {
    test('getMenuItems should return list of menu items', async () => {
      await menuController.getMenuItems(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});

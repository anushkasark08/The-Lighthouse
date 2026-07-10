/** @jest-environment node */
const request = require('supertest');
const app = require('../app');
const db = require('../db.setup');

describe('Backend API Integration Tests', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.close();
  });

  describe('GET /api/menu', () => {
    test('should return all menu items', async () => {
      const response = await request(app)
        .get('/api/menu')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register a user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'password123' })
        .expect(201);

      expect(response.body.username).toBe('newuser');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return jwt token on valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });
  });

  describe('POST /api/reservations', () => {
    test('should successfully create a new reservation', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({
          name: 'Vansh',
          email: 'vansh@example.com',
          phone: '1234567890',
          date: '2026-07-20',
          time: '19:00',
          guests: 4
        })
        .expect(201);

      expect(response.body.reservation.name).toBe('Vansh');
    });
  });
});

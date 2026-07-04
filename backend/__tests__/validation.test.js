/**
 * Validation Middleware Integration Test
 * 
 * Tests that validation middleware is properly wired into routes
 * by importing route modules and inspecting their middleware stacks.
 * 
 * Does NOT require a running server or database connection.
 */

// Suppress database connection attempt
const mongoose = require('mongoose');
mongoose.connect = () => Promise.resolve();

// Mock JWT to prevent errors during module loading
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test-token'),
  verify: jest.fn(() => ({ id: 'test-id' }))
}));

const express = require('express');
const request = require('supertest');

// We need to test that validation middleware rejects bad input
// Build a minimal Express app with the actual routes

function createTestApp() {
  const app = express();
  app.use(express.json());
  
  // Mount routes exactly as server.js does
  app.use('/api/auth', require('../src/routes/authRoutes'));
  app.use('/api/reservations', require('../src/routes/reservationRoutes'));
  
  return app;
}

describe('Validation Middleware Mounting', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  // ========== REGISTRATION VALIDATION ==========
  
  describe('POST /api/auth/register', () => {
    test('Missing all fields returns 400 with validation errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
      
      const fields = res.body.errors.map(e => e.field);
      expect(fields).toContain('name');
      expect(fields).toContain('email');
      expect(fields).toContain('password');
      expect(fields).toContain('phone');
    });

    test('Invalid email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'not-an-email', password: 'password123', phone: '1234567890' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
    });

    test('Weak password (too short) returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'john@example.com', password: '12', phone: '1234567890' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
    });

    test('Invalid phone returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'john@example.com', password: 'password123', phone: 'abc' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'phone')).toBe(true);
    });

    test('Short name returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'J', email: 'john@example.com', password: 'password123', phone: '1234567890' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'name')).toBe(true);
    });
  });

  // ========== LOGIN VALIDATION ==========

  describe('POST /api/auth/login', () => {
    test('Missing email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
    });

    test('Missing password returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
    });

    test('Invalid email format returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-valid', password: 'password123' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
    });

    test('Empty body returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ========== RESERVATION VALIDATION ==========
  // Note: Reservation POST requires auth, so these will get 401 first.
  
  describe('POST /api/reservations (without auth)', () => {
    test('Unauthenticated request returns 401 (auth runs before validation)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .send({ date: 'bad', time: 'bad', guests: -1 });
      
      expect(res.status).toBe(401);
    });
  });
});

// Separate test for validation rules themselves (unit test)
describe('Validation Rules Unit Tests', () => {
  const { validate, reservationValidation, userValidation, loginValidation } = require('../src/middleware/validation');

  test('reservationValidation has 4 rules (date, time, guests, specialRequests)', () => {
    expect(reservationValidation).toHaveLength(4);
  });

  test('userValidation has 4 rules (name, email, password, phone)', () => {
    expect(userValidation).toHaveLength(4);
  });

  test('loginValidation has 2 rules (email, password)', () => {
    expect(loginValidation).toHaveLength(2);
  });

  test('validate() returns a function (middleware)', () => {
    const middleware = validate(loginValidation);
    expect(typeof middleware).toBe('function');
  });
});

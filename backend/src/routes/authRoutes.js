const express = require('express');
const router = express.Router();
const { register, login, getMe, updateDietaryProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, userValidation, loginValidation } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

const authRateLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', authRateLimiter, validate(userValidation), register);
router.post('/login', authRateLimiter, validate(loginValidation), login);
router.get('/me', protect, getMe);
router.patch('/me/dietary', protect, updateDietaryProfile);

module.exports = router;

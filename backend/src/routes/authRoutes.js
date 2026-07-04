const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, userValidation, loginValidation } = require('../middleware/validation');

router.post('/register', validate(userValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', protect, getMe);

module.exports = router;
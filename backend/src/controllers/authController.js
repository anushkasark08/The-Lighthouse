const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, dietaryPreference, allergenAlerts } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      dietaryPreference: dietaryPreference || 'all',
      allergenAlerts: allergenAlerts || []
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dietaryPreference: user.dietaryPreference,
        allergenAlerts: user.allergenAlerts
      }
    });
} catch (error) {
    console.error('Registration Error:', error); // Log internally for visibility

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid registration details and make sure your email and phone are correct.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Unable to create account at the moment. Please try again later.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dietaryPreference: user.dietaryPreference,
        allergenAlerts: user.allergenAlerts
      }
    });
  } catch (error) {
    console.error('Login Error:', error); // Log internally for debugging
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error); // Log internally for debugging
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again later.'
    });
  }
};

// @desc    Update dietary profile
// @route   PATCH /api/auth/me/dietary
// @access  Private
exports.updateDietaryProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    const { dietaryPreference, allergenAlerts } = req.body;

    const fieldsToUpdate = {};

    const ALLOWED_DIETARY = ['all', 'veg', 'non-veg'];
    const ALLOWED_ALLERGENS = ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish'];

    if (dietaryPreference !== undefined) {
      if (!ALLOWED_DIETARY.includes(dietaryPreference)) {
        return res.status(400).json({ success: false, error: `Invalid dietaryPreference. Allowed: ${ALLOWED_DIETARY.join(', ')}` });
      }
      fieldsToUpdate.dietaryPreference = dietaryPreference;
    }

    if (allergenAlerts !== undefined) {
      if (!Array.isArray(allergenAlerts) || !allergenAlerts.every(a => ALLOWED_ALLERGENS.includes(a))) {
        return res.status(400).json({ success: false, error: `Invalid allergenAlerts. Allowed: ${ALLOWED_ALLERGENS.join(', ')}` });
      }
      fieldsToUpdate.allergenAlerts = allergenAlerts;
    }

if (Object.keys(fieldsToUpdate).length === 0) {
  return res.status(400).json({
    success: false,
    error: 'No fields provided to update.'
  });
}

const user = await User.findByIdAndUpdate(
  req.user.id,
  fieldsToUpdate,
  {
    new: true,
    runValidators: true
  }
);
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('UpdateDietaryProfile Error:', error); // Log internally for debugging
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred. Please try again later.' 
    });
  }
};
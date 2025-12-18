const User = require('../models/User');
const jwt = require('jsonwebtoken');

// IN-MEMORY MOCK DATABASE (Fallback)
const mockUsers = [];

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'dev_secret_fallback_123', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const isDbConnected = () => require('mongoose').connection.readyState === 1;

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role, bloodGroup } = req.body;

    if (isDbConnected()) {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Create new user
      user = new User({
        name, email, password, phone, city, role,
        bloodGroup: role === 'donor' ? bloodGroup : null,
      });

      await user.save();
      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true, message: 'Registration successful', token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } else {
      // MOCK FALLBACK
      if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already registered (Demo Mode)' });
      }

      const newUser = {
        _id: 'mock_' + Date.now(),
        name, email, password, phone, city, role,
        bloodGroup: role === 'donor' ? bloodGroup : null,
        totalDonations: 0
      };

      mockUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true, message: 'Registration successful (Demo Mode)', token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const token = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true, message: 'Login successful', token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, bloodGroup: user.bloodGroup },
      });
    } else {
      // MOCK FALLBACK
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials (Demo Mode)' });
      }
      const token = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true, message: 'Login successful (Demo Mode)', token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, bloodGroup: user.bloodGroup },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({
        success: true,
        user: {
          id: user._id, name: user.name, email: user.email, phone: user.phone,
          city: user.city, role: user.role, bloodGroup: user.bloodGroup,
          totalDonations: user.totalDonations, lastDonationDate: user.lastDonationDate,
        },
      });
    } else {
      // MOCK FALLBACK
      const user = mockUsers.find(u => u._id === req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found (Demo Mode)' });
      return res.status(200).json({
        success: true,
        user: {
          id: user._id, name: user.name, email: user.email, phone: user.phone,
          city: user.city, role: user.role, bloodGroup: user.bloodGroup,
          totalDonations: user.totalDonations,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   GET /api/auth/me
router.get('/me', auth, authController.getCurrentUser);

// @route   GET /api/auth/donors
router.get('/donors', authController.findDonors);

// @route   POST /api/auth/request
router.post('/request', auth, authController.sendRequest);

// @route   GET /api/auth/notifications
router.get('/notifications', auth, authController.getNotifications);

// @route   GET /api/auth/sent-requests
router.get('/sent-requests', auth, authController.getSentRequests);

module.exports = router;

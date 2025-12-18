const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');

// @route   POST /api/emergencies
router.post('/', auth, emergencyController.createEmergency);

// @route   GET /api/emergencies
router.get('/', emergencyController.getEmergencies);

// @route   POST /api/emergencies/respond
router.post('/respond', auth, emergencyController.respondToEmergency);

// @route   PUT /api/emergencies/:id/status
router.put('/:id/status', auth, emergencyController.updateEmergencyStatus);

module.exports = router;

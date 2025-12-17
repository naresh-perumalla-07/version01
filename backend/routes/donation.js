const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');

// @route   POST /api/donations
router.post('/', auth, donationController.recordDonation);

// @route   GET /api/donations/history
router.get('/history', auth, donationController.getDonationHistory);

// @route   GET /api/donations/hospital
router.get('/hospital', auth, donationController.getHospitalDonations);

module.exports = router;

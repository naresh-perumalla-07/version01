const Donation = require('../models/Donation');
const User = require('../models/User');
const Emergency = require('../models/Emergency');

// @route   POST /api/donations
// @desc    Record a donation
// @access  Private
exports.recordDonation = async (req, res, next) => {
  try {
    const { emergencyId, unitsProvided, hospitalId } = req.body;

    // Find emergency
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found',
      });
    }

    // Create donation record
    const donation = new Donation({
      donorId: req.userId,
      emergencyId,
      bloodGroup: emergency.bloodGroup,
      unitsProvided,
      hospitalId,
      status: 'completed',
    });

    await donation.save();

    // Update donor stats
    const user = await User.findById(req.userId);
    user.totalDonations += 1;
    user.lastDonationDate = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      donation: {
        id: donation._id,
        bloodGroup: donation.bloodGroup,
        unitsProvided: donation.unitsProvided,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/history
// @desc    Get donor's donation history
// @access  Private
exports.getDonationHistory = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.userId })
      .populate('emergencyId', 'patientName hospitalName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/hospital
// @desc    Get hospital's donations received
// @access  Private
exports.getHospitalDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ hospitalId: req.userId })
      .populate('donorId', 'name phone bloodGroup')
      .populate('emergencyId', 'patientName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

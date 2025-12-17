const Emergency = require('../models/Emergency');
const User = require('../models/User');

// IN-MEMORY MOCK DATABASE (Fallback)
const mockEmergencies = [];

const isDbConnected = () => require('mongoose').connection.readyState === 1;

// Helper: Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @route   POST /api/emergencies
// @desc    Create emergency request
// @access  Private
exports.createEmergency = async (req, res, next) => {
  try {
    const {
      patientName, bloodGroup, unitsNeeded, condition, urgency,
      hospitalName, landmark, contactPerson, contactPhone, latitude, longitude,
    } = req.body;

    const urgencyMap = { critical: 15, urgent: 30, severe: 60 };
    const expiresAt = new Date(Date.now() + urgencyMap[urgency] * 60000);

    if (isDbConnected()) {
      const emergency = new Emergency({
        patientName, bloodGroup, unitsNeeded, condition, urgency,
        hospitalName, landmark, contactPerson, contactPhone, latitude, longitude,
        createdBy: req.userId, expiresAt,
      });

      await emergency.save();

      return res.status(201).json({
        success: true, message: 'Emergency created successfully',
        emergency: { id: emergency._id, patientName: emergency.patientName, bloodGroup: emergency.bloodGroup },
      });
    } else {
      // MOCK FALLBACK
      const newEmergency = {
        _id: 'emg_' + Date.now(),
        patientName, bloodGroup, unitsNeeded, condition, urgency,
        hospitalName, landmark, contactPerson, contactPhone, latitude, longitude,
        createdBy: req.userId, expiresAt, status: 'active', respondents: [],
        createdAt: new Date()
      };

      mockEmergencies.unshift(newEmergency); // Add to beginning

      return res.status(201).json({
        success: true, message: 'Emergency created successfully (Demo Mode)',
        emergency: { id: newEmergency._id, patientName: newEmergency.patientName, bloodGroup: newEmergency.bloodGroup },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/emergencies
// @desc    Get all active emergencies
// @access  Public
exports.getEmergencies = async (req, res, next) => {
  try {
    const { bloodGroup, latitude, longitude, status } = req.query;

    if (isDbConnected()) {
      let filter = { status: status || 'active' };
      if (bloodGroup) filter.bloodGroup = bloodGroup;

      const emergencies = await Emergency.find(filter)
        .populate('createdBy', 'name city phone')
        .sort({ createdAt: -1 })
        .limit(20);

      let result = emergencies;
      if (latitude && longitude) {
        result = emergencies.map(e => {
          const dist = calculateDistance(parseFloat(latitude), parseFloat(longitude), e.latitude, e.longitude);
          return { ...e.toObject(), distance: dist.toFixed(2) };
        });
      }

      return res.status(200).json({ success: true, count: result.length, emergencies: result });
    } else {
      // MOCK FALLBACK
      let result = mockEmergencies.filter(e => e.status === (status || 'active'));
      if (bloodGroup) result = result.filter(e => e.bloodGroup === bloodGroup);

      if (latitude && longitude) {
        result = result.map(e => {
          const dist = calculateDistance(parseFloat(latitude), parseFloat(longitude), e.latitude, e.longitude);
          return { ...e, distance: dist.toFixed(2) };
        });
      }

      return res.status(200).json({ success: true, count: result.length, emergencies: result });
    }
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/emergencies/respond
// @desc    Donor responds to emergency
// @access  Private
exports.respondToEmergency = async (req, res, next) => {
  try {
    const { emergencyId } = req.body;

    if (isDbConnected()) {
      const emergency = await Emergency.findById(emergencyId);
      if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

      if (emergency.respondents.some(r => r.donorId.toString() === req.userId)) {
        return res.status(400).json({ success: false, message: 'You already responded to this emergency' });
      }

      emergency.respondents.push({ donorId: req.userId, status: 'responded' });
      await emergency.save();

      return res.status(200).json({
        success: true, message: 'Response recorded successfully',
        respondents: emergency.respondents.length,
      });
    } else {
      // MOCK FALLBACK
      const emergency = mockEmergencies.find(e => e._id === emergencyId);
      if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found (Demo Mode)' });

      if (emergency.respondents.some(r => r.donorId === req.userId)) {
        return res.status(400).json({ success: false, message: 'You already responded to this emergency (Demo Mode)' });
      }

      emergency.respondents.push({ donorId: req.userId, status: 'responded' });

      return res.status(200).json({
        success: true, message: 'Response recorded successfully (Demo Mode)',
        respondents: emergency.respondents.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

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
    const { name, email, password, phone, city, role, bloodGroup, age, gender, height, weight, address, unitsNeeded, latitude, longitude } = req.body;

    if (isDbConnected()) {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Create new user
      user = new User({
        name, email, password, phone, city, role,
        age, gender, height, weight, address, unitsNeeded,
        latitude, longitude, // Save Location
        bloodGroup: (role === 'donor' || role === 'person') ? bloodGroup : null,
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
        bloodGroup: (role === 'donor' || role === 'person') ? bloodGroup : null,
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
    console.error("❌ Registration Error:", error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }
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

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, city, phone, bloodGroup, age, height, weight, address, unitsNeeded } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name;
      if (city) user.city = city;
      if (phone) user.phone = phone;
      if (age) user.age = age;
      if (height) user.height = height;
      if (weight) user.weight = weight;
      if (unitsNeeded) user.unitsNeeded = unitsNeeded;
      if (address) user.address = { ...user.address, ...address };
      if (bloodGroup && (user.role === 'donor' || user.role === 'person')) user.bloodGroup = bloodGroup;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id, name: user.name, email: user.email, phone: user.phone,
          city: user.city, role: user.role, bloodGroup: user.bloodGroup,
          totalDonations: user.totalDonations,
        }
      });
    } else {
      // MOCK
      const user = mockUsers.find(u => u._id === req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found (Demo)' });

      if (name) user.name = name;
      if (city) user.city = city;
      if (phone) user.phone = phone;
      if (bloodGroup && (user.role === 'donor' || user.role === 'person')) user.bloodGroup = bloodGroup;

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully (Demo)',
        user: {
          id: user._id, name: user.name, email: user.email, phone: user.phone,
          city: user.city, role: user.role, bloodGroup: user.bloodGroup,
          totalDonations: user.totalDonations,
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const { getIo } = require('../socket'); // Import socket helper

// ... inside existing exports

// @route   GET /api/auth/donors
// @desc    Find donors nearby
// @access  Public
exports.findDonors = async (req, res, next) => {
  try {
    const { bloodGroup, latitude, longitude, radius } = req.query;

    if (isDbConnected()) {
      console.log("🔍 Search Params:", req.query);

      let query = { role: 'donor' };
      if (bloodGroup) query.bloodGroup = bloodGroup;
      
      // Text Search for City (Only if GPS is missing)
      // If GPS is present, we trust distance calculation instead of strict city string match
      if (req.query.location && (!latitude || !longitude)) {
          query.city = { $regex: req.query.location, $options: 'i' };
      }

      const donors = await User.find(query).select('name role bloodGroup latitude longitude city phone active');

      // Filter by distance if lat/lng provided
      // If user typed a city, we trust the city filter primarily. But we still calc distance if we can.
      let results = donors.map(donor => {
          const d = donor.toObject();
          if (latitude && longitude && donor.latitude && donor.longitude) {
              const dist = getDistance(latitude, longitude, donor.latitude, donor.longitude);
              d.distance = dist.toFixed(1) + ' km';
              d.rawDistance = dist;
          } else {
              d.distance = 'Unknown';
              d.rawDistance = 9999;
          }
          return d;
      });

      if (latitude && longitude) {
           results = results.sort((a, b) => a.rawDistance - b.rawDistance);
           // Only filter by radius if no specific city was requested. 
           // If I asked for "Tanuku", show me Tanuku even if it's 200km away.
           if (radius && !req.query.location) {
               results = results.filter(r => r.rawDistance <= Number(radius));
           }
      }

      console.log(`✅ Found ${results.length} donors.`);
      return res.status(200).json({ success: true, count: results.length, donors: results });
    } else {
       // Mock Logic...
       return res.status(200).json({ success: true, donors: [] });
    }
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/request
// @desc    Send blood request notification to donor
// @access  Private
exports.sendRequest = async (req, res, next) => {
    try {
        const { donorId, message, details } = req.body;
        const requesterId = req.userId; // Middleware provides this

        const requester = await User.findById(requesterId);
        
        // Notify via Socket
        try {
            console.log(`📨 Sending Request to ${donorId}`);
            const io = getIo();
            io.to(donorId).emit('blood_request', {
                requester: requester ? requester.name : "Someone",
                bloodGroup: details.bloodGroup,
                location: details.location,
                phone: details.contactPhone || "N/A",
                message: message
            });
            console.log(`🔔 Socket sent to ${donorId}`);
        } catch (sErr) {
            console.error("Socket Error:", sErr.message);
        }

        // PERSIST TO DB (Fallback)
        await User.findByIdAndUpdate(donorId, {
            $push: {
                notifications: {
                    type: 'request',
                    message: message,
                    details: {
                        requester: requester ? requester.name : "Someone",
                        bloodGroup: details.bloodGroup,
                        location: details.location,
                        phone: details.contactPhone || "N/A"
                    },
                    read: false,
                    createdAt: new Date()
                }
            }
        });
        console.log(`💾 Saved notification to DB for ${donorId}`);

        res.json({ success: true, message: "Request Sent to Donor!" });

    } catch (error) {
        next(error);
    }
};

// @route   GET /api/auth/notifications
// @desc    Get user notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('notifications');
        const sorted = user && user.notifications ? user.notifications.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
        res.status(200).json({ success: true, notifications: sorted });
    } catch (error) {
        next(error);
    }
};

// Haversine Formula for distance (in km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_cab_jwt_key_987654321_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a rider or driver
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role, vehicle } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '+1 555-0100',
      role: role || 'rider',
    };

    if (role === 'driver') {
      userData.isOnline = true;
      userData.isAvailable = true;
      if (vehicle) {
        userData.vehicle = {
          vehicleType: vehicle.vehicleType || 'UberGo',
          model: vehicle.model || 'Toyota Prius',
          plateNumber: vehicle.plateNumber || 'NYC-1092',
          color: vehicle.color || 'White',
          capacity: vehicle.capacity || 4,
        };
      }
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        vehicle: user.vehicle,
        isOnline: user.isOnline,
        walletBalance: user.walletBalance,
        rating: user.rating,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        vehicle: user.vehicle,
        isOnline: user.isOnline,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        rating: user.rating,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   PUT /api/auth/driver-status
// @desc    Toggle driver online/offline & update location
router.put('/driver-status', protect, async (req, res, next) => {
  try {
    const { isOnline, lat, lng, address } = req.body;
    const updateData = {};

    if (typeof isOnline === 'boolean') {
      updateData.isOnline = isOnline;
    }

    if (lat && lng) {
      updateData.currentLocation = {
        lat,
        lng,
        address: address || req.user.currentLocation?.address || 'Current Location',
        updatedAt: new Date(),
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/quick-login
// @desc    1-Click demo login
router.post('/quick-login', async (req, res, next) => {
  try {
    const { role } = req.body; // 'rider' or 'driver'
    const targetEmail = role === 'driver' ? 'driver@demo.com' : 'rider@demo.com';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      // Create on the fly if not yet seeded
      user = await User.create({
        name: role === 'driver' ? 'Alex Rivera (Pro Driver)' : 'Sarah Jenkins (Rider)',
        email: targetEmail,
        password: 'password123',
        phone: role === 'driver' ? '+1 (555) 432-8819' : '+1 (555) 892-2341',
        role: role || 'rider',
        isOnline: role === 'driver',
        isAvailable: true,
        vehicle: {
          vehicleType: 'UberGo',
          model: 'Toyota Camry Hybrid (Silver)',
          plateNumber: 'NYC-7842',
          color: 'Metallic Silver',
          capacity: 4,
        },
        currentLocation: {
          lat: 40.7128,
          lng: -74.006,
          address: 'Broadway & Wall St, Manhattan',
        },
        rating: 4.95,
        ratingCount: 342,
        walletBalance: role === 'rider' ? 120.0 : 45.0,
        totalEarnings: role === 'driver' ? 1420.5 : 0,
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

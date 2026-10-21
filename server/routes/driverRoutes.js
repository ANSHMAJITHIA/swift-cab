const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ride = require('../models/Ride');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/drivers/nearby
// @desc    Get nearby online drivers for map display
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    // Find all online drivers
    const drivers = await User.find({
      role: 'driver',
      isOnline: true,
    }).select('name vehicle currentLocation rating ratingCount isAvailable');

    // If coordinates provided, filter or adjust positions
    res.json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/drivers/stats
// @desc    Get driver earnings & ride stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Driver access required' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedRides = await Ride.find({
      driver: req.user._id,
      status: 'completed',
    });

    const todayRides = completedRides.filter((r) => new Date(r.completedAt) >= todayStart);
    const todayEarnings = todayRides.reduce((sum, r) => sum + (r.driverEarnings || 0), 0);
    const totalEarnings = completedRides.reduce((sum, r) => sum + (r.driverEarnings || 0), 0);

    // Recent payout transactions
    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'driver_payout',
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        todayEarnings: parseFloat(todayEarnings.toFixed(2)),
        todayRidesCount: todayRides.length,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalRidesCount: completedRides.length,
        walletBalance: req.user.walletBalance || 0,
        rating: req.user.rating || 4.9,
        ratingCount: req.user.ratingCount || 0,
        recentTransactions: transactions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/drivers/location
// @desc    Update driver current GPS location
router.put('/location', protect, async (req, res, next) => {
  try {
    const { lat, lng, heading = 0, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        currentLocation: {
          lat,
          lng,
          heading,
          address: address || 'Downtown',
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('driver:location_changed', {
        driverId: user._id,
        currentLocation: user.currentLocation,
      });
    }

    res.json({ success: true, location: user.currentLocation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

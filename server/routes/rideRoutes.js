const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const {
  calculateDistance,
  calculateDuration,
  calculateFare,
  getAllFareEstimates,
} = require('../utils/fareCalculator');

// Helper to generate a 4-digit OTP
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @route   POST /api/rides/estimate
// @desc    Get fare and time estimates between pickup and dropoff
router.post('/estimate', (req, res) => {
  const { pickup, dropoff } = req.body;

  if (!pickup || !dropoff || pickup.lat == null || dropoff.lat == null) {
    return res.status(400).json({ success: false, message: 'Pickup and dropoff coordinates are required' });
  }

  const estimateData = getAllFareEstimates(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

  res.json({
    success: true,
    data: estimateData,
  });
});

// @route   POST /api/rides/request
// @desc    Request a new ride
router.post('/request', protect, async (req, res, next) => {
  try {
    const { pickup, dropoff, vehicleType = 'UberGo', paymentMethod = 'stripe' } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ success: false, message: 'Pickup and dropoff locations required' });
    }

    // Check if rider already has an active ride
    const existingActiveRide = await Ride.findOne({
      rider: req.user._id,
      status: { $in: ['pending', 'accepted', 'arrived', 'in_progress'] },
    });

    if (existingActiveRide) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride request in progress',
        ride: existingActiveRide,
      });
    }

    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const duration = calculateDuration(distance);
    const fare = calculateFare(vehicleType, distance, duration);
    const otp = generateOtp();

    // Generate simulated route coordinates between pickup and dropoff
    const intermediateSteps = 10;
    const routeCoordinates = [];
    for (let i = 0; i <= intermediateSteps; i++) {
      const fraction = i / intermediateSteps;
      routeCoordinates.push({
        lat: pickup.lat + (dropoff.lat - pickup.lat) * fraction,
        lng: pickup.lng + (dropoff.lng - pickup.lng) * fraction,
      });
    }

    const ride = await Ride.create({
      rider: req.user._id,
      vehicleType,
      pickup,
      dropoff,
      distance,
      duration,
      fare,
      driverEarnings: fare.driverEarnings,
      payment: {
        method: paymentMethod,
        status: 'pending',
      },
      otp,
      routeCoordinates,
      status: 'pending',
    });

    await ride.populate('rider', 'name email phone avatar rating');

    // Notify online drivers through Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('ride:new_request', {
        ride,
        message: `New ${vehicleType} ride request nearby`,
      });
    }

    res.status(201).json({
      success: true,
      ride,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/rides/current
// @desc    Get currently active ride for user (rider or driver)
router.get('/current', protect, async (req, res, next) => {
  try {
    const query = {
      status: { $in: ['pending', 'accepted', 'arrived', 'in_progress'] },
    };

    if (req.user.role === 'driver') {
      query.driver = req.user._id;
    } else {
      query.rider = req.user._id;
    }

    const activeRide = await Ride.findOne(query)
      .populate('rider', 'name email phone avatar rating')
      .populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    res.json({
      success: true,
      ride: activeRide || null,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/rides/available
// @desc    Get pending ride requests for online drivers
router.get('/available', protect, async (req, res, next) => {
  try {
    const rides = await Ride.find({ status: 'pending' })
      .populate('rider', 'name email phone avatar rating')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/rides/history
// @desc    Get past rides for user (history)
router.get('/history', protect, async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'driver') {
      query.driver = req.user._id;
    } else {
      query.rider = req.user._id;
    }

    const rides = await Ride.find(query)
      .populate('rider', 'name email phone avatar rating')
      .populate('driver', 'name email phone avatar vehicle rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/rides/:id
// @desc    Get ride details by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('rider', 'name email phone avatar rating')
      .populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/rides/:id/accept
// @desc    Driver accepts a pending ride
router.put('/:id/accept', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Only drivers can accept rides' });
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This ride is no longer pending' });
    }

    ride.driver = req.user._id;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    await ride.populate('rider', 'name email phone avatar rating');
    await ride.populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    // Notify rider and rooms
    const io = req.app.get('io');
    if (io) {
      io.emit(`ride:${ride._id}:updated`, ride);
      io.emit('ride:accepted', { rideId: ride._id, driver: req.user });
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/rides/:id/arrive
// @desc    Driver arrives at rider pickup location
router.put('/:id/arrive', protect, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    ride.status = 'arrived';
    ride.arrivedAt = new Date();
    await ride.save();

    await ride.populate('rider', 'name email phone avatar rating');
    await ride.populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    const io = req.app.get('io');
    if (io) {
      io.emit(`ride:${ride._id}:updated`, ride);
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/rides/:id/start
// @desc    Driver starts the ride by validating the 4-digit OTP
router.put('/:id/start', protect, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid 4-digit OTP code provided' });
    }

    ride.status = 'in_progress';
    ride.startedAt = new Date();
    await ride.save();

    await ride.populate('rider', 'name email phone avatar rating');
    await ride.populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    const io = req.app.get('io');
    if (io) {
      io.emit(`ride:${ride._id}:updated`, ride);
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/rides/:id/complete
// @desc    Complete ride, finalize payment & driver earnings
router.put('/:id/complete', protect, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    ride.payment.status = 'completed';
    ride.payment.paidAt = new Date();
    await ride.save();

    // Credit driver earnings
    if (ride.driver) {
      await User.findByIdAndUpdate(ride.driver, {
        $inc: {
          totalEarnings: ride.driverEarnings,
          walletBalance: ride.driverEarnings,
          completedRidesCount: 1,
        },
      });

      // Record transaction
      await Transaction.create({
        user: ride.driver,
        ride: ride._id,
        type: 'driver_payout',
        amount: ride.driverEarnings,
        paymentMethod: ride.payment.method,
        status: 'succeeded',
        description: `Earnings for Ride #${ride._id.toString().slice(-6).toUpperCase()}`,
      });
    }

    // Debit rider if payment was wallet
    if (ride.payment.method === 'wallet') {
      await User.findByIdAndUpdate(ride.rider, {
        $inc: { walletBalance: -ride.fare.total },
      });
    }

    await Transaction.create({
      user: ride.rider,
      ride: ride._id,
      type: 'ride_fare',
      amount: ride.fare.total,
      paymentMethod: ride.payment.method,
      status: 'succeeded',
      description: `Payment for Ride #${ride._id.toString().slice(-6).toUpperCase()}`,
    });

    await ride.populate('rider', 'name email phone avatar rating');
    await ride.populate('driver', 'name email phone avatar vehicle currentLocation rating ratingCount');

    const io = req.app.get('io');
    if (io) {
      io.emit(`ride:${ride._id}:updated`, ride);
      io.emit(`ride:${ride._id}:completed`, ride);
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/rides/:id/cancel
// @desc    Cancel ride
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    ride.status = 'cancelled';
    ride.cancellation = {
      cancelledBy: req.user.role === 'driver' ? 'driver' : 'rider',
      reason,
      cancelledAt: new Date(),
    };
    await ride.save();

    const io = req.app.get('io');
    if (io) {
      io.emit(`ride:${ride._id}:updated`, ride);
      io.emit(`ride:${ride._id}:cancelled`, { reason });
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

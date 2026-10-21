const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Submit review and rating for a completed ride
router.post('/', protect, async (req, res, next) => {
  try {
    const { rideId, rating, comment, tags } = req.body;

    if (!rideId || !rating) {
      return res.status(400).json({ success: false, message: 'Ride ID and rating are required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (!ride.driver) {
      return res.status(400).json({ success: false, message: 'Ride does not have an assigned driver' });
    }

    const review = await Review.create({
      ride: ride._id,
      rider: req.user._id,
      driver: ride.driver,
      rating: Number(rating),
      comment: comment || '',
      tags: tags || [],
    });

    // Update ride rating
    ride.rating = {
      stars: Number(rating),
      feedback: comment || '',
      tags: tags || [],
      ratedAt: new Date(),
    };
    await ride.save();

    // Recalculate driver average rating
    const driverReviews = await Review.find({ driver: ride.driver });
    const totalScore = driverReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalScore / driverReviews.length).toFixed(2));

    await User.findByIdAndUpdate(ride.driver, {
      rating: avgRating,
      ratingCount: driverReviews.length,
    });

    res.status(201).json({
      success: true,
      review,
      driverRating: avgRating,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/reviews/driver/:driverId
// @desc    Get driver reviews
router.get('/driver/:driverId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ driver: req.params.driverId })
      .populate('rider', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

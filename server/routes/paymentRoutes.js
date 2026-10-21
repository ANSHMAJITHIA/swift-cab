const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

// @route   POST /api/payments/create-intent
// @desc    Create Stripe PaymentIntent or mock for testing
router.post('/create-intent', protect, async (req, res, next) => {
  try {
    const { rideId, amount } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    const payAmount = amount || ride.fare.total;
    const amountInCents = Math.round(payAmount * 100);

    // If a valid Stripe secret key is present (starts with sk_test_ or sk_live_ and isn't placeholder)
    const isRealStripe =
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
      !process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isRealStripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          rideId: ride._id.toString(),
          riderId: req.user._id.toString(),
        },
      });

      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isMock: false,
      });
    }

    // Otherwise, generate a simulated client secret for seamless sandbox demo
    const mockIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    res.json({
      success: true,
      clientSecret: `${mockIntentId}_secret_test`,
      paymentIntentId: mockIntentId,
      isMock: true,
      message: 'Running in Test/Demo Sandbox mode',
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment
router.post('/confirm', protect, async (req, res, next) => {
  try {
    const { rideId, paymentMethod = 'stripe', paymentIntentId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    ride.payment.status = 'completed';
    ride.payment.method = paymentMethod;
    ride.payment.stripePaymentIntentId = paymentIntentId || `mock_pi_${Date.now()}`;
    ride.payment.paidAt = new Date();
    await ride.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      ride,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/payments/transactions
// @desc    Get user transaction history
router.get('/transactions', protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('ride', 'pickup dropoff fare distance createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },
    type: {
      type: String,
      enum: ['ride_fare', 'driver_payout', 'wallet_topup', 'platform_fee', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'wallet', 'cash'],
      default: 'stripe',
    },
    status: {
      type: String,
      enum: ['succeeded', 'pending', 'failed'],
      default: 'succeeded',
    },
    stripePaymentIntentId: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);

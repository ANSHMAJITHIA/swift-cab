const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vehicleType: {
      type: String,
      enum: ['UberGo', 'Moto', 'UberAuto', 'Premier', 'UberXL'],
      default: 'UberGo',
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    otp: {
      type: String,
      required: true,
    },
    distance: {
      type: Number, // in km
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    routeCoordinates: [
      {
        lat: Number,
        lng: Number,
      },
    ],
    fare: {
      baseFare: { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      timeFare: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      surgeMultiplier: { type: Number, default: 1.0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    driverEarnings: {
      type: Number,
      default: 0,
    },
    payment: {
      method: {
        type: String,
        enum: ['stripe', 'cash', 'wallet'],
        default: 'stripe',
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      stripePaymentIntentId: {
        type: String,
        default: '',
      },
      paidAt: {
        type: Date,
      },
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ['rider', 'driver', 'system'],
      },
      reason: String,
      cancelledAt: Date,
    },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      feedback: { type: String, default: '' },
      tags: [{ type: String }],
      ratedAt: { type: Date },
    },
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ride', rideSchema);

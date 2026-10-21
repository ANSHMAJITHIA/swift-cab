const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cab_booking_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing
    await User.deleteMany({});
    await Ride.deleteMany({});
    await Review.deleteMany({});
    await Transaction.deleteMany({});
    console.log('[Seed] Cleared collections');

    // Create Rider (Rahul Sharma)
    const rider = await User.create({
      name: 'Rahul Sharma',
      email: 'rider@demo.com',
      password: 'password123',
      phone: '+91 98101 23456',
      role: 'rider',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      walletBalance: 1250.0,
      rating: 4.95,
    });

    // Create Indian Drivers
    // Driver 1: Rajesh Kumar (Delhi - UberGo Dzire)
    const driver1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'driver@demo.com',
      password: 'password123',
      phone: '+91 98712 34567',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isOnline: true,
      isAvailable: true,
      vehicle: {
        vehicleType: 'UberGo',
        model: 'Maruti Suzuki Dzire (White)',
        plateNumber: 'DL 01 AB 7842',
        color: 'Arctic White',
        capacity: 4,
      },
      currentLocation: {
        lat: 28.6328,
        lng: 77.2197,
        address: 'Connaught Place Outer Circle, New Delhi',
        heading: 45,
      },
      rating: 4.92,
      ratingCount: 382,
      walletBalance: 3450.0,
      totalEarnings: 18450.0,
      completedRidesCount: 215,
    });

    // Driver 2: Amit Verma (Delhi - Premier Sedan)
    const driver2 = await User.create({
      name: 'Amit Verma',
      email: 'driver2@demo.com',
      password: 'password123',
      phone: '+91 99100 45678',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isOnline: true,
      isAvailable: true,
      vehicle: {
        vehicleType: 'Premier',
        model: 'Honda City (Pearl Silver)',
        plateNumber: 'DL 03 CD 9901',
        color: 'Silver Metallic',
        capacity: 4,
      },
      currentLocation: {
        lat: 28.6145,
        lng: 77.2285,
        address: 'India Gate C-Hexagon, New Delhi',
        heading: 180,
      },
      rating: 4.98,
      ratingCount: 450,
      walletBalance: 5200.0,
      totalEarnings: 32800.0,
      completedRidesCount: 310,
    });

    // Driver 3: Ramesh Auto (Delhi - UberAuto)
    const driver3 = await User.create({
      name: 'Ramesh Auto Driver',
      email: 'driver3@demo.com',
      password: 'password123',
      phone: '+91 98990 12345',
      role: 'driver',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      isOnline: true,
      isAvailable: true,
      vehicle: {
        vehicleType: 'UberAuto',
        model: 'Bajaj Compact RE (Green-Yellow Auto)',
        plateNumber: 'DL 1R A 3341',
        color: 'Green & Yellow',
        capacity: 3,
      },
      currentLocation: {
        lat: 28.6448,
        lng: 77.1906,
        address: 'Karol Bagh Metro Station, New Delhi',
        heading: 90,
      },
      rating: 4.88,
      ratingCount: 195,
      walletBalance: 1850.0,
      totalEarnings: 12400.0,
      completedRidesCount: 140,
    });

    // Seed past completed ride with review in INR
    const completedRide1 = await Ride.create({
      rider: rider._id,
      driver: driver1._id,
      vehicleType: 'UberGo',
      pickup: {
        address: 'Connaught Place Inner Circle, New Delhi',
        lat: 28.6315,
        lng: 77.2167,
      },
      dropoff: {
        address: 'India Gate, Rajpath, New Delhi',
        lat: 28.6129,
        lng: 77.2295,
      },
      status: 'completed',
      otp: '7842',
      distance: 3.4,
      duration: 12,
      fare: {
        baseFare: 55,
        distanceFare: 48,
        timeFare: 24,
        platformFee: 6,
        surgeMultiplier: 1.0,
        total: 133,
        currency: 'INR',
      },
      driverEarnings: 108,
      payment: {
        method: 'stripe',
        status: 'completed',
        stripePaymentIntentId: 'pi_in_test_9019283012',
        paidAt: new Date(Date.now() - 86400000 * 2),
      },
      rating: {
        stars: 5,
        feedback: 'Very polite driver, AC was chilled, clean Dzire car!',
        tags: ['Clean Car', 'Polite Driver', 'On Time'],
        ratedAt: new Date(Date.now() - 86400000 * 2),
      },
      acceptedAt: new Date(Date.now() - 86400000 * 2 - 1800000),
      arrivedAt: new Date(Date.now() - 86400000 * 2 - 1500000),
      startedAt: new Date(Date.now() - 86400000 * 2 - 1200000),
      completedAt: new Date(Date.now() - 86400000 * 2),
    });

    await Review.create({
      ride: completedRide1._id,
      rider: rider._id,
      driver: driver1._id,
      rating: 5,
      comment: 'Very polite driver, AC was chilled, clean Dzire car!',
      tags: ['Clean Car', 'Polite Driver', 'On Time'],
    });

    await Transaction.create({
      user: rider._id,
      ride: completedRide1._id,
      type: 'ride_fare',
      amount: 133,
      currency: 'INR',
      paymentMethod: 'stripe',
      status: 'succeeded',
      description: 'Ride fare for Connaught Place to India Gate',
    });

    await Transaction.create({
      user: driver1._id,
      ride: completedRide1._id,
      type: 'driver_payout',
      amount: 108,
      currency: 'INR',
      paymentMethod: 'stripe',
      status: 'succeeded',
      description: 'Driver payout for Ride #IND7842',
    });

    console.log('[Seed] Database successfully seeded with Indian demo accounts in INR!');
    console.log('--- Rider: Rahul Sharma (rider@demo.com / password123)');
    console.log('--- Driver 1: Rajesh Kumar (driver@demo.com / password123) [UberGo Dzire]');
    console.log('--- Driver 2: Amit Verma (driver2@demo.com / password123) [Premier City]');
    console.log('--- Driver 3: Ramesh Auto (driver3@demo.com / password123) [UberAuto]');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

seed();

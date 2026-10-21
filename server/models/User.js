const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    role: {
      type: String,
      enum: ['rider', 'driver', 'admin'],
      default: 'rider',
    },
    avatar: {
      type: String,
      default: '',
    },
    // Driver-specific fields
    isOnline: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    vehicle: {
      vehicleType: {
        type: String,
        enum: ['UberGo', 'Moto', 'UberAuto', 'Premier', 'UberXL'],
        default: 'UberGo',
      },
      model: {
        type: String,
        default: 'Maruti Suzuki Dzire (White)',
      },
      plateNumber: {
        type: String,
        default: 'DL 01 AB 7842',
      },
      color: {
        type: String,
        default: 'Arctic White',
      },
      capacity: {
        type: Number,
        default: 4,
      },
    },
    currentLocation: {
      lat: { type: Number, default: 28.6315 },
      lng: { type: Number, default: 77.2167 },
      heading: { type: Number, default: 0 },
      address: { type: String, default: 'Connaught Place, New Delhi' },
      updatedAt: { type: Date, default: Date.now },
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    ratingCount: {
      type: Number,
      default: 1,
    },
    walletBalance: {
      type: Number,
      default: 850.0,
    },
    totalEarnings: {
      type: Number,
      default: 0.0,
    },
    completedRidesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

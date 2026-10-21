// Indian Cab & Auto pricing models (in INR ₹)
const VEHICLE_PRICING = {
  UberAuto: {
    name: 'UberAuto',
    description: 'Iconic auto-rickshaw at your doorstep',
    capacity: 3,
    baseFare: 35,
    perKmRate: 11,
    perMinRate: 1.5,
    minimumFare: 45,
    icon: 'zap',
  },
  Moto: {
    name: 'Uber Moto',
    description: 'Quick & pocket-friendly bike ride',
    capacity: 1,
    baseFare: 25,
    perKmRate: 8.5,
    perMinRate: 1.2,
    minimumFare: 35,
    icon: 'bike',
  },
  UberGo: {
    name: 'UberGo',
    description: 'Affordable, compact AC hatchback',
    capacity: 4,
    baseFare: 55,
    perKmRate: 14,
    perMinRate: 2.0,
    minimumFare: 80,
    icon: 'car',
  },
  Premier: {
    name: 'Premier',
    description: 'Comfortable sedans, top-rated drivers',
    capacity: 4,
    baseFare: 85,
    perKmRate: 18,
    perMinRate: 2.8,
    minimumFare: 120,
    icon: 'shield',
  },
  UberXL: {
    name: 'UberXL',
    description: 'Spacious 6-seater SUV (Ertiga/Innova)',
    capacity: 6,
    baseFare: 130,
    perKmRate: 24,
    perMinRate: 3.5,
    minimumFare: 180,
    icon: 'users',
  },
};

// Haversine formula for distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(0.5, parseFloat(distance.toFixed(2))); // minimum 0.5km
};

// Estimate duration in minutes based on urban traffic speed (~25 km/h)
const calculateDuration = (distanceInKm) => {
  const avgSpeedKmH = 25;
  const durationHours = distanceInKm / avgSpeedKmH;
  const durationMinutes = Math.round(durationHours * 60) + 4; // +4 mins buffer for traffic/signals
  return Math.max(4, durationMinutes);
};

// Calculate itemized fare breakdown in INR (₹)
const calculateFare = (vehicleType, distanceKm, durationMin, surgeMultiplier = 1.0) => {
  const pricing = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.UberGo;

  const baseFare = pricing.baseFare;
  const distanceFare = Math.round(distanceKm * pricing.perKmRate);
  const timeFare = Math.round(durationMin * pricing.perMinRate);
  const subtotal = Math.round((baseFare + distanceFare + timeFare) * surgeMultiplier);
  const platformFee = Math.round(subtotal * 0.05); // 5% GST & platform fee
  const rawTotal = subtotal + platformFee;
  const total = Math.max(pricing.minimumFare, rawTotal);

  // Driver receives 85% of base + distance + time fare
  const driverEarnings = Math.round(subtotal * 0.85);

  return {
    baseFare,
    distanceFare,
    timeFare,
    platformFee,
    surgeMultiplier,
    total,
    driverEarnings,
    currency: 'INR',
  };
};

// Get fare estimates for all vehicle options
const getAllFareEstimates = (lat1, lon1, lat2, lon2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const duration = calculateDuration(distance);

  const estimates = Object.keys(VEHICLE_PRICING).map((type) => {
    const config = VEHICLE_PRICING[type];
    const fare = calculateFare(type, distance, duration, 1.0);
    return {
      type,
      name: config.name,
      description: config.description,
      capacity: config.capacity,
      etaMins: Math.floor(Math.random() * 4) + 2, // 2-5 mins arrival ETA
      distance,
      duration,
      fare,
    };
  });

  return {
    distance,
    duration,
    currency: 'INR',
    estimates,
  };
};

module.exports = {
  VEHICLE_PRICING,
  calculateDistance,
  calculateDuration,
  calculateFare,
  getAllFareEstimates,
};

// Indian & International City Presets
export const CITIES = {
  DELHI: {
    name: 'Delhi NCR',
    center: [28.6139, 77.209],
    zoom: 13,
  },
  MUMBAI: {
    name: 'Mumbai',
    center: [18.922, 72.8347],
    zoom: 13,
  },
  BENGALURU: {
    name: 'Bengaluru',
    center: [12.9716, 77.5946],
    zoom: 13,
  },
  HYDERABAD: {
    name: 'Hyderabad',
    center: [17.385, 78.4867],
    zoom: 13,
  },
  WORLD: {
    name: 'Global / World',
    center: [25.2048, 55.2708], // Dubai / World Hub
    zoom: 12,
  },
};

// Popular Landmarks across India and the World
export const POPULAR_LOCATIONS = [
  // Delhi NCR
  {
    name: 'Connaught Place (CP)',
    address: 'Inner Circle, Connaught Place, New Delhi 110001',
    city: 'Delhi NCR',
    lat: 28.6315,
    lng: 77.2167,
    tag: 'Central Delhi',
  },
  {
    name: 'India Gate & Kartavya Path',
    address: 'Rajpath, India Gate, New Delhi 110001',
    city: 'Delhi NCR',
    lat: 28.6129,
    lng: 77.2295,
    tag: 'Monument',
  },
  {
    name: 'IGI Airport Terminal 3',
    address: 'Indira Gandhi International Airport, New Delhi 110037',
    city: 'Delhi NCR',
    lat: 28.5562,
    lng: 77.0999,
    tag: 'Airport',
  },
  {
    name: 'Cyber Hub Gurugram',
    address: 'DLF Phase 2, Sector 24, Gurugram, Haryana 122002',
    city: 'Delhi NCR',
    lat: 28.4952,
    lng: 77.089,
    tag: 'Tech Hub',
  },
  {
    name: 'Noida Sector 18 (DLF Mall)',
    address: 'Sector 18, Noida, Uttar Pradesh 201301',
    city: 'Delhi NCR',
    lat: 28.5708,
    lng: 77.3261,
    tag: 'Shopping',
  },
  {
    name: 'Hauz Khas Social',
    address: 'Hauz Khas Village, New Delhi 110016',
    city: 'Delhi NCR',
    lat: 28.5534,
    lng: 77.1944,
    tag: 'Cafe & Nightlife',
  },

  // Mumbai
  {
    name: 'Marine Drive & Nariman Point',
    address: 'Netaji Subhash Chandra Bose Road, Mumbai 400020',
    city: 'Mumbai',
    lat: 18.922,
    lng: 72.8236,
    tag: 'Scenic Seaface',
  },
  {
    name: 'Bandra Kurla Complex (BKC)',
    address: 'G Block, BKC, Bandra East, Mumbai 400051',
    city: 'Mumbai',
    lat: 19.0664,
    lng: 72.8687,
    tag: 'Financial Center',
  },
  {
    name: 'Chhatrapati Shivaji Terminus (CST)',
    address: 'Fort, Mumbai, Maharashtra 400001',
    city: 'Mumbai',
    lat: 18.9398,
    lng: 72.8354,
    tag: 'Railway Station',
  },
  {
    name: 'Mumbai Airport (T2 Terminal)',
    address: 'Chhatrapati Shivaji Maharaj Airport, Sahar, Andheri East 400099',
    city: 'Mumbai',
    lat: 19.0896,
    lng: 72.8656,
    tag: 'Airport',
  },

  // Bengaluru
  {
    name: 'MG Road & Brigade Road',
    address: 'Mahatma Gandhi Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    lat: 12.9756,
    lng: 77.6066,
    tag: 'Central Mall',
  },
  {
    name: 'Koramangala 5th Block',
    address: '100 Feet Road, Koramangala, Bengaluru 560095',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    tag: 'Startup Hub',
  },
  {
    name: 'Indiranagar 100ft Road',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    city: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    tag: 'Dining & Cafes',
  },
  {
    name: 'Kempegowda Airport (BLR T1)',
    address: 'KIAL Road, Devanahalli, Bengaluru, Karnataka 560300',
    city: 'Bengaluru',
    lat: 13.1986,
    lng: 77.7066,
    tag: 'Airport',
  },

  // Hyderabad
  {
    name: 'Hitec City / Cyber Towers',
    address: 'Madhapur, Hitec City, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    lat: 17.4474,
    lng: 78.3762,
    tag: 'IT Corridor',
  },
  {
    name: 'Charminar Heritage Plaza',
    address: 'Char Kaman, Ghansi Bazaar, Hyderabad 500002',
    city: 'Hyderabad',
    lat: 17.3616,
    lng: 78.4747,
    tag: 'Heritage',
  },

  // Global / World
  {
    name: 'Burj Khalifa & Dubai Mall',
    address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE',
    city: 'Global / World',
    lat: 25.1972,
    lng: 55.2744,
    tag: 'World Wonder',
  },
  {
    name: 'Times Square & Broadway',
    address: 'Broadway & 7th Ave, New York, NY 10036, USA',
    city: 'Global / World',
    lat: 40.758,
    lng: -73.9855,
    tag: 'New York',
  },
  {
    name: 'London Bridge & Tower of London',
    address: 'London Bridge, London SE1 9RA, United Kingdom',
    city: 'Global / World',
    lat: 51.5079,
    lng: -0.0877,
    tag: 'London',
  },
];

// Search helper
export const searchLocations = (query, currentCity = null) => {
  if (!query || query.trim() === '') {
    if (currentCity) {
      return POPULAR_LOCATIONS.filter((loc) => loc.city === currentCity);
    }
    return POPULAR_LOCATIONS.slice(0, 6);
  }
  const q = query.toLowerCase();
  return POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q)
  );
};

// Generate realistic polyline curve points between start & destination
export const generateRoutePolyline = (start, end, numPoints = 12) => {
  if (!start || !end) return [];
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const curveOffset = Math.sin(fraction * Math.PI) * 0.0018;
    const lat = start.lat + (end.lat - start.lat) * fraction + curveOffset;
    const lng = start.lng + (end.lng - start.lng) * fraction - curveOffset * 0.7;
    points.push([lat, lng]);
  }
  return points;
};

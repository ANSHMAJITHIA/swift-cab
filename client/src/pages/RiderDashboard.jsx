import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapView from '../components/MapView';
import RideBookingSheet from '../components/RideBookingSheet';
import RideTracking from '../components/RideTracking';
import ReceiptModal from '../components/ReceiptModal';
import RatingModal from '../components/RatingModal';
import ChatDrawer from '../components/ChatDrawer';
import { getCurrentRideApi, getNearbyDriversApi } from '../api';
import { CITIES, POPULAR_LOCATIONS } from '../utils/locations';
import { MessageSquare, Sparkles, Navigation, Globe, MapPin } from 'lucide-react';

const RiderDashboard = () => {
  const { user } = useAuth();
  const { activeRide, setActiveRide, liveDriverLocation } = useSocket();

  // Active City Selection: DELHI, MUMBAI, BENGALURU, HYDERABAD, WORLD
  const [selectedCity, setSelectedCity] = useState('DELHI');

  // Default initial locations in Connaught Place, New Delhi, India
  const [pickup, setPickup] = useState({
    name: 'Connaught Place (CP)',
    address: 'Inner Circle, Connaught Place, New Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
  });
  const [dropoff, setDropoff] = useState({
    name: 'India Gate & Kartavya Path',
    address: 'Rajpath, India Gate, New Delhi 110001',
    lat: 28.6129,
    lng: 77.2295,
  });

  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  // Switch city helper
  const handleCityChange = (cityKey) => {
    setSelectedCity(cityKey);
    const cityLocs = POPULAR_LOCATIONS.filter((l) => l.city === CITIES[cityKey]?.name);
    if (cityLocs.length >= 2) {
      setPickup({
        name: cityLocs[0].name,
        address: cityLocs[0].address,
        lat: cityLocs[0].lat,
        lng: cityLocs[0].lng,
      });
      setDropoff({
        name: cityLocs[1].name,
        address: cityLocs[1].address,
        lat: cityLocs[1].lat,
        lng: cityLocs[1].lng,
      });
    }
  };

  // Load existing active ride if any
  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const res = await getCurrentRideApi();
        if (res.data.success && res.data.ride) {
          setActiveRide(res.data.ride);
          setPickup(res.data.ride.pickup);
          setDropoff(res.data.ride.dropoff);
        }
      } catch (err) {
        console.error('Error fetching current ride:', err);
      }
    };

    fetchCurrentRide();
  }, [setActiveRide]);

  // Load nearby online drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getNearbyDriversApi(pickup.lat, pickup.lng);
        if (res.data.success) {
          setNearbyDrivers(res.data.drivers);
        }
      } catch (err) {
        console.error('Error fetching nearby drivers:', err);
      }
    };

    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);
    return () => clearInterval(interval);
  }, [pickup.lat, pickup.lng]);

  // Watch for ride completion to automatically show receipt or rating modal
  useEffect(() => {
    if (activeRide?.status === 'completed' && !activeRide.rating?.stars) {
      setShowReceiptModal(true);
    }
  }, [activeRide?.status, activeRide?.rating?.stars]);

  // Handle map click to set pickup or dropoff point interactively
  const handleMapClick = (latlng) => {
    if (!pickup) {
      setPickup({
        address: `Custom Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
    } else if (!dropoff) {
      setDropoff({
        address: `Destination (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
    }
  };

  const currentDriverLocation =
    liveDriverLocation ||
    (activeRide?.driver?.currentLocation?.lat
      ? {
          lat: activeRide.driver.currentLocation.lat,
          lng: activeRide.driver.currentLocation.lng,
          heading: activeRide.driver.currentLocation.heading || 0,
          name: activeRide.driver.name,
        }
      : null);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col md:flex-row">
      {/* City Switcher Top Bar (India & World) */}
      <div className="absolute top-4 left-4 md:left-[480px] right-4 z-20 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 flex items-center space-x-1.5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-gray-500 uppercase px-1.5 hidden sm:inline flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <span>Select Region:</span>
          </span>
          {Object.keys(CITIES).map((key) => {
            const city = CITIES[key];
            const isSelected = selectedCity === key;
            return (
              <button
                key={key}
                onClick={() => handleCityChange(key)}
                className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map (Fills entire screen on mobile, full background) */}
      <div className="absolute inset-0 z-0">
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          driverLocation={currentDriverLocation}
          nearbyDrivers={nearbyDrivers}
          routeCoordinates={activeRide?.routeCoordinates || []}
          onMapClick={handleMapClick}
          selectedCity={selectedCity}
          height="100%"
        />
      </div>

      {/* Floating Control Card (Left Side) */}
      <div className="relative z-10 w-full md:w-[460px] p-4 md:p-6 overflow-y-auto max-h-full pointer-events-none pt-16 md:pt-6">
        <div className="pointer-events-auto max-w-md mx-auto">
          {activeRide ? (
            <RideTracking
              ride={activeRide}
              onRideCancelled={() => setActiveRide(null)}
              onOpenChat={() => setShowChatDrawer(true)}
              onViewReceipt={() => setShowReceiptModal(true)}
              onRateDriver={() => setShowRatingModal(true)}
            />
          ) : (
            <RideBookingSheet
              pickup={pickup}
              setPickup={setPickup}
              dropoff={dropoff}
              setDropoff={setDropoff}
              selectedCityName={CITIES[selectedCity]?.name}
              onRideRequested={(ride) => setActiveRide(ride)}
            />
          )}
        </div>
      </div>

      {/* Map Hint floating badge */}
      <div className="hidden lg:flex absolute bottom-6 right-6 z-10 px-3.5 py-2 rounded-2xl glass-panel shadow-lg border border-gray-200 text-xs font-semibold text-gray-700 items-center space-x-2">
        <Navigation className="w-4 h-4 text-blue-600" />
        <span>Click anywhere on the India/World map to set pickup or drop-off</span>
      </div>

      {/* Modals & Drawers */}
      {showReceiptModal && activeRide && (
        <ReceiptModal
          ride={activeRide}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showRatingModal && activeRide && (
        <RatingModal
          ride={activeRide}
          onClose={() => setShowRatingModal(false)}
          onReviewSubmitted={() => {
            setShowRatingModal(false);
            setActiveRide(null); // Clear completed ride after rating
          }}
        />
      )}

      {showChatDrawer && activeRide && (
        <ChatDrawer
          ride={activeRide}
          onClose={() => setShowChatDrawer(false)}
        />
      )}
    </div>
  );
};

export default RiderDashboard;

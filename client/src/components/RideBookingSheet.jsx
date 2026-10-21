import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation2,
  ArrowUpDown,
  Car,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { POPULAR_LOCATIONS, searchLocations } from '../utils/locations';
import { getFareEstimateApi, requestRideApi } from '../api';
import { useAuth } from '../context/AuthContext';

const VEHICLE_ICONS = {
  UberAuto: '🛺',
  Moto: '🏍️',
  UberGo: '🚗',
  Premier: '🚘',
  UberXL: '🚙',
};

const RideBookingSheet = ({
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  selectedCityName,
  onRideRequested,
}) => {
  const { user } = useAuth();
  const [pickupQuery, setPickupQuery] = useState(pickup?.address || '');
  const [dropoffQuery, setDropoffQuery] = useState(dropoff?.address || '');
  const [isPickupFocused, setIsPickupFocused] = useState(false);
  const [isDropoffFocused, setIsDropoffFocused] = useState(false);

  const [estimates, setEstimates] = useState([]);
  const [tripDistance, setTripDistance] = useState(0);
  const [tripDuration, setTripDuration] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('UberGo');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep search queries in sync if pickup/dropoff props change (e.g. from map click)
  useEffect(() => {
    if (pickup?.address) setPickupQuery(pickup.address);
  }, [pickup?.address]);

  useEffect(() => {
    if (dropoff?.address) setDropoffQuery(dropoff.address);
  }, [dropoff?.address]);

  // Fetch fare estimates whenever pickup and dropoff coordinates are valid
  useEffect(() => {
    const fetchEstimates = async () => {
      if (pickup?.lat && dropoff?.lat) {
        setLoadingEstimates(true);
        setError('');
        try {
          const res = await getFareEstimateApi(pickup, dropoff);
          if (res.data.success) {
            setEstimates(res.data.data.estimates);
            setTripDistance(res.data.data.distance);
            setTripDuration(res.data.data.duration);
          }
        } catch (err) {
          console.error('Error fetching estimates:', err);
          setError('Could not calculate fare for this route');
        } finally {
          setLoadingEstimates(false);
        }
      } else {
        setEstimates([]);
      }
    };

    fetchEstimates();
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSelectPopular = (loc, isDropoff = true) => {
    if (isDropoff) {
      setDropoff({ address: loc.address, lat: loc.lat, lng: loc.lng });
      setDropoffQuery(loc.name);
      setIsDropoffFocused(false);
    } else {
      setPickup({ address: loc.address, lat: loc.lat, lng: loc.lng });
      setPickupQuery(loc.name);
      setIsPickupFocused(false);
    }
  };

  const handleBookRide = async () => {
    if (!pickup?.lat || !dropoff?.lat) {
      setError('Please select both pickup and destination locations.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await requestRideApi({
        pickup,
        dropoff,
        vehicleType: selectedVehicle,
        paymentMethod,
      });

      if (res.data.success) {
        onRideRequested(res.data.ride);
      }
    } catch (err) {
      console.error('Ride booking failed:', err);
      setError(err.response?.data?.message || 'Failed to request ride. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedEstimate = estimates.find((e) => e.type === selectedVehicle);

  // Filter landmarks to currently active city
  const cityLandmarks = POPULAR_LOCATIONS.filter(
    (l) => !selectedCityName || l.city === selectedCityName
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Where to?</h2>
          <p className="text-xs text-gray-500">
            {selectedCityName ? `Booking in ${selectedCityName}` : 'Fast pickups, honest pricing'}
          </p>
        </div>
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autos & Cabs Online</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-rose-800">
            ✕
          </button>
        </div>
      )}

      {/* Location Input Section */}
      <div className="relative bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
        <div className="flex flex-col space-y-2.5 relative">
          {/* Pickup Input */}
          <div className="relative flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-600 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter pickup location (or click on map)"
              value={pickupQuery}
              onChange={(e) => setPickupQuery(e.target.value)}
              onFocus={() => setIsPickupFocused(true)}
              className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder-gray-400"
            />
            {pickup && (
              <button
                onClick={() => {
                  setPickup(null);
                  setPickupQuery('');
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 ml-6" />

          {/* Destination Input */}
          <div className="relative flex items-center">
            <span className="w-3 h-3 rounded-none bg-black mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={dropoffQuery}
              onChange={(e) => setDropoffQuery(e.target.value)}
              onFocus={() => setIsDropoffFocused(true)}
              className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder-gray-400"
            />
            {dropoff && (
              <button
                onClick={() => {
                  setDropoff(null);
                  setDropoffQuery('');
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
          title="Swap Locations"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        {/* Autocomplete / Suggested Dropdown */}
        {(isPickupFocused || isDropoffFocused) && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-30 max-h-56 overflow-y-auto">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
              Popular Places ({selectedCityName || 'India'})
            </p>
            {searchLocations(isPickupFocused ? pickupQuery : dropoffQuery, selectedCityName).map(
              (loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPopular(loc, isDropoffFocused)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 flex items-center space-x-3 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-900 truncate">{loc.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{loc.address}</p>
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Preset Fast Selection Pills for active city */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Popular Landmarks (1-Click)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {cityLandmarks.slice(0, 4).map((loc, i) => (
            <button
              key={i}
              onClick={() => {
                if (!pickup) {
                  setPickup({ address: loc.address, lat: loc.lat, lng: loc.lng });
                  setPickupQuery(loc.name);
                } else {
                  setDropoff({ address: loc.address, lat: loc.lat, lng: loc.lng });
                  setDropoffQuery(loc.name);
                }
              }}
              className="text-xs bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-3 py-1.5 rounded-full font-medium transition"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Category Selection (In INR ₹) */}
      {estimates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Choose a ride ({tripDistance} km • {tripDuration} mins)</span>
            <span className="text-emerald-600 font-semibold">Fastest Arrival</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {estimates.map((opt) => {
              const isSelected = selectedVehicle === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => setSelectedVehicle(opt.type)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-black bg-gray-50 shadow-sm ring-1 ring-black'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="text-2xl">{VEHICLE_ICONS[opt.type] || '🚗'}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-gray-900">{opt.name}</span>
                        <span className="text-xs text-gray-400">👤 {opt.capacity}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{opt.description}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {opt.etaMins} mins away
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-gray-900 block">
                      ₹{opt.fare.total}
                    </span>
                    <span className="text-[10px] text-gray-400">Total Fare</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Method Selector */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-600">Payment:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPaymentMethod('wallet')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border transition ${
              paymentMethod === 'wallet'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet (₹{(user?.walletBalance || 0).toFixed(0)})</span>
          </button>

          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border transition ${
              paymentMethod === 'stripe'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card / UPI</span>
          </button>

          <button
            onClick={() => setPaymentMethod('cash')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border transition ${
              paymentMethod === 'cash'
                ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </button>
        </div>
      </div>

      {/* Request Button */}
      <button
        onClick={handleBookRide}
        disabled={bookingLoading || loadingEstimates || !pickup || !dropoff}
        className={`w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center space-x-2 shadow-lg transition ${
          bookingLoading || loadingEstimates || !pickup || !dropoff
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-black hover:bg-neutral-900 text-white hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {bookingLoading ? (
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Searching Nearby Drivers in {selectedCityName || 'India'}...</span>
          </div>
        ) : selectedEstimate ? (
          <span>Book {selectedVehicle} • ₹{selectedEstimate.fare.total}</span>
        ) : (
          <span>Select Pickup & Destination</span>
        )}
      </button>
    </div>
  );
};

export default RideBookingSheet;

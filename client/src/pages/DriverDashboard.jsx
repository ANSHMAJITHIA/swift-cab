import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapView from '../components/MapView';
import DriverIncomingModal from '../components/DriverIncomingModal';
import ChatDrawer from '../components/ChatDrawer';
import {
  getCurrentRideApi,
  getAvailableRidesApi,
  acceptRideApi,
  arriveRideApi,
  startRideApi,
  completeRideApi,
  getDriverStatsApi,
} from '../api';
import {
  Car,
  Power,
  Navigation,
  KeyRound,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Play,
  Shield,
  Star,
  MapPin,
} from 'lucide-react';

const DriverDashboard = () => {
  const { user, toggleDriverStatus } = useAuth();
  const {
    socket,
    incomingRideRequest,
    setIncomingRideRequest,
    activeRide,
    setActiveRide,
    startDriverSimulation,
    stopDriverSimulation,
  } = useSocket();

  const [isOnline, setIsOnline] = useState(user?.isOnline || true);
  const [availableRides, setAvailableRides] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 1250,
    todayRidesCount: 6,
    totalEarnings: 18450,
    totalRidesCount: 215,
    rating: user?.rating || 4.92,
  });
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Fetch driver stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDriverStatsApi();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching driver stats:', err);
      }
    };
    fetchStats();
  }, [activeRide?.status]);

  // Load active ride if driver is currently in one
  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const res = await getCurrentRideApi();
        if (res.data.success && res.data.ride) {
          setActiveRide(res.data.ride);
        }
      } catch (err) {
        console.error('Error fetching current ride:', err);
      }
    };
    fetchCurrentRide();
  }, [setActiveRide]);

  // Fetch pending available rides if online and not in an active ride
  useEffect(() => {
    const fetchAvailable = async () => {
      if (isOnline && !activeRide) {
        try {
          const res = await getAvailableRidesApi();
          if (res.data.success) {
            setAvailableRides(res.data.rides);
          }
        } catch (err) {
          console.error('Error fetching available rides:', err);
        }
      }
    };

    fetchAvailable();
    const interval = setInterval(fetchAvailable, 8000);
    return () => clearInterval(interval);
  }, [isOnline, activeRide]);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await toggleDriverStatus(nextState);
  };

  const handleAcceptRide = async (rideId) => {
    setLoadingAction(true);
    try {
      const res = await acceptRideApi(rideId);
      if (res.data.success) {
        setActiveRide(res.data.ride);
        setIncomingRideRequest(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept ride');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleArriveAtPickup = async () => {
    if (!activeRide) return;
    setLoadingAction(true);
    try {
      const res = await arriveRideApi(activeRide._id);
      if (res.data.success) {
        setActiveRide(res.data.ride);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerifyOtpAndStart = async () => {
    if (!activeRide || !otpInput) {
      setOtpError('Please enter rider 4-digit PIN');
      return;
    }
    setLoadingAction(true);
    setOtpError('');
    try {
      const res = await startRideApi(activeRide._id, otpInput.trim());
      if (res.data.success) {
        setActiveRide(res.data.ride);
        setOtpInput('');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid PIN code');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    setLoadingAction(true);
    try {
      const res = await completeRideApi(activeRide._id);
      if (res.data.success) {
        alert('🎉 Ride completed! Payout has been credited to your wallet.');
        setActiveRide(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete ride');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSimulateDrive = () => {
    if (!activeRide) return;
    if (simulating) {
      stopDriverSimulation(activeRide._id);
      setSimulating(false);
      return;
    }

    setSimulating(true);
    const start = activeRide.status === 'accepted'
      ? { lat: activeRide.pickup.lat + 0.012, lng: activeRide.pickup.lng - 0.012 }
      : activeRide.pickup;
    const target = activeRide.status === 'accepted' ? activeRide.pickup : activeRide.dropoff;

    startDriverSimulation(activeRide._id, start, target, 15);

    setTimeout(() => {
      setSimulating(false);
    }, 20000);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col md:flex-row bg-gray-100">
      {/* Background Interactive Map */}
      <div className="absolute inset-0 z-0">
        <MapView
          pickup={activeRide?.pickup}
          dropoff={activeRide?.dropoff}
          routeCoordinates={activeRide?.routeCoordinates || []}
          height="100%"
        />
      </div>

      {/* Floating Driver Console Panel */}
      <div className="relative z-10 w-full md:w-[480px] p-4 md:p-6 overflow-y-auto max-h-full pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto space-y-4">
          {/* Top Online Toggle Bar */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleOnline}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                  isOnline
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 scale-105'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                <Power className="w-6 h-6 stroke-[2.5]" />
              </button>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
                  <span>{isOnline ? 'You Are Online' : 'You Are Offline'}</span>
                  {isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </h3>
                <p className="text-xs text-gray-500">
                  {isOnline ? 'Ready to accept incoming trips' : 'Go online to start earning'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-neutral-900 text-amber-400">
                ★ {stats.rating?.toFixed(2) || '4.95'}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">{user?.vehicle?.model || 'Camry'}</p>
            </div>
          </div>

          {/* Today's Earnings Snapshot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 text-white rounded-2xl p-4 shadow-lg border border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold block">Today's Earnings</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{stats.todayEarnings}
              </span>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {stats.todayRidesCount} trips completed
              </p>
            </div>

            <div className="bg-white text-gray-900 rounded-2xl p-4 shadow-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 font-semibold block">Wallet Balance</span>
              <span className="text-2xl font-black text-gray-900">
                ₹{(user?.walletBalance || 0).toFixed(0)}
              </span>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Available for payout</p>
            </div>
          </div>

          {/* Active Ride Control Room */}
          {activeRide ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Active Trip • {activeRide.status.replace('_', ' ')}
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 mt-1">
                    {activeRide.status === 'accepted' && 'Navigate to Pickup'}
                    {activeRide.status === 'arrived' && 'Waiting for Rider'}
                    {activeRide.status === 'in_progress' && 'Driving to Destination'}
                  </h3>
                </div>

                <button
                  onClick={() => setShowChat(true)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 relative"
                  title="Trip Chat"
                >
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              {/* Rider Info */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <img
                  src={
                    activeRide.rider?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      activeRide.rider?.name || 'Rider'
                    )}&background=000&color=fff`
                  }
                  alt="Rider"
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{activeRide.rider?.name}</h4>
                  <p className="text-xs text-gray-500">
                    Payout: <span className="font-bold text-emerald-600">₹{activeRide.driverEarnings}</span>
                  </p>
                </div>
              </div>

              {/* Route Summary */}
              <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800 truncate">{activeRide.pickup?.address}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-black mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800 truncate">{activeRide.dropoff?.address}</span>
                </div>
              </div>

              {/* Action 1: Driver Arrived at Pickup */}
              {activeRide.status === 'accepted' && (
                <button
                  onClick={handleArriveAtPickup}
                  disabled={loadingAction}
                  className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>I Have Arrived at Pickup</span>
                </button>
              )}

              {/* Action 2: Enter OTP PIN to Start Ride */}
              {activeRide.status === 'arrived' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div>
                    <label className="text-xs font-bold text-amber-900 block">
                      Ask Rider for 4-Digit Security PIN:
                    </label>
                    <p className="text-[11px] text-amber-700">
                      Rider has this PIN on their screen
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 7842"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-32 text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleVerifyOtpAndStart}
                      disabled={loadingAction || otpInput.length < 4}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Start Trip</span>
                    </button>
                  </div>

                  {otpError && <p className="text-xs text-rose-600 font-bold">{otpError}</p>}
                </div>
              )}

              {/* Action 3: Complete Trip */}
              {activeRide.status === 'in_progress' && (
                <button
                  onClick={handleCompleteRide}
                  disabled={loadingAction}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Drop Off Rider & Collect ₹{activeRide.driverEarnings}</span>
                </button>
              )}

              {/* Simulation GPS Driving Helper */}
              <button
                onClick={handleSimulateDrive}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                  simulating
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>
                  {simulating
                    ? 'Simulating GPS Driving...'
                    : 'Simulate Car Driving to Target'}
                </span>
              </button>
            </div>
          ) : isOnline ? (
            /* Available Rides / Waiting Radar */
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900">Nearby Trip Requests</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {availableRides.length} available
                </span>
              </div>

              {availableRides.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Car className="w-8 h-8" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 radar-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Scanning for riders...</p>
                    <p className="text-xs text-gray-400">
                      Keep this screen open or test booking in another tab!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {availableRides.map((ride) => (
                    <div
                      key={ride._id}
                      className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-black transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{(ride.fare?.driverEarnings || Math.round(ride.fare?.total * 0.85))}
                        </span>
                        <span className="text-[10px] bg-neutral-900 text-white font-bold px-2 py-0.5 rounded">
                          {ride.vehicleType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        📍 {ride.pickup?.address}
                      </p>
                      <button
                        onClick={() => handleAcceptRide(ride._id)}
                        className="w-full py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow transition"
                      >
                        Accept Ride
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Power className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">You are currently offline</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tap the button below to start receiving ride requests
                </p>
              </div>
              <button
                onClick={handleToggleOnline}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition"
              >
                Go Online
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Request Alert Modal */}
      {incomingRideRequest && (
        <DriverIncomingModal
          ride={incomingRideRequest}
          onAccept={handleAcceptRide}
          onDecline={() => setIncomingRideRequest(null)}
        />
      )}

      {/* Chat Drawer */}
      {showChat && activeRide && (
        <ChatDrawer
          ride={activeRide}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default DriverDashboard;

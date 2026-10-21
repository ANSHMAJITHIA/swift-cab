import React, { useState } from 'react';
import {
  Car,
  Shield,
  Phone,
  MessageSquare,
  XCircle,
  Play,
  CheckCircle2,
  Navigation,
  KeyRound,
  FileText,
  Star,
  Share2,
} from 'lucide-react';
import { cancelRideApi } from '../api';
import { useSocket } from '../context/SocketContext';

const RideTracking = ({
  ride,
  onRideCancelled,
  onOpenChat,
  onViewReceipt,
  onRateDriver,
}) => {
  const { startDriverSimulation, stopDriverSimulation } = useSocket();
  const [cancelling, setCancelling] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const driver = ride.driver;
  const isPending = ride.status === 'pending';
  const isAccepted = ride.status === 'accepted';
  const isArrived = ride.status === 'arrived';
  const isInProgress = ride.status === 'in_progress';
  const isCompleted = ride.status === 'completed';

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    setCancelling(true);
    try {
      await cancelRideApi(ride._id, 'Rider cancelled');
      onRideCancelled();
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleSimulateMovement = () => {
    if (simulating) {
      stopDriverSimulation(ride._id);
      setSimulating(false);
      return;
    }

    setSimulating(true);

    // Target depends on current stage: if accepted -> moving to pickup. If in_progress -> moving to dropoff
    const start = isAccepted
      ? driver?.currentLocation || { lat: ride.pickup.lat + 0.015, lng: ride.pickup.lng - 0.015 }
      : ride.pickup;
    const target = isAccepted ? ride.pickup : ride.dropoff;

    startDriverSimulation(ride._id, start, target, 20);

    setTimeout(() => {
      setSimulating(false);
    }, 25000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 md:p-6 space-y-5">
      {/* Status Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {ride.status.replace('_', ' ')}
          </span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            {isPending && 'Looking for nearby drivers...'}
            {isAccepted && 'Driver is heading to your pickup!'}
            {isArrived && 'Driver has arrived!'}
            {isInProgress && 'Heading to your destination'}
            {isCompleted && 'Arrived safely at destination!'}
          </h2>
        </div>

        {/* 4-Digit OTP PIN badge */}
        <div className="bg-neutral-900 text-white px-3.5 py-1.5 rounded-2xl text-center shadow">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
            Start PIN
          </span>
          <span className="text-lg font-mono font-black text-amber-400 tracking-widest">
            {ride.otp}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-500 rounded-full"
          style={{
            width: isPending
              ? '25%'
              : isAccepted
              ? '50%'
              : isArrived
              ? '75%'
              : isInProgress
              ? '90%'
              : '100%',
          }}
        />
      </div>

      {/* Driver Details Card (When accepted or in progress) */}
      {driver ? (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={
                  driver.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    driver.name
                  )}&background=000&color=fff`
                }
                alt={driver.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center space-x-1">
                  <span>{driver.name}</span>
                  <span className="text-xs text-amber-500 font-extrabold">
                    ★ {driver.rating?.toFixed(1) || 4.9}
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  {driver.vehicle?.model || 'Toyota Prius'} •{' '}
                  <span className="font-semibold text-gray-800">
                    {driver.vehicle?.color || 'Silver'}
                  </span>
                </p>
              </div>
            </div>

            {/* License Plate Badge */}
            <div className="border-2 border-black rounded-lg px-2.5 py-1 text-center bg-white shadow-sm font-mono font-black text-xs text-gray-900 tracking-wider">
              {driver.vehicle?.plateNumber || 'NYC-7842'}
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={onOpenChat}
              className="py-2 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-center space-x-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Chat with Driver</span>
            </button>
            <a
              href={`tel:${driver.phone || '5550199'}`}
              className="py-2 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-center space-x-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Driver</span>
            </a>
          </div>
        </div>
      ) : (
        /* Searching driver animation */
        <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
              <Car className="w-8 h-8" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">Matching with closest driver...</p>
            <p className="text-xs text-gray-500">Usually takes less than 30 seconds</p>
          </div>
        </div>
      )}

      {/* Ride Route Info */}
      <div className="text-xs space-y-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
        <div className="flex items-start space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Pickup</span>
            <span className="font-medium text-gray-800">{ride.pickup.address}</span>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-none bg-black mt-1 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Drop-off</span>
            <span className="font-medium text-gray-800">{ride.dropoff.address}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-gray-700">
          <span>Fare: ₹{ride.fare.total} ({ride.payment.method})</span>
          <span>{ride.distance} km • ~{ride.duration} mins</span>
        </div>
      </div>

      {/* Action Buttons: Simulator & Completed state buttons */}
      <div className="space-y-2">
        {driver && !isCompleted && (
          <button
            onClick={handleSimulateMovement}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
              simulating
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>
              {simulating
                ? 'Live GPS Simulation Active...'
                : 'Simulate Driver GPS Driving on Map'}
            </span>
          </button>
        )}

        {isCompleted ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewReceipt}
              className="py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow"
            >
              <FileText className="w-4 h-4" />
              <span>View Receipt</span>
            </button>
            <button
              onClick={onRateDriver}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow"
            >
              <Star className="w-4 h-4" />
              <span>Rate Driver</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleCancelRide}
            disabled={cancelling}
            className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
          >
            <XCircle className="w-4 h-4" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Ride'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RideTracking;

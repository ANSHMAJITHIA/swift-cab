import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, Check, X, ShieldAlert } from 'lucide-react';

const DriverIncomingModal = ({ ride, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(25);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onDecline]);

  if (!ride) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5 animate-scale-up">
        {/* Urgent header with countdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Incoming Ride Request
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-mono font-black text-sm flex items-center justify-center shadow">
            {timeLeft}s
          </div>
        </div>

        {/* Big Earnings Amount */}
        <div className="bg-neutral-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs text-gray-400 block font-semibold">Your Estimated Payout</span>
            <span className="text-3xl font-black text-emerald-400">
              ₹{(ride.driverEarnings || ride.fare?.driverEarnings || Math.round(ride.fare?.total * 0.85))}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase bg-neutral-800 text-amber-400 font-bold px-2.5 py-1 rounded-lg">
              {ride.vehicleType}
            </span>
            <p className="text-xs text-gray-400 mt-1">{ride.distance} km trip</p>
          </div>
        </div>

        {/* Rider Info */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <img
            src={
              ride.rider?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                ride.rider?.name || 'Rider'
              )}&background=000&color=fff`
            }
            alt="Rider"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <div>
            <h4 className="text-sm font-bold text-gray-900">{ride.rider?.name || 'Sarah Jenkins'}</h4>
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <span className="text-amber-500 font-bold">★ {ride.rider?.rating || '5.0'}</span>
              <span>• Rider Rating</span>
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start space-x-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Pickup</span>
              <span className="font-semibold text-gray-800">{ride.pickup?.address}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <Navigation className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Drop-off</span>
              <span className="font-semibold text-gray-800">{ride.dropoff?.address}</span>
            </div>
          </div>
        </div>

        {/* Acceptance Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onDecline}
            className="py-3.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold flex items-center justify-center space-x-2 transition"
          >
            <X className="w-4 h-4 text-rose-600" />
            <span>Decline</span>
          </button>

          <button
            onClick={() => onAccept(ride._id)}
            className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <Check className="w-4 h-4" />
            <span>Accept Ride</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverIncomingModal;

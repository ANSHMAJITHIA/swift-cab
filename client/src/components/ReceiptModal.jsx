import React from 'react';
import { Printer, X, Download, ShieldCheck, Car, CheckCircle } from 'lucide-react';

const ReceiptModal = ({ ride, onClose }) => {
  if (!ride) return null;

  const handlePrint = () => {
    window.print();
  };

  const fare = ride.fare || {
    baseFare: 3.5,
    distanceFare: 7.2,
    timeFare: 3.8,
    platformFee: 1.5,
    total: 16.0,
  };

  const dateFormatted = new Date(ride.completedAt || ride.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rideCode = (ride._id || '987654321').toString().slice(-8).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in print:bg-white print:p-0">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden p-6 md:p-8 space-y-6 print:shadow-none print:border-none print:max-w-full">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b pb-4 border-gray-100 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight">SwiftCab Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand & Trip ID */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Total: ₹{fare.total}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{dateFormatted}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-700 block">
              #{rideCode}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end space-x-1 mt-1">
              <CheckCircle className="w-3 h-3" />
              <span>Paid in Full</span>
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
          <div className="flex items-start space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Pickup</span>
              <span className="font-semibold text-gray-800">{ride.pickup?.address}</span>
            </div>
          </div>
          <div className="border-l border-dashed border-gray-300 ml-1.5 h-3" />
          <div className="flex items-start space-x-3">
            <span className="w-2.5 h-2.5 rounded-none bg-black mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Drop-off</span>
              <span className="font-semibold text-gray-800">{ride.dropoff?.address}</span>
            </div>
          </div>
        </div>

        {/* Driver & Vehicle info */}
        {ride.driver && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center space-x-3">
              <img
                src={
                  ride.driver.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    ride.driver.name
                  )}&background=000&color=fff`
                }
                alt="Driver"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900">{ride.driver.name}</p>
                <p className="text-[11px] text-gray-500">
                  {ride.driver.vehicle?.model || 'Toyota Camry'} ({ride.driver.vehicle?.plateNumber || 'NYC-7842'})
                </p>
              </div>
            </div>
            <span className="text-xs bg-black text-white font-bold px-2 py-1 rounded-lg">
              {ride.vehicleType || 'UberGo'}
            </span>
          </div>
        )}

        {/* Fare Breakdown */}
        <div className="space-y-2 border-t border-b border-gray-200 py-3 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Base Fare</span>
            <span>₹{fare.baseFare || 55}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Distance Fare ({ride.distance} km)</span>
            <span>₹{fare.distanceFare || 0}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Time Fare ({ride.duration} mins)</span>
            <span>₹{fare.timeFare || 0}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST & Platform Fee (5%)</span>
            <span>₹{fare.platformFee || 0}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Paid</span>
            <span>₹{fare.total}</span>
          </div>
        </div>

        {/* Payment info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Payment Method:</span>
          <span className="font-semibold text-gray-800 uppercase">
            {ride.payment?.method || 'Stripe'} (Authorized)
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

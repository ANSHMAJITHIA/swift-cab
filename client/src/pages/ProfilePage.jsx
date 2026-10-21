import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Wallet,
  Car,
  Star,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, quickLogin } = useAuth();
  const [topupAmount, setTopupAmount] = useState(250);
  const [addingMoney, setAddingMoney] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) return null;

  const handleTopup = () => {
    setAddingMoney(true);
    setTimeout(() => {
      updateUser({ walletBalance: (user.walletBalance || 0) + Number(topupAmount) });
      setAddingMoney(false);
      setSuccessMsg(`Successfully added ₹${topupAmount} to your wallet!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=000&color=fff`
            }
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
              <span
                className={`text-xs uppercase px-2.5 py-0.5 rounded-full font-bold inline-block self-center sm:self-auto ${
                  user.role === 'driver'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user.role} Account
              </span>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex items-center justify-center sm:justify-start space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.email}</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.phone || '+1 555-0199'}</span>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center sm:justify-start space-x-3">
              <span className="text-xs font-bold text-amber-500 flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{user.rating?.toFixed(2) || '4.95'} Rating</span>
              </span>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                Member since 2026
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Wallet & Payment Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">SwiftCab Wallet</h3>
                <p className="text-xs text-gray-400">Instant ride payments and driver earnings</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-gray-900">
                ₹{(user.walletBalance || 0).toFixed(0)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">Current Balance</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              Quick Top-Up (Simulation)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    topupAmount === amt
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
              <button
                onClick={handleTopup}
                disabled={addingMoney}
                className="ml-auto py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{addingMoney ? 'Processing...' : `Add ₹${topupAmount}`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* If Driver: Vehicle Information Card */}
        {user.role === 'driver' && user.vehicle && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Registered Vehicle</h3>
                <p className="text-xs text-gray-400">Verified by platform inspection</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle Type</span>
                <span className="font-extrabold text-gray-900">{user.vehicle.vehicleType}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Model</span>
                <span className="font-extrabold text-gray-900">{user.vehicle.model}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">License Plate</span>
                <span className="font-mono font-black text-gray-900">{user.vehicle.plateNumber}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Color</span>
                <span className="font-extrabold text-gray-900">{user.vehicle.color}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

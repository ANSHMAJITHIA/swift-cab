import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Car,
  Navigation,
  Clock,
  User,
  LogOut,
  Wallet,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Radio,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickLogin } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (targetRole) => {
    setSwitching(true);
    try {
      await quickLogin(targetRole);
      setDropdownOpen(false);
      if (targetRole === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white border-b border-neutral-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                SwiftCab
              </span>
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-orange-600 font-bold tracking-wider inline-flex items-center space-x-1">
                <span>🇮🇳 India</span>
              </span>
            </div>
          </Link>

          {/* Real-time Socket Status */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{connected ? 'Live Sync' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
          <Link
            to="/rider"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/rider'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>Book a Ride</span>
          </Link>

          <Link
            to="/driver"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/driver'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>Driver Portal</span>
          </Link>

          <Link
            to="/history"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/history'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Activity & Receipts</span>
          </Link>
        </nav>

        {/* Right Section / Auth Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 transition"
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=276EF1&color=fff`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold leading-tight flex items-center space-x-1">
                    <span className="truncate max-w-[100px]">{user.name}</span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        user.role === 'driver'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center space-x-1">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    <span>₹{(user.walletBalance || 0).toFixed(0)}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 py-2 z-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-neutral-800">
                    <p className="text-xs text-neutral-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-white">{user.email}</p>
                    {user.role === 'driver' && user.vehicle && (
                      <p className="text-xs text-emerald-400 mt-1 font-mono">
                        🚗 {user.vehicle.model} ({user.vehicle.plateNumber})
                      </p>
                    )}
                  </div>

                  {/* Fast 1-Click Role Switcher */}
                  <div className="p-2 border-b border-neutral-800 bg-neutral-950/50">
                    <p className="text-[11px] uppercase font-bold text-neutral-400 px-2 mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Instant Role Switch (Demo)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleSwitch('rider');
                        }}
                        disabled={switching}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium transition text-center ${
                          user.role === 'rider'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        👤 Rahul (Rider)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleSwitch('driver');
                        }}
                        disabled={switching}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium transition text-center ${
                          user.role === 'driver'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        🚖 Rajesh (Driver)
                      </button>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>My Profile & Wallet</span>
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition"
                  >
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>Rides & Receipts</span>
                  </Link>

                  <div className="pt-1 mt-1 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRoleSwitch('rider')}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg font-medium transition hidden sm:inline-flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Rider</span>
              </button>
              <Link
                to="/login"
                className="text-sm font-semibold text-white hover:text-neutral-300 px-3 py-2 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg shadow transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

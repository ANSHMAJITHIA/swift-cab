import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Navigation,
  ShieldCheck,
  CreditCard,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const HomePage = () => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    await quickLogin(role);
    if (role === 'driver') {
      navigate('/driver');
    } else {
      navigate('/rider');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>🇮🇳 India's Full Stack Cab & Auto Booking App (MERN)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Ride anywhere with{' '}
            <span className="bg-gradient-to-r from-orange-400 via-white to-emerald-400 bg-clip-text text-transparent">
              SwiftCab India
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
            Book Autos 🛺, Bikes 🏍️, and Cabs 🚗 across Delhi NCR, Mumbai, Bengaluru, Hyderabad,
            and World cities with live GPS tracking, 4-digit start PIN, and instant driver dispatch.
          </p>

          {/* Quick 1-Click Launch Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleQuickDemo('rider')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition"
            >
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>Launch Rider Experience</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => handleQuickDemo('driver')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition"
            >
              <Car className="w-5 h-5 text-emerald-400" />
              <span>Launch Driver Console</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Real-Time WebSockets</h3>
            <p className="text-sm text-neutral-400">
              Live driver dispatching, GPS location broadcasting, smooth map interpolation, and in-ride chat via Socket.IO.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Secure 4-Digit OTP</h3>
            <p className="text-sm text-neutral-400">
              Riders receive a secure trip start PIN code. Drivers must verify the OTP before starting trip billing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Stripe & Itemized Receipts</h3>
            <p className="text-sm text-neutral-400">
              Seamless payments with Stripe test cards, driver wallet payouts, automated platform fee deduction, and printable receipts.
            </p>
          </div>
        </div>

        {/* Live Simulation Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 to-emerald-950/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Split-Screen Dual Browser Testing</h4>
              <p className="text-xs text-neutral-300">
                Open two tabs side-by-side (Tab 1 as Rider, Tab 2 as Driver) to watch live ride matching, acceptance, and GPS simulation in real-time!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/rider"
              className="text-xs font-bold bg-white text-black px-4 py-2.5 rounded-xl hover:bg-neutral-200 transition"
            >
              Test Rider Tab
            </Link>
            <Link
              to="/driver"
              className="text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl border border-neutral-700 transition"
            >
              Test Driver Tab
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        <p>Built with MongoDB, Express.js, React.js, Node.js, Socket.IO & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default HomePage;

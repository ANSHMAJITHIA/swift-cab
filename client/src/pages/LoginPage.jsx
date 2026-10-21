import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role) => {
    setLoading(true);
    try {
      await quickLogin(role);
      if (role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-xs text-gray-500">Sign in to book rides or view your driver console</p>
        </div>

        {/* 1-Click Fast Demo Logins */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 space-y-2">
          <p className="text-xs font-bold text-gray-700 flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Fast 1-Click Demo Login</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('rider')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 shadow-sm transition text-left"
            >
              👤 Rahul (Rider)
            </button>
            <button
              type="button"
              onClick={() => handleQuick('driver')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 shadow-sm transition text-left"
            >
              🚖 Rajesh (Driver)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@demo.com"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

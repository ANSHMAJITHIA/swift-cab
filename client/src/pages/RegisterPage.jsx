import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('rider');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Driver vehicle inputs
  const [vehicleType, setVehicleType] = useState('UberGo');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === 'driver') {
        payload.vehicle = {
          vehicleType,
          model: model || 'Honda Civic',
          plateNumber: plateNumber || 'NYC-5521',
          color: color || 'Black',
        };
      }

      const res = await register(payload);
      if (res.user.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your account</h2>
          <p className="text-xs text-gray-500">Sign up to ride or drive with SwiftCab</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-gray-100">
          <button
            type="button"
            onClick={() => setRole('rider')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              role === 'rider'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I want to Ride</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              role === 'driver'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>I want to Drive</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Miller"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="david@example.com"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Additional Driver Vehicle Fields */}
          {role === 'driver' && (
            <div className="pt-2 border-t border-gray-200 space-y-3">
              <span className="text-xs font-extrabold text-gray-900 block">
                Vehicle Details
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">Category</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <option value="UberGo">UberGo (Car)</option>
                    <option value="Moto">Moto (Bike)</option>
                    <option value="UberAuto">UberAuto (Rickshaw)</option>
                    <option value="Premier">Premier (Sedan)</option>
                    <option value="UberXL">UberXL (SUV)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Toyota Camry"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">License Plate</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="NYC-7842"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block">Color</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Silver"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

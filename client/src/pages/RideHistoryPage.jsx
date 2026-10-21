import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRideHistoryApi } from '../api';
import ReceiptModal from '../components/ReceiptModal';
import RatingModal from '../components/RatingModal';
import {
  Clock,
  Car,
  MapPin,
  Navigation,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  Filter,
  DollarSign,
} from 'lucide-react';

const RideHistoryPage = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState(null);
  const [selectedRideForRating, setSelectedRideForRating] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getRideHistoryApi();
        if (res.data.success) {
          setRides(res.data.rides);
        }
      } catch (err) {
        console.error('Error fetching ride history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredRides = rides.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const totalAmount = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => {
      const amount = user?.role === 'driver' ? r.driverEarnings || r.fare?.total * 0.85 : r.fare?.total;
      return sum + (amount || 0);
    }, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trip History & Receipts</h1>
            <p className="text-xs text-gray-500">
              {user?.role === 'driver' ? 'Track your past passenger trips and payouts' : 'View past bookings, fares, and receipts'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">
                {user?.role === 'driver' ? 'Total Payouts' : 'Total Spent'}
              </span>
              <span className="text-lg font-black text-gray-900">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Completed</span>
              <span className="text-lg font-black text-emerald-600">
                {rides.filter((r) => r.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {['all', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold capitalize transition ${
                filter === tab
                  ? 'bg-black text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Rides List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Loading trips...</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900">No rides found</h3>
            <p className="text-xs text-gray-500">Your completed or past rides will show up here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const isCompleted = ride.status === 'completed';
              const dateStr = new Date(ride.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ride._id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">
                        🚗
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-gray-900">
                            {ride.vehicleType || 'UberGo'}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {ride.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{dateStr}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-gray-900 block">
                        ₹{(user?.role === 'driver' ? ride.driverEarnings || Math.round(ride.fare?.total * 0.85) : ride.fare?.total)}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {ride.payment?.method || 'stripe'}
                      </span>
                    </div>
                  </div>

                  {/* Route points */}
                  <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
                    <div className="flex items-start space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{ride.pickup?.address}</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-none bg-black mt-1 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{ride.dropoff?.address}</span>
                    </div>
                  </div>

                  {/* Rating & Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                    <div>
                      {ride.rating?.stars ? (
                        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                          <div className="flex text-amber-400">
                            {[...Array(ride.rating.stars)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          {ride.rating.feedback && (
                            <span className="text-gray-500 italic truncate max-w-xs">
                              "{ride.rating.feedback}"
                            </span>
                          )}
                        </div>
                      ) : (
                        isCompleted &&
                        user?.role === 'rider' && (
                          <button
                            onClick={() => setSelectedRideForRating(ride)}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Leave a review for driver</span>
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRideForReceipt(ride)}
                        className="py-2 px-3.5 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-bold flex items-center space-x-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Digital Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRideForReceipt && (
        <ReceiptModal
          ride={selectedRideForReceipt}
          onClose={() => setSelectedRideForReceipt(null)}
        />
      )}

      {selectedRideForRating && (
        <RatingModal
          ride={selectedRideForRating}
          onClose={() => setSelectedRideForRating(null)}
          onReviewSubmitted={() => {
            setSelectedRideForRating(null);
            // Refresh
            getRideHistoryApi().then((res) => {
              if (res.data.success) setRides(res.data.rides);
            });
          }}
        />
      )}
    </div>
  );
};

export default RideHistoryPage;

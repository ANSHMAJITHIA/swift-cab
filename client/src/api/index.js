import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('uber_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (data) => API.post('/auth/register', data);
export const getMeApi = () => API.get('/auth/me');
export const quickLoginApi = (role) => API.post('/auth/quick-login', { role });
export const updateDriverStatusApi = (status) => API.put('/auth/driver-status', status);

// Ride API
export const getFareEstimateApi = (pickup, dropoff) => API.post('/rides/estimate', { pickup, dropoff });
export const requestRideApi = (rideData) => API.post('/rides/request', rideData);
export const getCurrentRideApi = () => API.get('/rides/current');
export const getAvailableRidesApi = () => API.get('/rides/available');
export const getRideHistoryApi = () => API.get('/rides/history');
export const getRideByIdApi = (id) => API.get(`/rides/${id}`);
export const acceptRideApi = (id) => API.put(`/rides/${id}/accept`);
export const arriveRideApi = (id) => API.put(`/rides/${id}/arrive`);
export const startRideApi = (id, otp) => API.put(`/rides/${id}/start`, { otp });
export const completeRideApi = (id) => API.put(`/rides/${id}/complete`);
export const cancelRideApi = (id, reason) => API.put(`/rides/${id}/cancel`, { reason });

// Driver API
export const getNearbyDriversApi = (lat, lng) => API.get('/drivers/nearby', { params: { lat, lng } });
export const getDriverStatsApi = () => API.get('/drivers/stats');
export const updateDriverLocationApi = (coords) => API.put('/drivers/location', coords);

// Payment API
export const createPaymentIntentApi = (data) => API.post('/payments/create-intent', data);
export const confirmPaymentApi = (data) => API.post('/payments/confirm', data);
export const getTransactionsApi = () => API.get('/payments/transactions');

// Review API
export const submitReviewApi = (data) => API.post('/reviews', data);
export const getDriverReviewsApi = (driverId) => API.get(`/reviews/driver/${driverId}`);

export default API;

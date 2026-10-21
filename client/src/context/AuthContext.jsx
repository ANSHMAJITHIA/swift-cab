import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, quickLoginApi, updateDriverStatusApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('uber_token'));
  const [loading, setLoading] = useState(true);

  // Load user on start if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    localStorage.setItem('uber_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    localStorage.setItem('uber_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const quickLogin = async (role = 'rider') => {
    setLoading(true);
    try {
      const res = await quickLoginApi(role);
      localStorage.setItem('uber_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('uber_token');
    setToken(null);
    setUser(null);
  };

  const toggleDriverStatus = async (isOnline) => {
    if (!user || user.role !== 'driver') return;
    try {
      const res = await updateDriverStatusApi({ isOnline });
      setUser((prev) => ({ ...prev, isOnline: res.data.user.isOnline }));
      return res.data.user;
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        quickLogin,
        logout,
        toggleDriverStatus,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

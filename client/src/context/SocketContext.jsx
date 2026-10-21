import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [incomingRideRequest, setIncomingRideRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [liveDriverLocation, setLiveDriverLocation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Connect to WebSocket server (via Vite proxy or direct)
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server:', newSocket.id);
      setConnected(true);

      if (user) {
        newSocket.emit('user:register', { userId: user._id || user.id, role: user.role });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    // Listen for new ride requests (relevant for drivers)
    newSocket.on('ride:new_request', (data) => {
      console.log('[Socket] New ride request received:', data);
      setIncomingRideRequest(data.ride);
    });

    // Listen for live driver location updates
    newSocket.on('driver:location_live', (data) => {
      setLiveDriverLocation(data);
    });

    // In-ride live chat messages
    newSocket.on('ride:new_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Whenever user changes or logs in, register with socket
  useEffect(() => {
    if (socket && connected && user) {
      socket.emit('user:register', { userId: user._id || user.id, role: user.role });
    }
  }, [user, socket, connected]);

  // Join a ride room when activeRide exists
  useEffect(() => {
    if (socket && activeRide?._id) {
      socket.emit('ride:join_room', activeRide._id);

      // Listen for ride updates in room
      const handleRideUpdate = (updatedRide) => {
        console.log('[Socket] Ride updated:', updatedRide);
        setActiveRide(updatedRide);
      };

      socket.on(`ride:${activeRide._id}:updated`, handleRideUpdate);

      return () => {
        socket.emit('ride:leave_room', activeRide._id);
        socket.off(`ride:${activeRide._id}:updated`, handleRideUpdate);
      };
    }
  }, [socket, activeRide?._id]);

  const sendChatMessage = (rideId, text) => {
    if (!socket || !user || !rideId) return;
    socket.emit('ride:message', {
      rideId,
      sender: user._id || user.id,
      senderName: user.name,
      text,
      timestamp: new Date().toISOString(),
    });
  };

  const startDriverSimulation = (rideId, startCoord, targetCoord, steps = 15) => {
    if (!socket) return;
    socket.emit('simulate:start', {
      rideId,
      startCoord,
      targetCoord,
      steps,
    });
  };

  const stopDriverSimulation = (rideId) => {
    if (!socket) return;
    socket.emit('simulate:stop', { rideId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        incomingRideRequest,
        setIncomingRideRequest,
        activeRide,
        setActiveRide,
        liveDriverLocation,
        setLiveDriverLocation,
        chatMessages,
        setChatMessages,
        sendChatMessage,
        startDriverSimulation,
        stopDriverSimulation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

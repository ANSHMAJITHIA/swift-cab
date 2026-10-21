const User = require('../models/User');

const initSocket = (io) => {
  const activeSockets = new Map(); // userId -> socketId
  const activeSimulations = new Map(); // rideId -> intervalId

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User register on socket
    socket.on('user:register', ({ userId, role }) => {
      activeSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.role = role;
      console.log(`[Socket] User registered: ${userId} (${role})`);
    });

    // Join a specific ride room
    socket.on('ride:join_room', (rideId) => {
      const room = `ride_${rideId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room ${room}`);
    });

    // Leave a specific ride room
    socket.on('ride:leave_room', (rideId) => {
      const room = `ride_${rideId}`;
      socket.leave(room);
    });

    // Driver location update broadcast
    socket.on('driver:location_ping', async (data) => {
      const { driverId, lat, lng, heading, rideId } = data;

      // Update in DB occasionally
      try {
        await User.findByIdAndUpdate(driverId, {
          currentLocation: { lat, lng, heading: heading || 0, updatedAt: new Date() },
        });
      } catch (err) {
        // silent
      }

      // If tied to an active ride, emit to ride room
      if (rideId) {
        io.to(`ride_${rideId}`).emit('driver:location_live', {
          driverId,
          lat,
          lng,
          heading,
        });
      }

      // Also broadcast to general map listener
      socket.broadcast.emit('driver:location_changed', {
        driverId,
        currentLocation: { lat, lng, heading },
      });
    });

    // In-ride live chat
    socket.on('ride:message', (data) => {
      const { rideId, sender, senderName, text, timestamp } = data;
      const room = `ride_${rideId}`;
      io.to(room).emit('ride:new_message', {
        sender,
        senderName,
        text,
        timestamp: timestamp || new Date().toISOString(),
      });
    });

    // Driver simulation helper: simulates movement from start to target coordinates
    socket.on('simulate:start', ({ rideId, startCoord, targetCoord, steps = 20, intervalMs = 1200 }) => {
      if (activeSimulations.has(rideId)) {
        clearInterval(activeSimulations.get(rideId));
      }

      let currentStep = 0;
      const totalSteps = steps;

      const interval = setInterval(() => {
        currentStep++;
        const fraction = currentStep / totalSteps;

        const currentLat = startCoord.lat + (targetCoord.lat - startCoord.lat) * fraction;
        const currentLng = startCoord.lng + (targetCoord.lng - startCoord.lng) * fraction;

        // Calculate heading/bearing
        const y = Math.sin((targetCoord.lng - startCoord.lng) * (Math.PI / 180)) * Math.cos(targetCoord.lat * (Math.PI / 180));
        const x =
          Math.cos(startCoord.lat * (Math.PI / 180)) * Math.sin(targetCoord.lat * (Math.PI / 180)) -
          Math.sin(startCoord.lat * (Math.PI / 180)) *
            Math.cos(targetCoord.lat * (Math.PI / 180)) *
            Math.cos((targetCoord.lng - startCoord.lng) * (Math.PI / 180));
        const heading = (Math.atan2(y, x) * 180) / Math.PI;

        io.to(`ride_${rideId}`).emit('driver:location_live', {
          lat: currentLat,
          lng: currentLng,
          heading: (heading + 360) % 360,
          progress: Math.min(100, Math.round(fraction * 100)),
        });

        if (currentStep >= totalSteps) {
          clearInterval(interval);
          activeSimulations.delete(rideId);
          io.to(`ride_${rideId}`).emit('simulate:completed', { rideId });
        }
      }, intervalMs);

      activeSimulations.set(rideId, interval);
    });

    socket.on('simulate:stop', ({ rideId }) => {
      if (activeSimulations.has(rideId)) {
        clearInterval(activeSimulations.get(rideId));
        activeSimulations.delete(rideId);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        activeSockets.delete(socket.userId);
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;

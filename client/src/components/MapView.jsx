import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CITIES } from '../utils/locations';

// Custom Map Marker Icons using SVG Data URIs
const createCustomIcon = (type, heading = 0) => {
  let svg = '';

  if (type === 'pickup') {
    svg = `
      <div style="
        background-color: #05944F;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="6" fill="white" />
        </svg>
      </div>
    `;
  } else if (type === 'dropoff') {
    svg = `
      <div style="
        background-color: #000000;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="#FFC043" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </div>
    `;
  } else if (type === 'driver') {
    svg = `
      <div style="
        transform: rotate(${heading}deg);
        transition: transform 0.5s ease-out;
        width: 38px;
        height: 38px;
        background: #121212;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #276EF1;
        box-shadow: 0 6px 14px rgba(0,0,0,0.35);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `;
  } else {
    // Nearby Indian Auto or Cab miniature
    svg = `
      <div style="
        width: 30px;
        height: 30px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #000;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        <span style="font-size: 15px;">🛺</span>
      </div>
    `;
  }

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

// Component to handle map clicks for selecting pickup / dropoff
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Auto-adjust view to fit pickup, dropoff, and driver
const MapBoundsAdjuster = ({ pickup, dropoff, driverLocation }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup?.lat && pickup?.lng) points.push([pickup.lat, pickup.lng]);
    if (dropoff?.lat && dropoff?.lng) points.push([dropoff.lat, dropoff.lng]);
    if (driverLocation?.lat && driverLocation?.lng) points.push([driverLocation.lat, driverLocation.lng]);

    if (points.length === 1) {
      map.flyTo(points[0], 14, { duration: 1.2 });
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, duration: 1.2 });
    }
  }, [pickup, dropoff, driverLocation, map]);

  return null;
};

// Controller to smoothly pan to selected city
const CityPanController = ({ cityKey }) => {
  const map = useMap();
  useEffect(() => {
    if (cityKey && CITIES[cityKey]) {
      const city = CITIES[cityKey];
      map.flyTo(city.center, city.zoom, { duration: 1.5 });
    }
  }, [cityKey, map]);
  return null;
};

const MapView = ({
  pickup,
  dropoff,
  driverLocation,
  nearbyDrivers = [],
  routeCoordinates = [],
  onMapClick,
  selectedCity = 'DELHI',
  height = '100%',
  className = '',
}) => {
  // Default centered in India (Connaught Place / New Delhi: 28.6139, 77.2090)
  const defaultCenter = [28.6139, 77.209];
  const pickupIcon = useMemo(() => createCustomIcon('pickup'), []);
  const dropoffIcon = useMemo(() => createCustomIcon('dropoff'), []);
  const nearbyIcon = useMemo(() => createCustomIcon('nearby'), []);
  const driverIcon = useMemo(
    () => createCustomIcon('driver', driverLocation?.heading || 0),
    [driverLocation?.heading]
  );

  // Generate route polyline points
  const polylinePositions = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      return routeCoordinates.map((c) => [c.lat, c.lng]);
    }
    if (pickup?.lat && dropoff?.lat) {
      return [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ];
    }
    return [];
  }, [pickup, dropoff, routeCoordinates]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* OpenStreetMap Tile Layer - Crisp, Fast, India & World High Definition */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        <CityPanController cityKey={selectedCity} />
        <MapBoundsAdjuster
          pickup={pickup}
          dropoff={dropoff}
          driverLocation={driverLocation}
        />

        {/* Pickup Marker */}
        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <span className="font-bold text-emerald-600 block uppercase">Pickup Location</span>
                <p className="text-gray-800 font-medium mt-0.5">{pickup.address || 'Pickup Point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff?.lat && dropoff?.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <span className="font-bold text-black block uppercase">Destination</span>
                <p className="text-gray-800 font-medium mt-0.5">{dropoff.address || 'Drop-off Point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live Assigned Driver Marker */}
        {driverLocation?.lat && driverLocation?.lng && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <span className="font-bold text-blue-600 block uppercase">Assigned Driver</span>
                <p className="text-gray-800 font-semibold">{driverLocation.name || 'Your Driver'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Available Drivers in India */}
        {!driverLocation &&
          nearbyDrivers.map((driver) => {
            const loc = driver.currentLocation;
            if (!loc?.lat || !loc?.lng) return null;
            return (
              <Marker key={driver._id} position={[loc.lat, loc.lng]} icon={nearbyIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-gray-500">{driver.vehicle?.model || 'Available Cab'}</p>
                    <span className="text-amber-500 font-bold">★ {driver.rating || 4.9}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Route Polyline */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#000000',
              weight: 5,
              opacity: 0.9,
              dashArray: '6, 8',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;

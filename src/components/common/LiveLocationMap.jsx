import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Create custom icons using Lucide icons to avoid Vite/Webpack image path issues
const createPatientIcon = () => {
  const iconHtml = renderToStaticMarkup(
    <div className="flex items-center justify-center w-8 h-8 bg-[#2F6FED] rounded-full border-2 border-white shadow-md text-white">
      <Navigation className="w-5 h-5 fill-current" />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Center the icon
  });
};

const createHomeIcon = () => {
  const iconHtml = renderToStaticMarkup(
    <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-md text-white">
      <MapPin className="w-5 h-5 fill-current" />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Bottom center for pin
  });
};

// Component to handle auto-panning when the patient's location updates
function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LiveLocationMap({ 
  currentLat, 
  currentLng, 
  lastUpdate, 
  homeLat, 
  homeLng,
  safeZoneRadius = 500
}) {
  const [patientIcon, setPatientIcon] = useState(null);
  const [homeIcon, setHomeIcon] = useState(null);

  useEffect(() => {
    setPatientIcon(createPatientIcon());
    setHomeIcon(createHomeIcon());
  }, []);

  if (!currentLat || !currentLng) {
    return (
      <div className="h-64 sm:h-80 w-full bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Patient location sharing is currently off.</p>
      </div>
    );
  }

  // Calculate status
  const timeDiffMinutes = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 60000) : 0;
  const isLive = timeDiffMinutes < 2; // Consider live if updated in the last 2 minutes

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-[#172B4D]">Patient Status</span>
          <span className="text-xs text-slate-500 font-medium">
            {isLive ? (
              <span className="text-[#2E7D32]">Live Location Active</span>
            ) : (
              <span>Location sharing inactive</span>
            )}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-600 mt-2 sm:mt-0">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[#2E7D32]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Updated just now
            </span>
          ) : (
            `Last location: ${timeDiffMinutes} ${timeDiffMinutes === 1 ? 'minute' : 'minutes'} ago`
          )}
        </div>
      </div>

      <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer 
          center={[currentLat, currentLng]} 
          zoom={16} 
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater lat={currentLat} lng={currentLng} />

          {patientIcon && (
            <Marker position={[currentLat, currentLng]} icon={patientIcon}>
              <Popup>
                <div className="font-bold text-sm">Patient's Current Location</div>
                <div className="text-xs text-slate-500">
                  {isLive ? 'Updated recently' : `Updated ${timeDiffMinutes} min ago`}
                </div>
              </Popup>
            </Marker>
          )}

          {homeLat && homeLng && homeIcon && (
            <Marker position={[homeLat, homeLng]} icon={homeIcon}>
              <Popup>
                <div className="font-bold text-sm">Saved Home Location</div>
                <div className="text-xs text-slate-500">Safe zone radius: {safeZoneRadius}m</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

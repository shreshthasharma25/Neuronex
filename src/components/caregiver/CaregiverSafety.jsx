import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Shield, MapPin, Stethoscope, Phone, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function CaregiverSafety() {
  const { patientData, updateHomeLocation, updateDoctor, triggerSafetyAlert } = useApp();
  const { homeLocation, importantInfo, emergencyContacts, profile } = patientData;
  const preferredName = profile?.preferredName || 'Maa';

  const doctorInfo = importantInfo?.find(i => i.label.toLowerCase().includes('doctor'));
  const doctorNamePhone = doctorInfo?.value || '';

  const [homeName, setHomeName] = useState(homeLocation?.name || 'My Home');
  const [address, setAddress] = useState(homeLocation?.address || '');
  const [city, setCity] = useState(homeLocation?.city || '');
  const [safeZone, setSafeZone] = useState(homeLocation?.safeZoneRadius || 500);
  const [latitude, setLatitude] = useState(homeLocation?.coordinates?.lat ?? '');
  const [longitude, setLongitude] = useState(homeLocation?.coordinates?.lng ?? '');
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const [docName, setDocName] = useState(doctorNamePhone ? doctorNamePhone.split('-')[0]?.trim() : '');
  const [docPhone, setDocPhone] = useState(doctorNamePhone ? doctorNamePhone.split('-')[1]?.trim() : '');

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setLocatingGps(true);
    setGpsStatus(null);
    sounds.playGentleTap();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingGps(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy);
        setLatitude(lat);
        setLongitude(lng);
        setGpsStatus({
          type: 'success',
          text: `Retrieved current coordinates: ${lat}, ${lng} (±${acc}m accuracy)`
        });
        sounds.playSuccess();
      },
      (error) => {
        setLocatingGps(false);
        let errorMsg = 'Could not retrieve GPS location.';
        if (error.code === 1) errorMsg = 'Location permission was denied. Please allow location access.';
        else if (error.code === 2) errorMsg = 'Position unavailable. Check your device GPS.';
        else if (error.code === 3) errorMsg = 'Location request timed out.';
        setGpsStatus({ type: 'error', text: errorMsg });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSaveHome = (e) => {
    e.preventDefault();
    const parsedLat = latitude !== '' && !isNaN(Number(latitude)) ? Number(latitude) : null;
    const parsedLng = longitude !== '' && !isNaN(Number(longitude)) ? Number(longitude) : null;

    updateHomeLocation({
      name: homeName.trim() || 'My Home',
      address: address.trim(),
      city: city.trim(),
      safeZoneRadius: Number(safeZone),
      coordinates: (parsedLat !== null && parsedLng !== null) ? { lat: parsedLat, lng: parsedLng } : null
    });
    sounds.playSuccess();
    showToast(`Home location (${homeName}) and ${safeZone}m safe-zone updated!`);
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    updateDoctor({
      name: docName.trim(),
      phone: docPhone.trim()
    });
    sounds.playSuccess();
    showToast("Family doctor emergency dialer updated!");
  };

  const handleSimulateGeofenceBreach = () => {
    triggerSafetyAlert({
      title: "⚠️ SAFETY ALERT: Safe-Zone Boundary Exceeded",
      message: `${preferredName} may have moved outside the configured ${safeZone}m safe-zone. Broadcast sent to Caregiver and Family Member.`,
      severity: "URGENT",
      recipients: ["caregiver", "family"]
    });
    showToast("Simulated boundary breach! Alert sent to BOTH Caregiver and Family Member.");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FDECEC] border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider">
            Patient Protection & Boundary Shield
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Safety, Geofence & Emergency Contacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Configure {preferredName}'s safe residence perimeter and verify emergency contacts.
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-rose-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0 self-start sm:self-auto">
          🛡️
        </div>
      </div>

      {/* Geofence Breach Test Simulator */}
      <Card variant="white" className="p-4 sm:p-5 border-2 border-dashed border-amber-300 bg-amber-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#172B4D] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Safety Alert Simulator (Shared with Family)</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Tests boundary breach notification across BOTH Caregiver and Family Member portals.
            </p>
          </div>
          <Button
            onClick={handleSimulateGeofenceBreach}
            variant="emergency"
            size="sm"
            icon={AlertTriangle}
            className="w-full sm:w-auto justify-center"
          >
            Trigger Safe-Zone Alert
          </Button>
        </div>
      </Card>

      {/* Home Location & Safe-Zone */}
      <Card variant="white" className="p-4 sm:p-6">
        <h3 className="text-base font-extrabold text-[#172B4D] mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#2F6FED]" />
          <span>Home Location & Safe-Zone Perimeter</span>
        </h3>

        <form onSubmit={handleSaveHome} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Home Name / Label
            </label>
            <input
              type="text"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              placeholder="e.g., My Home or Lake Road Residence"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Full Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 14 Lake Road"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                City / Locality
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Kolkata"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>
          </div>

          {/* Coordinates & Auto-detect */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-[#172B4D] block">
                  Geographic GPS Coordinates
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Required for real-time distance and Guide Me Home navigation
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locatingGps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F6FED] hover:bg-[#255ecf] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{locatingGps ? "Acquiring GPS..." : "📍 Use My Current Location as Home"}</span>
              </button>
            </div>

            {gpsStatus && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                gpsStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {gpsStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                <span>{gpsStatus.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Latitude (°N/S)
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 22.518000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Longitude (°E/W)
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 88.353000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#172B4D]">
                Safe Zone Radius: <strong className="text-[#2F6FED]">{safeZone} meters</strong>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                (Around Home Residence)
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={safeZone}
              onChange={(e) => setSafeZone(e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2F6FED]"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
              <span>50m (Immediate porch/yard)</span>
              <span>500m (Standard neighborhood)</span>
              <span>2000m (Wide radius)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Save Safe-Zone Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Emergency Contacts Management */}
      <Card variant="white" className="p-6">
        <h3 className="text-base font-extrabold text-[#172B4D] mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <span>Family Doctor Contact</span>
        </h3>

        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g., Dr. Debashish Bose"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Doctor Phone Number
              </label>
              <input
                type="tel"
                value={docPhone}
                onChange={(e) => setDocPhone(e.target.value)}
                placeholder="+91 98301 23456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" size="md">
              Save Doctor Information
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Active Public Emergency Hotlines (Included Automatically)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 font-bold text-rose-800 flex items-center gap-2">
              <span>🚑</span>
              <span>Medical Ambulance (108)</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 font-bold text-amber-800 flex items-center gap-2">
              <span>🚔</span>
              <span>Police Emergency (100)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  ArrowUp, 
  Phone, 
  Volume2, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  Compass, 
  AlertTriangle,
  AlertCircle,
  Footprints,
  Clock
} from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { 
  calculateDistanceMeters, 
  calculateBearing, 
  getCompassDirection, 
  formatDistance, 
  detectMovement 
} from '../../utils/geoUtils';

export default function MyHomeModal({ isOpen, onClose }) {
  const { patientData, triggerSafetyAlert, t, language } = useApp();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Real GPS State
  const [currentCoords, setCurrentCoords] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('REQUESTING'); // 'REQUESTING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'UNSUPPORTED'
  const [gpsErrorMessage, setGpsErrorMessage] = useState(null);
  const [coordsHistory, setCoordsHistory] = useState([]);
  const [movementState, setMovementState] = useState('ANALYZING'); // 'MOVING' | 'STATIONARY' | 'ANALYZING'
  
  const watchIdRef = useRef(null);
  const lastAlertTimeRef = useRef(0);
  const lastSpokenBearingRef = useRef(null);

  const home = patientData.homeLocation || {};
  const preferredName = patientData.profile?.preferredName || patientData.profile?.fullName || 'Friend';
  const hasHomeCoords = home.coordinates && typeof home.coordinates.lat === 'number' && typeof home.coordinates.lng === 'number';

  // 1. Continuous Geolocation Tracking via watchPosition
  useEffect(() => {
    if (!isOpen) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsNavigating(false);
      setCoordsHistory([]);
      sounds.stopSpeaking();
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('UNSUPPORTED');
      setGpsErrorMessage(t('guideHome.gpsDenied'));
      return;
    }

    setGpsStatus('REQUESTING');
    setGpsErrorMessage(null);

    const handleSuccess = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const timestamp = position.timestamp || Date.now();

      const newPoint = { lat, lng, accuracy, timestamp };
      setCurrentCoords({ lat, lng });
      setGpsAccuracy(Math.round(accuracy));
      setGpsStatus('ACTIVE');
      setGpsErrorMessage(null);

      // Append to movement history buffer (keep last 30 points)
      setCoordsHistory(prev => {
        const updated = [...prev.slice(-29), newPoint];
        const motion = detectMovement(updated, 30000, 15);
        setMovementState(motion);
        return updated;
      });

      // Check Safe-Zone Breach against real GPS coordinates
      if (hasHomeCoords) {
        const dist = calculateDistanceMeters(lat, lng, home.coordinates.lat, home.coordinates.lng);
        const safeRadius = home.safeZoneRadius || 500;

        if (dist !== null && dist > safeRadius) {
          const now = Date.now();
          // 30 minute cooldown between boundary breach alerts to prevent spam
          if (now - lastAlertTimeRef.current > 30 * 60 * 1000) {
            lastAlertTimeRef.current = now;
            triggerSafetyAlert({
              title: "⚠️ SAFETY ALERT: Outside Safe-Zone",
              message: `${preferredName} is currently outside the configured ${safeRadius}m safe zone (~${formatDistance(dist)} from home).`,
              severity: "URGENT",
              recipients: ["caregiver", "family"]
            });
          }
        }
      }
    };

    const handleError = (error) => {
      if (error.code === 1) {
        setGpsStatus('DENIED');
        setGpsErrorMessage("Location access was denied. Please allow location permissions in your browser or device settings.");
      } else if (error.code === 2) {
        setGpsStatus('UNAVAILABLE');
        setGpsErrorMessage("Location is currently unavailable. Please check your device GPS / network.");
      } else if (error.code === 3) {
        setGpsStatus('UNAVAILABLE');
        setGpsErrorMessage("Location request timed out. Retrying GPS lock...");
      } else {
        setGpsStatus('UNAVAILABLE');
        setGpsErrorMessage("Unable to retrieve location: " + error.message);
      }
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000
    };

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen, hasHomeCoords, home.coordinates?.lat, home.coordinates?.lng, home.safeZoneRadius, preferredName, triggerSafetyAlert]);

  // Derived distances & bearings
  const distanceToHome = (currentCoords && hasHomeCoords)
    ? calculateDistanceMeters(currentCoords.lat, currentCoords.lng, home.coordinates.lat, home.coordinates.lng)
    : null;

  const bearingToHome = (currentCoords && hasHomeCoords)
    ? calculateBearing(currentCoords.lat, currentCoords.lng, home.coordinates.lat, home.coordinates.lng)
    : 0;

  const compass = getCompassDirection(bearingToHome);
  const isAtHome = distanceToHome !== null && distanceToHome <= (home.safeZoneRadius || 100);

  const handleStartNavigation = () => {
    sounds.playGentleTap();
    setIsNavigating(true);

    if (currentCoords && hasHomeCoords) {
      const distText = formatDistance(distanceToHome);
      sounds.speak(`Starting guidance to your home. Head ${compass.label}. Your home is ${distText} away.`);
      lastSpokenBearingRef.current = compass.abbreviation;
    } else {
      sounds.speak("Waiting for GPS satellite lock to start walking guidance.");
    }
  };

  const handleSpeakInstruction = () => {
    if (distanceToHome !== null) {
      sounds.speak(`Head ${compass.label}. You are approximately ${formatDistance(distanceToHome)} from home.`);
    } else {
      sounds.speak("Waiting for your current GPS location.");
    }
  };

  const handleStopNavigation = () => {
    sounds.playGentleTap();
    sounds.stopSpeaking();
    setIsNavigating(false);
  };

  const handleCallCaregiver = () => {
    sounds.speak("Calling your caregiver now.");
    const contact = patientData.family?.[0];
    alert(`Dialing Emergency Caregiver (${contact?.name || 'Family'}): ${contact?.phone || '+91 98300 11223'}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('guideHome.title')}
      subtitle={t('guideHome.subtitle')}
      maxWidth="max-w-md"
    >
      {!hasHomeCoords ? (
        <EmptyState
          icon={Home}
          title={t('guideHome.homeNotSet')}
          description={t('guideHome.homeNotSet')}
          onAction={onClose}
          actionText={t('common.back')}
        />
      ) : !isNavigating ? (
        /* STEP 1: INITIAL LOCATION STATUS & 'START WALKING TOWARDS HOME' SCREEN */
        <div className="space-y-5 text-center py-2">
          {/* Real GPS Signal Status Banner */}
          {gpsStatus === 'DENIED' || gpsStatus === 'UNSUPPORTED' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-rose-900">
                  {t('guideHome.gpsDenied')}
                </h4>
                <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                  {gpsErrorMessage || t('guideHome.gpsDenied')}
                </p>
              </div>
            </div>
          ) : gpsStatus === 'REQUESTING' ? (
            <div className="p-3.5 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] text-left flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#2F6FED] animate-ping flex-shrink-0" />
              <p className="text-xs font-bold text-[#2F6FED]">
                {t('guideHome.gpsSearching')}
              </p>
            </div>
          ) : (
            /* Active GPS Status */
            <div className={`p-4 rounded-2xl border text-left flex items-center justify-between ${
              isAtHome 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-[#EAF2FF] border-[#CFE1FF] text-[#172B4D]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-extrabold">
                    {isAtHome ? t('guideHome.atHome') : t('guideHome.distFromHome', { dist: formatDistance(distanceToHome) })}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {t('guideHome.accuracy', { acc: gpsAccuracy || 10 })}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-white border border-slate-200">
                {isAtHome ? "✓" : "📍"}
              </span>
            </div>
          )}

          {/* Saved Home Destination Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-left flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#2F6FED] text-white flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
              🏠
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-[#2F6FED] uppercase tracking-wider">
                {home.name || (home.city ? `Home in ${home.city}` : "My Home")}
              </span>
              <h4 className="text-xl font-extrabold text-[#172B4D] mt-0.5">
                {home.name || (home.city ? `Home in ${home.city}` : "My Home")}
              </h4>
              <p className="text-sm text-slate-600 font-semibold mt-1">
                📍 {home.address || "Address saved"}
              </p>
            </div>
          </div>

          {/* Big Action Card */}
          <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFBEB] p-6 rounded-3xl border-2 border-[#FFC857] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFC857] text-[#172B4D] flex items-center justify-center mx-auto text-3xl shadow-sm">
              🚶
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">
                {isAtHome ? t('guideHome.atHome') : t('guideHome.guideMeButton')}
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-1 max-w-xs mx-auto">
                {isAtHome
                  ? t('guideHome.atHome')
                  : t('guideHome.subtitle')}
              </p>
            </div>

            {/* Launch Button */}
            <Button
              onClick={handleStartNavigation}
              disabled={gpsStatus === 'DENIED' || gpsStatus === 'UNSUPPORTED'}
              variant="primary"
              size="xl"
              fullWidth
              className="bg-[#2F6FED] hover:bg-[#255ecf] text-white text-xl font-black py-4 shadow-xl shadow-[#2F6FED]/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {t('guideHome.guideMeButton')}
            </Button>
          </div>

          {/* Emergency Option */}
          <div className="pt-1">
            <Button
              onClick={handleCallCaregiver}
              variant="emergency"
              size="md"
              fullWidth
              icon={Phone}
            >
              {t('guideHome.callCaregiver')}
            </Button>
          </div>
        </div>
      ) : (
        /* STEP 2: REAL DYNAMIC WALKING NAVIGATION */
        <div className="space-y-5">
          {/* Live Header Status */}
          <div className="bg-[#EAF2FF] px-4 py-2.5 rounded-2xl border border-[#CFE1FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-[#2F6FED] uppercase tracking-wider">
                GPS
              </span>
            </div>
            <span className="text-xs font-bold text-[#2F6FED] bg-white px-2.5 py-0.5 rounded-full border border-[#2F6FED]/20">
              {formatDistance(distanceToHome)}
            </span>
          </div>

          {/* Direction Indicator Visual */}
          <div className="bg-gradient-to-b from-white to-[#FAFBFD] p-6 rounded-3xl border-2 border-slate-200 flex flex-col items-center text-center shadow-sm relative">
            {/* Dynamic Rotating Direction Arrow */}
            <div className="relative mb-4">
              <div 
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-transform duration-500 shadow-xl border-4 ${
                  isAtHome
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                    : 'bg-[#2F6FED] text-white border-[#EAF2FF] shadow-[#2F6FED]/30'
                }`}
                style={{
                  transform: isAtHome ? 'none' : `rotate(${compass.arrowAngle}deg)`
                }}
              >
                {isAtHome ? (
                  <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
                ) : (
                  <ArrowUp className="w-16 h-16 stroke-[3]" />
                )}
              </div>

              {/* Speaker Replay Button */}
              <button
                type="button"
                onClick={handleSpeakInstruction}
                className="absolute -bottom-1 -right-1 p-3 rounded-full bg-white text-[#2F6FED] shadow-md border border-slate-200 hover:bg-slate-50 touch-target"
                title="Hear direction aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Text */}
            <h3 className="text-2xl font-extrabold text-[#172B4D] tracking-tight mb-1">
              {isAtHome ? t('guideHome.atHome') : `Head ${compass.label}`}
            </h3>

            <p className="text-base text-slate-600 font-semibold max-w-xs leading-relaxed">
              {isAtHome
                ? t('guideHome.atHome')
                : t('guideHome.distanceRemaining', { dist: formatDistance(distanceToHome), homeName: home.name || 'Home' })}
            </p>

            <span className="text-xs text-slate-400 font-medium mt-2">
              🧭 {t('guideHome.targetDirection', { heading: compass.label, degrees: Math.round(bearingToHome) })}
            </span>
          </div>

          {/* Genuine Movement Detection State */}
          <div className={`p-4 rounded-2xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${
            movementState === 'MOVING'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : movementState === 'STATIONARY'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {movementState === 'MOVING' ? (
              <>
                <Footprints className="w-5 h-5 text-emerald-600 animate-bounce" />
                <span>{t('guideHome.movingTowards')}</span>
              </>
            ) : movementState === 'STATIONARY' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{t('guideHome.stayingInPlace')}</span>
                </div>
              </div>
            ) : (
              <span>Detecting motion...</span>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="space-y-2.5 pt-1">
            {isAtHome ? (
              <Button
                onClick={() => {
                  handleStopNavigation();
                  onClose();
                }}
                variant="success"
                size="xl"
                fullWidth
                className="font-black text-xl shadow-lg"
              >
                ✓ {t('guideHome.atHome')}
              </Button>
            ) : (
              <Button
                onClick={handleStopNavigation}
                variant="outline"
                size="md"
                fullWidth
                className="bg-white text-slate-600 border-slate-300 font-bold"
              >
                {t('guideHome.stopGuidance')}
              </Button>
            )}

            <Button
              onClick={handleCallCaregiver}
              variant="emergency"
              size="md"
              fullWidth
              icon={Phone}
            >
              {t('guideHome.callCaregiver')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

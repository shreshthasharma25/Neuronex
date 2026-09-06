// Geolocation calculation utilities for NeuroNex Guide Me Home
// Uses genuine mathematical algorithms (Haversine formula, Spherical Bearing)
// No fake coordinates or mock simulations.

/**
 * Calculates the great-circle distance between two points on the Earth (Haversine formula).
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number|null} Distance in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null || isNaN(Number(lat1)) ||
    lon1 === undefined || lon1 === null || isNaN(Number(lon1)) ||
    lat2 === undefined || lat2 === null || isNaN(Number(lat2)) ||
    lon2 === undefined || lon2 === null || isNaN(Number(lon2))
  ) {
    return null;
  }

  const R = 6371e3; // Earth's mean radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(Number(lat1));
  const phi2 = toRad(Number(lat2));
  const deltaPhi = toRad(Number(lat2) - Number(lat1));
  const deltaLambda = toRad(Number(lon2) - Number(lon1));

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats a distance in meters into an elderly-friendly readable string.
 * @param {number} meters
 * @returns {string} e.g. "45 meters" or "1.2 km"
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return "Calculating distance...";
  }

  if (meters < 10) {
    return "A few steps away";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Calculates initial bearing (forward azimuth) from point 1 to point 2 in degrees (0 - 360).
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Bearing in degrees from North (0° = N, 90° = E, 180° = S, 270° = W)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null || isNaN(Number(lat1)) ||
    lon1 === undefined || lon1 === null || isNaN(Number(lon1)) ||
    lat2 === undefined || lat2 === null || isNaN(Number(lat2)) ||
    lon2 === undefined || lon2 === null || isNaN(Number(lon2))
  ) {
    return 0;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const phi1 = toRad(Number(lat1));
  const phi2 = toRad(Number(lat2));
  const deltaLambda = toRad(Number(lon2) - Number(lon1));

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Maps a bearing in degrees to 8 cardinal compass directions.
 * @param {number} bearing - 0 to 360 degrees
 * @returns {{ label: string, abbreviation: string, arrowAngle: number }}
 */
export function getCompassDirection(bearing) {
  const normalized = ((bearing % 360) + 360) % 360;
  const directions = [
    { label: "North", abbreviation: "N", min: 337.5, max: 22.5 },
    { label: "North-East", abbreviation: "NE", min: 22.5, max: 67.5 },
    { label: "East", abbreviation: "E", min: 67.5, max: 112.5 },
    { label: "South-East", abbreviation: "SE", min: 112.5, max: 157.5 },
    { label: "South", abbreviation: "S", min: 157.5, max: 202.5 },
    { label: "South-West", abbreviation: "SW", min: 202.5, max: 247.5 },
    { label: "West", abbreviation: "W", min: 247.5, max: 292.5 },
    { label: "North-West", abbreviation: "NW", min: 292.5, max: 337.5 },
  ];

  for (const d of directions) {
    if (d.label === "North") {
      if (normalized >= 337.5 || normalized < 22.5) {
        return { ...d, arrowAngle: normalized };
      }
    } else if (normalized >= d.min && normalized < d.max) {
      return { ...d, arrowAngle: normalized };
    }
  }

  return { label: "Ahead", abbreviation: "N", arrowAngle: 0 };
}

/**
 * Analyzes recent GPS coordinate history to determine if person is moving or stationary.
 * Uses GPS accuracy radius to avoid falsely classifying GPS jitter as movement.
 * @param {Array<{ lat: number, lng: number, accuracy: number, timestamp: number }>} history
 * @param {number} [windowMs=30000] - time window to inspect (default 30s)
 * @param {number} [minDisplacementMeters=15] - minimum true displacement to count as walking
 * @returns {'MOVING' | 'STATIONARY' | 'ANALYZING'}
 */
export function detectMovement(history, windowMs = 30000, minDisplacementMeters = 15) {
  if (!history || history.length < 2) {
    return 'ANALYZING';
  }

  const now = Date.now();
  const recentPoints = history.filter(p => now - p.timestamp <= windowMs);

  if (recentPoints.length < 2) {
    return 'ANALYZING';
  }

  const oldest = recentPoints[0];
  const newest = recentPoints[recentPoints.length - 1];

  const displacement = calculateDistanceMeters(oldest.lat, oldest.lng, newest.lat, newest.lng);
  if (displacement === null) return 'ANALYZING';

  const avgAccuracy = ((oldest.accuracy || 10) + (newest.accuracy || 10)) / 2;

  // If displacement exceeds both minimum threshold and average GPS uncertainty, they are genuinely walking
  const effectiveThreshold = Math.max(minDisplacementMeters, avgAccuracy * 1.2);

  if (displacement >= effectiveThreshold) {
    return 'MOVING';
  } else {
    return 'STATIONARY';
  }
}

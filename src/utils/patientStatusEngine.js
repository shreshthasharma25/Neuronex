/**
 * patientStatusEngine.js
 * 
 * Computes observational status for patients driven by their COGNITIVE SCORE
 * as the SINGLE SOURCE OF TRUTH:
 * 
 * - Stable: Cognitive score > 80% (e.g. 81%, 85%, 92%, 100%)
 * - Needs Attention: Cognitive score between 60% and 80%, inclusive (e.g. 60%, 67%, 72%, 80%)
 * - Higher Attention: Cognitive score < 60% (e.g. 59%, 52%, 37%, 20%)
 * 
 * Logic:
 * if (cognitiveScore > 80) {
 *     status = "Stable";
 * } else if (cognitiveScore >= 60 && cognitiveScore <= 80) {
 *     status = "Needs Attention";
 * } else {
 *     status = "Higher Attention";
 * }
 */

/**
 * Extracts numeric cognitive score from patient object or raw value
 * @param {Object|number} patient 
 * @returns {number} Cognitive score percentage (0-100)
 */
export function getPatientCognitiveScore(patient) {
  if (patient === null || patient === undefined) return 0;
  if (typeof patient === 'number') {
    return isNaN(patient) ? 0 : Math.max(0, Math.min(100, Math.round(patient)));
  }

  // Check direct cognitiveScore property first
  if (patient.cognitiveScore !== undefined && patient.cognitiveScore !== null && patient.cognitiveScore !== '') {
    const parsed = Number(patient.cognitiveScore);
    if (!isNaN(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  // Check cognitiveStats.averageAccuracy
  if (typeof patient.cognitiveStats?.averageAccuracy === 'number' && !isNaN(patient.cognitiveStats.averageAccuracy)) {
    return Math.max(0, Math.min(100, Math.round(patient.cognitiveStats.averageAccuracy)));
  }

  // Check cognitiveStats.score
  if (typeof patient.cognitiveStats?.score === 'number' && !isNaN(patient.cognitiveStats.score)) {
    return Math.max(0, Math.min(100, Math.round(patient.cognitiveStats.score)));
  }

  // Check latest history item accuracy
  if (Array.isArray(patient.cognitiveStats?.history) && patient.cognitiveStats.history.length > 0) {
    const first = patient.cognitiveStats.history[0];
    if (typeof first?.accuracy === 'number' && !isNaN(first.accuracy)) {
      return Math.max(0, Math.min(100, Math.round(first.accuracy)));
    }
  }

  // Check latestGameAccuracy
  if (typeof patient.latestGameAccuracy === 'number' && !isNaN(patient.latestGameAccuracy)) {
    return Math.max(0, Math.min(100, Math.round(patient.latestGameAccuracy)));
  }

  return 0;
}

/**
 * Classifies cognitive status using the exact rule specification:
 * - > 80 -> "Stable"
 * - 60 to 80 (inclusive) -> "Needs Attention"
 * - < 60 -> "Higher Attention"
 * 
 * @param {number} cognitiveScore
 * @returns {"Stable"|"Needs Attention"|"Higher Attention"}
 */
export function classifyCognitiveStatus(cognitiveScore) {
  const score = typeof cognitiveScore === 'number' ? cognitiveScore : Number(cognitiveScore) || 0;
  let status = "";
  if (score > 80) {
    status = "Stable";
  } else if (score >= 60 && score <= 80) {
    status = "Needs Attention";
  } else {
    status = "Higher Attention";
  }
  return status;
}

/**
 * Calculates patient attention status from their cognitive score
 * @param {Object|number} patient - Patient summary or full patient data object or score
 * @returns {Object} status object with level, label, reason, badgeClass, dotClass, icon, score
 */
export function calculatePatientStatus(patient) {
  const score = getPatientCognitiveScore(patient);
  const status = classifyCognitiveStatus(score);

  if (status === "Stable") {
    return {
      level: 'stable',
      label: 'Stable',
      reason: `Cognitive score is ${score}% (>80%), indicating steady & stable performance`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      icon: '🟢',
      score,
    };
  } else if (status === "Needs Attention") {
    return {
      level: 'needs_attention',
      label: 'Needs Attention',
      reason: `Cognitive score is ${score}% (60%–80%), requiring moderate monitoring & review`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: '🟡',
      score,
    };
  } else {
    return {
      level: 'high_attention', // preserves compatibility with filters expecting high_attention or higher_attention
      label: 'Higher Attention',
      reason: `Cognitive score is ${score}% (<60%), requiring higher attention & active support`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      icon: '🔴',
      score,
    };
  }
}

/**
 * Computes dashboard aggregate summary metrics dynamically from assigned patients' cognitive scores
 * @param {Array} patients - List of assigned patient summary objects
 * @returns {Object} { totalPatients, activePatients, stableCount, needsAttentionCount, higherAttentionCount, gamesCompletedToday }
 */
export function calculateDashboardSummary(patients = []) {
  if (!Array.isArray(patients) || patients.length === 0) {
    return {
      totalPatients: 0,
      activePatients: 0,
      stableCount: 0,
      needsAttentionCount: 0,
      higherAttentionCount: 0,
      gamesCompletedToday: 0,
    };
  }

  let totalPatients = patients.length;
  let activePatients = 0;
  let stableCount = 0;
  let needsAttentionCount = 0;
  let higherAttentionCount = 0;
  let gamesCompletedToday = 0;

  patients.forEach(patient => {
    // Cognitive score is the single source of truth for patient status
    const statusObj = calculatePatientStatus(patient);
    if (statusObj.label === 'Stable') {
      stableCount++;
      activePatients++;
    } else if (statusObj.label === 'Needs Attention') {
      needsAttentionCount++;
    } else if (statusObj.label === 'Higher Attention') {
      higherAttentionCount++;
    }

    // Games completed today
    let todayGames = 0;
    if (typeof patient.todayGamesCount === 'number') {
      todayGames = patient.todayGamesCount;
    } else if (patient.cognitiveStats?.history) {
      todayGames = patient.cognitiveStats.history.filter(h => {
        if (!h.date) return false;
        const d = String(h.date).toLowerCase();
        return d.includes('today');
      }).length;
    }
    gamesCompletedToday += todayGames;
  });

  return {
    totalPatients,
    activePatients,
    stableCount,
    needsAttentionCount,
    higherAttentionCount,
    gamesCompletedToday,
  };
}

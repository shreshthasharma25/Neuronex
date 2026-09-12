/**
 * patientStatusEngine.js
 * 
 * Computes non-clinical observational status for patients based on REAL available data:
 * - Cognitive game session accuracy trends (recent accuracy vs baseline)
 * - Activity recency & inactivity duration
 * - Unresolved safety alerts
 * - Routine / medication adherence
 * 
 * Output Status Levels:
 * - 🟢 Stable: Steady performance, regular activity, routine on schedule
 * - 🟡 Needs Attention: Moderate performance decrease, low activity (2-3 days), or active alert
 * - 🔴 High Attention: Significant score drop, prolonged inactivity (4+ days), or urgent unresolved alert
 * 
 * IMPORTANT: This status is an observational support indicator for caregivers,
 * NOT a medical or clinical diagnosis.
 */

/**
 * Calculates patient attention status from actual data records
 * @param {Object} patient - Patient summary or full patient data object
 * @returns {Object} status object with level, label, reason, badgeClass, dotClass, icon
 */
export function calculatePatientStatus(patient) {
  if (!patient) {
    return {
      level: 'stable',
      label: 'Stable',
      reason: 'No status information available',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      icon: '🟢',
    };
  }

  const cognitiveStats = patient.cognitiveStats || {};
  const history = cognitiveStats.history || [];
  const alerts = patient.alerts || [];
  const medicines = patient.medicines || [];
  const gamesCompleted = cognitiveStats.gamesCompleted || history.length || 0;
  const averageAccuracy = cognitiveStats.averageAccuracy || 0;

  // Unresolved alerts check
  const unresolvedAlerts = Array.isArray(alerts)
    ? alerts.filter(a => !a.resolved)
    : (typeof patient.unresolvedAlertsCount === 'number' ? patient.unresolvedAlertsCount : 0);
  
  const unresolvedCount = Array.isArray(unresolvedAlerts) ? unresolvedAlerts.length : unresolvedAlerts;

  const urgentAlert = Array.isArray(unresolvedAlerts)
    ? unresolvedAlerts.find(a => a.severity === 'URGENT' || (a.title && a.title.toLowerCase().includes('safe-zone')))
    : null;

  // 1. High Attention: Urgent safety alert pending
  if (urgentAlert) {
    return {
      level: 'high_attention',
      label: 'High Attention',
      reason: `Urgent safety alert: ${urgentAlert.title}`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      icon: '🔴',
    };
  }

  // 2. Cognitive sessions trend analysis
  let recentDrop = 0;
  let recentAccuracy = averageAccuracy;

  if (history.length >= 2 && averageAccuracy > 0) {
    // Look at last 2 sessions
    const recentSessions = history.slice(0, 2);
    const recentSum = recentSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
    recentAccuracy = Math.round(recentSum / recentSessions.length);
    recentDrop = averageAccuracy - recentAccuracy;
  }

  // 3. Activity Recency check
  let daysSinceLastActivity = 0;
  if (history.length > 0 && history[0].date) {
    const rawDate = history[0].timestamp || history[0].created_at;
    if (rawDate) {
      const lastDate = new Date(rawDate);
      const now = new Date();
      daysSinceLastActivity = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));
    } else if (typeof history[0].date === 'string') {
      const dateStr = history[0].date.toLowerCase();
      if (dateStr.includes('today')) {
        daysSinceLastActivity = 0;
      } else if (dateStr.includes('yesterday')) {
        daysSinceLastActivity = 1;
      } else {
        daysSinceLastActivity = 3;
      }
    }
  } else if (gamesCompleted === 0) {
    // Brand new profile without sessions
    daysSinceLastActivity = 0;
  }

  // High Attention conditions:
  // - Significant drop in score (>= 25% drop or recent accuracy < 50% with past performance)
  // - Prolonged inactivity (> 4 days without exercise for an existing patient)
  if (gamesCompleted > 1 && recentDrop >= 25) {
    return {
      level: 'high_attention',
      label: 'High Attention',
      reason: `Recent exercise score dropped ${recentDrop}% below average (${recentAccuracy}% vs ${averageAccuracy}%)`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      icon: '🔴',
    };
  }

  if (gamesCompleted > 0 && daysSinceLastActivity >= 4) {
    return {
      level: 'high_attention',
      label: 'High Attention',
      reason: `Prolonged inactivity: No exercises logged in the last ${daysSinceLastActivity} days`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      icon: '🔴',
    };
  }

  // Needs Attention conditions:
  // - Moderate decline (12% to 24% drop)
  // - Inactivity of 2 to 3 days
  // - Unresolved alerts pending (>= 1)
  // - Multiple missed medicines
  if (gamesCompleted > 1 && recentDrop >= 12) {
    return {
      level: 'needs_attention',
      label: 'Needs Attention',
      reason: `Recent exercise score decreased by ${recentDrop}% (${recentAccuracy}% vs ${averageAccuracy}%)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: '🟡',
    };
  }

  if (unresolvedCount > 0) {
    return {
      level: 'needs_attention',
      label: 'Needs Attention',
      reason: `${unresolvedCount} unresolved notification(s) pending review`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: '🟡',
    };
  }

  if (gamesCompleted > 0 && daysSinceLastActivity >= 2) {
    return {
      level: 'needs_attention',
      label: 'Needs Attention',
      reason: `No exercises completed in the past ${daysSinceLastActivity} days`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: '🟡',
    };
  }

  // Check medicines if present
  if (Array.isArray(medicines) && medicines.length > 0) {
    const totalMeds = medicines.length;
    const takenMeds = medicines.filter(m => m.taken).length;
    const currentHour = new Date().getHours();
    // If late evening (after 18:00) and zero meds taken
    if (currentHour >= 18 && takenMeds === 0 && totalMeds > 0) {
      return {
        level: 'needs_attention',
        label: 'Needs Attention',
        reason: `0 of ${totalMeds} daily medicines checked off today`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
        icon: '🟡',
      };
    }
  }

  // Stable states
  if (gamesCompleted === 0) {
    return {
      level: 'stable',
      label: 'Stable',
      reason: 'New patient profile; awaiting initial exercise activity',
      badgeClass: 'bg-blue-50 text-[#2F6FED] border-blue-200',
      dotClass: 'bg-blue-500',
      icon: '🟢',
    };
  }

  return {
    level: 'stable',
    label: 'Stable',
    reason: `Exercise scores steady (${averageAccuracy}% avg); routine on track`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: '🟢',
  };
}

/**
 * Computes dashboard aggregate summary metrics from assigned patients list
 * @param {Array} patients - List of assigned patient summary objects
 * @returns {Object} { totalPatients, activePatients, needsAttentionCount, gamesCompletedToday }
 */
export function calculateDashboardSummary(patients = []) {
  if (!Array.isArray(patients) || patients.length === 0) {
    return {
      totalPatients: 0,
      activePatients: 0,
      needsAttentionCount: 0,
      gamesCompletedToday: 0,
    };
  }

  let totalPatients = patients.length;
  let activePatients = 0;
  let needsAttentionCount = 0;
  let gamesCompletedToday = 0;

  patients.forEach(patient => {
    // 1. Status calculation
    const status = patient.status || calculatePatientStatus(patient);
    if (status.level === 'needs_attention' || status.level === 'high_attention') {
      needsAttentionCount++;
    }

    // 2. Games completed today
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

    // 3. Active patient: has games completed or today activity
    const totalGames = patient.cognitiveStats?.gamesCompleted || patient.cognitiveStats?.history?.length || 0;
    const hasTodayActivity = todayGames > 0 || patient.brainExercise?.dailyCompleted;
    if (totalGames > 0 || hasTodayActivity) {
      activePatients++;
    }
  });

  return {
    totalPatients,
    activePatients,
    needsAttentionCount,
    gamesCompletedToday,
  };
}

/**
 * cognitiveAnalyticsEngine.js
 * 
 * Core analytics engine for NEURO-NEX Cognitive Health Tracking.
 * Standardizes 4 core cognitive domains: Memory, Recall, Attention, and Focus.
 * Recognizes and aggregates tasks, computes trend lines, daily response metrics,
 * overall performance indices, and dynamic natural language summaries.
 */

// ─── 1. CORE DOMAIN SPECIFICATIONS ──────────────────────────────────────────

export const COGNITIVE_DOMAINS = {
  memory: {
    id: 'memory',
    name: 'Memory',
    icon: '🧠',
    color: '#1E5E3A', // Deep Forest Green
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    barClass: 'bg-[#1E5E3A]',
    description: 'Visual working memory, spatial pairing & personal history',
    defaultPrompt: 'Complete a Memory Match or Picture Recall task to measure this domain.'
  },
  recall: {
    id: 'recall',
    name: 'Recall',
    icon: '🔄',
    color: '#0D9488', // Teal
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    barClass: 'bg-[#0D9488]',
    description: 'Active retrieval of everyday items, names, words & routines',
    defaultPrompt: 'Complete a Memory Basket or Sequence Recall task to measure this domain.'
  },
  attention: {
    id: 'attention',
    name: 'Attention',
    icon: '🎯',
    color: '#D98A1E', // Warm Ochre / Terracotta
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    barClass: 'bg-[#D98A1E]',
    description: 'Visual scene observation, odd-one-out & detail discrimination',
    defaultPrompt: 'Complete a Find the Different Object task to measure this domain.'
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    icon: '⚡',
    color: '#2E6B52', // Muted Pine Green
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    barClass: 'bg-[#2E6B52]',
    description: 'Sustained concentration, sequential tapping & pattern tracking',
    defaultPrompt: 'Complete a Pattern Following or Sequence Tap task to measure this domain.'
  }
};

// ─── 2. TASK & GAME REGISTRY (16 DISTINCT TASKS ACROSS 4 DOMAINS) ────────────

export const COGNITIVE_TASKS = [
  // 🧠 Memory Domain
  {
    id: 'memory-twin',
    name: 'Memory Match',
    aliases: ['Memory Twin', 'Card Matching Exercise', 'Tea Garden Recall'],
    domain: 'memory',
    defaultDuration: '2 mins'
  },
  {
    id: 'memory-basket',
    name: 'Memory Basket',
    aliases: ['Shopping Basket Recall', 'Harvest Basket'],
    domain: 'recall', // Contributes to Recall & Memory
    secondaryDomain: 'memory',
    defaultDuration: '3 mins'
  },
  {
    id: 'picture-memory',
    name: 'Picture Recall',
    aliases: ['Remember the Picture', 'Scene Observation', 'Garden Memories'],
    domain: 'memory',
    secondaryDomain: 'attention',
    defaultDuration: '3 mins'
  },
  {
    id: 'remember-objects',
    name: 'Remember the Objects',
    aliases: ['Object Recall', 'Object Memory'],
    domain: 'memory',
    defaultDuration: '2 mins'
  },

  // 🔄 Recall Domain
  {
    id: 'family-memory',
    name: 'Name Recall',
    aliases: ['Family Memory', 'Family Quiz & Faces', 'Name & Face Recall'],
    domain: 'recall',
    secondaryDomain: 'memory',
    defaultDuration: '3 mins'
  },
  {
    id: 'daily-routine',
    name: 'Sequence Recall',
    aliases: ['Daily Routine', 'What Comes Next?', 'Village Rhythm'],
    domain: 'recall',
    secondaryDomain: 'focus',
    defaultDuration: '2 mins'
  },
  {
    id: 'word-recall',
    name: 'Word Recall',
    aliases: ['Verbal Memory', 'Word Association'],
    domain: 'recall',
    defaultDuration: '2 mins'
  },
  {
    id: 'number-recall',
    name: 'Number Recall',
    aliases: ['Digit Span', 'Number Memory'],
    domain: 'recall',
    defaultDuration: '2 mins'
  },

  // 🎯 Attention Domain
  {
    id: 'odd-one-out',
    name: 'Find the Different Object',
    aliases: ['Odd One Out', 'Attention & Difference', 'Forest Canopy'],
    domain: 'attention',
    defaultDuration: '2 mins'
  },
  {
    id: 'attention-select',
    name: 'Attention Select',
    aliases: ['Selective Attention', 'Color Match Tap'],
    domain: 'attention',
    defaultDuration: '2 mins'
  },
  {
    id: 'visual-attention',
    name: 'Visual Attention',
    aliases: ['Visual Search', 'Scene Scanner'],
    domain: 'attention',
    defaultDuration: '2 mins'
  },
  {
    id: 'target-detection',
    name: 'Target Detection',
    aliases: ['Symbol Detection', 'Rapid Target Spotting'],
    domain: 'attention',
    defaultDuration: '2 mins'
  },

  // ⚡ Focus Domain
  {
    id: 'pattern-memory',
    name: 'Pattern Following',
    aliases: ['Number & Pattern', 'Sequence Memory', 'River Journey'],
    domain: 'focus',
    defaultDuration: '2 mins'
  },
  {
    id: 'sequence-tap',
    name: 'Sequence Tap',
    aliases: ['Speed Tap', 'Rhythm Tap'],
    domain: 'focus',
    defaultDuration: '2 mins'
  },
  {
    id: 'focus-trail',
    name: 'Focus Trail',
    aliases: ['Trail Making', 'Path Finder'],
    domain: 'focus',
    defaultDuration: '3 mins'
  },
  {
    id: 'sustained-attention',
    name: 'Sustained Attention Task',
    aliases: ['Continuous Performance', 'Vigilance Task'],
    domain: 'focus',
    defaultDuration: '3 mins'
  }
];

// ─── 3. LOOKUP HELPERS ───────────────────────────────────────────────────────

/**
 * Resolves the cognitive domain for any task name or ID
 * @param {string} identifier - gameId or gameName or category
 * @returns {'memory'|'recall'|'attention'|'focus'}
 */
export function getDomainForTask(identifier) {
  if (!identifier) return 'memory';
  const clean = String(identifier).toLowerCase().trim();

  if (clean === 'memory' || clean === 'recall' || clean === 'attention' || clean === 'focus') {
    return clean;
  }
  if (clean === 'sequencing') {
    return 'focus';
  }

  // Exact ID match
  const taskById = COGNITIVE_TASKS.find(t => t.id.toLowerCase() === clean);
  if (taskById) return taskById.domain;

  // Name or Alias match
  const taskByName = COGNITIVE_TASKS.find(t =>
    t.name.toLowerCase() === clean ||
    (t.aliases && t.aliases.some(a => a.toLowerCase() === clean || clean.includes(a.toLowerCase())))
  );
  if (taskByName) return taskByName.domain;

  // Fallback heuristics
  if (clean.includes('memory') || clean.includes('match') || clean.includes('twin') || clean.includes('picture')) {
    return 'memory';
  }
  if (clean.includes('recall') || clean.includes('basket') || clean.includes('family') || clean.includes('word') || clean.includes('number')) {
    return 'recall';
  }
  if (clean.includes('attention') || clean.includes('odd') || clean.includes('different') || clean.includes('target')) {
    return 'attention';
  }
  if (clean.includes('focus') || clean.includes('pattern') || clean.includes('sequence') || clean.includes('routine') || clean.includes('tap') || clean.includes('trail')) {
    return 'focus';
  }

  return 'memory';
}

/**
 * Normalizes any session record into a standardized performance object
 */
export function normalizeSession(session, index = 0) {
  if (!session) return null;

  const gameId = session.gameId || session.id || `task-${index}`;
  const gameName = session.gameName || session.taskName || 'Cognitive Activity';
  const rawDomain = session.cognitiveDomain || session.domain || session.category;
  const domain = getDomainForTask(rawDomain || gameId || gameName);

  const score = typeof session.score === 'number'
    ? session.score
    : (typeof session.accuracy === 'number' ? session.accuracy : 80);

  const accuracy = typeof session.accuracy === 'number' ? session.accuracy : score;

  const timeTaken = session.timeTaken || session.time || (session.responseTime ? `${session.responseTime}s` : '1m 30s');

  const timestamp = session.timestamp
    ? (typeof session.timestamp === 'number' ? session.timestamp : new Date(session.timestamp).getTime())
    : (session.date && !isNaN(new Date(session.date).getTime())
        ? new Date(session.date).getTime()
        : Date.now() - (index * 86400000));

  const dateStr = session.date || new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: session.id || `session-${index}-${timestamp}`,
    gameId,
    gameName,
    cognitiveDomain: domain,
    domain,
    score: Math.max(0, Math.min(100, Math.round(score))),
    accuracy: Math.max(0, Math.min(100, Math.round(accuracy))),
    timeTaken,
    responseTime: session.responseTime || 5,
    difficulty: session.difficulty || `Level ${session.difficultyLevel || 1}`,
    difficultyLevel: session.difficultyLevel || 1,
    attempts: session.attempts || 1,
    date: dateStr,
    timestamp: isNaN(timestamp) ? Date.now() : timestamp
  };
}

// ─── 4. DYNAMIC DOMAIN METRICS CALCULATION ───────────────────────────────────

/**
 * Computes live domain scores, session counts, and measured activities from history
 * Ensures NEVER returning "N/A"
 * @param {Array} history 
 * @returns {Object} { memory: {...}, recall: {...}, attention: {...}, focus: {...} }
 */
export function calculateDomainStats(history = []) {
  const normalized = (history || [])
    .map((s, idx) => normalizeSession(s, idx))
    .filter(Boolean);

  const domains = ['memory', 'recall', 'attention', 'focus'];
  const results = {};

  domains.forEach(dKey => {
    const config = COGNITIVE_DOMAINS[dKey];
    const sessions = normalized.filter(s => s.domain === dKey);

    if (sessions.length > 0) {
      // Calculate average score across sessions
      const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
      const avgScore = Math.round(totalScore / sessions.length);

      // Determine simple status: Strong (>=80), Stable (65-79), Needs Practice (<65)
      let status = 'Stable';
      let statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      if (avgScore >= 80) {
        status = 'Strong';
        statusBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      } else if (avgScore >= 65) {
        status = 'Stable';
        statusBadge = 'bg-teal-50 text-teal-800 border-teal-200';
      } else {
        status = 'Needs Practice';
        statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
      }

      // Extract unique task names measured
      const activities = Array.from(new Set(sessions.map(s => s.gameName)));

      // Latest session
      const latest = sessions[0];

      results[dKey] = {
        id: dKey,
        name: config.name,
        icon: config.icon,
        color: config.color,
        badgeBg: config.badgeBg,
        barClass: config.barClass,
        description: config.description,
        score: avgScore,
        status,
        statusBadge,
        sessionsCount: sessions.length,
        activitiesMeasured: activities,
        latestDate: latest ? latest.date : null,
        hasData: true,
        prompt: null
      };
    } else {
      // Meaningful empty state - NEVER "N/A"
      results[dKey] = {
        id: dKey,
        name: config.name,
        icon: config.icon,
        color: config.color,
        badgeBg: config.badgeBg,
        barClass: config.barClass,
        description: config.description,
        score: null,
        status: 'No recent data',
        statusBadge: 'bg-slate-100 text-slate-500 border-slate-200',
        sessionsCount: 0,
        activitiesMeasured: [],
        latestDate: null,
        hasData: false,
        prompt: `Complete a ${config.name} activity to measure this area.`
      };
    }
  });

  return results;
}

// ─── 5. OVERALL COGNITIVE PERFORMANCE INDEX ──────────────────────────────────

/**
 * Calculates overall cognitive performance index from measured domains
 * Average of the latest valid scores across measured domains
 */
export function calculateOverallPerformanceIndex(domainStats, history = []) {
  const normalized = (history || [])
    .map((s, idx) => normalizeSession(s, idx))
    .filter(Boolean);

  const activeDomains = Object.values(domainStats || {}).filter(d => d.hasData && typeof d.score === 'number');

  let overallScore = 0;
  if (activeDomains.length > 0) {
    const sum = activeDomains.reduce((acc, d) => acc + d.score, 0);
    overallScore = Math.round(sum / activeDomains.length);
  } else if (normalized.length > 0) {
    const sum = normalized.reduce((acc, s) => acc + s.score, 0);
    overallScore = Math.round(sum / normalized.length);
  }

  const latestSession = normalized.length > 0 ? normalized[0] : null;

  let trajectory = 'stable';
  if (normalized.length >= 3) {
    const recent = normalized.slice(0, 3).reduce((a, s) => a + s.score, 0) / 3;
    const prior = normalized.slice(3, 6).reduce((a, s) => a + s.score, 0) / (normalized.length - 3 || 1);
    if (recent - prior >= 5) {
      trajectory = 'improving';
    } else if (prior - recent >= 8) {
      trajectory = 'fluctuating';
    }
  }

  const now = new Date();
  const lastUpdated = latestSession
    ? latestSession.date
    : `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    score: overallScore,
    sessionsCompleted: normalized.length,
    sessionsAnalyzed: normalized.length,
    activeDomainsCount: activeDomains.length,
    totalDomainsCount: 4,
    latestActivity: latestSession ? latestSession.gameName : 'None',
    latestActivityName: latestSession ? latestSession.gameName : 'None',
    latestActivityScore: latestSession ? latestSession.score : 0,
    latestActivityDate: latestSession ? latestSession.date : 'N/A',
    lastUpdated,
    trajectory
  };
}

// ─── 6. PERFORMANCE TRENDS TIME-SERIES ───────────────────────────────────────

/**
 * Builds chronological data points for the Performance Trends graph
 * Supports filtering by domain and time range ('7d', '30d', 'month')
 * Formats short non-repeating date labels ("Sep 7", "Sep 8", "Today")
 * 
 * @param {Array} history 
 * @param {'all'|'memory'|'recall'|'attention'|'focus'} selectedDomain 
 * @param {'7d'|'30d'|'month'} timeRange 
 * @returns {Array} chronological trend points
 */
export function getPerformanceTrends(history = [], selectedDomain = 'all', timeRange = '7d') {
  const normalized = (history || [])
    .map((s, idx) => normalizeSession(s, idx))
    .filter(Boolean);

  const domainFiltered = selectedDomain === 'all'
    ? normalized
    : normalized.filter(s => s.domain === selectedDomain);

  // Time range filtering
  const now = new Date();
  const nowMs = now.getTime();
  let cutoffMs = 0;

  if (timeRange === '7d') {
    cutoffMs = nowMs - 7 * 86400000;
  } else if (timeRange === '30d') {
    cutoffMs = nowMs - 30 * 86400000;
  } else if (timeRange === 'month') {
    cutoffMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  let timeFiltered = domainFiltered.filter(s => s.timestamp >= cutoffMs);
  // If time filter leaves 0 points but domainFiltered has data, show all domainFiltered points gracefully
  if (timeFiltered.length === 0 && domainFiltered.length > 0) {
    timeFiltered = domainFiltered;
  }

  // Sort chronological (oldest to newest for plotting left-to-right)
  const sorted = [...timeFiltered].sort((a, b) => a.timestamp - b.timestamp);

  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const total = sorted.length;

  const points = sorted.map((s, i) => {
    const dateObj = new Date(s.timestamp);
    let label = '';

    if (dateObj.toDateString() === todayStr) {
      label = 'Today';
    } else if (dateObj.toDateString() === yesterdayStr) {
      label = 'Yesterday';
    } else if (!isNaN(dateObj.getTime())) {
      label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g. "Sep 7"
    } else {
      label = `S${i + 1}`;
    }

    // Auto-thin visible labels when many points exist to avoid clutter
    const showLabel = total <= 8 || i === 0 || i === total - 1 || i % Math.ceil(total / 6) === 0;

    return {
      id: s.id,
      index: i,
      label,
      showLabel,
      fullDate: s.date,
      score: s.score,
      accuracy: s.accuracy,
      domain: s.domain,
      domainConfig: COGNITIVE_DOMAINS[s.domain] || COGNITIVE_DOMAINS.memory,
      gameName: s.gameName,
      timeTaken: s.timeTaken,
      difficulty: s.difficulty,
      timestamp: s.timestamp
    };
  });

  return points;
}

// ─── 7. DAILY COGNITIVE RESPONSE (7-DAY ACTIVITY BAR CHART) ──────────────────

/**
 * Aggregates sessions by day over the past 7 days for the Daily Cognitive Response chart
 */
export function getDailyCognitiveResponse(history = [], days = 7) {
  const normalized = (history || [])
    .map((s, idx) => normalizeSession(s, idx))
    .filter(Boolean);

  const now = new Date();
  const dailyBuckets = [];

  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Find sessions that fell into this day
    const daySessions = normalized.filter(s => {
      const sDate = new Date(s.timestamp);
      return sDate >= targetDate && sDate < nextDate;
    });

    const tasksCompleted = daySessions.length;
    const avgScore = tasksCompleted > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + s.score, 0) / tasksCompleted)
      : 0;

    const avgResponseTime = tasksCompleted > 0
      ? Number((daySessions.reduce((sum, s) => sum + s.responseTime, 0) / tasksCompleted).toFixed(1))
      : 0;

    dailyBuckets.push({
      day: dayName,
      date: formattedDate,
      fullDate: targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      tasksCompleted,
      averageScore: avgScore,
      averageResponseSecs: avgResponseTime,
      isToday: i === 0,
      sessions: daySessions
    });
  }

  return dailyBuckets;
}

// ─── 8. AI COGNITIVE SUMMARY GENERATOR ──────────────────────────────────────

/**
 * Dynamically synthesizes an observational narrative from domain stats & history
 */
export function generateAICognitiveSummary(domainStats, history = []) {
  const normalized = (history || [])
    .map((s, idx) => normalizeSession(s, idx))
    .filter(Boolean);

  if (normalized.length === 0) {
    return "Cognitive activity tracking has initialized. Once the patient begins their first calming memory journey, automated domain observations and personalized wellness trajectories will appear here.";
  }

  const activeDomains = Object.values(domainStats || {}).filter(d => d.hasData && typeof d.score === 'number');

  if (activeDomains.length === 0) {
    return `Patient has completed ${normalized.length} activity attempt. Continued engagement across exercises will build individual domain profiles.`;
  }

  // Sort domains by score
  const sortedDomains = [...activeDomains].sort((a, b) => b.score - a.score);
  const highest = sortedDomains[0];
  const lowest = sortedDomains[sortedDomains.length - 1];

  let summaryParts = [];

  // Trajectory & stability sentence
  const recentScores = normalized.slice(0, 4).map(s => s.score);
  const maxDiff = recentScores.length >= 2 ? Math.max(...recentScores) - Math.min(...recentScores) : 0;
  if (maxDiff <= 10) {
    summaryParts.push("Performance has remained steady and consistent this week.");
  } else {
    summaryParts.push("Performance shows natural daily variations reflecting regular alertness rhythms.");
  }

  // Strongest domain observation
  if (highest) {
    summaryParts.push(
      `${highest.name} is currently the strongest area (averaging ${highest.score}% across ${highest.sessionsCount} session${highest.sessionsCount > 1 ? 's' : ''}).`
    );
  }

  // Practice area observation
  if (lowest && lowest.id !== highest.id && lowest.score < highest.score) {
    if (lowest.score >= 75) {
      summaryParts.push(
        `${lowest.name} response is also well-maintained at ${lowest.score}%, indicating balanced cognitive wellness.`
      );
    } else {
      summaryParts.push(
        `${lowest.name} (${lowest.score}%) may benefit from continued gentle practice through everyday exercises.`
      );
    }
  }

  return summaryParts.join(' ');
}

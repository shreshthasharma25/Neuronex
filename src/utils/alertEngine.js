// Time-Based Smart Alerts Engine for NeuroNex
// Evaluates medicines, routines, and to-do reminders against current browser/system clock
// Categorizes into: DUE_NOW, UPCOMING, MISSED, COMPLETED

/**
 * Parses time strings like "8:00 AM", "6:30 PM", "14:00" into minutes from midnight
 * @param {string} timeStr 
 * @returns {number|null} minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim();
  
  // Match "8:00 AM", "08:30 pm", "8 AM", "8PM"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = match12[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Match 24hr format "14:30", "08:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Evaluates all reminders against current system time
 * @param {object} patientData 
 * @param {Date} [customNow]
 * @returns {object} { activeAlert: object|null, allAlerts: Array, dueCount: number }
 */
export function evaluateTimeBasedAlerts(patientData, customNow = new Date()) {
  if (!patientData) return { activeAlert: null, allAlerts: [], dueCount: 0 };

  const currentMinutes = customNow.getHours() * 60 + customNow.getMinutes();
  const alerts = [];

  // 1. Evaluate Scheduled Medicines
  if (patientData.medicines && Array.isArray(patientData.medicines)) {
    patientData.medicines.forEach(med => {
      const scheduledMinutes = parseTimeToMinutes(med.time);
      let status = 'UPCOMING';
      let diffMinutes = 0;

      if (med.taken) {
        status = 'COMPLETED';
      } else if (scheduledMinutes !== null) {
        diffMinutes = currentMinutes - scheduledMinutes;
        // Window: 60 minutes before up to 90 minutes after scheduled time is DUE_NOW
        if (diffMinutes >= -60 && diffMinutes <= 90) {
          status = 'DUE_NOW';
        } else if (diffMinutes > 90) {
          status = 'MISSED';
        } else {
          status = 'UPCOMING';
        }
      } else {
        status = 'DUE_NOW'; // If no explicit time parseable, mark active if pending
      }

      alerts.push({
        id: med.id,
        type: 'medicine',
        title: 'Medicine Time',
        subtitle: med.name,
        instructions: med.notes || 'Take as prescribed by doctor',
        time: med.time,
        tag: med.tag || 'Daily',
        status, // 'DUE_NOW' | 'UPCOMING' | 'MISSED' | 'COMPLETED'
        isCompleted: !!med.taken,
        rawItem: med,
        diffMinutes: Math.abs(diffMinutes),
        scheduledMinutes: scheduledMinutes !== null ? scheduledMinutes : 9999
      });
    });
  }

  // 2. Evaluate Scheduled To-Do Tasks (with time)
  if (patientData.todos && Array.isArray(patientData.todos)) {
    patientData.todos.forEach(todo => {
      // Don't duplicate if it's already an auto-generated med todo
      if (todo.isMed) return;

      const scheduledMinutes = parseTimeToMinutes(todo.time);
      let status = 'UPCOMING';
      let diffMinutes = 0;

      if (todo.completed) {
        status = 'COMPLETED';
      } else if (scheduledMinutes !== null) {
        diffMinutes = currentMinutes - scheduledMinutes;
        if (diffMinutes >= -45 && diffMinutes <= 90) {
          status = 'DUE_NOW';
        } else if (diffMinutes > 90) {
          status = 'MISSED';
        } else {
          status = 'UPCOMING';
        }
      } else {
        // Untimed todo: stays in general to-do list, not urgent banner
        status = 'UPCOMING';
      }

      if (scheduledMinutes !== null) {
        alerts.push({
          id: todo.id,
          type: 'todo',
          title: 'Scheduled Task',
          subtitle: todo.title,
          instructions: todo.recurrence ? `Repeat: ${todo.recurrence}` : 'Daily Routine',
          time: todo.time,
          tag: todo.recurrence || 'Task',
          status,
          isCompleted: !!todo.completed,
          rawItem: todo,
          diffMinutes: Math.abs(diffMinutes),
          scheduledMinutes
        });
      }
    });
  }

  // Filter out completed for active alert determination
  const pendingAlerts = alerts.filter(a => a.status !== 'COMPLETED');

  // Sort priority: DUE_NOW first (closest diffMinutes), then MISSED, then UPCOMING (earliest scheduled)
  pendingAlerts.sort((a, b) => {
    const statusScore = { 'DUE_NOW': 1, 'MISSED': 2, 'UPCOMING': 3 };
    if (statusScore[a.status] !== statusScore[b.status]) {
      return statusScore[a.status] - statusScore[b.status];
    }
    return a.diffMinutes - b.diffMinutes;
  });

  // Pick the top DUE_NOW or MISSED alert
  const topActive = pendingAlerts.length > 0 && (pendingAlerts[0].status === 'DUE_NOW' || pendingAlerts[0].status === 'MISSED')
    ? pendingAlerts[0]
    : null;

  const dueCount = pendingAlerts.filter(a => a.status === 'DUE_NOW').length;

  return {
    activeAlert: topActive,
    allAlerts: alerts,
    dueCount
  };
}

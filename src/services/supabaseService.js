/**
 * supabaseService.js
 * Handles all Supabase read/write operations for NeuroNex.
 * All functions degrade gracefully to localStorage when Supabase is not configured.
 */
import { supabase, isSupabaseEnabled } from "./supabaseClient";
import { calculatePatientStatus } from "../utils/patientStatusEngine";

// ─── PATIENT PROFILE ────────────────────────────────────────────────────────

export async function loadPatientData(patientId) {
  if (!isSupabaseEnabled) return null;
  try {
    const [
      { data: profile },
      { data: family },
      { data: medicines },
      { data: todos },
      { data: memories },
      { data: alerts },
      { data: sessions },
    ] = await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).maybeSingle(),
      supabase.from("family_members").select("*").eq("patient_id", patientId),
      supabase.from("medicines").select("*").eq("patient_id", patientId),
      supabase.from("todos").select("*").eq("patient_id", patientId).order("created_at", { ascending: true }),
      supabase.from("memories").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(50),
      supabase.from("cognitive_sessions").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(30),
    ]);

    if (!profile) return null;

    return {
      profile: {
        fullName: profile.full_name || "",
        preferredName: profile.preferred_name || "",
        age: profile.age || "",
        gender: profile.gender || "Female",
        email: profile.email || "",
        phone: profile.phone || "",
        language: profile.language || "English",
        avatar: profile.avatar_url || "",
        registered: true,
      },
      homeLocation: {
        address: profile.home_address || "",
        city: profile.home_city || "",
        safeZoneRadius: profile.safe_zone_radius || 500,
        currentDistance: 0,
        coordinates: profile.home_coordinates || null,
      },
      importantInfo: profile.doctor_name
        ? [{ id: "info-doc", label: "Doctor", value: `${profile.doctor_name} - ${profile.doctor_phone}` }]
        : [],
      family: (family || []).map(f => ({
        id: f.id,
        name: f.name,
        relation: f.relation,
        phone: f.phone || "",
        photo: f.photo_url || "",
        notes: f.notes || "",
        isEmergency: f.is_emergency || false,
      })),
      medicines: (medicines || []).map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage || "",
        time: m.time || "",
        instructions: m.instructions || "",
        taken: m.taken || false,
      })),
      todos: (todos || []).map(t => ({
        id: t.id,
        title: t.title,
        time: t.time || "",
        recurrence: t.recurrence || "",
        completed: t.completed || false,
        active: t.active !== false,
        isMed: t.is_med || false,
        isExercise: t.is_exercise || false,
      })),
      memories: (memories || []).map(m => ({
        id: m.id,
        title: m.title,
        date: m.date || "",
        description: m.description || "",
        photo: m.photo_url || "",
        tags: m.tags || [],
      })),
      alerts: (alerts || []).map(a => ({
        id: a.id,
        type: a.type || "warning",
        title: a.title,
        message: a.message || "",
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
        resolved: a.resolved || false,
      })),
      cognitiveStats: buildCognitiveStats(sessions || [], profile),
      places: [],
      routine: [],
      emergencyContacts: [
        { id: "ec-3", title: "CALL POLICE", name: "Police Emergency (Standard Service)", phone: "100", isService: true },
        { id: "ec-4", title: "EMERGENCY AMBULANCE", name: "Medical Ambulance (Standard Service)", phone: "108", isService: true },
      ],
      brainExercise: {
        dailyCompleted: profile.daily_exercise_done || false,
        scheduledTime: profile.exercise_time || "10:00 AM",
        todaysGames: ["memory-basket", "odd-one-out", "picture-memory"],
        dayCycle: 1,
      },
    };
  } catch (err) {
    console.error("Supabase loadPatientData error:", err);
    return null;
  }
}

function buildCognitiveStats(sessions, profile) {
  const history = sessions.map(s => {
    // Map sequencing to focus for the new cognitive domains
    let cat = (s.category || "memory").toLowerCase();
    if (cat === 'sequencing') cat = 'focus';
    
    return {
      id: s.id,
      gameName: s.game_name,
      date: new Date(s.created_at).toLocaleDateString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
      timestamp: new Date(s.created_at).getTime(),
      accuracy: s.accuracy,
      time: s.time_taken,
      difficulty: s.difficulty || "Level 1",
      category: cat
    };
  });

  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  const recentSessions = history.filter(s => now - s.timestamp <= oneWeek);
  const baselineSessions = history.filter(s => now - s.timestamp > oneWeek);

  const calculateDomainScores = (sessList) => {
    const scores = { memory: 0, recall: 0, attention: 0, focus: 0 };
    const counts = { memory: 0, recall: 0, attention: 0, focus: 0 };
    sessList.forEach(s => {
      if (scores[s.category] !== undefined) {
        scores[s.category] += s.accuracy;
        counts[s.category]++;
      }
    });
    Object.keys(scores).forEach(k => {
      scores[k] = counts[k] > 0 ? Math.round(scores[k] / counts[k]) : null;
    });
    return { scores, counts };
  };

  const currentData = calculateDomainScores(recentSessions);
  const baselineData = calculateDomainScores(baselineSessions);
  const allTimeData = calculateDomainScores(history);

  // Group by day for the trend chart
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
    const startOfDay = new Date(d.setHours(0,0,0,0)).getTime();
    const endOfDay = new Date(d.setHours(23,59,59,999)).getTime();
    
    const daySessions = history.filter(s => s.timestamp >= startOfDay && s.timestamp <= endOfDay);
    const dayScores = calculateDomainScores(daySessions).scores;
    
    weeklyTrends.push({
      day: dayName,
      memory: dayScores.memory,
      recall: dayScores.recall,
      attention: dayScores.attention,
      focus: dayScores.focus,
    });
  }

  return {
    currentLevel: profile.difficulty_level || 1,
    consecutiveHighScores: profile.consecutive_high_scores || 0,
    gamesCompleted: history.length,
    recentGamesCompleted: recentSessions.length,
    currentScores: currentData.scores,
    baselineScores: baselineData.scores,
    allTimeScores: allTimeData.scores,
    weeklyTrends,
    history,
  };
}

// ─── UPSERT PATIENT PROFILE ─────────────────────────────────────────────────

export async function upsertPatient(patientId, profile, homeLocation, doctorInfo, cognitiveLevel) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("patients").upsert({
      id: patientId,
      full_name: profile.fullName,
      preferred_name: profile.preferredName,
      age: profile.age,
      gender: profile.gender,
      email: profile.email,
      phone: profile.phone,
      language: profile.language,
      avatar_url: profile.avatar,
      home_address: homeLocation?.address,
      home_city: homeLocation?.city,
      safe_zone_radius: homeLocation?.safeZoneRadius,
      home_coordinates: homeLocation?.coordinates,
      doctor_name: doctorInfo?.name,
      doctor_phone: doctorInfo?.phone,
      difficulty_level: cognitiveLevel || 1,
    });
  } catch (err) {
    console.error("upsertPatient error:", err);
  }
}

// ─── FAMILY MEMBERS ──────────────────────────────────────────────────────────

export async function addFamilyMemberDB(patientId, member) {
  if (!isSupabaseEnabled) return member;
  try {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        id: member.id,
        patient_id: patientId,
        name: member.name,
        relation: member.relation,
        phone: member.phone || "",
        photo_url: member.photo || "",
        notes: member.notes || "",
        is_emergency: member.isEmergency || false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("addFamilyMemberDB error:", err);
    return member;
  }
}

export async function deleteFamilyMemberDB(memberId) {
  if (!isSupabaseEnabled) return;
  await supabase.from("family_members").delete().eq("id", memberId);
}

// ─── MEDICINES ───────────────────────────────────────────────────────────────

export async function addMedicineDB(patientId, med) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("medicines").insert({
      id: med.id,
      patient_id: patientId,
      name: med.name,
      dosage: med.dosage || "",
      time: med.time || "",
      instructions: med.instructions || "",
      taken: false,
    });
  } catch (err) {
    console.error("addMedicineDB error:", err);
  }
}

export async function toggleMedicineDB(medId, taken) {
  if (!isSupabaseEnabled) return;
  await supabase.from("medicines").update({ taken }).eq("id", medId);
}

export async function deleteMedicineDB(medId) {
  if (!isSupabaseEnabled) return;
  await supabase.from("medicines").delete().eq("id", medId);
}

// ─── TODOS ───────────────────────────────────────────────────────────────────

export async function addTodoDB(patientId, todo) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("todos").insert({
      id: todo.id,
      patient_id: patientId,
      title: todo.title,
      time: todo.time || "",
      recurrence: todo.recurrence || "",
      completed: false,
      active: todo.active !== false,
      is_med: todo.isMed || false,
      is_exercise: todo.isExercise || false,
    });
  } catch (err) {
    console.error("addTodoDB error:", err);
  }
}

export async function updateTodoDB(todoId, fields) {
  if (!isSupabaseEnabled) return;
  const mapped = {};
  if (fields.title !== undefined) mapped.title = fields.title;
  if (fields.time !== undefined) mapped.time = fields.time;
  if (fields.recurrence !== undefined) mapped.recurrence = fields.recurrence;
  if (fields.completed !== undefined) mapped.completed = fields.completed;
  if (fields.active !== undefined) mapped.active = fields.active;
  await supabase.from("todos").update(mapped).eq("id", todoId);
}

export async function deleteTodoDB(todoId) {
  if (!isSupabaseEnabled) return;
  await supabase.from("todos").delete().eq("id", todoId);
}

// ─── MEMORIES ────────────────────────────────────────────────────────────────

export async function addMemoryDB(patientId, memory) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("memories").insert({
      id: memory.id,
      patient_id: patientId,
      title: memory.title,
      date: memory.date || "",
      description: memory.description || "",
      photo_url: memory.photo || "",
      tags: memory.tags || [],
    });
  } catch (err) {
    console.error("addMemoryDB error:", err);
  }
}

export async function deleteMemoryDB(memoryId) {
  if (!isSupabaseEnabled) return;
  await supabase.from("memories").delete().eq("id", memoryId);
}

// ─── ALERTS ──────────────────────────────────────────────────────────────────

export async function addAlertDB(patientId, alert) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("alerts").insert({
      id: alert.id,
      patient_id: patientId,
      type: alert.type || "warning",
      title: alert.title,
      message: alert.message || "",
      resolved: alert.resolved || false,
    });
  } catch (err) {
    console.error("addAlertDB error:", err);
  }
}

export async function resolveAlertDB(alertId) {
  if (!isSupabaseEnabled) return;
  await supabase.from("alerts").update({ resolved: true }).eq("id", alertId);
}

// ─── COGNITIVE SESSIONS ──────────────────────────────────────────────────────

export async function addCognitiveSessionDB(patientId, session) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase.from("cognitive_sessions").insert({
      id: session.id,
      patient_id: patientId,
      game_name: session.gameName,
      game_id: session.gameId,
      accuracy: session.accuracy,
      time_taken: session.timeTaken,
      difficulty: session.difficulty,
      category: session.category,
    });
  } catch (err) {
    console.error("addCognitiveSessionDB error:", err);
  }
}

// ─── REAL-TIME SUBSCRIPTION ──────────────────────────────────────────────────

export function subscribeToPatient(patientId, onUpdate) {
  if (!isSupabaseEnabled) return () => {};

  const tables = ["patients", "family_members", "medicines", "todos", "memories", "alerts", "cognitive_sessions"];

  const channels = tables.map(table =>
    supabase
      .channel(`${table}:${patientId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table,
        filter: `patient_id=eq.${patientId}`,
      }, onUpdate)
      .subscribe()
  );

  // Cleanup function
  return () => channels.forEach(ch => supabase.removeChannel(ch));
}

// ─── MULTI-PATIENT CAREGIVER MANAGEMENT ──────────────────────────────────────

/**
 * Loads all assigned patients for a caregiver with real cognitive scores,
 * recent activity, alerts, and attention status.
 */
export async function loadCaregiverPatients(caregiverId) {
  if (!isSupabaseEnabled || !caregiverId) return null;
  try {
    // 1. Fetch assigned patient IDs from caregiver_patients
    const { data: links, error: linkErr } = await supabase
      .from("caregiver_patients")
      .select("patient_id, created_at")
      .eq("caregiver_id", caregiverId)
      .order("created_at", { ascending: false });

    if (linkErr) {
      console.error("loadCaregiverPatients link error:", linkErr);
      return null;
    }
    if (!links || links.length === 0) {
      return [];
    }

    const patientIds = links.map(l => l.patient_id).filter(Boolean);
    if (patientIds.length === 0) return [];

    // 2. Fetch profiles, cognitive sessions, alerts, and medicines for all assigned patients in parallel
    const [
      { data: patientRows, error: pErr },
      { data: sessionRows },
      { data: alertRows },
      { data: medicineRows },
    ] = await Promise.all([
      supabase.from("patients").select("*").in("id", patientIds),
      supabase.from("cognitive_sessions").select("*").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(200),
      supabase.from("alerts").select("*").in("patient_id", patientIds).eq("resolved", false),
      supabase.from("medicines").select("*").in("patient_id", patientIds),
    ]);

    if (pErr) {
      console.error("loadCaregiverPatients patients fetch error:", pErr);
      return null;
    }

    // Map grouped data by patient_id
    const sessionsByPatient = {};
    (sessionRows || []).forEach(s => {
      if (!sessionsByPatient[s.patient_id]) sessionsByPatient[s.patient_id] = [];
      sessionsByPatient[s.patient_id].push(s);
    });

    const alertsByPatient = {};
    (alertRows || []).forEach(a => {
      if (!alertsByPatient[a.patient_id]) alertsByPatient[a.patient_id] = [];
      alertsByPatient[a.patient_id].push(a);
    });

    const medicinesByPatient = {};
    (medicineRows || []).forEach(m => {
      if (!medicinesByPatient[m.patient_id]) medicinesByPatient[m.patient_id] = [];
      medicinesByPatient[m.patient_id].push(m);
    });

    const todayDateString = new Date().toDateString();

    return (patientRows || []).map(p => {
      const pSessions = sessionsByPatient[p.id] || [];
      const pAlerts = alertsByPatient[p.id] || [];
      const pMeds = medicinesByPatient[p.id] || [];
      const cognitiveStats = buildCognitiveStats(pSessions, p);

      // Format recent sessions for display
      const latestSession = pSessions[0] || null;
      let recentActivity = "No exercise yet";
      let todayGamesCount = 0;

      if (latestSession) {
        const sessionDate = new Date(latestSession.created_at);
        if (sessionDate.toDateString() === todayDateString) {
          recentActivity = `Played today at ${sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        } else {
          recentActivity = sessionDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        }
      }

      // Count games played today
      todayGamesCount = pSessions.filter(s => {
        if (!s.created_at) return false;
        return new Date(s.created_at).toDateString() === todayDateString;
      }).length;

      const patientSummary = {
        id: p.id,
        patientId: p.id,
        fullName: p.full_name || "Unnamed Patient",
        preferredName: p.preferred_name || p.full_name || "Patient",
        age: p.age ? Number(p.age) || p.age : "N/A",
        gender: p.gender || "Female",
        language: p.language || "English",
        avatar: p.avatar_url || "",
        profile: {
          fullName: p.full_name || "Unnamed Patient",
          preferredName: p.preferred_name || p.full_name || "Patient",
          age: p.age || "",
          gender: p.gender || "Female",
          language: p.language || "English",
          avatar: p.avatar_url || "",
          phone: p.phone || "",
        },
        homeLocation: {
          address: p.home_address || "",
          city: p.home_city || "",
          safeZoneRadius: p.safe_zone_radius || 500,
        },
        cognitiveStats,
        latestGameName: latestSession ? latestSession.game_name : null,
        latestGameAccuracy: latestSession ? latestSession.accuracy : null,
        recentActivity,
        todayGamesCount,
        unresolvedAlertsCount: pAlerts.length,
        medicinesCount: pMeds.length,
        medicinesTakenCount: pMeds.filter(m => m.taken).length,
        alerts: pAlerts,
        medicines: pMeds,
        brainExercise: {
          dailyCompleted: p.daily_exercise_done || todayGamesCount > 0,
        },
      };

      // Calculate status from real data
      patientSummary.status = calculatePatientStatus(patientSummary);
      return patientSummary;
    });
  } catch (err) {
    console.error("loadCaregiverPatients exception:", err);
    return null;
  }
}

/**
 * Verifies if a caregiver has authorized access to a specific patient.
 * Prevents unauthorized access via direct URL manipulation.
 */
export async function verifyCaregiverPatientAccess(caregiverId, patientId) {
  if (!isSupabaseEnabled || !caregiverId || !patientId) return true;
  try {
    const { data, error } = await supabase
      .from("caregiver_patients")
      .select("id")
      .eq("caregiver_id", caregiverId)
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Links an existing patient to the caregiver in caregiver_patients.
 */
export async function linkPatientToCaregiverDB(caregiverId, patientId) {
  if (!isSupabaseEnabled) return { success: true };
  try {
    // First verify that the patient actually exists in the database
    const { data: patient, error: pErr } = await supabase
      .from("patients")
      .select("id, full_name, preferred_name")
      .eq("id", patientId)
      .maybeSingle();

    if (pErr || !patient) {
      return { success: false, error: `No registered patient found with ID "${patientId}".` };
    }

    const linkId = "cgp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const { error } = await supabase
      .from("caregiver_patients")
      .upsert(
        {
          id: linkId,
          caregiver_id: caregiverId,
          patient_id: patientId,
        },
        { onConflict: "caregiver_id,patient_id" }
      );

    if (error) throw error;
    return { success: true, patient };
  } catch (err) {
    console.error("linkPatientToCaregiverDB error:", err);
    return { success: false, error: err.message || "Failed to link patient" };
  }
}

/**
 * Unlinks a patient from the caregiver.
 */
export async function unlinkPatientFromCaregiverDB(caregiverId, patientId) {
  if (!isSupabaseEnabled) return true;
  try {
    await supabase
      .from("caregiver_patients")
      .delete()
      .eq("caregiver_id", caregiverId)
      .eq("patient_id", patientId);
    return true;
  } catch (err) {
    console.error("unlinkPatientFromCaregiverDB error:", err);
    return false;
  }
}

/**
 * Creates a new patient in the database and links them to the caregiver.
 */
export async function createAndLinkPatientDB(caregiverId, patientFields) {
  const newPid = "pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  if (!isSupabaseEnabled) return { success: true, patientId: newPid };

  try {
    const { error: pErr } = await supabase.from("patients").insert({
      id: newPid,
      full_name: patientFields.fullName,
      preferred_name: patientFields.preferredName || patientFields.fullName,
      age: String(patientFields.age || ""),
      gender: patientFields.gender || "Female",
      email: patientFields.email || "",
      phone: patientFields.phone || "",
      language: patientFields.language || "English",
      avatar_url: patientFields.avatar || "",
      difficulty_level: 1,
    });
    if (pErr) throw pErr;

    const linkId = "cgp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const { error: lErr } = await supabase.from("caregiver_patients").insert({
      id: linkId,
      caregiver_id: caregiverId,
      patient_id: newPid,
    });
    if (lErr) throw lErr;

    return { success: true, patientId: newPid };
  } catch (err) {
    console.error("createAndLinkPatientDB error:", err);
    return { success: false, error: err.message || "Failed to create patient" };
  }
}

/**
 * Subscribes to changes in caregiver_patients for real-time multi-patient updates
 */
export function subscribeToCaregiverPatients(caregiverId, onUpdate) {
  if (!isSupabaseEnabled || !caregiverId) return () => {};

  const channel = supabase
    .channel(`caregiver_patients:${caregiverId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "caregiver_patients",
        filter: `caregiver_id=eq.${caregiverId}`,
      },
      onUpdate
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}



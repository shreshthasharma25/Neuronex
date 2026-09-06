/**
 * supabaseService.js
 * Handles all Supabase read/write operations for NeuroNex.
 * All functions degrade gracefully to localStorage when Supabase is not configured.
 */
import { supabase, isSupabaseEnabled } from "./supabaseClient";

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
  const history = sessions.map(s => ({
    id: s.id,
    gameName: s.game_name,
    date: new Date(s.created_at).toLocaleDateString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
    accuracy: s.accuracy,
    time: s.time_taken,
    difficulty: s.difficulty || "Level 1",
  }));

  const total = history.length;
  const avgAccuracy = total > 0
    ? Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / total)
    : 0;

  const categoryScores = { memory: 0, attention: 0, recall: 0, sequencing: 0 };
  const categoryCounts = { memory: 0, attention: 0, recall: 0, sequencing: 0 };
  sessions.forEach(s => {
    const cat = (s.category || "memory").toLowerCase();
    if (categoryScores[cat] !== undefined) {
      categoryScores[cat] += s.accuracy;
      categoryCounts[cat]++;
    }
  });
  Object.keys(categoryScores).forEach(k => {
    categoryScores[k] = categoryCounts[k] > 0
      ? Math.round(categoryScores[k] / categoryCounts[k])
      : 0;
  });

  return {
    currentLevel: profile.difficulty_level || 1,
    consecutiveHighScores: profile.consecutive_high_scores || 0,
    gamesCompleted: total,
    averageAccuracy: avgAccuracy,
    averageResponseSecs: 0,
    daysCompletedThisWeek: 0,
    categories: categoryScores,
    weeklyTrends: [],
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

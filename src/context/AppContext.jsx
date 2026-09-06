import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { defaultPatientData } from "../data/defaultData";
import { emptyPatientData } from "../data/emptyData";
import { sounds } from "../utils/soundPlayer";
import { evaluateAdaptiveDifficulty } from "../utils/adaptiveEngine";
import { isSupabaseEnabled, supabase } from "../services/supabaseClient";
import {
  loadPatientData,
  upsertPatient,
  addFamilyMemberDB, deleteFamilyMemberDB,
  addMedicineDB, toggleMedicineDB, deleteMedicineDB,
  addTodoDB, updateTodoDB, deleteTodoDB,
  addMemoryDB, deleteMemoryDB,
  addAlertDB, resolveAlertDB,
  addCognitiveSessionDB,
  subscribeToPatient,
} from "../services/supabaseService";

import {
  translate,
  formatRelation,
  normalizeLangCode,
  SUPPORTED_LANGUAGES
} from "../i18n";

const AppContext = createContext(null);

const STORAGE_KEY = "neuronex_data_v2";
const ROLE_KEY = "neuronex_role_v2";
const ONBOARDING_KEY = "neuronex_onboarding_v2";
const PATIENT_ID_KEY = "neuronex_patient_id";
const CURRENT_USER_KEY = "neuronex_current_user";
const DEMO_MODE_KEY = "neuronex_is_demo";
const LANGUAGE_KEY = "neuronex_language";

// Stable patient ID for this device (used as Supabase row key)
function getOrCreatePatientId() {
  try {
    let id = localStorage.getItem(PATIENT_ID_KEY);
    if (!id) {
      id = "pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
      localStorage.setItem(PATIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "pat-local";
  }
}

export function AppProvider({ children }) {
  const [patientId, setPatientIdState] = useState(() => {
    try {
      return localStorage.getItem(PATIENT_ID_KEY) || getOrCreatePatientId();
    } catch {
      return "pat-local";
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem(DEMO_MODE_KEY) === "true";
    } catch { return false; }
  });

  const [supabaseLoaded, setSupabaseLoaded] = useState(false);

  // ── Onboarding ───────────────────────────────────────────────────────────
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // ── Role ─────────────────────────────────────────────────────────────────
  const [userRole, setUserRole] = useState(() => {
    try { return localStorage.getItem(ROLE_KEY) || "patient"; }
    catch { return "patient"; }
  });

  // ── Language / i18n State (Persisted across sessions and navigation) ──────
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved) return normalizeLangCode(saved);
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed?.profile?.language) return normalizeLangCode(parsed.profile.language);
      }
      return 'en';
    } catch {
      return 'en';
    }
  });

  // ── Patient Data (localStorage-first, then Supabase overlay) ─────────────
  const [patientData, setPatientData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : emptyPatientData;
    } catch { return emptyPatientData; }
  });

  const setLanguage = useCallback((newLang) => {
    const code = normalizeLangCode(newLang);
    setLanguageState(code);
    try { localStorage.setItem(LANGUAGE_KEY, code); } catch {}
    const langNames = { en: 'English', hi: 'Hindi', bn: 'Bengali', as: 'Assamese', ta: 'Tamil' };
    const langName = langNames[code] || 'English';
    setPatientData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        language: langName
      }
    }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch {}
  }, [language]);

  const t = useCallback((key, params) => {
    return translate(language, key, params);
  }, [language]);

  const localizeRelation = useCallback((rel) => {
    return formatRelation(rel, language);
  }, [language]);

  // ── Nav / UI State ────────────────────────────────────────────────────────
  const [gameSessionCycle, setGameSessionCycle] = useState(1);
  const [activeTab, setActiveTab]             = useState("home");
  const [familyTab, setFamilyTab]             = useState("overview"); // 'overview' | 'family' | 'memories' | 'places' | 'personal-info' | 'games' | 'alerts'
  const [caregiverTab, setCaregiverTab]       = useState("overview"); // 'overview' | 'medicines' | 'reminders' | 'routine' | 'safety' | 'monitoring' | 'alerts'
  const [activeModal, setActiveModal]         = useState(null);
  const [activeGame, setActiveGame]           = useState(null);
  const [gameResult, setGameResult]           = useState(null);
  const [viewMode, setViewMode]               = useState("mobile-frame");
  const [syncStatus, setSyncStatus]           = useState(isSupabaseEnabled ? "syncing" : "local"); // "local" | "syncing" | "synced" | "error"

  // Session-level one-time greeting flag
  const [hasSpokenGreeting, setHasSpokenGreetingState] = useState(() => {
    try {
      return sessionStorage.getItem('neuronex_spoken_welcome') === 'true';
    } catch {
      return false;
    }
  });

  const markGreetingSpoken = useCallback(() => {
    try {
      sessionStorage.setItem('neuronex_spoken_welcome', 'true');
    } catch {}
    setHasSpokenGreetingState(true);
  }, []);

  // ── Load from Supabase on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    setSyncStatus("syncing");
    loadPatientData(patientId).then(data => {
      if (data) {
        setPatientData(data);
        setIsOnboarded(data.profile.registered);
        setSyncStatus("synced");
      } else {
        setSyncStatus("local");
      }
      setSupabaseLoaded(true);
    }).catch(() => {
      setSyncStatus("error");
      setSupabaseLoaded(true);
    });
  }, [patientId]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    const unsubscribe = subscribeToPatient(patientId, () => {
      // Re-fetch full data on any remote change
      loadPatientData(patientId).then(data => {
        if (data) setPatientData(data);
      });
    });
    return unsubscribe;
  }, [patientId]);

  // ── Sync localStorage ─────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(patientData)); }
    catch (e) { console.warn("localStorage write failed", e); }
  }, [patientData]);

  useEffect(() => {
    try { localStorage.setItem(ROLE_KEY, userRole); } catch {}
  }, [userRole]);

  useEffect(() => {
    try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify(isOnboarded)); } catch {}
  }, [isOnboarded]);

  useEffect(() => {
    try { localStorage.setItem(PATIENT_ID_KEY, patientId); } catch {}
  }, [patientId]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode)); } catch {}
  }, [isDemoMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Profile ───────────────────────────────────────────────────────────────
  const updateProfile = useCallback((profileFields) => {
    setPatientData(prev => {
      const updated = { ...prev, profile: { ...prev.profile, ...profileFields } };
      // Sync to Supabase asynchronously
      upsertPatient(patientId, updated.profile, updated.homeLocation,
        updated.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        updated.cognitiveStats?.currentLevel);
      return updated;
    });
  }, [patientId]);

  const updateHomeLocation = useCallback((homeFields) => {
    setPatientData(prev => {
      const updated = { ...prev, homeLocation: { ...prev.homeLocation, ...homeFields } };
      upsertPatient(patientId, updated.profile, updated.homeLocation,
        updated.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        updated.cognitiveStats?.currentLevel);
      return updated;
    });
  }, [patientId]);

  // ── Family ────────────────────────────────────────────────────────────────
  const addFamilyMember = useCallback((member) => {
    const newMember = { id: "fam-" + Date.now(), ...member };
    setPatientData(prev => ({ ...prev, family: [...prev.family, newMember] }));
    addFamilyMemberDB(patientId, newMember);
    sounds.playSuccess();
  }, [patientId]);

  const updateFamilyMember = useCallback((id, fields) => {
    setPatientData(prev => ({
      ...prev,
      family: prev.family.map(f => f.id === id ? { ...f, ...fields } : f)
    }));
    sounds.playSuccess();
  }, []);

  const deleteFamilyMember = useCallback((id) => {
    setPatientData(prev => ({ ...prev, family: prev.family.filter(f => f.id !== id) }));
    deleteFamilyMemberDB(id);
  }, []);

  // ── Places ────────────────────────────────────────────────────────────────
  const addPlace = useCallback((place) => {
    setPatientData(prev => ({ ...prev, places: [...prev.places, { id: "pl-" + Date.now(), ...place }] }));
    sounds.playSuccess();
  }, []);

  const updatePlace = useCallback((id, fields) => {
    setPatientData(prev => ({
      ...prev,
      places: prev.places.map(p => p.id === id ? { ...p, ...fields } : p)
    }));
    sounds.playSuccess();
  }, []);

  const deletePlace = useCallback((id) => {
    setPatientData(prev => ({ ...prev, places: prev.places.filter(p => p.id !== id) }));
  }, []);

  // ── Memories ──────────────────────────────────────────────────────────────
  const addMemory = useCallback((memory) => {
    const newMemory = { id: "mem-" + Date.now(), ...memory };
    setPatientData(prev => ({ ...prev, memories: [...prev.memories, newMemory] }));
    addMemoryDB(patientId, newMemory);
    sounds.playSuccess();
  }, [patientId]);

  const updateMemory = useCallback((id, fields) => {
    setPatientData(prev => ({
      ...prev,
      memories: prev.memories.map(m => m.id === id ? { ...m, ...fields } : m)
    }));
    sounds.playSuccess();
  }, []);

  const deleteMemory = useCallback((id) => {
    setPatientData(prev => ({ ...prev, memories: prev.memories.filter(m => m.id !== id) }));
    deleteMemoryDB(id);
  }, []);

  // ── Personal Info ─────────────────────────────────────────────────────────
  const updatePersonalInfo = useCallback((fields) => {
    setPatientData(prev => ({
      ...prev,
      personalInfo: { ...(prev.personalInfo || {}), ...fields }
    }));
    sounds.playSuccess();
  }, []);

  // ── Medicines ─────────────────────────────────────────────────────────────
  const addMedicine = useCallback((med) => {
    const newMedId = "med-" + Date.now();
    const newMed = { id: newMedId, taken: false, active: true, ...med };
    const todoFromMed = { id: "todo-" + newMedId, title: med.name, time: med.time, recurrence: med.frequency || "Daily", completed: false, isMed: true, active: true };
    setPatientData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMed],
      todos: [...prev.todos, todoFromMed],
    }));
    addMedicineDB(patientId, newMed);
    addTodoDB(patientId, todoFromMed);
    sounds.playSuccess();
  }, [patientId]);

  const updateMedicine = useCallback((id, fields) => {
    setPatientData(prev => {
      const updatedMeds = prev.medicines.map(m => m.id === id ? { ...m, ...fields } : m);
      const updatedTodos = prev.todos.map(t => {
        if (t.id === "todo-" + id) {
          return {
            ...t,
            title: fields.name || t.title,
            time: fields.time || t.time,
            recurrence: fields.frequency || t.recurrence,
            active: fields.active !== undefined ? fields.active : t.active
          };
        }
        return t;
      });
      return { ...prev, medicines: updatedMeds, todos: updatedTodos };
    });
    sounds.playSuccess();
  }, []);

  const toggleMedicine = useCallback((id) => {
    let takenState = false;
    setPatientData(prev => {
      const updatedMeds = prev.medicines.map(m => {
        if (m.id === id) { takenState = !m.taken; return { ...m, taken: takenState }; }
        return m;
      });
      const updatedTodos = prev.todos.map(t =>
        (t.id === "todo-" + id || t.title.toLowerCase() === prev.medicines.find(m => m.id === id)?.name?.toLowerCase())
          ? { ...t, completed: takenState } : t
      );
      toggleMedicineDB(id, takenState);
      return { ...prev, medicines: updatedMeds, todos: updatedTodos };
    });
    sounds.playSuccess();
  }, []);

  const deleteMedicine = useCallback((id) => {
    setPatientData(prev => ({
      ...prev,
      medicines: prev.medicines.filter(m => m.id !== id),
      todos: prev.todos.filter(t => t.id !== "todo-" + id),
    }));
    deleteMedicineDB(id);
  }, []);

  // ── Reminders ─────────────────────────────────────────────────────────────
  const addReminder = useCallback((reminder) => {
    const newRem = { id: "rem-" + Date.now(), active: true, ...reminder };
    setPatientData(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), newRem]
    }));
    sounds.playSuccess();
  }, []);

  const updateReminder = useCallback((id, fields) => {
    setPatientData(prev => ({
      ...prev,
      reminders: (prev.reminders || []).map(r => r.id === id ? { ...r, ...fields } : r)
    }));
    sounds.playSuccess();
  }, []);

  const toggleReminder = useCallback((id) => {
    setPatientData(prev => ({
      ...prev,
      reminders: (prev.reminders || []).map(r => r.id === id ? { ...r, active: !r.active } : r)
    }));
    sounds.playGentleTap();
  }, []);

  const deleteReminder = useCallback((id) => {
    setPatientData(prev => ({
      ...prev,
      reminders: (prev.reminders || []).filter(r => r.id !== id)
    }));
  }, []);

  // ── Daily Routine ─────────────────────────────────────────────────────────
  const addRoutineStep = useCallback((step) => {
    const newStep = { id: "r-" + Date.now(), step: ((patientData.routine || []).length + 1), ...step };
    setPatientData(prev => ({
      ...prev,
      routine: [...(prev.routine || []), newStep]
    }));
    sounds.playSuccess();
  }, [patientData.routine]);

  const updateRoutineStep = useCallback((id, fields) => {
    setPatientData(prev => ({
      ...prev,
      routine: (prev.routine || []).map(r => r.id === id ? { ...r, ...fields } : r)
    }));
    sounds.playSuccess();
  }, []);

  const deleteRoutineStep = useCallback((id) => {
    setPatientData(prev => ({
      ...prev,
      routine: (prev.routine || []).filter(r => r.id !== id)
    }));
  }, []);

  // ── Shared Safety Alert Trigger ───────────────────────────────────────────
  const triggerSafetyAlert = useCallback(({ title, message, severity = "WARNING", recipients = ["caregiver", "family"] }) => {
    const newAlert = {
      id: "alt-" + Date.now(),
      type: severity === "URGENT" || severity === "WARNING" ? "warning" : "info",
      severity, // "INFO" | "UPCOMING" | "WARNING" | "URGENT"
      title,
      message,
      time: "Just now",
      resolved: false,
      recipients
    };
    sounds.playReminderChime();
    setPatientData(prev => ({
      ...prev,
      alerts: [newAlert, ...prev.alerts]
    }));
    addAlertDB(patientId, newAlert);
  }, [patientId]);

  // ── Todos ─────────────────────────────────────────────────────────────────
  const addTodo = useCallback((todo) => {
    const newTodo = { id: "todo-" + Date.now(), completed: false, ...todo };
    setPatientData(prev => ({ ...prev, todos: [...prev.todos, newTodo] }));
    addTodoDB(patientId, newTodo);
    sounds.playSuccess();
  }, [patientId]);

  const toggleTodo = useCallback((id) => {
    setPatientData(prev => {
      let isCompleted = false;
      const updatedTodos = prev.todos.map(t => {
        if (t.id === id) { isCompleted = !t.completed; return { ...t, completed: isCompleted }; }
        return t;
      });
      const targetTodo = prev.todos.find(t => t.id === id);
      const updatedBrainExercise = targetTodo?.isExercise
        ? { ...prev.brainExercise, dailyCompleted: isCompleted }
        : prev.brainExercise;
      updateTodoDB(id, { completed: isCompleted });
      return { ...prev, todos: updatedTodos, brainExercise: updatedBrainExercise };
    });
    sounds.playSuccess();
  }, []);

  const updateTodo = useCallback((id, updatedFields) => {
    setPatientData(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, ...updatedFields } : t),
    }));
    updateTodoDB(id, updatedFields);
    sounds.playSuccess();
  }, []);

  const deleteTodo = useCallback((id) => {
    setPatientData(prev => ({ ...prev, todos: prev.todos.filter(t => t.id !== id) }));
    deleteTodoDB(id);
  }, []);

  // ── Doctor ────────────────────────────────────────────────────────────────
  const updateDoctor = useCallback((doctorInfo) => {
    setPatientData(prev => {
      const filtered = prev.importantInfo.filter(i => !i.label.toLowerCase().includes("doctor"));
      const updated = {
        ...prev,
        importantInfo: [...filtered, { id: "info-doc", label: "Doctor", value: `${doctorInfo.name} - ${doctorInfo.phone}` }],
      };
      upsertPatient(patientId, updated.profile, updated.homeLocation, doctorInfo, updated.cognitiveStats?.currentLevel);
      return updated;
    });
    sounds.playSuccess();
  }, [patientId]);

  // ── Alerts ────────────────────────────────────────────────────────────────
  const addAlert = useCallback((alert) => {
    setPatientData(prev => ({ ...prev, alerts: [alert, ...prev.alerts] }));
    addAlertDB(patientId, alert);
  }, [patientId]);

  const resolveAlert = useCallback((alertId) => {
    setPatientData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a),
    }));
    resolveAlertDB(alertId);
  }, []);

  // ── Game Completion ───────────────────────────────────────────────────────
  const recordGameCompletion = useCallback(({
    gameId,
    gameName,
    accuracy = 100,
    timeTaken = "1 min 30 sec",
    category = "memory",
    correctAnswers = 1,
    incorrectAnswers = 0,
    responseTime = 6
  }) => {
    const existingHistory = patientData.cognitiveStats?.history || [];
    const currentCatLevels = patientData.cognitiveStats?.categoryLevels || {
      memory: 1, recall: 1, attention: 1, sequencing: 1
    };
    const catKey = (category || "memory").toLowerCase();
    const currentLevel = currentCatLevels[catKey] || patientData.cognitiveStats?.currentLevel || 1;

    // Full detailed performance record per attempt
    const sessionRecord = {
      id: "h-" + Date.now(),
      gameId,
      gameName,
      category: catKey,
      difficultyLevel: currentLevel,
      difficulty: `Level ${currentLevel}`,
      score: accuracy,
      accuracy,
      correctAnswers,
      incorrectAnswers,
      responseTime: typeof responseTime === 'number' ? responseTime : 6,
      timeTaken,
      completionStatus: 'completed',
      timestamp: new Date().toISOString(),
      date: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Calculate adaptive difficulty progression using rolling window of recent history
    const simulatedHistory = [sessionRecord, ...existingHistory];
    const { newLevel, levelNotice } = evaluateAdaptiveDifficulty(simulatedHistory, currentLevel, catKey);

    setPatientData(prev => {
      const prevStats = prev.cognitiveStats || {};
      const prevCount = prevStats.gamesCompleted || 0;
      const prevAvg   = prevStats.averageAccuracy || 0;
      const newGamesCompleted = prevCount + 1;
      const newAvgAcc = prevCount === 0 ? accuracy : Math.round((prevAvg * prevCount + accuracy) / newGamesCompleted);

      const prevAvgResp = prevStats.averageResponseSecs || 6;
      const newAvgResp = Number(((prevAvgResp * prevCount + sessionRecord.responseTime) / newGamesCompleted).toFixed(1));

      const currentCatVal = prevStats.categories?.[catKey] || 0;
      const newCatVal = Math.min(100, Math.round((currentCatVal + accuracy) / 2));

      const updatedCategoryLevels = {
        ...(prevStats.categoryLevels || { memory: 1, recall: 1, attention: 1, sequencing: 1 }),
        [catKey]: newLevel
      };

      const newAlert = {
        id: "alt-" + Date.now(),
        type: "success",
        title: "Brain Exercise Completed",
        message: `${prev.profile.preferredName || "Patient"} completed ${gameName} at Level ${newLevel} with ${accuracy}% accuracy.`,
        time: "Just now",
        resolved: true,
      };

      addCognitiveSessionDB(patientId, sessionRecord);
      addAlertDB(patientId, newAlert);
      upsertPatient(patientId, prev.profile, prev.homeLocation,
        prev.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        newLevel);

      return {
        ...prev,
        brainExercise: { ...prev.brainExercise, dailyCompleted: true },
        todos: prev.todos.map(t =>
          t.isExercise || t.title.toLowerCase().includes("brain exercise")
            ? { ...t, completed: true } : t
        ),
        cognitiveStats: {
          ...prevStats,
          currentLevel: newLevel,
          categoryLevels: updatedCategoryLevels,
          gamesCompleted: newGamesCompleted,
          averageAccuracy: newAvgAcc,
          averageResponseSecs: newAvgResp,
          categories: { ...(prevStats.categories || {}), [catKey]: newCatVal },
          history: [sessionRecord, ...(prevStats.history || [])],
        },
        alerts: [newAlert, ...prev.alerts],
      };
    });

    sounds.playSuccess();
    return { newLevel, levelNotice };
  }, [patientData.cognitiveStats, patientId]);

  // ── Difficulty ────────────────────────────────────────────────────────────
  const setDifficultyLevel = useCallback((targetLevel) => {
    const validLevel = Math.max(1, Math.min(3, Number(targetLevel) || 1));
    setPatientData(prev => {
      upsertPatient(patientId, prev.profile, prev.homeLocation,
        prev.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        validLevel);
      return { ...prev, cognitiveStats: { ...prev.cognitiveStats, currentLevel: validLevel } };
    });
    sounds.playSuccess();
  }, [patientId]);

  // ── Role-based Registration & Multi-User Linking ────────────────────────
  const registerPatientAsSelf = useCallback((patientFields) => {
    const pid = patientId || ("pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6));
    const user = {
      role: "patient",
      name: patientFields.preferredName || patientFields.fullName || "Patient",
      relationOrTitle: "Self",
      phone: patientFields.phone || ""
    };
    setPatientIdState(pid);
    setCurrentUser(user);
    setUserRole("patient");
    setIsDemoMode(false);
    setPatientData(prev => {
      const updated = {
        ...prev,
        patientId: pid,
        profile: {
          ...prev.profile,
          ...patientFields,
          registered: true,
          patientId: pid
        }
      };
      upsertPatient(pid, updated.profile, updated.homeLocation,
        updated.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        updated.cognitiveStats?.currentLevel);
      return updated;
    });
    setIsOnboarded(true);
    sounds.playSuccess();
  }, [patientId]);

  const registerPatientAsFamily = useCallback(({ patientFields, familyMemberInfo, targetPatientId }) => {
    const pid = targetPatientId || patientId || ("pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6));
    const user = {
      role: "family",
      name: familyMemberInfo.name || "Family Member",
      relationOrTitle: familyMemberInfo.relation || "Family",
      phone: familyMemberInfo.phone || ""
    };
    const newLinkedFamily = {
      id: "fam-link-" + Date.now(),
      name: user.name,
      relation: user.relationOrTitle,
      phone: user.phone,
      linkedAt: new Date().toISOString()
    };
    setPatientIdState(pid);
    setCurrentUser(user);
    setUserRole("family");
    setIsDemoMode(false);
    setPatientData(prev => {
      const updatedProfile = patientFields
        ? { ...prev.profile, ...patientFields, registered: true, patientId: pid }
        : { ...prev.profile, registered: true, patientId: pid };

      const alreadyInList = prev.family.some(f => f.name.toLowerCase() === user.name.toLowerCase());
      const updatedFamilyList = alreadyInList ? prev.family : [
        ...prev.family,
        {
          id: "fam-" + Date.now(),
          name: user.name,
          relation: user.relationOrTitle,
          phone: user.phone,
          photo: ""
        }
      ];

      const updated = {
        ...prev,
        patientId: pid,
        profile: updatedProfile,
        family: updatedFamilyList,
        linkedFamilyMembers: [...(prev.linkedFamilyMembers || []), newLinkedFamily]
      };
      upsertPatient(pid, updated.profile, updated.homeLocation,
        updated.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        updated.cognitiveStats?.currentLevel);
      return updated;
    });
    setIsOnboarded(true);
    sounds.playSuccess();
  }, [patientId]);

  const registerPatientAsCaregiver = useCallback(({ patientFields, caregiverInfo, targetPatientId }) => {
    const pid = targetPatientId || patientId || ("pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6));
    const user = {
      role: "caregiver",
      name: caregiverInfo.name || "Caregiver",
      relationOrTitle: caregiverInfo.title || "Primary Caregiver",
      phone: caregiverInfo.phone || ""
    };
    const newLinkedCaregiver = {
      id: "cg-link-" + Date.now(),
      name: user.name,
      title: user.relationOrTitle,
      phone: user.phone,
      linkedAt: new Date().toISOString()
    };
    setPatientIdState(pid);
    setCurrentUser(user);
    setUserRole("caregiver");
    setIsDemoMode(false);
    setPatientData(prev => {
      const updatedProfile = patientFields
        ? { ...prev.profile, ...patientFields, registered: true, patientId: pid }
        : { ...prev.profile, registered: true, patientId: pid };

      const updated = {
        ...prev,
        patientId: pid,
        profile: updatedProfile,
        linkedCaregivers: [...(prev.linkedCaregivers || []), newLinkedCaregiver]
      };
      upsertPatient(pid, updated.profile, updated.homeLocation,
        updated.importantInfo?.find(i => i.label.toLowerCase().includes("doctor")),
        updated.cognitiveStats?.currentLevel);
      return updated;
    });
    setIsOnboarded(true);
    sounds.playSuccess();
  }, [patientId]);

  const connectExistingPatient = useCallback(async ({ targetPatientId, role, userInfo }) => {
    if (!targetPatientId) return false;
    const cleanId = targetPatientId.trim();
    setPatientIdState(cleanId);
    const user = {
      role: role || "patient",
      name: userInfo?.name || (role === "caregiver" ? "Caregiver" : role === "family" ? "Family Member" : "Patient"),
      relationOrTitle: userInfo?.relationOrTitle || (role === "caregiver" ? "Caregiver" : role === "family" ? "Relative" : "Self"),
      phone: userInfo?.phone || ""
    };
    setCurrentUser(user);
    setUserRole(role || "patient");
    setIsDemoMode(false);

    if (isSupabaseEnabled) {
      setSyncStatus("syncing");
      try {
        const data = await loadPatientData(cleanId);
        if (data) {
          setPatientData(data);
          setIsOnboarded(true);
          setSyncStatus("synced");
          sounds.playSuccess();
          return true;
        }
      } catch (err) {
        console.warn("Error connecting to Supabase patient:", err);
      }
    }

    setPatientData(prev => ({
      ...prev,
      patientId: cleanId,
      profile: { ...prev.profile, patientId: cleanId, registered: true }
    }));
    setIsOnboarded(true);
    sounds.playSuccess();
    return true;
  }, []);

  const logoutOrSwitchUser = useCallback(() => {
    setCurrentUser(null);
    setIsOnboarded(false);
    setActiveGame(null);
    setGameResult(null);
    sounds.playGentleTap();
  }, []);

  // ── Demo / Reset ──────────────────────────────────────────────────────────
  const resetToDemoData = () => {
    const demoPid = "pat-maa-7788";
    setPatientIdState(demoPid);
    setIsDemoMode(true);
    setCurrentUser({
      role: "patient",
      name: "Maa",
      relationOrTitle: "Self",
      phone: "9876543210"
    });
    setPatientData(defaultPatientData);
    setIsOnboarded(true);
    setUserRole("patient");
    setActiveTab("home");
    setActiveGame(null);
    setGameResult(null);
    sounds.playSuccess();
  };

  const resetToEmptyData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(DEMO_MODE_KEY);
    const newPid = "pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    localStorage.setItem(PATIENT_ID_KEY, newPid);
    setPatientIdState(newPid);
    setIsDemoMode(false);
    setCurrentUser(null);
    setPatientData(emptyPatientData);
    setIsOnboarded(false);
    setUserRole("patient");
    setActiveTab("home");
    setActiveGame(null);
    setGameResult(null);
    setGameSessionCycle(1);
    sounds.playGentleTap();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <AppContext.Provider value={{
      isOnboarded, setIsOnboarded,
      userRole, setUserRole,
      currentUser, setCurrentUser,
      isDemoMode, setIsDemoMode,
      patientData, setPatientData,
      gameSessionCycle, setGameSessionCycle,
      activeTab, setActiveTab,
      familyTab, setFamilyTab,
      caregiverTab, setCaregiverTab,
      activeModal, setActiveModal,
      activeGame, setActiveGame,
      gameResult, setGameResult,
      viewMode, setViewMode,
      syncStatus,
      isSupabaseEnabled,
      patientId,
      hasSpokenGreeting, markGreetingSpoken,
      // Actions
      registerPatientAsSelf,
      registerPatientAsFamily,
      registerPatientAsCaregiver,
      connectExistingPatient,
      logoutOrSwitchUser,
      updateProfile, updateHomeLocation,
      addFamilyMember, updateFamilyMember, deleteFamilyMember,
      addPlace, updatePlace, deletePlace,
      addMemory, updateMemory, deleteMemory,
      updatePersonalInfo,
      addMedicine, updateMedicine, toggleMedicine, deleteMedicine,
      addTodo, updateTodo, toggleTodo, deleteTodo,
      addRoutineStep, updateRoutineStep, deleteRoutineStep,
      addReminder, updateReminder, toggleReminder, deleteReminder,
      updateDoctor,
      addAlert, resolveAlert, triggerSafetyAlert,
      setDifficultyLevel,
      recordGameCompletion,
      resetToDemoData, resetToEmptyData,
      // i18n
      language, setLanguage,
      t, localizeRelation,
      SUPPORTED_LANGUAGES
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

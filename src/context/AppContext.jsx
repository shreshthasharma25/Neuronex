import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { defaultPatientData, demoPatientsById, getDemoCaregiverPatients } from "../data/defaultData";
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
  loadCaregiverPatients,
  linkPatientToCaregiverDB,
  unlinkPatientFromCaregiverDB,
  createAndLinkPatientDB,
  verifyCaregiverPatientAccess,
  subscribeToCaregiverPatients,
} from "../services/supabaseService";
import { calculatePatientStatus } from "../utils/patientStatusEngine";

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
const CAREGIVER_ID_KEY = "neuronex_caregiver_id";
const CAREGIVER_PATIENTS_KEY = "neuronex_caregiver_patients_v2";
const SELECTED_PATIENT_KEY = "neuronex_selected_patient_id";
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

// Stable caregiver ID for caregiver account
function getOrCreateCaregiverId() {
  try {
    let id = localStorage.getItem(CAREGIVER_ID_KEY);
    if (!id) {
      id = "cg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
      localStorage.setItem(CAREGIVER_ID_KEY, id);
    }
    return id;
  } catch {
    return "cg-local";
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
      const val = localStorage.getItem(DEMO_MODE_KEY);
      return val === null ? true : val === "true";
    } catch { return true; }
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

  // ── Multi-Patient Caregiver State ─────────────────────────────────────────
  const [caregiverId, setCaregiverIdState] = useState(() => {
    try {
      return localStorage.getItem(CAREGIVER_ID_KEY) || getOrCreateCaregiverId();
    } catch {
      return "cg-local";
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_PATIENT_KEY) || null;
    } catch {
      return null;
    }
  });

  const [assignedPatients, setAssignedPatients] = useState(() => {
    try {
      const saved = localStorage.getItem(CAREGIVER_PATIENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with any new demo patients like Bikram if missing
          const demoPatients = getDemoCaregiverPatients();
          const map = {};
          demoPatients.forEach(p => { map[p.id] = p; });
          parsed.forEach(p => { map[p.id] = p; });
          return Object.values(map);
        }
      }
      return getDemoCaregiverPatients();
    } catch {
      return getDemoCaregiverPatients();
    }
  });

  const [assignedPatientsLoading, setAssignedPatientsLoading] = useState(false);
  const [assignedPatientsError, setAssignedPatientsError] = useState(null);
  const [accessDeniedNotice, setAccessDeniedNotice] = useState(null);
  const [patientDetailsLoading, setPatientDetailsLoading] = useState(false);
  const [patientDetailsError, setPatientDetailsError] = useState(null);
  const activeRequestIdRef = useRef(0);
  const patientCacheRef = useRef({ ...demoPatientsById });

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

  // ── Sync localStorage (Per-patient isolated storage) ─────────────────────
  useEffect(() => {
    if (!patientData || !patientData.profile) return;
    const curPid = patientData.profile.patientId;
    if (curPid) {
      patientCacheRef.current[curPid] = patientData;
      try {
        localStorage.setItem(`neuronex_patient_${curPid}`, JSON.stringify(patientData));
      } catch (e) { console.warn("Per-patient storage write failed", e); }
    }
    // Only update global default storage if viewing default patient or no multi-patient selection
    if (!selectedPatientId || curPid === patientId) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(patientData)); }
      catch (e) { console.warn("localStorage write failed", e); }
    }
  }, [patientData, selectedPatientId, patientId]);

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

  // ── Multi-Patient Caregiver Synchronization ───────────────────────────────
  const refreshCaregiverPatients = useCallback(async () => {
    if (!caregiverId) return;
    setAssignedPatientsLoading(true);
    setAssignedPatientsError(null);

    if (isSupabaseEnabled) {
      try {
        const patients = await loadCaregiverPatients(caregiverId);
        if (patients !== null) {
          setAssignedPatients(patients);
          try { localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(patients)); } catch {}
        }
      } catch (err) {
        console.error("Error loading caregiver patients:", err);
        setAssignedPatientsError("Could not retrieve patients from database.");
      } finally {
        setAssignedPatientsLoading(false);
      }
      return;
    }

    // LocalStorage / Demo Mode Fallback
    try {
      if (isDemoMode) {
        const demoPatients = getDemoCaregiverPatients();
        const saved = localStorage.getItem(CAREGIVER_PATIENTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const map = {};
          demoPatients.forEach(p => { map[p.id] = p; });
          parsed.forEach(p => { map[p.id] = p; });
          const merged = Object.values(map);
          setAssignedPatients(merged);
        } else {
          setAssignedPatients(demoPatients);
          localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(demoPatients));
        }
      } else {
        const saved = localStorage.getItem(CAREGIVER_PATIENTS_KEY);
        setAssignedPatients(saved ? JSON.parse(saved) : []);
      }
    } catch (e) {
      console.warn("Local caregiver patients load failed", e);
    } finally {
      setAssignedPatientsLoading(false);
    }
  }, [caregiverId, isDemoMode]);

  // Sync caregiverId & selectedPatientId to localStorage
  useEffect(() => {
    try { localStorage.setItem(CAREGIVER_ID_KEY, caregiverId); } catch {}
  }, [caregiverId]);

  useEffect(() => {
    try {
      if (selectedPatientId) localStorage.setItem(SELECTED_PATIENT_KEY, selectedPatientId);
      else localStorage.removeItem(SELECTED_PATIENT_KEY);
    } catch {}
  }, [selectedPatientId]);

  // Load assigned patients when caregiver role is activated
  useEffect(() => {
    if (userRole === "caregiver") {
      refreshCaregiverPatients();
    }
  }, [userRole, refreshCaregiverPatients]);

  // Real-time subscription to caregiver_patients
  useEffect(() => {
    if (!isSupabaseEnabled || userRole !== "caregiver") return;
    const unsub = subscribeToCaregiverPatients(caregiverId, () => {
      refreshCaregiverPatients();
    });
    return unsub;
  }, [caregiverId, userRole, refreshCaregiverPatients]);

  // ── Multi-Patient Caregiver Actions ───────────────────────────────────────
  const selectPatient = useCallback(async (targetPatientId) => {
    if (!targetPatientId) return false;
    const cleanId = String(targetPatientId).trim();

    // Security Verification: A caregiver must only be able to see assigned patients
    let isAuthorized = false;
    if (isSupabaseEnabled) {
      isAuthorized = await verifyCaregiverPatientAccess(caregiverId, cleanId);
    } else {
      isAuthorized = assignedPatients.some(p => (p.id || p.patientId) === cleanId);
      if (!isAuthorized) {
        try {
          const saved = JSON.parse(localStorage.getItem(CAREGIVER_PATIENTS_KEY) || '[]');
          isAuthorized = saved.some(p => (p.id || p.patientId) === cleanId);
        } catch {}
      }
      if (!isAuthorized && (isDemoMode || demoPatientsById[cleanId])) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      setAccessDeniedNotice(`Access Denied: Patient "${cleanId}" is not assigned to your caregiver account.`);
      sounds.playReminderChime?.();
      return false;
    }

    // Increment request ID to ignore responses from older async fetches (prevents race conditions)
    const currentRequestId = ++activeRequestIdRef.current;

    setAccessDeniedNotice(null);
    setSelectedPatientId(cleanId);
    setPatientIdState(cleanId);
    setPatientDetailsLoading(true);
    setPatientDetailsError(null);

    try {
      localStorage.setItem(SELECTED_PATIENT_KEY, cleanId);
      localStorage.setItem(PATIENT_ID_KEY, cleanId);
    } catch {}

    // Check in-memory cache and localStorage first
    let cachedData = patientCacheRef.current[cleanId] || demoPatientsById[cleanId];
    if (!cachedData) {
      try {
        const saved = localStorage.getItem(`neuronex_patient_${cleanId}`);
        if (saved) cachedData = JSON.parse(saved);
      } catch {}
    }
    if (!cachedData) {
      const pSummary = assignedPatients.find(p => (p.id || p.patientId) === cleanId);
      if (pSummary && pSummary.profile) {
        cachedData = {
          profile: pSummary.profile,
          medicines: pSummary.medicines || [],
          todos: pSummary.todos || [],
          brainExercise: pSummary.brainExercise || { dailyCompleted: false },
          cognitiveStats: pSummary.cognitiveStats || { gamesCompleted: 0, averageAccuracy: 0, history: [] },
          alerts: pSummary.alerts || [],
          homeLocation: pSummary.homeLocation || {},
          family: pSummary.family || [],
          places: pSummary.places || [],
          routine: pSummary.routine || [],
          emergencyContacts: pSummary.emergencyContacts || [],
        };
      }
    }

    if (cachedData) {
      patientCacheRef.current[cleanId] = cachedData;
      setPatientData(cachedData);
    }

    // Local / Demo mode: complete immediately once cache is populated
    if (!isSupabaseEnabled) {
      if (cachedData) {
        setPatientDetailsLoading(false);
        sounds.playGentleTap();
        return true;
      } else {
        setPatientDetailsError(`Patient "${cleanId}" could not be found.`);
        setPatientDetailsLoading(false);
        return false;
      }
    }

    // Supabase Mode: Async fetch remote patient data
    setSyncStatus("syncing");
    try {
      const data = await loadPatientData(cleanId);
      // If another patient selection occurred while this was fetching, ignore!
      if (activeRequestIdRef.current !== currentRequestId) {
        return true;
      }
      if (data) {
        patientCacheRef.current[cleanId] = data;
        setPatientData(data);
        setSyncStatus("synced");
        setPatientDetailsLoading(false);
        sounds.playGentleTap();
        return true;
      } else {
        if (cachedData) {
          setPatientDetailsLoading(false);
          sounds.playGentleTap();
          return true;
        }
        setPatientDetailsError(`Patient "${cleanId}" record was not found in the database.`);
        setPatientDetailsLoading(false);
        return false;
      }
    } catch (err) {
      if (activeRequestIdRef.current !== currentRequestId) return false;
      console.error("Error loading selected patient data:", err);
      if (cachedData) {
        setPatientDetailsLoading(false);
        return true;
      }
      setPatientDetailsError(`Error loading patient "${cleanId}". Please check your network connection.`);
      setPatientDetailsLoading(false);
      return false;
    }
  }, [caregiverId, assignedPatients, isDemoMode]);

  const backToAllPatients = useCallback(() => {
    activeRequestIdRef.current++;
    setSelectedPatientId(null);
    setPatientDetailsLoading(false);
    setPatientDetailsError(null);
    setAccessDeniedNotice(null);
    setUserRole("caregiver");
    setCaregiverTab("overview");

    try {
      localStorage.removeItem(SELECTED_PATIENT_KEY);
    } catch {}

    // Clear URL hash immediately so hash listeners don't re-trigger patient selection
    try {
      if (window.location.hash && window.location.hash.includes("patient")) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
          window.location.hash = "";
        }
      }
    } catch {}

    refreshCaregiverPatients();
    sounds.playGentleTap();
  }, [refreshCaregiverPatients, setUserRole, setCaregiverTab]);

  const openPatientPortal = useCallback(async (targetPatientId) => {
    if (!targetPatientId) return false;
    const cleanId = String(targetPatientId).trim();
    const success = await selectPatient(cleanId);
    if (success) {
      setUserRole("patient");
      setActiveTab("home");
      sounds.playSuccess?.();
      return true;
    }
    return false;
  }, [selectPatient, setUserRole, setActiveTab]);

  const linkPatientToCaregiver = useCallback(async (targetPatientId) => {
    if (!targetPatientId || !String(targetPatientId).trim()) {
      return { success: false, error: "Please enter a valid Patient ID" };
    }
    const cleanId = String(targetPatientId).trim();

    const alreadyLinked = assignedPatients.some(p => (p.id || p.patientId) === cleanId);
    if (alreadyLinked) {
      return { success: false, error: `Patient "${cleanId}" is already linked to your account.` };
    }

    if (isSupabaseEnabled) {
      const res = await linkPatientToCaregiverDB(caregiverId, cleanId);
      if (!res.success) return res;
      await refreshCaregiverPatients();
      sounds.playSuccess();
      return { success: true };
    }

    // Local / Demo mode fallback
    let foundPatient = demoPatientsById[cleanId];
    if (!foundPatient) {
      if (cleanId === patientId && patientData?.profile?.fullName) {
        foundPatient = patientData;
      } else {
        foundPatient = {
          profile: {
            fullName: `Patient ${cleanId.slice(-4)}`,
            preferredName: "Patient",
            age: 70,
            gender: "Female",
            language: "English",
            avatar: "",
            patientId: cleanId,
            registered: true,
          },
          homeLocation: { address: "Residential Home", safeZoneRadius: 500 },
          cognitiveStats: { gamesCompleted: 0, averageAccuracy: 0, history: [] },
          medicines: [],
          alerts: [],
          brainExercise: { dailyCompleted: false },
        };
      }
    }

    const history = foundPatient.cognitiveStats?.history || [];
    const newSummary = {
      id: cleanId,
      patientId: cleanId,
      fullName: foundPatient.profile?.fullName || "Patient",
      preferredName: foundPatient.profile?.preferredName || "Patient",
      age: foundPatient.profile?.age || "N/A",
      gender: foundPatient.profile?.gender || "Female",
      language: foundPatient.profile?.language || "English",
      avatar: foundPatient.profile?.avatar || "",
      profile: foundPatient.profile,
      homeLocation: foundPatient.homeLocation || {},
      cognitiveStats: foundPatient.cognitiveStats || { gamesCompleted: 0, averageAccuracy: 0, history: [] },
      latestGameName: history[0]?.gameName || null,
      latestGameAccuracy: history[0]?.accuracy || null,
      recentActivity: history[0]?.date || "No recent activity",
      todayGamesCount: history.filter(h => (h.date || "").toLowerCase().includes("today")).length,
      unresolvedAlertsCount: (foundPatient.alerts || []).filter(a => !a.resolved).length,
      medicinesCount: (foundPatient.medicines || []).length,
      medicinesTakenCount: (foundPatient.medicines || []).filter(m => m.taken).length,
      alerts: foundPatient.alerts || [],
      medicines: foundPatient.medicines || [],
      brainExercise: foundPatient.brainExercise || { dailyCompleted: false },
    };
    newSummary.status = calculatePatientStatus(newSummary);

    const updatedList = [newSummary, ...assignedPatients];
    setAssignedPatients(updatedList);
    try {
      localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(updatedList));
    } catch {}

    sounds.playSuccess();
    return { success: true };
  }, [caregiverId, assignedPatients, patientId, patientData, refreshCaregiverPatients]);

  const createAndLinkPatient = useCallback(async (patientFields) => {
    if (!patientFields.fullName?.trim()) {
      return { success: false, error: "Please enter the patient's full name" };
    }

    if (isSupabaseEnabled) {
      const res = await createAndLinkPatientDB(caregiverId, patientFields);
      if (!res.success) return res;
      await refreshCaregiverPatients();
      sounds.playSuccess();
      return { success: true, patientId: res.patientId };
    }

    // Local / Demo mode fallback
    const newPid = "pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const newSummary = {
      id: newPid,
      patientId: newPid,
      fullName: patientFields.fullName,
      preferredName: patientFields.preferredName || patientFields.fullName,
      age: patientFields.age || "N/A",
      gender: patientFields.gender || "Female",
      language: patientFields.language || "English",
      avatar: patientFields.avatar || "",
      profile: {
        fullName: patientFields.fullName,
        preferredName: patientFields.preferredName || patientFields.fullName,
        age: patientFields.age || "",
        gender: patientFields.gender || "Female",
        language: patientFields.language || "English",
        avatar: patientFields.avatar || "",
        phone: patientFields.phone || "",
        registered: true,
        patientId: newPid,
      },
      homeLocation: { address: "", city: "", safeZoneRadius: 500 },
      cognitiveStats: { gamesCompleted: 0, averageAccuracy: 0, history: [] },
      latestGameName: null,
      latestGameAccuracy: null,
      recentActivity: "No exercise yet",
      todayGamesCount: 0,
      unresolvedAlertsCount: 0,
      medicinesCount: 0,
      medicinesTakenCount: 0,
      alerts: [],
      medicines: [],
      brainExercise: { dailyCompleted: false },
    };
    newSummary.status = calculatePatientStatus(newSummary);

    const fullPatientData = {
      profile: newSummary.profile,
      homeLocation: newSummary.homeLocation,
      cognitiveStats: newSummary.cognitiveStats,
      alerts: [],
      medicines: [],
      todos: [],
      routine: [],
      memories: [],
      places: [],
      family: [],
      emergencyContacts: [],
      brainExercise: { dailyCompleted: false, scheduledTime: "10:00 AM", todaysGames: ["memory-twin", "picture-memory"], dayCycle: 1 }
    };
    patientCacheRef.current[newPid] = fullPatientData;
    try {
      localStorage.setItem(`neuronex_patient_${newPid}`, JSON.stringify(fullPatientData));
    } catch {}

    const updated = [newSummary, ...assignedPatients];
    setAssignedPatients(updated);
    try {
      localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(updated));
    } catch {}

    sounds.playSuccess();
    return { success: true, patientId: newPid };
  }, [caregiverId, assignedPatients, refreshCaregiverPatients]);

  const unlinkPatientFromCaregiver = useCallback(async (targetPatientId) => {
    if (!targetPatientId) return;
    if (isSupabaseEnabled) {
      await unlinkPatientFromCaregiverDB(caregiverId, targetPatientId);
    }
    const updated = assignedPatients.filter(p => (p.id || p.patientId) !== targetPatientId);
    setAssignedPatients(updated);
    try {
      localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(updated));
    } catch {}
    if (selectedPatientId === targetPatientId) {
      setSelectedPatientId(null);
    }
    sounds.playGentleTap();
  }, [caregiverId, assignedPatients, selectedPatientId]);

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
    const currentGameLevels = patientData.cognitiveStats?.gameLevels || {};
    
    // Fallback to category level or global level if game-specific level isn't set yet
    const catKey = (category || "memory").toLowerCase();
    const currentCatLevels = patientData.cognitiveStats?.categoryLevels || { memory: 1, recall: 1, attention: 1, sequencing: 1 };
    
    const currentLevel = currentGameLevels[gameId] 
      || currentCatLevels[catKey] 
      || patientData.cognitiveStats?.currentLevel 
      || 1;

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

    // Calculate adaptive difficulty progression using rolling window of recent history for THIS GAME
    const simulatedHistory = [sessionRecord, ...existingHistory];
    const { newLevel, levelNotice, changeDirection } = evaluateAdaptiveDifficulty(simulatedHistory, currentLevel, gameId);

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

      // Update the specific game level
      const updatedGameLevels = {
        ...(prevStats.gameLevels || {}),
        [gameId]: newLevel
      };
      
      // Update global highest level achieved
      const bestLevelAchieved = Math.max(prevStats.bestLevelAchieved || 1, newLevel);

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
          bestLevelAchieved,
          gameLevels: updatedGameLevels,
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
    return {
      newLevel,
      levelNotice,
      changeDirection,
      difficulty: `Level ${currentLevel}`
    };
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
      id: caregiverId,
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
    linkPatientToCaregiverDB(caregiverId, pid);
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
    refreshCaregiverPatients();
    setIsOnboarded(true);
    sounds.playSuccess();
  }, [patientId, caregiverId, refreshCaregiverPatients]);

  const connectExistingPatient = useCallback(async ({ targetPatientId, role, userInfo }) => {
    if (!targetPatientId) return false;
    const cleanId = targetPatientId.trim();
    setPatientIdState(cleanId);
    const user = {
      id: role === "caregiver" ? caregiverId : undefined,
      role: role || "patient",
      name: userInfo?.name || (role === "caregiver" ? "Caregiver" : role === "family" ? "Family Member" : "Patient"),
      relationOrTitle: userInfo?.relationOrTitle || (role === "caregiver" ? "Caregiver" : role === "family" ? "Relative" : "Self"),
      phone: userInfo?.phone || ""
    };
    setCurrentUser(user);
    setUserRole(role || "patient");
    setIsDemoMode(false);

    if (role === "caregiver") {
      await linkPatientToCaregiverDB(caregiverId, cleanId);
      refreshCaregiverPatients();
    }

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
  }, [caregiverId, refreshCaregiverPatients]);

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
    const demoCgId = "cg-bose-101";
    setPatientIdState(demoPid);
    setCaregiverIdState(demoCgId);
    setSelectedPatientId(null);
    setAccessDeniedNotice(null);
    setPatientDetailsLoading(false);
    setPatientDetailsError(null);
    patientCacheRef.current = { ...demoPatientsById };
    setIsDemoMode(true);
    setCurrentUser({
      id: demoCgId,
      role: "patient",
      name: "Maa",
      relationOrTitle: "Self",
      phone: "9876543210"
    });
    const demoPatients = getDemoCaregiverPatients();
    setAssignedPatients(demoPatients);
    setPatientData(defaultPatientData);
    setIsOnboarded(true);
    setUserRole("patient");
    setActiveTab("home");
    setActiveGame(null);
    setGameResult(null);
    try {
      localStorage.setItem(CAREGIVER_ID_KEY, demoCgId);
      localStorage.setItem(CAREGIVER_PATIENTS_KEY, JSON.stringify(demoPatients));
      localStorage.removeItem(SELECTED_PATIENT_KEY);
    } catch {}
    sounds.playSuccess();
  };

  const resetToEmptyData = () => {
    patientCacheRef.current = {};
    setPatientDetailsLoading(false);
    setPatientDetailsError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(CAREGIVER_PATIENTS_KEY);
    localStorage.removeItem(SELECTED_PATIENT_KEY);
    const newPid = "pat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const newCgId = "cg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    localStorage.setItem(PATIENT_ID_KEY, newPid);
    localStorage.setItem(CAREGIVER_ID_KEY, newCgId);
    setPatientIdState(newPid);
    setCaregiverIdState(newCgId);
    setAssignedPatients([]);
    setSelectedPatientId(null);
    setAccessDeniedNotice(null);
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
      // Multi-Patient Caregiver
      caregiverId,
      assignedPatients,
      assignedPatientsLoading,
      assignedPatientsError,
      patientDetailsLoading,
      patientDetailsError,
      selectedPatientId,
      selectPatient,
      openPatientPortal,
      backToAllPatients,
      linkPatientToCaregiver,
      createAndLinkPatient,
      unlinkPatientFromCaregiver,
      refreshCaregiverPatients,
      accessDeniedNotice,
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

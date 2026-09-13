import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LiveLocationMap from '../common/LiveLocationMap';
import { useApp } from '../../context/AppContext';
import PatientSummaryBar from './PatientSummaryBar';
import PatientCard from './PatientCard';
import AddPatientModal from './AddPatientModal';
import { calculateDashboardSummary } from '../../utils/patientStatusEngine';
import {
  Pill,
  Brain,
  CheckSquare,
  Bell,
  User,
  Heart,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Search,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function Dashboard({ onNavigateTab }) {
  const {
    patientData,
    setUserRole,
    setDifficultyLevel,
    assignedPatients = [],
    assignedPatientsLoading,
    assignedPatientsError,
    patientDetailsLoading,
    patientDetailsError,
    selectedPatientId,
    selectPatient,
    openPatientPortal,
    backToAllPatients,
    refreshCaregiverPatients,
    accessDeniedNotice,
    unlinkPatientFromCaregiver,
    caregiverId,
  } = useApp();

  // Search & Status Filter state for Multi-Patient Grid
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'stable' | 'needs_attention' | 'high_attention'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute summary metrics dynamically from real patient data
  const summaryMetrics = useMemo(() => {
    return calculateDashboardSummary(assignedPatients);
  }, [assignedPatients]);

  // Filter patients by search text and status
  const filteredPatients = useMemo(() => {
    return assignedPatients.filter(patient => {
      // Name search
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = !q ||
        (patient.fullName && patient.fullName.toLowerCase().includes(q)) ||
        (patient.preferredName && patient.preferredName.toLowerCase().includes(q)) ||
        (patient.id && patient.id.toLowerCase().includes(q));

      // Status filter
      const patientStatusLevel = patient.status?.level || 'stable';
      let statusMatch = true;
      if (statusFilter === 'stable') {
        statusMatch = patientStatusLevel === 'stable';
      } else if (statusFilter === 'needs_attention') {
        statusMatch = patientStatusLevel === 'needs_attention';
      } else if (statusFilter === 'high_attention') {
        statusMatch = patientStatusLevel === 'high_attention';
      }

      return nameMatch && statusMatch;
    });
  }, [assignedPatients, searchQuery, statusFilter]);

  // Counts for status filters
  const filterCounts = useMemo(() => {
    let stable = 0;
    let needs = 0;
    let high = 0;
    assignedPatients.forEach(p => {
      const lvl = p.status?.level || 'stable';
      if (lvl === 'stable') stable++;
      else if (lvl === 'needs_attention') needs++;
      else if (lvl === 'high_attention') high++;
    });
    return {
      all: assignedPatients.length,
      stable,
      needs_attention: needs,
      high_attention: high,
    };
  }, [assignedPatients]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 1: PATIENT DETAILS VIEW (When a specific patient is selected)
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedPatientId) {
    const isDataMatching = patientData?.profile?.patientId === selectedPatientId;
    const isLoading = patientDetailsLoading || !isDataMatching;

    // ERROR STATE: Patient record could not be loaded or not found
    if (patientDetailsError && !isDataMatching) {
      return (
        <div className="space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-200">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                backToAllPatients();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors border border-blue-200 shadow-xs touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Patients</span>
            </button>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono font-bold text-xs truncate">
              {selectedPatientId}
            </span>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-rose-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                Unable to Load Patient Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 font-medium leading-relaxed">
                {patientDetailsError}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playGentleTap();
                  backToAllPatients();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors touch-target"
              >
                ← Back to All Patients
              </button>
              <button
                type="button"
                onClick={() => selectPatient(selectedPatientId)}
                className="px-4 py-2.5 rounded-xl bg-[#2F6FED] hover:bg-[#2557be] text-white text-xs font-bold transition-colors touch-target"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      );
    }

    // LOADING SKELETON: Displayed while fetching or before patient data is confirmed matching
    if (isLoading) {
      const targetSummary = assignedPatients.find(p => (p.id || p.patientId) === selectedPatientId);
      const displayName = targetSummary?.preferredName || targetSummary?.fullName || selectedPatientId;
      return (
        <div className="space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-200">
          {/* Breadcrumb Skeleton */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                backToAllPatients();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors border border-blue-200 shadow-xs touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Patients</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-[#2F6FED] border-t-transparent rounded-full animate-spin" />
              <span className="px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#2F6FED] font-mono font-bold text-xs truncate">
                {selectedPatientId}
              </span>
            </div>
          </div>

          {/* Loading Indicator Banner */}
          <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-[#2F6FED] border-t-transparent animate-spin flex-shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-[#2F6FED]">
                Loading Patient Portal for {displayName}...
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Fetching cognitive records, medicines schedule, and safety monitoring.
              </p>
            </div>
          </div>

          {/* Profile Card Skeleton */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-9 w-28 bg-slate-100 rounded-xl hidden sm:block" />
          </div>

          {/* 4 Metric Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-200" />
                <div className="h-6 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          {/* Schedule Banner Skeleton */}
          <div className="p-6 rounded-3xl bg-slate-100 animate-pulse h-28" />
        </div>
      );
    }

    const { profile, medicines = [], todos = [], brainExercise = {}, cognitiveStats = {}, alerts = [], homeLocation = {} } = patientData || {};
    const currentLevel = cognitiveStats?.currentLevel || 1;
    const medsTaken = medicines.filter(m => m.taken).length;
    const totalMeds = medicines.length;
    const todosCompleted = todos.filter(t => t.completed).length;
    const totalTodos = todos.length;
    const pendingAlerts = alerts.filter(a => !a.resolved);

    return (
      <div className="space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb / Return to All Patients Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              backToAllPatients();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors border border-blue-200 shadow-xs touch-target"
            title="Return to Caregiver Dashboard showing all patients"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to All Patients</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Selected ID:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#2F6FED] font-mono font-bold text-xs truncate">
              {selectedPatientId}
            </span>
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-[#EAF2FF] flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#EAF2FF] border-2 border-[#2F6FED]/20 flex items-center justify-center text-[#2F6FED] flex-shrink-0">
                <User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-extrabold text-[#172B4D] truncate">
                  {profile?.fullName || 'Patient'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#B45309] text-[10px] sm:text-xs font-bold">
                  Called "{profile?.preferredName || 'Maa'}"
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                {profile?.age ? `${profile.age} yrs` : 'Age pending'} • {profile?.gender || 'Female'} • {profile?.language || 'English'}
              </p>
              <p className="text-xs text-[#2F6FED] font-bold truncate mt-0.5">
                📍 Home: {homeLocation?.address || 'Address pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigateTab('safety')}
              className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#d5e6ff] text-[#2F6FED] text-xs font-bold transition-all w-full sm:w-auto touch-target"
            >
              <span>Safety & Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TODAY'S STATUS OVERVIEW GRID FOR SELECTED PATIENT */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-[#172B4D] uppercase tracking-wider text-xs">
              Today's Care Status: {profile?.preferredName || profile?.fullName || 'Patient'}
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Live Synchronized
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Medicines Card */}
            <div 
              onClick={() => onNavigateTab('medicines')}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-[#2F6FED] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg sm:text-xl">
                  💊
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Daily</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D] block">
                {medsTaken}/{totalMeds}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                Medicines Taken
              </span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: totalMeds > 0 ? `${(medsTaken / totalMeds) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Brain Exercise Card */}
            <div 
              onClick={() => onNavigateTab('monitoring')}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-[#2F6FED] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#2F6FED] flex items-center justify-center text-lg sm:text-xl">
                  🧠
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${
                  brainExercise?.dailyCompleted ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {brainExercise?.dailyCompleted ? 'Done' : 'Pending'}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D] block">
                {brainExercise?.dailyCompleted ? "Done" : "Pending"}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                Brain Exercise
              </span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#2F6FED] h-full rounded-full"
                  style={{ width: brainExercise?.dailyCompleted ? '100%' : '30%' }}
                />
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-0.5 sm:gap-1" onClick={(e) => e.stopPropagation()}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">
                  Difficulty:
                </span>
                <div className="flex gap-0.5 sm:gap-1">
                  {[
                    { lvl: 1, label: 'L1' },
                    { lvl: 2, label: 'L2' },
                    { lvl: 3, label: 'L3' }
                  ].map(({ lvl, label }) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficultyLevel(lvl)}
                      className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black transition-all ${
                        currentLevel === lvl
                          ? 'bg-[#2F6FED] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={`Set Level ${lvl}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* To-Do Completed Card */}
            <div 
              onClick={() => onNavigateTab('todos')}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-[#2F6FED] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg sm:text-xl">
                  ✅
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Routine</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D] block">
                {todosCompleted}/{totalTodos}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                To-Do Items
              </span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#2E7D32] h-full rounded-full"
                  style={{ width: totalTodos > 0 ? `${(todosCompleted / totalTodos) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Safety Alerts Card */}
            <div 
              onClick={() => onNavigateTab('alerts')}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm cursor-pointer transition-all ${
                pendingAlerts.length > 0 ? 'bg-[#FDECEC] border-rose-300' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg sm:text-xl">
                  🔔
                </div>
                {pendingAlerts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D] block">
                {pendingAlerts.length}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                Active Alerts
              </span>
              <div className="mt-2 text-[9px] sm:text-[10px] font-bold text-rose-700 truncate">
                {pendingAlerts.length > 0 ? 'Action Recommended' : 'All Clear'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Care Schedule */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2F6FED] to-[#1E4EB8] text-white shadow-lg shadow-[#2F6FED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Caregiver Daily Care</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
              Manage {profile?.preferredName || 'Patient'}'s Care & Schedule
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-md font-medium mt-0.5">
              Configure medicines, daily checklist, scheduled routine, and safe-zone perimeter.
            </p>
          </div>

          <Button
            onClick={() => onNavigateTab('medicines')}
            variant="yellow"
            size="lg"
            className="font-extrabold text-sm sm:text-base flex-shrink-0 w-full sm:w-auto text-center justify-center"
          >
            MANAGE MEDICINES →
          </Button>
        </div>

        {/* RECENT ACTIVITY & LOCATION SNAPSHOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Games Played */}
          <Card variant="white" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold text-[#172B4D]">
                Recent Cognitive Activity
              </h4>
              <button
                onClick={() => onNavigateTab('monitoring')}
                className="text-xs font-bold text-[#2F6FED] hover:underline"
              >
                Full Analytics →
              </button>
            </div>

            {(!cognitiveStats?.history || cognitiveStats.history.length === 0) ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">
                Your patient's progress data will appear here after they complete activities.
              </p>
            ) : (
              <div className="space-y-3">
                {cognitiveStats.history.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🧠</span>
                      <div>
                        <span className="font-bold text-[#172B4D] block">
                          {item.gameName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.date} • {item.time}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-extrabold">
                      {item.accuracy}% Accuracy
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Safety & Location Status */}
          <Card variant="white" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold text-[#172B4D]">
                Home & Safe Zone Monitor
              </h4>
              <button
                onClick={() => onNavigateTab('safety')}
                className="text-xs font-bold text-[#2F6FED] hover:underline"
              >
                Edit Safe Zone →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Registered Home:</span>
                <span className="text-xs font-bold text-[#172B4D] text-right">
                  {homeLocation?.address || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Safe-Zone Radius:</span>
                <span className="text-xs font-extrabold text-[#2F6FED]">
                  {homeLocation?.safeZoneRadius || 500} meters
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#CFE1FF] pt-2">
                <span className="text-xs font-bold text-slate-600">Live Status:</span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E7D32]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Within Safe Boundary
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* View as Patient Button */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-100 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600">
            Want to see how this appears to {profile?.preferredName || 'Patient'}?
          </span>
          <Button
            onClick={() => {
              sounds.playGentleTap();
              openPatientPortal(selectedPatientId);
            }}
            size="sm"
            variant="primary"
            className="w-full sm:w-auto justify-center"
          >
            View as Patient 🧓
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 2: MULTI-PATIENT CAREGIVER DASHBOARD (All Assigned Patients)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Unauthorized Access Alert (if URL tampering or permission check fails) */}
      {accessDeniedNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                Security Protection Active
              </h4>
              <p className="text-xs font-bold text-rose-800 mt-0.5">
                {accessDeniedNotice}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={backToAllPatients}
            className="px-2.5 py-1 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-900 text-xs font-extrabold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP SUMMARY SECTION */}
      <PatientSummaryBar
        summary={summaryMetrics}
        activeFilter={statusFilter}
        onFilterStatus={(filterKey) => {
          sounds.playGentleTap();
          setStatusFilter(filterKey);
        }}
      />

      {/* SEARCH, STATUS FILTER & ADD PATIENT ACTION BAR */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-xs sm:text-sm text-[#172B4D] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* "+ Add Patient" Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshCaregiverPatients}
              disabled={assignedPatientsLoading}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors touch-target"
              title="Refresh patients data"
            >
              <RefreshCw className={`w-4 h-4 ${assignedPatientsLoading ? 'animate-spin text-[#2F6FED]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-[#2F6FED] hover:bg-[#2557be] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all touch-target flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Patient</span>
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Status:
          </span>

          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setStatusFilter('all');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-target ${
              statusFilter === 'all'
                ? 'bg-[#172B4D] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All ({filterCounts.all})
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setStatusFilter('stable');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-target ${
              statusFilter === 'stable'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            <span>🟢 Stable ({filterCounts.stable})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setStatusFilter('needs_attention');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-target ${
              statusFilter === 'needs_attention'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <span>🟡 Needs Attention ({filterCounts.needs_attention})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setStatusFilter('high_attention');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-target ${
              statusFilter === 'high_attention'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
            }`}
          >
            <span>🔴 High Attention ({filterCounts.high_attention})</span>
          </button>
        </div>
      </div>

      {/* "MY PATIENTS" SECTION HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#172B4D] tracking-tight">
            My Patients
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Showing {filteredPatients.length} of {assignedPatients.length} assigned patients
          </p>
        </div>

        {/* Active search or filter reset */}
        {(searchQuery || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs font-bold text-[#2F6FED] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* LOADING STATE */}
      {assignedPatientsLoading && assignedPatients.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-14 bg-slate-100 rounded-xl" />
              <div className="h-9 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {assignedPatientsError && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-rose-800">
            {assignedPatientsError}
          </h3>
          <p className="text-xs text-rose-600 max-w-sm mx-auto font-medium">
            Unable to connect to the database. Check your network or Supabase credentials.
          </p>
          <button
            type="button"
            onClick={refreshCaregiverPatients}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* EMPTY STATE 1: NO PATIENTS ASSIGNED TO CAREGIVER */}
      {!assignedPatientsLoading && assignedPatients.length === 0 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-3xl mx-auto shadow-sm">
            👥
          </div>
<div>
  <h3 className="text-lg font-extrabold text-[#172B4D]">
    No patients linked yet.
  </h3>
  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium leading-relaxed">
    You do not have any patients assigned to your caregiver account. Add a patient using their unique ID or register a new patient profile.
  </p>
</div>
<button
  type="button"
  onClick={() => {
    sounds.playGentleTap();
    setIsAddModalOpen(true);
  }}
  className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-[#2F6FED] hover:bg-[#2557be] text-white font-extrabold text-sm shadow-md"
>
  <Plus className="w-4 h-4 stroke-[2.5]" />
  <span>Add Your First Patient</span>
</button>
</div>
)}

<div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] space-y-2 mb-4">
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-slate-600">Registered Home:</span>
    <span className="text-xs font-bold text-[#172B4D] text-right">
      {homeLocation.address || 'Not specified'}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-slate-600">Safe-Zone Radius:</span>
    <span className="text-xs font-extrabold text-[#2F6FED]">
      {homeLocation.safeZoneRadius} meters
    </span>
  </div>
  <div className="flex items-center justify-between border-t border-[#CFE1FF] pt-2">
    <span className="text-xs font-bold text-slate-600">Live Status:</span>
    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E7D32]">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      Within Safe Boundary
    </span>
  </div>
</div>

{homeLocation.coordinates?.currentLat && (
  <LiveLocationMap
    currentLat={homeLocation.coordinates.currentLat}
    currentLng={homeLocation.coordinates.currentLng}
    lastUpdate={homeLocation.coordinates.lastUpdate}
    homeLat={homeLocation.coordinates.lat}
    homeLng={homeLocation.coordinates.lng}
    safeZoneRadius={homeLocation.safeZoneRadius}
  />
)}

      {/* EMPTY STATE 2: FILTER / SEARCH YIELDS NO RESULTS */}
      {!assignedPatientsLoading && assignedPatients.length > 0 && filteredPatients.length === 0 && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
            🔍
          </div>
          <h3 className="text-sm font-extrabold text-[#172B4D]">
            No patients match your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No patients found for search query "{searchQuery}" and status filter "{statusFilter}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* RESPONSIVE PATIENT CARDS GRID */}
      {filteredPatients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredPatients.map(patient => (
            <PatientCard
              key={patient.id || patient.patientId}
              patient={patient}
              onViewDetails={(patientId) => {
                selectPatient(patientId);
              }}
              onOpenPortal={(patientId) => {
                openPatientPortal(patientId);
              }}
              onUnlink={(patientId) => {
                unlinkPatientFromCaregiver(patientId);
              }}
            />
          ))}
        </div>
      )}

      {/* ADD PATIENT MODAL */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

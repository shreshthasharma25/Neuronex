import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Pill, Brain, CheckSquare, Bell, User, Heart, Shield, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function Dashboard({ onNavigateTab }) {
  const { patientData, setUserRole, setDifficultyLevel } = useApp();
  const { profile, medicines, todos, brainExercise, cognitiveStats, alerts, homeLocation } = patientData;

  const currentLevel = cognitiveStats?.currentLevel || 1;

  const medsTaken = medicines.filter(m => m.taken).length;
  const totalMeds = medicines.length;

  const todosCompleted = todos.filter(t => t.completed).length;
  const totalTodos = todos.length;

  const pendingAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Patient Profile Card */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {profile.avatar ? (
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
                {profile.fullName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#B45309] text-[10px] sm:text-xs font-bold">
                Called "{profile.preferredName || 'Maa'}"
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
              {profile.age} yrs • {profile.gender} • {profile.language}
            </p>
            <p className="text-xs text-[#2F6FED] font-bold truncate mt-0.5">
              📍 Home: {homeLocation.address || 'Address pending'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('safety')}
          className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#d5e6ff] text-[#2F6FED] text-xs font-bold transition-all w-full sm:w-auto touch-target"
        >
          <span>Safety & Location</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TODAY'S STATUS OVERVIEW GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-[#172B4D] uppercase tracking-wider text-xs">
            Today's Patient Status
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
                brainExercise.dailyCompleted ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-slate-100 text-slate-600'
              }`}>
                {brainExercise.dailyCompleted ? 'Done' : 'Pending'}
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D] block">
              {brainExercise.dailyCompleted ? "Done" : "Pending"}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">
              Brain Exercise
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#2F6FED] h-full rounded-full"
                style={{ width: brainExercise.dailyCompleted ? '100%' : '30%' }}
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

      {/* Quick Launch Action: MEDICINE & CARE SCHEDULE */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2F6FED] to-[#1E4EB8] text-white shadow-lg shadow-[#2F6FED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>Caregiver Daily Care</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
            Manage {profile.preferredName || 'Maa'}'s Care & Schedule
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

      {/* RECENT ACTIVITY & COGNITIVE SNAPSHOT */}
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

          {cognitiveStats.history.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4 text-center">
              No games completed yet today.
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
        </Card>
      </div>

      {/* Switch to Patient View CTA for Demo */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-100 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-600">
          Want to see how this appears to {profile.preferredName || 'Maa'}?
        </span>
        <Button
          onClick={() => setUserRole('patient')}
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

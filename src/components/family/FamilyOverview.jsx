import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldAlert, Sparkles, Brain, Clock, Users, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyOverview({ onNavigateTab }) {
  const { patientData } = useApp();
  const { profile, family, memories, places, alerts, cognitiveStats, brainExercise } = patientData;
  const preferredName = profile.preferredName || 'Maa';

  // Filter alerts relevant to family (safety alerts or alerts having 'family' recipient)
  const familyAlerts = (alerts || []).filter(a =>
    !a.recipients || a.recipients.includes('family') || a.type === 'warning' || a.severity === 'WARNING' || a.severity === 'URGENT'
  );

  const pendingSafetyAlerts = familyAlerts.filter(a => !a.resolved);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Patient Profile Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2F6FED] to-[#1E40AF] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 sm:border-4 border-white/20 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
              🧓
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight truncate">
                {profile.fullName || preferredName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold">
                Loved One
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5 truncate">
              Called: <strong>"{preferredName}"</strong> {profile.age ? `• ${profile.age} yrs` : ''}
            </p>
            <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
              Language: {profile.language || 'English'}
            </p>
          </div>
        </div>

        <div className="bg-white/10 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-white/20 text-left sm:text-right w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-200 uppercase block">
            General Wellbeing
          </span>
          <span className="text-sm sm:text-lg font-extrabold text-white flex items-center justify-start sm:justify-end gap-1.5 mt-0.5">
            <Heart className="w-4 h-4 text-[#FFC857] fill-current" />
            <span>Comfortable & Active</span>
          </span>
        </div>
      </div>

      {/* Safety Alert Warning Callout if any */}
      {pendingSafetyAlerts.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDECEC] border border-rose-300 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0" />
            <span>Safety Alert for Family Attention</span>
          </div>
          {pendingSafetyAlerts.map(alert => (
            <div key={alert.id} className="p-2.5 sm:p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-800">
              <span className="font-bold">{alert.title}</span> — {alert.message}
              <span className="block text-[10px] text-slate-400 mt-0.5">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Personalization Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigateTab('family')}
          className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:border-[#2F6FED] cursor-pointer transition-all"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#2F6FED] mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Family Added</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D]">
            {family.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#2F6FED] block mt-1">
            Manage Family →
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('memories')}
          className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:border-amber-400 cursor-pointer transition-all"
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Memories</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D]">
            {memories.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 block mt-1">
            Keepsakes →
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('places')}
          className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer transition-all"
        >
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Places</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D]">
            {places.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 block mt-1">
            Familiar Spots →
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Daily Exercise</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#172B4D]">
            {brainExercise?.dailyCompleted ? '✓ Done' : 'Pending'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block mt-1">
            Scheduled 10 AM
          </span>
        </div>
      </div>

      {/* Recent Activity & Cognitive Engagement Summary */}
      <Card variant="white" className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-extrabold text-[#172B4D] mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#2F6FED]" />
          <span>Recent Activity & Exercise Engagement</span>
        </h3>

        {cognitiveStats?.history && cognitiveStats.history.length > 0 ? (
          <div className="space-y-2 sm:space-y-2.5">
            {cognitiveStats.history.slice(0, 3).map((h, i) => (
              <div key={h.id || i} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-1.5">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#172B4D]">
                    {h.gameName}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {h.date} • {h.difficulty || 'Level 1'}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[#2F6FED]">
                  {h.accuracy}% Accuracy
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
            No game sessions recorded yet today. {preferredName} can play when ready.
          </div>
        )}
      </Card>

      {/* Role Reminder Note */}
      <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] text-xs text-[#2F6FED] font-medium leading-relaxed">
        💡 <strong>Family Member Scope:</strong> You manage family photos, stories, familiar landmarks, and personal preferences to keep {preferredName}'s world comforting and recognizable. Detailed medication and daily care routine are managed by the Caregiver portal.
      </div>
    </div>
  );
}

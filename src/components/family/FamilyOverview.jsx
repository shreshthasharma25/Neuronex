import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldAlert, Sparkles, Brain, Clock, Users, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import {
  BihuCherawDanceHeader,
  TraditionalGamchaBorder,
  TribalGeometricDivider,
  BambooWeaveDivider,
  OrchidFloraIcon,
  TeaLeafSprig,
  RegionalTextileBorder
} from '../common/CulturalMotifs';

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
      {/* Dynamic Traditional Dance Forms Header: Assamese Bihu & Mizo Cheraw Celebration */}
      <BihuCherawDanceHeader className="rounded-3xl shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Top Row: North-Eastern Dance Landmark Tag */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#BA1A1A]/30 text-[#BA1A1A] text-xs font-black shadow-xs">
              <OrchidFloraIcon className="w-4 h-4" />
              <span>Dynamic Bihu & Cheraw Celebration • Rhythm & Warmth</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF6E5] text-[#B37012] border border-[#F7D59A] text-[10px] sm:text-xs font-extrabold">
              Family Circle
            </span>
          </div>

          {/* Profile Card Container with Terracotta & Muga Silk Accents */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-[#F7D59A] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BA1A1A] via-[#D98A1E] to-[#BA1A1A]" />

            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#BA1A1A]/25 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF6E5] border-2 border-[#F7D59A] flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                  🧓
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight truncate text-[#162832]">
                    {profile.fullName || preferredName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF6E5] text-[#B37012] border border-[#F7D59A] text-[10px] sm:text-xs font-extrabold">
                    Loved One
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5 truncate">
                  Called: <strong>"{preferredName}"</strong> {profile.age ? `• ${profile.age} yrs` : ''}
                </p>
                <p className="text-[11px] sm:text-xs text-[#1E5E3A] font-bold mt-0.5">
                  Language: {profile.language || 'English'}
                </p>
              </div>
            </div>

            <div className="bg-[#FFFDF9] px-4 py-3 rounded-2xl border border-[#F7D59A] text-left sm:text-right w-full sm:w-auto shadow-2xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                General Wellbeing
              </span>
              <span className="text-sm sm:text-base font-black text-[#162832] flex items-center justify-start sm:justify-end gap-1.5 mt-0.5 font-serif">
                <Heart className="w-4 h-4 text-[#BA1A1A] fill-current" />
                <span>Comfortable & Active</span>
              </span>
            </div>
          </div>
        </div>
      </BihuCherawDanceHeader>

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

      {/* Traditional Tribal Geometric Divider */}
      <TribalGeometricDivider height={8} className="my-1" />

      {/* Personalization Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigateTab('family')}
          className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border-2 border-[#C3E2CD] shadow-2xs hover:border-[#1E5E3A] hover:shadow-md cursor-pointer transition-all"
        >
          <Users className="w-5 h-5 text-[#1E5E3A] mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Family Added</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif">
            {family.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#1E5E3A] block mt-1">
            Manage Family →
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('memories')}
          className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border-2 border-[#F7D59A] shadow-2xs hover:border-[#D98A1E] hover:shadow-md cursor-pointer transition-all"
        >
          <Heart className="w-5 h-5 text-[#D98A1E] mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Memories</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif">
            {memories.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#D98A1E] block mt-1">
            Keepsakes →
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('places')}
          className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border-2 border-[#C3E2CD] shadow-2xs hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
        >
          <MapPin className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Places</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif">
            {places.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 block mt-1">
            Familiar Spots →
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 shadow-2xs">
          <Brain className="w-5 h-5 text-[#2E6B52] mb-1" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">Daily Exercise</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif">
            {brainExercise?.dailyCompleted ? '✓ Done' : 'Pending'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 block mt-1">
            Scheduled 10 AM
          </span>
        </div>
      </div>

      {/* Traditional Bamboo Weave Divider */}
      <BambooWeaveDivider height={6} className="my-1" />

      {/* Recent Activity & Cognitive Engagement Summary */}
      <Card variant="white" className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-extrabold text-[#162832] mb-3 flex items-center gap-2">
          <TeaLeafSprig className="w-4 h-4" color="#1E5E3A" />
          <span>Recent Activity & Exercise Engagement</span>
        </h3>

        {cognitiveStats?.history && cognitiveStats.history.length > 0 ? (
          <div className="space-y-2 sm:space-y-2.5">
            {cognitiveStats.history.slice(0, 3).map((h, i) => (
              <div key={h.id || i} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-1.5">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#162832]">
                    {h.gameName}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {h.date} • {h.difficulty || 'Level 1'}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[#1E5E3A]">
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
      <div className="p-4 rounded-2xl bg-[#EBF5EE] border border-[#D8E2D9] text-xs text-[#1E5E3A] font-medium leading-relaxed">
        💡 <strong>Family Member Scope:</strong> You manage family photos, stories, familiar landmarks, and personal preferences to keep {preferredName}'s world comforting and recognizable. Detailed medication and daily care routine are managed by the Caregiver portal.
      </div>

      {/* Authentic Assamese Traditional Gamcha Border with Fringes */}
      <div className="pt-2">
        <TraditionalGamchaBorder height={12} showFringes={true} />
      </div>
    </div>
  );
}

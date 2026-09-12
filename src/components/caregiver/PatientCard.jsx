import React from 'react';
import { User, Brain, Activity, Clock, ArrowRight, AlertCircle, Pill, ShieldAlert } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function PatientCard({ patient, onViewDetails, onOpenPortal, onUnlink }) {
  if (!patient) return null;

  const {
    id,
    patientId,
    fullName = 'Unnamed Patient',
    preferredName,
    age,
    gender,
    language,
    avatar,
    cognitiveStats,
    latestGameName,
    latestGameAccuracy,
    recentActivity,
    todayGamesCount = 0,
    unresolvedAlertsCount = 0,
    medicinesCount = 0,
    medicinesTakenCount = 0,
    status = {},
  } = patient;

  const realId = id || patientId;
  const gamesCompleted = cognitiveStats?.gamesCompleted || cognitiveStats?.history?.length || 0;
  const averageAccuracy = cognitiveStats?.averageAccuracy;
  const currentLevel = cognitiveStats?.currentLevel || 1;

  const handleViewClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    sounds.playGentleTap();
    if (onViewDetails) {
      onViewDetails(realId);
    }
  };

  const handlePortalClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    sounds.playGentleTap();
    if (onOpenPortal) {
      onOpenPortal(realId);
    } else if (onViewDetails) {
      onViewDetails(realId);
    }
  };

  return (
    <div
      onClick={handleViewClick}
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-[#2F6FED]/50 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewClick(e);
        }
      }}
    >
      {/* Top Card Header: Profile Info & Status Badge */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-2.5 mb-3">
          {/* Avatar & Patient Names */}
          <div className="flex items-center gap-3 min-w-0">
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF2FF] border-2 border-[#2F6FED]/20 text-[#2F6FED] flex items-center justify-center font-black text-lg flex-shrink-0">
                {fullName.charAt(0) || <User className="w-6 h-6" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-[#172B4D] truncate group-hover:text-[#2F6FED] transition-colors">
                  {fullName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {preferredName && preferredName !== fullName ? `Called "${preferredName}" • ` : ''}
                {age ? `${age} yrs` : 'Age pending'}
                {gender ? ` • ${gender}` : ''}
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                ID: {realId}
              </p>
            </div>
          </div>

          {/* Status Indicator Pill */}
          <div className="flex-shrink-0 text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                status.badgeClass || 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={status.reason || status.label}
            >
              <span className={`w-2 h-2 rounded-full ${status.dotClass || 'bg-slate-400'}`} />
              <span>{status.label || 'Stable'}</span>
            </span>
          </div>
        </div>

        {/* Status Reason Explanation */}
        {status.reason && (
          <div className="mb-3.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600 font-medium leading-relaxed">
            <span className="text-slate-400 flex-shrink-0 mt-0.5">ℹ️</span>
            <span className="line-clamp-2">{status.reason}</span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          {/* Cognitive Score / Accuracy */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Cognitive Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              {averageAccuracy !== undefined && averageAccuracy > 0 ? (
                <>
                  <span className="text-base sm:text-lg font-black text-[#172B4D]">
                    {averageAccuracy}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    (L{currentLevel})
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">
                  No data yet
                </span>
              )}
            </div>
          </div>

          {/* Games Completed */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Games Played
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-[#172B4D]">
                {gamesCompleted}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {todayGamesCount > 0 ? `(${todayGamesCount} today)` : 'total'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Performance & Activity Row */}
        <div className="mt-3 space-y-1.5 text-xs">
          {/* Recent Game Performance */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-[#2F6FED]" />
              <span>Recent Exercise:</span>
            </span>
            <span className="font-bold text-[#172B4D] truncate max-w-[140px] text-right">
              {latestGameName ? (
                <>
                  {latestGameName} {latestGameAccuracy !== null ? `(${latestGameAccuracy}%)` : ''}
                </>
              ) : (
                <span className="text-slate-400 italic font-normal">None recorded</span>
              )}
            </span>
          </div>

          {/* Recent Activity Timestamp */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Recent Activity:</span>
            </span>
            <span className="font-bold text-slate-700 text-right truncate">
              {recentActivity || 'No recent activity'}
            </span>
          </div>

          {/* Alert & Medicine status indicators if relevant */}
          {(unresolvedAlertsCount > 0 || medicinesCount > 0) && (
            <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px]">
              {unresolvedAlertsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{unresolvedAlertsCount} Alert{unresolvedAlertsCount > 1 ? 's' : ''}</span>
                </span>
              )}
              {medicinesCount > 0 && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold border ${
                  medicinesTakenCount === medicinesCount
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Pill className="w-3 h-3" />
                  <span>{medicinesTakenCount}/{medicinesCount} Meds</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleViewClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2F6FED] hover:bg-[#2557be] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all touch-target"
          title={`View details for ${fullName}`}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handlePortalClick}
          className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-[#EAF2FF] hover:bg-[#dbe7ff] text-[#2F6FED] border border-[#CFE1FF] active:scale-[0.99] font-extrabold text-xs sm:text-sm shadow-xs transition-all touch-target"
          title={`Open ${preferredName || fullName}'s Patient Portal`}
        >
          <span>Portal 🧓</span>
        </button>
      </div>
    </div>
  );
}

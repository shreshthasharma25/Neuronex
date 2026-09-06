import React from 'react';
import Card from '../common/Card';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Info } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyAlerts() {
  const { patientData, resolveAlert } = useApp();
  const { alerts, profile } = patientData;
  const preferredName = profile.preferredName || 'Maa';

  // Filter alerts intended for family or general safety
  const familyAlerts = (alerts || []).filter(a =>
    !a.recipients || a.recipients.includes('family') || a.type === 'warning' || a.severity === 'WARNING' || a.severity === 'URGENT'
  );

  const getSeverityBadge = (severity, type) => {
    const sev = (severity || (type === 'warning' ? 'WARNING' : 'INFO')).toUpperCase();
    switch (sev) {
      case 'URGENT':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold">URGENT</span>;
      case 'WARNING':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">WARNING</span>;
      case 'UPCOMING':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">UPCOMING</span>;
      case 'INFO':
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">INFO</span>;
    }
  };

  const handleAcknowledge = (id) => {
    sounds.playGentleTap();
    resolveAlert(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF8E1] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider">
            Family Awareness Stream
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Safety & Care Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Shared notifications regarding {preferredName}'s safety, safe-zone boundaries, and essential care events.
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-amber-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0 self-start sm:self-auto">
          🔔
        </div>
      </div>

      {familyAlerts.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            ✅
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            All Calm & Clear
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            No active safety alerts for {preferredName}.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {familyAlerts.map(alert => {
            const isWarning = alert.type === 'warning' || alert.severity === 'WARNING' || alert.severity === 'URGENT';
            return (
              <div
                key={alert.id}
                className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  alert.resolved
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : isWarning
                    ? 'bg-[#FDECEC] border-rose-300 shadow-sm'
                    : 'bg-[#E8F5E9] border-[#C8E6C9]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 mt-0.5 ${
                    isWarning ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-[#2E7D32]'
                  }`}>
                    {isWarning ? '⚠️' : '✓'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h4 className={`text-sm sm:text-base font-extrabold ${isWarning ? 'text-rose-900' : 'text-[#2E7D32]'}`}>
                        {alert.title}
                      </h4>
                      {getSeverityBadge(alert.severity, alert.type)}
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">
                        • {alert.time}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {!alert.resolved && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="w-full sm:w-auto text-center justify-center px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm flex-shrink-0 touch-target flex items-center"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

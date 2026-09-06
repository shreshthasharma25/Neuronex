import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle2, ShieldAlert, Pill, Brain, Clock, BellRing, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function AlertCenter() {
  const { patientData, resolveAlert, triggerSafetyAlert } = useApp();
  const { alerts, profile } = patientData;
  const preferredName = profile.preferredName || 'Maa';

  const handleResolveAlert = (id) => {
    sounds.playGentleTap();
    resolveAlert(id);
  };

  const handleSimulateGeofence = () => {
    triggerSafetyAlert({
      title: '⚠️ Geofence Boundary Alert',
      message: `${preferredName} has moved approximately 620m from home (exceeding the 500m safe zone). Broadcast sent to Caregiver & Family Member.`,
      severity: 'URGENT',
      recipients: ['caregiver', 'family']
    });
  };

  const handleSimulateMissedMed = () => {
    triggerSafetyAlert({
      title: '💊 Medication Unconfirmed',
      message: `Morning Medicine scheduled for 8:00 AM has not been confirmed as taken.`,
      severity: 'WARNING',
      recipients: ['caregiver', 'family']
    });
  };

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

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF8E1] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Safety & Care Alerts
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Caregiver Alert Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Real-time notifications for medicines, safety geofencing, and routine check-ins
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-amber-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm self-start sm:self-auto flex-shrink-0">
          🔔
        </div>
      </div>

      {/* Simulator Tools for Hackathon Demo */}
      <Card variant="white" className="p-4 sm:p-5 border-2 border-dashed border-amber-200 bg-amber-50/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-extrabold text-[#172B4D]">
              ⚡ Hackathon Demo Alert Simulators
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Trigger instant real-time safety scenarios to demonstrate caregiver protection
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2.5">
          <Button
            onClick={handleSimulateGeofence}
            size="sm"
            variant="emergency"
            icon={ShieldAlert}
            className="w-full sm:w-auto"
          >
            Simulate Safe-Zone Breach
          </Button>

          <Button
            onClick={handleSimulateMissedMed}
            size="sm"
            variant="secondary"
            icon={Pill}
            className="w-full sm:w-auto"
          >
            Simulate Missed Medicine
          </Button>
        </div>
      </Card>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 text-center">
            <span className="text-3xl mb-2 block">✅</span>
            <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">All Calm & Clear</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              No pending alerts. {preferredName} is on schedule and within the safe zone.
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const isWarning = alert.type === 'warning';
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
                <div className="flex items-start gap-3">
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
                    onClick={() => handleResolveAlert(alert.id)}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm flex-shrink-0 text-center"
                  >
                    Mark Acknowledged
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

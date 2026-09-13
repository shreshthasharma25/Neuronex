import React from 'react';
import { Users, Activity, AlertTriangle, AlertCircle } from 'lucide-react';

export default function PatientSummaryBar({ summary, onFilterStatus, activeFilter }) {
  const {
    totalPatients = 0,
    stableCount = 0,
    needsAttentionCount = 0,
    higherAttentionCount = 0,
  } = summary || {};

  const items = [
    {
      id: 'total',
      label: 'Total Patients',
      value: totalPatients,
      icon: Users,
      iconBg: 'bg-[#EBF5EE] text-[#1E5E3A]',
      borderHover: 'hover:border-[#1E5E3A]',
      filterKey: 'all',
    },
    {
      id: 'stable',
      label: 'Stable Patients',
      value: stableCount,
      icon: Activity,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderHover: 'hover:border-emerald-500',
      filterKey: 'stable',
    },
    {
      id: 'attention',
      label: 'Needs Attention',
      value: needsAttentionCount,
      icon: AlertTriangle,
      iconBg: needsAttentionCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500',
      borderHover: 'hover:border-amber-500',
      badge: needsAttentionCount > 0 ? `${needsAttentionCount} Review` : null,
      filterKey: 'needs_attention',
    },
    {
      id: 'higher_attention',
      label: 'Higher Attention',
      value: higherAttentionCount,
      icon: AlertCircle,
      iconBg: higherAttentionCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500',
      borderHover: 'hover:border-rose-500',
      badge: higherAttentionCount > 0 ? `${higherAttentionCount} Urgent` : null,
      filterKey: 'high_attention',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
      {items.map(item => {
        const Icon = item.icon;
        const isClickable = Boolean(item.filterKey && onFilterStatus);
        const isActive = activeFilter === item.filterKey || (item.filterKey === 'high_attention' && activeFilter === 'higher_attention');

        return (
          <div
            key={item.id}
            onClick={() => isClickable && onFilterStatus(item.filterKey)}
            className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border transition-all duration-200 ${
              isActive
                ? 'border-[#1E5E3A] ring-2 ring-[#1E5E3A]/20 shadow-md'
                : 'border-[#D8E2D9] shadow-xs'
            } ${isClickable ? 'cursor-pointer ' + item.borderHover : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white animate-pulse ${
                  item.id === 'higher_attention' ? 'bg-rose-600' : 'bg-amber-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#162832] tracking-tight">
              {item.value}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500 truncate mt-0.5">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

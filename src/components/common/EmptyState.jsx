import React from 'react';
import Button from './Button';
import { useApp } from '../../context/AppContext';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText = null,
  onAction = null,
  showSwitchToCaregiver = true,
  className = ''
}) {
  const { setUserRole, setCaregiverTab } = useApp();

  const handleSwitchToCaregiver = () => {
    setUserRole('caregiver');
    setCaregiverTab('personalize');
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-[#D8E2D9] rounded-3xl ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EBF5EE] text-[#1E5E3A] border border-[#D8E2D9] flex items-center justify-center mb-4 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-xl font-bold text-[#162832] mb-2">{title}</h4>
      <p className="text-base text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button onClick={onAction} size="md" variant="secondary" className="mb-3">
          {actionText}
        </Button>
      )}

      {showSwitchToCaregiver && (
        <button
          onClick={handleSwitchToCaregiver}
          className="text-sm font-bold text-[#1E5E3A] hover:underline flex items-center gap-1.5 p-2"
        >
          <span>👩👧 Switch to Caregiver to add this now →</span>
        </button>
      )}
    </div>
  );
}

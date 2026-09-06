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
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-slate-200 rounded-3xl ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-xl font-bold text-[#172B4D] mb-2">{title}</h4>
      <p className="text-base text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button onClick={onAction} size="md" variant="secondary" className="mb-3">
          {actionText}
        </Button>
      )}

      {showSwitchToCaregiver && (
        <button
          onClick={handleSwitchToCaregiver}
          className="text-sm font-bold text-[#2F6FED] hover:underline flex items-center gap-1.5 p-2"
        >
          <span>👩👧 Switch to Caregiver to add this now →</span>
        </button>
      )}
    </div>
  );
}

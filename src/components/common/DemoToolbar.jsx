import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  LogOut,
  Copy,
  Check,
  Globe,
  ChevronDown
} from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function DemoToolbar() {
  const {
    isOnboarded,
    userRole,
    setUserRole,
    currentUser,
    isDemoMode,
    patientId,
    viewMode,
    setViewMode,
    resetToDemoData,
    resetToEmptyData,
    logoutOrSwitchUser,
    patientData,
    language,
    setLanguage,
    SUPPORTED_LANGUAGES,
    t
  } = useApp();

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyPatientId = () => {
    if (!patientId) return;
    navigator.clipboard?.writeText(patientId);
    sounds.playSuccess();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSwitchUser = () => {
    sounds.playGentleTap();
    logoutOrSwitchUser();
  };

  const handleLanguageChange = (e) => {
    sounds.playGentleTap();
    setLanguage(e.target.value);
  };

  return (
    <header className="w-full bg-[#172B4D] text-white py-2 px-3 sm:px-4 shadow-md sticky top-0 z-40 overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
        {/* Brand & Project Identity + Demo Badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🧠</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide text-white text-base">
              {t('brand.name')}
            </span>
            {isDemoMode && (
              <span className="px-2 py-0.5 rounded-md bg-[#FFC857] text-[#172B4D] font-extrabold text-[10px] tracking-wider uppercase shadow-sm">
                {t('brand.demoMode')}
              </span>
            )}
          </div>
        </div>

        {/* Center: Role Switcher Pill & Patient ID (visible when onboarded) */}
        {isOnboarded && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Patient ID with Copy Button */}
            {patientId && (
              <button
                type="button"
                onClick={handleCopyPatientId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
                title="Click to copy Patient ID to connect family or caregiver"
              >
                <span className="text-slate-400 font-medium">{t('brand.patientId')}</span>
                <span className="font-mono font-bold text-[#FFC857]">{patientId}</span>
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            )}

            {/* Role Switcher Pill (3 Distinct Roles) */}
            <div className="flex items-center bg-[#0F172A] p-0.5 sm:p-1 rounded-full border border-slate-700 max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setUserRole('patient')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  userRole === 'patient'
                    ? 'bg-[#2F6FED] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🧓</span>
                <span className="inline sm:hidden">{patientData.profile?.preferredName || 'Maa'}</span>
                <span className="hidden sm:inline">{t('brand.patientRole')} ({patientData.profile?.preferredName || 'Maa'})</span>
              </button>

              <button
                onClick={() => setUserRole('family')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  userRole === 'family'
                    ? 'bg-[#2F6FED] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>👨‍👩‍👧</span>
                <span>{t('brand.familyRole')}</span>
              </button>

              <button
                onClick={() => setUserRole('caregiver')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-all text-xs whitespace-nowrap ${
                  userRole === 'caregiver'
                    ? 'bg-[#FFC857] text-[#172B4D] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🩺</span>
                <span>{t('brand.caregiverRole')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Right side: Language Selector & Presentation Controls */}
        <div className="flex items-center gap-2">
          {/* Universal Language Selector Dropdown */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-[#FFC857]" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-1"
              title="Change entire application language"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-[#172B4D] text-white">
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Switch User / Logout button (Safe return to "Who are you?" without wiping data) */}
          {isOnboarded && (
            <button
              onClick={handleSwitchUser}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs border border-slate-700 font-semibold transition-colors"
              title="Return to 'Who are you?' screen to log in as another role without deleting patient data"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FFC857]" />
              <span className="hidden sm:inline">{t('brand.switchUser')}</span>
            </button>
          )}

          {/* Frame Toggle */}
          <button
            onClick={() => setViewMode(prev => prev === 'mobile-frame' ? 'full-screen' : 'mobile-frame')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
            title="Toggle Mobile Simulator vs Full Width"
          >
            {viewMode === 'mobile-frame' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>{t('brand.fullWidth')}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#FFC857]" />
                <span>{t('brand.phoneFrame')}</span>
              </>
            )}
          </button>

          {/* Quick Demo Preload */}
          <button
            onClick={resetToDemoData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2F6FED]/20 hover:bg-[#2F6FED]/40 text-[#93C5FD] hover:text-white text-xs border border-[#2F6FED]/40 font-semibold"
            title="Load full scenario with Maa, Priya, Dr. Bose, memories & medicines"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
            <span className="hidden sm:inline">{t('brand.loadDemo')}</span>
            <span className="sm:hidden">{t('brand.demo')}</span>
          </button>

          {/* Reset to Empty State */}
          <button
            onClick={resetToEmptyData}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-xs border border-slate-700"
            title="Start from clean zero to test registration flows and empty states"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('brand.resetAll')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}


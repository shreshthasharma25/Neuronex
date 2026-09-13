import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';
import { GamosaRibbon, RegionalTextileBorder, SubtleMistyMountains, TeaLeafSprig } from '../common/CulturalMotifs';
import { NeuronexSymbol } from '../common/NeuronexLogo';

export default function RoleSelection({ onSelectRole }) {
  const { t } = useApp();

  const handleSelect = (role) => {
    sounds.playGentleTap();
    if (onSelectRole) onSelectRole(role);
  };

  return (
    <div className="flex flex-col justify-between min-h-[580px] h-full bg-gradient-to-b from-[#FFFDF9] via-[#F4F9F4] to-[#EAF3EC] rounded-4xl overflow-hidden relative select-none border-2 border-[#C3E2CD] shadow-xl">
      {/* Subtle Misty Mountain Silhouette Background */}
      <SubtleMistyMountains />

      {/* Top Subtle Woven Thread Accent */}
      <RegionalTextileBorder height={3} />

      <div className="p-5 sm:p-7 flex-1 z-10">
        <div className="text-center mb-6 pt-1">
          <div className="flex justify-center mb-2.5">
            <NeuronexSymbol size={48} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[#1E5E3A] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#C3E2CD] shadow-2xs backdrop-blur-xs">
            <TeaLeafSprig className="w-3.5 h-3.5" />
            <span>Digital Journey Through the North-East</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#162832] tracking-tight">
            {t('roleSelection.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 max-w-sm mx-auto">
            {t('roleSelection.subtitle')}
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Option 1: PATIENT */}
          <button
            type="button"
            onClick={() => handleSelect('patient')}
            className="w-full text-left group p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white via-[#FAFDFB] to-[#F2F8F4] border-2 border-[#1E5E3A]/30 hover:border-[#1E5E3A] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#1E5E3A]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EBF5EE] to-[#D8E2D9] text-[#1E5E3A] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs border-2 border-[#1E5E3A]/20">
                🧓
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg sm:text-xl font-extrabold font-serif text-[#162832] tracking-tight">
                    {t('roleSelection.patientTitle')}
                  </h3>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#1E5E3A] mb-1">
                  {t('roleSelection.patientQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.patientDesc')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#EBF5EE] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E5E3A] group-hover:text-white transition-all border border-[#C3E2CD] shadow-2xs">
                <ArrowRight className="w-5 h-5 text-[#1E5E3A] group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          {/* Option 2: FAMILY MEMBER */}
          <button
            type="button"
            onClick={() => handleSelect('family')}
            className="w-full text-left group p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white via-[#FAFDFB] to-[#F5FAF6] border-2 border-[#2D7D4B]/30 hover:border-[#2D7D4B] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#2D7D4B]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EBF5EE] to-[#C3E2CD] text-[#2D7D4B] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs border-2 border-[#2D7D4B]/20">
                👨‍👩‍👧
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg sm:text-xl font-extrabold font-serif text-[#162832] tracking-tight">
                    {t('roleSelection.familyTitle')}
                  </h3>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#2D7D4B] mb-1">
                  {t('roleSelection.familyQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.familyDesc')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#EBF5EE] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D7D4B] group-hover:text-white transition-all border border-[#C3E2CD] shadow-2xs">
                <ArrowRight className="w-5 h-5 text-[#2D7D4B] group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          {/* Option 3: CAREGIVER */}
          <button
            type="button"
            onClick={() => handleSelect('caregiver')}
            className="w-full text-left group p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white via-[#FFFDF9] to-[#FFFBF2] border-2 border-[#D98A1E]/30 hover:border-[#D98A1E] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#D98A1E]/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFF6E5] to-[#FBEED7] text-[#D98A1E] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs border-2 border-[#D98A1E]/20">
                🩺
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg sm:text-xl font-extrabold font-serif text-[#162832] tracking-tight">
                    {t('roleSelection.caregiverTitle')}
                  </h3>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#D98A1E] mb-1">
                  {t('roleSelection.caregiverQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.caregiverDesc')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6E5] flex items-center justify-center flex-shrink-0 group-hover:bg-[#D98A1E] group-hover:text-white transition-all border border-[#F7D59A] shadow-2xs">
                <ArrowRight className="w-5 h-5 text-[#D98A1E] group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Helper Footnote */}
      <div className="p-4 bg-white/70 backdrop-blur-xs border-t border-[#C3E2CD] text-center">
        <p className="text-xs text-slate-600 font-semibold">
          🔒 {t('roleSelection.footnote')}
        </p>
      </div>
    </div>
  );
}

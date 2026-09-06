import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';

export default function RoleSelection({ onSelectRole }) {
  const { t } = useApp();

  const handleSelect = (role) => {
    sounds.playGentleTap();
    if (onSelectRole) onSelectRole(role);
  };

  return (
    <div className="flex flex-col justify-between min-h-[580px] h-full p-6 sm:p-8 bg-gradient-to-b from-[#FAFBFD] to-white rounded-3xl">
      <div>
        <div className="text-center mb-6 pt-2">
          <span className="text-4xl mb-2 block">🧠</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            {t('roleSelection.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            {t('roleSelection.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {/* Option 1: PATIENT */}
          <button
            type="button"
            onClick={() => handleSelect('patient')}
            className="w-full text-left group p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#2F6FED]/20 hover:border-[#2F6FED] hover:shadow-lg hover:bg-[#F4F8FF] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#2F6FED]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                🧓
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-xl font-extrabold text-[#172B4D] tracking-tight">
                    {t('roleSelection.patientTitle')}
                  </h3>
                </div>
                <div className="text-sm font-bold text-[#2F6FED] mb-1">
                  {t('roleSelection.patientQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.patientDesc')}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EAF2FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2F6FED] group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5 text-[#2F6FED] group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          {/* Option 2: FAMILY MEMBER */}
          <button
            type="button"
            onClick={() => handleSelect('family')}
            className="w-full text-left group p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#2F6FED]/30 hover:border-[#2F6FED] hover:shadow-lg hover:bg-[#F4F8FF] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#2F6FED]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                👨‍👩‍👧
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-xl font-extrabold text-[#172B4D] tracking-tight">
                    {t('roleSelection.familyTitle')}
                  </h3>
                </div>
                <div className="text-sm font-bold text-[#2F6FED] mb-1">
                  {t('roleSelection.familyQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.familyDesc')}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EAF2FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2F6FED] group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5 text-[#2F6FED] group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          {/* Option 3: CAREGIVER */}
          <button
            type="button"
            onClick={() => handleSelect('caregiver')}
            className="w-full text-left group p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#FFC857]/60 hover:border-[#FFC857] hover:shadow-lg hover:bg-[#FFFDF5] transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] touch-target focus:outline-none focus:ring-4 focus:ring-[#FFC857]/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8E1] text-[#B45309] flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                🩺
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-xl font-extrabold text-[#172B4D] tracking-tight">
                    {t('roleSelection.caregiverTitle')}
                  </h3>
                </div>
                <div className="text-sm font-bold text-[#B45309] mb-1">
                  {t('roleSelection.caregiverQuote')}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('roleSelection.caregiverDesc')}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FFF8E1] flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFC857] group-hover:text-[#172B4D] transition-colors">
                <ArrowRight className="w-5 h-5 text-[#B45309] group-hover:text-[#172B4D] transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Helper Footnote */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center mt-4">
        <p className="text-xs text-slate-600 font-medium">
          🔒 {t('roleSelection.footnote')}
        </p>
      </div>
    </div>
  );
}

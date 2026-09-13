import React from 'react';
import { ArrowLeft, Volume2, Sparkles, Mountain } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import {
  RegionalTextileBorder,
  TeaLeafSprig,
  SubtleMistyMountains
} from '../common/CulturalMotifs';

export default function GameContainer({
  title,
  subtitle,
  onExit,
  children,
  instructionText = null
}) {
  const handleSpeak = () => {
    if (instructionText) {
      sounds.speak(instructionText);
    } else {
      sounds.speak(`${title}. ${subtitle || ''}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5FAF6] relative overflow-hidden">
      {/* Ambient Misty Mountain Horizon Silhouette */}
      <SubtleMistyMountains opacity="opacity-20" />

      {/* Game Sanctuary Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#D8E2D9] sticky top-0 z-20 shadow-xs">
        <RegionalTextileBorder height={4} />
        <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          {/* Exit Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#162832] bg-slate-100 hover:bg-[#EBF5EE] transition-all font-black text-xs touch-target border border-slate-200"
            aria-label="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit</span>
          </button>

          {/* Title & Stage */}
          <div className="text-center flex-1 px-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#C68215]">
              <TeaLeafSprig className="w-3 h-3 text-[#1E5E3A]" />
              <span>North-East Cognitive Sanctuary</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#162832] font-display truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#1E5E3A] font-extrabold truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Audio Instructions Button */}
          <button
            onClick={handleSpeak}
            className="p-2.5 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] hover:bg-[#D8E2D9] transition-colors touch-target border border-[#C3E2CD]"
            title="Listen to instructions"
            aria-label="Listen to instructions"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Game Play Sanctuary Stage (Accessible & Elderly Focused) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-md mx-auto w-full relative z-10 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>

        {/* Reassuring Footer in Gameplay */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[11px] text-slate-400 font-semibold">
            Take all the time you need • Breathe peacefully 🌿
          </p>
        </div>
      </div>
    </div>
  );
}


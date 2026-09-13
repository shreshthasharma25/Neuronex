import React from 'react';
import Button from '../common/Button';
import NeuronexLogo from '../common/NeuronexLogo';
import { GamosaRibbon, SubtleMistyMountains, SevenSistersBadge } from '../common/CulturalMotifs';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[580px] h-full text-center bg-[#F7F8F5] rounded-3xl overflow-hidden relative select-none">
      {/* Subtle Misty Mountain Silhouette Background */}
      <SubtleMistyMountains />

      {/* Understated Woven Thread Accent at Top */}
      <GamosaRibbon height={3} />

      {/* Top Regional Badge */}
      <div className="pt-5 px-4 z-10">
        <SevenSistersBadge />
      </div>

      {/* Main Hero & Official Brand Mark */}
      <div className="flex flex-col items-center my-auto py-6 px-6 z-10 max-w-lg mx-auto">
        <NeuronexLogo variant="full" size="xl" showTagline={false} className="mb-4" />

        <h1 className="text-2xl sm:text-3xl font-black text-[#162832] tracking-tight mb-2 font-sans">
          Daily Memory & Care Companion
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
          Thoughtfully crafted for elderly cognitive health in North East India. Supporting daily routines, familiar memories, and safe connection with loved ones.
        </p>

        {/* Reassuring Care Pillars */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-sm mt-6">
          <div className="flex flex-col items-center p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#D8E2D9] shadow-2xs min-w-0">
            <span className="text-xl sm:text-2xl mb-1">❤️</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-[#162832] text-center">Family</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#D8E2D9] shadow-2xs min-w-0">
            <span className="text-xl sm:text-2xl mb-1">🏠</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-[#162832] text-center">Safe Home</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#D8E2D9] shadow-2xs min-w-0">
            <span className="text-xl sm:text-2xl mb-1">🧠</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-[#162832] text-center">Brain Play</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-sm px-6 pb-6 z-10">
        <Button
          onClick={onStart}
          size="xl"
          fullWidth
          className="shadow-md shadow-[#1E5E3A]/20 text-lg font-extrabold bg-[#1E5E3A] hover:bg-[#143B30] text-white"
        >
          GET STARTED →
        </Button>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Dementia-friendly • Accessible • Seven Sisters Region
        </p>
      </div>

      {/* Bottom Subtle Woven Thread Accent */}
      <GamosaRibbon height={3} />
    </div>
  );
}

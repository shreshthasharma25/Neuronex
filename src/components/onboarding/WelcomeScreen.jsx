import React from 'react';
import Button from '../common/Button';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[580px] h-full p-6 sm:p-8 text-center bg-gradient-to-b from-[#EAF2FF] via-white to-[#FAFBFD] rounded-3xl">
      {/* Top Badge */}
      <div className="pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#2F6FED]/20 shadow-sm text-[#2F6FED] font-bold text-sm">
          <Sparkles className="w-4 h-4 text-[#FFC857]" />
          <span>NeuroNex Companion</span>
        </div>
      </div>

      {/* Main Hero & Logo */}
      <div className="flex flex-col items-center my-auto py-6">
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#2F6FED] text-white flex items-center justify-center shadow-xl shadow-[#2F6FED]/25">
            <span className="text-6xl">🧠</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#FFC857] text-[#172B4D] flex items-center justify-center shadow-md border-2 border-white">
            <Heart className="w-5 h-5 fill-current text-rose-500" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#172B4D] tracking-tight mb-3">
          Your Daily Memory Companion
        </h1>
        
        <p className="text-base sm:text-xl text-slate-600 max-w-md font-medium leading-relaxed">
          Helping you remember, stay safe, and stay warmly connected every single day.
        </p>

        {/* Reassuring Pillars */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm mt-8">
          <div className="flex flex-col items-center p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-0">
            <span className="text-xl sm:text-2xl mb-1">❤️</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center">Family</span>
          </div>
          <div className="flex flex-col items-center p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-0">
            <span className="text-xl sm:text-2xl mb-1">🏠</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center">Safe Home</span>
          </div>
          <div className="flex flex-col items-center p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-0">
            <span className="text-xl sm:text-2xl mb-1">🧠</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center">Brain Play</span>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-sm pb-4">
        <Button
          onClick={onStart}
          size="xl"
          fullWidth
          className="shadow-lg shadow-[#2F6FED]/25"
        >
          GET STARTED →
        </Button>
        <p className="text-xs text-slate-400 mt-3">
          Calm, simple, and designed with care for elderly minds.
        </p>
      </div>
    </div>
  );
}

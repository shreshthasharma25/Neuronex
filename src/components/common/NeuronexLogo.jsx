import React from 'react';

/**
 * NeuronexLogo - Official Brand Mark for NeuroNex Cognitive Care
 * Subtly communicates:
 * 1. Cognition & Memory: Gentle neural/brain synaptic arches
 * 2. North Eastern Landscape: Elegant sub-Himalayan mountain ridge silhouette at the base
 * 3. Seven Sisters Reference: 7 refined constellation dots honoring the North Eastern states
 * 
 * Variants:
 * - 'full': Complete lockup with symbol, brand typography, and regional subtitle (Welcome/Onboarding)
 * - 'compact': Inline lockup for app headers and navigation bars
 * - 'mark': Symbol only for badges, small icons, or avatar housings
 */

export function SevenSistersMark({ className = 'w-4 h-4', color = '#C68215' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Seven Sisters Region of North East India"
      aria-label="Seven Sisters Emblem"
    >
      {/* 7 Connected Points honoring the 7 North Eastern States: Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura */}
      <circle cx="12" cy="4" r="1.75" fill={color} />
      <circle cx="6.5" cy="8" r="1.5" fill={color} />
      <circle cx="17.5" cy="8" r="1.5" fill={color} />
      <circle cx="4" cy="14" r="1.5" fill={color} />
      <circle cx="20" cy="14" r="1.5" fill={color} />
      <circle cx="8" cy="19" r="1.5" fill={color} />
      <circle cx="16" cy="19" r="1.5" fill={color} />

      {/* Subtle organic connective lines */}
      <path
        d="M6.5,8 L12,4 L17.5,8 M4,14 L6.5,8 M17.5,8 L20,14 M4,14 L8,19 M20,14 L16,19 M8,19 L16,19"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NeuronexSymbol({ size = 40, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5E3A] via-[#1B4D3E] to-[#143B30] text-white shadow-sm flex-shrink-0 border border-white/20 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-3/4 h-3/4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle glow circle */}
        <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Cognitive Synapse / Brain Arches merging with Mountain Silhouettes */}
        {/* Left Neural Mountain Peak */}
        <path
          d="M10,34 C11,26 15,20 20,20 C22,20 23.5,21.5 24,24 C24.5,21.5 26,20 28,20 C33,20 37,26 38,34"
          stroke="#EBF5EE"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Memory Ridge Flow */}
        <path
          d="M14,34 C15,28 18,25 21,25 C23,25 23.5,26.5 24,28 C24.5,26.5 25,25 27,25 C30,25 33,28 34,34"
          stroke="#C3E2CD"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mountain Base Line (Calm Brahmaputra Valley Baseline) */}
        <path
          d="M8,35.5 L40,35.5"
          stroke="#C68215"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Seven Sisters Micro-Constellation Crown (7 gentle memory points) */}
        <circle cx="12" cy="15" r="1.2" fill="#FFF6E5" />
        <circle cx="16" cy="12" r="1.2" fill="#FFF6E5" />
        <circle cx="20" cy="10" r="1.3" fill="#FFF6E5" />
        <circle cx="24" cy="9" r="1.6" fill="#C68215" />
        <circle cx="28" cy="10" r="1.3" fill="#FFF6E5" />
        <circle cx="32" cy="12" r="1.2" fill="#FFF6E5" />
        <circle cx="36" cy="15" r="1.2" fill="#FFF6E5" />
      </svg>
    </div>
  );
}

export default function NeuronexLogo({
  variant = 'compact',
  size = 'md',
  showTagline = true,
  className = ''
}) {
  const symbolSizes = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68
  };

  const currentSize = symbolSizes[size] || 40;

  if (variant === 'mark') {
    return <NeuronexSymbol size={currentSize} className={className} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <NeuronexSymbol size={currentSize} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black text-[#162832] tracking-tight font-sans">
              Neuro<span className="text-[#1E5E3A]">nex</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD] text-[9px] font-extrabold uppercase tracking-wider">
              NE
            </span>
          </div>
          {showTagline && (
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate -mt-0.5">
              Memory & Care Companion
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Variant for Welcome / Brand Hero
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative mb-3.5">
        <NeuronexSymbol size={currentSize || 64} className="shadow-lg shadow-[#1E5E3A]/20" />
        {/* Subtle Seven Sisters micro-crest pill on the symbol corner */}
        <div
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FFF6E5] border border-[#F7D59A] text-[9px] font-black text-[#92540B] shadow-2xs flex items-center gap-0.5"
          title="Designed for North East India"
        >
          <span>7★</span>
          <span>NE</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[#162832] tracking-tight font-sans">
          Neuro<span className="text-[#1E5E3A]">nex</span>
        </h1>
      </div>

      {showTagline && (
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600">
          <span>Cognitive Healthcare</span>
          <span>•</span>
          <span className="text-[#1E5E3A] font-bold">North East India</span>
        </div>
      )}
    </div>
  );
}

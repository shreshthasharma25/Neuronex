import React from 'react';
import { ArrowLeft, Volume2, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

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
    <div className="flex flex-col h-full bg-[#FAFBFD]">
      {/* Game Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-[#172B4D] hover:bg-slate-100 transition-colors font-bold text-sm touch-target"
          aria-label="Exit Game"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit</span>
        </button>

        <div className="text-center flex-1 px-2">
          <h2 className="text-base font-extrabold text-[#172B4D] truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#2F6FED] font-semibold truncate">
              {subtitle}
            </p>
          )}
        </div>

        <button
          onClick={handleSpeak}
          className="p-2.5 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors touch-target"
          title="Listen to instructions"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Game Play Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-md mx-auto w-full">
        {children}
      </div>
    </div>
  );
}

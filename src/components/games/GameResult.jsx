import React, { useEffect } from 'react';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Sparkles, Trophy, Clock, Target, ArrowRight, RotateCcw, Home, Award, Shuffle } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function GameResult({
  gameName,
  accuracy = 100,
  timeTaken = "1 min 45 sec",
  difficulty = null,
  levelNotice = null,
  onPlayAgain,
  onReshufflePlayAgain,
  onNextGame,
  onReturnHome
}) {
  const { patientData, t, language } = useApp();
  const preferredName = patientData?.profile?.preferredName || patientData?.profile?.fullName || 'Friend';
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const displayDifficulty = difficulty || `${t('games.level', { level: currentLevel })}`;

  const getLocaleTag = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'bn': return 'bn-IN';
      case 'as': return 'as-IN';
      case 'ta': return 'ta-IN';
      default: return 'en-US';
    }
  };

  useEffect(() => {
    sounds.playSuccess();
    sounds.speak(`${t('games.wellDone')} ${preferredName}!`, {
      lang: getLocaleTag(language)
    });
  }, [gameName, accuracy, preferredName, currentLevel, language]);

  return (
    <div className="flex flex-col justify-between min-h-[560px] h-full p-6 sm:p-7 text-center bg-gradient-to-b from-[#FFF9EE] via-[#F4F9F4] to-[#EAF3EC] rounded-4xl border-2 border-[#C3E2CD] shadow-xl relative overflow-hidden">
      {/* Subtle background tea contour rings */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#1E5E3A_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Top Celebration */}
      <div className="pt-2 sm:pt-4 relative z-10">
        {/* Muga Golden Silk Accolade Medallion */}
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D98A1E] via-[#F3B344] to-[#9E5D0A] text-white flex items-center justify-center mx-auto text-4xl shadow-xl shadow-[#D98A1E]/30 border-4 border-white transform hover:rotate-3 transition-transform">
            🏆
          </div>
          <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1E5E3A] text-white flex items-center justify-center text-sm border-2 border-white shadow-md">
            🌿
          </span>
        </div>

        {/* Waypoint milestone badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 text-[#1E5E3A] font-extrabold text-xs uppercase tracking-wider mb-2 border border-[#C3E2CD] shadow-xs backdrop-blur-xs">
          <Award className="w-4 h-4 text-[#D98A1E]" />
          <span>{gameName} • {displayDifficulty}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif tracking-tight mb-2">
          {t('games.wellDone')}, {preferredName}! 🌸
        </h2>

        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
          {t('games.exerciseComplete')}
        </p>

        <div className="mt-2 text-[11px] font-extrabold text-[#1E5E3A] uppercase tracking-wider">
          ✦ Himalayan Cognitive Journey Milestone Reached ✦
        </div>

        {levelNotice && (
          <div className="mt-3 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold animate-in fade-in shadow-2xs">
            {levelNotice}
          </div>
        )}
      </div>

      {/* Metrics Cards: Waypoint Stones */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-5 relative z-10">
        <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#C3E2CD] shadow-sm flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center mb-1">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#162832] block font-serif">
            {accuracy}%
          </span>
          <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">
            {t('games.score', { score: accuracy })}
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#F7D59A] shadow-sm flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-[#FFF6E5] text-[#D98A1E] flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-[#162832] block truncate mt-0.5 font-serif">
            {timeTaken}
          </span>
          <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">
            {t('common.time')}
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#C3E2CD] shadow-sm flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-[#162832] block truncate mt-0.5 font-serif">
            {displayDifficulty}
          </span>
          <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">
            {t('games.level', { level: currentLevel })}
          </span>
        </div>
      </div>

      {/* Caregiver Synced Note with Tea Garden Leaf Stamp */}
      <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#C3E2CD] text-xs text-[#1E5E3A] font-extrabold mb-4 shadow-2xs flex items-center justify-center gap-2 relative z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>🌱 Saved to your health sanctuary & shared with caregiver</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pb-2 relative z-10">
        {onReshufflePlayAgain ? (
          <Button
            onClick={onReshufflePlayAgain}
            variant="primary"
            size="xl"
            fullWidth
            icon={Shuffle}
            className="shadow-lg shadow-[#1E5E3A]/25 text-lg sm:text-xl font-extrabold bg-gradient-to-r from-[#1E5E3A] to-[#164E30] hover:from-[#164E30] hover:to-[#0F3520] rounded-2xl"
          >
            {t('games.playAgain')}
          </Button>
        ) : null}

        {onNextGame && (
          <Button
            onClick={onNextGame}
            variant="primary"
            size="lg"
            fullWidth
            icon={ArrowRight}
            className="font-extrabold text-lg sm:text-xl text-white bg-[#1E5E3A] hover:bg-[#164E30] shadow-lg shadow-[#1E5E3A]/25 rounded-2xl border border-[#174A2E]"
          >
            {t('games.nextGame')}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={onPlayAgain}
            variant="outline"
            size="md"
            icon={RotateCcw}
            className="bg-white hover:bg-slate-50 border-slate-300 font-extrabold text-slate-700 rounded-xl"
          >
            {t('games.playAgain')}
          </Button>

          <Button
            onClick={onReturnHome}
            variant="outline"
            size="md"
            icon={Home}
            className="bg-white hover:bg-slate-50 border-slate-300 font-extrabold text-slate-700 rounded-xl"
          >
            {t('games.returnHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}

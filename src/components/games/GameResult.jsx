import React, { useEffect } from 'react';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Sparkles, Trophy, Clock, Target, ArrowRight, RotateCcw, Home, Award, Shuffle, Brain } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function GameResult({
  gameName,
  accuracy = 100,
  timeTaken = "1 min 45 sec",
  difficulty = null,
  levelNotice = null,
  changeDirection = 0,
  onPlayAgain,
  onReshufflePlayAgain,
  onNextGame,
  onStartNewAIRecommendedGame,
  onReturnHome,
  onExploreGames,
  onManualLevelChange
}) {
  const { patientData, t, language } = useApp();
<<<<<<< HEAD
  const preferredName = patientData?.profile?.preferredName || patientData?.profile?.fullName || 'Friend';
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const displayDifficulty = difficulty || `${t('games.level', { level: currentLevel })}`;
=======
  const preferredName = patientData.profile.preferredName || patientData.profile.fullName || 'Friend';
  // Note: The global currentLevel isn't necessarily the game's level now, but difficulty contains the exact text.
  const displayDifficulty = difficulty || 'Level 1';
  // Extract number from "Level X" string for the "X / 10" display
  const levelNumber = parseInt(displayDifficulty.replace(/\D/g, '')) || 1;
>>>>>>> b68211a (Update caregiver cognitive analysis)

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
  }, [gameName, accuracy, preferredName, levelNumber, language]);

  return (
    <div className="flex flex-col justify-between min-h-[540px] h-full p-6 text-center bg-gradient-to-b from-[#FFF8E1] via-white to-[#FAFBFD] rounded-3xl">
      {/* Top Celebration */}
      <div className="pt-4">
        <div className="w-24 h-24 rounded-3xl bg-[#FFC857] text-[#172B4D] flex items-center justify-center mx-auto text-5xl shadow-lg border-4 border-white mb-4 animate-bounce">
          🎉
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-xs uppercase tracking-wider mb-2">
          <Award className="w-4 h-4" />
          <span>{gameName}</span>
        </div>

        <h2 className="text-3xl font-extrabold text-[#172B4D] tracking-tight mb-2">
          {t('games.wellDone')} {preferredName}! ❤️
        </h2>

        <p className="text-base text-slate-600 font-semibold max-w-sm mx-auto">
          {t('games.exerciseComplete')}
        </p>

        {levelNotice && (
          <div className={`mt-3 p-3 rounded-2xl text-xs font-bold animate-in fade-in ${
            changeDirection > 0 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
              : changeDirection < 0 
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {changeDirection > 0 ? '📈 ' : changeDirection < 0 ? '📉 ' : '🧠 '}
            {levelNotice}
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-3 my-6">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Target className="w-5 h-5 text-[#2F6FED] mx-auto mb-1" />
          <span className="text-2xl font-extrabold text-[#172B4D] block">
            {accuracy}%
          </span>
          <span className="text-xs text-slate-500 font-bold">
            Accuracy
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <span className="text-lg font-extrabold text-[#172B4D] block truncate mt-0.5">
            {timeTaken}
          </span>
          <span className="text-xs text-slate-500 font-bold">
            Time
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <span className="text-xl font-extrabold text-[#172B4D] block truncate mt-0.5">
            {levelNumber} <span className="text-sm text-slate-400">/ 10</span>
          </span>
          <span className="text-xs text-slate-500 font-bold">
            Current Level
          </span>
        </div>
      </div>

      {/* Caregiver Synced Note */}
      <div className="p-3 bg-[#E8F5E9] rounded-2xl border border-[#C8E6C9] text-xs text-[#2E7D32] font-bold mb-4">
        ✓ {t('common.success')}
      </div>

      {onNextGame && (
        <div className="mb-4">
          <Button
            onClick={onNextGame}
            variant="primary"
            size="xl"
            fullWidth
            icon={ArrowRight}
            className="shadow-md shadow-[#2F6FED]/25 text-lg font-extrabold bg-[#2F6FED] hover:bg-[#255ecf]"
          >
            Next Game
          </Button>
        </div>
      )}

      {/* Train Your Brain More Section (Primary Action) */}
      {onStartNewAIRecommendedGame && (
        <div className="bg-[#EAF2FF] p-4 rounded-3xl border border-[#CFE1FF] text-left mb-4 shadow-sm animate-in slide-in-from-bottom-2">
          <h3 className="text-lg font-extrabold text-[#172B4D] mb-1">
            Train Your Brain More
          </h3>
          <p className="text-sm text-[#2F6FED] font-medium mb-4">
            Keep exercising your memory and cognitive skills.
          </p>
          
          <Button
            onClick={onStartNewAIRecommendedGame}
            variant="primary"
            size="xl"
            fullWidth
            icon={Sparkles}
            className="shadow-md shadow-[#2F6FED]/25 text-lg font-extrabold bg-[#2F6FED] hover:bg-[#255ecf]"
          >
            Play Brain Exercise Again
          </Button>
        </div>
      )}

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Button
          onClick={onPlayAgain}
          variant="outline"
          size="md"
          icon={RotateCcw}
          className="bg-white border-slate-300 font-bold text-slate-700"
        >
          Replay This Game
        </Button>

        <Button
          onClick={onExploreGames || onReturnHome}
          variant="outline"
          size="md"
          icon={Brain}
          className="bg-white border-slate-300 font-bold text-[#2F6FED]"
        >
          Game Library
        </Button>
      </div>
      
      <div className="text-center mt-2 pb-2">
        <button 
          onClick={onReturnHome}
          className="text-slate-400 font-bold text-xs hover:text-slate-600 underline underline-offset-2"
        >
          {t('games.returnHome')}
        </button>
      </div>
    </div>
  );
}

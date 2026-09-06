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
  const preferredName = patientData.profile.preferredName || patientData.profile.fullName || 'Friend';
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
    <div className="flex flex-col justify-between min-h-[540px] h-full p-6 text-center bg-gradient-to-b from-[#FFF8E1] via-white to-[#FAFBFD] rounded-3xl">
      {/* Top Celebration */}
      <div className="pt-4">
        <div className="w-24 h-24 rounded-3xl bg-[#FFC857] text-[#172B4D] flex items-center justify-center mx-auto text-5xl shadow-lg border-4 border-white mb-4 animate-bounce">
          🎉
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-xs uppercase tracking-wider mb-2">
          <Award className="w-4 h-4" />
          <span>{gameName} • {displayDifficulty}</span>
        </div>

        <h2 className="text-3xl font-extrabold text-[#172B4D] tracking-tight mb-2">
          {t('games.wellDone')} {preferredName}! ❤️
        </h2>

        <p className="text-base text-slate-600 font-semibold max-w-sm mx-auto">
          {t('games.exerciseComplete')}
        </p>

        {levelNotice && (
          <div className="mt-3 p-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold animate-in fade-in">
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
            {t('games.score', { score: accuracy })}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <span className="text-lg font-extrabold text-[#172B4D] block truncate mt-0.5">
            {timeTaken}
          </span>
          <span className="text-xs text-slate-500 font-bold">
            {t('common.time')}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <span className="text-lg font-extrabold text-[#172B4D] block truncate mt-0.5">
            {displayDifficulty}
          </span>
          <span className="text-xs text-slate-500 font-bold">
            {t('games.level', { level: currentLevel })}
          </span>
        </div>
      </div>

      {/* Caregiver Synced Note */}
      <div className="p-3 bg-[#E8F5E9] rounded-2xl border border-[#C8E6C9] text-xs text-[#2E7D32] font-bold mb-4">
        ✓ {t('common.success')}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-2">
        {onReshufflePlayAgain ? (
          <Button
            onClick={onReshufflePlayAgain}
            variant="primary"
            size="xl"
            fullWidth
            icon={Shuffle}
            className="shadow-lg shadow-[#2F6FED]/25 text-xl font-bold bg-[#2F6FED] hover:bg-[#255ecf]"
          >
            {t('games.playAgain')}
          </Button>
        ) : null}

        {onNextGame && (
          <Button
            onClick={onNextGame}
            variant="secondary"
            size="lg"
            fullWidth
            icon={ArrowRight}
            className="font-bold"
          >
            {t('games.nextGame')}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onPlayAgain}
            variant="outline"
            size="md"
            icon={RotateCcw}
            className="bg-white border-slate-300 font-bold text-slate-700"
          >
            {t('games.playAgain')}
          </Button>

          <Button
            onClick={onReturnHome}
            variant="outline"
            size="md"
            icon={Home}
            className="bg-white border-slate-300 font-bold text-slate-700"
          >
            {t('games.returnHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}

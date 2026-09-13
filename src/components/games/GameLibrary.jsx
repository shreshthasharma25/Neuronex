import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ALL_GAMES, getRecommendedGames } from '../../utils/adaptiveEngine';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, ArrowRight, Play, RotateCw, Lock } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function GameLibrary({ onOpenGame, onStartExercise }) {
  const {
    patientData,
    setPatientData,
    gameSessionCycle,
    setGameSessionCycle,
    setUserRole,
    setCaregiverTab
  } = useApp();

  const preferredName = patientData?.profile?.preferredName || patientData?.profile?.fullName || 'Friend';
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const familyList = patientData.family || [];
  const hasFamily = familyList.length > 0;

  const recommendedGames = getRecommendedGames(gameSessionCycle, familyList, patientData.cognitiveStats?.history);

  const handleLaunch = (game) => {
    sounds.playGentleTap();
    onOpenGame(game);
  };

  const handleRotateActivities = () => {
    sounds.playGentleTap();
    setGameSessionCycle(prev => prev + 1);
  };

  const handleManualLevelChange = (direction) => {
    setPatientData(prev => {
      const oldLevel = prev.cognitiveStats?.currentLevel || 1;
      let newLevel = oldLevel + direction;
      if (newLevel < 1) newLevel = 1;
      if (newLevel > 10) newLevel = 10;
      
      return {
        ...prev,
        cognitiveStats: {
          ...prev.cognitiveStats,
          currentLevel: newLevel,
          gameLevels: {} // Reset individual game levels to track the new global baseline
        }
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[#EAF2FF] p-5 rounded-3xl border border-[#CFE1FF] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Cognitive Activities
          </span>
          <h2 className="text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Brain Exercise Library
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Tailored cognitive sessions designed for {preferredName}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-[#2F6FED] flex items-center justify-center text-2xl shadow-sm">
          🧠
        </div>
      </div>

      {/* Manual Level Control */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-sm font-extrabold text-[#172B4D]">Current Level: {currentLevel}/10</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleManualLevelChange(-1)} 
            disabled={currentLevel <= 1}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg ${currentLevel <= 1 ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-[#2F6FED] active:bg-slate-200'}`}
          >
            -
          </button>
          <button 
            onClick={() => handleManualLevelChange(1)} 
            disabled={currentLevel >= 10}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg ${currentLevel >= 10 ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-[#2F6FED] active:bg-slate-200'}`}
          >
            +
          </button>
        </div>
      </div>

      {/* Top Banner Section: Today's Exercise OR Train More */}
      <section>
        {patientData.brainExercise?.dailyCompleted ? (
          // Train Your Brain More (if today's exercise is completed)
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAF2FF] to-[#F8FAFC] border-2 border-[#2F6FED] p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CFE1FF] text-[#2F6FED] text-xs font-extrabold uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                <span>Level {currentLevel}</span>
              </div>
              <span className="text-3xl">🚀</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mb-2">
              Train Your Brain More
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium mb-5 max-w-sm">
              Keep exercising your memory and cognitive skills.
            </p>
            
            <Button
              onClick={() => {
                sounds.playGentleTap();
                onStartExercise(); // Re-trigger AI selection
              }}
              variant="primary"
              size="xl"
              fullWidth
              icon={Sparkles}
              className="text-lg shadow-md font-extrabold"
            >
              Play Brain Exercise Again
            </Button>
          </div>
        ) : (
          // Today's Brain Exercise (First priority)
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8E1] via-[#FEF3C7] to-[#FFFBEB] border-2 border-[#FFC857] p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Level {currentLevel}</span>
              </div>
              <span className="text-3xl">🧠</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mb-2">
              Today's Brain Exercise
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium mb-5 max-w-sm">
              Your recommended daily cognitive session.
            </p>
            
            <Button
              onClick={() => {
                sounds.playGentleTap();
                onStartExercise();
              }}
              variant="yellow"
              size="xl"
              fullWidth
              icon={Play}
              className="text-lg shadow-md font-extrabold"
            >
              Start Today's Exercise
            </Button>
          </div>
        )}
      </section>

      {/* All Available Games Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-[#2F6FED]" />
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            Brain Exercise Library
          </h3>
        </div>

        <div className="space-y-3">
          {ALL_GAMES.map(game => {
            const isGated = game.requiresFamily && !hasFamily;

            return (
              <div
                key={game.id}
                onClick={() => handleLaunch(game)}
                className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-99 touch-target ${
                  isGated
                    ? 'bg-slate-50/80 border-dashed border-slate-300 opacity-80'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                    {game.category === 'memory' ? '🧠' : game.category === 'recall' ? '🧺' : game.category === 'attention' ? '⭐' : '🔢'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-[#172B4D]">
                        {game.name}
                      </h4>
                      {isGated && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Caregiver Family Needed</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {game.target}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-1 rounded-full">
                    Level {currentLevel}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="text-center py-2">
        <p className="text-xs text-slate-400 font-medium">
          Games dynamically rotate and adjust difficulty (Level 1 → 2 → 3) based on performance.
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ALL_GAMES, getRecommendedGames } from '../../utils/adaptiveEngine';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, ArrowRight, Play, RotateCw, Lock } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function GameLibrary({ onOpenGame }) {
  const {
    patientData,
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

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[#EAF2FF] p-5 rounded-3xl border border-[#CFE1FF] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Cognitive Activities • Level {currentLevel}
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

      {/* Recommended Section with Rotation Control */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-extrabold text-[#172B4D]">
              Selected for You Today
            </h3>
          </div>

          {/* Quick Rotation Button */}
          <button
            onClick={handleRotateActivities}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#2F6FED] text-xs font-extrabold border border-slate-200 shadow-sm transition-all"
            title="Rotate activities set"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate Set</span>
          </button>
        </div>

        <div className="space-y-3">
          {recommendedGames.map((game, idx) => (
            <div
              key={game.id}
              onClick={() => handleLaunch(game)}
              className="group p-4 rounded-3xl bg-white border-2 border-slate-200 hover:border-[#2F6FED] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex items-center justify-between touch-target active:scale-98"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {game.category === 'memory' ? '❤️' : game.category === 'recall' ? '🍎' : game.category === 'attention' ? '👀' : '🧩'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-[#172B4D]">
                      {game.name}
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#B45309]">
                      Level {currentLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <div className="w-9 h-9 rounded-xl bg-[#2F6FED] text-white flex items-center justify-center group-hover:bg-[#2052b8] transition-colors shadow-sm">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Available Games Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-[#2F6FED]" />
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            All Cognitive Activities
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

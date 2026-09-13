import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ALL_GAMES, getRecommendedGames } from '../../utils/adaptiveEngine';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, ArrowRight, Play, RotateCw, Lock, Compass, Mountain, MapPin } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import {
  TeaLeafSprig,
  CinematicMountainHero,
  RegionalTextileBorder,
  NorthEastBadge
} from '../common/CulturalMotifs';

// Visual regional story metadata for wrapping games inside the North-East journey
const GAME_SCENIC_CONTEXT = {
  'memory-twin': {
    regionTitle: 'Tea Garden Recall',
    trailType: 'Assam Valley Path',
    elevation: '450m',
    icon: '🌿',
    gradient: 'from-[#1E5E3A] via-[#1A5333] to-[#143B28]',
    accentBorder: 'border-[#1E5E3A]',
    accentBg: 'bg-[#EBF5EE]',
    accentText: 'text-[#1E5E3A]',
  },
  'memory-basket': {
    regionTitle: 'Harvest Basket',
    trailType: 'Village Courtyard',
    elevation: '720m',
    icon: '🧺',
    gradient: 'from-[#D98A1E] via-[#B87214] to-[#8C5808]',
    accentBorder: 'border-[#D98A1E]',
    accentBg: 'bg-[#FFF6E5]',
    accentText: 'text-[#92540B]',
  },
  'family-memory': {
    regionTitle: 'Mountain Hearth',
    trailType: 'Family Fireside',
    elevation: '1,450m',
    icon: '❤️',
    gradient: 'from-[#BA1A1A] via-[#9B1515] to-[#780F0F]',
    accentBorder: 'border-[#BA1A1A]',
    accentBg: 'bg-[#FDF2F2]',
    accentText: 'text-[#BA1A1A]',
  },
  'picture-memory': {
    regionTitle: 'Garden Memories',
    trailType: 'Orchid Sanctuary',
    elevation: '980m',
    icon: '🌸',
    gradient: 'from-[#2D6A4F] via-[#245A42] to-[#1B4332]',
    accentBorder: 'border-[#2D6A4F]',
    accentBg: 'bg-[#EBF5EE]',
    accentText: 'text-[#2D6A4F]',
  },
  'pattern-memory': {
    regionTitle: 'River Journey',
    trailType: 'Brahmaputra Flow',
    elevation: '610m',
    icon: '🏞️',
    gradient: 'from-[#1A535C] via-[#14424A] to-[#0E2E33]',
    accentBorder: 'border-[#1A535C]',
    accentBg: 'bg-[#E8F3F5]',
    accentText: 'text-[#1A535C]',
  },
  'daily-routine': {
    regionTitle: 'Village Rhythm',
    trailType: 'Sub-Himalayan Trail',
    elevation: '1,820m',
    icon: '🏡',
    gradient: 'from-[#1E5E3A] via-[#164E30] to-[#0F3520]',
    accentBorder: 'border-[#1E5E3A]',
    accentBg: 'bg-[#EBF5EE]',
    accentText: 'text-[#1E5E3A]',
  },
  'odd-one-out': {
    regionTitle: 'Forest Canopy',
    trailType: 'Pine Hill Crest',
    elevation: '2,100m',
    icon: '🦜',
    gradient: 'from-[#40916C] via-[#317855] to-[#24583F]',
    accentBorder: 'border-[#40916C]',
    accentBg: 'bg-[#EBF5EE]',
    accentText: 'text-[#40916C]',
  },
};

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
    <div className="space-y-6 pb-32 bg-[#F5FAF6] min-h-full">
      {/* 1. SCENIC MOUNTAIN & TEA GARDEN HERO HEADER */}
      <div className="relative w-full overflow-hidden shadow-sm">
        <CinematicMountainHero minHeight={200} className="w-full">
          <div className="p-5 sm:p-6 pt-6 flex flex-col justify-between min-h-[200px] relative z-10">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#C68215]/30 text-[#8C5808] text-xs font-black shadow-xs">
                <TeaLeafSprig className="w-3.5 h-3.5 text-[#1E5E3A]" />
                <span>Cognitive Journey Trail</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1E5E3A] text-white text-xs font-black shadow-xs">
                Level {currentLevel} Adaptive
              </span>
            </div>

            <div className="mt-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-[#D8E2D9] shadow-xs">
              <h2 className="text-2xl sm:text-3xl font-black text-[#162832] font-display tracking-tight">
                Brain Exercise Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                Peaceful cognitive walks designed with love for {preferredName}
              </p>
            </div>
          </div>
        </CinematicMountainHero>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* 2. RECOMMENDED JOURNEY STATIONS FOR TODAY */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF6E5] text-[#C68215] flex items-center justify-center font-black shadow-2xs border border-[#F7D59A]">
                ✨
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#162832] font-display">
                  Today's Journey Stations
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold -mt-0.5">
                  Hand-selected memory walks for this morning
                </p>
              </div>
            </div>

            {/* Quick Rotation Button */}
            <button
              onClick={handleRotateActivities}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EBF5EE] text-[#1E5E3A] text-xs font-black border border-[#D8E2D9] shadow-xs transition-all touch-target"
              title="Rotate activities set"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate Set</span>
            </button>
          </div>

          {/* Stepping Stone Journey Cards */}
          <div className="space-y-3.5">
            {recommendedGames.map((game, idx) => {
              const scenic = GAME_SCENIC_CONTEXT[game.id] || {
                regionTitle: game.name,
                trailType: 'Nature Path',
                elevation: `${400 + idx * 300}m`,
                icon: '🌿',
                gradient: 'from-[#1E5E3A] to-[#143B28]',
                accentBorder: 'border-[#1E5E3A]',
                accentBg: 'bg-[#EBF5EE]',
                accentText: 'text-[#1E5E3A]',
              };

              return (
                <div
                  key={game.id}
                  onClick={() => handleLaunch(game)}
                  className="group relative p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#D8E2D9] hover:border-[#1E5E3A] shadow-sm hover:shadow-tea transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99] touch-target"
                >
                  {/* Subtle top landscape band */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E5E3A] via-[#C68215] to-[#2D6A4F]" />

                  <div className="flex items-center justify-between gap-3.5 pt-1">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Visual Waypoint Stone */}
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${scenic.gradient} text-white flex flex-col items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform border border-white/20`}
                      >
                        <span className="text-2xl sm:text-3xl">{scenic.icon}</span>
                        <span className="text-[9px] font-black text-amber-200 tracking-wider">
                          {scenic.elevation}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C68215]">
                            Station {idx + 1} • {scenic.trailType}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD]">
                            Level {currentLevel}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-[#162832] font-display truncate mt-0.5 group-hover:text-[#1E5E3A] transition-colors">
                          {scenic.regionTitle}
                        </h4>

                        <p className="text-xs text-slate-500 font-semibold truncate">
                          {game.name} — {game.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1E5E3A] text-white flex items-center justify-center group-hover:bg-[#143B28] transition-colors shadow-sm">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. ALL JOURNEY ACTIVITIES ATLAS */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center font-black shadow-2xs border border-[#C3E2CD]">
                🧭
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#162832] font-display">
                All Journey Activities
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {ALL_GAMES.length} trails open
            </span>
          </div>

          <div className="space-y-3">
            {ALL_GAMES.map((game, idx) => {
              const isGated = game.requiresFamily && !hasFamily;
              const scenic = GAME_SCENIC_CONTEXT[game.id] || {
                regionTitle: game.name,
                trailType: 'Scenic Trail',
                elevation: `${300 + idx * 250}m`,
                icon: '🏔️',
                accentBorder: 'border-[#D8E2D9]',
                accentBg: 'bg-[#EBF5EE]',
                accentText: 'text-[#1E5E3A]',
              };

              return (
                <div
                  key={game.id}
                  onClick={() => handleLaunch(game)}
                  className={`p-4 rounded-3xl border-2 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] touch-target ${
                    isGated
                      ? 'bg-slate-50/80 border-dashed border-slate-300 opacity-85'
                      : 'bg-white border-[#D8E2D9] hover:border-[#1E5E3A] hover:bg-[#F3F6F3]/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center text-xl flex-shrink-0 border border-[#C3E2CD]">
                      {scenic.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {scenic.elevation} • {scenic.trailType}
                        </span>
                        {isGated && (
                          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Family Photo Needed</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-[#162832] truncate">
                        {scenic.regionTitle} <span className="text-xs text-slate-400 font-semibold">({game.name})</span>
                      </h4>

                      <span className="text-xs font-semibold text-slate-500 block truncate">
                        {game.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs font-bold text-[#1E5E3A] bg-[#EBF5EE] border border-[#C3E2CD] px-2.5 py-1 rounded-full">
                      Level {currentLevel}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. FOOTER NOTE */}
        <div className="text-center py-2">
          <RegionalTextileBorder height={4} className="mb-2 opacity-50" />
          <p className="text-xs text-slate-400 font-semibold">
            Activities dynamically adapt difficulty (Level 1 → 2 → 3) based on patient comfort & pace.
          </p>
        </div>
      </div>
    </div>
  );
}


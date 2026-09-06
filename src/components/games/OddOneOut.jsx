import React, { useState } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { GAME_LEVEL_CONFIGS } from '../../utils/adaptiveEngine';

export default function OddOneOut({ onComplete, onExit }) {
  const { patientData } = useApp();
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const levelConfig = GAME_LEVEL_CONFIGS['odd-one-out'][currentLevel] || GAME_LEVEL_CONFIGS['odd-one-out'][1];

  const [round, setRound] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Generate rounds scaled by level
  const rounds = [
    {
      title: "Find the odd fruit",
      items: currentLevel === 1 
        ? ['🍎', '🍎', '🍌', '🍎']
        : currentLevel === 2
        ? ['🍎', '🍎', '🍎', '🍌', '🍎']
        : ['🍎', '🍎', '🍎', '🍎', '🍌', '🍎'],
      oddIndex: currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4,
      oddName: 'Banana 🍌',
    },
    {
      title: "Find the odd shape",
      items: currentLevel === 1 
        ? ['⭐', '🔵', '⭐', '⭐']
        : currentLevel === 2
        ? ['⭐', '⭐', '🔵', '⭐', '⭐']
        : ['⭐', '⭐', '⭐', '🔵', '⭐', '⭐'],
      oddIndex: currentLevel === 1 ? 1 : currentLevel === 2 ? 2 : 3,
      oddName: 'Blue Circle 🔵',
    },
    {
      title: "Find the different item",
      items: currentLevel === 1 
        ? ['🌸', '🌸', '☕', '🌸']
        : currentLevel === 2
        ? ['🌸', '🌸', '🌸', '☕', '🌸']
        : ['🌸', '🌸', '🌸', '🌸', '☕', '🌸'],
      oddIndex: currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4,
      oddName: 'Tea Cup ☕',
    }
  ];

  const current = rounds[round];

  const handleTap = (index) => {
    if (selectedIdx !== null) return;
    sounds.playGentleTap();
    setSelectedIdx(index);

    const isCorrect = index === current.oddIndex;
    if (isCorrect) {
      sounds.playSuccess();
      setFeedback({ type: 'success', text: `❤️ Well spotted! The ${current.oddName} is different!` });
      setCorrectCount(c => c + 1);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! The different one was the ${current.oddName}.` });
    }

    setTimeout(() => {
      if (round < rounds.length - 1) {
        setRound(r => r + 1);
        setSelectedIdx(null);
        setFeedback(null);
      } else {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const accuracy = Math.round((finalCorrect / rounds.length) * 100);
        const totalSecs = Math.max(8, Math.round((Date.now() - startTime) / 1000));
        const avgResp = Math.max(2, Math.round(totalSecs / rounds.length));

        onComplete({
          gameId: 'odd-one-out',
          gameName: 'Odd One Out',
          category: 'attention',
          accuracy,
          correctAnswers: finalCorrect,
          incorrectAnswers: rounds.length - finalCorrect,
          responseTime: avgResp,
          timeTaken: `${totalSecs} seconds`,
          difficulty: `Level ${currentLevel}`
        });
      }
    }, 1800);
  };

  return (
    <GameContainer
      title="Odd One Out"
      subtitle={`Level ${currentLevel} • Challenge ${round + 1} of ${rounds.length}`}
      onExit={onExit}
      instructionText="Which one is different? Tap the object that does not match the others."
    >
      <div className="space-y-6">
        <div className="bg-[#EAF2FF] p-4 rounded-2xl border border-[#CFE1FF] text-center">
          <h3 className="text-xl font-extrabold text-[#172B4D]">
            Which one is different?
          </h3>
          <p className="text-xs text-[#2F6FED] font-semibold mt-1">
            Tap the one object that looks different ({levelConfig.itemsInRow} items).
          </p>
        </div>

        {/* Row of Items with Big Touch Targets */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-6">
          {current.items.map((emoji, idx) => {
            let style = 'bg-white border-2 border-slate-200 hover:border-[#2F6FED] shadow-sm';
            if (selectedIdx !== null) {
              if (idx === current.oddIndex) {
                style = 'bg-[#E8F5E9] border-2 border-[#2E7D32] text-[#2E7D32] scale-105';
              } else if (idx === selectedIdx) {
                style = 'bg-[#FFF8E1] border-2 border-amber-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={selectedIdx !== null}
                onClick={() => handleTap(idx)}
                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-150 active:scale-95 touch-target ${style}`}
              >
                {emoji}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-center text-sm font-bold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
              : 'bg-[#FFF8E1] text-[#854D0E] border border-[#FDE68A]'
          }`}>
            {feedback.text}
          </div>
        )}
      </div>
    </GameContainer>
  );
}

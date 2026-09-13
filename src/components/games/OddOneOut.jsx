import React, { useState, useEffect, useRef, useMemo } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { GAME_LEVEL_CONFIGS } from '../../utils/adaptiveEngine';

export default function OddOneOut({ onComplete, onExit, reshuffleKey = 0, initialLevel = 1 }) {
  const { patientData } = useApp();
  // initialLevel passed as prop
  const [localLevel, setLocalLevel] = useState(initialLevel);
  const levelConfig = GAME_LEVEL_CONFIGS['odd-one-out'][localLevel] || GAME_LEVEL_CONFIGS['odd-one-out'][1];

  const [round, setRound] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stuckMessage, setStuckMessage] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const timerRef = useRef(null);

  // Generate rounds dynamically based on config
  const rounds = useMemo(() => {
    const config = GAME_LEVEL_CONFIGS['odd-one-out'][localLevel] || GAME_LEVEL_CONFIGS['odd-one-out'][10];
    const generated = [];
    const pool = [
      { common: '🍎', odd: '🍌', oddName: 'Banana 🍌', title: 'Find the odd fruit' },
      { common: '⭐', odd: '🔵', oddName: 'Blue Circle 🔵', title: 'Find the odd shape' },
      { common: '🌸', odd: '☕', oddName: 'Tea Cup ☕', title: 'Find the different item' },
      { common: '🚗', odd: '🚲', oddName: 'Bicycle 🚲', title: 'Find the different vehicle' },
      { common: '🐶', odd: '🐱', oddName: 'Cat 🐱', title: 'Find the different animal' },
      { common: '🌞', odd: '🌙', oddName: 'Moon 🌙', title: 'Find the odd sky object' },
      { common: '🎸', odd: '🎻', oddName: 'Violin 🎻', title: 'Find the odd instrument' },
      { common: '⚽', odd: '🏀', oddName: 'Basketball 🏀', title: 'Find the different ball' },
      { common: '🌳', odd: '🌵', oddName: 'Cactus 🌵', title: 'Find the different plant' },
      { common: '🍔', odd: '🍕', oddName: 'Pizza 🍕', title: 'Find the different food' },
    ];
    
    // Pick enough round templates to satisfy levelConfig.rounds
    const templates = [...pool].sort(() => 0.5 - Math.random()).slice(0, config.rounds);
    
    // Fallback if config asks for > 10 rounds
    while(templates.length < config.rounds) {
      templates.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    templates.forEach((t) => {
      const items = Array(config.itemsInRow).fill(t.common);
      const oddIndex = Math.floor(Math.random() * config.itemsInRow);
      items[oddIndex] = t.odd;
      generated.push({
        title: t.title,
        items,
        oddIndex,
        oddName: t.oddName
      });
    });
    
    return generated;
  }, [localLevel]);

  const current = rounds[round] || rounds[rounds.length - 1];

  const handleStuck = () => {
    if (localLevel > 1) {
      sounds.playGentleTap(); // Friendly chime
      setLocalLevel(prev => prev - 1);
      setStuckMessage("Let's try a little easier one.");
      setConsecutiveMistakes(0);
      setSelectedIdx(null); // Reset choice for current round if they were failing it
      setFeedback(null);
      setTimeout(() => setStuckMessage(null), 3000);
    }
  };

  // Inactivity Timer (Demo configured to 15s)
  useEffect(() => {
    if (selectedIdx !== null) return; // Paused if already answered
    timerRef.current = setTimeout(() => {
      handleStuck();
    }, 15000); 
    
    return () => clearTimeout(timerRef.current);
  }, [round, selectedIdx, localLevel]);

  const handleTap = (index) => {
    if (selectedIdx !== null) return;
    clearTimeout(timerRef.current);
    sounds.playGentleTap();
    setSelectedIdx(index);

    const isCorrect = index === current.oddIndex;
    if (isCorrect) {
      sounds.playSuccess();
      setFeedback({ type: 'success', text: `❤️ Well spotted! The ${current.oddName} is different!` });
      setCorrectCount(c => c + 1);
      setConsecutiveMistakes(0);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! The different one was the ${current.oddName}.` });
      
      const newMistakes = consecutiveMistakes + 1;
      setConsecutiveMistakes(newMistakes);
      
      // Auto-reduce difficulty on repeated mistakes
      if (newMistakes >= 2 && localLevel > 1) {
        setTimeout(handleStuck, 1500); 
      }
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
          difficulty: `Level ${localLevel}` // Use local level because it might have adapted mid-game!
        });
      }
    }, 1800);
  };

  return (
    <GameContainer
      title="Odd One Out"
      subtitle={`Level ${localLevel} • Challenge ${round + 1} of ${rounds.length}`}
      onExit={onExit}
      instructionText="Which one is different? Tap the object that does not match the others."
    >
      <div className="space-y-6">
        
        {stuckMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-2xl text-sm text-center animate-in fade-in slide-in-from-top-2">
            😊 {stuckMessage}
          </div>
        )}

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

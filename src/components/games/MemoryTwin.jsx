import React, { useState, useEffect } from 'react';
import GameContainer from './GameContainer';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { GAME_LEVEL_CONFIGS } from '../../utils/adaptiveEngine';

const ALL_CARD_ITEMS = [
  { id: 'orchid', emoji: '🌸', name: 'Hill Orchid' },
  { id: 'tea', emoji: '🫖', name: 'Tea Kettle' },
  { id: 'flute', emoji: '🪈', name: 'Bamboo Flute' },
  { id: 'bell', emoji: '🔔', name: 'Puja Bell' },
  { id: 'sun', emoji: '☀️', name: 'Warm Sun' },
  { id: 'bird', emoji: '🐦', name: 'Singing Bird' },
];

export default function MemoryTwin({ onComplete, onExit }) {
  const { patientData } = useApp();
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const levelConfig = GAME_LEVEL_CONFIGS['memory-twin'][currentLevel] || GAME_LEVEL_CONFIGS['memory-twin'][1];

  const activeItems = ALL_CARD_ITEMS.slice(0, levelConfig.pairsCount);

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState('Tap any two cards to find matching pairs.');
  const [startTime] = useState(Date.now());

  // Initialize deck based on current level pairs
  useEffect(() => {
    const deck = [...activeItems, ...activeItems]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        uid: index,
        ...item,
      }));
    setCards(deck);
    setMatchedIds([]);
    setFlippedIndices([]);
  }, [currentLevel]);

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) {
      return;
    }

    sounds.playGentleTap();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.id === card2.id) {
        // MATCH
        sounds.playSuccess();
        setFeedback('❤️ Great memory! That is a pair!');
        setMatchedIds(prev => [...prev, card1.id]);
        setFlippedIndices([]);

        if (matchedIds.length + 1 === activeItems.length) {
          const totalSecs = Math.max(10, Math.round((Date.now() - startTime) / 1000));
          const accuracy = Math.min(100, Math.round((activeItems.length / (moves + 1)) * 100));
          const correctCount = activeItems.length;
          const incorrectCount = Math.max(0, (moves + 1) - activeItems.length);
          const avgResp = Math.max(2, Math.round(totalSecs / activeItems.length));

          setTimeout(() => {
            onComplete({
              gameId: 'memory-twin',
              gameName: 'Memory Twin',
              category: 'memory',
              cognitiveDomain: 'memory',
              accuracy: Math.max(65, accuracy),
              correctAnswers: correctCount,
              incorrectAnswers: incorrectCount,
              responseTime: avgResp,
              timeTaken: `${totalSecs} seconds`,
              difficulty: `Level ${currentLevel}`
            });
          }, 800);
        }
      } else {
        // NO MATCH
        setFeedback('😊 Almost! Try again.');
        setTimeout(() => {
          setFlippedIndices([]);
          setFeedback('Keep going! Find the matching cards.');
        }, 1100);
      }
    }
  };

  return (
    <GameContainer
      title="Memory Twin"
      subtitle={`Level ${currentLevel} • Find ${activeItems.length} Pairs`}
      onExit={onExit}
      instructionText="Tap two cards to turn them over. Remember where each picture is to match all pairs."
    >
      <div className="space-y-4">
        {/* Friendly Instruction & Feedback */}
        <div className="p-4 rounded-2xl bg-[#EBF5EE] border border-[#D8E2D9] text-center">
          <p className="text-base font-bold text-[#162832]">
            {feedback}
          </p>
          <p className="text-xs text-[#1E5E3A] font-semibold mt-1">
            Pairs found: {matchedIds.length} of {activeItems.length}
          </p>
        </div>

        {/* Adaptive Grid */}
        <div className={`grid ${cards.length <= 4 ? 'grid-cols-2 max-w-[280px] mx-auto' : 'grid-cols-2 sm:grid-cols-3'} gap-3.5 my-2`}>
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || matchedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);

            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(index)}
                disabled={isMatched}
                className={`h-28 sm:h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-200 text-center select-none shadow-sm touch-target ${
                  isMatched
                    ? 'bg-[#E8F5E9] border-2 border-[#A5D6A7] scale-95 opacity-85'
                    : isFlipped
                    ? 'bg-white border-2 border-[#1E5E3A] shadow-md scale-100'
                    : 'bg-gradient-to-br from-[#1E5E3A] via-[#1B4D3E] to-[#143B30] text-white hover:brightness-105 active:scale-95 border-2 border-white/60 shadow-sm relative overflow-hidden'
                }`}
              >
                {isFlipped ? (
                  <div className="animate-in zoom-in-75 duration-150 flex flex-col items-center">
                    <span className="text-4xl mb-1">{card.emoji}</span>
                    <span className="text-xs font-bold text-[#162832]">{card.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl text-[#C68215] font-black">✦</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest mt-0.5">Pair</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <span className="text-xs text-slate-400">
            Take as much time as you like. There is no rush! 🌿
          </span>
        </div>
      </div>
    </GameContainer>
  );
}

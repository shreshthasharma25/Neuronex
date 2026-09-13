import React, { useState, useEffect, useMemo } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { CheckCircle2, ShoppingBasket, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateMemoryBasketSession } from '../../utils/adaptiveEngine';

export default function MemoryBasket({ onComplete, onExit, reshuffleKey = 0, initialLevel = 1 }) {
  const { patientData } = useApp();
  const catLevels = patientData.cognitiveStats?.categoryLevels || {};
  const currentLevel = initialLevel;

  // Generate fresh, non-repeating session items
  const session = useMemo(() => {
    return generateMemoryBasketSession(currentLevel);
  }, [currentLevel, reshuffleKey]);

  const targetItems = session.targetItems;
  const shelfItems = session.shelfItems;
  const levelConfig = session.levelConfig;

  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'recall'
  const [countdown, setCountdown] = useState(levelConfig.viewSeconds || 8);
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [startTime] = useState(Date.now());

  // Countdown timer for memorize phase
  useEffect(() => {
    if (phase !== 'memorize') return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase('recall');
      sounds.playReminderChime();
    }
  }, [phase, countdown]);

  const handleSkipToRecall = () => {
    setPhase('recall');
    sounds.playReminderChime();
  };

  const handleToggleItem = (itemId) => {
    sounds.playGentleTap();
    if (selectedIds.includes(itemId)) {
      setSelectedIds(prev => prev.filter(id => id !== itemId));
    } else {
      if (selectedIds.length < targetItems.length) {
        setSelectedIds(prev => [...prev, itemId]);
      }
    }
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    const targetIds = targetItems.map(t => t.id);

    selectedIds.forEach(id => {
      if (targetIds.includes(id)) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / targetItems.length) * 100);
    const totalSecs = Math.max(8, Math.round((Date.now() - startTime) / 1000));
    const avgResponseTime = Math.max(2, Math.round(totalSecs / targetItems.length));

    if (accuracy >= 75) {
      sounds.playSuccess();
      setFeedback(`❤️ Excellent! You remembered ${correctCount} out of ${targetItems.length} groceries!`);
    } else {
      setFeedback(`😊 Good practice! You remembered ${correctCount} groceries.`);
    }

    setTimeout(() => {
      onComplete({
        gameId: 'memory-basket',
        gameName: 'Memory Basket',
        category: 'recall',
        accuracy,
        correctAnswers: correctCount,
        incorrectAnswers: targetItems.length - correctCount,
        responseTime: avgResponseTime,
        timeTaken: `${totalSecs} seconds`,
        difficulty: `Level ${currentLevel}`
      });
    }, 1200);
  };

  return (
    <GameContainer
      title="Memory Basket"
      subtitle={`Level ${currentLevel} • Remember ${targetItems.length} Groceries`}
      onExit={onExit}
      instructionText={
        phase === 'memorize'
          ? `Look carefully at these ${targetItems.length} items. Remember them for your basket.`
          : "Which things were on your shopping list? Tap them to put them in your basket."
      }
    >
      {phase === 'memorize' ? (
        <div className="space-y-6 text-center">
          <div className="bg-[#FFF8E1] p-4 rounded-2xl border border-[#FDE68A]">
            <p className="text-base font-extrabold text-[#854D0E]">
              👀 Remember these {targetItems.length} items for your basket:
            </p>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              Time remaining: {countdown} seconds
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
            {targetItems.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border-2 border-[#2F6FED] shadow-md flex flex-col items-center justify-center space-y-2 transform hover:scale-105 transition-all"
              >
                <span className="text-5xl">{item.icon || item.emoji}</span>
                <span className="text-base font-extrabold text-[#172B4D]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 max-w-xs mx-auto">
            <Button
              onClick={handleSkipToRecall}
              variant="primary"
              size="lg"
              fullWidth
              className="bg-[#2F6FED] text-white font-bold"
            >
              I'm Ready Now →
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#EAF2FF] p-3.5 rounded-2xl border border-[#CFE1FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5 text-[#2F6FED]" />
              <span className="text-xs font-extrabold text-[#172B4D]">
                Basket: {selectedIds.length} of {targetItems.length} items selected
              </span>
            </div>
            {selectedIds.length === targetItems.length && (
              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full">
                Basket Full
              </span>
            )}
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-center text-sm font-bold animate-in fade-in">
              {feedback}
            </div>
          )}

          {/* Grocery Store Shelf */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shelfItems.map(item => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-2 relative touch-target ${
                    isSelected
                      ? 'bg-[#EAF2FF] border-[#2F6FED] shadow-md scale-102'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2F6FED] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <span className="text-4xl">{item.icon || item.emoji}</span>
                  <span className="text-sm font-extrabold text-[#172B4D]">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <Button
              onClick={handleCheckAnswers}
              disabled={selectedIds.length === 0}
              variant="primary"
              size="xl"
              fullWidth
              className="bg-[#2F6FED] text-white font-extrabold text-lg shadow-lg disabled:opacity-50"
            >
              Check My Basket ({selectedIds.length}/{targetItems.length})
            </Button>
          </div>
        </div>
      )}
    </GameContainer>
  );
}

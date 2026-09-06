import React, { useState, useEffect } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { GAME_LEVEL_CONFIGS } from '../../utils/adaptiveEngine';

export default function PatternMemory({ onComplete, onExit }) {
  const { patientData } = useApp();
  const currentLevel = patientData.cognitiveStats?.currentLevel || 1;
  const levelConfig = GAME_LEVEL_CONFIGS['pattern-memory'][currentLevel] || GAME_LEVEL_CONFIGS['pattern-memory'][1];

  const [phase, setPhase] = useState('show'); // 'show' | 'ask'
  const [step, setStep] = useState(0); // round 0, 1
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Define rounds scaled by level
  const rounds = [
    {
      type: 'number',
      title: 'Number Memory',
      sequence: currentLevel === 1 
        ? [4, 7, 2] 
        : currentLevel === 2 
        ? [3, 8, 5, 2] 
        : [1, 6, 4, 9, 7],
      question: 'What was the last number in the sequence?',
      subtext: currentLevel === 1 
        ? '4  →  7  →  ?' 
        : currentLevel === 2 
        ? '3  →  8  →  5  →  ?' 
        : '1  →  6  →  4  →  9  →  ?',
      options: currentLevel === 3 ? [7, 4, 9, 2] : [2, 7, 5, 9],
      correct: currentLevel === 3 ? 7 : 2
    },
    {
      type: 'colors',
      title: 'Color Pattern',
      sequence: currentLevel === 1 
        ? ['🔴', '🔵', '🟢'] 
        : ['🔴', '🔵', '🟢', '🔴'],
      question: 'Which color came right after the blue circle (🔵)?',
      subtext: '🔴  →  🔵  →  ?  →  ...',
      options: ['🟢 Green', '🟡 Yellow', '🟣 Purple', '🔴 Red'],
      correct: '🟢 Green'
    }
  ];

  const currentRound = rounds[step];

  const handleSelect = (option) => {
    if (selected !== null) return;
    sounds.playGentleTap();
    setSelected(option);

    const isCorrect = option === currentRound.correct;
    if (isCorrect) {
      sounds.playSuccess();
      setFeedback({ type: 'success', text: '❤️ Spot on! Great sequencing memory.' });
      setCorrectCount(c => c + 1);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! The correct answer was ${currentRound.correct}.` });
    }

    setTimeout(() => {
      if (step < rounds.length - 1) {
        setStep(s => s + 1);
        setPhase('show');
        setSelected(null);
        setFeedback(null);
      } else {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const accuracy = Math.round((finalCorrect / rounds.length) * 100);
        const totalSecs = Math.max(10, Math.round((Date.now() - startTime) / 1000));
        const avgResp = Math.max(2, Math.round(totalSecs / rounds.length));

        onComplete({
          gameId: 'pattern-memory',
          gameName: 'Number & Pattern',
          category: 'sequencing',
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
      title="Number & Pattern"
      subtitle={`Level ${currentLevel} • Round ${step + 1} of ${rounds.length}`}
      onExit={onExit}
      instructionText={currentRound.question}
    >
      <div className="space-y-6">
        {phase === 'show' ? (
          <div className="text-center space-y-6">
            <div className="bg-[#FFF8E1] p-4 rounded-2xl border border-[#FDE68A]">
              <p className="text-base font-extrabold text-[#854D0E]">
                👀 Remember this sequence ({levelConfig.sequenceLength} steps):
              </p>
            </div>

            {/* Sequence Display */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 py-5">
              {currentRound.sequence.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-[#2F6FED] shadow-md flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-[#172B4D]">
                    {item}
                  </div>
                  {idx < currentRound.sequence.length - 1 && (
                    <span className="text-xl text-slate-400 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              onClick={() => setPhase('ask')}
              variant="primary"
              size="lg"
              fullWidth
            >
              I REMEMBERED → ASK ME
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center shadow-sm">
              <span className="text-sm font-bold text-slate-400 block mb-1">
                {currentRound.subtext}
              </span>
              <h3 className="text-2xl font-extrabold text-[#172B4D]">
                {currentRound.question}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentRound.options.map((opt, i) => {
                let btnStyle = 'bg-white border-2 border-slate-200 text-[#172B4D] hover:border-[#2F6FED]';
                if (selected !== null) {
                  if (opt === currentRound.correct) {
                    btnStyle = 'bg-[#E8F5E9] border-2 border-[#2E7D32] text-[#2E7D32] font-extrabold';
                  } else if (opt === selected) {
                    btnStyle = 'bg-[#FFF8E1] border-2 border-amber-400 text-amber-900';
                  }
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={selected !== null}
                    onClick={() => handleSelect(opt)}
                    className={`p-5 rounded-2xl text-2xl font-extrabold transition-all shadow-sm active:scale-98 touch-target ${btnStyle}`}
                  >
                    {opt}
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
        )}
      </div>
    </GameContainer>
  );
}

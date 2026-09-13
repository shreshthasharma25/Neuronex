import React, { useState, useEffect } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { Eye, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GAME_LEVEL_CONFIGS } from '../../utils/adaptiveEngine';

export default function PictureMemory({ onComplete, onExit, reshuffleKey = 0, initialLevel = 1 }) {
  const { patientData } = useApp();
  const currentLevel = initialLevel;
  const levelConfig = GAME_LEVEL_CONFIGS['picture-memory'][currentLevel] || GAME_LEVEL_CONFIGS['picture-memory'][1];

  const allQuestions = [
    {
      q: "What color was the car parked outside?",
      options: ["Red", "Blue", "Yellow", "White"],
      correct: "Red"
    },
    {
      q: "Which friendly animal was sitting near the tree?",
      options: ["Dog 🐕", "Cat 🐈", "Parrot 🦜", "Cow 🐄"],
      correct: "Dog 🐕"
    },
    {
      q: "What was resting against the garden fence?",
      options: ["Bicycle 🚲", "Chair 🪑", "Umbrella ☂️", "Ladder 🪜"],
      correct: "Bicycle 🚲"
    }
  ];

  const questions = allQuestions.slice(0, levelConfig.questionCount);

  const [phase, setPhase] = useState('observe'); // 'observe' | 'questions'
  const [timer, setTimer] = useState(levelConfig.viewSeconds);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'observe') return;
    if (timer > 0) {
      const id = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    } else {
      setPhase('questions');
      sounds.playReminderChime();
    }
  }, [phase, timer]);

  const handleSkipToQuestions = () => {
    setPhase('questions');
    sounds.playReminderChime();
  };

  const handleSelect = (option) => {
    if (selectedAnswer !== null) return;
    sounds.playGentleTap();
    setSelectedAnswer(option);

    const activeQ = questions[currentQIndex];
    const isCorrect = option === activeQ.correct;

    if (isCorrect) {
      sounds.playSuccess();
      setFeedback({ type: 'success', text: '❤️ Great observation! That is correct.' });
      setCorrectCount(c => c + 1);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! It was the ${activeQ.correct}.` });
    }

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(i => i + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const accuracy = Math.round((finalCorrect / questions.length) * 100);
        const totalSecs = Math.max(12, Math.round((Date.now() - startTime) / 1000));
        const avgResp = Math.max(2, Math.round(totalSecs / questions.length));

        onComplete({
          gameId: 'picture-memory',
          gameName: 'Remember the Picture',
          category: 'attention',
          accuracy,
          correctAnswers: finalCorrect,
          incorrectAnswers: questions.length - finalCorrect,
          responseTime: avgResp,
          timeTaken: `${totalSecs} seconds`,
          difficulty: `Level ${currentLevel}`
        });
      }
    }, 1800);
  };

  const activeQ = questions[currentQIndex] || questions[0];

  return (
    <GameContainer
      title="Remember the Picture"
      subtitle={`Level ${currentLevel} • ${phase === 'observe' ? `Study scene (${timer}s)` : `Question ${currentQIndex + 1} of ${questions.length}`}`}
      onExit={onExit}
      instructionText={
        phase === 'observe'
          ? "Look closely at the garden scene and remember what you see."
          : activeQ.q
      }
    >
      {phase === 'observe' ? (
        <div className="space-y-4">
          <div className="bg-[#EAF2FF] p-3 rounded-2xl text-center border border-[#CFE1FF]">
            <p className="text-sm font-extrabold text-[#2F6FED]">
              👀 Look closely at everything in the peaceful garden scene:
            </p>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Timer: {timer} seconds remaining (Level {currentLevel})
            </p>
          </div>

          {/* Calm Garden Scene Illustration */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#E0F2FE] via-[#BAE6FD] to-[#86EFAC] p-6 border-4 border-white shadow-md overflow-hidden min-h-[220px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-4xl">☀️</span>
              <span className="text-3xl opacity-80">☁️</span>
            </div>

            <div className="flex items-end justify-around text-center pt-8">
              <div className="flex flex-col items-center">
                <span className="text-5xl">🏡</span>
                <span className="text-xs font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-full mt-1">Yellow House</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl">🚗</span>
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full mt-1">Red Car</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl">🌳</span>
                <span className="text-4xl -mt-4">🐕</span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mt-1">Friendly Dog</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl">🚲</span>
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full mt-1">Bicycle</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSkipToQuestions}
            variant="primary"
            size="lg"
            fullWidth
          >
            I HAVE REMEMBERED →
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center shadow-sm">
            <span className="text-3xl mb-2 block">❓</span>
            <h3 className="text-xl font-extrabold text-[#172B4D]">
              {activeQ.q}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeQ.options.map((opt, i) => {
              let btnStyle = 'bg-white border-2 border-slate-200 text-[#172B4D] hover:border-[#2F6FED]';
              if (selectedAnswer) {
                if (opt === activeQ.correct) {
                  btnStyle = 'bg-[#E8F5E9] border-2 border-[#2E7D32] text-[#2E7D32] font-extrabold';
                } else if (opt === selectedAnswer) {
                  btnStyle = 'bg-[#FFF8E1] border-2 border-amber-400 text-amber-900';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={selectedAnswer !== null}
                  onClick={() => handleSelect(opt)}
                  className={`p-5 rounded-2xl text-lg font-bold transition-all shadow-sm active:scale-98 touch-target ${btnStyle}`}
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
    </GameContainer>
  );
}

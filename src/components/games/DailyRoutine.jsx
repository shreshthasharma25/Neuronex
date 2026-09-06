import React, { useState, useMemo } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';
import { Clock, CheckCircle2 } from 'lucide-react';
import { generateDailyRoutineSession } from '../../utils/adaptiveEngine';

export default function DailyRoutine({ onComplete, onExit, reshuffleKey = 0 }) {
  const { patientData } = useApp();
  const preferredName = patientData.profile?.preferredName || patientData.profile?.fullName || 'Friend';
  const catLevels = patientData.cognitiveStats?.categoryLevels || {};
  const currentLevel = catLevels.sequencing || patientData.cognitiveStats?.currentLevel || 1;

  // Generate dynamic questions from caregiver routine or familiar elder schedule
  const session = useMemo(() => {
    return generateDailyRoutineSession(patientData.routine, currentLevel);
  }, [patientData.routine, currentLevel, reshuffleKey]);

  const questions = session.questions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  if (!questions || questions.length === 0) {
    return (
      <GameContainer title="Daily Routine" subtitle="What Comes Next?" onExit={onExit}>
        <div className="py-8 text-center">
          <p className="text-slate-600 font-bold">Ask your caregiver to add daily routine milestones.</p>
          <div className="pt-4 max-w-xs mx-auto">
            <Button onClick={onExit} size="lg" fullWidth variant="secondary">Back to Games</Button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const activeQ = questions[currentIdx] || questions[0];

  const handleSelect = (option) => {
    if (selected !== null) return;
    sounds.playGentleTap();
    setSelected(option);

    const isCorrect = option === activeQ.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
      setFeedback({ type: 'success', text: `❤️ Exactly right, ${preferredName}! That is your routine.` });
      setCorrectCount(c => c + 1);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! It is: ${activeQ.correctAnswer}.` });
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelected(null);
        setFeedback(null);
      } else {
        const total = questions.length;
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const accuracy = Math.round((finalCorrect / total) * 100);
        const totalSecs = Math.max(10, Math.round((Date.now() - startTime) / 1000));
        const avgResp = Math.max(2, Math.round(totalSecs / total));

        onComplete({
          gameId: 'daily-routine',
          gameName: 'Daily Routine',
          category: 'sequencing',
          accuracy,
          correctAnswers: finalCorrect,
          incorrectAnswers: total - finalCorrect,
          responseTime: avgResp,
          timeTaken: `${totalSecs} seconds`,
          difficulty: `Level ${currentLevel}`
        });
      }
    }, 1300);
  };

  return (
    <GameContainer
      title="Daily Routine"
      subtitle={`Level ${currentLevel} • Question ${currentIdx + 1} of ${questions.length}`}
      onExit={onExit}
      instructionText="Recall your circadian routine. What activity comes next?"
    >
      <div className="space-y-6 text-center">
        {/* Clock visual */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-[#EAF2FF] border-2 border-[#CFE1FF] text-[#2F6FED] flex items-center justify-center text-4xl shadow-sm">
          ⏰
        </div>

        <div>
          <span className="text-xs font-extrabold text-[#2F6FED] uppercase tracking-wider">
            Daily Circadian Step
          </span>
          <h3 className="text-2xl font-extrabold text-[#172B4D] mt-1">
            {activeQ.question}
          </h3>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            {activeQ.subtext}
          </p>
        </div>

        {feedback && (
          <div className={`p-3 rounded-2xl text-center text-sm font-bold animate-in fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          {activeQ.options.map((opt, idx) => {
            const isSelected = selected === opt;
            const isCorrect = opt === activeQ.correctAnswer;
            let btnStyle = 'bg-white border-2 border-slate-200 hover:border-[#2F6FED] text-[#172B4D]';

            if (selected !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 shadow-sm';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-800';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
                className={`p-4 rounded-2xl font-extrabold text-base text-center transition-all shadow-xs touch-target ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
}

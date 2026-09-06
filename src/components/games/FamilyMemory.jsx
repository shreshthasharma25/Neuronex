import React, { useState, useMemo } from 'react';
import GameContainer from './GameContainer';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';
import { Heart, CheckCircle2, User, Sparkles } from 'lucide-react';
import { generateFamilyMemorySession } from '../../utils/adaptiveEngine';

export default function FamilyMemory({ onComplete, onExit, reshuffleKey = 0 }) {
  const { patientData } = useApp();
  const familyList = patientData.family || [];
  const memoriesList = patientData.memories || [];
  const preferredName = patientData.profile?.preferredName || patientData.profile?.fullName || 'Friend';
  const catLevels = patientData.cognitiveStats?.categoryLevels || {};
  const currentLevel = catLevels.memory || patientData.cognitiveStats?.currentLevel || 1;

  // If no family entered, display clear notice without inventing fake data
  if (familyList.length === 0 && memoriesList.length === 0) {
    return (
      <GameContainer
        title="Family Memory"
        subtitle="Family Quiz & Faces"
        onExit={onExit}
      >
        <div className="py-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8E1] text-amber-600 flex items-center justify-center mx-auto text-4xl shadow-sm">
            👨‍👩‍👧
          </div>
          <h3 className="text-2xl font-extrabold text-[#172B4D]">
            No Family Memories Yet
          </h3>
          <p className="text-base text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
            Your family member has not added any people or memories yet.
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Once your family adds people in the Family portal, personalized photos and memory questions will appear here!
          </p>
          <div className="pt-4 max-w-xs mx-auto">
            <Button onClick={onExit} size="lg" fullWidth variant="secondary">
              Back to Games Library
            </Button>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Generate dynamic questions from actual patient family & memories
  const session = useMemo(() => {
    return generateFamilyMemorySession(familyList, memoriesList, currentLevel, reshuffleKey);
  }, [familyList, memoriesList, currentLevel, reshuffleKey]);

  const questions = session.questions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime] = useState(Date.now());

  if (questions.length === 0) {
    return (
      <GameContainer title="Family Memory" subtitle="Family Quiz & Faces" onExit={onExit}>
        <div className="py-8 text-center">
          <p className="text-slate-600 font-bold">Ask your family member to personalize your family people.</p>
          <div className="pt-4 max-w-xs mx-auto">
            <Button onClick={onExit} size="lg" fullWidth variant="secondary">Back to Games</Button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (option) => {
    if (selectedOption !== null) return;
    sounds.playGentleTap();
    setSelectedOption(option);

    const isCorrect = option.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    if (isCorrect) {
      sounds.playSuccess();
      const nameOrTitle = currentQ.person?.name || currentQ.correctAnswer;
      setFeedback({ type: 'success', text: `❤️ Exactly right, ${preferredName}! ${nameOrTitle}!` });
      setCorrectAnswersCount(c => c + 1);
    } else {
      setFeedback({ type: 'gentle', text: `😊 Almost! The answer is: ${currentQ.correctAnswer}.` });
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        const total = questions.length;
        const finalCorrect = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
        const accuracy = Math.round((finalCorrect / total) * 100);
        const totalSecs = Math.max(10, Math.round((Date.now() - startTime) / 1000));
        const avgResp = Math.max(2, Math.round(totalSecs / total));

        onComplete({
          gameId: 'family-memory',
          gameName: 'Family Memory',
          category: 'memory',
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
      title="Family Memory"
      subtitle={`Level ${currentLevel} • Question ${currentIdx + 1} of ${questions.length}`}
      onExit={onExit}
      instructionText="Look at the familiar photo and choose the loving relationship."
    >
      <div className="space-y-6 text-center">
        {/* Memory Photo / Face Card */}
        <div className="w-36 h-36 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-[#FFF8E1] flex items-center justify-center relative">
          {currentQ.photo ? (
            <img
              src={currentQ.photo}
              alt={currentQ.question}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-5xl text-[#2F6FED]">
              {currentQ.type === 'person' ? '👤' : '📸'}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-extrabold text-[#2F6FED] uppercase tracking-wider">
            {currentQ.type === 'person' ? `Family Person • ${currentQ.person?.name}` : 'Family Keepsake'}
          </span>
          <h3 className="text-2xl font-extrabold text-[#172B4D] mt-1">
            {currentQ.question}
          </h3>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            {currentQ.subtext}
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
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrectAnswer = opt.toLowerCase() === currentQ.correctAnswer.toLowerCase();
            let buttonStyle = 'bg-white border-2 border-slate-200 hover:border-[#2F6FED] text-[#172B4D]';

            if (selectedOption !== null) {
              if (isCorrectAnswer) {
                buttonStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 shadow-sm';
              } else if (isSelected) {
                buttonStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-800';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={selectedOption !== null}
                className={`p-4 rounded-2xl font-extrabold text-lg text-center transition-all shadow-xs touch-target ${buttonStyle}`}
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

import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ReminderBanner from './ReminderBanner';
import TodoList from './TodoList';
import { useApp } from '../../context/AppContext';
import { Brain, Sparkles, MapPin, Mic, Phone, Heart, CheckCircle2, Volume2, User, Clock } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { evaluateTimeBasedAlerts } from '../../utils/alertEngine';

export default function PatientHome({ onStartExercise, onOpenGame }) {
  const {
    patientData,
    toggleMedicine,
    toggleTodo,
    setActiveModal,
    setActiveTab,
    hasSpokenGreeting,
    markGreetingSpoken,
    t,
    language
  } = useApp();

  const { profile, medicines, todos, brainExercise, homeLocation, cognitiveStats } = patientData;
  const preferredName = profile.preferredName || profile.fullName || 'Friend';
  const currentLevel = cognitiveStats?.currentLevel || 1;

  // Real-time dynamic clock updated every 30 seconds
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return t('home.goodMorning', { name: preferredName });
    }
    if (hour >= 12 && hour < 17) {
      return t('home.goodAfternoon', { name: preferredName });
    }
    if (hour >= 17 && hour < 21) {
      return t('home.goodEvening', { name: preferredName });
    }
    return t('home.goodNight', { name: preferredName });
  };

  const getLocaleTag = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'bn': return 'bn-IN';
      case 'as': return 'as-IN';
      case 'ta': return 'ta-IN';
      default: return 'en-US';
    }
  };

  const todayDate = currentTime.toLocaleDateString(getLocaleTag(language), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Automatically greet patient via voice ONLY ONCE per app session
  useEffect(() => {
    if (!hasSpokenGreeting) {
      markGreetingSpoken();
      setTimeout(() => {
        sounds.speak(`${getGreeting()}. ${todayDate}.`, {
          lang: getLocaleTag(language)
        });
      }, 600);
    }
  }, [hasSpokenGreeting, markGreetingSpoken, language]);

  // Time-Based Smart Alert Engine evaluation
  const { activeAlert, allAlerts, dueCount } = evaluateTimeBasedAlerts(patientData, currentTime);

  const handleSpeakGreeting = () => {
    sounds.speak(`${getGreeting()}. ${todayDate}, ${formattedTime}.`, {
      lang: getLocaleTag(language)
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* 1. Dynamic Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              {getGreeting()}
            </h1>
            <button
              onClick={handleSpeakGreeting}
              className="p-1.5 rounded-full text-slate-400 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors"
              title="Listen to greeting"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-base text-slate-500 font-semibold mt-1 flex items-center gap-2">
            <span>{todayDate}</span>
            <span>•</span>
            <span className="text-[#2F6FED] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </span>
          </p>
        </div>

        {/* User-Provided Profile Photo or Neutral Placeholder */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-[#EAF2FF] flex items-center justify-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={preferredName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-[#2F6FED]" />
          )}
        </div>
      </div>

      {/* 2. Time-Based Smart Reminder Alert */}
      {activeAlert && !activeAlert.isCompleted ? (
        <ReminderBanner
          alert={activeAlert}
          onMarkDone={(id, item) => {
            if (item?.type === 'medicine') {
              toggleMedicine(id);
            } else {
              toggleTodo(id);
            }
          }}
          onRemindLater={() => {}}
        />
      ) : medicines.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
          <span className="text-xl mb-1 block">💊</span>
          <h4 className="text-sm font-extrabold text-[#172B4D]">
            {t('home.noMedicines')}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t('emergency.askCaregiver')}
          </p>
        </div>
      ) : null}

      {/* 3. PROMINENT CARD: TODAY'S BRAIN EXERCISE (WITH DYNAMIC LEVEL) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8E1] via-[#FEF3C7] to-[#FFFBEB] border-2 border-[#FFC857] p-4 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('games.level', { level: currentLevel })}</span>
          </div>
          <span className="text-2xl sm:text-3xl">🧠</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mb-1.5 sm:mb-2">
          {brainExercise.dailyCompleted ? t('games.wellDone') : t('home.todayExerciseTitle')}
        </h2>

        <p className="text-sm sm:text-base text-slate-700 font-medium mb-4 sm:mb-5 max-w-sm leading-relaxed">
          {brainExercise.dailyCompleted
            ? t('games.exerciseComplete')
            : t('home.todayExerciseSubtitle')}
        </p>

        {/* Action Button */}
        {brainExercise.dailyCompleted ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setActiveTab('games')}
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-white border-2 border-amber-300 text-amber-900 font-bold"
            >
              {t('home.exploreGames')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onStartExercise}
            variant="yellow"
            size="xl"
            fullWidth
            icon={Brain}
            className="text-xl shadow-md font-extrabold"
          >
            {t('home.startExercise')}
          </Button>
        )}
      </div>


      {/* 4. Quick Action Cards (Safe Home, Voice Assistant, Emergency Help) */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-3">
          {t('role.selectRoleSubtitle')}
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Safe Home */}
          <button
            onClick={() => setActiveModal('my-home')}
            className="flex flex-col items-center text-center p-3 sm:p-4 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#2F6FED] transition-all shadow-sm active:scale-95 touch-target group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-xl sm:text-2xl mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
              🏠
            </div>
            <span className="text-[11px] sm:text-sm font-extrabold text-[#172B4D] leading-tight block">
              {t('home.guideMeHome')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate max-w-full">
              {homeLocation?.city || 'GPS'}
            </span>
          </button>

          {/* Voice Assistant */}
          <button
            onClick={() => setActiveModal('voice-assistant')}
            className="flex flex-col items-center text-center p-3 sm:p-4 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#2F6FED] transition-all shadow-sm active:scale-95 touch-target group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF8E1] text-amber-700 flex items-center justify-center text-xl sm:text-2xl mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
              🎙️
            </div>
            <span className="text-[11px] sm:text-sm font-extrabold text-[#172B4D] leading-tight block">
              {t('home.talkToMe')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
              AI
            </span>
          </button>

          {/* Emergency Help */}
          <button
            onClick={() => setActiveModal('emergency')}
            className="flex flex-col items-center text-center p-3 sm:p-4 rounded-3xl bg-[#FDECEC] hover:bg-[#fcdddd] border-2 border-rose-300 transition-all shadow-sm active:scale-95 touch-target group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center text-xl sm:text-2xl mb-1.5 sm:mb-2 group-hover:scale-105 transition-transform">
              🆘
            </div>
            <span className="text-[11px] sm:text-sm font-extrabold text-[#D32F2F] leading-tight block">
              {t('home.emergencyHelp')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-rose-700 font-semibold mt-0.5">
              SOS
            </span>
          </button>
        </div>
      </div>


      {/* 5. Today's To-Do List */}
      <TodoList
        todos={todos}
        onToggleTodo={(id) => toggleTodo(id)}
        preferredName={preferredName}
      />

      {/* 6. Friendly Reassurance Footer */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-400 font-medium">
          NeuroNex ❤️
        </p>
      </div>
    </div>
  );
}

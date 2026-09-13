import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ReminderBanner from './ReminderBanner';
import TodoList from './TodoList';
import { useApp } from '../../context/AppContext';
import { Brain, Sparkles, MapPin, Mic, Phone, Heart, CheckCircle2, Volume2, User, Clock, ArrowRight, Compass, Sun, Leaf } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { evaluateTimeBasedAlerts } from '../../utils/alertEngine';
import {
  MajuliIslandHeader,
  TraditionalGamchaBorder,
  TribalGeometricDivider,
  BambooWeaveDivider,
  OrchidFloraIcon,
  TeaLeafSprig,
  SubtleMistyMountains,
  RegionalTextileBorder,
  BambooBorder
} from '../common/CulturalMotifs';

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
    <div className="relative min-h-full pb-32 overflow-hidden bg-[#F5FAF6]">
      {/* 1. MAJULI ISLAND SUNRISE & TRADITIONAL GAMCHA HEADER WITH DYNAMIC GREETING */}
      <MajuliIslandHeader className="w-full shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Top Row: North-East Landmark Tag & Original-Sized Patient Avatar */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D98A1E]/40 text-[#92540B] text-xs font-black shadow-xs">
              <OrchidFloraIcon className="w-4 h-4" />
              <span className="tracking-wide">Majuli Island Sunrise • Brahmaputra Waters</span>
            </div>

            {/* User-Provided Profile Photo - REDUCED TO ORIGINAL SIZE (w-14 h-14) */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-[#EBF5EE] flex items-center justify-center relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={preferredName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-[#1E5E3A]" />
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1E5E3A] text-white flex items-center justify-center text-[9px] shadow-xs">
                ❤️
              </div>
            </div>
          </div>

          {/* Greeting Box on Crisp Misty White Canvas with Gamosa Accent */}
          <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#D8E2D9] shadow-xs relative overflow-hidden">
            {/* Traditional Terracotta Red & Muga Gold Trim */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BA1A1A] via-[#D98A1E] to-[#BA1A1A]" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#162832] tracking-tight font-serif">
                    {getGreeting()}
                  </h1>
                  <button
                    onClick={handleSpeakGreeting}
                    className="p-1.5 rounded-full text-slate-400 hover:text-[#1E5E3A] hover:bg-[#EBF5EE] transition-colors touch-target"
                    title="Listen to greeting"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-semibold mt-0.5">
                  Your memory journey awaits today.
                </p>
                <p className="text-xs text-[#1E5E3A] font-bold mt-1 flex items-center gap-2">
                  <span>{todayDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1E5E3A]" />
                    {formattedTime}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </MajuliIslandHeader>

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. TIME-BASED SMART REMINDER ALERT (IF DUE) */}
        {activeAlert && !activeAlert.isCompleted ? (
          <div className="relative z-10 animate-in fade-in duration-200">
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
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-4 rounded-3xl bg-white border border-[#D8E2D9] text-center shadow-xs">
            <span className="text-2xl mb-1 block">💊</span>
            <h4 className="text-sm font-extrabold text-[#162832]">
              {t('home.noMedicines')}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {t('emergency.askCaregiver')}
            </p>
          </div>
        ) : null}

        {/* 3. TODAY'S MEMORY JOURNEY (THE IMMERSIVE EXPERIENCE) */}
        <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#FFF9EE] via-[#FDF5E2] to-[#EBF5EE] border-2 border-[#C68215]/50 p-5 sm:p-7 shadow-tea z-10">
          {/* Subtle tea leaf watermarks */}
          <div className="absolute top-2 right-2 opacity-15 pointer-events-none">
            <TeaLeafSprig className="w-28 h-28 text-[#1E5E3A]" />
          </div>

          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-[#C68215]/30 text-[#8C5808] text-xs font-black uppercase tracking-wider shadow-2xs">
              <TeaLeafSprig className="w-4 h-4 text-[#1E5E3A]" />
              <span>Today's Memory Journey</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1E5E3A] text-white text-xs font-black shadow-xs">
              Level {currentLevel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#162832] tracking-tight font-display mb-2 relative z-10">
            {brainExercise.dailyCompleted
              ? `🌿 Journey Completed • ${t('games.wellDone')}`
              : "🌿 Tea Garden Recall Walk"}
          </h2>

          <p className="text-sm sm:text-base text-slate-700 font-medium mb-4 max-w-md leading-relaxed relative z-10">
            {brainExercise.dailyCompleted
              ? t('games.exerciseComplete')
              : "Take a peaceful walk through today's memory exercise. Connect pictures, patterns, and cherished memories."}
          </p>

          {/* 3 Step Journey Path Metaphor */}
          <div className="grid grid-cols-3 gap-2 my-4 relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/90 border border-[#C3E2CD] text-center">
              <span className="text-lg block">🌿</span>
              <span className="text-[11px] font-black text-[#162832] block truncate mt-0.5">
                Tea Recall
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                Activity 1
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/90 border border-[#C3E2CD] text-center">
              <span className="text-lg block">🌸</span>
              <span className="text-[11px] font-black text-[#162832] block truncate mt-0.5">
                Orchids
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                Activity 2
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/90 border border-[#C3E2CD] text-center">
              <span className="text-lg block">🏞️</span>
              <span className="text-[11px] font-black text-[#162832] block truncate mt-0.5">
                River Flow
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                Activity 3
              </span>
            </div>
          </div>

          {/* Journey Duration & Activities Note */}
          <div className="flex items-center justify-between text-xs font-bold text-[#1E5E3A] mb-5 relative z-10">
            <span className="flex items-center gap-1.5">
              <span>🌸</span> 3 gentle activities
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> ~10 minutes
            </span>
          </div>

          {/* Action Button */}
          <div className="relative z-10">
            {brainExercise.dailyCompleted ? (
              <Button
                onClick={() => setActiveTab('games')}
                variant="secondary"
                size="xl"
                fullWidth
                className="bg-white border-2 border-[#C3E2CD] text-[#1E5E3A] font-extrabold shadow-sm text-lg"
              >
                <span>🌿 Explore More Activities →</span>
              </Button>
            ) : (
              <Button
                onClick={onStartExercise}
                variant="primary"
                size="xl"
                fullWidth
                icon={Brain}
                className="text-xl shadow-tea font-black bg-[#1E5E3A] hover:bg-[#143B28] tracking-wide"
              >
                <span>BEGIN TODAY'S JOURNEY 🌿</span>
              </Button>
            )}
          </div>
        </div>

        {/* SUBTLE TRIBAL DIVIDER */}
        <TribalGeometricDivider height={6} className="my-1 opacity-70" />

        {/* 4. VISUAL ACTIVITY LANDSCAPE / QUICK ACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <OrchidFloraIcon className="w-4 h-4" />
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Comfort & Safety Sanctuary
              </h3>
            </div>
            <span className="text-xs font-bold text-[#1E5E3A]">
              Always Here for You
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Guide Me Home */}
            <button
              onClick={() => setActiveModal('my-home')}
              className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl bg-white hover:bg-[#F5FAF6] border-2 border-[#D8E2D9] hover:border-[#1E5E3A] transition-all shadow-sm active:scale-95 touch-target group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform border border-[#C3E2CD] shadow-xs">
                🏠
              </div>
              <span className="text-xs sm:text-sm font-black text-[#162832] leading-tight block">
                {t('home.guideMeHome')}
              </span>
              <span className="text-[10px] text-slate-500 font-bold mt-0.5 truncate max-w-full">
                {homeLocation?.city || 'Home GPS'}
              </span>
            </button>

            {/* Talk to Me (Voice AI) */}
            <button
              onClick={() => setActiveModal('voice-assistant')}
              className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl bg-white hover:bg-[#FFFDF7] border-2 border-[#D8E2D9] hover:border-[#C68215] transition-all shadow-sm active:scale-95 touch-target group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF6E5] text-[#C68215] flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform border border-[#F7D59A] shadow-xs">
                🎙️
              </div>
              <span className="text-xs sm:text-sm font-black text-[#162832] leading-tight block">
                {t('home.talkToMe')}
              </span>
              <span className="text-[10px] text-[#8C5808] font-bold mt-0.5">
                AI Companion
              </span>
            </button>

            {/* Emergency SOS */}
            <button
              onClick={() => setActiveModal('emergency')}
              className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl bg-[#FDF2F2] hover:bg-[#FCE5E5] border-2 border-[#F5C2C2] hover:border-[#BA1A1A] transition-all shadow-sm active:scale-95 touch-target group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#BA1A1A] text-white flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform shadow-sm">
                🆘
              </div>
              <span className="text-xs sm:text-sm font-black text-[#BA1A1A] leading-tight block">
                {t('home.emergencyHelp')}
              </span>
              <span className="text-[10px] text-rose-700 font-bold mt-0.5">
                Emergency SOS
              </span>
            </button>
          </div>
        </div>

        {/* SUBTLE BAMBOO WEAVE DIVIDER */}
        <BambooWeaveDivider height={5} className="my-1 opacity-70" />

        {/* 5. DAILY LIVING & RHYTHM (TO-DO LIST) */}
        <div>
          <TodoList
            todos={todos}
            onToggleTodo={(id) => toggleTodo(id)}
            preferredName={preferredName}
          />
        </div>

        {/* 6. CULTURAL REASSURANCE & TRADITIONAL GAMCHA FOOTER */}
        <div className="relative pt-4 text-center">
          <TraditionalGamchaBorder height={10} showFringes={true} className="mb-3 opacity-90 rounded-sm" />
          <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
            Caring for your memories like the timeless waters of Majuli & the hills of the North-East • NeuroNex ❤️
          </p>
        </div>
      </div>
    </div>
  );
}


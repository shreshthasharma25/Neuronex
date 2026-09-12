import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Brain, Heart, User, Volume2, Shield, ArrowLeft } from 'lucide-react';
import PatientHome from './PatientHome';
import MyMemories from './MyMemories';
import GameLibrary from '../games/GameLibrary';
import MyHomeModal from './MyHomeModal';
import EmergencyModal from './EmergencyModal';
import VoiceAssistant from './VoiceAssistant';
import { sounds } from '../../utils/soundPlayer';

export default function PatientLayout({ onStartExercise, onOpenGame }) {
  const {
    activeTab,
    setActiveTab,
    setUserRole,
    activeModal,
    setActiveModal,
    patientData,
    backToAllPatients
  } = useApp();

  const preferredName = patientData?.profile?.preferredName || patientData?.profile?.fullName || 'Maa';

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, emoji: '🏠' },
    { id: 'games', label: 'GAMES', icon: Brain, emoji: '🧠' },
    { id: 'memories', label: 'MY MEMORIES', icon: Heart, emoji: '❤️' },
  ];

  const handleNavClick = (tabId) => {
    sounds.playGentleTap();
    setActiveTab(tabId);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] relative overflow-hidden">
      {/* Top Navigation Banner: Back to All Patients */}
      <div className="bg-[#1E293B] text-white px-3 sm:px-4 py-2 flex items-center justify-between z-30 text-xs shadow-md border-b border-slate-700">
        <button
          type="button"
          onClick={() => {
            sounds.playGentleTap();
            backToAllPatients();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F6FED] hover:bg-blue-600 text-white font-extrabold transition-all shadow-sm active:scale-95 touch-target"
          title="Return to Caregiver Portal showing all patients"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to All Patients</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-slate-300 hidden sm:inline text-[11px]">
            Viewing: <strong className="text-white">{preferredName}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setUserRole('caregiver');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition-all text-xs"
            title="Switch to Caregiver Dashboard"
          >
            Caregiver 🩺
          </button>
        </div>
      </div>
      {/* Top Patient Header */}
      <header className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2F6FED] text-white flex items-center justify-center text-xl shadow-sm">
            🧠
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#172B4D] tracking-tight">
              NeuroNex
            </h2>
            <span className="text-[11px] font-bold text-[#2F6FED]">
              Memory Companion
            </span>
          </div>
        </div>

        {/* Patient Loving Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#EAF2FF] border border-[#CFE1FF] text-xs font-extrabold text-[#2F6FED] flex items-center gap-1">
            <span>❤️</span>
            <span>{preferredName}</span>
          </span>
          <button
            onClick={() => sounds.speak(`Welcome to NeuroNex, ${preferredName}. We are here to help you remember and stay safe.`)}
            className="p-2 rounded-full text-slate-400 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors touch-target"
            title="Read screen aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <PatientHome
            onStartExercise={onStartExercise}
            onOpenGame={onOpenGame}
          />
        )}
        {activeTab === 'games' && (
          <GameLibrary onOpenGame={onOpenGame} />
        )}
        {activeTab === 'memories' && (
          <MyMemories />
        )}
      </main>

      {/* Bottom Sticky Patient Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-30 shadow-lg">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-target ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#2F6FED] font-extrabold shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold'
                }`}
              >
                <span className="text-xl mb-0.5">{item.emoji}</span>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Overlays / Modals */}
      <MyHomeModal
        isOpen={activeModal === 'my-home'}
        onClose={() => setActiveModal(null)}
      />
      
      <EmergencyModal
        isOpen={activeModal === 'emergency'}
        onClose={() => setActiveModal(null)}
      />

      <VoiceAssistant
        isOpen={activeModal === 'voice-assistant'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

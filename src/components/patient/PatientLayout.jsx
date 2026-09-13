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
import { GamosaRibbon, TeaLeafSprig, RegionalTextileBorder } from '../common/CulturalMotifs';
import NeuronexLogo from '../common/NeuronexLogo';

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
    <div className="flex flex-col h-full bg-[#F5FAF6] relative overflow-hidden">
      {/* Top Navigation Banner: Back to All Patients */}
      <div className="bg-[#162832] text-white px-3 sm:px-4 py-2 flex items-center justify-between z-30 text-xs shadow-md border-b border-[#244253]">
        <button
          type="button"
          onClick={() => {
            sounds.playGentleTap();
            backToAllPatients();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E5E3A] hover:bg-[#164E30] text-white font-extrabold transition-all shadow-sm active:scale-95 touch-target"
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
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all text-xs border border-slate-700"
            title="Switch to Caregiver Dashboard"
          >
            Caregiver 🩺
          </button>
        </div>
      </div>

      {/* Top Patient Header */}
      <header className="px-4 sm:px-5 py-2.5 bg-white border-b border-[#D8E2D9] flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <NeuronexLogo variant="compact" size="md" />

        {/* Patient Loving Pill in Muga Golden Silk Styling */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FFF6E5] border border-[#F7D59A] text-xs font-extrabold text-[#92540B] flex items-center gap-1 shadow-2xs">
            <span>❤️</span>
            <span>{preferredName}</span>
          </span>
          <button
            onClick={() => sounds.speak(`Welcome to NeuroNex, ${preferredName}. We are here to help you remember and stay safe.`)}
            className="p-2 rounded-full text-slate-400 hover:text-[#1E5E3A] hover:bg-[#EBF5EE] transition-colors touch-target"
            title="Read screen aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Cultural Regional Textile Geometric Trim */}
      <RegionalTextileBorder height={4} />

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

      {/* Bottom Sticky Patient Navigation with Nature-Inspired Active States */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-[#D8E2D9] px-3 py-2 z-30 shadow-xl rounded-t-3xl">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 touch-target relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-[#1E5E3A] to-[#143B28] text-white font-black shadow-tea'
                    : 'text-slate-600 hover:text-[#162832] hover:bg-[#FAF7F2] font-extrabold'
                }`}
              >
                {/* Active leaf accent dot */}
                {isActive && (
                  <span className="absolute top-1 right-2 text-[9px] text-amber-300">✦</span>
                )}
                <span className="text-xl mb-0.5">{item.emoji}</span>
                <span className="text-[11px] tracking-wider uppercase font-sans font-extrabold">{item.label}</span>
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

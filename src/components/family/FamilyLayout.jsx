import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import FamilyOverview from './FamilyOverview';
import FamilyPeople from './FamilyPeople';
import FamilyMemories from './FamilyMemories';
import FamilyPlaces from './FamilyPlaces';
import FamilyPersonalInfo from './FamilyPersonalInfo';
import FamilyGamePreview from './FamilyGamePreview';
import FamilyAlerts from './FamilyAlerts';
import { LayoutDashboard, Users, Heart, MapPin, Sparkles, Brain, Bell, ArrowLeft, ArrowRight, Menu, X } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyLayout() {
  const {
    familyTab,
    setFamilyTab,
    patientData,
    setUserRole,
    t
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { profile, alerts } = patientData;
  const preferredName = profile.preferredName || 'Maa';

  // Count pending safety/family alerts
  const familyAlerts = (alerts || []).filter(a =>
    !a.recipients || a.recipients.includes('family') || a.type === 'warning' || a.severity === 'WARNING' || a.severity === 'URGENT'
  );
  const pendingAlertsCount = familyAlerts.filter(a => !a.resolved).length;

  const tabs = [
    { id: 'overview', label: t('familyPortal.overview'), icon: LayoutDashboard },
    { id: 'family', label: t('familyPortal.people'), icon: Users },
    { id: 'memories', label: t('familyPortal.memories'), icon: Heart },
    { id: 'places', label: t('familyPortal.places'), icon: MapPin },
    { id: 'personal-info', label: t('familyPortal.personalInfo'), icon: Sparkles },
    { id: 'games', label: t('familyPortal.games'), icon: Brain },
    { id: 'alerts', label: t('familyPortal.alerts'), icon: Bell, badge: pendingAlertsCount },
  ];

  const currentTabObj = tabs.find(t => t.id === familyTab) || tabs[0];
  const CurrentIcon = currentTabObj.icon;

  const handleTabClick = (tabId) => {
    sounds.playGentleTap();
    setFamilyTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7FC] relative">
      {/* Family Top Header */}
      <header className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Brand / Title / Patient Info */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => {
                sounds.playGentleTap();
                setUserRole('patient');
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-[#172B4D] hover:bg-slate-100 transition-colors sm:hidden flex-shrink-0 touch-target flex items-center justify-center"
              title="Switch to patient"
              aria-label="Switch to patient mode"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-lg font-extrabold text-[#172B4D] truncate">
                  {t('familyPortal.title')}
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-[10px] sm:text-xs font-extrabold flex-shrink-0">
                  {t('role.familyRole')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">
                {preferredName} ({profile.fullName || 'Patient'})
              </p>
            </div>
          </div>

          {/* Right: Active Tab Indicator + Hamburger (Mobile) / Desktop Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Desktop Action Switchers */}
            <button
              onClick={() => setUserRole('caregiver')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8E1] hover:bg-amber-100 text-[#B45309] text-xs font-bold border border-[#FDE68A] transition-all"
            >
              <span>{t('caregiverPortal.title')} 🩺</span>
            </button>

            <button
              onClick={() => setUserRole('patient')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF2FF] hover:bg-[#d8e7ff] text-[#2F6FED] text-xs font-bold border border-[#CFE1FF] transition-all"
            >
              <span>{t('role.patientRole')} 🧓</span>
            </button>

            {/* Mobile Active Tab Indicator Button (tappable to toggle menu) */}
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="flex md:hidden items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#EAF2FF] text-[#2F6FED] text-xs font-bold max-w-[110px] sm:max-w-[130px] truncate touch-target"
              title="Current section (tap to change)"
            >
              <CurrentIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">{currentTabObj.label}</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`flex md:hidden relative p-2.5 rounded-xl border transition-all touch-target items-center justify-center flex-shrink-0 ${
                mobileMenuOpen
                  ? 'bg-[#2F6FED] text-white border-[#2F6FED] shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
              {pendingAlertsCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {pendingAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Tab Strip */}
        <div className="hidden md:flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {tabs.map(tab => {
            const isActive = familyTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-target ${
                  isActive
                    ? 'bg-[#2F6FED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-[#2F6FED]' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Menu Sheet (Attached cleanly to header) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-[56px] sm:top-[64px] bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Drawer Content */}
            <div className="absolute top-full left-0 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto p-3.5 sm:p-4 md:hidden animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Family Portal Menu
                  </span>
                  <span className="text-xs font-bold text-[#172B4D]">
                    Caring for {preferredName}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 touch-target flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tab Links */}
              <div className="space-y-1">
                {tabs.map(tab => {
                  const isActive = familyTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-[46px] touch-target ${
                        isActive
                          ? 'bg-[#2F6FED] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          isActive ? 'bg-white text-[#2F6FED]' : 'bg-rose-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Perspective Switcher in Mobile Menu */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Switch Perspective
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sounds.playGentleTap();
                      setUserRole('caregiver');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF8E1] hover:bg-amber-100 text-[#B45309] text-xs font-extrabold border border-[#FDE68A] transition-all min-h-[42px] touch-target"
                  >
                    <span>🩺</span>
                    <span>Caregiver</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playGentleTap();
                      setUserRole('patient');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#d8e7ff] text-[#2F6FED] text-xs font-extrabold border border-[#CFE1FF] transition-all min-h-[42px] touch-target"
                  >
                    <span>🧓</span>
                    <span>Patient</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Family Content Area */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-3.5 sm:py-6 max-w-4xl mx-auto w-full">
        {familyTab === 'overview' && (
          <FamilyOverview onNavigateTab={(tab) => setFamilyTab(tab)} />
        )}
        {familyTab === 'family' && (
          <FamilyPeople />
        )}
        {familyTab === 'memories' && (
          <FamilyMemories />
        )}
        {familyTab === 'places' && (
          <FamilyPlaces />
        )}
        {familyTab === 'personal-info' && (
          <FamilyPersonalInfo />
        )}
        {familyTab === 'games' && (
          <FamilyGamePreview onGoToFamily={() => setFamilyTab('family')} />
        )}
        {familyTab === 'alerts' && (
          <FamilyAlerts />
        )}
      </main>
    </div>
  );
}


import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Settings, Clock, Globe, Sliders, CheckCircle2, Shield } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function CaregiverSettings() {
  const { patientData, updateProfile, setPatientData, language, setLanguage, t } = useApp();
  const [exerciseTime, setExerciseTime] = useState(patientData.brainExercise.scheduledTime || '10:00 AM');
  const [selectedLanguage, setSelectedLanguage] = useState(patientData.profile.language || language || 'en');
  const [difficultyPreset, setDifficultyPreset] = useState('Adaptive (Automatic)');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleLanguageChange = (val) => {
    setSelectedLanguage(val);
    setLanguage(val);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateProfile({ language: selectedLanguage });
    setLanguage(selectedLanguage);
    setPatientData(prev => ({
      ...prev,
      brainExercise: {
        ...prev.brainExercise,
        scheduledTime: exerciseTime
      }
    }));
    sounds.playSuccess();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-[#EAF2FF] border border-[#CFE1FF] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Configuration
          </span>
          <h2 className="text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Caregiver App Settings
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Fine-tune exercise timings, language support, and cognitive pacing
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-[#2F6FED] flex items-center justify-center text-2xl shadow-sm">
          ⚙️
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Settings saved and synced across all patient views!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Brain Exercise Schedule */}
        <Card variant="white" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#2F6FED]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">
              Daily Brain Exercise Time
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-3">
            The patient will receive their main exercise reminder at this time.
          </p>
          <input
            type="text"
            value={exerciseTime}
            onChange={(e) => setExerciseTime(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-bold text-[#172B4D]"
            placeholder="e.g. 10:00 AM"
          />
        </Card>

        {/* Multi-language Adaptation */}
        <Card variant="white" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-[#2F6FED]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">
              Patient Language Preference
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-3">
            Architected for Smart India Hackathon multilingual regional languages.
          </p>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium text-[#172B4D]"
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="as">Assamese (অসমীয়া)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </Card>

        {/* Cognitive Pacing & Difficulty */}
        <Card variant="white" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-5 h-5 text-[#2F6FED]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">
              Cognitive Engine Adaptation Mode
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-3">
            Automatically adjusts difficulty based on patient accuracy and response time without shame.
          </p>
          <select
            value={difficultyPreset}
            onChange={(e) => setDifficultyPreset(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium text-[#172B4D]"
          >
            <option value="Adaptive (Automatic)">Adaptive (Automatic - Recommended)</option>
            <option value="Gentle / Low Paced">Gentle / Low Paced</option>
            <option value="Standard Comfort">Standard Comfort</option>
          </select>
        </Card>

        <div className="pt-2">
          <Button type="submit" size="lg" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

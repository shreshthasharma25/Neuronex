import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Sparkles, Heart, Utensils, Palette, BookOpen, Coffee, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyPersonalInfo() {
  const { patientData, updatePersonalInfo } = useApp();
  const personalInfo = patientData.personalInfo || {};
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [form, setForm] = useState({
    favoriteFood: personalInfo.favoriteFood || '',
    favoriteColor: personalInfo.favoriteColor || '',
    hobbies: personalInfo.hobbies || '',
    familyFacts: personalInfo.familyFacts || '',
    preferences: personalInfo.preferences || ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePersonalInfo(form);
    sounds.playSuccess();
    showToast(`Personal preferences saved for ${preferredName}!`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#EAF2FF] border border-[#CFE1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Memory Grounding & Comfort
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Personal Information & Preferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Safe, heartwarming details about {preferredName}'s lifelong favorites and family facts. Powers gentle voice companion conversations.
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-[#2F6FED] flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0 self-start sm:self-auto">
          💡
        </div>
      </div>

      <Card variant="white" className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Favorite Food */}
          <div>
            <label className="text-xs font-extrabold text-[#172B4D] flex items-center gap-2 mb-1.5">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span>Favorite Comfort Food</span>
            </label>
            <input
              type="text"
              value={form.favoriteFood}
              onChange={(e) => setForm(prev => ({ ...prev, favoriteFood: e.target.value }))}
              placeholder="e.g., Warm khichuri with roasted papad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Referenced gently during mealtime check-ins.
            </p>
          </div>

          {/* Favorite Color */}
          <div>
            <label className="text-xs font-extrabold text-[#172B4D] flex items-center gap-2 mb-1.5">
              <Palette className="w-4 h-4 text-purple-500" />
              <span>Favorite Color</span>
            </label>
            <input
              type="text"
              value={form.favoriteColor}
              onChange={(e) => setForm(prev => ({ ...prev, favoriteColor: e.target.value }))}
              placeholder="e.g., Soft marigold yellow or sky blue"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          {/* Hobbies & Passions */}
          <div>
            <label className="text-xs font-extrabold text-[#172B4D] flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Important Hobbies & Lifelong Passions</span>
            </label>
            <textarea
              rows={2}
              value={form.hobbies}
              onChange={(e) => setForm(prev => ({ ...prev, hobbies: e.target.value }))}
              placeholder="e.g., Singing Rabindra Sangeet, watering balcony plants, knitting"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          {/* Family Facts */}
          <div>
            <label className="text-xs font-extrabold text-[#172B4D] flex items-center gap-2 mb-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Key Family Facts & Routine Anchors</span>
            </label>
            <textarea
              rows={2}
              value={form.familyFacts}
              onChange={(e) => setForm(prev => ({ ...prev, familyFacts: e.target.value }))}
              placeholder="e.g., Daughter Priya visits every evening around 6 PM; son Rahul calls Sundays."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          {/* Personal Preferences */}
          <div>
            <label className="text-xs font-extrabold text-[#172B4D] flex items-center gap-2 mb-1.5">
              <Coffee className="w-4 h-4 text-amber-700" />
              <span>Daily Comfort Preferences</span>
            </label>
            <input
              type="text"
              value={form.preferences}
              onChange={(e) => setForm(prev => ({ ...prev, preferences: e.target.value }))}
              placeholder="e.g., Likes morning tea at 7 AM with mild ginger"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Save Personal Information
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

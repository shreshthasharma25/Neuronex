import React, { useState, useRef } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { User, Heart, Upload, Camera, Trash2, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';

export default function Registration({ onComplete }) {
  const { patientData, updateProfile } = useApp();

  const [formData, setFormData] = useState({
    fullName: patientData.profile.fullName || '',
    preferredName: patientData.profile.preferredName || '',
    age: patientData.profile.age || '',
    email: patientData.profile.email || '',
    phone: patientData.profile.phone || '',
    gender: patientData.profile.gender || 'Female',
    language: patientData.profile.language || 'English',
    avatar: patientData.profile.avatar || '',
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playGentleTap();
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Url = loadEvent.target?.result;
      setFormData(prev => ({ ...prev, avatar: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    sounds.playGentleTap();
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playSuccess();
    updateProfile({
      ...formData,
      registered: true
    });
    if (onComplete) onComplete();
  };

  return (
    <div className="flex flex-col justify-between min-h-[580px] h-full p-5 sm:p-7 bg-[#FAFBFD] overflow-y-auto">
      <div>
        {/* Screen Title */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            Register Yourself
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Let's personalize your companion with your basic details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PROFILE PHOTO SECTION (REAL UPLOAD & CAMERA ONLY) */}
          <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 text-center">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Profile Photo
            </label>

            <div className="flex flex-col items-center">
              {formData.avatar ? (
                <div className="relative mb-3">
                  <img
                    src={formData.avatar}
                    alt="Uploaded Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#2F6FED] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#EAF2FF] border-2 border-dashed border-[#2F6FED]/40 flex flex-col items-center justify-center text-[#2F6FED] mb-2">
                  <User className="w-10 h-10 stroke-[1.5]" />
                </div>
              )}

              {!formData.avatar && (
                <p className="text-xs text-slate-500 font-medium mb-3">
                  No profile photo added yet
                </p>
              )}

              {/* Photo Upload & Camera Action Buttons */}
              <div className="flex items-center gap-2">
                {/* File Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#d5e5ff] text-[#2F6FED] text-xs font-bold transition-all border border-[#CFE1FF]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                {/* Device Camera */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="user"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-[#172B4D] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#2F6FED] focus:outline-none text-base text-[#172B4D] bg-white font-medium touch-target"
              placeholder="e.g., Ananya Sen"
            />
          </div>

          {/* Critical Preferred Name */}
          <div className="bg-[#EAF2FF] p-4 rounded-2xl border border-[#CFE1FF]">
            <label className="block text-sm font-extrabold text-[#2F6FED] mb-0.5 flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-current text-rose-500" />
              <span>What should we call you? (Important) *</span>
            </label>
            <p className="text-xs text-slate-600 mb-2 font-medium">
              We will greet you with this loving name every morning.
            </p>
            <input
              type="text"
              required
              value={formData.preferredName}
              onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#2F6FED]/30 focus:border-[#2F6FED] focus:outline-none text-lg font-bold text-[#172B4D] bg-white touch-target"
              placeholder="e.g., Maa, Dida, Papa, Dadu"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#172B4D] mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                min="40"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : '' })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#2F6FED] focus:outline-none text-base text-[#172B4D] bg-white font-medium touch-target"
                placeholder="e.g., 68"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#172B4D] mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#2F6FED] focus:outline-none text-base text-[#172B4D] bg-white font-medium touch-target"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Email Address & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#172B4D] mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm text-[#172B4D] bg-white font-medium"
                placeholder="e.g., patient@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#172B4D] mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm text-[#172B4D] bg-white font-medium"
                placeholder="e.g., +91 98765 43210"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-bold text-[#172B4D] mb-1">
              Preferred Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#2F6FED] focus:outline-none text-base text-[#172B4D] bg-white font-medium touch-target"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Assamese">Assamese (অসমীয়া)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
            </select>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              size="xl"
              fullWidth
              className="shadow-md shadow-[#2F6FED]/25 text-lg font-extrabold"
            >
              CONTINUE TO ROLE SELECTION →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

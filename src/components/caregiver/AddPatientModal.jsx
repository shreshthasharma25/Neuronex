import React, { useState, useRef } from 'react';
import { X, Link as LinkIcon, UserPlus, User, Upload, Camera, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/soundPlayer';

export default function AddPatientModal({ isOpen, onClose }) {
  const {
    linkPatientToCaregiver,
    createAndLinkPatient,
    SUPPORTED_LANGUAGES,
    t,
  } = useApp();

  const [mode, setMode] = useState('link'); // 'link' | 'create'
  const [patientIdInput, setPatientIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form fields
  const [formData, setFormData] = useState({
    fullName: '',
    preferredName: '',
    age: '',
    gender: 'Female',
    language: 'English',
    phone: '',
    avatar: '',
  });

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playGentleTap();
    setErrorMsg('');
    setSuccessMsg('');
    setPatientIdInput('');
    setIsSubmitting(false);
    onClose();
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playGentleTap();
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar: event.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      setErrorMsg('Please enter a valid Patient ID.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await linkPatientToCaregiver(patientIdInput.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to link patient.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Patient "${patientIdInput.trim()}" linked successfully!`);
      sounds.playSuccess();
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter the patient\'s full name.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await createAndLinkPatient(formData);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create patient.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Patient "${formData.fullName}" created and linked successfully!`);
      sounds.playSuccess();
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8E1] text-[#B45309] flex items-center justify-center font-black text-lg">
              ➕
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
                Add Patient to Caregiver Dashboard
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Monitor and care for multiple patients from one account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-4 sm:p-5 pb-0">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setMode('link');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'link'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#2F6FED]" />
              <span>Link Existing Patient ID</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setMode('create');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'create'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Register New Patient</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5">
          {/* Status feedback alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LINK BY ID */}
          {mode === 'link' ? (
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF] space-y-1">
                <span className="text-xs font-bold text-[#2F6FED] block">
                  💡 How to find the Patient ID:
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  The Patient ID is displayed in the Demo Toolbar or on the patient's companion screen (e.g. <code className="font-mono font-bold text-[#172B4D]">pat-maa-7788</code>, <code className="font-mono font-bold text-[#172B4D]">pat-ramesh-2041</code>, <code className="font-mono font-bold text-[#172B4D]">pat-sunita-5512</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                  Patient Unique ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pat-maa-7788"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#2F6FED] text-sm font-mono font-bold text-[#172B4D] outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#2F6FED] hover:bg-[#2557be] disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all touch-target"
                >
                  {isSubmitting ? 'Linking Patient...' : 'Link to My Dashboard →'}
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: REGISTER NEW PATIENT */
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
                {formData.avatar ? (
                  <div className="relative mb-2">
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#2F6FED]"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#EAF2FF] border border-dashed border-[#2F6FED]/40 flex items-center justify-center text-[#2F6FED] mb-2">
                    <User className="w-6 h-6" />
                  </div>
                )}
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  <Upload className="w-3.5 h-3.5 text-[#2F6FED]" />
                  <span>Upload Photo (Optional)</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                />
              </div>

              {/* Preferred Name & Age */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Called / Preferred Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dadu, Maa"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                  />
                </div>
              </div>

              {/* Gender & Language */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none bg-white"
                  >
                    {SUPPORTED_LANGUAGES?.map(l => (
                      <option key={l.code} value={l.name}>
                        {l.native} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all touch-target"
                >
                  {isSubmitting ? 'Creating Patient...' : 'Create & Link Patient →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

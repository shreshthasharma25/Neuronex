import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Heart,
  Upload,
  Camera,
  Trash2,
  Phone,
  ArrowLeft,
  Link as LinkIcon,
  UserPlus,
  Shield,
  Stethoscope,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function RoleRegistration({ role = 'patient', onBack, onComplete }) {
  const {
    registerPatientAsSelf,
    registerPatientAsFamily,
    registerPatientAsCaregiver,
    connectExistingPatient,
    patientId,
    language,
    SUPPORTED_LANGUAGES,
    t
  } = useApp();

  // Mode: "create" (new patient profile) or "connect" (existing patient ID)
  const [mode, setMode] = useState('create');

  // Connect Mode State
  const [connectId, setConnectId] = useState('');
  const [connectError, setConnectError] = useState('');

  // Family / Caregiver User Info
  const [userInfo, setUserInfo] = useState({
    name: '',
    relation: role === 'family' ? 'Daughter' : 'Primary Caregiver',
    title: role === 'caregiver' ? 'Primary Caregiver' : '',
    phone: ''
  });

  // Patient Info (used in "create" mode)
  const [patientFields, setPatientFields] = useState({
    fullName: '',
    preferredName: '',
    age: '',
    phone: '',
    gender: 'Female',
    language: 'English',
    avatar: '',
    doctorName: '',
    doctorPhone: ''
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
      setPatientFields(prev => ({ ...prev, avatar: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    sounds.playGentleTap();
    setPatientFields(prev => ({ ...prev, avatar: '' }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'connect') {
      if (!connectId.trim()) {
        setConnectError(t('registration.enterValidId'));
        return;
      }
      setConnectError('');
      const success = await connectExistingPatient({
        targetPatientId: connectId.trim(),
        role,
        userInfo: {
          name: userInfo.name || (role === 'family' ? t('brand.familyRole') : role === 'caregiver' ? t('brand.caregiverRole') : t('brand.patientRole')),
          relationOrTitle: role === 'caregiver' ? (userInfo.title || 'Caregiver') : (userInfo.relation || 'Family'),
          phone: userInfo.phone
        }
      });
      if (success) {
        if (onComplete) onComplete();
      }
      return;
    }

    // CREATE MODE
    if (role === 'patient') {
      if (!patientFields.fullName.trim()) return;
      registerPatientAsSelf(patientFields);
    } else if (role === 'family') {
      if (!patientFields.fullName.trim() || !userInfo.name.trim()) return;
      registerPatientAsFamily({
        patientFields,
        familyMemberInfo: {
          name: userInfo.name,
          relation: userInfo.relation || 'Family Member',
          phone: userInfo.phone
        }
      });
    } else if (role === 'caregiver') {
      if (!patientFields.fullName.trim() || !userInfo.name.trim()) return;
      registerPatientAsCaregiver({
        patientFields,
        caregiverInfo: {
          name: userInfo.name,
          title: userInfo.title || 'Primary Caregiver',
          phone: userInfo.phone
        }
      });
    }

    if (onComplete) onComplete();
  };

  const getRoleBadge = () => {
    if (role === 'patient') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-xs font-extrabold">
          <span>🧓</span> {t('brand.patientRole')}
        </span>
      );
    }
    if (role === 'family') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-xs font-extrabold">
          <span>👨‍👩‍👧</span> {t('brand.familyRole')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E1] text-[#B45309] text-xs font-extrabold">
        <span>🩺</span> {t('brand.caregiverRole')}
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-between min-h-[580px] h-full p-5 sm:p-7 bg-[#FAFBFD] overflow-y-auto">
      <div>
        {/* Top Nav: Back button & Role Pill */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              if (onBack) onBack();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#172B4D] px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('registration.backToRole')}</span>
          </button>
          {getRoleBadge()}
        </div>

        {/* Screen Title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            {role === 'patient' ? t('registration.registerSelf') : t('registration.registerPatient')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            {role === 'patient'
              ? t('registration.selfSubtitle')
              : role === 'family'
              ? t('registration.familySubtitle')
              : t('registration.caregiverSubtitle')}
          </p>
        </div>

        {/* Mode Selector (Create vs Connect) */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setMode('create');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'create'
                ? 'bg-white text-[#172B4D] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('registration.createNew')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              setMode('connect');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'connect'
                ? 'bg-white text-[#172B4D] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{t('registration.connectById')}</span>
          </button>
        </div>

        {/* CONNECT BY PATIENT ID MODE */}
        {mode === 'connect' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#172B4D]">
                    {t('registration.connectTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('registration.connectSubtitle')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  {t('registration.patientIdLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('registration.patientIdPlaceholder')}
                  value={connectId}
                  onChange={(e) => setConnectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#2F6FED] text-sm font-mono font-semibold text-[#172B4D] outline-none"
                />
                {connectError && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">
                    {connectError}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('registration.patientIdTip')}
                </p>
              </div>

              {/* Your Contact Info (for Family or Caregiver) */}
              {role !== 'patient' && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    {t('registration.yourInfo')} ({role === 'family' ? t('brand.familyRole') : t('brand.caregiverRole')})
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      {t('registration.yourName')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={role === 'family' ? t('registration.yourNamePlaceholderFamily') : t('registration.yourNamePlaceholderCaregiver')}
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                    />
                  </div>

                  {role === 'family' ? (
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        {t('registration.relationLabel')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('registration.relationPlaceholder')}
                        value={userInfo.relation}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, relation: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        {t('registration.titleLabel')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('registration.titlePlaceholder')}
                        value={userInfo.title}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      {t('registration.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      placeholder={t('registration.phonePlaceholder')}
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#2F6FED] hover:bg-[#2557be] text-white font-extrabold text-base shadow-lg shadow-[#2F6FED]/20 transition-all touch-target"
            >
              {t('registration.connectButton')}
            </button>
          </form>
        )}

        {/* CREATE NEW PATIENT PROFILE MODE */}
        {mode === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* IF FAMILY OR CAREGIVER: YOUR DETAILS FIRST */}
            {role !== 'patient' && (
              <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-base">
                    {role === 'family' ? '👨‍👩‍👧' : '🩺'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#172B4D]">
                      {t('registration.yourInfo')} ({role === 'family' ? t('brand.familyRole') : t('brand.caregiverRole')})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {t('registration.yourInfoSubtitle')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    {t('registration.yourName')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'family' ? t('registration.yourNamePlaceholderFamily') : t('registration.yourNamePlaceholderCaregiver')}
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      {role === 'family' ? t('registration.relationLabel') : t('registration.titleLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={role === 'family' ? t('registration.relationPlaceholder') : t('registration.titlePlaceholder')}
                      value={role === 'family' ? userInfo.relation : userInfo.title}
                      onChange={(e) => setUserInfo(prev => ({
                        ...prev,
                        [role === 'family' ? 'relation' : 'title']: e.target.value
                      }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      {t('registration.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      placeholder={t('registration.phonePlaceholder')}
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PATIENT DETAILS CARD */}
            <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-base">
                  🧓
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#172B4D]">
                    {role === 'patient' ? t('registration.patientProfileTitle') : t('registration.patientInfoTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {role === 'patient'
                      ? t('registration.profileSubtitleSelf')
                      : t('registration.profileSubtitleOther')}
                  </p>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                  {role === 'patient' ? t('registration.photoLabelSelf') : t('registration.photoLabelOther')}
                </label>

                <div className="flex flex-col items-center">
                  {patientFields.avatar ? (
                    <div className="relative mb-2">
                      <img
                        src={patientFields.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-[#2F6FED] shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#EAF2FF] border-2 border-dashed border-[#2F6FED]/40 flex flex-col items-center justify-center text-[#2F6FED] mb-2">
                      <User className="w-8 h-8 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#d5e5ff] text-[#2F6FED] text-xs font-bold transition-all border border-[#CFE1FF]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('registration.uploadPhoto')}</span>
                    </button>

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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('registration.camera')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  {role === 'patient' ? t('registration.fullNameSelf') : t('registration.fullNameOther')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('registration.fullNamePlaceholder')}
                  value={patientFields.fullName}
                  onChange={(e) => setPatientFields(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                />
              </div>

              {/* Preferred Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    {t('registration.preferredNameLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('registration.preferredNamePlaceholder')}
                    value={patientFields.preferredName}
                    onChange={(e) => setPatientFields(prev => ({ ...prev, preferredName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    {t('registration.ageLabel')}
                  </label>
                  <input
                    type="number"
                    placeholder={t('registration.agePlaceholder')}
                    value={patientFields.age}
                    onChange={(e) => setPatientFields(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                  />
                </div>
              </div>

              {/* Gender & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    {t('registration.genderLabel')}
                  </label>
                  <select
                    value={patientFields.gender}
                    onChange={(e) => setPatientFields(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none bg-white"
                  >
                    <option value="Female">{t('registration.genderFemale')}</option>
                    <option value="Male">{t('registration.genderMale')}</option>
                    <option value="Other">{t('registration.genderOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    {t('registration.languageLabel')}
                  </label>
                  <select
                    value={patientFields.language}
                    onChange={(e) => setPatientFields(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none bg-white"
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.name}>
                        {l.native} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Phone */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  {role === 'patient' ? t('registration.patientPhoneSelf') : t('registration.patientPhoneOther')}
                </label>
                <input
                  type="tel"
                  placeholder={t('registration.phonePlaceholder')}
                  value={patientFields.phone}
                  onChange={(e) => setPatientFields(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] text-sm text-[#172B4D] outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#2F6FED] hover:bg-[#2557be] text-white font-extrabold text-base shadow-lg shadow-[#2F6FED]/20 transition-all touch-target mt-2"
            >
              {role === 'patient'
                ? t('registration.submitSelf')
                : role === 'family'
                ? t('registration.submitFamily')
                : t('registration.submitCaregiver')}
            </button>
          </form>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center mt-4">
        <p className="text-[11px] text-slate-500 font-medium">
          💡 {t('registration.safetyNotice')}
        </p>
      </div>
    </div>
  );
}

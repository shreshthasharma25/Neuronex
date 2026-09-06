import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  MessageCircle,
  Heart,
  Stethoscope,
  Shield,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  UserX,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { triggerNativePhoneCall, sanitizePhoneNumber, openWhatsAppConversation, formatWhatsAppNumber } from '../../utils/phoneUtils';
import { translate } from '../../i18n';

export default function EmergencyModal({ isOpen, onClose }) {
  const { patientData, setPatientData, setUserRole, setCaregiverTab, currentLanguage } = useApp();
  const [locationShared, setLocationShared] = useState(false);
  const [phoneNotice, setPhoneNotice] = useState(null); // { type: 'error' | 'fallback', text: string, phone?: string }
  const preferredName = patientData.profile?.preferredName || 'Patient';

  const t = (key, params) => translate(currentLanguage, key, params);

  // 1. Data-driven family contacts (never invented)
  const familyMembers = (patientData.family && patientData.family.length > 0)
    ? patientData.family
    : (patientData.linkedFamilyMembers || []);

  const primaryFamily = familyMembers.length > 0 ? familyMembers[0] : null;

  // 2. Data-driven caregiver contacts (never invented)
  const caregivers = patientData.linkedCaregivers || [];
  const primaryCaregiver = caregivers.length > 0 ? caregivers[0] : null;

  // 3. Data-driven doctor contact
  const doctorInfo = patientData.importantInfo?.find(i => i.label?.toLowerCase().includes('doctor'));

  const handleCall = (contactName, rawPhone) => {
    sounds.playGentleTap();
    setPhoneNotice(null);

    if (!rawPhone || !rawPhone.trim()) {
      const msg = t('emergency.noPhoneSaved', { name: contactName });
      setPhoneNotice({
        type: 'error',
        text: msg
      });
      sounds.speak(msg);
      return;
    }

    const sanitized = sanitizePhoneNumber(rawPhone);
    if (!sanitized) {
      const msg = t('emergency.noPhoneSaved', { name: contactName });
      setPhoneNotice({
        type: 'error',
        text: msg
      });
      return;
    }

    // Trigger REAL native device phone call action via tel: URI
    triggerNativePhoneCall(sanitized);

    // Provide immediate auditory and visual feedback without fake ringing screens
    sounds.speak(`Calling ${contactName}`);

    // Detect if desktop/unsupported browser doesn't open dialer
    setPhoneNotice({
      type: 'fallback',
      text: t('emergency.callingNotice', { name: contactName, phone: sanitized }),
      phone: sanitized
    });
  };

  const handleWhatsApp = (contactName, rawPhone) => {
    sounds.playGentleTap();
    setPhoneNotice(null);

    if (!rawPhone || !rawPhone.trim()) {
      const msg = t('emergency.noPhoneSaved', { name: contactName });
      setPhoneNotice({
        type: 'error',
        text: msg
      });
      sounds.speak(msg);
      return;
    }

    const waNumber = formatWhatsAppNumber(rawPhone);
    if (!waNumber) {
      const msg = t('emergency.noPhoneSaved', { name: contactName });
      setPhoneNotice({
        type: 'error',
        text: msg
      });
      return;
    }

    const defaultMsg = `Hello ${contactName}, this is ${preferredName} reaching out from NeuroNex.`;
    sounds.speak(`Opening WhatsApp for ${contactName}`);
    openWhatsAppConversation(waNumber, defaultMsg);
  };

  const handleShareLocation = () => {
    sounds.playSuccess();
    const recipient = primaryFamily ? primaryFamily.name : "caregiver";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          const alertMsg = `${preferredName || 'Patient'} shared their live location: Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)}. Map: ${mapUrl}`;

          const newAlert = {
            id: 'alt-' + Date.now(),
            type: 'warning',
            title: '📍 Live Emergency Location Shared',
            message: alertMsg,
            time: 'Just now',
            resolved: false
          };
          setPatientData(prev => ({
            ...prev,
            alerts: [newAlert, ...prev.alerts]
          }));

          if (primaryFamily?.phone) {
            const text = `Emergency Alert from NeuroNex: I need help. My current location is: ${mapUrl}`;
            openWhatsAppConversation(primaryFamily.phone, text);
          }
        },
        () => {
          const newAlert = {
            id: 'alt-' + Date.now(),
            type: 'warning',
            title: '📍 Emergency Assistance Requested',
            message: `${preferredName || 'Patient'} requested urgent assistance near home safe-zone.`,
            time: 'Just now',
            resolved: false
          };
          setPatientData(prev => ({
            ...prev,
            alerts: [newAlert, ...prev.alerts]
          }));
        }
      );
    }

    sounds.speak(`Your live location has been shared.`);
    setLocationShared(true);
    setTimeout(() => {
      setLocationShared(false);
    }, 5000);
  };

  const handleSwitchToCaregiver = () => {
    onClose();
    setUserRole('caregiver');
    setCaregiverTab('personalize');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPhoneNotice(null);
        onClose();
      }}
      title={t('emergency.title')}
      subtitle={t('emergency.subtitle')}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Reassurance Banner */}
        <div className="bg-[#FFF8E1] p-3.5 rounded-2xl border border-[#FDE68A] text-sm text-[#854D0E] font-medium flex items-center gap-2.5">
          <span className="text-xl">💛</span>
          <span>{t('emergency.safeBanner')}</span>
        </div>

        {/* Real Device Calling Notice / Fallback Banner */}
        {phoneNotice && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold ${
              phoneNotice.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p>{phoneNotice.text}</p>
                {phoneNotice.phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${phoneNotice.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F6FED] text-white rounded-xl font-mono text-sm font-bold shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{phoneNotice.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="space-y-3">
          {/* CALL & WHATSAPP FAMILY MEMBERS (ALL STORED FAMILY CONTACTS) */}
          {familyMembers.length > 0 ? (
            familyMembers.map((fam, idx) => (
              <div
                key={fam.id || `fam-${idx}`}
                className="p-4 rounded-3xl bg-[#EAF2FF] border-2 border-[#2F6FED]/40 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2F6FED] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                    ❤️
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-base font-extrabold text-[#172B4D] block truncate">
                      {fam.name}
                    </span>
                    <span className="text-xs font-semibold text-[#2F6FED] block truncate">
                      {fam.relation ? `${fam.relation} • ` : ''}{fam.phone || t('emergency.noPhoneSaved', { name: fam.name })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCall(fam.name, fam.phone)}
                    className="py-3 px-3 rounded-2xl bg-[#2F6FED] hover:bg-[#2058c4] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t('emergency.callButton')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhatsApp(fam.name, fam.phone)}
                    className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1faa4f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('emergency.whatsappButton')}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-left flex items-start gap-3">
              <UserX className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-700 block">
                  {t('emergency.noFamilySaved')}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t('emergency.askCaregiver')}
                </p>
                <button
                  type="button"
                  onClick={handleSwitchToCaregiver}
                  className="text-xs font-bold text-[#2F6FED] hover:underline mt-1.5 inline-block"
                >
                  {t('emergency.addInCaregiver')}
                </button>
              </div>
            </div>
          )}

          {/* CALL & WHATSAPP CAREGIVER (IF CONFIGURED) */}
          {primaryCaregiver && (
            <div className="p-4 rounded-3xl bg-[#FFF8E1] border-2 border-[#FFC857] shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC857] text-[#172B4D] flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                  🩺
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-base font-extrabold text-[#172B4D] block truncate">
                    {primaryCaregiver.name} {primaryCaregiver.title ? `(${primaryCaregiver.title})` : ''}
                  </span>
                  <span className="text-xs font-semibold text-[#854D0E] block truncate">
                    {primaryCaregiver.phone || t('emergency.noPhoneSaved', { name: primaryCaregiver.name })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCall(primaryCaregiver.name, primaryCaregiver.phone)}
                  className="py-3 px-3 rounded-2xl bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('emergency.callButton')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsApp(primaryCaregiver.name, primaryCaregiver.phone)}
                  className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1faa4f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('emergency.whatsappButton')}</span>
                </button>
              </div>
            </div>
          )}

          {/* CALL & WHATSAPP DOCTOR (IF CONFIGURED) */}
          {doctorInfo ? (
            <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xl flex-shrink-0">
                  👨‍⚕️
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-base font-extrabold text-[#172B4D] block truncate">
                    {t('emergency.callDoctor')}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 block truncate">
                    {doctorInfo.value}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCall("Doctor", doctorInfo.value)}
                  className="py-3 px-3 rounded-2xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('emergency.callButton')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsApp("Doctor", doctorInfo.value)}
                  className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1faa4f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('emergency.whatsappButton')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-left flex items-start gap-3">
              <Stethoscope className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-700 block">
                  {t('emergency.noDoctorSaved')}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t('emergency.askCaregiver')}
                </p>
              </div>
            </div>
          )}

          {/* Standard Emergency Services (Clearly Labeled) */}
          <div className="pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              {t('emergency.publicServices')}
            </span>

            {/* Emergency Ambulance */}
            <button
              type="button"
              onClick={() => handleCall("Emergency Ambulance", "108")}
              className="w-full p-4 rounded-2xl bg-[#FDECEC] hover:bg-[#fcdddd] border-2 border-[#FCA5A5] text-[#D32F2F] flex items-center justify-between transition-all duration-150 active:scale-[0.98] shadow-sm touch-target mb-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                  🚑
                </div>
                <div className="text-left">
                  <span className="text-base font-extrabold text-[#D32F2F] block">
                    {t('emergency.ambulance')}
                  </span>
                  <span className="text-xs font-bold text-rose-700">
                    {t('emergency.ambulanceSubtitle')}
                  </span>
                </div>
              </div>
              <Phone className="w-6 h-6 text-[#D32F2F]" />
            </button>

            {/* Call Police */}
            <button
              type="button"
              onClick={() => handleCall("Police Emergency", "100")}
              className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between transition-all touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl flex-shrink-0">
                  🚔
                </div>
                <div className="text-left">
                  <span className="text-sm font-extrabold text-slate-800 block">
                    {t('emergency.police')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {t('emergency.policeSubtitle')}
                  </span>
                </div>
              </div>
              <Phone className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Share Location Button (Preserving WhatsApp live-location sharing) */}
        <div className="pt-2">
          <Button
            onClick={handleShareLocation}
            variant={locationShared ? "success" : "secondary"}
            size="lg"
            fullWidth
            icon={locationShared ? CheckCircle2 : MapPin}
            className="border-2"
          >
            {locationShared
              ? t('emergency.locationTransmitted')
              : primaryFamily
              ? t('emergency.shareLocation', { name: primaryFamily.name.toUpperCase() })
              : t('emergency.shareLocationGeneral')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


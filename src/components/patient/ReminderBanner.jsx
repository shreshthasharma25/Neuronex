import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock, Volume2, Pill, AlertTriangle, CheckSquare } from 'lucide-react';
import Button from '../common/Button';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { translateDynamicContent } from '../../i18n';

export default function ReminderBanner({ alert, medicine, onMarkDone, onRemindLater, preferredName = 'Friend' }) {
  const { t, language } = useApp();
  const [snoozed, setSnoozed] = useState(false);
  const spokenAlertIdRef = useRef(null);

  const getLocaleTag = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'bn': return 'bn-IN';
      case 'as': return 'as-IN';
      case 'ta': return 'ta-IN';
      default: return 'en-US';
    }
  };

  // Support either smart alert object or direct medicine item
  const item = alert || (medicine ? {
    id: medicine.id,
    type: 'medicine',
    title: t('home.medicineDue'),
    subtitle: medicine.name,
    instructions: medicine.notes || 'Take as prescribed by doctor',
    time: medicine.time,
    status: 'DUE_NOW',
    rawItem: medicine
  } : null);

  // Automatic loud voice announcement for active reminders
  useEffect(() => {
    if (item && item.id && spokenAlertIdRef.current !== item.id && !snoozed) {
      spokenAlertIdRef.current = item.id;
      sounds.playReminderChime();
      setTimeout(() => {
        const text = `${item.title}. ${item.subtitle}.`;
        sounds.speak(text, { volume: 1.0, lang: getLocaleTag(language) });
      }, 600);
    }
  }, [item?.id, snoozed, language]);

  if (!item || snoozed) return null;

  const isMissed = item.status === 'MISSED';
  const isUpcoming = item.status === 'UPCOMING';

  const handleSpeak = () => {
    sounds.playReminderChime();
    setTimeout(() => {
      const spokenSubtitle = translateDynamicContent(item.subtitle, language, item.subtitle);
      const spokenInstructions = item.instructions ? translateDynamicContent(item.instructions, language, item.instructions) : '';
      sounds.speak(`${item.title}: ${spokenSubtitle}. ${spokenInstructions}`, { 
        volume: 1.0,
        lang: getLocaleTag(language)
      });
    }, 300);
  };

  const handleDone = () => {
    sounds.playSuccess();
    if (onMarkDone) onMarkDone(item.id, item);
  };

  const handleSnooze = () => {
    sounds.playGentleTap();
    setSnoozed(true);
    if (onRemindLater) onRemindLater(item.id, item);
  };

  const getIcon = () => {
    if (item.type === 'medicine' || item.subtitle?.toLowerCase().includes('medicine') || item.subtitle?.toLowerCase().includes('pill')) {
      return '💊';
    }
    if (item.subtitle?.toLowerCase().includes('walk')) {
      return '👟';
    }
    if (item.subtitle?.toLowerCase().includes('brain') || item.subtitle?.toLowerCase().includes('exercise')) {
      return '🧠';
    }
    return '⏰';
  };

  return (
    <div className={`border-2 rounded-3xl p-5 shadow-sm transition-all duration-200 ${
      isMissed 
        ? 'bg-[#FFF8E1] border-amber-400' 
        : isUpcoming 
          ? 'bg-[#EAF2FF] border-[#93C5FD]' 
          : 'bg-[#FFF8E1] border-[#FFC857]'
    }`}>
      {/* Top Status Bar */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 font-bold text-sm min-w-0 flex-1">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isMissed 
              ? 'bg-rose-500 animate-ping' 
              : isUpcoming 
                ? 'bg-blue-500' 
                : 'bg-amber-500 animate-pulse'
          }`} />
          <Bell className={`w-4 h-4 flex-shrink-0 ${isMissed ? 'text-rose-600' : isUpcoming ? 'text-[#2F6FED]' : 'text-amber-600'}`} />
          <span className={`uppercase tracking-wider text-xs font-extrabold truncate ${
            isMissed ? 'text-rose-800' : isUpcoming ? 'text-[#2F6FED]' : 'text-[#854D0E]'
          }`}>
            {isMissed ? `MISSED • ${item.time}` : isUpcoming ? `UPCOMING • ${item.time}` : `${t('home.medicineDue')} • ${item.time || ''}`}
          </span>
        </div>

        <button
          onClick={handleSpeak}
          className="p-2 rounded-full bg-white/90 hover:bg-white text-amber-800 border border-amber-200 flex items-center gap-1 text-xs font-bold transition-all shadow-xs flex-shrink-0"
          title="Read aloud"
        >
          <Volume2 className="w-4 h-4 text-[#2F6FED]" />
          <span className="hidden xs:inline">Listen</span>
        </button>
      </div>


      {/* Main Content */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0 text-2xl shadow-xs">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-extrabold text-[#172B4D]">
            {item.title}
          </h4>
          <p className="text-base text-slate-700 font-bold mt-0.5">
            {translateDynamicContent(item.subtitle, language, item.subtitle)}
          </p>
          {item.instructions && (
            <p className="text-sm text-slate-500 font-medium mt-1">
              📝 {translateDynamicContent(item.instructions, language, item.instructions)}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          onClick={handleDone}
          variant="primary"
          size="md"
          icon={CheckCircle2}
          className="bg-[#2E7D32] hover:bg-[#256629] text-white shadow-none font-extrabold"
        >
          ✓ {t('common.done')}
        </Button>

        <Button
          onClick={handleSnooze}
          variant="outline"
          size="md"
          icon={Clock}
          className="bg-white text-slate-700 border-slate-300 font-bold"
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

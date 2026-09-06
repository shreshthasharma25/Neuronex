import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, RotateCcw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { sendAIChatMessage } from '../../services/aiChatService';

export default function VoiceAssistant({ isOpen, onClose }) {
  const { patientData, addTodo, t, language } = useApp();
  const [assistantState, setAssistantState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  const [queryInput, setQueryInput] = useState('');
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const preferredName = patientData.profile?.preferredName || patientData.profile?.fullName || 'Friend';

  const getSpeechLocale = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'bn': return 'bn-IN';
      case 'as': return 'as-IN';
      case 'ta': return 'ta-IN';
      default: return 'en-US';
    }
  };

  const [conversation, setConversation] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t('assistant.welcome', { name: preferredName })
    }
  ]);

  // Update initial welcome message if language changes
  useEffect(() => {
    setConversation(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          sender: 'assistant',
          text: t('assistant.welcome', { name: preferredName })
        }];
      }
      return prev;
    });
  }, [language, preferredName]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = getSpeechLocale(language);

        recognition.onstart = () => {
          setAssistantState('LISTENING');
          setSpeechError(null);
        };

        recognition.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            handleProcessQuery(transcript);
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setAssistantState('IDLE');
          if (event.error === 'not-allowed') {
            setSpeechError(t('assistant.micErrorDenied'));
          } else if (event.error === 'no-speech') {
            setSpeechError(t('assistant.micErrorNoSpeech'));
          }
        };

        recognition.onend = () => {
          if (assistantState === 'LISTENING') {
            setAssistantState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      sounds.stopSpeaking();
    };
  }, [language]);

  // Auto scroll conversation to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, assistantState]);

  // Clean stop when modal closes
  useEffect(() => {
    if (!isOpen) {
      sounds.stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      setAssistantState('IDLE');
    }
  }, [isOpen]);

  const handleProcessQuery = async (userQueryText) => {
    if (!userQueryText || !userQueryText.trim()) return;
    sounds.playGentleTap();

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'asst-' + Date.now();

    // 1. Add user message and transition to THINKING
    const nextHistory = [
      ...conversation,
      { id: userMsgId, sender: 'user', text: userQueryText }
    ];
    setConversation(nextHistory);
    setAssistantState('THINKING');

    // 2. Query AI endpoint with dynamic patient context & conversation history
    const { reply, action } = await sendAIChatMessage(userQueryText, patientData, nextHistory);

    // 3. Render reply and trigger audible speech if not muted
    setConversation(prev => [
      ...prev,
      { id: assistantMsgId, sender: 'assistant', text: reply }
    ]);

    if (action) {
      action(addTodo);
    }

    if (!isMuted && sounds.isSpeechSupported()) {
      sounds.speak(reply, {
        lang: getSpeechLocale(language),
        onStart: () => setAssistantState('SPEAKING'),
        onEnd: () => setAssistantState('IDLE'),
        onError: () => setAssistantState('IDLE')
      });
    } else {
      setAssistantState('IDLE');
    }
  };

  const handleStartListening = () => {
    sounds.stopSpeaking();
    setSpeechError(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Recognition already started or error
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition restart failed', e);
        }
      }
    } else {
      // Fallback if browser doesn't support SpeechRecognition
      setSpeechError("Voice input is not supported in this browser. Please type your question or tap a quick prompt.");
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setAssistantState('IDLE');
  };

  const handleStopSpeaking = () => {
    sounds.stopSpeaking();
    setAssistantState('IDLE');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
    if (nextMuted) {
      sounds.stopSpeaking();
      setAssistantState('IDLE');
    }
  };

  const handleReplay = (text) => {
    sounds.playGentleTap();
    if (sounds.isSpeechSupported()) {
      if (isMuted) {
        setIsMuted(false);
        sounds.setMuted(false);
      }
      sounds.speak(text, {
        onStart: () => setAssistantState('SPEAKING'),
        onEnd: () => setAssistantState('IDLE'),
        onError: () => setAssistantState('IDLE')
      });
    }
  };

  const handleClearConversation = () => {
    sounds.stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setAssistantState('IDLE');
    setSpeechError(null);
    setConversation([{
      id: 'welcome',
      sender: 'assistant',
      text: t('assistant.welcome', { name: preferredName })
    }]);
  };



  const handleSubmitTyped = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    const text = queryInput.trim();
    setQueryInput('');
    handleProcessQuery(text);
  };

  // Curated natural questions grounded in current data and active language
  const samplePrompts = [
    t('assistant.sample1'),
    t('assistant.sample2'),
    t('assistant.sample3'),
    t('assistant.sample4'),
    t('assistant.sample5'),
  ].filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('assistant.title')}
      subtitle={t('assistant.subtitle')}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-[70vh] sm:h-[520px] max-h-[580px]">
        {/* Top Status & Audio Controls */}
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-[#EAF2FF] rounded-2xl border border-[#CFE1FF]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              assistantState === 'LISTENING' 
                ? 'bg-rose-500 animate-ping' 
                : assistantState === 'SPEAKING'
                  ? 'bg-emerald-500 animate-pulse'
                  : assistantState === 'THINKING'
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-[#2F6FED]'
            }`} />
            <span className="text-xs font-extrabold text-[#172B4D] uppercase tracking-wider">
              {assistantState === 'LISTENING' && `🎤 ${t('assistant.listening')}`}
              {assistantState === 'THINKING' && `🧠 ${t('assistant.thinking')}`}
              {assistantState === 'SPEAKING' && `🔊 ${t('assistant.speaking')}`}
              {assistantState === 'IDLE' && t('assistant.idle')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Highly visible STOP SPEAKING button when speaking */}
            {assistantState === 'SPEAKING' && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm animate-pulse transition-all"
                title={t('assistant.stopSpeaking')}
              >
                <span>⏹️</span>
                <span>{t('assistant.stopSpeaking')}</span>
              </button>
            )}

            {/* Clear conversation button — only visible when chat has content beyond welcome */}
            {conversation.length > 1 && assistantState !== 'THINKING' && (
              <button
                type="button"
                onClick={handleClearConversation}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isMuted 
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                  : 'bg-white text-[#2F6FED] hover:bg-slate-50 shadow-xs'
              }`}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio On</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Banner if speaking with big STOP option */}
        {assistantState === 'SPEAKING' && (
          <div className="mb-2 p-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <span className="font-semibold">{t('assistant.speaking')}</span>
            <button
              onClick={handleStopSpeaking}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs flex items-center gap-1 shadow-xs"
            >
              <span>⏹️ {t('assistant.stopSpeaking')}</span>
            </button>
          </div>
        )}

        {/* Speech Error Notice if any */}
        {speechError && (
          <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1.5 mb-3 rounded-2xl bg-slate-50 border border-slate-100">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl text-base leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#2F6FED] text-white rounded-br-none shadow-sm font-semibold'
                    : 'bg-white border border-slate-200 text-[#172B4D] rounded-bl-none shadow-sm font-medium'
                }`}
              >
                {msg.text}
              </div>

              {/* Replay speech button for assistant messages */}
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => handleReplay(msg.text)}
                  className="mt-1 ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#2F6FED] py-0.5 px-2 rounded-lg hover:bg-slate-200/60 transition-colors"
                  title="Listen again"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              )}
            </div>
          ))}

          {assistantState === 'THINKING' && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F6FED] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#2F6FED] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#2F6FED] animate-bounce delay-200" />
                <span>{t('assistant.thinking')}</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Prompts */}
        <div className="mb-3">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            {t('assistant.suggestedQuestions')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessQuery(prompt.replace(/^[“"]|[”"]$/g, ''))}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#EAF2FF] text-[#2F6FED] text-xs font-bold border border-slate-200 hover:border-[#CFE1FF] transition-all"
              >
                💬 {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interaction Controls: Big Mic Button & Typed Input */}
        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={assistantState === 'LISTENING' ? handleStopListening : handleStartListening}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white transition-all shadow-md flex-shrink-0 touch-target ${
              assistantState === 'LISTENING'
                ? 'bg-rose-500 scale-105 animate-pulse shadow-rose-500/40 ring-4 ring-rose-200'
                : 'bg-[#2F6FED] hover:bg-[#255ecf] shadow-[#2F6FED]/25'
            }`}
            title={assistantState === 'LISTENING' ? t('assistant.stopSpeaking') : t('assistant.tapToSpeak')}
          >
            {assistantState === 'LISTENING' ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          <form onSubmit={handleSubmitTyped} className="flex-1 flex items-center gap-1.5">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t('assistant.inputPlaceholder')}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm text-[#172B4D] bg-white font-medium shadow-xs"
            />
            <button
              type="submit"
              disabled={!queryInput.trim()}
              className="p-3 rounded-xl bg-[#2F6FED] text-white hover:bg-[#255ecf] disabled:opacity-40 transition-opacity flex-shrink-0 shadow-xs"
              title={t('assistant.send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

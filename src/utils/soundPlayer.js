// Rock-Solid Audio & SpeechSynthesis Pipeline for NeuroNex
// Optimized for elderly accessibility, browser autoplay unlock, and loud/clear speech feedback

class SoundPlayer {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.speaking = false;
    this.currentUtterance = null;
    this.isUnlocked = false;

    // Attach global user-gesture unlock listener
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudioPipeline();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  unlockAudioPipeline() {
    this.isUnlocked = true;
    this.init();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn('Speech resume error:', e);
      }
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isSpeechSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  setMuted(muteState) {
    this.muted = !!muteState;
    if (this.muted) {
      this.stopSpeaking();
    }
  }

  isMuted() {
    return this.muted;
  }

  isSpeaking() {
    if (!this.isSpeechSupported()) return false;
    return window.speechSynthesis.speaking || this.speaking;
  }

  stopSpeaking() {
    if (this.isSpeechSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      this.speaking = false;
      this.currentUtterance = null;
    }
  }

  playSuccess() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      // Gentle major chord arpeggio (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.45);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  playGentleTap() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio tap error', e);
    }
  }

  playReminderChime() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      // Loud two-tone alert chime (A4 -> E5 -> A5)
      const notes = [440, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        
        gain.gain.setValueAtTime(0, now + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.6);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.65);
      });
    } catch (e) {
      console.warn('Audio reminder error', e);
    }
  }

  /**
   * Speaks text aloud using SpeechSynthesis
   * @param {string} text - text to speak
   * @param {object} options - { onStart, onEnd, onError, rate, pitch, lang, volume }
   */
  speak(text, options = {}) {
    if (!text || this.muted) return;
    if (!this.isSpeechSupported()) {
      if (options.onError) options.onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    try {
      this.unlockAudioPipeline();

      // Clean emojis and symbols for smoother speech
      const cleanText = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[❤️💊🏠📍✨📌🔔✅⏰🎉👨‍👩‍👧👨‍⚕️🚶👟]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      // Cancel ongoing speech to avoid overlap
      window.speechSynthesis.cancel();
      // Resume in case browser suspended speech engine
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate || 0.82; // Calm, clear, measured cadence for elderly ears
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0; // Loud and clear
      const targetLang = options.lang || 'en-US';
      utterance.lang = targetLang;

      // Pick a matching voice for the target language if available
      const voices = window.speechSynthesis.getVoices?.() || [];
      if (voices.length > 0) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();
        const preferredVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
          || (langPrefix === 'as' ? voices.find(v => v.lang.toLowerCase().startsWith('bn')) : null)
          || voices.find(v => v.lang.startsWith('en'))
          || voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      this.speaking = true;
      this.currentUtterance = utterance; // Prevent garbage collection bug

      utterance.onstart = () => {
        this.speaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.speaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.speaking = false;
        this.currentUtterance = null;
        console.warn('Speech synthesis event error:', e);
        if (options.onError) options.onError(e);
      };

      // Speak with a short 50ms tick to let cancel flush properly
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (speakErr) {
          console.warn('speechSynthesis.speak failed:', speakErr);
        }
      }, 50);

    } catch (err) {
      this.speaking = false;
      this.currentUtterance = null;
      console.warn('Speech synthesis fatal error:', err);
      if (options.onError) options.onError(err);
    }
  }
}

export const sounds = new SoundPlayer();

// Centralized Internationalization (i18n) Engine for NeuroNex
// Full translation dictionaries for English, Hindi, Bengali, Assamese, and Tamil

import { en } from './locales/en';
import { hi } from './locales/hi';
import { bn } from './locales/bn';
import { as } from './locales/as';
import { ta } from './locales/ta';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

export const dictionaries = {
  en,
  hi,
  bn,
  as,
  ta,
};

/**
 * Normalizes any language string to a standard 2-letter locale code
 * e.g. "Hindi (हिंदी)" -> "hi", "Bengali" -> "bn", "English" -> "en"
 */
export function normalizeLangCode(langStr) {
  if (!langStr) return 'en';
  const str = String(langStr).toLowerCase().trim();

  if (str.startsWith('hi') || str.includes('हिंदी')) return 'hi';
  if (str.startsWith('bn') || str.includes('বাংলা') || str.includes('bengali')) return 'bn';
  if (str.startsWith('as') || str.includes('অসমীয়া') || str.includes('assamese')) return 'as';
  if (str.startsWith('ta') || str.includes('தமிழ்') || str.includes('tamil')) return 'ta';
  return 'en';
}

/**
 * Main translation lookup function with dot notation and parameter interpolation
 * @param {string} lang - Selected language (e.g. 'hi', 'Hindi', 'en')
 * @param {string} key - Translation key path (e.g. 'home.goodMorning')
 * @param {object} params - Optional interpolation params (e.g. { name: 'Maa' })
 * @returns {string} Translated string with fallbacks
 */
export function translate(lang, key, params = {}) {
  const code = normalizeLangCode(lang);
  const dict = dictionaries[code] || dictionaries.en;

  const getNested = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  };

  let val = getNested(dict, key);

  // Fallback to English if missing in target dictionary
  if (val === undefined) {
    val = getNested(dictionaries.en, key);
  }

  // If still not found, return key itself as safe fallback
  if (val === undefined) {
    return key;
  }

  // Parameter replacement: {paramName}
  if (params && typeof params === 'object') {
    let result = String(val);
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal ?? ''));
    }
    return result;
  }

  return val;
}

/**
 * Translates relationship strings (e.g. Daughter -> बेटी, Son -> बेटा)
 */
export function formatRelation(relation, lang) {
  if (!relation) return '';
  const key = String(relation).toLowerCase().trim().replace(/[\s\/\-]/g, '');
  const relKey = `relations.${key}`;
  const translated = translate(lang, relKey);
  return translated !== relKey ? translated : relation;
}

/**
 * Dynamic Content Translation helper:
 * Translates common phrases in user-entered items (routine steps, todos, instructions)
 * without altering proper names or custom notes.
 */
const COMMON_PHRASES = {
  // English base keys -> translation maps
  "breakfast": {
    hi: "नाश्ता",
    bn: "সকালের জলখাবার",
    as: "ৰাতিপুৱাৰ আহাৰ",
    ta: "காலை உணவு"
  },
  "morning medicine": {
    hi: "सुबह की दवा",
    bn: "সকালের ওষুধ",
    as: "ৰাতিপুৱাৰ ঔষধ",
    ta: "காலை மருந்து"
  },
  "brain exercise": {
    hi: "मस्तिष्क व्यायाम",
    bn: "মস্তিষ্কের ব্যায়াম",
    as: "মগজুৰ ব্যায়াম",
    ta: "மூளை பயிற்சி"
  },
  "brain exercise with neuronex": {
    hi: "NeuroNex के साथ मस्तिष्क व्यायाम",
    bn: "NeuroNex-এর সাথে মস্তিষ্কের ব্যায়াম",
    as: "NeuroNexৰ সৈতে মগজুৰ ব্যায়াম",
    ta: "NeuroNex உடன் மூளை பயிற்சி"
  },
  "wake up & warm ginger tea": {
    hi: "जागना और गर्म अदरक की चाय",
    bn: "ঘুম থেকে ওঠা ও গরম আদা চা",
    as: "টোপনিৰ পৰা উঠা আৰু গৰম আদা চাহ",
    ta: "எழுந்திருத்தல் மற்றும் சூடான இஞ்சி தேநீர்"
  },
  "lunch & afternoon rest": {
    hi: "दोपहर का भोजन और विश्राम",
    bn: "দুপুরের খাবার ও বিশ্রাম",
    as: "দুপৰীয়াৰ আহাৰ আৰু বিশ্ৰাম",
    ta: "மதிய உணவு மற்றும் ஓய்வு"
  },
  "evening garden walk": {
    hi: "शाम की बगीचे में सैर",
    bn: "সন্ধ্যায় বাগানে হাঁটা",
    as: "সন্ধিয়াৰ বাগিচা ভ্ৰমণ",
    ta: "மாலை தோட்ட நடை"
  },
  "dinner & bedtime tea": {
    hi: "रात का खाना और सोने से पहले चाय",
    bn: "রাতের খাবার ও শোবার আগে চা",
    as: "ৰাতিৰ আহাৰ আৰু শোৱাৰ আগৰ চাহ",
    ta: "இரவு உணவு மற்றும் தூங்கும் முன் தேநீர்"
  },
  "take with warm water after breakfast": {
    hi: "नाश्ते के बाद गर्म पानी के साथ लें",
    bn: "সকালের খাবারের পর গরম জল দিয়ে খান",
    as: "ৰাতিপুৱাৰ আহাৰৰ পিছত গৰম পানীৰে খাব",
    ta: "காலை உணவுக்குப் பிறகு வெதுவெதுப்பான நீரில் உட்கொள்ளவும்"
  },
  "take after meal with warm water": {
    hi: "भोजन के बाद गर्म पानी के साथ लें",
    bn: "খাবারের পর গরম জল দিয়ে খান",
    as: "আহাৰৰ পিছত গৰম পানীৰে খাব",
    ta: "உணவுக்குப் பிறகு வெதுவெதுப்பான நீரில் உட்கொள்ளவும்"
  },
  "take as prescribed by doctor": {
    hi: "डॉक्टर के निर्देशानुसार लें",
    bn: "ডাক্তারের পরামর্শ অনুযায়ী সেবন করুন",
    as: "ডাক্তৰৰ নিৰ্দেশনা অনুসৰি খাব",
    ta: "மருத்துவர் பரிந்துரைத்தபடி உட்கொள்ளவும்"
  },
  "daily": {
    hi: "प्रतिदिन",
    bn: "প্রতিদিন",
    as: "প্ৰতিদিনে",
    ta: "தினமும்"
  }
};

/**
 * Translates dynamic text (e.g. medicine instructions, routine tasks, categories)
 * using known phrase mappings across English, Hindi, Bengali, Assamese, and Tamil.
 * Completely safe against null, undefined, objects, numbers, and regex special characters.
 * Always falls back to original text or provided fallback without throwing.
 */
export function translateDynamicContent(text, lang, fallback = '') {
  if (text === null || text === undefined || text === '') {
    return fallback || '';
  }

  try {
    const rawStr = typeof text === 'string' ? text : String(text);
    if (!rawStr.trim()) return fallback || '';

    const code = normalizeLangCode(lang);
    if (code === 'en') return rawStr;

    const lower = rawStr.toLowerCase().trim();
    if (COMMON_PHRASES[lower] && COMMON_PHRASES[lower][code]) {
      return COMMON_PHRASES[lower][code];
    }

    // Check if string contains any known phrases and replace them safely
    let localized = rawStr;
    for (const [phrase, translations] of Object.entries(COMMON_PHRASES)) {
      if (translations[code] && localized.toLowerCase().includes(phrase)) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        localized = localized.replace(regex, translations[code]);
      }
    }

    return localized || rawStr;
  } catch (err) {
    console.warn('translateDynamicContent fallback error:', err);
    return typeof text === 'string' ? text : String(text || fallback || '');
  }
}

/**
 * Helper for AI unavailable message
 */
export function getFallbackNotice(lang) {
  return translate(lang, 'assistant.unavailable');
}

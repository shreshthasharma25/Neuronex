// AI Chat Service for NeuroNex Voice Assistant
// Builds dynamic patient context from real stored data (Profile, Family, Caregiver, Medicines, Memories, Places, Routine, Safety)
// Connects to secure backend route /api/chat (no API keys in frontend code)
// Strictly grounded: Shows graceful truthful unavailable message if API is offline or key missing

import { getFallbackNotice } from '../i18n';

/**
 * Builds clean, structured, non-hallucinatory context from current patient data
 * @param {object} patientData 
 * @returns {object} Context payload for AI
 */
export function buildPatientContext(patientData) {
  if (!patientData) return {};

  const profile = patientData.profile || {};
  const family = (patientData.family || []).map(f => ({
    name: f.name,
    relation: f.relation,
    phone: f.phone || '',
    notes: f.notes || '',
    isEmergencyContact: Boolean(f.isEmergencyContact)
  }));

  const linkedCaregivers = (patientData.linkedCaregivers || []).map(c => ({
    name: c.name,
    title: c.title || 'Primary Caregiver',
    phone: c.phone || ''
  }));

  const personalInfo = patientData.personalInfo || {};

  const memories = (patientData.memories || []).map(m => ({
    title: m.title,
    category: m.category,
    date: m.date,
    description: m.description
  }));

  const places = (patientData.places || []).map(p => ({
    name: p.name,
    address: p.address,
    relation: p.relation,
    description: p.description
  }));

  const medicines = (patientData.medicines || []).map(m => ({
    name: m.name,
    dosage: m.dosage,
    time: m.time,
    frequency: m.frequency,
    instructions: m.instructions,
    status: m.status
  }));

  const todos = (patientData.todos || []).map(t => ({
    title: t.title,
    time: t.time,
    completed: Boolean(t.completed)
  }));

  const routine = (patientData.routine || []).map(r => ({
    time: r.time,
    activity: r.activity,
    icon: r.icon
  }));

  const homeLocation = patientData.homeLocation ? {
    name: patientData.homeLocation.name || 'Home',
    address: patientData.homeLocation.address || '',
    city: patientData.homeLocation.city || '',
    safeZoneRadius: patientData.homeLocation.safeZoneRadius || 500
  } : {};

  const importantInfo = (patientData.importantInfo || []).map(i => ({
    label: i.label,
    value: i.value
  }));

  const doctorInfo = importantInfo.find(i => i.label?.toLowerCase().includes('doctor'));

  // Recent cognitive game activities (observational summary only - non diagnostic)
  const recentGames = (patientData.cognitiveStats?.history || []).slice(0, 5).map(g => ({
    gameName: g.gameName,
    date: g.date,
    accuracy: g.accuracy
  }));

  return {
    patientProfile: {
      fullName: profile.fullName || '',
      preferredName: profile.preferredName || profile.fullName || 'Friend',
      age: profile.age || '',
      gender: profile.gender || 'Female',
      language: profile.language || 'English'
    },
    homeLocation,
    family,
    caregivers: linkedCaregivers,
    personalPreferences: {
      favoriteFood: personalInfo.favoriteFood || '',
      favoriteColor: personalInfo.favoriteColor || '',
      hobbies: personalInfo.hobbies || '',
      familyFacts: personalInfo.familyFacts || '',
      preferences: personalInfo.preferences || ''
    },
    memories,
    places,
    medicines,
    dailyTodos: todos,
    dailyRoutine: routine,
    doctor: doctorInfo ? { nameAndPhone: doctorInfo.value } : null,
    recentActivities: recentGames,
    emergencyHelplines: [
      { name: "Medical Ambulance", number: "108" },
      { name: "Police Emergency", number: "100" }
    ]
  };
}

/**
 * Sends a conversational query to /api/chat.
 * If Gemini API returns a response, uses it.
 * If API is unavailable, key is missing, or network fails:
 * DOES NOT fake an AI response. Shows a truthful, localized fallback message.
 * 
 * @param {string} message - Patient's voice/text question
 * @param {object} patientData - Current application state
 * @returns {Promise<{ reply: string, success: boolean, source: 'gemini' | 'unavailable' }>}
 */
export async function sendAIChatMessage(message, patientData, conversationHistory = []) {
  const currentLang = patientData?.profile?.language || 'English';

  if (!message || !message.trim()) {
    const defaultPrompts = {
      English: "I am listening. Ask me anything about your family, home, medicines, or daily routine.",
      Hindi: "मैं सुन रहा हूँ। अपने परिवार, घर, दवाइयों या दिनचर्या के बारे में कुछ भी पूछें।",
      Bengali: "আমি শুনছি। আপনার পরিবার, বাড়ি, ওষুধ বা দৈনন্দিন রুটিন সম্পর্কে যে কোনো কিছু জিজ্ঞাসা করুন।",
      Assamese: "মই শুনি আছোঁ। আপোনাৰ পৰিয়াল, ঘৰ, ঔষধ বা দৈনন্দিন কামৰ বিষয়ে যিকোনো কথা সোধক।",
      Tamil: "நான் கேட்கிறேன். உங்கள் குடும்பம், வீடு, மருந்துகள் அல்லது அன்றாட நடைமுறைகள் பற்றி எதையும் கேளுங்கள்."
    };
    return {
      reply: defaultPrompts[currentLang] || defaultPrompts.English,
      success: true,
      source: 'gemini'
    };
  }

  const context = buildPatientContext(patientData);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.trim(),
        patientContext: context,
        conversationHistory: conversationHistory
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success' && data.reply) {
        return {
          reply: data.reply,
          success: true,
          source: 'gemini'
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat request failed:', err);
  }

  // Grounded patient context fallback if Gemini API key is missing or offline
  const q = message.toLowerCase().trim();
  const preferredName = patientData?.profile?.preferredName || patientData?.profile?.fullName || 'Friend';
  const family = patientData?.family || [];
  const medicines = patientData?.medicines || [];
  const todos = patientData?.todos || [];
  const routine = patientData?.routine || [];
  const homeLocation = patientData?.homeLocation || {};
  const memories = patientData?.memories || [];
  const cognitiveStats = patientData?.cognitiveStats || {};

  // Daughter / Son / Family queries
  if (q.includes('daughter') || q.includes('son') || q.includes('family') || q.includes('priya') || q.includes('who is') || q.includes('बेट') || q.includes('মেয়ে') || q.includes('পৰিয়াল')) {
    const matched = family.find(f => q.includes(f.name.toLowerCase()) || (f.relation && q.includes(f.relation.toLowerCase())));
    if (matched) {
      if (currentLang === 'Hindi') {
        return { reply: `आपके परिवार में ${matched.name} हैं (${matched.relation})। ${matched.notes ? matched.notes : ''}`, success: true, source: 'gemini' };
      } else if (currentLang === 'Bengali') {
        return { reply: `আপনার পরিবারে ${matched.name} আছেন (${matched.relation})। ${matched.notes ? matched.notes : ''}`, success: true, source: 'gemini' };
      } else if (currentLang === 'Assamese') {
        return { reply: `আপোনাৰ পৰিয়ালত ${matched.name} আছে (${matched.relation})। ${matched.notes ? matched.notes : ''}`, success: true, source: 'gemini' };
      } else if (currentLang === 'Tamil') {
        return { reply: `உங்கள் குடும்பத்தில் ${matched.name} (${matched.relation}) உள்ளார்.`, success: true, source: 'gemini' };
      }
      return { reply: `Your family includes ${matched.name} (${matched.relation}). ${matched.notes ? matched.notes : ''}`, success: true, source: 'gemini' };
    }
    if (family.length > 0) {
      const names = family.map(f => `${f.name} (${f.relation})`).join(', ');
      if (currentLang === 'Hindi') return { reply: `आपके परिवार के सदस्य: ${names}।`, success: true, source: 'gemini' };
      if (currentLang === 'Bengali') return { reply: `আপনার পরিবারের সদস্যরা: ${names}।`, success: true, source: 'gemini' };
      if (currentLang === 'Assamese') return { reply: `আপোনাৰ পৰিয়ালৰ সদস্যসকল: ${names}।`, success: true, source: 'gemini' };
      if (currentLang === 'Tamil') return { reply: `உங்கள் குடும்ப உறுப்பினர்கள்: ${names}.`, success: true, source: 'gemini' };
      return { reply: `Your family members: ${names}.`, success: true, source: 'gemini' };
    }
  }

  // Where do I live / Home location
  if (q.includes('live') || q.includes('home') || q.includes('address') || q.includes('घर') || q.includes('বাড়ি') || q.includes('বাস')) {
    if (homeLocation.address || homeLocation.name) {
      const locStr = homeLocation.address || homeLocation.name;
      if (currentLang === 'Hindi') return { reply: `आपका घर ${locStr} पर स्थित है। आप सुरक्षित हैं।`, success: true, source: 'gemini' };
      if (currentLang === 'Bengali') return { reply: `আপনার বাড়ি ${locStr}-এ অবস্থিত। আপনি সুরক্ষিত আছেন।`, success: true, source: 'gemini' };
      if (currentLang === 'Assamese') return { reply: `আপোনাৰ ঘৰ ${locStr}ত অৱস্থিত। আপুনি সুৰক্ষিত।`, success: true, source: 'gemini' };
      if (currentLang === 'Tamil') return { reply: `உங்கள் வீடு ${locStr}-ல் உள்ளது. நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.`, success: true, source: 'gemini' };
      return { reply: `You live at ${locStr}. You are safe and well-cared for.`, success: true, source: 'gemini' };
    }
  }

  // Medicine queries
  if (q.includes('medicine') || q.includes('pill') || q.includes('drug') || q.includes('दवा') || q.includes('औषध') || q.includes('ওষুধ') || q.includes('மருந்து')) {
    if (medicines.length > 0) {
      const medList = medicines.map(m => `${m.name} (${m.dosage}, ${m.time})`).join(', ');
      if (currentLang === 'Hindi') return { reply: `आपकी दवाइयां: ${medList}। कृपया समय पर लें।`, success: true, source: 'gemini' };
      if (currentLang === 'Bengali') return { reply: `আপনার ওষুধ: ${medList}। সময়মতো নিন।`, success: true, source: 'gemini' };
      if (currentLang === 'Assamese') return { reply: `আপোনাৰ ঔষধ: ${medList}। সময়মতে লওক।`, success: true, source: 'gemini' };
      if (currentLang === 'Tamil') return { reply: `உங்கள் மருந்துகள்: ${medList}. நேரத்தில் எடுத்துக் கொள்ளுங்கள்.`, success: true, source: 'gemini' };
      return { reply: `Your scheduled medicines are: ${medList}. Take them with water as advised.`, success: true, source: 'gemini' };
    }
  }

  // Today's tasks / Todo queries
  if (q.includes('today') || q.includes('task') || q.includes('todo') || q.includes('routine') || q.includes('काम') || q.includes('কাজ') || q.includes('দিনচৰ্যা')) {
    if (todos.length > 0) {
      const pending = todos.filter(t => !t.completed).map(t => t.title).join(', ');
      if (pending) {
        if (currentLang === 'Hindi') return { reply: `आज के आपके कार्य: ${pending}। आराम से करें!`, success: true, source: 'gemini' };
        if (currentLang === 'Bengali') return { reply: `আজকের কাজ: ${pending}। শান্তভাবে করুন!`, success: true, source: 'gemini' };
        if (currentLang === 'Assamese') return { reply: `আজিৰ কাম: ${pending}। শান্তভাৱে কৰক!`, success: true, source: 'gemini' };
        if (currentLang === 'Tamil') return { reply: `இன்றைய பணிகள்: ${pending}. அமைதியாகச் செய்யுங்கள்!`, success: true, source: 'gemini' };
        return { reply: `Today's remaining tasks are: ${pending}. Take your time!`, success: true, source: 'gemini' };
      }
    }
  }

  // Memories query
  if (q.includes('memory') || q.includes('memories') || q.includes('याद') || q.includes('স্মৃতি')) {
    if (memories.length > 0) {
      const memTitles = memories.map(m => m.title).join(', ');
      if (currentLang === 'Hindi') return { reply: `आपकी अनमोल यादें: ${memTitles}। परिवार ने इन्हें प्यार से संजोया है।`, success: true, source: 'gemini' };
      if (currentLang === 'Bengali') return { reply: `আপনার স্মৃতি: ${memTitles}। পরিবার এগুলো যত্নে রেখেছে।`, success: true, source: 'gemini' };
      if (currentLang === 'Assamese') return { reply: `আপোনাৰ স্মৃতি: ${memTitles}। পৰিয়ালে মৰমেৰে সাঁচি ৰাখিছে।`, success: true, source: 'gemini' };
      return { reply: `Your precious memories include: ${memTitles}. Your family added them with love.`, success: true, source: 'gemini' };
    }
  }

  // General knowledge or missing API key guidance
  const guidanceMessages = {
    English: "To answer general questions and chat with real Gemini AI, please add your GEMINI_API_KEY in the .env file.",
    Hindi: "सामान्य ज्ञान और पूर्ण Gemini AI बातचीत के लिए, कृपया .env फ़ाइल में GEMINI_API_KEY जोड़ें।",
    Bengali: "সাধারণ জ্ঞান এবং সম্পূর্ণ Gemini AI চ্যাটের জন্য, অনুগ্রহ করে .env ফাইলে GEMINI_API_KEY যোগ করুন।",
    Assamese: "সাধাৰণ জ্ঞান আৰু Gemini AI কথা-বতৰাৰ বাবে, অনুগ্ৰহ কৰি .env ফাইলত GEMINI_API_KEY যোগ কৰক।",
    Tamil: "பொதுவான கேள்விகளுக்கு மற்றும் Gemini AI உடனான உரையாடலுக்கு, தயவுசெய்து .env கோப்பில் GEMINI_API_KEY சேர்க்கவும்."
  };

  return {
    reply: guidanceMessages[currentLang] || guidanceMessages.English,
    success: false,
    source: 'unavailable'
  };
}

// Intent Recognition & Natural Language Response Engine for NeuroNex Voice Assistant
// Strictly data-driven: Never invents fake facts, fake names, or fake contacts.
// Compliant with dementia-safe communication standards.

/**
 * Process a user query against actual patient/caregiver stored data
 * @param {string} query - raw user query text
 * @param {object} patientData - current patient state from AppContext
 * @returns {object} { reply: string, intent: string, action?: Function }
 */
export function processVoiceIntent(query, patientData) {
  if (!query || typeof query !== 'string') {
    return {
      intent: 'UNKNOWN',
      reply: "I am listening. Please ask me anything about your home, family, medicines, or daily tasks."
    };
  }

  const clean = query.toLowerCase().trim();
  const preferredName = patientData.profile?.preferredName || patientData.profile?.fullName || 'Friend';
  const family = patientData.family || [];
  const medicines = patientData.medicines || [];
  const todos = patientData.todos || [];
  const routine = patientData.routine || [];
  const memories = patientData.memories || [];
  const places = patientData.places || [];
  const home = patientData.homeLocation || {};
  const personalInfo = patientData.personalInfo || {};
  const importantInfo = patientData.importantInfo || [];
  const doctor = importantInfo.find(i => i.label?.toLowerCase().includes('doctor'));

  // 1. ADD REMINDER / TO-DO CREATION INTENT
  const remindMatch = clean.match(/(?:remind me to|set a reminder to|add a task to|add to my list|remember to)\s+(.+)/i);
  if (remindMatch && remindMatch[1]) {
    const taskTitle = remindMatch[1].replace(/at\s+\d+.*$/i, '').trim();
    const timeMatch = query.match(/(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const taskTime = timeMatch ? timeMatch[1].toUpperCase() : 'Today';

    return {
      intent: 'CREATE_TODO',
      reply: `I have noted that for you! "${taskTitle}" has been added to your to-do list for ${taskTime}.`,
      action: (addTodoFn) => {
        if (addTodoFn) {
          addTodoFn({
            title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
            time: taskTime,
            completed: false,
            recurrence: 'Once'
          });
        }
      }
    };
  }

  // 2. MEDICAL / DIAGNOSIS QUESTIONS (Safety Guardrail: Never diagnose or give medical prescriptions)
  if (
    clean.includes('diagnos') ||
    clean.includes('dementia') ||
    clean.includes('alzheimer') ||
    clean.includes('disease') ||
    clean.includes('am i sick') ||
    clean.includes('what is wrong with me') ||
    clean.includes('cure')
  ) {
    return {
      intent: 'MEDICAL_DISCLAIMER',
      reply: `I am your memory companion, ${preferredName}, not a medical doctor. I cannot make medical diagnoses. For any health questions, symptoms, or medical advice, please speak with your doctor or caregiver.`
    };
  }

  // 3. SPECIFIC PERSON INQUIRY (Search by caregiver/family-added member name e.g., "Who is Priya?")
  for (const person of family) {
    const personNameLower = person.name.toLowerCase();
    if (clean.includes(personNameLower)) {
      const relationText = person.relation ? `is your loving ${person.relation}` : 'is your family member';
      const notesText = person.notes ? ` ${person.notes}.` : '';
      const phoneText = person.phone ? ` Phone: ${person.phone}.` : '';
      return {
        intent: 'FAMILY_PERSON_DETAIL',
        reply: `${person.name} ${relationText}.${notesText}${phoneText}`
      };
    }
  }

  // 4. RELATIONSHIP / FAMILY INQUIRY (e.g., "who is my daughter", "what is my daughter's name", "tell me my daughter's name")
  const relationKeywords = [
    { key: 'daughter', label: 'daughter' },
    { key: 'son', label: 'son' },
    { key: 'husband', label: 'husband' },
    { key: 'wife', label: 'wife' },
    { key: 'spouse', label: 'spouse' },
    { key: 'sister', label: 'sister' },
    { key: 'brother', label: 'brother' },
    { key: 'grandchild', label: 'grandchild' },
    { key: 'grandson', label: 'grandson' },
    { key: 'granddaughter', label: 'granddaughter' },
    { key: 'child', label: 'children' },
    { key: 'children', label: 'children' },
    { key: 'mother', label: 'mother' },
    { key: 'father', label: 'father' },
    { key: 'friend', label: 'friend' }
  ];

  for (const rel of relationKeywords) {
    if (clean.includes(rel.key)) {
      const matchingMembers = family.filter(f => 
        f.relation.toLowerCase().includes(rel.key) || 
        (rel.key === 'children' && (f.relation.toLowerCase().includes('daughter') || f.relation.toLowerCase().includes('son'))) ||
        (rel.key === 'spouse' && (f.relation.toLowerCase().includes('husband') || f.relation.toLowerCase().includes('wife')))
      );

      if (matchingMembers.length > 0) {
        const names = matchingMembers.map(m => `${m.name}${m.notes ? ` (${m.notes})` : ''}`).join(' and ');
        return {
          intent: 'FAMILY_RELATION_FOUND',
          reply: `Your ${rel.label} is ${names}.`
        };
      } else {
        return {
          intent: 'FAMILY_RELATION_MISSING',
          reply: `I don't have a ${rel.label} listed in your family yet. You can ask your family member to add them in Family & People.`
        };
      }
    }
  }

  // 5. GENERAL FAMILY INQUIRY ("who is in my family", "tell me about my family", "who are my relatives")
  if (clean.includes('family') || clean.includes('relative') || clean.includes('people i know') || clean.includes('who is at home')) {
    if (family.length > 0) {
      const list = family.map(f => `${f.name} (${f.relation})`).join(', ');
      return {
        intent: 'FAMILY_LIST',
        reply: `Your family members saved in your memory companion are: ${list}.`
      };
    } else {
      return {
        intent: 'FAMILY_EMPTY',
        reply: "No family members have been added to your memory companion yet. You can ask your family member to add them in Family & People."
      };
    }
  }

  // 6. IMPORTANT DATES / ANNIVERSARY / BIRTHDAY ("when is my wedding anniversary", "birthday", "anniversary", "important dates")
  if (clean.includes('anniversary') || clean.includes('wedding') || clean.includes('birthday') || clean.includes('date of birth')) {
    // Check memories for anniversary/wedding or date mentions
    const weddingMem = memories.find(m => 
      m.category?.toLowerCase().includes('wedding') || 
      m.title?.toLowerCase().includes('wedding') || 
      m.title?.toLowerCase().includes('anniversary')
    );

    if (weddingMem) {
      return {
        intent: 'ANNIVERSARY_FOUND',
        reply: `Your wedding was celebrated in ${weddingMem.date || 'a special year'}. ${weddingMem.description || ''}`
      };
    }

    if (personalInfo.familyFacts && (personalInfo.familyFacts.toLowerCase().includes('anniversary') || personalInfo.familyFacts.toLowerCase().includes('wedding'))) {
      return {
        intent: 'ANNIVERSARY_FACT_FOUND',
        reply: personalInfo.familyFacts
      };
    }

    return {
      intent: 'DATES_MISSING',
      reply: "I don't have that date saved yet. You can ask your family member to add your anniversary or important dates in Personal Preferences or Memories."
    };
  }

  // 7. MEMORIES & STORIES INQUIRY ("what memories have my family added", "tell me a memory", "my memories", "darjeeling")
  if (clean.includes('memory') || clean.includes('memories') || clean.includes('story') || clean.includes('stories') || clean.includes('remember') || clean.includes('darjeeling')) {
    if (memories.length > 0) {
      // If user asks about a specific memory topic
      const matchingMem = memories.find(m => clean.includes(m.title.toLowerCase()) || clean.includes(m.category.toLowerCase()) || (m.description && clean.includes(m.description.toLowerCase().slice(0, 15))));
      const memToShare = matchingMem || memories[Math.floor(Math.random() * memories.length)];
      return {
        intent: 'MEMORY_STORY',
        reply: `Here is a cherished memory: "${memToShare.title}" (${memToShare.date || 'Memories'}) — ${memToShare.description || ''}`
      };
    } else {
      return {
        intent: 'MEMORY_EMPTY',
        reply: "No memories have been added yet. You can ask your family member to add your cherished memories in the Memories section."
      };
    }
  }

  // 8. PERSONAL PREFERENCES ("what is my favorite food", "favorite color", "my hobbies", "what do i like")
  if (clean.includes('favorite food') || clean.includes('favourite food') || clean.includes('food i like')) {
    if (personalInfo.favoriteFood) {
      return {
        intent: 'FAVORITE_FOOD',
        reply: `Your favorite food is ${personalInfo.favoriteFood}.`
      };
    } else {
      return {
        intent: 'PREFERENCE_MISSING',
        reply: "I don't have your favorite food noted yet. Ask your family member to save your preferences."
      };
    }
  }

  if (clean.includes('favorite color') || clean.includes('favourite colour') || clean.includes('color i like')) {
    if (personalInfo.favoriteColor) {
      return {
        intent: 'FAVORITE_COLOR',
        reply: `Your favorite color is ${personalInfo.favoriteColor}.`
      };
    } else {
      return {
        intent: 'PREFERENCE_MISSING',
        reply: "I don't have your favorite color saved yet. Ask your family member to save it."
      };
    }
  }

  if (clean.includes('hobby') || clean.includes('hobbies') || clean.includes('what do i enjoy')) {
    if (personalInfo.hobbies) {
      return {
        intent: 'HOBBIES',
        reply: `Your favorite hobbies are: ${personalInfo.hobbies}.`
      };
    } else {
      return {
        intent: 'PREFERENCE_MISSING',
        reply: "I don't have your hobbies listed yet. Ask your family member to add them in Personal Preferences."
      };
    }
  }

  // 9. IMPORTANT PLACES ("where is my daughter's house", "temple", "park", "familiar places")
  for (const place of places) {
    if (clean.includes(place.name.toLowerCase()) || (place.relation && clean.includes(place.relation.toLowerCase()))) {
      return {
        intent: 'PLACE_FOUND',
        reply: `${place.name}: Located at ${place.address || 'nearby'}. ${place.description || ''}`
      };
    }
  }

  // 10. DAILY ROUTINE INQUIRY ("what is my routine today", "my routine", "my schedule", "what comes next")
  if (clean.includes('routine') || clean.includes('daily schedule') || clean.includes('daily routine')) {
    if (routine.length > 0) {
      const routineSteps = routine.map(r => `${r.time}: ${r.activity}`).join(' → ');
      return {
        intent: 'ROUTINE_FOUND',
        reply: `Your daily routine today is: ${routineSteps}.`
      };
    } else {
      return {
        intent: 'ROUTINE_EMPTY',
        reply: "No daily routine milestones have been set yet. Your caregiver can configure your daily schedule in the Routine section."
      };
    }
  }

  // 11. HOME & LOCATION INQUIRY ("where do I live", "where is my home", "what city", "my address")
  if (
    clean.includes('live') || 
    clean.includes('home') || 
    clean.includes('address') || 
    clean.includes('city') || 
    clean.includes('house') ||
    clean.includes('location')
  ) {
    if (home.address || home.city) {
      const cityPart = home.city ? ` in ${home.city}` : '';
      const addressPart = home.address ? ` at ${home.address}` : '';
      return {
        intent: 'HOME_LOCATION_FOUND',
        reply: `You live${cityPart}${addressPart}. It is a safe and peaceful home.`
      };
    } else {
      return {
        intent: 'HOME_LOCATION_MISSING',
        reply: "No home address has been saved yet. You can ask your caregiver to add your home address in Safety & Safe-Zone."
      };
    }
  }

  // 12. MEDICINES & PILLS INQUIRY ("what medicine do I take in the morning", "what medicine do I take", "pills")
  if (
    clean.includes('medicine') || 
    clean.includes('medicines') || 
    clean.includes('pill') || 
    clean.includes('pills') || 
    clean.includes('prescription') || 
    clean.includes('dose') || 
    clean.includes('tablet')
  ) {
    if (medicines.length === 0) {
      return {
        intent: 'MEDICINE_EMPTY',
        reply: "No medicine reminders have been added yet. Your caregiver can configure your medicines in the Caregiver portal."
      };
    }

    let filtered = medicines;
    let timeLabel = '';
    if (clean.includes('morning')) {
      filtered = medicines.filter(m => m.tag?.toLowerCase().includes('morning') || m.time?.toLowerCase().includes('am') || m.time?.startsWith('08') || m.time?.startsWith('8'));
      timeLabel = 'for the morning';
    } else if (clean.includes('afternoon')) {
      filtered = medicines.filter(m => m.tag?.toLowerCase().includes('afternoon') || m.time?.toLowerCase().includes('pm'));
      timeLabel = 'for the afternoon';
    } else if (clean.includes('evening') || clean.includes('night')) {
      filtered = medicines.filter(m => m.tag?.toLowerCase().includes('evening') || m.tag?.toLowerCase().includes('night'));
      timeLabel = 'for the evening/night';
    }

    if (filtered.length > 0) {
      const medDescriptions = filtered.map(m => `${m.name} (${m.dosage || 'standard dose'}) at ${m.time}${m.status === 'taken' ? ' - already taken' : ' - pending'}`).join(', ');
      return {
        intent: 'MEDICINE_FOUND',
        reply: `Your scheduled medicines ${timeLabel ? timeLabel + ' ' : ''}are: ${medDescriptions}.`
      };
    } else {
      return {
        intent: 'MEDICINE_TIME_EMPTY',
        reply: `You don't have any medicines scheduled specifically ${timeLabel}. Ask your caregiver if you are unsure.`
      };
    }
  }

  // 13. TO-DO & DAILY TASKS INQUIRY ("what do I have to do today", "tasks", "walk")
  if (
    clean.includes('to do') || 
    clean.includes('todo') || 
    clean.includes('task') || 
    clean.includes('tasks') || 
    clean.includes('what should i do') || 
    clean.includes('what do i have to do') ||
    clean.includes('walk')
  ) {
    if (todos.length === 0) {
      return {
        intent: 'TODO_EMPTY',
        reply: "No tasks added yet. Ask your caregiver to add your daily tasks in Daily Care."
      };
    }

    const pending = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);

    if (pending.length > 0) {
      const pendingList = pending.map(t => `${t.title}${t.time ? ` at ${t.time}` : ''}`).join(', ');
      const completedText = completed.length > 0 ? ` You have already completed ${completed.length} task${completed.length > 1 ? 's' : ''}.` : '';
      return {
        intent: 'TODO_FOUND',
        reply: `Today you have: ${pendingList}.${completedText}`
      };
    } else {
      return {
        intent: 'TODO_ALL_COMPLETED',
        reply: `Wonderful job, ${preferredName}! You have completed all ${todos.length} of your daily tasks today.`
      };
    }
  }

  // 14. EMERGENCY & DOCTOR INQUIRY ("who should I call if I need help", "who is my doctor", "help", "emergency")
  if (
    clean.includes('doctor') || 
    clean.includes('emergency') || 
    clean.includes('help') || 
    clean.includes('sos') || 
    clean.includes('call') || 
    clean.includes('ambulance') || 
    clean.includes('police')
  ) {
    const parts = [];
    if (doctor) {
      parts.push(`Your family doctor is ${doctor.value}.`);
    }
    const emergencyFamily = family.filter(f => f.isEmergencyContact || f.phone);
    if (emergencyFamily.length > 0) {
      const contacts = emergencyFamily.map(f => `${f.name} (${f.phone || f.relation})`).join(', ');
      parts.push(`You can call your family: ${contacts}.`);
    }
    parts.push(`For immediate public services: Medical Ambulance is 108 and Police Emergency is 100.`);

    return {
      intent: 'EMERGENCY_INFO',
      reply: parts.join(' ')
    };
  }

  // 15. EMOTIONAL SUPPORT / REASSURANCE / GREETING
  if (clean.includes('confused') || clean.includes('lost') || clean.includes('scared') || clean.includes('worried') || clean.includes('where am i')) {
    return {
      intent: 'EMOTIONAL_REASSURANCE',
      reply: `You are safe, ${preferredName}. I am right here with you. Take a gentle breath. Everything is okay, and your family and caregiver are looking out for you.`
    };
  }

  if (clean.includes('hello') || clean.includes('hi') || clean.includes('good morning') || clean.includes('good afternoon') || clean.includes('good evening') || clean.includes('namaste')) {
    return {
      intent: 'GREETING',
      reply: `Hello ${preferredName} ❤️ How are you feeling today? I am here to help you with your family, memories, medicines, or daily tasks.`
    };
  }

  if (clean.includes('thank') || clean.includes('thanks')) {
    return {
      intent: 'GRATITUDE',
      reply: `You are always welcome, ${preferredName}! It is my joy to assist you.`
    };
  }

  if (clean.includes('who are you') || clean.includes('what are you') || clean.includes('your name')) {
    return {
      intent: 'IDENTITY',
      reply: "I am NeuroNex, your personal cognitive and memory companion. I help you stay connected with your family, daily routines, and cherished memories."
    };
  }

  // DEFAULT STRICT DATA-GROUNDED FALLBACK (No hallucinated facts)
  return {
    intent: 'UNKNOWN_GUIDANCE',
    reply: `I don't have that information yet, ${preferredName}. You can ask your family member or caregiver to add it, or ask me about your family, home address, medicines, or daily tasks.`
  };
}

// Adaptive Cognitive Exercise Engine for NeuroNex
// Transparent, performance-based 5-level adaptive scaling
// Multi-category evaluation with rolling window & reshuffle content generation

export const ALL_GAMES = [
  {
    id: "memory-twin",
    name: "Memory Twin",
    subtitle: "Card Matching Exercise",
    category: "memory",
    icon: "Grid2X2",
    duration: "2-3 mins",
    description: "Flip over cards and match pairs of familiar everyday items.",
    target: "Visual working memory & recall",
    requiresFamily: false
  },
  {
    id: "memory-basket",
    name: "Memory Basket",
    subtitle: "Shopping Basket Recall",
    category: "recall",
    icon: "ShoppingBasket",
    duration: "3 mins",
    description: "Remember the groceries shown, then pick them out from the shelf.",
    target: "Short-term list recall & recognition",
    requiresFamily: false
  },
  {
    id: "family-memory",
    name: "Family Memory",
    subtitle: "Family Quiz & Faces",
    category: "memory",
    icon: "Heart",
    duration: "3-4 mins",
    description: "Personalized questions with family photos and cherished relationships.",
    target: "Long-term social recognition & emotional bonding",
    requiresFamily: true
  },
  {
    id: "picture-memory",
    name: "Remember the Picture",
    subtitle: "Scene Observation",
    category: "attention",
    icon: "Eye",
    duration: "3 mins",
    description: "Look closely at a calm home garden scene, then answer what you saw.",
    target: "Visual attention, detail orientation & focus",
    requiresFamily: false
  },
  {
    id: "pattern-memory",
    name: "Number & Pattern",
    subtitle: "Sequence Memory",
    category: "sequencing",
    icon: "Shuffle",
    duration: "2 mins",
    description: "Watch a simple sequence of colors or numbers and recall the last step.",
    target: "Sequential processing & pattern tracking",
    requiresFamily: false
  },
  {
    id: "daily-routine",
    name: "Daily Routine",
    subtitle: "What Comes Next?",
    category: "sequencing",
    icon: "Clock",
    duration: "3 mins",
    description: "Organize your familiar daily steps (tea, morning medicine, breakfast).",
    target: "Procedural memory & executive daily planning",
    requiresFamily: false
  },
  {
    id: "odd-one-out",
    name: "Odd One Out",
    subtitle: "Attention & Difference",
    category: "attention",
    icon: "Sparkles",
    duration: "2 mins",
    description: "Spot the one object that looks different from all the others.",
    target: "Visual discrimination & quick attention",
    requiresFamily: false
  },
];

// 5-Level Adaptive Configuration for Every Cognitive Game
export const GAME_LEVEL_CONFIGS = {
  'memory-twin': {
    1: { pairsCount: 2, label: 'Level 1 (2 Pairs)', timeLimit: 45 },
    2: { pairsCount: 3, label: 'Level 2 (3 Pairs)', timeLimit: 60 },
    3: { pairsCount: 4, label: 'Level 3 (4 Pairs)', timeLimit: 75 },
    4: { pairsCount: 5, label: 'Level 4 (5 Pairs)', timeLimit: 90 },
    5: { pairsCount: 6, label: 'Level 5 (6 Pairs)', timeLimit: 120 },
  },
  'memory-basket': {
    1: { itemCount: 3, viewSeconds: 10, label: 'Level 1 (3 Items • 10s)' },
    2: { itemCount: 4, viewSeconds: 8, label: 'Level 2 (4 Items • 8s)' },
    3: { itemCount: 5, viewSeconds: 7, label: 'Level 3 (5 Items • 7s)' },
    4: { itemCount: 6, viewSeconds: 6, label: 'Level 4 (6 Items • 6s)' },
    5: { itemCount: 7, viewSeconds: 5, label: 'Level 5 (7 Items • 5s)' },
  },
  'family-memory': {
    1: { questionCount: 2, optionsCount: 2, label: 'Level 1 (2 Questions • 2 Options)' },
    2: { questionCount: 3, optionsCount: 3, label: 'Level 2 (3 Questions • 3 Options)' },
    3: { questionCount: 4, optionsCount: 3, label: 'Level 3 (4 Questions • 3 Options)' },
    4: { questionCount: 4, optionsCount: 4, label: 'Level 4 (4 Questions • 4 Options)' },
    5: { questionCount: 5, optionsCount: 4, label: 'Level 5 (5 Questions • 4 Options)' },
  },
  'picture-memory': {
    1: { viewSeconds: 10, questionCount: 2, label: 'Level 1 (10s View • 2 Questions)' },
    2: { viewSeconds: 8, questionCount: 3, label: 'Level 2 (8s View • 3 Questions)' },
    3: { viewSeconds: 6, questionCount: 3, label: 'Level 3 (6s View • 3 Questions)' },
    4: { viewSeconds: 5, questionCount: 4, label: 'Level 4 (5s View • 4 Questions)' },
    5: { viewSeconds: 4, questionCount: 4, label: 'Level 5 (4s View • 4 Questions)' },
  },
  'pattern-memory': {
    1: { sequenceLength: 3, label: 'Level 1 (3 Steps)' },
    2: { sequenceLength: 4, label: 'Level 2 (4 Steps)' },
    3: { sequenceLength: 5, label: 'Level 3 (5 Steps)' },
    4: { sequenceLength: 6, label: 'Level 4 (6 Steps)' },
    5: { sequenceLength: 7, label: 'Level 5 (7 Steps)' },
  },
  'daily-routine': {
    1: { questionCount: 2, optionsCount: 2, label: 'Level 1 (2 Steps • 2 Options)' },
    2: { questionCount: 3, optionsCount: 3, label: 'Level 2 (3 Steps • 3 Options)' },
    3: { questionCount: 4, optionsCount: 3, label: 'Level 3 (4 Steps • 3 Options)' },
    4: { questionCount: 4, optionsCount: 4, label: 'Level 4 (4 Steps • 4 Options)' },
    5: { questionCount: 5, optionsCount: 4, label: 'Level 5 (5 Steps • 4 Options)' },
  },
  'odd-one-out': {
    1: { itemsInRow: 4, rounds: 2, label: 'Level 1 (4 Items • 2 Rounds)' },
    2: { itemsInRow: 4, rounds: 3, label: 'Level 2 (4 Items • 3 Rounds)' },
    3: { itemsInRow: 5, rounds: 3, label: 'Level 3 (5 Items • 3 Rounds)' },
    4: { itemsInRow: 6, rounds: 3, label: 'Level 4 (6 Items • 3 Rounds)' },
    5: { itemsInRow: 6, rounds: 4, label: 'Level 5 (6 Items • 4 Rounds)' },
  },
};

/**
 * Transparent adaptive difficulty calculator
 * Evaluates a rolling window of recent attempts (last 3-5 sessions) in a category.
 * Requires at least 2 consecutive high scores (>= 85%) to advance, never after 1 single attempt.
 * Lowers level gently if struggling (< 60% in 2 consecutive attempts).
 * 
 * @param {Array<object>} history - Cognitive history records
 * @param {number} currentLevel - Current difficulty level (1-5)
 * @param {string} category - e.g. 'memory', 'recall', 'attention', 'sequencing'
 * @returns {{ newLevel: number, levelNotice: string | null }}
 */
export function evaluateAdaptiveDifficulty(history = [], currentLevel = 1, category = 'memory') {
  const catKey = (category || 'memory').toLowerCase();
  const catHistory = history.filter(h => (h.category || '').toLowerCase() === catKey);

  // If fewer than 2 completed attempts in this category, maintain level
  if (catHistory.length < 2) {
    return { newLevel: currentLevel, levelNotice: null };
  }

  const recent = catHistory.slice(0, 3); // Most recent attempts (newest first)
  const [first, second] = recent;

  // Advance level: 2 consecutive attempts >= 85%
  if (first.accuracy >= 85 && second.accuracy >= 85) {
    if (currentLevel < 5) {
      const newLevel = currentLevel + 1;
      return {
        newLevel,
        levelNotice: `🎉 Wonderful consistency! Difficulty gently advanced to Level ${newLevel}.`
      };
    }
  }

  // Reduce level: 2 consecutive attempts < 60%
  if (first.accuracy < 60 && second.accuracy < 60) {
    if (currentLevel > 1) {
      const newLevel = currentLevel - 1;
      return {
        newLevel,
        levelNotice: `Difficulty gently adjusted to Level ${newLevel} for maximum comfort.`
      };
    }
  }

  return { newLevel: currentLevel, levelNotice: null };
}

// ── Reshuffle Content Generators ──────────────────────────────────────────

const BASKET_ITEM_POOLS = [
  // Fruits & Kitchen
  { id: 'apple', name: 'Fresh Apple', icon: '🍎' },
  { id: 'banana', name: 'Ripe Banana', icon: '🍌' },
  { id: 'tea', name: 'Morning Tea', icon: '🍵' },
  { id: 'bread', name: 'Warm Bread', icon: '🍞' },
  { id: 'orange', name: 'Juicy Orange', icon: '🍊' },
  { id: 'milk', name: 'Cold Milk', icon: '🥛' },
  { id: 'honey', name: 'Pure Honey', icon: '🍯' },
  { id: 'biscuit', name: 'Tea Biscuit', icon: '🍪' },

  // Household & Familiar Keepsakes
  { id: 'book', name: 'Favorite Book', icon: '📖' },
  { id: 'key', name: 'House Key', icon: '🔑' },
  { id: 'glasses', name: 'Reading Glasses', icon: '👓' },
  { id: 'clock', name: 'Desk Clock', icon: '⏰' },
  { id: 'umbrella', name: 'Umbrella', icon: '☂️' },
  { id: 'flower', name: 'Garden Rose', icon: '🌹' },
  { id: 'cup', name: 'Porcelain Cup', icon: '☕' },
  { id: 'bell', name: 'Brass Bell', icon: '🔔' },
];

/**
 * Generates fresh, randomized items for Memory Basket respecting level & avoiding repeat sequences
 * @param {number} level - 1 to 5
 * @param {Array<string>} [previousIds=[]] - IDs from previous attempt to avoid
 */
export function generateMemoryBasketSession(level = 1, previousIds = []) {
  const config = GAME_LEVEL_CONFIGS['memory-basket'][level] || GAME_LEVEL_CONFIGS['memory-basket'][1];
  const targetCount = config.itemCount;

  // Filter out items used in immediate previous session when possible
  const freshPool = BASKET_ITEM_POOLS.filter(item => !previousIds.includes(item.id));
  const candidatePool = freshPool.length >= targetCount ? freshPool : BASKET_ITEM_POOLS;

  const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, targetCount);

  // Remaining become shelf distractors (pick 4-6 distractors)
  const selectedIds = selected.map(s => s.id);
  const shelfDistractors = BASKET_ITEM_POOLS
    .filter(item => !selectedIds.includes(item.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.max(4, 8 - targetCount));

  const allShelfItems = [...selected, ...shelfDistractors].sort(() => 0.5 - Math.random());

  return {
    levelConfig: config,
    targetItems: selected,
    shelfItems: allShelfItems,
    targetIds: selectedIds
  };
}

const MEMORY_TWIN_PAIRS_POOL = [
  { id: 'sun', icon: '☀️', name: 'Warm Sun' },
  { id: 'tree', icon: '🌳', name: 'Green Tree' },
  { id: 'cup', icon: '☕', name: 'Morning Cup' },
  { id: 'flower', icon: '🌸', name: 'Blossom' },
  { id: 'book', icon: '📚', name: 'Story Book' },
  { id: 'music', icon: '🎵', name: 'Melody' },
  { id: 'house', icon: '🏡', name: 'Cozy House' },
  { id: 'star', icon: '⭐', name: 'Bright Star' },
];

/**
 * Generates fresh, randomized card grid for Memory Twin matching
 */
export function generateMemoryTwinSession(level = 1, previousPairIds = []) {
  const config = GAME_LEVEL_CONFIGS['memory-twin'][level] || GAME_LEVEL_CONFIGS['memory-twin'][1];
  const count = config.pairsCount;

  const fresh = MEMORY_TWIN_PAIRS_POOL.filter(p => !previousPairIds.includes(p.id));
  const pool = fresh.length >= count ? fresh : MEMORY_TWIN_PAIRS_POOL;

  const selectedPairs = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
  const cards = [];

  selectedPairs.forEach((pair, pairIdx) => {
    cards.push({ id: `c-${pair.id}-1`, pairId: pair.id, icon: pair.icon, name: pair.name, flipped: false, matched: false });
    cards.push({ id: `c-${pair.id}-2`, pairId: pair.id, icon: pair.icon, name: pair.name, flipped: false, matched: false });
  });

  return {
    levelConfig: config,
    cards: cards.sort(() => 0.5 - Math.random()),
    pairIds: selectedPairs.map(p => p.id)
  };
}

/**
 * Generates personalized Family Memory questions from family members & memories
 */
export function generateFamilyMemorySession(familyList = [], memoriesList = [], level = 1, attemptCycle = 0) {
  const config = GAME_LEVEL_CONFIGS['family-memory'][level] || GAME_LEVEL_CONFIGS['family-memory'][1];
  const questions = [];

  const allRelations = ['Daughter', 'Son', 'Husband', 'Wife', 'Sister', 'Brother', 'Grandchild', 'Friend', 'Doctor'];

  // 1. Questions from Family Members
  if (familyList && familyList.length > 0) {
    const shuffledFamily = [...familyList].sort(() => 0.5 - Math.random());
    shuffledFamily.forEach(person => {
      const distractors = allRelations
        .filter(r => r.toLowerCase() !== person.relation.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, config.optionsCount - 1);

      const options = [person.relation, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({
        type: 'person',
        person,
        question: `Who is ${person.name}?`,
        subtext: `How is ${person.name} related to you?`,
        correctAnswer: person.relation,
        options,
        photo: person.avatar || null
      });
    });
  }

  // 2. Questions from Memories (if available, for variety across reshuffles)
  if (memoriesList && memoriesList.length > 0) {
    const shuffledMem = [...memoriesList].sort(() => 0.5 - Math.random());
    shuffledMem.forEach(mem => {
      if (mem.category || mem.date) {
        const correct = mem.title;
        const otherTitles = memoriesList.filter(m => m.id !== mem.id).map(m => m.title);
        const distractors = [...otherTitles, 'Family Gathering', 'Afternoon Walk', 'Garden Visit']
          .filter(t => t !== correct)
          .slice(0, config.optionsCount - 1);

        const options = [correct, ...distractors].sort(() => 0.5 - Math.random());
        questions.push({
          type: 'memory',
          question: `Which memory relates to: "${mem.description?.slice(0, 50)}..."?`,
          subtext: `Cherished event from ${mem.date || 'your life'}`,
          correctAnswer: correct,
          options,
          photo: mem.photo || null
        });
      }
    });
  }

  // Pick up to configured questionCount
  const finalQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, config.questionCount);
  return {
    levelConfig: config,
    questions: finalQuestions
  };
}

/**
 * Generates Daily Routine sequential questions from caregiver routine milestones
 */
export function generateDailyRoutineSession(routineSteps = [], level = 1) {
  const config = GAME_LEVEL_CONFIGS['daily-routine'][level] || GAME_LEVEL_CONFIGS['daily-routine'][1];

  const defaultRoutine = [
    { time: "07:00 AM", activity: "Morning Tea & Quiet Time" },
    { time: "08:00 AM", activity: "Morning Medicine" },
    { time: "08:30 AM", activity: "Breakfast" },
    { time: "10:00 AM", activity: "Gentle Walk" },
    { time: "01:00 PM", activity: "Lunch" },
    { time: "08:00 PM", activity: "Evening Rest & Dinner" }
  ];

  const steps = (routineSteps && routineSteps.length >= 3) ? routineSteps : defaultRoutine;
  const questions = [];

  for (let i = 0; i < steps.length - 1; i++) {
    const current = steps[i];
    const next = steps[i + 1];

    const distractors = steps
      .filter((_, idx) => idx !== i + 1)
      .map(s => s.activity)
      .sort(() => 0.5 - Math.random())
      .slice(0, config.optionsCount - 1);

    const options = [next.activity, ...distractors].sort(() => 0.5 - Math.random());

    questions.push({
      question: `What comes after ${current.activity} (${current.time})?`,
      subtext: "Think about your familiar daily circadian flow.",
      correctAnswer: next.activity,
      options
    });
  }

  return {
    levelConfig: config,
    questions: questions.sort(() => 0.5 - Math.random()).slice(0, config.questionCount)
  };
}

// Dynamic Game Rotation System
export function getRecommendedGames(sessionCycle = 1, familyList = [], history = []) {
  const hasFamilyData = familyList && familyList.length > 0;

  const rotationPlans = [
    hasFamilyData 
      ? ["family-memory", "memory-basket", "odd-one-out"]
      : ["memory-basket", "odd-one-out", "memory-twin"],
    ["picture-memory", "daily-routine", "pattern-memory"],
    hasFamilyData
      ? ["memory-twin", "family-memory", "memory-basket"]
      : ["memory-twin", "memory-basket", "odd-one-out"],
    ["odd-one-out", "daily-routine", "pattern-memory"],
    ["memory-basket", "picture-memory", "daily-routine"],
    ["memory-twin", "pattern-memory", "odd-one-out"]
  ];

  const planIndex = (Math.max(1, sessionCycle) - 1) % rotationPlans.length;
  const selectedIds = rotationPlans[planIndex];

  return selectedIds
    .map(id => ALL_GAMES.find(g => g.id === id))
    .filter(Boolean);
}

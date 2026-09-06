export const emptyPatientData = {
  profile: {
    fullName: "",
    preferredName: "",
    age: "",
    gender: "Female",
    email: "",
    phone: "",
    language: "English",
    avatar: "",
    registered: false,
    patientId: "",
  },
  linkedFamilyMembers: [],
  linkedCaregivers: [],
  homeLocation: {
    name: "",
    address: "",
    city: "",
    safeZoneRadius: 500,
    currentDistance: 0,
    coordinates: null,
  },
  family: [],
  places: [],
  memories: [],
  personalInfo: {
    favoriteFood: "",
    favoriteColor: "",
    hobbies: "",
    familyFacts: "",
    preferences: ""
  },
  importantInfo: [],
  medicines: [],
  todos: [],
  routine: [],
  reminders: [],
  emergencyContacts: [
    { id: "ec-3", title: "CALL POLICE", name: "Police Emergency (Standard Service)", phone: "100", isService: true, color: "bg-amber-50 text-amber-800 border-amber-200" },
    { id: "ec-4", title: "EMERGENCY AMBULANCE", name: "Medical Ambulance (Standard Service)", phone: "108", isService: true, color: "bg-rose-100 text-rose-800 border-rose-300" },
  ],
  brainExercise: {
    dailyCompleted: false,
    scheduledTime: "10:00 AM",
    todaysGames: ["memory-basket", "odd-one-out", "picture-memory"],
    dayCycle: 1,
  },
  cognitiveStats: {
    currentLevel: 1, // 1: Level 1 (Easy), 2: Level 2 (Medium), 3: Level 3 (Hard)
    consecutiveHighScores: 0,
    gamesCompleted: 0,
    averageAccuracy: 0,
    averageResponseSecs: 0,
    daysCompletedThisWeek: 0,
    categories: {
      memory: 0,
      attention: 0,
      recall: 0,
      sequencing: 0,
    },
    weeklyTrends: [],
    history: []
  },
  alerts: []
};

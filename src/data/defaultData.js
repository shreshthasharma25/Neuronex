export const defaultPatientData = {
  profile: {
    fullName: "Ananya Sen",
    preferredName: "Maa",
    age: 68,
    gender: "Female",
    language: "English",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    registered: true,
    patientId: "pat-maa-7788",
  },
  linkedFamilyMembers: [
    {
      id: "fam-1",
      name: "Priya",
      relation: "Daughter",
      phone: "+91 98300 11223",
      dateLinked: "September 5, 2026"
    }
  ],
  linkedCaregivers: [
    {
      id: "cg-1",
      name: "Dr. Debashish Bose",
      title: "Family Care Physician",
      phone: "+91 98301 23456",
      dateLinked: "September 5, 2026"
    }
  ],
  homeLocation: {
    name: "My Home",
    address: "14 Lake Road, Kolkata",
    city: "Kolkata",
    safeZoneRadius: 500, // meters
    currentDistance: 0.3,
    coordinates: { lat: 22.518, lng: 88.353 },
  },
  family: [
    {
      id: "fam-1",
      name: "Priya",
      relation: "Daughter",
      phone: "+91 98300 11223",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      notes: "Visits every evening around 6 PM.",
      isEmergencyContact: true,
    }
  ],
  places: [
    {
      id: "pl-1",
      name: "My Home",
      address: "14 Lake Road, Kolkata",
      relation: "Home residence",
      description: "Our yellow two-story house with the mango tree.",
    },
    {
      id: "pl-2",
      name: "Daughter's House",
      address: "Southern Avenue, Kolkata",
      relation: "Priya's home",
      description: "Priya's apartment near the lake.",
    }
  ],
  memories: [
    {
      id: "mem-1",
      title: "Hometown in Kolkata",
      category: "Childhood memory",
      date: "1958",
      description: "Growing up near Ballygunge, enjoying rainy afternoons with tea and Rabindra Sangeet.",
      photo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: "mem-2",
      title: "Family Trip to Darjeeling",
      category: "Family trip",
      date: "Spring 2012",
      description: "Watching the sunrise over Kanchenjunga with Priya and having warm momos.",
      photo: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80"
    }
  ],
  personalInfo: {
    favoriteFood: "Warm khichuri with roasted papad",
    favoriteColor: "Soft marigold yellow",
    hobbies: "Singing Rabindra Sangeet & balcony gardening",
    familyFacts: "Daughter Priya lives 10 minutes away on Southern Avenue",
    preferences: "Likes morning tea at 7 AM with mild ginger"
  },
  importantInfo: [
    {
      id: "info-1",
      label: "Family Doctor",
      value: "Dr. Debashish Bose - +91 98301 23456",
    }
  ],
  medicines: [
    {
      id: "med-1",
      name: "Morning Medicine",
      dosage: "1 Tablet",
      time: "8:00 AM",
      frequency: "Daily",
      taken: false,
      instructions: "Take with warm water after breakfast",
      active: true,
    }
  ],
  todos: [
    { id: "todo-1", title: "Breakfast", time: "8:00 AM", recurrence: "Daily", completed: false, active: true },
    { id: "todo-2", title: "Morning Medicine", time: "8:00 AM", recurrence: "Daily", completed: false, isMed: true, active: true },
    { id: "todo-3", title: "Brain Exercise", time: "10:00 AM", recurrence: "Daily", completed: false, isExercise: true, active: true },
  ],
  routine: [
    { id: "r-1", step: 1, action: "Wake up & warm ginger tea", time: "7:00 AM" },
    { id: "r-2", step: 2, action: "Breakfast & Morning Medicine", time: "8:00 AM" },
    { id: "r-3", step: 3, action: "Brain Exercise with NeuroNex", time: "10:00 AM" },
    { id: "r-4", step: 4, action: "Lunch & afternoon rest", time: "1:30 PM" },
    { id: "r-5", step: 5, action: "Evening garden walk", time: "6:00 PM" },
  ],
  reminders: [
    { id: "rem-1", title: "Morning Medicine", time: "8:00 AM", category: "medicine", active: true },
    { id: "rem-2", title: "Brain Exercise", time: "10:00 AM", category: "exercise", active: true },
  ],
  emergencyContacts: [
    { id: "ec-1", title: "CALL FAMILY", name: "Priya (Daughter)", phone: "+91 98300 11223", color: "bg-red-50 text-red-700 border-red-200" },
    { id: "ec-2", title: "CALL DOCTOR", name: "Dr. Debashish Bose", phone: "+91 98301 23456", color: "bg-[#EBF5EE] text-[#1E5E3A] border-[#D8E2D9]" },
    { id: "ec-3", title: "CALL POLICE", name: "Police Emergency (Standard Service)", phone: "100", isService: true, color: "bg-amber-50 text-amber-800 border-amber-200" },
    { id: "ec-4", title: "EMERGENCY AMBULANCE", name: "Medical Ambulance (Standard Service)", phone: "108", isService: true, color: "bg-rose-100 text-rose-800 border-rose-300" },
  ],
  brainExercise: {
    dailyCompleted: false,
    scheduledTime: "10:00 AM",
    todaysGames: ["family-memory", "memory-basket", "odd-one-out"],
    dayCycle: 1,
  },
  cognitiveStats: {
    currentLevel: 1,
    consecutiveHighScores: 2,
    gamesCompleted: 11,
    averageAccuracy: 85,
    averageResponseSecs: 5.2,
    daysCompletedThisWeek: 6,
    categories: {
      memory: 85,
      recall: 85,
      attention: 81,
      focus: 87,
    },
    weeklyTrends: [
      { day: "Mon", accuracy: 80 },
      { day: "Tue", accuracy: 82 },
      { day: "Wed", accuracy: 84 },
      { day: "Thu", accuracy: 85 },
      { day: "Fri", accuracy: 85 },
      { day: "Sat", accuracy: 88 },
      { day: "Sun", accuracy: 92 },
    ],
    history: [
      {
        id: "h-1",
        gameId: "memory-twin",
        gameName: "Memory Match",
        cognitiveDomain: "memory",
        score: 92,
        accuracy: 92,
        timeTaken: "1m 30s",
        responseTime: 4.2,
        difficulty: "Level 1",
        attempts: 1,
        date: "Today, 10:15 AM",
        timestamp: Date.now() - 3600000 * 2
      },
      {
        id: "h-2",
        gameId: "pattern-memory",
        gameName: "Pattern Following",
        cognitiveDomain: "focus",
        score: 88,
        accuracy: 88,
        timeTaken: "1m 45s",
        responseTime: 5.1,
        difficulty: "Level 1",
        attempts: 1,
        date: "Today, 11:30 AM",
        timestamp: Date.now() - 3600000
      },
      {
        id: "h-3",
        gameId: "memory-basket",
        gameName: "Memory Basket",
        cognitiveDomain: "recall",
        score: 85,
        accuracy: 85,
        timeTaken: "2m 10s",
        responseTime: 6.0,
        difficulty: "Level 1",
        attempts: 1,
        date: "Yesterday, 3:45 PM",
        timestamp: Date.now() - 86400000 - 3600000 * 5
      },
      {
        id: "h-4",
        gameId: "odd-one-out",
        gameName: "Find the Different Object",
        cognitiveDomain: "attention",
        score: 82,
        accuracy: 82,
        timeTaken: "1m 15s",
        responseTime: 4.8,
        difficulty: "Level 1",
        attempts: 1,
        date: "Yesterday, 10:00 AM",
        timestamp: Date.now() - 86400000 - 3600000 * 10
      },
      {
        id: "h-5",
        gameId: "family-memory",
        gameName: "Name Recall",
        cognitiveDomain: "recall",
        score: 88,
        accuracy: 88,
        timeTaken: "2m 00s",
        responseTime: 5.5,
        difficulty: "Level 1",
        attempts: 1,
        date: "2 days ago",
        timestamp: Date.now() - 86400000 * 2 - 3600000 * 4
      },
      {
        id: "h-6",
        gameId: "picture-memory",
        gameName: "Picture Recall",
        cognitiveDomain: "memory",
        score: 80,
        accuracy: 80,
        timeTaken: "2m 30s",
        responseTime: 6.8,
        difficulty: "Level 1",
        attempts: 1,
        date: "2 days ago",
        timestamp: Date.now() - 86400000 * 2 - 3600000 * 8
      },
      {
        id: "h-7",
        gameId: "daily-routine",
        gameName: "Sequence Recall",
        cognitiveDomain: "recall",
        score: 82,
        accuracy: 82,
        timeTaken: "1m 50s",
        responseTime: 5.2,
        difficulty: "Level 1",
        attempts: 1,
        date: "3 days ago",
        timestamp: Date.now() - 86400000 * 3 - 3600000 * 3
      },
      {
        id: "h-8",
        gameId: "visual-attention",
        gameName: "Visual Attention",
        cognitiveDomain: "attention",
        score: 80,
        accuracy: 80,
        timeTaken: "1m 40s",
        responseTime: 5.0,
        difficulty: "Level 1",
        attempts: 1,
        date: "3 days ago",
        timestamp: Date.now() - 86400000 * 3 - 3600000 * 7
      },
      {
        id: "h-9",
        gameId: "focus-trail",
        gameName: "Focus Trail",
        cognitiveDomain: "focus",
        score: 86,
        accuracy: 86,
        timeTaken: "2m 15s",
        responseTime: 5.4,
        difficulty: "Level 1",
        attempts: 1,
        date: "4 days ago",
        timestamp: Date.now() - 86400000 * 4 - 3600000 * 5
      },
      {
        id: "h-10",
        gameId: "memory-twin",
        gameName: "Memory Match",
        cognitiveDomain: "memory",
        score: 84,
        accuracy: 84,
        timeTaken: "1m 55s",
        responseTime: 5.9,
        difficulty: "Level 1",
        attempts: 1,
        date: "5 days ago",
        timestamp: Date.now() - 86400000 * 5 - 3600000 * 6
      },
      {
        id: "h-11",
        gameId: "target-detection",
        gameName: "Target Detection",
        cognitiveDomain: "attention",
        score: 81,
        accuracy: 81,
        timeTaken: "1m 25s",
        responseTime: 4.5,
        difficulty: "Level 1",
        attempts: 1,
        date: "5 days ago",
        timestamp: Date.now() - 86400000 * 5 - 3600000 * 9
      }
    ]
  },
  alerts: [
    {
      id: "alt-1",
      type: "info",
      severity: "INFO",
      title: "Welcome to NeuroNex",
      message: "Daily care profile ready for Maa. All systems active.",
      time: "Just now",
      resolved: true,
      recipients: ["caregiver", "family"]
    }
  ]
};

// ─── ADDITIONAL DEMO PATIENTS FOR MULTI-PATIENT CAREGIVER MONITORING ────────

export const demoPatientRamesh = {
  profile: {
    fullName: "Ramesh Patel",
    preferredName: "Dadu",
    age: 74,
    gender: "Male",
    language: "Hindi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    registered: true,
    patientId: "pat-ramesh-2041",
  },
  homeLocation: {
    name: "Home",
    address: "Block B, Sector 14, Salt Lake",
    city: "Kolkata",
    safeZoneRadius: 400,
    currentDistance: 0.1,
    coordinates: { lat: 22.585, lng: 88.415 },
  },
  importantInfo: [
    { id: "info-dr", label: "Physician", value: "Dr. Debashish Bose - +91 98301 23456" }
  ],
  family: [
    { id: "fam-r1", name: "Siddharth", relation: "Son", phone: "+91 98305 67890", photo: "", notes: "Calls every evening at 8 PM" }
  ],
  medicines: [
    { id: "med-r1", name: "Blood Pressure Med", dosage: "1 Tablet", time: "8:30 AM", frequency: "Daily", taken: true, active: true },
    { id: "med-r2", name: "Evening Calcium", dosage: "1 Tablet", time: "8:00 PM", frequency: "Daily", taken: false, active: true },
  ],
  todos: [
    { id: "todo-r1", title: "Morning Walk & Stretches", time: "7:30 AM", recurrence: "Daily", completed: true, active: true },
    { id: "todo-r2", title: "Blood Pressure Medicine", time: "8:30 AM", recurrence: "Daily", completed: true, isMed: true, active: true },
    { id: "todo-r3", title: "Memory Game Practice", time: "11:00 AM", recurrence: "Daily", completed: false, isExercise: true, active: true },
  ],
  memories: [
    { id: "mem-r1", title: "Varanasi Riverbank Trip", date: "1972", description: "Evening Ganga aarti with family", photo: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=400&auto=format&fit=crop&q=80" }
  ],
  routine: [
    { id: "rr-1", step: 1, action: "Wake up & Tulsi tea", time: "6:30 AM" },
    { id: "rr-2", step: 2, action: "Morning Walk & Medication", time: "8:00 AM" },
  ],
  emergencyContacts: [
    { id: "ec-r1", title: "CALL SON", name: "Siddharth (Son)", phone: "+91 98305 67890" },
    { id: "ec-r2", title: "CALL DOCTOR", name: "Dr. Debashish Bose", phone: "+91 98301 23456" },
  ],
  brainExercise: {
    dailyCompleted: false,
    scheduledTime: "11:00 AM",
    todaysGames: ["memory-basket", "pattern-memory"],
    dayCycle: 2,
  },
  cognitiveStats: {
    currentLevel: 1,
    consecutiveHighScores: 0,
    gamesCompleted: 5,
    averageAccuracy: 67,
    averageResponseSecs: 7.2,
    daysCompletedThisWeek: 3,
    categories: { memory: 65, recall: 66, attention: 70, focus: 68 },
    weeklyTrends: [
      { day: "Mon", accuracy: 72 },
      { day: "Tue", accuracy: 70 },
      { day: "Wed", accuracy: 60 },
    ],
    history: [
      { id: "h-r1", gameId: "memory-basket", gameName: "Memory Basket", cognitiveDomain: "recall", date: "Yesterday, 4:20 PM", accuracy: 60, score: 60, timeTaken: "2m 10s", difficulty: "Level 1", timestamp: Date.now() - 86400000 },
      { id: "h-r2", gameId: "odd-one-out", gameName: "Find the Different Object", cognitiveDomain: "attention", date: "3 days ago", accuracy: 72, score: 72, timeTaken: "1m 55s", difficulty: "Level 1", timestamp: Date.now() - 86400000 * 3 },
      { id: "h-r3", gameId: "pattern-memory", gameName: "Pattern Following", cognitiveDomain: "focus", date: "5 days ago", accuracy: 70, score: 70, timeTaken: "1m 40s", difficulty: "Level 1", timestamp: Date.now() - 86400000 * 5 },
    ]
  },
  alerts: [
    {
      id: "alt-r1",
      type: "warning",
      severity: "WARNING",
      title: "Missed Afternoon Hydration",
      message: "Ramesh has not logged afternoon water intake reminder.",
      time: "Yesterday, 3:30 PM",
      resolved: false,
      recipients: ["caregiver"]
    }
  ]
};

export const demoPatientSunita = {
  profile: {
    fullName: "Sunita Sharma",
    preferredName: "Dida",
    age: 79,
    gender: "Female",
    language: "Bengali",
    avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&auto=format&fit=crop&q=80",
    registered: true,
    patientId: "pat-sunita-5512",
  },
  homeLocation: {
    name: "Residence",
    address: "55 Park Circus, Kolkata",
    city: "Kolkata",
    safeZoneRadius: 300,
    currentDistance: 0.45,
    coordinates: { lat: 22.544, lng: 88.365 },
  },
  importantInfo: [
    { id: "info-dr-s", label: "Physician", value: "Dr. Debashish Bose - +91 98301 23456" }
  ],
  family: [
    { id: "fam-s1", name: "Rohan", relation: "Grandson", phone: "+91 98307 89012", photo: "", notes: "Lives nearby on Syed Amir Ali Avenue" }
  ],
  medicines: [
    { id: "med-s1", name: "Thyroid Medicine", dosage: "1 Tablet", time: "7:00 AM", frequency: "Daily", taken: false, active: true },
    { id: "med-s2", name: "Joint Care Vitamin", dosage: "1 Capsule", time: "1:00 PM", frequency: "Daily", taken: false, active: true },
  ],
  todos: [
    { id: "todo-s1", title: "Morning Thyroid Pill", time: "7:00 AM", recurrence: "Daily", completed: false, isMed: true, active: true },
    { id: "todo-s2", title: "Daily Memory Exercise", time: "10:30 AM", recurrence: "Daily", completed: false, isExercise: true, active: true },
  ],
  memories: [
    { id: "mem-s1", title: "Durga Puja 1985", date: "Autumn 1985", description: "Baghbazar Sarbojanin pandal with family", photo: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80" }
  ],
  routine: [
    { id: "rs-1", step: 1, action: "Morning prayer & warm tea", time: "6:00 AM" },
  ],
  emergencyContacts: [
    { id: "ec-s1", title: "CALL GRANDSON", name: "Rohan (Grandson)", phone: "+91 98307 89012" },
    { id: "ec-s2", title: "CALL DOCTOR", name: "Dr. Debashish Bose", phone: "+91 98301 23456" },
  ],
  brainExercise: {
    dailyCompleted: false,
    scheduledTime: "10:30 AM",
    todaysGames: ["odd-one-out", "picture-memory"],
    dayCycle: 3,
  },
  cognitiveStats: {
    currentLevel: 1,
    consecutiveHighScores: 0,
    gamesCompleted: 4,
    averageAccuracy: 52,
    averageResponseSecs: 9.8,
    daysCompletedThisWeek: 1,
    categories: { memory: 50, recall: 52, attention: 55, focus: 50 },
    weeklyTrends: [],
    history: [
      { id: "h-s1", gameId: "odd-one-out", gameName: "Find the Different Object", cognitiveDomain: "attention", date: "4 days ago", accuracy: 52, score: 52, timeTaken: "3m 15s", difficulty: "Level 1", timestamp: Date.now() - 86400000 * 4 },
      { id: "h-s2", gameId: "memory-twin", gameName: "Memory Match", cognitiveDomain: "memory", date: "6 days ago", accuracy: 48, score: 48, timeTaken: "2m 50s", difficulty: "Level 1", timestamp: Date.now() - 86400000 * 6 },
      { id: "h-s3", gameId: "memory-basket", gameName: "Memory Basket", cognitiveDomain: "recall", date: "7 days ago", accuracy: 55, score: 55, timeTaken: "3m 05s", difficulty: "Level 1", timestamp: Date.now() - 86400000 * 7 },
    ]
  },
  alerts: [
    {
      id: "alt-s1",
      type: "warning",
      severity: "URGENT",
      title: "Safe-Zone Boundary Exit",
      message: "Sunita was recorded outside her designated 300m boundary area.",
      time: "Today, 11:15 AM",
      resolved: false,
      recipients: ["caregiver", "family"]
    }
  ]
};

// Demo Patient 4: Bikram Das (Kaku) - Age 65, Level 2, Stable 🟢
export const demoPatientBikram = {
  profile: {
    fullName: "Bikram Das",
    preferredName: "Kaku",
    age: 65,
    gender: "Male",
    language: "English",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    registered: true,
    patientId: "pat-bikram-8833",
  },
  linkedFamilyMembers: [
    { id: "fam-b1", name: "Aniket Das", relation: "Son", phone: "+91 98305 67890", dateLinked: "August 12, 2026" }
  ],
  linkedCaregivers: [
    { id: "cg-1", name: "Dr. Debashish Bose", title: "Family Care Physician", phone: "+91 98301 23456", dateLinked: "August 12, 2026" }
  ],
  homeLocation: {
    name: "Das Residence",
    address: "88 Salt Lake Sector 1, Kolkata",
    city: "Kolkata",
    safeZoneRadius: 600,
    currentDistance: 0.1,
    coordinates: { lat: 22.586, lng: 88.412 },
  },
  family: [
    { id: "fam-b1", name: "Aniket", relation: "Son", phone: "+91 98305 67890", photo: "", notes: "Visits on weekends with grandchildren" }
  ],
  places: [
    { id: "pl-b1", name: "Home", address: "88 Salt Lake Sector 1, Kolkata", relation: "Residence", description: "Corner house near BD Park." }
  ],
  medicines: [
    { id: "med-b1", name: "Blood Pressure Med", dosage: "1 Tablet", time: "8:00 AM", frequency: "Daily", taken: true, active: true },
    { id: "med-b2", name: "Cholesterol Pill", dosage: "1 Tablet", time: "9:00 PM", frequency: "Daily", taken: false, active: true },
  ],
  todos: [
    { id: "todo-b1", title: "Morning Walk in BD Park", time: "6:30 AM", recurrence: "Daily", completed: true, isRoutine: true, active: true },
    { id: "todo-b2", title: "Blood Pressure Check", time: "8:00 AM", recurrence: "Daily", completed: true, isMed: true, active: true },
    { id: "todo-b3", title: "Daily Brain Exercise", time: "11:00 AM", recurrence: "Daily", completed: true, isExercise: true, active: true },
  ],
  memories: [
    { id: "mem-b1", title: "Trip to Darjeeling 1998", date: "Summer 1998", description: "Toy train ride with Aniket when he was 10.", photo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&auto=format&fit=crop&q=80" }
  ],
  routine: [
    { id: "rb-1", step: 1, action: "Morning stretch & newspaper", time: "6:00 AM" },
    { id: "rb-2", step: 2, action: "Walk in BD Park", time: "6:30 AM" },
  ],
  emergencyContacts: [
    { id: "ec-b1", title: "CALL SON", name: "Aniket Das (Son)", phone: "+91 98305 67890" },
    { id: "ec-b2", title: "CALL DOCTOR", name: "Dr. Debashish Bose", phone: "+91 98301 23456" },
  ],
  brainExercise: {
    dailyCompleted: true,
    scheduledTime: "11:00 AM",
    todaysGames: ["pattern-memory", "daily-routine"],
    dayCycle: 2,
  },
  cognitiveStats: {
    currentLevel: 2,
    consecutiveHighScores: 2,
    gamesCompleted: 8,
    averageAccuracy: 91,
    averageResponseSecs: 4.8,
    daysCompletedThisWeek: 4,
    categories: { memory: 92, recall: 88, attention: 90, focus: 94 },
    weeklyTrends: [],
    history: [
      { id: "h-b1", gameId: "pattern-memory", gameName: "Pattern Following", cognitiveDomain: "focus", date: "Today, 9:30 AM", accuracy: 94, score: 94, timeTaken: "1m 45s", difficulty: "Level 2", timestamp: Date.now() - 3600000 * 3 },
      { id: "h-b2", gameId: "daily-routine", gameName: "Sequence Recall", cognitiveDomain: "recall", date: "Yesterday", accuracy: 88, score: 88, timeTaken: "2m 10s", difficulty: "Level 2", timestamp: Date.now() - 86400000 },
      { id: "h-b3", gameId: "memory-twin", gameName: "Memory Match", cognitiveDomain: "memory", date: "2 days ago", accuracy: 92, score: 92, timeTaken: "1m 20s", difficulty: "Level 2", timestamp: Date.now() - 86400000 * 2 },
      { id: "h-b4", gameId: "odd-one-out", gameName: "Find the Different Object", cognitiveDomain: "attention", date: "3 days ago", accuracy: 90, score: 90, timeTaken: "1m 10s", difficulty: "Level 2", timestamp: Date.now() - 86400000 * 3 },
    ]
  },
  alerts: []
};

// Map of all demo patients by ID (Patient A, B, C, D)
export const demoPatientsById = {
  [defaultPatientData.profile.patientId]: defaultPatientData,
  [demoPatientRamesh.profile.patientId]: demoPatientRamesh,
  [demoPatientSunita.profile.patientId]: demoPatientSunita,
  [demoPatientBikram.profile.patientId]: demoPatientBikram,
};

// Format patient summaries for Caregiver multi-patient dashboard
export function getDemoCaregiverPatients() {
  const patients = [defaultPatientData, demoPatientRamesh, demoPatientSunita, demoPatientBikram];
  return patients.map(p => {
    const history = p.cognitiveStats?.history || [];
    const latest = history[0] || null;
    const unresolvedAlerts = (p.alerts || []).filter(a => !a.resolved);
    const meds = p.medicines || [];

    const score = p.cognitiveStats?.averageAccuracy ?? 0;

    const summary = {
      id: p.profile.patientId,
      patientId: p.profile.patientId,
      fullName: p.profile.fullName,
      preferredName: p.profile.preferredName || p.profile.fullName,
      age: p.profile.age,
      gender: p.profile.gender,
      language: p.profile.language,
      avatar: p.profile.avatar,
      profile: p.profile,
      homeLocation: p.homeLocation,
      cognitiveStats: p.cognitiveStats,
      cognitiveScore: score,
      latestGameName: latest ? latest.gameName : null,
      latestGameAccuracy: latest ? latest.accuracy : null,
      recentActivity: latest ? latest.date : "No recent activity",
      todayGamesCount: history.filter(h => (h.date || "").toLowerCase().includes("today")).length,
      unresolvedAlertsCount: unresolvedAlerts.length,
      medicinesCount: meds.length,
      medicinesTakenCount: meds.filter(m => m.taken).length,
      alerts: p.alerts || [],
      medicines: meds,
      brainExercise: p.brainExercise,
    };

    return summary;
  });
}



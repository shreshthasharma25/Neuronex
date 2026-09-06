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
    { id: "ec-2", title: "CALL DOCTOR", name: "Dr. Debashish Bose", phone: "+91 98301 23456", color: "bg-blue-50 text-blue-700 border-blue-200" },
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
    consecutiveHighScores: 0,
    gamesCompleted: 1,
    averageAccuracy: 85,
    averageResponseSecs: 12,
    daysCompletedThisWeek: 1,
    categories: {
      memory: 85,
      attention: 75,
      recall: 80,
      sequencing: 70,
    },
    weeklyTrends: [
      { day: "Mon", accuracy: 80 },
      { day: "Tue", accuracy: 85 },
    ],
    history: [
      { id: "h-1", gameName: "Family Memory", date: "Today, 10:15 AM", accuracy: 85, time: "1m 40s", difficulty: "Level 1" }
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


// Priority logic for Todo and Medication items

export function calculatePriority(item, patientData) {
  if (item.manualPriority) {
    return item.manualPriority;
  }
  // Medicines
  if (item.type === 'medicine' || item.dosage || item.instructions !== undefined || item.isMed) {
    const text = `${item.name || item.title || ''} ${item.instructions || ''} ${item.notes || ''}`.toLowerCase();
    
    // High Priority Medical Conditions / Keywords
    const highPriorityKeywords = [
      'heart', 'blood pressure', 'bp', 'diabetes', 'insulin', 'sugar', 
      'chest', 'kidney', 'seizure', 'epilepsy', 'asthma', 'cancer', 'chemo',
      'stroke', 'cardiac', 'hypertension', 'urgent', 'critical'
    ];
    
    if (highPriorityKeywords.some(kw => text.includes(kw))) {
      return 'High';
    }
    
    return 'Medium'; // By default, medicines are Medium priority
  }
  
  // To-Dos and other tasks
  const text = `${item.title || ''} ${item.recurrence || ''} ${item.subtitle || ''}`.toLowerCase();
  
  const highPriorityKeywords = [
    'doctor', 'hospital', 'clinic', 'appointment', 'urgent', 'important', 'emergency', 'specialist', 'physician'
  ];
  if (highPriorityKeywords.some(kw => text.includes(kw))) {
    return 'High';
  }
  
  const mediumPriorityKeywords = [
    'eat', 'drink', 'meal', 'lunch', 'dinner', 'breakfast', 'water', 'walk', 'exercise', 'therapy', 'meditate', 'bath', 'shower'
  ];
  if (mediumPriorityKeywords.some(kw => text.includes(kw))) {
    return 'Medium';
  }
  
  return 'Low'; // General tasks like reading, TV, etc.
}

export function sortItemsByPriority(items, patientData) {
  const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return [...items].sort((a, b) => {
    // Keep completed items at the bottom regardless of priority
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    if (a.taken && !b.taken) return 1;
    if (!a.taken && b.taken) return -1;
    
    const prioA = calculatePriority(a, patientData);
    const prioB = calculatePriority(b, patientData);
    
    return weights[prioB] - weights[prioA];
  });
}

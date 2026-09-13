import {
  COGNITIVE_DOMAINS,
  COGNITIVE_TASKS,
  getDomainForTask,
  normalizeSession,
  calculateDomainStats,
  calculateOverallPerformanceIndex,
  getPerformanceTrends,
  getDailyCognitiveResponse,
  generateAICognitiveSummary
} from '../src/utils/cognitiveAnalyticsEngine.js';

console.log('--- Testing Domain & Task Lookup ---');
console.log('Memory Match domain:', getDomainForTask('Memory Match'));
console.log('odd-one-out domain:', getDomainForTask('odd-one-out'));
console.log('pattern-memory domain:', getDomainForTask('pattern-memory'));
console.log('family-memory domain:', getDomainForTask('family-memory'));
console.log('Word Recall domain:', getDomainForTask('Word Recall'));
console.log('Sustained Attention domain:', getDomainForTask('Sustained Attention Task'));

// Check task count
console.log('Total registered tasks:', COGNITIVE_TASKS.length);
if (COGNITIVE_TASKS.length < 8) {
  console.error('FAIL: Less than 8 tasks registered');
  process.exit(1);
}

// Test empty history
console.log('\n--- Testing Empty History ---');
const emptyStats = calculateDomainStats([]);
console.log('Empty stats memory hasData:', emptyStats.memory.hasData);
console.log('Empty stats memory prompt:', emptyStats.memory.prompt);
if (emptyStats.memory.hasData !== false || !emptyStats.memory.prompt.includes('Complete a')) {
  console.error('FAIL: Empty domain stats should have hasData: false and helpful prompt');
  process.exit(1);
}

// Test sample history
console.log('\n--- Testing Sample History ---');
const now = Date.now();
const sampleHistory = [
  { id: '1', gameName: 'Memory Match', cognitiveDomain: 'memory', score: 90, accuracy: 90, timeTaken: '1m 20s', timestamp: now },
  { id: '2', gameName: 'Pattern Following', cognitiveDomain: 'focus', score: 85, accuracy: 85, timeTaken: '1m 40s', timestamp: now - 3600000 },
  { id: '3', gameName: 'Find the Different Object', cognitiveDomain: 'attention', score: 82, accuracy: 82, timeTaken: '1m 15s', timestamp: now - 86400000 },
  { id: '4', gameName: 'Memory Basket', cognitiveDomain: 'recall', score: 88, accuracy: 88, timeTaken: '2m 10s', timestamp: now - 86400000 * 2 }
];

const stats = calculateDomainStats(sampleHistory);
console.log('Memory score:', stats.memory.score, 'sessions:', stats.memory.sessionsCount);
console.log('Recall score:', stats.recall.score, 'sessions:', stats.recall.sessionsCount);
console.log('Attention score:', stats.attention.score, 'sessions:', stats.attention.sessionsCount);
console.log('Focus score:', stats.focus.score, 'sessions:', stats.focus.sessionsCount);

const overall = calculateOverallPerformanceIndex(stats, sampleHistory);
console.log('Overall index:', overall);

const trends = getPerformanceTrends(sampleHistory, 'all');
console.log('Trends points count:', trends.length);

const trendsMemory = getPerformanceTrends(sampleHistory, 'memory');
console.log('Trends memory points count:', trendsMemory.length);

const daily = getDailyCognitiveResponse(sampleHistory, 7);
console.log('Daily response buckets:', daily.length);
console.log('Today completed tasks:', daily[daily.length - 1].tasksCompleted);

const aiSummary = generateAICognitiveSummary(stats, sampleHistory);
console.log('AI Summary:', aiSummary);

console.log('\nALL TESTS PASSED!');

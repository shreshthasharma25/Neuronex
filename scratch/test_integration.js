import { defaultPatientData } from '../src/data/defaultData.js';
import { emptyPatientData } from '../src/data/emptyData.js';
import {
  calculateDomainStats,
  calculateOverallPerformanceIndex,
  getPerformanceTrends,
  getDailyCognitiveResponse,
  generateAICognitiveSummary,
  getDomainForTask,
  COGNITIVE_TASKS
} from '../src/utils/cognitiveAnalyticsEngine.js';

console.log('=== Integration Test: Cognitive Analytics ===\n');

// 1. Check defaultPatientData
const history = defaultPatientData.cognitiveStats.history;
console.log(`1. defaultPatientData history length: ${history.length}`);
if (history.length < 8) {
  console.error('FAIL: defaultPatientData should have at least 8 historical sessions');
  process.exit(1);
}

// 2. Domain stats for default patient
const domainStats = calculateDomainStats(history);
console.log('2. Domain Stats:');
['memory', 'recall', 'attention', 'focus'].forEach(d => {
  const stat = domainStats[d];
  console.log(`   - ${stat.name}: score=${stat.score}%, sessions=${stat.sessionsCount}, activities=[${stat.activitiesMeasured.join(', ')}]`);
  if (!stat.hasData || typeof stat.score !== 'number' || stat.score <= 0) {
    console.error(`FAIL: Domain ${d} has no valid score!`);
    process.exit(1);
  }
});

// 3. Overall Cognitive Performance Index
const overall = calculateOverallPerformanceIndex(domainStats, history);
console.log(`\n3. Overall Cognitive Performance Index: ${overall.score}% (${overall.sessionsAnalyzed} sessions, ${overall.activeDomainsCount}/4 domains active, trajectory: ${overall.trajectory})`);
if (overall.score < 80 || overall.score > 90) {
  console.error(`FAIL: Expected overall score around 85%, got ${overall.score}%`);
  process.exit(1);
}

// 4. Performance Trends Multi-Point Curve
const trendsAll = getPerformanceTrends(history, 'all');
console.log(`\n4. Performance Trends Points (All): ${trendsAll.length} points`);
if (trendsAll.length !== history.length) {
  console.error('FAIL: Trends points count does not match history length');
  process.exit(1);
}
const trendsMemory = getPerformanceTrends(history, 'memory');
console.log(`   Memory trend points: ${trendsMemory.length}`);
const trendsFocus = getPerformanceTrends(history, 'focus');
console.log(`   Focus trend points: ${trendsFocus.length}`);

// 5. Daily Cognitive Response
const daily = getDailyCognitiveResponse(history, 7);
console.log(`\n5. Daily Cognitive Response: ${daily.length} days`);
const daysWithTasks = daily.filter(d => d.tasksCompleted > 0);
console.log(`   Days with completed tasks: ${daysWithTasks.length} of 7`);
daysWithTasks.forEach(d => {
  console.log(`   - ${d.day} (${d.date}): ${d.tasksCompleted} tasks, avg score: ${d.averageScore}%`);
});

// 6. AI Cognitive Summary
const aiSummary = generateAICognitiveSummary(domainStats, history);
console.log(`\n6. AI Cognitive Summary:\n   "${aiSummary}"`);
if (!aiSummary.includes('Memory') && !aiSummary.includes('Focus')) {
  console.error('FAIL: AI Summary does not mention relevant domains');
  process.exit(1);
}

// 7. Empty Patient Data behavior
console.log('\n7. Testing Empty Patient Data:');
const emptyStats = calculateDomainStats(emptyPatientData.cognitiveStats.history);
['memory', 'recall', 'attention', 'focus'].forEach(d => {
  const stat = emptyStats[d];
  console.log(`   - ${stat.name}: hasData=${stat.hasData}, score=${stat.score}, prompt="${stat.prompt}"`);
  if (stat.hasData !== false || stat.score !== null || !stat.prompt.includes('Complete a')) {
    console.error(`FAIL: Empty domain ${d} did not return proper microcopy prompt or hasData: false`);
    process.exit(1);
  }
});

// 8. 16 Tasks recognized across 4 domains
console.log(`\n8. Testing Task Registry: ${COGNITIVE_TASKS.length} tasks registered`);
const domainCounts = {};
COGNITIVE_TASKS.forEach(t => {
  domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
});
console.log('   Tasks per domain:', domainCounts);
['memory', 'recall', 'attention', 'focus'].forEach(d => {
  if (!domainCounts[d] || domainCounts[d] < 3) {
    console.error(`FAIL: Domain ${d} has fewer than 3 tasks registered`);
    process.exit(1);
  }
});

console.log('\n>>> ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY! <<<');

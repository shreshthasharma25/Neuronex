import {
  classifyCognitiveStatus,
  calculatePatientStatus,
  calculateDashboardSummary,
  getPatientCognitiveScore,
} from '../src/utils/patientStatusEngine.js';

console.log('--- Testing classifyCognitiveStatus ---');

const testCases = [
  { score: 85, expected: 'Stable' },
  { score: 67, expected: 'Needs Attention' },
  { score: 52, expected: 'Higher Attention' },
  { score: 37, expected: 'Higher Attention' },
  { score: 100, expected: 'Stable' },
  { score: 81, expected: 'Stable' },
  { score: 80, expected: 'Needs Attention' },
  { score: 60, expected: 'Needs Attention' },
  { score: 59, expected: 'Higher Attention' },
  { score: 0, expected: 'Higher Attention' },
];

let failed = 0;

testCases.forEach(({ score, expected }) => {
  const result = classifyCognitiveStatus(score);
  const statusObj = calculatePatientStatus({ cognitiveScore: score });
  const passed = result === expected && statusObj.label === expected;
  if (!passed) {
    console.error(`FAIL: Score ${score} expected "${expected}", got classify="${result}", label="${statusObj.label}"`);
    failed++;
  } else {
    console.log(`PASS: Score ${score}% -> "${result}" (level: ${statusObj.level}, dot: ${statusObj.icon})`);
  }
});

console.log('\n--- Testing calculateDashboardSummary ---');
const samplePatients = [
  { id: 'p1', cognitiveScore: 85 }, // Stable
  { id: 'p2', cognitiveScore: 67 }, // Needs Attention
  { id: 'p3', cognitiveScore: 52 }, // Higher Attention
  { id: 'p4', cognitiveScore: 37 }, // Higher Attention
  { id: 'p5', cognitiveScore: 91 }, // Stable
];

const summary = calculateDashboardSummary(samplePatients);
console.log('Summary result:', summary);

if (summary.totalPatients !== 5) {
  console.error(`FAIL: totalPatients expected 5, got ${summary.totalPatients}`);
  failed++;
}
if (summary.stableCount !== 2) {
  console.error(`FAIL: stableCount expected 2, got ${summary.stableCount}`);
  failed++;
}
if (summary.needsAttentionCount !== 1) {
  console.error(`FAIL: needsAttentionCount expected 1, got ${summary.needsAttentionCount}`);
  failed++;
}
if (summary.higherAttentionCount !== 2) {
  console.error(`FAIL: higherAttentionCount expected 2, got ${summary.higherAttentionCount}`);
  failed++;
}

if (failed === 0) {
  console.log('\nALL STATUS ENGINE TESTS PASSED CLEANLY! ✅');
  process.exit(0);
} else {
  console.error(`\n${failed} TESTS FAILED! ❌`);
  process.exit(1);
}

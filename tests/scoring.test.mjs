import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load static dataset
const personasData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/personas.json'), 'utf-8')
);

// Helper scoring implementation for ESM test runner
import {
  calculateRiskAssessment,
  calculateExpenseFactor,
  calculateDebtFactor,
  calculateCreditRepaymentFactor,
  calculateSavingsBufferFactor,
  calculateDiscretionaryFactor,
  getRiskCategory,
} from '../lib/scoring.ts';

describe('Financial Early-Warning Scoring Engine', () => {
  const personas = personasData.personas;
  const stablePersona = personas.find(p => p.id === 'stable');
  const slowDeclinePersona = personas.find(p => p.id === 'slow-decline');
  const distressPersona = personas.find(p => p.id === 'distress');
  const recoveringPersona = personas.find(p => p.id === 'recovering');

  test('Persona 1 (Stable Saver) should produce a LOW risk score (< 30)', () => {
    assert.ok(stablePersona, 'Stable persona exists');
    const assessment = calculateRiskAssessment(stablePersona.snapshots);

    assert.ok(assessment.currentScore >= 0 && assessment.currentScore <= 30, `Expected low score, got ${assessment.currentScore}`);
    assert.equal(assessment.riskCategory, 'LOW');
    assert.equal(assessment.isEarlyWarningTriggered, false);
    assert.equal(assessment.keyMetrics.creditCardPaymentHealth, 100);
  });

  test('Persona 2 (Slow Decliner) MUST demonstrate early-warning trajectory (Score rises significantly before default)', () => {
    assert.ok(slowDeclinePersona, 'Slow decline persona exists');
    const assessment = calculateRiskAssessment(slowDeclinePersona.snapshots);

    const firstScore = assessment.monthlyScores[0].score;
    const finalScore = assessment.currentScore;

    // Month 1 should start relatively healthy (low/moderate)
    assert.ok(firstScore < 45, `Month 1 score should be manageable, got ${firstScore}`);
    
    // Month 6 score should be high/critical
    assert.ok(finalScore >= 60, `Month 6 score should show high risk, got ${finalScore}`);
    
    // The delta must show significant deterioration (+20 or more)
    assert.ok(assessment.deltaFromFirstMonth >= 25, `Expected score climb >= 25, got +${assessment.deltaFromFirstMonth}`);
    
    // Early warning flag MUST be active
    assert.equal(assessment.isEarlyWarningTriggered, true);
    assert.ok(assessment.earlyWarningHeadline, 'Should have an early warning headline');

    // Credit card payment health should have dropped significantly
    assert.ok(assessment.keyMetrics.creditCardPaymentHealth < 30, 'Credit card payment health should reflect min-due trap');
  });

  test('Persona 3 (Already in Distress) should produce CRITICAL risk score (> 75)', () => {
    assert.ok(distressPersona, 'Distress persona exists');
    const assessment = calculateRiskAssessment(distressPersona.snapshots);

    assert.ok(assessment.currentScore >= 75, `Expected critical score, got ${assessment.currentScore}`);
    assert.equal(assessment.riskCategory, 'CRITICAL');
    assert.equal(assessment.isEarlyWarningTriggered, true);
    assert.ok(assessment.keyMetrics.savingsBalance < 0, 'Savings should be negative');
  });

  test('Persona 4 (Recovering) should show improving trend and dropping risk score', () => {
    assert.ok(recoveringPersona, 'Recovering persona exists');
    const assessment = calculateRiskAssessment(recoveringPersona.snapshots);

    const firstScore = assessment.monthlyScores[0].score;
    const finalScore = assessment.currentScore;

    assert.ok(finalScore < firstScore, `Score should drop from ${firstScore} to lower, got ${finalScore}`);
    assert.ok(assessment.deltaFromFirstMonth < -20, `Expected score drop > 20 pts, got ${assessment.deltaFromFirstMonth}`);
    assert.equal(assessment.scoreTrend, 'improving');
  });

  test('Explainability: Top contributing factors are ranked by weighted impact', () => {
    const assessment = calculateRiskAssessment(slowDeclinePersona.snapshots);
    const topFactors = assessment.topContributingFactors;

    assert.ok(topFactors.length >= 3, 'Must have at least 3 contributing factors');
    for (let i = 0; i < topFactors.length - 1; i++) {
      assert.ok(
        topFactors[i].weightedImpact >= topFactors[i + 1].weightedImpact,
        'Factors should be ordered descending by weighted impact'
      );
    }
  });

  test('Score function is pure and deterministic (multiple runs give identical results)', () => {
    const run1 = calculateRiskAssessment(slowDeclinePersona.snapshots);
    const run2 = calculateRiskAssessment(slowDeclinePersona.snapshots);

    assert.deepEqual(run1, run2, 'Scoring engine must be 100% pure and deterministic');
  });
});

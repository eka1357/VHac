import { MonthlySnapshot, ContributingFactor, PersonaRiskAssessment, RiskCategory, MonthlyRiskScore, KeyMetrics } from "./types";

/**
 * ============================================================================
 * Financial Distress Early-Warning Scoring Engine (Pure Function)
 * ============================================================================
 * 
 * Hackathon Design Philosophy:
 * - Detect financial deterioration BEFORE an individual misses an EMI or credit payment.
 * - Traditional credit bureaus only react AFTER defaults/delinquencies happen.
 * - This engine inspects multi-month velocity:
 *   1. Expense-to-Income Velocity (25%) -> Is cost of living outrunning income?
 *   2. Debt Burden Ratio (25%) -> Are fixed debt commitments taking over cashflow?
 *   3. Credit Card Minimum Due Trap (25%) -> Are they revolving balances and accumulating 40%+ APR debt?
 *   4. Emergency Savings Buffer Runway (15%) -> How many months of essential expenses remain?
 *   5. Discretionary Expense Creep (10%) -> Is lifestyle inflation compounding the strain?
 * 
 * Score Scale:
 *   0  - 29: Low Risk (Resilient financial health)
 *   30 - 54: Moderate Risk (Stable currently, but watch metrics)
 *   55 - 74: High Risk (Early Warning Triggered: rapid deterioration detected)
 *   75 - 100: Critical Risk (Imminent distress or active insolvency)
 */

export const FACTOR_WEIGHTS = {
  EXPENSE_TO_INCOME: 0.25,
  DEBT_BURDEN: 0.25,
  CREDIT_CARD_REPAYMENT: 0.25,
  SAVINGS_BUFFER: 0.15,
  DISCRETIONARY_CREEP: 0.10,
};

/**
 * Helper: Clamp value between min and max
 */
function clamp(val: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Helper: Determine Risk Category from numerical score
 */
export function getRiskCategory(score: number): RiskCategory {
  if (score < 30) return "LOW";
  if (score < 55) return "MODERATE";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

/**
 * 1. Calculate Expense-to-Income Factor (0-100)
 * Evaluates current expense ratio + multi-month acceleration slope.
 */
export function calculateExpenseFactor(snapshots: MonthlySnapshot[]): {
  subscore: number;
  explanation: string;
  metricValue: string;
  trend: "improving" | "stable" | "deteriorating";
} {
  if (!snapshots || snapshots.length === 0) {
    return { subscore: 0, explanation: "No expense data available", metricValue: "0%", trend: "stable" };
  }

  const latest = snapshots[snapshots.length - 1];
  const totalExpenses = latest.essential_expenses + latest.discretionary_expenses;
  const currentRatio = latest.income > 0 ? totalExpenses / latest.income : 1.0;

  // Base score from current ratio
  // < 50% ratio -> ~10 pts | 70% ratio -> ~40 pts | 90% ratio -> ~80 pts | > 100% -> 100 pts
  let baseScore = 0;
  if (currentRatio <= 0.50) {
    baseScore = (currentRatio / 0.50) * 15;
  } else if (currentRatio <= 0.75) {
    baseScore = 15 + ((currentRatio - 0.50) / 0.25) * 35; // 15 to 50
  } else if (currentRatio <= 0.95) {
    baseScore = 50 + ((currentRatio - 0.75) / 0.20) * 35; // 50 to 85
  } else {
    baseScore = 85 + Math.min(15, (currentRatio - 0.95) * 150); // 85 to 100
  }

  // Multi-month velocity modifier (look at earliest vs latest)
  let trend: "improving" | "stable" | "deteriorating" = "stable";
  let velocityModifier = 0;
  if (snapshots.length >= 2) {
    const earliest = snapshots[0];
    const initialRatio = (earliest.essential_expenses + earliest.discretionary_expenses) / (earliest.income || 1);
    const ratioDelta = currentRatio - initialRatio;

    if (ratioDelta > 0.05) {
      trend = "deteriorating";
      velocityModifier = Math.min(20, ratioDelta * 100); // add up to +20 penalty for rapid creep
    } else if (ratioDelta < -0.05) {
      trend = "improving";
      velocityModifier = Math.max(-20, ratioDelta * 100); // relief for expense reduction
    }
  }

  const subscore = clamp(baseScore + velocityModifier);
  const ratioPct = Math.round(currentRatio * 100);

  let explanation = "";
  if (currentRatio > 0.90) {
    explanation = `Living expenses consume ${ratioPct}% of income, leaving virtually zero buffer for unexpected shocks.`;
  } else if (trend === "deteriorating") {
    explanation = `Expenses have crept up to ${ratioPct}% of income (up from earlier months), squeezing free cashflow.`;
  } else if (currentRatio < 0.60) {
    explanation = `Healthy expense ratio of ${ratioPct}%, providing ample operational cushion.`;
  } else {
    explanation = `Expenses account for ${ratioPct}% of monthly income.`;
  }

  return { subscore, explanation, metricValue: `${ratioPct}% of income`, trend };
}

/**
 * 2. Calculate Debt Burden Factor (0-100)
 * Evaluates fixed EMIs and credit card obligations as a % of monthly income.
 */
export function calculateDebtFactor(snapshots: MonthlySnapshot[]): {
  subscore: number;
  explanation: string;
  metricValue: string;
  trend: "improving" | "stable" | "deteriorating";
} {
  const latest = snapshots[snapshots.length - 1];
  const totalDebtObligation = latest.emi_amount + latest.credit_card_full_due;
  const debtRatio = latest.income > 0 ? totalDebtObligation / latest.income : 1.0;

  // Safe benchmark: DTI < 20% healthy, 20-35% moderate, 35-50% heavy, > 50% critical
  let baseScore = 0;
  if (debtRatio <= 0.15) {
    baseScore = (debtRatio / 0.15) * 15;
  } else if (debtRatio <= 0.35) {
    baseScore = 15 + ((debtRatio - 0.15) / 0.20) * 35; // 15 to 50
  } else if (debtRatio <= 0.55) {
    baseScore = 50 + ((debtRatio - 0.35) / 0.20) * 35; // 50 to 85
  } else {
    baseScore = 85 + Math.min(15, (debtRatio - 0.55) * 100); // 85 to 100
  }

  let trend: "improving" | "stable" | "deteriorating" = "stable";
  let velocityModifier = 0;
  if (snapshots.length >= 2) {
    const earliest = snapshots[0];
    const initialDebtRatio = (earliest.emi_amount + earliest.credit_card_full_due) / (earliest.income || 1);
    const debtDelta = debtRatio - initialDebtRatio;

    if (debtDelta > 0.05) {
      trend = "deteriorating";
      velocityModifier = Math.min(15, debtDelta * 80);
    } else if (debtDelta < -0.05) {
      trend = "improving";
      velocityModifier = Math.max(-15, debtDelta * 80);
    }
  }

  const subscore = clamp(baseScore + velocityModifier);
  const debtPct = Math.round(debtRatio * 100);

  let explanation = "";
  if (debtRatio > 0.45) {
    explanation = `High debt burden (${debtPct}% of income committed to EMIs and credit dues), severely limiting flexibility.`;
  } else if (trend === "deteriorating") {
    explanation = `Total debt obligation has expanded to ${debtPct}% of income, increasing financial vulnerability.`;
  } else if (debtRatio < 0.20) {
    explanation = `Conservative debt commitments (${debtPct}% of income), well within safe risk bounds.`;
  } else {
    explanation = `Debt commitments represent ${debtPct}% of monthly earnings.`;
  }

  return { subscore, explanation, metricValue: `${debtPct}% DTI ratio`, trend };
}

/**
 * 3. Calculate Credit Card Minimum Due Trap Factor (0-100)
 * Evaluates whether user is paying credit card balances in full vs only minimum due.
 * Revolving credit card balances at 36-48% APR is the #1 leading indicator of distress.
 */
export function calculateCreditRepaymentFactor(snapshots: MonthlySnapshot[]): {
  subscore: number;
  explanation: string;
  metricValue: string;
  trend: "improving" | "stable" | "deteriorating";
} {
  const latest = snapshots[snapshots.length - 1];
  const fullDue = latest.credit_card_full_due;
  const paid = latest.credit_card_amount_paid;

  if (fullDue <= 0) {
    return {
      subscore: 0,
      explanation: "Zero outstanding credit card balance.",
      metricValue: "100% paid (0 balance)",
      trend: "stable",
    };
  }

  const paymentRatio = clamp(paid / fullDue, 0, 1.0);
  let baseScore = 0;

  if (paymentRatio >= 0.98) {
    baseScore = 5; // Paid in full
  } else if (paymentRatio >= 0.70) {
    baseScore = 25 + (1 - paymentRatio) * 60; // Partial payment (25-43 pts)
  } else if (paymentRatio >= 0.30) {
    baseScore = 50 + (0.70 - paymentRatio) * 75; // Heavy revolving (50-80 pts)
  } else {
    baseScore = 85 + (0.30 - paymentRatio) * 50; // Minimum-due trap (85-100 pts)
  }

  // Trend detection over past snapshots
  let trend: "improving" | "stable" | "deteriorating" = "stable";
  let velocityPenalty = 0;
  if (snapshots.length >= 2) {
    const earliest = snapshots[0];
    const initialPayRatio = earliest.credit_card_full_due > 0 
      ? clamp(earliest.credit_card_amount_paid / earliest.credit_card_full_due, 0, 1.0)
      : 1.0;

    const diff = paymentRatio - initialPayRatio;
    if (diff < -0.20) {
      trend = "deteriorating";
      velocityPenalty = 15; // Shifted from full payments to minimum due
    } else if (diff > 0.20) {
      trend = "improving";
      velocityPenalty = -15; // Proactively clearing revolving balance
    }
  }

  const subscore = clamp(baseScore + velocityPenalty);
  const payPct = Math.round(paymentRatio * 100);

  let explanation = "";
  if (paymentRatio < 0.25) {
    explanation = `High risk minimum-due trap: Only paying ${payPct}% of card dues, accumulating compounding high-interest penalties.`;
  } else if (trend === "deteriorating") {
    explanation = `Payment compliance dropped from full clearance to ${payPct}%, signaling emerging cashflow tightness.`;
  } else if (paymentRatio >= 0.98) {
    explanation = `Settles 100% of credit card balance each cycle, incurring zero revolving interest.`;
  } else {
    explanation = `Paying ${payPct}% of total monthly credit balance.`;
  }

  return { subscore, explanation, metricValue: `${payPct}% bill paid`, trend };
}

/**
 * 4. Calculate Emergency Savings Buffer Factor (0-100)
 * Evaluates months of runway remaining (savings_balance / essential_expenses).
 */
export function calculateSavingsBufferFactor(snapshots: MonthlySnapshot[]): {
  subscore: number;
  explanation: string;
  metricValue: string;
  trend: "improving" | "stable" | "deteriorating";
} {
  const latest = snapshots[snapshots.length - 1];
  const essential = latest.essential_expenses || 1;
  const balance = latest.savings_balance;
  const runwayMonths = balance / essential;

  let baseScore = 0;
  if (runwayMonths >= 6.0) {
    baseScore = 0; // Ideal 6+ months buffer
  } else if (runwayMonths >= 3.0) {
    baseScore = ((6.0 - runwayMonths) / 3.0) * 30; // 0 to 30 pts
  } else if (runwayMonths >= 1.0) {
    baseScore = 30 + ((3.0 - runwayMonths) / 2.0) * 35; // 30 to 65 pts
  } else if (runwayMonths >= 0) {
    baseScore = 65 + (1.0 - runwayMonths) * 25; // 65 to 90 pts
  } else {
    // Negative balance (overdraft / informal loans)
    baseScore = 90 + Math.min(10, Math.abs(balance) / 5000 * 5); // 90 to 100 pts
  }

  // Velocity penalty: is savings depleting?
  let trend: "improving" | "stable" | "deteriorating" = "stable";
  let velocityModifier = 0;
  if (snapshots.length >= 2) {
    const earliest = snapshots[0];
    const initialRunway = earliest.savings_balance / (earliest.essential_expenses || 1);
    const runwayDelta = runwayMonths - initialRunway;

    if (runwayDelta < -1.0) {
      trend = "deteriorating";
      velocityModifier = Math.min(15, Math.abs(runwayDelta) * 5);
    } else if (runwayDelta > 1.0) {
      trend = "improving";
      velocityModifier = Math.max(-15, -runwayDelta * 5);
    }
  }

  const subscore = clamp(baseScore + velocityModifier);
  const runwayFormatted = runwayMonths >= 0 ? `${runwayMonths.toFixed(1)} mo runway` : `Deficit (₹${Math.abs(balance).toLocaleString()})`;

  let explanation = "";
  if (balance < 0) {
    explanation = `Negative liquidity reserve: relying on overdraft or informal debt to cover recurring essentials.`;
  } else if (runwayMonths < 1.5 && trend === "deteriorating") {
    explanation = `Emergency buffer has depleted down to ${runwayMonths.toFixed(1)} months of essentials, leaving no room for emergencies.`;
  } else if (runwayMonths >= 4.5) {
    explanation = `Robust emergency reserve of ${runwayMonths.toFixed(1)} months provides strong downside insulation.`;
  } else {
    explanation = `Current savings provide ${runwayMonths.toFixed(1)} months of emergency expense coverage.`;
  }

  return { subscore, explanation, metricValue: runwayFormatted, trend };
}

/**
 * 5. Calculate Discretionary Spend Creep Factor (0-100)
 * Detects lifestyle inflation outstripping earnings.
 */
export function calculateDiscretionaryFactor(snapshots: MonthlySnapshot[]): {
  subscore: number;
  explanation: string;
  metricValue: string;
  trend: "improving" | "stable" | "deteriorating";
} {
  const latest = snapshots[snapshots.length - 1];
  const discPctOfIncome = latest.income > 0 ? latest.discretionary_expenses / latest.income : 0;

  let baseScore = 0;
  if (discPctOfIncome <= 0.15) {
    baseScore = (discPctOfIncome / 0.15) * 20;
  } else if (discPctOfIncome <= 0.28) {
    baseScore = 20 + ((discPctOfIncome - 0.15) / 0.13) * 40;
  } else {
    baseScore = 60 + Math.min(40, (discPctOfIncome - 0.28) * 200);
  }

  let trend: "improving" | "stable" | "deteriorating" = "stable";
  let velocityModifier = 0;
  if (snapshots.length >= 2) {
    const earliest = snapshots[0];
    const initialDisc = earliest.discretionary_expenses;
    const currentDisc = latest.discretionary_expenses;
    const growth = initialDisc > 0 ? (currentDisc - initialDisc) / initialDisc : 0;

    if (growth > 0.25) {
      trend = "deteriorating";
      velocityModifier = Math.min(25, growth * 40);
    } else if (growth < -0.15) {
      trend = "improving";
      velocityModifier = -15;
    }
  }

  const subscore = clamp(baseScore + velocityModifier);
  const discPct = Math.round(discPctOfIncome * 100);

  let explanation = "";
  if (trend === "deteriorating") {
    explanation = `Discretionary spend has expanded aggressively, absorbing cashflow that should go to savings or debt paydown.`;
  } else if (discPct > 30) {
    explanation = `Non-essential lifestyle spending takes up ${discPct}% of income.`;
  } else {
    explanation = `Discretionary spending is well-controlled at ${discPct}% of monthly income.`;
  }

  return { subscore, explanation, metricValue: `${discPct}% of income`, trend };
}

/**
 * ============================================================================
 * Primary Master Risk Scoring Function
 * Evaluates the full history and calculates current score, trends, and explainability.
 * ============================================================================
 */
export function calculateRiskAssessment(snapshots: MonthlySnapshot[]): PersonaRiskAssessment {
  if (!snapshots || snapshots.length === 0) {
    throw new Error("Cannot assess risk with empty financial history.");
  }

  // 1. Calculate monthly scores progression across all available snapshots
  const monthlyScores: MonthlyRiskScore[] = snapshots.map((s, idx) => {
    // Slices history up to that month for accurate point-in-time calculation
    const historySlice = snapshots.slice(0, idx + 1);
    
    const exp = calculateExpenseFactor(historySlice);
    const debt = calculateDebtFactor(historySlice);
    const cc = calculateCreditRepaymentFactor(historySlice);
    const sav = calculateSavingsBufferFactor(historySlice);
    const disc = calculateDiscretionaryFactor(historySlice);

    const monthScore = Math.round(
      exp.subscore * FACTOR_WEIGHTS.EXPENSE_TO_INCOME +
      debt.subscore * FACTOR_WEIGHTS.DEBT_BURDEN +
      cc.subscore * FACTOR_WEIGHTS.CREDIT_CARD_REPAYMENT +
      sav.subscore * FACTOR_WEIGHTS.SAVINGS_BUFFER +
      disc.subscore * FACTOR_WEIGHTS.DISCRETIONARY_CREEP
    );

    const clampedMonthScore = clamp(monthScore, 0, 100);
    const totalExp = s.essential_expenses + s.discretionary_expenses;

    return {
      month: s.month,
      score: clampedMonthScore,
      riskCategory: getRiskCategory(clampedMonthScore),
      expenseRatio: s.income > 0 ? parseFloat(((totalExp + s.emi_amount) / s.income).toFixed(2)) : 1.0,
      debtRatio: s.income > 0 ? parseFloat(((s.emi_amount + s.credit_card_full_due) / s.income).toFixed(2)) : 1.0,
      savingsBalance: s.savings_balance,
      minDueRatio: s.credit_card_full_due > 0 ? parseFloat((s.credit_card_amount_paid / s.credit_card_full_due).toFixed(2)) : 1.0,
    };
  });

  const currentScore = monthlyScores[monthlyScores.length - 1].score;
  const riskCategory = getRiskCategory(currentScore);

  // 2. Individual factor evaluation for the latest state
  const expRes = calculateExpenseFactor(snapshots);
  const debtRes = calculateDebtFactor(snapshots);
  const ccRes = calculateCreditRepaymentFactor(snapshots);
  const savRes = calculateSavingsBufferFactor(snapshots);
  const discRes = calculateDiscretionaryFactor(snapshots);

  const factorList: ContributingFactor[] = [
    {
      id: "credit_card_repayment",
      name: "Credit Card Repayment Health",
      impactScore: Math.round(ccRes.subscore),
      weightedImpact: Math.round(ccRes.subscore * FACTOR_WEIGHTS.CREDIT_CARD_REPAYMENT),
      weightPercent: 25,
      severity: getRiskCategory(ccRes.subscore).toLowerCase() as any,
      title: "Revolving Debt & Min-Due Pattern",
      explanation: ccRes.explanation,
      metricValue: ccRes.metricValue,
      trendDirection: ccRes.trend,
    },
    {
      id: "expense_to_income",
      name: "Expense-to-Income Velocity",
      impactScore: Math.round(expRes.subscore),
      weightedImpact: Math.round(expRes.subscore * FACTOR_WEIGHTS.EXPENSE_TO_INCOME),
      weightPercent: 25,
      severity: getRiskCategory(expRes.subscore).toLowerCase() as any,
      title: "Cost of Living vs Earnings",
      explanation: expRes.explanation,
      metricValue: expRes.metricValue,
      trendDirection: expRes.trend,
    },
    {
      id: "debt_burden",
      name: "Fixed Debt Service Ratio",
      impactScore: Math.round(debtRes.subscore),
      weightedImpact: Math.round(debtRes.subscore * FACTOR_WEIGHTS.DEBT_BURDEN),
      weightPercent: 25,
      severity: getRiskCategory(debtRes.subscore).toLowerCase() as any,
      title: "EMI & Fixed Debt Load",
      explanation: debtRes.explanation,
      metricValue: debtRes.metricValue,
      trendDirection: debtRes.trend,
    },
    {
      id: "savings_buffer",
      name: "Emergency Runway & Depletion",
      impactScore: Math.round(savRes.subscore),
      weightedImpact: Math.round(savRes.subscore * FACTOR_WEIGHTS.SAVINGS_BUFFER),
      weightPercent: 15,
      severity: getRiskCategory(savRes.subscore).toLowerCase() as any,
      title: "Emergency Cash Buffer",
      explanation: savRes.explanation,
      metricValue: savRes.metricValue,
      trendDirection: savRes.trend,
    },
    {
      id: "discretionary_creep",
      name: "Lifestyle & Discretionary Creep",
      impactScore: Math.round(discRes.subscore),
      weightedImpact: Math.round(discRes.subscore * FACTOR_WEIGHTS.DISCRETIONARY_CREEP),
      weightPercent: 10,
      severity: getRiskCategory(discRes.subscore).toLowerCase() as any,
      title: "Discretionary Spending Trend",
      explanation: discRes.explanation,
      metricValue: discRes.metricValue,
      trendDirection: discRes.trend,
    },
  ];

  // Sort factors by weighted contribution descending
  const topContributingFactors = [...factorList].sort((a, b) => b.weightedImpact - a.weightedImpact);

  // 3. Trends and Delta
  const firstScore = monthlyScores[0].score;
  const prevScore = monthlyScores.length > 1 ? monthlyScores[monthlyScores.length - 2].score : firstScore;
  const deltaFromFirstMonth = currentScore - firstScore;
  const deltaFromPrevMonth = currentScore - prevScore;

  let scoreTrend: "rapidly_rising" | "rising" | "stable" | "improving" = "stable";
  if (deltaFromFirstMonth >= 25) {
    scoreTrend = "rapidly_rising";
  } else if (deltaFromFirstMonth > 5) {
    scoreTrend = "rising";
  } else if (deltaFromFirstMonth <= -5) {
    scoreTrend = "improving";
  }

  // 4. Early-Warning Trigger logic (Core of the Hackathon Pitch)
  // Triggered when current score is High/Critical OR has climbed >= 20 points over the 6 months
  const isEarlyWarningTriggered = currentScore >= 55 || deltaFromFirstMonth >= 20;
  let earlyWarningHeadline: string | undefined;

  if (isEarlyWarningTriggered) {
    if (deltaFromFirstMonth >= 20 && currentScore < 80) {
      earlyWarningHeadline = `Early Deterioration Detected: Financial distress score surged +${deltaFromFirstMonth} pts over 6 months before any missed loan payments.`;
    } else if (currentScore >= 75) {
      earlyWarningHeadline = "Critical Cashflow Stress: Debt commitments and negative liquidity require immediate intervention.";
    } else {
      earlyWarningHeadline = "Moderate Risk Escalation: Expense expansion is eroding your savings cushion.";
    }
  }

  // 5. Baseline Rule-Based Recommendations (Guaranteed Fallback)
  const baselineRecommendations: string[] = [];
  if (ccRes.subscore > 50) {
    baselineRecommendations.push("Halt revolving card balance immediately — transition to a fixed-rate personal loan consolidation or prioritize full balance clearance to stop 40%+ compounding interest.");
  }
  if (discRes.subscore > 40 || expRes.subscore > 60) {
    baselineRecommendations.push("Implement a 30-day discretionary spend pause to redirect ₹5,000–₹8,000/month back towards emergency cash reserves.");
  }
  if (savRes.subscore > 50) {
    baselineRecommendations.push("Rebuild liquid emergency buffer to at least 3 months of essential expenses before taking on any new EMIs or large purchases.");
  }
  if (baselineRecommendations.length === 0) {
    baselineRecommendations.push("Maintain current savings discipline and consider auto-allocating surplus cashflow into high-yield deposits.");
    baselineRecommendations.push("Perform quarterly expense reviews to prevent subtle lifestyle creep.");
  }

  // 6. Current Key Metrics
  const latestSnapshot = snapshots[snapshots.length - 1];
  const keyMetrics: KeyMetrics = {
    currentIncome: latestSnapshot.income,
    currentExpenses: latestSnapshot.essential_expenses + latestSnapshot.discretionary_expenses,
    currentDebtObligations: latestSnapshot.emi_amount + latestSnapshot.credit_card_full_due,
    savingsBufferMonths: parseFloat((latestSnapshot.savings_balance / (latestSnapshot.essential_expenses || 1)).toFixed(1)),
    savingsBalance: latestSnapshot.savings_balance,
    netCashflow: latestSnapshot.income - (latestSnapshot.essential_expenses + latestSnapshot.discretionary_expenses + latestSnapshot.emi_amount + latestSnapshot.credit_card_amount_paid),
    creditCardPaymentHealth: latestSnapshot.credit_card_full_due > 0 
      ? Math.round((latestSnapshot.credit_card_amount_paid / latestSnapshot.credit_card_full_due) * 100)
      : 100,
  };

  return {
    currentScore,
    riskCategory,
    scoreTrend,
    monthlyScores,
    deltaFromFirstMonth,
    deltaFromPrevMonth,
    topContributingFactors,
    allFactors: factorList,
    keyMetrics,
    isEarlyWarningTriggered,
    earlyWarningHeadline,
    baselineRecommendations: baselineRecommendations.slice(0, 3),
  };
}

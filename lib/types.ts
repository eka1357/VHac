export interface MonthlySnapshot {
  month: string;
  income: number;
  essential_expenses: number;
  discretionary_expenses: number;
  emi_amount: number;
  credit_card_full_due: number;
  credit_card_min_due: number;
  credit_card_amount_paid: number;
  savings_balance: number;
  
  // Enriched/Derived properties (optional in raw, computed if missing)
  total_expenses?: number;
  total_debt_paid?: number;
  net_cashflow?: number;
  expense_to_income_ratio?: number;
  debt_service_ratio?: number;
  min_due_payment_ratio?: number;
  savings_rate?: number;
  runway_months?: number;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  persona_type: "healthy" | "early_warning" | "critical" | "improving";
  description: string;
  story: string;
  currency: string;
  currency_symbol: string;
  snapshots: MonthlySnapshot[];
}

export type RiskCategory = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface ContributingFactor {
  id: string;
  name: string;
  impactScore: number; // 0-100 subscore
  weightedImpact: number; // contribution to total 0-100 score
  weightPercent: number; // e.g., 25%
  severity: "low" | "moderate" | "high" | "critical";
  title: string;
  explanation: string;
  metricValue: string;
  trendDirection: "improving" | "stable" | "deteriorating";
}

export interface MonthlyRiskScore {
  month: string;
  score: number;
  riskCategory: RiskCategory;
  expenseRatio: number;
  debtRatio: number;
  savingsBalance: number;
  minDueRatio: number;
}

export interface KeyMetrics {
  currentIncome: number;
  currentExpenses: number;
  currentDebtObligations: number;
  savingsBufferMonths: number;
  savingsBalance: number;
  netCashflow: number;
  creditCardPaymentHealth: number; // percentage (0-100)
}

export interface PersonaRiskAssessment {
  currentScore: number; // 0-100 (0 = lowest risk / prime health, 100 = critical distress)
  riskCategory: RiskCategory;
  scoreTrend: "rapidly_rising" | "rising" | "stable" | "improving";
  monthlyScores: MonthlyRiskScore[];
  deltaFromFirstMonth: number;
  deltaFromPrevMonth: number;
  topContributingFactors: ContributingFactor[];
  allFactors: ContributingFactor[];
  keyMetrics: KeyMetrics;
  isEarlyWarningTriggered: boolean;
  earlyWarningHeadline?: string;
  baselineRecommendations: string[];
}

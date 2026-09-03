import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Synthetic Financial Dataset Generator
 * Produces 6-month financial snapshots for 4 distinct personas
 * adhering to the hackathon guidelines in AGENTS.md.
 */

export const PERSONAS = [
  {
    id: "stable",
    name: "Stable Saver",
    tagline: "Financially Resilient & Disciplined",
    persona_type: "healthy",
    description: "Consistent income, controlled discretionary spend, zero revolving debt, always pays credit card in full, and maintains a healthy 5+ month emergency savings buffer.",
    story: "Demonstrates standard financial health baseline with low risk score and upward savings trajectory.",
    snapshots: [
      {
        month: "Month 1",
        income: 65000,
        essential_expenses: 24000,
        discretionary_expenses: 9500,
        emi_amount: 8000,
        credit_card_full_due: 4500,
        credit_card_min_due: 250,
        credit_card_amount_paid: 4500,
        savings_balance: 140000,
      },
      {
        month: "Month 2",
        income: 65000,
        essential_expenses: 24200,
        discretionary_expenses: 9200,
        emi_amount: 8000,
        credit_card_full_due: 4200,
        credit_card_min_due: 250,
        credit_card_amount_paid: 4200,
        savings_balance: 159100,
      },
      {
        month: "Month 3",
        income: 65000,
        essential_expenses: 24500,
        discretionary_expenses: 9800,
        emi_amount: 8000,
        credit_card_full_due: 4800,
        credit_card_min_due: 250,
        credit_card_amount_paid: 4800,
        savings_balance: 177000,
      },
      {
        month: "Month 4",
        income: 68000,
        essential_expenses: 24800,
        discretionary_expenses: 10000,
        emi_amount: 8000,
        credit_card_full_due: 5100,
        credit_card_min_due: 300,
        credit_card_amount_paid: 5100,
        savings_balance: 197100,
      },
      {
        month: "Month 5",
        income: 68000,
        essential_expenses: 25000,
        discretionary_expenses: 9600,
        emi_amount: 8000,
        credit_card_full_due: 4400,
        credit_card_min_due: 300,
        credit_card_amount_paid: 4400,
        savings_balance: 218100,
      },
      {
        month: "Month 6",
        income: 68000,
        essential_expenses: 25100,
        discretionary_expenses: 9900,
        emi_amount: 8000,
        credit_card_full_due: 4600,
        credit_card_min_due: 300,
        credit_card_amount_paid: 4600,
        savings_balance: 238500,
      },
    ],
  },
  {
    id: "slow-decline",
    name: "Slow Decliner (Early Warning Hero)",
    tagline: "Creeping Expenses & Minimum Due Trap",
    persona_type: "early_warning",
    description: "Income is flat while lifestyle inflation creeps up. To cope, begins paying only minimum due on credit cards while continuing full EMIs. Emergency savings is steadily depleted. Has not defaulted yet, but is headed towards a debt cliff in 2-3 months.",
    story: "The primary pitch showcase: demonstrates how the algorithm triggers an early risk warning in Month 3-4 long before any official credit default occurs.",
    snapshots: [
      {
        month: "Month 1",
        income: 55000,
        essential_expenses: 22000,
        discretionary_expenses: 11000,
        emi_amount: 10000,
        credit_card_full_due: 8000,
        credit_card_min_due: 500,
        credit_card_amount_paid: 8000,
        savings_balance: 85000,
      },
      {
        month: "Month 2",
        income: 55000,
        essential_expenses: 23200,
        discretionary_expenses: 12800,
        emi_amount: 10000,
        credit_card_full_due: 9800,
        credit_card_min_due: 600,
        credit_card_amount_paid: 6000,
        savings_balance: 78000,
      },
      {
        month: "Month 3",
        income: 55000,
        essential_expenses: 24100,
        discretionary_expenses: 14200,
        emi_amount: 10000,
        credit_card_full_due: 12400,
        credit_card_min_due: 750,
        credit_card_amount_paid: 4000,
        savings_balance: 68700,
      },
      {
        month: "Month 4",
        income: 55000,
        essential_expenses: 25000,
        discretionary_expenses: 15500,
        emi_amount: 10000,
        credit_card_full_due: 16100,
        credit_card_min_due: 1000,
        credit_card_amount_paid: 2500,
        savings_balance: 56700,
      },
      {
        month: "Month 5",
        income: 55000,
        essential_expenses: 26200,
        discretionary_expenses: 16800,
        emi_amount: 10000,
        credit_card_full_due: 20400,
        credit_card_min_due: 1300,
        credit_card_amount_paid: 1800,
        savings_balance: 41900,
      },
      {
        month: "Month 6",
        income: 55000,
        essential_expenses: 27400,
        discretionary_expenses: 18100,
        emi_amount: 10000,
        credit_card_full_due: 25600,
        credit_card_min_due: 1600,
        credit_card_amount_paid: 1600,
        savings_balance: 24400,
      },
    ],
  },
  {
    id: "distress",
    name: "Already in Distress",
    tagline: "Critical Debt Burden & Overdraft",
    persona_type: "critical",
    description: "Severe debt burden where mandatory obligations exceed income. Trapped paying only minimum card dues, with savings in negative territory and compounding interest accelerating insolvency.",
    story: "Serves as the high-risk control benchmark showing critical alerts and urgent debt consolidation recommendations.",
    snapshots: [
      {
        month: "Month 1",
        income: 45000,
        essential_expenses: 24000,
        discretionary_expenses: 7500,
        emi_amount: 15000,
        credit_card_full_due: 22000,
        credit_card_min_due: 1500,
        credit_card_amount_paid: 1500,
        savings_balance: 5000,
      },
      {
        month: "Month 2",
        income: 45000,
        essential_expenses: 24500,
        discretionary_expenses: 7000,
        emi_amount: 15000,
        credit_card_full_due: 23800,
        credit_card_min_due: 1600,
        credit_card_amount_paid: 1600,
        savings_balance: 1900,
      },
      {
        month: "Month 3",
        income: 45000,
        essential_expenses: 25000,
        discretionary_expenses: 6500,
        emi_amount: 15000,
        credit_card_full_due: 25900,
        credit_card_min_due: 1800,
        credit_card_amount_paid: 1800,
        savings_balance: -3200,
      },
      {
        month: "Month 4",
        income: 44000,
        essential_expenses: 25200,
        discretionary_expenses: 6200,
        emi_amount: 15000,
        credit_card_full_due: 28100,
        credit_card_min_due: 2000,
        credit_card_amount_paid: 2000,
        savings_balance: -8400,
      },
      {
        month: "Month 5",
        income: 44000,
        essential_expenses: 25600,
        discretionary_expenses: 6000,
        emi_amount: 15000,
        credit_card_full_due: 30600,
        credit_card_min_due: 2200,
        credit_card_amount_paid: 2200,
        savings_balance: -14200,
      },
      {
        month: "Month 6",
        income: 44000,
        essential_expenses: 26000,
        discretionary_expenses: 5800,
        emi_amount: 15000,
        credit_card_full_due: 33400,
        credit_card_min_due: 2400,
        credit_card_amount_paid: 2400,
        savings_balance: -20600,
      },
    ],
  },
  {
    id: "recovering",
    name: "Recovering Resilient",
    tagline: "Turnaround & Disciplined Debt Paydown",
    persona_type: "improving",
    description: "Started with heavy debt and high risk, but implemented proactive corrective actions: slashed discretionary expenses, halted credit card charges, aggressively paid down revolving balances, and turned savings from negative to positive.",
    story: "Demonstrates that the system recognizes and rewards positive behavior changes with a rapidly dropping risk score.",
    snapshots: [
      {
        month: "Month 1",
        income: 48000,
        essential_expenses: 23500,
        discretionary_expenses: 7000,
        emi_amount: 12000,
        credit_card_full_due: 22000,
        credit_card_min_due: 1600,
        credit_card_amount_paid: 2500,
        savings_balance: -12000,
      },
      {
        month: "Month 2",
        income: 48000,
        essential_expenses: 22400,
        discretionary_expenses: 5100,
        emi_amount: 12000,
        credit_card_full_due: 20200,
        credit_card_min_due: 1400,
        credit_card_amount_paid: 5000,
        savings_balance: -8500,
      },
      {
        month: "Month 3",
        income: 49000,
        essential_expenses: 21800,
        discretionary_expenses: 4200,
        emi_amount: 12000,
        credit_card_full_due: 16500,
        credit_card_min_due: 1200,
        credit_card_amount_paid: 7500,
        savings_balance: -4500,
      },
      {
        month: "Month 4",
        income: 49000,
        essential_expenses: 21400,
        discretionary_expenses: 3900,
        emi_amount: 12000,
        credit_card_full_due: 11200,
        credit_card_min_due: 800,
        credit_card_amount_paid: 8800,
        savings_balance: -100,
      },
      {
        month: "Month 5",
        income: 50000,
        essential_expenses: 21000,
        discretionary_expenses: 4200,
        emi_amount: 12000,
        credit_card_full_due: 6100,
        credit_card_min_due: 450,
        credit_card_amount_paid: 6100,
        savings_balance: 6600,
      },
      {
        month: "Month 6",
        income: 50000,
        essential_expenses: 20800,
        discretionary_expenses: 4500,
        emi_amount: 12000,
        credit_card_full_due: 3500,
        credit_card_min_due: 250,
        credit_card_amount_paid: 3500,
        savings_balance: 15800,
      },
    ],
  },
];

export function enrichSnapshots(personas) {
  return personas.map(persona => {
    const enrichedSnapshots = persona.snapshots.map((s, idx, arr) => {
      const totalExpenses = s.essential_expenses + s.discretionary_expenses;
      const totalDebtPaid = s.emi_amount + s.credit_card_amount_paid;
      const netCashflow = s.income - (totalExpenses + totalDebtPaid);
      const expenseToIncomeRatio = (totalExpenses + s.emi_amount) / s.income;
      const savingsRate = s.income > 0 ? (s.income - (totalExpenses + totalDebtPaid)) / s.income : 0;
      const minDueRatio = s.credit_card_full_due > 0 
        ? Math.min(1.0, s.credit_card_amount_paid / s.credit_card_full_due)
        : 1.0;
      
      const debtServiceRatio = (s.emi_amount + s.credit_card_full_due) / s.income;
      const runwayMonths = s.essential_expenses > 0 
        ? (s.savings_balance / s.essential_expenses) 
        : 0;

      return {
        ...s,
        total_expenses: Math.round(totalExpenses),
        total_debt_paid: Math.round(totalDebtPaid),
        net_cashflow: Math.round(netCashflow),
        expense_to_income_ratio: parseFloat(expenseToIncomeRatio.toFixed(3)),
        debt_service_ratio: parseFloat(debtServiceRatio.toFixed(3)),
        min_due_payment_ratio: parseFloat(minDueRatio.toFixed(3)),
        savings_rate: parseFloat(savingsRate.toFixed(3)),
        runway_months: parseFloat(runwayMonths.toFixed(2)),
      };
    });

    return {
      ...persona,
      currency: "INR",
      currency_symbol: "₹",
      snapshots: enrichedSnapshots,
    };
  });
}

export function generateAndSave() {
  const data = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    hackathon: "Innovation Unbound - CodeChef VIT Chennai",
    problem_statement: "Preventing Financial Distress Before It Becomes a Crisis",
    personas: enrichSnapshots(PERSONAS),
  };

  const outputDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'personas.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[DATA] Successfully generated static dataset at: ${outputPath}`);
  return data;
}

if (process.argv[1] && process.argv[1].endsWith('generate_dataset.mjs')) {
  generateAndSave();
}

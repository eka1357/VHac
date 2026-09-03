import { NextRequest, NextResponse } from "next/server";
import { PersonaRiskAssessment, Persona } from "@/lib/types";

export interface InsightsResponse {
  summary: string;
  keyObservation: string;
  actionItems: Array<{
    title: string;
    impact: string;
    timeline: string;
    description: string;
  }>;
  financialResilienceScore: number;
  source: "gemini_ai" | "openrouter_ai" | "deterministic_fallback";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { persona, assessment }: { persona: Persona; assessment: PersonaRiskAssessment } = body;

    if (!persona || !assessment) {
      return NextResponse.json({ error: "Missing required payload" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPEN_ROUTER_API_KEY;

    // 1. Try Native Gemini API if GEMINI_API_KEY is configured
    if (geminiKey) {
      try {
        const prompt = buildPrompt(persona, assessment);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              ...parsed,
              source: "gemini_ai",
            });
          }
        }
      } catch (err) {
        console.warn("[INSIGHTS] Gemini API failed, checking alternatives...", err);
      }
    }

    // 2. Try OpenRouter API if OPEN_ROUTER_API_KEY is configured
    if (openRouterKey) {
      try {
        const prompt = buildPrompt(persona, assessment);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://sentinelfin.app",
            "X-Title": "SentinelFin Financial Early Warning",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a specialized financial health and credit risk diagnostics AI for SentinelFin. Output ONLY valid JSON matching the exact schema requested.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({
              ...parsed,
              source: "openrouter_ai",
            });
          }
        }
      } catch (err) {
        console.warn("[INSIGHTS] OpenRouter API failed, falling back to deterministic engine...", err);
      }
    }

    // 3. Guaranteed Deterministic Fallback (Never breaks live demo)
    const fallback = generateDeterministicInsights(persona, assessment);
    return NextResponse.json({
      ...fallback,
      source: "deterministic_fallback",
    });
  } catch (error: any) {
    console.error("[API_INSIGHTS_ERROR]", error);
    return NextResponse.json(
      {
        summary: "Financial evaluation completed using local analytical rules.",
        keyObservation: "High fixed commitments and expense creep require proactive cashflow rebalancing.",
        actionItems: [
          {
            title: "Cap Discretionary Spending",
            impact: "High",
            timeline: "Immediate (Week 1)",
            description: "Enforce a 20% limit on non-essential lifestyle outlays to restore positive monthly cash buffer.",
          },
          {
            title: "Halt Minimum-Due Revolving Balance",
            impact: "Critical",
            timeline: "Next Billing Cycle",
            description: "Shift credit card repayment to fixed full-balance clearance to avoid 42% annualized interest erosion.",
          },
        ],
        financialResilienceScore: 65,
        source: "deterministic_fallback",
      },
      { status: 200 }
    );
  }
}

function buildPrompt(persona: Persona, assessment: PersonaRiskAssessment): string {
  const topFactorsText = assessment.topContributingFactors
    .slice(0, 3)
    .map((f, i) => `${i + 1}. ${f.title} (+${f.weightedImpact} pts, severity: ${f.severity}): ${f.explanation}`)
    .join("\n");

  return `You are a financial health early-warning specialist for a fintech hackathon demo.
Analyze the user's multi-month financial trajectory and explain why their risk score changed, focusing on early warning signs before any actual debt default.

Persona: ${persona.name} (${persona.tagline})
Current Risk Score: ${assessment.currentScore} / 100 (Category: ${assessment.riskCategory})
6-Month Score Delta: ${assessment.deltaFromFirstMonth > 0 ? `+${assessment.deltaFromFirstMonth} pts deterioration` : `${assessment.deltaFromFirstMonth} pts improvement`}
Monthly Net Cashflow: ₹${assessment.keyMetrics.netCashflow}
Emergency Savings Runway: ${assessment.keyMetrics.savingsBufferMonths} months
Credit Card Payment Health: ${assessment.keyMetrics.creditCardPaymentHealth}% paid

Top Contributing Risk Drivers:
${topFactorsText}

Return a JSON object with this exact structure:
{
  "summary": "2-3 concise, punchy sentences explaining the root cause of the score trend and highlighting the early-warning story in plain language.",
  "keyObservation": "1 striking, memorable takeaway about their financial trajectory.",
  "actionItems": [
    {
      "title": "Clear action title",
      "impact": "High | Medium | Critical",
      "timeline": "e.g. 7 Days, 30 Days",
      "description": "Concrete, actionable step with specific rupee amounts or percentage recommendations."
    }
  ],
  "financialResilienceScore": 75
}`;
}

function generateDeterministicInsights(persona: Persona, assessment: PersonaRiskAssessment): Omit<InsightsResponse, "source"> {
  const { currentScore, riskCategory, deltaFromFirstMonth, keyMetrics, topContributingFactors } = assessment;

  let summary = "";
  let keyObservation = "";
  const actionItems: InsightsResponse["actionItems"] = [];

  if (persona.id === "slow-decline") {
    summary = `Early deterioration warning active: While no loan payments have been missed yet, your distress score climbed +${deltaFromFirstMonth} points due to a subtle 28% creep in discretionary spend paired with revolving credit card minimum dues.`;
    keyObservation = "You are in the critical 60-90 day 'pre-default' window where small lifestyle adjustments can completely avert insolvency.";
    actionItems.push(
      {
        title: "Discretionary Spending Freeze",
        impact: "High",
        timeline: "Next 30 Days",
        description: `Cut dining and entertainment by ₹5,000/month (from ₹${persona.snapshots[persona.snapshots.length - 1].discretionary_expenses.toLocaleString()} to ~₹12,000) to immediately restore positive cashflow.`,
      },
      {
        title: "Exit the Minimum-Due Trap",
        impact: "Critical",
        timeline: "Immediate",
        description: `Stop paying only the minimum ₹${persona.snapshots[persona.snapshots.length - 1].credit_card_min_due} on credit cards. Allocate freed discretionary cash to clear the ₹${persona.snapshots[persona.snapshots.length - 1].credit_card_full_due.toLocaleString()} balance before 42% APR compounds.`,
      },
      {
        title: "Stabilize Emergency Buffer",
        impact: "Medium",
        timeline: "60 Days",
        description: `Maintain a floor of ₹50,000 (currently ₹${keyMetrics.savingsBalance.toLocaleString()}) to prevent unexpected medical or vehicle expenses from triggering high-cost borrowing.`,
      }
    );
  } else if (persona.id === "distress") {
    summary = `Critical cashflow deficit: Mandatory EMI obligations (₹${persona.snapshots[persona.snapshots.length - 1].emi_amount.toLocaleString()}) and compounding card debt exceed total income, causing emergency reserves to drop into negative deficit.`;
    keyObservation = "Immediate debt restructuring is necessary to halt compounding interest penalties.";
    actionItems.push(
      {
        title: "Debt Consolidation Request",
        impact: "Critical",
        timeline: "Within 48 Hours",
        description: "Apply for a fixed-tenure debt consolidation loan at 12-14% APR to replace high-interest credit card revolving debt.",
      },
      {
        title: "Lender Restructuring & EMI Extension",
        impact: "High",
        timeline: "Next 7 Days",
        description: "Request an EMI tenure extension from your primary lender to reduce monthly outflow from ₹15,000 down to ₹9,500.",
      }
    );
  } else if (persona.id === "recovering") {
    summary = `Positive turnaround in progress: Proactive expense trimming and aggressive credit card paydowns have reduced your financial risk score by ${Math.abs(deltaFromFirstMonth)} points over 6 months.`;
    keyObservation = "Your emergency savings turned positive this month — continuing this plan will restore low-risk status within 2 cycles.";
    actionItems.push(
      {
        title: "Rebuild 3-Month Emergency Fund",
        impact: "High",
        timeline: "90 Days",
        description: "Direct newly positive monthly cashflow (₹3,600/mo) into an auto-debit recurring deposit until savings reaches ₹60,000.",
      },
      {
        title: "Maintain 100% Full Due Card Settlement",
        impact: "Medium",
        timeline: "Ongoing",
        description: "Continue paying 100% of statements on time to maximize credit score rehabilitation.",
      }
    );
  } else {
    // Stable
    summary = `Excellent financial health: Expense-to-income ratio is well-regulated, zero revolving debt is carried, and your emergency buffer covers ${keyMetrics.savingsBufferMonths} months of essential needs.`;
    keyObservation = "Prime financial resilience with high capacity to weather unforeseen economic shocks.";
    actionItems.push(
      {
        title: "Automate Surplus Wealth Allocation",
        impact: "Medium",
        timeline: "30 Days",
        description: "Deploy surplus monthly cashflow (₹16,000+) into diversified low-cost index funds and high-yield deposits.",
      },
      {
        title: "Periodic Lifestyle Audit",
        impact: "Low",
        timeline: "Quarterly",
        description: "Review subscriptions and recurring bills every quarter to sustain high savings velocity.",
      }
    );
  }

  return {
    summary,
    keyObservation,
    actionItems,
    financialResilienceScore: Math.max(10, 100 - currentScore),
  };
}

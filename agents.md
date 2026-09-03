# AGENTS.md — Project Rules for AI Coding Agents
# Read by Antigravity (v1.20.3+), Cursor, and Claude Code.
# Place this file at the project root

## Project Overview
- **Event:** Innovation Unbound — CodeChef VIT Chennai Chapter, 24-hour AI/tech hackathon
- **Problem statement:** "Preventing Financial Distress Before It Becomes a Crisis" — most people don't realize their finances are deteriorating until they're already struggling with EMIs, credit-card bills, rising expenses, or no savings buffer.
- **Judging lens (bake these in from the start, don't bolt them on at the end):** financial literacy, responsible financial decision-making, access to financial services, business/personal resilience, long-term sustainability.
- **Stage:** Hackathon MVP. Optimize for a working, demoable product in ~18-20 hours of build time — not production hardening, not a "real" ML pipeline.

## Core Idea
Detect deterioration *before* it becomes a crisis by looking at **trend, not snapshot**:
- Expense-to-income ratio rising over time
- EMI / credit-card burden as % of income rising
- Savings rate falling
- Discretionary spend growing faster than income
- Increasing reliance on short-term credit or minimum-due payments

Output: a Financial Risk Score (0-100) + trend over time, WHY it's changing (explainable contributing factors — never a black box), and 2-3 concrete, specific next actions.

## Tech Stack (single-stack, chosen for hackathon speed — do not deviate without a good reason)
- **Framework:** Next.js 15 (App Router), TypeScript, strict mode
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Backend logic:** Next.js API routes (keep everything in TS — do NOT stand up a separate Python service, there's no time budget for that)
- **Scoring engine:** deterministic, explainable, weighted formula first. Only consider a lightweight ML model (e.g. simple logistic regression on the synthetic data) if the rule engine is done early with time to spare — never let ML block the demo.
- **AI insights layer:** Gemini API to turn the score + contributing factors into a short plain-language explanation and personalized action items. MUST gracefully fall back to a templated explanation if no API key is set at runtime — the live demo must never break on a missing/rate-limited key.
- **Data:** synthetic only. No real bank integrations, no real PII, no scraping, no third-party financial data APIs.
- **Persistence:** static JSON or local SQLite. No external DB setup — it burns hours you don't have.

## Personas (bake these into the synthetic dataset)
1. **Stable** — steady income, healthy savings rate, low EMI burden.
2. **Slow decline** — income flat, discretionary spend creeping up, savings rate dropping over 6 months. This is the headline "early warning" case — the score should visibly rise well before anything is actually missed.
3. **Already in distress** — high EMI/credit ratio, minimum-due payments, negative savings. Control/contrast case.
4. **Recovering** (optional, nice for the pitch) — score improving after a corrective action, showing the tool tracks positive change too, not just doom.

## Code Quality
- Keep files small (~250 lines) — split into components / hooks / lib
- Prefer named exports and small, composable functional components
- Every score/risk calculation must be a **pure, unit-testable function** with no hidden state — this is the credibility of the whole pitch; it must be inspectable on request
- No lorem-ipsum or placeholder content in the shipped UI — use persona data everywhere
- Comment the scoring formula clearly in plain English — assume a judge will ask "how does this actually work"

## Agent Behavior for This Hackathon
- Produce a short task-list/plan before any large change — but keep it short, this is a 24h clock
- Prioritize an ugly-but-working **vertical slice** over a polished-but-incomplete build: get [data → score → dashboard] working end-to-end first, then iterate on the AI-insights layer and polish
- After each milestone, actually run the app and confirm it renders before moving on — never hand back unverified code
- Do NOT add auth, payments, real bank APIs, or anything needing external/compliance approval — out of scope and a time sink for a synthetic-data demo
- When unsure if a feature fits the remaining time, build the smaller version and say so, rather than silently dropping something a judge might expect to see

## Definition of Done (submission checklist)
- [ ] Loads straight to the dashboard with a persona switcher — no login flow needed
- [ ] Shows current Risk Score + trend line over that persona's history
- [ ] Shows the top 3 contributing factors in plain language
- [ ] Shows at least 2 concrete, personalized next-step recommendations
- [ ] The "slow decline" persona visibly demonstrates early warning (score rising before anything is actually missed)
- [ ] Runs with `npm run dev` from a clean clone, no manual setup beyond `.env.local`
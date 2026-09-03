"use client";

import React, { useState, useEffect, useMemo } from "react";
import personasData from "@/data/personas.json";
import { Persona, MonthlySnapshot, PersonaRiskAssessment } from "@/lib/types";
import { calculateRiskAssessment } from "@/lib/scoring";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { RiskGauge } from "@/components/RiskGauge";
import { TrendChart } from "@/components/TrendChart";
import { ContributingFactors } from "@/components/ContributingFactors";
import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { InsightsResponse } from "@/app/api/insights/route";
import {
  Wallet,
  Coins,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const personas: Persona[] = personasData.personas as any;
  
  // Default to the hero persona: Slow Decliner
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("slow-decline");

  // What-If Simulation State
  const [discretionaryCutPct, setDiscretionaryCutPct] = useState<number>(0);
  const [cardPaymentPct, setCardPaymentPct] = useState<number>(100);
  const [additionalIncome, setAdditionalIncome] = useState<number>(0);

  // AI Insights State
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Active Persona
  const currentPersona = useMemo(() => {
    return personas.find((p) => p.id === selectedPersonaId) || personas[0];
  }, [personas, selectedPersonaId]);

  // Is Simulation active?
  const isSimulating = discretionaryCutPct > 0 || additionalIncome > 0 || cardPaymentPct !== 100;

  // Compute Base Snapshots vs Simulated Snapshots
  const originalSnapshots = currentPersona.snapshots;

  const activeSnapshots = useMemo(() => {
    if (!isSimulating) return originalSnapshots;

    // Apply simulation transformations to the latest snapshots
    return originalSnapshots.map((s, idx) => {
      // Only apply interventions to the recent 2-3 months to simulate active turnaround
      if (idx < originalSnapshots.length - 2) return s;

      const newIncome = s.income + additionalIncome;
      const newDiscretionary = Math.round(s.discretionary_expenses * (1 - discretionaryCutPct / 100));
      const newFullDue = s.credit_card_full_due;
      const newAmountPaid = Math.round(newFullDue * (cardPaymentPct / 100));

      const newTotalExpenses = s.essential_expenses + newDiscretionary;
      const newDebtPaid = s.emi_amount + newAmountPaid;
      const cashDelta = (newIncome - (newTotalExpenses + newDebtPaid)) - (s.income - (s.essential_expenses + s.discretionary_expenses + s.emi_amount + s.credit_card_amount_paid));

      return {
        ...s,
        income: newIncome,
        discretionary_expenses: newDiscretionary,
        credit_card_amount_paid: newAmountPaid,
        savings_balance: s.savings_balance + Math.max(0, cashDelta),
      };
    });
  }, [originalSnapshots, isSimulating, discretionaryCutPct, cardPaymentPct, additionalIncome]);

  // Scoring Engine Computations (Pure function)
  const baseAssessment = useMemo(() => {
    return calculateRiskAssessment(originalSnapshots);
  }, [originalSnapshots]);

  const activeAssessment = useMemo(() => {
    return calculateRiskAssessment(activeSnapshots);
  }, [activeSnapshots]);

  // Reset simulation when switching personas
  const handleSelectPersona = (id: string) => {
    setSelectedPersonaId(id);
    handleResetSimulation();
  };

  const handleResetSimulation = () => {
    setDiscretionaryCutPct(0);
    setCardPaymentPct(100);
    setAdditionalIncome(0);
  };

  // Fetch AI Insights whenever persona changes
  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: currentPersona,
          assessment: activeAssessment,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI insights");
      const data: InsightsResponse = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.warn("Using offline rule diagnostics fallback", err);
      // Fallback is handled directly on backend too, but set state safety
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedPersonaId]);

  const { keyMetrics } = activeAssessment;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        personas={personas}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={handleSelectPersona}
        isSimulating={isSimulating}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Pitch Hero Callout Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Core Innovation Pitch
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Trend-Based Early Warning vs Snapshot Credit Scores
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {currentPersona.tagline}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {currentPersona.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (selectedPersonaId !== "slow-decline") {
                  handleSelectPersona("slow-decline");
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                selectedPersonaId === "slow-decline"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedPersonaId === "slow-decline" ? "Viewing Hero Case" : "Demo Early Warning (Slow Decline)"}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Cashflow"
            value={`${keyMetrics.netCashflow >= 0 ? "+" : ""}₹${keyMetrics.netCashflow.toLocaleString()}`}
            subtext="Net monthly buffer"
            icon={<Wallet className="w-4 h-4 text-indigo-400" />}
            trend={{
              direction: keyMetrics.netCashflow >= 0 ? "up" : "down",
              label: keyMetrics.netCashflow >= 0 ? "Surplus" : "Deficit",
              isGood: keyMetrics.netCashflow >= 0,
            }}
            highlight={keyMetrics.netCashflow < 0}
          />

          <MetricCard
            title="Total Monthly Income"
            value={`₹${keyMetrics.currentIncome.toLocaleString()}`}
            subtext="Primary earnings"
            icon={<Coins className="w-4 h-4 text-emerald-400" />}
            trend={{
              direction: "neutral",
              label: "Steady Base",
              isGood: true,
            }}
          />

          <MetricCard
            title="Debt Service Burden"
            value={`₹${keyMetrics.currentDebtObligations.toLocaleString()}`}
            subtext={`${Math.round((keyMetrics.currentDebtObligations / (keyMetrics.currentIncome || 1)) * 100)}% of income (EMI + CC)`}
            icon={<TrendingDown className="w-4 h-4 text-purple-400" />}
            trend={{
              direction: (keyMetrics.currentDebtObligations / (keyMetrics.currentIncome || 1)) > 0.4 ? "down" : "up",
              label: (keyMetrics.currentDebtObligations / (keyMetrics.currentIncome || 1)) > 0.4 ? "Heavy" : "Manageable",
              isGood: (keyMetrics.currentDebtObligations / (keyMetrics.currentIncome || 1)) <= 0.35,
            }}
          />

          <MetricCard
            title="Emergency Cash Runway"
            value={keyMetrics.savingsBufferMonths >= 0 ? `${keyMetrics.savingsBufferMonths} Months` : "Negative"}
            subtext={`Balance: ₹${keyMetrics.savingsBalance.toLocaleString()}`}
            icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
            trend={{
              direction: keyMetrics.savingsBufferMonths >= 3 ? "up" : "down",
              label: keyMetrics.savingsBufferMonths >= 3 ? "Safe Buffer" : "Critical Low",
              isGood: keyMetrics.savingsBufferMonths >= 3,
            }}
            highlight={keyMetrics.savingsBufferMonths < 1.5}
          />
        </div>

        {/* Row 2: Risk Gauge + Historical Trajectory Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <RiskGauge
              assessment={activeAssessment}
              personaName={currentPersona.name}
              isSimulating={isSimulating}
            />
          </div>

          <div className="lg:col-span-7">
            <TrendChart
              assessment={activeAssessment}
              snapshots={activeSnapshots}
            />
          </div>
        </div>

        {/* Row 3: Contributing Risk Factors + AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ContributingFactors factors={activeAssessment.topContributingFactors} />
          </div>

          <div className="lg:col-span-6">
            <AiInsightsPanel
              insights={insights}
              isLoading={isLoadingInsights}
              onRefresh={fetchInsights}
              error={insightsError}
            />
          </div>
        </div>

        {/* Row 4: Interactive What-If Simulator */}
        <div className="grid grid-cols-1 gap-6">
          <WhatIfSimulator
            discretionaryCutPct={discretionaryCutPct}
            onDiscretionaryCutChange={setDiscretionaryCutPct}
            cardPaymentPct={cardPaymentPct}
            onCardPaymentPctChange={setCardPaymentPct}
            additionalIncome={additionalIncome}
            onAdditionalIncomeChange={setAdditionalIncome}
            originalScore={baseAssessment.currentScore}
            simulatedScore={activeAssessment.currentScore}
            onReset={handleResetSimulation}
            isSimulating={isSimulating}
          />
        </div>

      </main>

      {/* Hackathon Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            Innovation Unbound — CodeChef VIT Chennai | Problem: Preventing Financial Distress Before It Becomes a Crisis
          </p>
          <div className="flex items-center space-x-4">
            <span>Deterministic Scoring Engine</span>
            <span>•</span>
            <span>Gemini AI Insights Layer</span>
            <span>•</span>
            <span>Zero PII / Synthetic Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

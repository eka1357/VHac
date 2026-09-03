"use client";

import React from "react";
import { ContributingFactor } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  PieChart,
  Landmark,
  ShieldCheck,
  ShoppingBag,
  Info,
} from "lucide-react";

interface ContributingFactorsProps {
  factors: ContributingFactor[];
}

export const ContributingFactors: React.FC<ContributingFactorsProps> = ({ factors }) => {
  const getFactorIcon = (id: string) => {
    switch (id) {
      case "credit_card_repayment":
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case "expense_to_income":
        return <PieChart className="w-4 h-4 text-rose-400" />;
      case "debt_burden":
        return <Landmark className="w-4 h-4 text-purple-400" />;
      case "savings_buffer":
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case "discretionary_creep":
        return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          barColor: "bg-emerald-500",
          label: "Low Risk",
        };
      case "moderate":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          text: "text-blue-400",
          barColor: "bg-blue-500",
          label: "Moderate",
        };
      case "high":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          text: "text-amber-400",
          barColor: "bg-amber-500",
          label: "High Stress",
        };
      case "critical":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          text: "text-rose-400",
          barColor: "bg-rose-500",
          label: "Critical",
        };
      default:
        return {
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          text: "text-slate-400",
          barColor: "bg-slate-500",
          label: "Neutral",
        };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Explainable Attribution
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Contributing Risk Drivers</span>
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Weighted Formula (Sum = 100%)
        </span>
      </div>

      {/* Factor Cards List */}
      <div className="space-y-3.5">
        {factors.map((factor) => {
          const badge = getSeverityBadge(factor.severity);
          return (
            <div
              key={factor.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-150"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Title & Icon */}
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/50">
                    {getFactorIcon(factor.id)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      {factor.title}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {factor.weightPercent}% weight
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Score & Severity Badge */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      +{factor.weightedImpact} pts
                    </span>
                    <span className="text-[10px] block text-slate-400">
                      ({factor.impactScore}/100)
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${badge.bg} ${badge.border} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Visual Contribution Bar */}
              <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${badge.barColor} transition-all duration-500`}
                  style={{ width: `${factor.impactScore}%` }}
                />
              </div>

              {/* Metric & Plain English Explanation */}
              <div className="mt-2 text-xs text-slate-300/90 leading-relaxed flex items-start justify-between gap-3">
                <p className="flex-1">{factor.explanation}</p>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                  {factor.trendDirection === "deteriorating" && (
                    <TrendingUp className="w-3 h-3 text-rose-400" />
                  )}
                  {factor.trendDirection === "improving" && (
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  )}
                  {factor.trendDirection === "stable" && (
                    <Minus className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{factor.metricValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Transparency Note */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Transparent attribution without opaque black-box scoring.
        </span>
      </div>
    </div>
  );
};

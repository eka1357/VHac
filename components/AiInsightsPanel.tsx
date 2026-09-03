"use client";

import React from "react";
import { Sparkles, ArrowRight, Brain, Clock, ShieldCheck, RefreshCw, Cpu } from "lucide-react";
import { InsightsResponse } from "@/app/api/insights/route";

interface AiInsightsPanelProps {
  insights: InsightsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({
  insights,
  isLoading,
  onRefresh,
  error,
}) => {
  const getImpactBadge = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between border-indigo-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI Diagnostics & Action Plan</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {insights?.source === "gemini_ai"
                  ? "Gemini 1.5 Flash"
                  : insights?.source === "openrouter_ai"
                  ? "Gemini AI"
                  : "Rule Diagnostics"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized Plain-Language Financial Health Analysis
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition disabled:opacity-50"
          title="Regenerate analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 animate-pulse">
            Analyzing 6-month trajectory and synthesizing proactive action items...
          </p>
        </div>
      ) : insights ? (
        <div className="space-y-4">
          {/* Executive Summary Callout */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {insights.summary}
            </p>
            {insights.keyObservation && (
              <div className="mt-2.5 pt-2.5 border-t border-indigo-500/20 flex items-start space-x-2 text-xs text-indigo-300 font-medium">
                <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Takeaway: {insights.keyObservation}</span>
              </div>
            )}
          </div>

          {/* Action Items List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Prioritized Corrective Action Steps
            </h4>

            <div className="space-y-2.5">
              {insights.actionItems.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 transition-all duration-150"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-indigo-400 text-[10px] font-mono flex items-center justify-center border border-slate-700">
                        {idx + 1}
                      </span>
                      {action.title}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getImpactBadge(
                          action.impact
                        )}`}
                      >
                        {action.impact} Impact
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {action.timeline}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300/90 leading-relaxed mt-1">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] text-slate-500">
          Always verified against deterministic risk calculations.
        </span>
        <span className="text-emerald-400/90 font-medium text-[11px] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Explainable & Safe
        </span>
      </div>
    </div>
  );
};

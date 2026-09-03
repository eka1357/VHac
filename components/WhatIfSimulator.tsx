"use client";

import React from "react";
import { Sparkles, Sliders, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

interface WhatIfSimulatorProps {
  discretionaryCutPct: number;
  onDiscretionaryCutChange: (val: number) => void;
  cardPaymentPct: number;
  onCardPaymentPctChange: (val: number) => void;
  additionalIncome: number;
  onAdditionalIncomeChange: (val: number) => void;
  originalScore: number;
  simulatedScore: number;
  onReset: () => void;
  isSimulating: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  discretionaryCutPct,
  onDiscretionaryCutChange,
  cardPaymentPct,
  onCardPaymentPctChange,
  additionalIncome,
  onAdditionalIncomeChange,
  originalScore,
  simulatedScore,
  onReset,
  isSimulating,
}) => {
  const scoreDiff = simulatedScore - originalScore;

  return (
    <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between border-indigo-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Resilience Simulator
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>&quot;What-If&quot; Intervention Modeling</span>
          </h3>
        </div>

        {isSimulating && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Simulate corrective behavior changes in real time to see how targeted budgeting and debt discipline reverse distress trajectory.
      </p>

      {/* Sliders Grid */}
      <div className="space-y-4">
        {/* Slider 1: Cut Discretionary Spend */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300">Reduce Discretionary Spend</span>
            <span className="font-mono font-bold text-indigo-400">-{discretionaryCutPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={discretionaryCutPct}
            onChange={(e) => onDiscretionaryCutChange(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0% (As-is)</span>
            <span>-25%</span>
            <span>-50% (Max pause)</span>
          </div>
        </div>

        {/* Slider 2: Card Payment Compliance */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300">Credit Card Bill Payment Target</span>
            <span className="font-mono font-bold text-amber-400">{cardPaymentPct}% Paid</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={cardPaymentPct}
            onChange={(e) => onCardPaymentPctChange(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Min-Due (10%)</span>
            <span>50% Paydown</span>
            <span>100% Full Due</span>
          </div>
        </div>

        {/* Slider 3: Side Income */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300">Supplemental Income Boost</span>
            <span className="font-mono font-bold text-emerald-400">+₹{additionalIncome.toLocaleString()}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={20000}
            step={2000}
            value={additionalIncome}
            onChange={(e) => onAdditionalIncomeChange(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>₹0</span>
            <span>+₹10,000</span>
            <span>+₹20,000</span>
          </div>
        </div>
      </div>

      {/* Projected Outcome Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Projected Impact
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-slate-400 line-through">
              {originalScore}
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {simulatedScore}
            </span>
          </div>
        </div>

        <div className="text-right">
          {scoreDiff < 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {scoreDiff} pts Risk Relief
            </span>
          ) : (
            <span className="text-xs text-slate-400">Adjust sliders above</span>
          )}
        </div>
      </div>
    </div>
  );
};

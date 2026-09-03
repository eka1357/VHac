"use client";

import React, { useState } from "react";
import { PersonaRiskAssessment, MonthlySnapshot } from "@/lib/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { TrendingUp, Layers, DollarSign, Activity } from "lucide-react";

interface TrendChartProps {
  assessment: PersonaRiskAssessment;
  snapshots: MonthlySnapshot[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  assessment,
  snapshots,
}) => {
  const [activeTab, setActiveTab] = useState<"risk_score" | "cashflow" | "savings">("risk_score");

  // Format merged data for chart
  const chartData = snapshots.map((s, idx) => {
    const riskData = assessment.monthlyScores[idx] || { score: 0 };
    const totalExp = s.essential_expenses + s.discretionary_expenses;
    const debtPaid = s.emi_amount + s.credit_card_amount_paid;

    return {
      month: s.month,
      riskScore: riskData.score,
      income: s.income,
      essentialExpenses: s.essential_expenses,
      discretionaryExpenses: s.discretionary_expenses,
      totalExpenses: totalExp,
      debtPaid: debtPaid,
      savingsBalance: s.savings_balance,
      creditCardDue: s.credit_card_full_due,
      creditCardPaid: s.credit_card_amount_paid,
      minDueRatioPct: Math.round((s.credit_card_full_due > 0 ? s.credit_card_amount_paid / s.credit_card_full_due : 1.0) * 100),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-white mb-1.5 border-b border-slate-800 pb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-mono font-semibold text-white">
                  {item.name.includes("Score") || item.name.includes("Ratio")
                    ? item.value
                    : `₹${Number(item.value).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Multi-Month Trajectory
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>6-Month Financial Velocity</span>
          </h3>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("risk_score")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "risk_score"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Risk Score</span>
          </button>
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "cashflow"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Income vs Outflow</span>
          </button>
          <button
            onClick={() => setActiveTab("savings")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "savings"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Savings & Buffer</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "risk_score" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="minDueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Financial Risk Score (0-100)"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#scoreGradient)"
              />
              <Area
                type="monotone"
                dataKey="minDueRatioPct"
                name="Card Payment Rate (%)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#minDueGradient)"
              />
            </AreaChart>
          ) : activeTab === "cashflow" ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="essentialExpenses"
                name="Essentials"
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="discretionaryExpenses"
                name="Discretionary"
                stroke="#f43f5e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="debtPaid"
                name="Debt Servicing"
                stroke="#eab308"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            </ComposedChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="savingsBalance"
                name="Savings Balance (₹)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Narrative Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Trend tracking detects subtle changes before default
        </span>
        <span className="font-mono text-slate-500">6 Monthly Cycles Evaluated</span>
      </div>
    </div>
  );
};

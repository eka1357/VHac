"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
    isGood: boolean;
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`glass-card p-4 rounded-xl relative overflow-hidden transition-all duration-200 ${
        highlight
          ? "border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 shadow-lg shadow-indigo-950/20"
          : "hover:border-slate-700/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
          {icon}
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-xl font-bold text-white tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-1 text-xs">
          <span className="text-slate-400">{subtext}</span>

          {trend && (
            <span
              className={`flex items-center space-x-0.5 font-medium ${
                trend.direction === "neutral"
                  ? "text-slate-400"
                  : trend.isGood
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {trend.direction === "up" && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === "down" && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.label}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { PersonaRiskAssessment, RiskCategory } from "@/lib/types";
import { AlertCircle, AlertTriangle, CheckCircle, Flame, ShieldAlert, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface RiskGaugeProps {
  assessment: PersonaRiskAssessment;
  personaName: string;
  isSimulating?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  assessment,
  personaName,
  isSimulating = false,
}) => {
  const { currentScore, riskCategory, deltaFromFirstMonth, isEarlyWarningTriggered, earlyWarningHeadline } = assessment;

  // Visual styling based on risk category
  const getRiskStyles = (category: RiskCategory) => {
    switch (category) {
      case "LOW":
        return {
          textColor: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          strokeColor: "#10b981",
          label: "Low Risk",
          subtitle: "Financially Resilient",
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        };
      case "MODERATE":
        return {
          textColor: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          strokeColor: "#3b82f6",
          label: "Moderate Risk",
          subtitle: "Monitor Cashflow",
          icon: <AlertCircle className="w-4 h-4 text-blue-400" />,
        };
      case "HIGH":
        return {
          textColor: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          strokeColor: "#f59e0b",
          label: "High Risk",
          subtitle: "Early Warning Alert",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case "CRITICAL":
        return {
          textColor: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/30",
          strokeColor: "#ef4444",
          label: "Critical Distress",
          subtitle: "Urgent Action Required",
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        };
    }
  };

  const style = getRiskStyles(riskCategory);

  // SVG Radial meter calculations
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree arc for speedometer feel
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (currentScore / 100) * arcLength;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: style.strokeColor }}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Financial Distress Index
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            {personaName}
            {isSimulating && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-normal">
                Simulated
              </span>
            )}
          </h3>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bgColor} ${style.borderColor} ${style.textColor}`}
        >
          {style.icon}
          <span>{style.label}</span>
        </div>
      </div>

      {/* Radial Gauge Visual */}
      <div className="flex flex-col items-center justify-center my-4 z-10">
        <div className="relative w-48 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-[210deg] transform" viewBox="0 0 200 200">
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Value fill arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={style.strokeColor}
              strokeWidth="14"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center score readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {currentScore}
            </span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">
              out of 100
            </span>
          </div>
        </div>

        {/* 6-Month Velocity Indicator */}
        <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1">
          <span className="text-slate-400">6-Month Trend:</span>
          {deltaFromFirstMonth > 0 ? (
            <span className="flex items-center font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{deltaFromFirstMonth} pts deterioration
            </span>
          ) : deltaFromFirstMonth < 0 ? (
            <span className="flex items-center font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {deltaFromFirstMonth} pts improvement
            </span>
          ) : (
            <span className="flex items-center font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              0 pts (Stable)
            </span>
          )}
        </div>
      </div>

      {/* Early-Warning Pitch Alert Banner */}
      {isEarlyWarningTriggered && earlyWarningHeadline && (
        <div className="z-10 mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2.5 animate-pulse-slow">
          <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-300">Early-Warning Triggered</span>
            <p className="text-amber-200/90 mt-0.5 leading-relaxed">{earlyWarningHeadline}</p>
          </div>
        </div>
      )}
    </div>
  );
};

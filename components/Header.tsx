"use client";

import React from "react";
import { Persona } from "@/lib/types";
import { ShieldAlert, TrendingDown, CheckCircle2, AlertTriangle, RefreshCw, Zap } from "lucide-react";

interface HeaderProps {
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  isSimulating: boolean;
  onResetSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  personas,
  selectedPersonaId,
  onSelectPersona,
  isSimulating,
  onResetSimulation,
}) => {
  const getPersonaIcon = (type: string) => {
    switch (type) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "early_warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "critical":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "improving":
        return <TrendingDown className="w-4 h-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SentinelFin
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Innovation Unbound MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Early-Warning Financial Deterioration & Resilience Engine
              </p>
            </div>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">
              Select Profile:
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              {personas.map((persona) => {
                const isSelected = persona.id === selectedPersonaId;
                return (
                  <button
                    key={persona.id}
                    onClick={() => onSelectPersona(persona.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {getPersonaIcon(persona.persona_type)}
                    <span>{persona.name.split(" ")[0]} {persona.id === "slow-decline" ? "(Hero Pitch)" : ""}</span>
                  </button>
                );
              })}
            </div>

            {isSimulating && (
              <button
                onClick={onResetSimulation}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                title="Reset simulation changes"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

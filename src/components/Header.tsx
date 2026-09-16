import React from "react";
import { Activity, ShieldAlert, Sparkles, RefreshCw, Cpu } from "lucide-react";

interface HeaderProps {
  isSimulating: boolean;
  onResetSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  onResetSimulation,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  MEDWATCH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Early-Warning Prototype
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Medicine Shortage Early-Warning &amp; Redistribution System
              </p>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-3">
            {isSimulating && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold animate-pulse">
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulation Active</span>
                <button
                  onClick={onResetSimulation}
                  className="ml-1 text-[11px] underline hover:text-amber-950 cursor-pointer"
                  title="Reset to baseline"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-medium">12 Facilities Synced</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

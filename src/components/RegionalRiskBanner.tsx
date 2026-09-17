import React, { useState } from "react";
import { RegionalShortageRisk } from "../types";
import {
  AlertOctagon,
  TrendingDown,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface RegionalRiskBannerProps {
  risks: RegionalShortageRisk[];
  onInspectRisk: (risk: RegionalShortageRisk) => void;
  onExplainWithAI: (risk: RegionalShortageRisk) => void;
}

export const RegionalRiskBanner: React.FC<RegionalRiskBannerProps> = ({
  risks,
  onInspectRisk,
  onExplainWithAI,
}) => {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  if (!risks || risks.length === 0) return null;

  return (
    <div className="space-y-3">
      {risks.map((risk) => (
        <div
          key={risk.id}
          className="relative overflow-hidden bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm"
        >
          {/* Accent indicator bar */}
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-rose-600"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Core Signal Headline & Clinical Description */}
            <div className="space-y-2 flex-1 pl-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                  <span>Regional Shortage Risk</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {risk.district} &bull; {risk.medicine_name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                  {risk.affected_count} / {risk.total_district_facilities} Facilities Affected
                </span>
              </div>

              {/* Core pattern explanation */}
              <p className="text-sm text-slate-800 font-medium leading-relaxed max-w-3xl">
                {risk.explanation}
              </p>

              {/* WHY THIS ALERT WAS TRIGGERED (CHANGE 5) */}
              <div className="p-3 rounded-xl bg-white/95 border border-rose-200/90 shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-900">
                    Why This Alert Was Triggered
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
                    Regional pattern detected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 text-xs text-slate-800">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <span><strong>{risk.affected_count} of {risk.total_district_facilities}</strong> facilities affected</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <span>Same medicine: <strong>{risk.medicine_name.split(" ")[0]}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <span>Same district: <strong>{risk.district}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <span>Multiple facilities showing declining stock</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <span>Average coverage: <strong>{risk.average_days_remaining} days</strong></span>
                  </div>
                </div>
              </div>

              {/* Regional Shortage Risk */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 pt-0.5">
                <span className="font-extrabold text-slate-900 bg-rose-100/80 text-rose-900 px-2 py-0.5 rounded border border-rose-200">
                  Regional Shortage Risk:
                </span>
                <span className="font-bold text-rose-700 font-mono">
                  {risk.confidence}% likelihood of a regional shortage within {risk.estimated_shortage_window_days} days
                </span>
                <span className="text-slate-400 hidden sm:inline">&bull;</span>
                <span className="text-slate-500 text-[11px]">
                  Calculated from affected facilities, depletion velocity, consumption trend, and replenishment delay.
                </span>
                <button
                  onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                  className="text-teal-700 hover:text-teal-900 font-semibold underline inline-flex items-center space-x-1 cursor-pointer ml-auto"
                  title="View transparent scoring formula"
                >
                  <Info className="w-3 h-3 text-teal-600" />
                  <span>{showConfidenceDetails ? "Hide breakdown" : "Scoring factors"}</span>
                </button>
              </div>

              {/* Collapsible Confidence Scoring Formula Breakdown */}
              {showConfidenceDetails && (
                <div className="mt-2 p-3 bg-white/95 border border-amber-200 rounded-xl text-xs space-y-1.5 shadow-xs max-w-2xl">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Multi-Factor Weighting (Regional Shortage Risk)</span>
                    <span className="font-mono text-teal-700 font-bold">{risk.confidence}% Composite Risk</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="font-medium">Affected Ratio</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {risk.confidence_breakdown.affected_facility_weight} / 40 pts
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="font-medium">Depletion Velocity</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {risk.confidence_breakdown.depletion_speed_weight} / 25 pts
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="font-medium">Consumption Trend</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {risk.confidence_breakdown.consumption_surge_weight} / 20 pts
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="font-medium">Replenish Delay</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {risk.confidence_breakdown.replenishment_delay_weight} / 15 pts
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Note: Calculated from affected facilities, depletion velocity, consumption trend, and replenishment delay.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Key Metrics & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 min-w-[240px]">
              {/* Metric Badges */}
              <div className="flex items-center gap-2 w-full justify-between sm:justify-end">
                <div className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Avg Coverage</div>
                  <div className="text-base font-extrabold text-rose-700">
                    {risk.average_days_remaining} <span className="text-xs font-normal">days</span>
                  </div>
                </div>

                <div className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Shortage Window</div>
                  <div className="text-base font-extrabold text-amber-700">
                    &le; {risk.estimated_shortage_window_days} <span className="text-xs font-normal">days</span>
                  </div>
                </div>

                <div className="bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Pattern Trend</div>
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-center space-x-0.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>{risk.trend.split(" ")[0]}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => onExplainWithAI(risk)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain with AI</span>
                </button>

                <button
                  onClick={() => onInspectRisk(risk)}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <span>Inspect Facilities</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

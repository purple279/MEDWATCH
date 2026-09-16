import React from "react";
import {
  SimulationSettings,
  FacilityRiskCalculation,
  RegionalShortageRisk,
} from "../types";
import {
  Activity,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SimulationPanelProps {
  settings: SimulationSettings;
  onUpdateSettings: (newSettings: SimulationSettings) => void;
  onReset: () => void;
  selectedFacilityRisk: FacilityRiskCalculation | null;
  baselineFacilityRisk: FacilityRiskCalculation | null;
  selectedRegionalRisk: RegionalShortageRisk | null;
  baselineRegionalRisk: RegionalShortageRisk | null;
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${months[mIdx]} ${parseInt(parts[2], 10)}`;
    }
  } catch (e) {}
  return dateStr;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  settings,
  onUpdateSettings,
  onReset,
  selectedFacilityRisk,
  baselineFacilityRisk,
  selectedRegionalRisk,
  baselineRegionalRisk,
}) => {
  const isSimulating =
    settings.demandIncreasePct > 0 || settings.replenishmentDelayDays > 0;

  const handleApplyPreset = (
    name: string,
    demandPct: number,
    delayDays: number
  ) => {
    onUpdateSettings({
      activeScenarioName: name,
      demandIncreasePct: demandPct,
      replenishmentDelayDays: delayDays,
    });
  };

  // Dynamic values for Before -> After calculations
  const unit = selectedFacilityRisk?.medicine.unit || "vials";
  const facName = selectedFacilityRisk?.facility.name || "Selected Facility";
  const medName = selectedFacilityRisk?.medicine.name.split(" ")[0] || "Medicine";

  const beforeBurn = baselineFacilityRisk?.daily_consumption_rate ?? 20;
  const afterBurn = selectedFacilityRisk?.daily_consumption_rate ?? beforeBurn;

  const beforeCoverage = baselineFacilityRisk?.days_of_stock_remaining ?? 5.0;
  const afterCoverage = selectedFacilityRisk?.days_of_stock_remaining ?? beforeCoverage;

  const beforeStockout = baselineFacilityRisk
    ? formatDate(baselineFacilityRisk.projected_stockout_date)
    : "Sep 21";
  const afterStockout = selectedFacilityRisk
    ? formatDate(selectedFacilityRisk.projected_stockout_date)
    : beforeStockout;

  const beforeGap = baselineFacilityRisk?.replenishment_gap_days ?? 4;
  const afterGap = selectedFacilityRisk?.replenishment_gap_days ?? beforeGap;

  const beforeRiskPct = baselineRegionalRisk?.confidence ?? 78;
  const afterRiskPct = selectedRegionalRisk?.confidence ?? beforeRiskPct;

  // Dynamic recommended response
  let recommendedResponse =
    "Redistribution becomes more urgent because the projected stockout occurs sooner.";
  if (settings.demandIncreasePct > 0 && settings.replenishmentDelayDays > 0) {
    recommendedResponse = `Compounded supply shock: burn rate accelerated by +${settings.demandIncreasePct}% while delivery is delayed by +${settings.replenishmentDelayDays} days. Emergency multi-facility surplus redistribution is required to prevent a ${afterGap}-day critical stockout.`;
  } else if (settings.replenishmentDelayDays > 0) {
    recommendedResponse = `Scheduled delivery delayed by +${settings.replenishmentDelayDays} days, expanding the facility's supply gap to ${afterGap} days. Immediate inter-facility transfer is recommended to bridge the arrival window.`;
  } else if (settings.demandIncreasePct > 0) {
    recommendedResponse = `Redistribution becomes more urgent because the projected stockout occurs sooner (${beforeStockout} → ${afterStockout}, reducing coverage by ${(beforeCoverage - afterCoverage).toFixed(1)} days).`;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Title & Subtitle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Shortage Stress Test
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            See how sudden demand or delivery disruptions could affect medicine availability.
          </p>
        </div>

        {isSimulating ? (
          <button
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset to Normal</span>
          </button>
        ) : (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Normal operating conditions</span>
          </span>
        )}
      </div>

      {/* Cause -> Effect Visual Stepper */}
      <div className="flex items-center justify-between text-[11px] font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
        <div className="flex items-center space-x-1 text-purple-800">
          <span className="w-4 h-4 rounded-full bg-purple-200 text-purple-900 text-[10px] flex items-center justify-center font-mono">1</span>
          <span>SCENARIO</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center space-x-1 text-slate-700">
          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-mono">2</span>
          <span>WHAT CHANGED?</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center space-x-1 text-rose-700">
          <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-900 text-[10px] flex items-center justify-center font-mono">3</span>
          <span>IMPACT</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center space-x-1 text-teal-700">
          <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-mono">4</span>
          <span>RECOMMENDED ACTION</span>
        </div>
      </div>

      {/* 3 Prominent Scenario Cards */}
      <div>
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
          Select Stress Test Scenario:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preset 1: +20% Demand Surge */}
          <button
            onClick={() =>
              handleApplyPreset("+20% Surge in Demand", 20, 0)
            }
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              settings.demandIncreasePct === 20 && settings.replenishmentDelayDays === 0
                ? "bg-purple-50 border-purple-500 ring-2 ring-purple-200 shadow-xs"
                : "bg-white hover:bg-purple-50/50 border-purple-200 shadow-2xs"
            }`}
          >
            <div>
              <div className="flex items-center space-x-1.5 text-purple-900 font-extrabold text-sm">
                <TrendingUp className="w-4 h-4 text-purple-700" />
                <span>📈 +20% DEMAND</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Patient demand increases by 20% due to seasonal surge or local outbreak
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-700 font-bold mt-2 pt-1 border-t border-purple-100">
              Demand: +20% &bull; Delivery: On Schedule
            </div>
          </button>

          {/* Preset 2: +7-Day Delivery Delay */}
          <button
            onClick={() =>
              handleApplyPreset("+7-Day Delivery Delay", 0, 7)
            }
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              settings.demandIncreasePct === 0 && settings.replenishmentDelayDays === 7
                ? "bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-xs"
                : "bg-white hover:bg-amber-50/50 border-amber-200 shadow-2xs"
            }`}
          >
            <div>
              <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-sm">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>🚚 +7 DAY DELAY</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Scheduled replenishment arrives 7 days later due to port/supplier delay
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-700 font-bold mt-2 pt-1 border-t border-amber-100">
              Demand: Normal &bull; Delivery: +7 Days
            </div>
          </button>

          {/* Preset 3: Severe Supply Shock */}
          <button
            onClick={() =>
              handleApplyPreset("Severe Supply Shock", 40, 7)
            }
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              settings.demandIncreasePct === 40 && settings.replenishmentDelayDays === 7
                ? "bg-rose-50 border-rose-500 ring-2 ring-rose-200 shadow-xs"
                : "bg-white hover:bg-rose-50/50 border-rose-200 shadow-2xs"
            }`}
          >
            <div>
              <div className="flex items-center space-x-1.5 text-rose-900 font-extrabold text-sm">
                <Flame className="w-4 h-4 text-rose-700" />
                <span>⚠️ SEVERE SHOCK</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Compound crisis: +40% surge combined with a +7-day supplier disruption
              </p>
            </div>
            <div className="text-[11px] font-mono text-rose-700 font-bold mt-2 pt-1 border-t border-rose-100">
              Compound Crisis Shock
            </div>
          </button>
        </div>
      </div>

      {/* Sliders for Custom Adjustments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
        {/* Slider 1: Simulated Demand Increase */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Simulated Demand Increase:</span>
            <span className="font-mono font-extrabold text-purple-700 px-2 py-0.5 rounded bg-purple-100 border border-purple-200">
              +{settings.demandIncreasePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.demandIncreasePct}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                activeScenarioName: e.target.value === "0" && settings.replenishmentDelayDays === 0
                  ? null
                  : `Custom (+${e.target.value}% demand)`,
                demandIncreasePct: Number(e.target.value),
              })
            }
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0% (Normal)</span>
            <span>+50%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Slider 2: Simulated Delivery Delay */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Simulated Delivery Delay:</span>
            <span className="font-mono font-extrabold text-amber-700 px-2 py-0.5 rounded bg-amber-100 border border-amber-200">
              +{settings.replenishmentDelayDays} Days
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="1"
            value={settings.replenishmentDelayDays}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                activeScenarioName: settings.demandIncreasePct === 0 && e.target.value === "0"
                  ? null
                  : `Custom (+${e.target.value}d delay)`,
                replenishmentDelayDays: Number(e.target.value),
              })
            }
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 Days (On Schedule)</span>
            <span>+7 Days</span>
            <span>+14 Days</span>
          </div>
        </div>
      </div>

      {/* BEFORE -> AFTER IMPACT COMPARISON */}
      <div className="pt-2">
        {isSimulating ? (
          <div className="p-4 rounded-2xl bg-purple-50/60 border-2 border-purple-200 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Scenario Impact
                </span>
                <span className="text-xs font-extrabold text-purple-950">
                  {settings.activeScenarioName || "Active Stress Scenario"} &bull; {facName} ({medName})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                Dynamic Recalculation
              </span>
            </div>

            {/* Before vs After Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* BEFORE CARD */}
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    BEFORE (Baseline)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">Standard Rates</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock coverage:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{beforeCoverage} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected stockout:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{beforeStockout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily burn rate:</span>
                    <span className="font-bold text-slate-800 font-mono">{beforeBurn} {unit}/day</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Regional risk estimate:</span>
                    <span className="font-extrabold text-amber-700 font-mono">{beforeRiskPct}%</span>
                  </div>
                </div>
              </div>

              {/* AFTER CARD */}
              <div className="bg-white p-4 rounded-xl border-2 border-rose-300 shadow-2xs ring-1 ring-rose-200">
                <div className="flex items-center justify-between border-b border-rose-100 pb-1.5 mb-2">
                  <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                    AFTER ({settings.activeScenarioName || "Stress Shock"})
                  </span>
                  <span className="text-[10px] font-mono text-rose-600 font-bold">Accelerated</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock coverage:</span>
                    <span className="font-extrabold text-rose-700 font-mono text-sm bg-rose-50 px-1 rounded">
                      {afterCoverage} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected stockout:</span>
                    <span className="font-extrabold text-rose-700 font-mono">{afterStockout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily burn rate:</span>
                    <span className="font-extrabold text-purple-700 font-mono">{afterBurn} {unit}/day</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-rose-100">
                    <span className="text-slate-500">Regional risk estimate:</span>
                    <span className="font-extrabold text-rose-700 font-mono">{afterRiskPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-purple-200 text-xs shadow-2xs">
              <div className="flex items-center space-x-1.5 text-purple-900 font-extrabold uppercase tracking-wider text-[11px] mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
                <span>RECOMMENDED ACTION:</span>
              </div>
              <p className="text-purple-950 font-semibold leading-relaxed">
                {recommendedResponse}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-slate-900">Normal operating conditions:</strong> All calculations currently reflect baseline operations. Click any scenario button above to test supply chain resilience.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

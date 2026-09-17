import React from "react";
import {
  SimulationSettings,
  FacilityRiskCalculation,
  RegionalShortageRisk,
} from "../types";
import { getRegionalRiskPercent } from "../engine/shortageEngine";
import {
  Zap,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface StressTestCardProps {
  settings: SimulationSettings;
  onUpdateSettings: (newSettings: SimulationSettings) => void;
  onReset: () => void;
  selectedFacilityRisk: FacilityRiskCalculation | null;
  baselineFacilityRisk: FacilityRiskCalculation | null;
  selectedRegionalRisk: RegionalShortageRisk | null;
  baselineRegionalRisk: RegionalShortageRisk | null;
}

export const StressTestCard: React.FC<StressTestCardProps> = ({
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

  // Values before and after
  const beforeBurn = baselineFacilityRisk
    ? Math.round(baselineFacilityRisk.daily_consumption_rate)
    : 400;
  const afterBurn = selectedFacilityRisk
    ? Math.round(selectedFacilityRisk.daily_consumption_rate)
    : Math.round(beforeBurn * (1 + settings.demandIncreasePct / 100));

  const beforeCoverage = baselineFacilityRisk
    ? baselineFacilityRisk.days_of_stock_remaining
    : 12;
  const afterCoverage = selectedFacilityRisk
    ? selectedFacilityRisk.days_of_stock_remaining
    : Math.max(1, Math.round(beforeCoverage * 0.67));

  const beforeStockout = baselineFacilityRisk?.projected_stockout_date
    ? baselineFacilityRisk.projected_stockout_date.slice(5)
    : "09-24";
  const afterStockout = selectedFacilityRisk?.projected_stockout_date
    ? selectedFacilityRisk.projected_stockout_date.slice(5)
    : "09-20";

  const beforeRiskPct = getRegionalRiskPercent(baselineRegionalRisk);
  const calculatedAfterRiskPct = getRegionalRiskPercent(selectedRegionalRisk);
  const afterRiskPct = isSimulating
    ? Math.max(beforeRiskPct, calculatedAfterRiskPct)
    : beforeRiskPct;

  const beforeRisk = `${beforeRiskPct}%`;
  const afterRisk = `${afterRiskPct}%`;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Shortage Stress Test
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Simulate localized demand shocks and supply chain delays
            </p>
          </div>
        </div>

        {isSimulating && (
          <button
            onClick={onReset}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Normal</span>
          </button>
        )}
      </div>

      {/* Scenario Controls */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Simulation Presets &amp; Levers
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Demand Increase */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Demand Increase:</span>
              <span className="font-bold text-amber-600">+{settings.demandIncreasePct}%</span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 20, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() =>
                    onUpdateSettings({ ...settings, demandIncreasePct: pct })
                  }
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    settings.demandIncreasePct === pct
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Delay */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Delivery Delay:</span>
              <span className="font-bold text-rose-600">+{settings.replenishmentDelayDays} days</span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 7, 14].map((days) => (
                <button
                  key={days}
                  onClick={() =>
                    onUpdateSettings({ ...settings, replenishmentDelayDays: days })
                  }
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    settings.replenishmentDelayDays === days
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  +{days}d
                </button>
              ))}
            </div>
          </div>

          {/* Supply Shock */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Supply Shock:</span>
              <span className="font-bold text-slate-900">
                {isSimulating ? "Severe Shock" : "Normal Baseline"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleApplyPreset("Normal", 0, 0)}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  !isSimulating
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => handleApplyPreset("Severe Outbreak", 20, 7)}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  isSimulating
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Severe (+20%, +7d)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BEFORE -> AFTER Graphical Impact Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Before &rarr; After Impact Analysis (Graphical Comparison)
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {isSimulating ? "⚠️ Active Stress Simulation Running" : "Baseline State (No Shocks)"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Chart A: Daily Burn Rate */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Burn Rate</span>
              </span>
              <span className={`font-mono font-bold ${afterBurn > beforeBurn ? "text-rose-600" : "text-slate-700"}`}>
                {beforeBurn} &rarr; {afterBurn} u/day
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-0.5">
                  <span>Normal Baseline</span>
                  <span className="font-semibold">{beforeBurn} u/day</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (beforeBurn / 600) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 mb-0.5">
                  <span className="font-bold">Under Stress (+{settings.demandIncreasePct}%)</span>
                  <span className="font-bold text-rose-600">{afterBurn} u/day</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (afterBurn / 600) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart B: Stock Coverage (Days) */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Stock Coverage</span>
              </span>
              <span className={`font-mono font-bold ${afterCoverage < beforeCoverage ? "text-rose-600" : "text-emerald-600"}`}>
                {beforeCoverage}d &rarr; {afterCoverage}d
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-0.5">
                  <span>Normal Buffer</span>
                  <span className="font-semibold">{beforeCoverage} days</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (beforeCoverage / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 mb-0.5">
                  <span className="font-bold">Compressed Coverage</span>
                  <span className={`font-bold ${afterCoverage <= 7 ? "text-rose-600" : "text-amber-600"}`}>
                    {afterCoverage} days
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      afterCoverage <= 7 ? "bg-rose-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, (afterCoverage / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart C: Projected Stockout Shift */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Projected Stockout Timeline</span>
              </span>
              <span className={`font-mono font-bold ${afterStockout !== beforeStockout ? "text-rose-600" : "text-slate-700"}`}>
                {beforeStockout} &rarr; {afterStockout}
              </span>
            </div>

            {/* Timeline progress line */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Normal Date:</span>
                <span className="font-semibold text-slate-800">{beforeStockout}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-600 font-bold">Accelerated Date:</span>
                <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {afterStockout} (Shifted {settings.demandIncreasePct > 0 || settings.replenishmentDelayDays > 0 ? "earlier" : "steady"})
                </span>
              </div>
            </div>
          </div>

          {/* Chart D: Regional Shortage Risk Score */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Regional Risk Magnitude</span>
              </span>
              <span className={`font-mono font-bold ${isSimulating ? "text-rose-600" : "text-slate-700"}`}>
                {beforeRisk} &rarr; {afterRisk}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-0.5">
                  <span>Normal System Risk</span>
                  <span className="font-semibold">{beforeRisk}</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 mb-0.5">
                  <span className="font-bold">Post-Shock Risk</span>
                  <span className={`font-bold ${isSimulating ? "text-rose-600" : "text-slate-900"}`}>
                    {afterRisk}
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSimulating ? "bg-rose-600" : "bg-blue-600"
                    }`}
                    style={{ width: isSimulating ? "85%" : "35%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

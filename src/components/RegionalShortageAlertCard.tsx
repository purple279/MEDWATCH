import React from "react";
import { RegionalShortageRisk } from "../types";
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";

interface RegionalShortageAlertCardProps {
  risk: RegionalShortageRisk | null;
  onViewAlert: (risk: RegionalShortageRisk) => void;
  onExplainWithAI: (risk: RegionalShortageRisk) => void;
}

export const RegionalShortageAlertCard: React.FC<RegionalShortageAlertCardProps> = ({
  risk,
  onViewAlert,
  onExplainWithAI,
}) => {
  if (!risk) return null;

  const medicine = risk.medicine_name || "Insulin";
  const location = risk.district || "District 4";
  const affectedCount = risk.affected_count || 3;
  const minCoverageDays = risk.affected_facilities?.[0]?.days_of_stock_remaining ?? 5;
  const projectedStockout = "Sep 21";
  const scheduledDelivery = "Sep 25";
  const supplyGapDays = 4;

  return (
    <div className="bg-white rounded-xl border border-rose-200 shadow-2xs overflow-hidden">
      {/* Alert Header Band */}
      <div className="bg-rose-50/70 border-b border-rose-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Regional Shortage Alert
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-600 text-white">
                CRITICAL
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-800">
              {medicine} &bull; {location}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExplainWithAI(risk)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Explanation</span>
          </button>

          <button
            onClick={() => onViewAlert(risk)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-colors cursor-pointer"
          >
            <span>View Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alert Body */}
      <div className="p-4 space-y-3">
        {/* Core Message */}
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          Multiple facilities are showing concurrent depletion of the same medicine.
          Regional redistribution is recommended to prevent localized patient care interruptions.
        </p>

        {/* Small Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Affected Facilities
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {affectedCount}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Minimum Coverage
            </span>
            <span className="text-base font-extrabold text-rose-600 block mt-0.5">
              {minCoverageDays} days
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Projected Stockout
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {projectedStockout}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Delivery
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {scheduledDelivery}
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Supply Gap
            </span>
            <span className="text-base font-extrabold text-rose-700 block mt-0.5">
              {supplyGapDays} days
            </span>
          </div>
        </div>

        {/* Analytical Visualization: Facilities Entering Shortage */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Facilities Entering Shortage
              </h4>
              <p className="text-[11px] text-slate-500">
                Visualizing synchronized concurrent inventory collapse across District 4
              </p>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                District 4 Cluster
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Affected: 3 Facilities
              </span>
            </div>
          </div>

          {/* Concurrent Depletion Progression Bars */}
          <div className="space-y-2.5 pt-1">
            {/* Facility 1 */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>St. Jude District Hospital</span>
                </span>
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-200 text-[11px]">
                  5 days remaining &bull; Stockout Sep 21
                </span>
              </div>
              <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: "24%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Current Stock: 125 units (Burn: 25/day)</span>
                <span className="text-rose-600 font-semibold">&darr; 4-day deficit gap</span>
              </div>
            </div>

            {/* Facility 2 */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Riverbed Medical Center</span>
                </span>
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-200 text-[11px]">
                  6 days remaining &bull; Stockout Sep 22
                </span>
              </div>
              <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: "28%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Current Stock: 180 units (Burn: 30/day)</span>
                <span className="text-rose-600 font-semibold">&darr; 3-day deficit gap</span>
              </div>
            </div>

            {/* Facility 3 */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Apex Valley Hospital</span>
                </span>
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200 text-[11px]">
                  9 days remaining &bull; Stockout Sep 25
                </span>
              </div>
              <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: "42%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Current Stock: 225 units (Burn: 25/day)</span>
                <span className="text-amber-600 font-semibold">&darr; Approaching critical threshold</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

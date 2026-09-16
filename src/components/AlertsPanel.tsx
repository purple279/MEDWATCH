import React from "react";
import { FacilityRiskCalculation, RegionalShortageRisk } from "../types";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface AlertsPanelProps {
  regionalRisks: RegionalShortageRisk[];
  facilityRisks: FacilityRiskCalculation[];
  onSelectRegionalRisk: (risk: RegionalShortageRisk) => void;
  onSelectFacility: (facilityId: string, medicineId: string) => void;
  selectedFacilityId: string | null;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  regionalRisks,
  facilityRisks,
  onSelectRegionalRisk,
  onSelectFacility,
  selectedFacilityId,
}) => {
  // Extract critical facility alerts (<7 days)
  const criticalFacilities = facilityRisks.filter((r) => r.risk_level === "RED");

  // Extract early warning facility alerts (7-14 days)
  const warningFacilities = facilityRisks.filter((r) => r.risk_level === "YELLOW");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Supply Alerts</h3>
            <p className="text-[11px] text-slate-500">
              {regionalRisks.length} regional clusters &bull; {criticalFacilities.length} critical sites
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          {regionalRisks.length + criticalFacilities.length + warningFacilities.length} Active
        </span>
      </div>

      {/* Alerts Stream */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[580px] divide-y divide-slate-100">
        {/* 1. Regional Shortage Clusters (Top Priority) */}
        {regionalRisks.map((regRisk) => (
          <div
            key={regRisk.id}
            onClick={() => onSelectRegionalRisk(regRisk)}
            className="pt-2.5 first:pt-0 cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50/60 border border-rose-200 hover:border-rose-300 transition-all shadow-2xs group-hover:shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
                    Regional Shortage Risk
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                  {regRisk.confidence}% Risk Est.
                </span>
              </div>

              <div className="mt-1.5 flex items-baseline justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-900 transition-colors">
                  {regRisk.district} &mdash; {regRisk.medicine_name.split(" ")[0]}
                </h4>
                <span className="text-xs font-bold text-rose-700">
                  Within {regRisk.estimated_shortage_window_days} days
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                {regRisk.affected_count} facilities affected &bull; Avg. coverage {regRisk.average_days_remaining} days
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-rose-700 pt-1 border-t border-rose-100">
                <span>Click to inspect cluster</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}

        {/* 2. Critical Facility Warnings (<7 days) */}
        {criticalFacilities.map((crit) => {
          const isSelected = selectedFacilityId === crit.facility_id;
          return (
            <div
              key={`${crit.facility_id}-${crit.medicine_id}`}
              onClick={() => onSelectFacility(crit.facility_id, crit.medicine_id)}
              className="pt-2.5 cursor-pointer group"
            >
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-rose-50 border-rose-400 ring-2 ring-rose-200"
                    : "bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                      Critical Stock
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-700">
                    {crit.days_of_stock_remaining} days left
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 mt-1">
                  {crit.facility.name} &mdash; {crit.medicine.name.split(" ")[0]}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{crit.facility.district}</span>
                  <span>
                    Stock: {crit.current_stock} {crit.medicine.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. Early Warning Facilities (7-14 days) */}
        {warningFacilities.map((warn) => {
          const isSelected = selectedFacilityId === warn.facility_id;
          return (
            <div
              key={`${warn.facility_id}-${warn.medicine_id}`}
              onClick={() => onSelectFacility(warn.facility_id, warn.medicine_id)}
              className="pt-2.5 cursor-pointer group"
            >
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200"
                    : "bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                      Early Warning
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700">
                    {warn.days_of_stock_remaining} days left
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 mt-1">
                  {warn.facility.name} &mdash; {warn.medicine.name.split(" ")[0]}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{warn.facility.district}</span>
                  <span>Burn: {warn.daily_consumption_rate}/day</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

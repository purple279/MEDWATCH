import React from "react";
import {
  Building2,
  AlertTriangle,
  Activity,
  ArrowRightLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

interface KpiCardsProps {
  totalFacilities?: number;
  criticalStockItemsCount?: number;
  regionalRiskPercent?: number;
  regionalDistrict?: string;
  regionalMedicineName?: string;
  surplusDaysBuffer?: number;
  onCardClick?: (cardType: "facilities" | "critical" | "regional" | "surplus") => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalFacilities = 12,
  criticalStockItemsCount = 5,
  regionalRiskPercent = 78,
  regionalDistrict = "District 4",
  regionalMedicineName = "Insulin",
  surplusDaysBuffer = 18,
  onCardClick,
}) => {
  // Safeguard against NaN, undefined, or null: strictly enforce valid integer percentage
  const safeRegionalRisk =
    typeof regionalRiskPercent === "number" && !isNaN(regionalRiskPercent)
      ? Math.round(regionalRiskPercent)
      : 78;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Regional Facilities (Blue) */}
      <div
        onClick={() => onCardClick?.("facilities")}
        className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50/70 px-2 py-0.5 rounded-md">
            Active
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-500 block">
            Regional Facilities
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
            {totalFacilities}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Facilities monitored
          </p>
        </div>
      </div>

      {/* Card 2: Critical Stock Items (Red) */}
      <div
        onClick={() => onCardClick?.("critical")}
        className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            Action Req.
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-500 block">
            Critical Stock Items
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-rose-600 tracking-tight leading-tight mt-0.5">
            {criticalStockItemsCount}
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">
            Require attention
          </p>
        </div>
      </div>

      {/* Card 3: Regional Shortage Risk (Amber) */}
      <div
        onClick={() => onCardClick?.("regional")}
        className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            {regionalDistrict}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-500 block">
            Regional Shortage Risk
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-amber-600 tracking-tight leading-tight mt-0.5">
            {safeRegionalRisk}%
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            {regionalMedicineName} shortage detected
          </p>
        </div>
      </div>

      {/* Card 4: Surplus Available (Green) */}
      <div
        onClick={() => onCardClick?.("surplus")}
        className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            District 3
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-500 block">
            Surplus Available
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-600 tracking-tight leading-tight mt-0.5">
            {surplusDaysBuffer} days
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Nearby redistribution buffer
          </p>
        </div>
      </div>
    </div>
  );
};

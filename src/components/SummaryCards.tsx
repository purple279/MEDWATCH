import React from "react";
import { Building2, Pill, AlertTriangle, Network, ArrowRightLeft } from "lucide-react";

interface SummaryCardsProps {
  totalFacilities: number;
  totalMedicines: number;
  criticalFacilitiesCount: number;
  regionalRisksCount: number;
  transfersCount: number;
  onCardClick?: (type: "facilities" | "medicines" | "critical" | "regional" | "transfers") => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalFacilities,
  totalMedicines,
  criticalFacilitiesCount,
  regionalRisksCount,
  transfersCount,
  onCardClick,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Facilities Monitored */}
      <div
        onClick={() => onCardClick?.("facilities")}
        className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-slate-600 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Facilities Monitored
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalFacilities}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Across 4 health districts</p>
        </div>
      </div>

      {/* 2. Medicines Monitored */}
      <div
        onClick={() => onCardClick?.("medicines")}
        className="bg-white p-4 rounded-xl border border-blue-200/80 border-t-4 border-t-blue-500 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            Medicines Monitored
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
            <Pill className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalMedicines}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Essential formulations</p>
        </div>
      </div>

      {/* 3. Critical Facilities */}
      <div
        onClick={() => onCardClick?.("critical")}
        className={`p-4 rounded-xl border border-t-4 transition-all cursor-pointer group ${
          criticalFacilitiesCount > 0
            ? "bg-rose-50/70 border-rose-200 border-t-rose-600 hover:bg-rose-50 shadow-xs hover:shadow-sm"
            : "bg-white border-slate-200 border-t-slate-400 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              criticalFacilitiesCount > 0 ? "text-rose-800" : "text-slate-500"
            }`}
          >
            Critical Facilities
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              criticalFacilitiesCount > 0
                ? "bg-rose-100 text-rose-700 group-hover:bg-rose-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              criticalFacilitiesCount > 0 ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {criticalFacilitiesCount}
          </div>
          <p
            className={`text-xs font-semibold mt-0.5 ${
              criticalFacilitiesCount > 0 ? "text-rose-700" : "text-slate-500"
            }`}
          >
            {criticalFacilitiesCount > 0 ? "Below 7 days stock remaining" : "Zero critical stockouts"}
          </p>
        </div>
      </div>

      {/* 4. Regional Shortage Risks */}
      <div
        onClick={() => onCardClick?.("regional")}
        className={`p-4 rounded-xl border border-t-4 transition-all cursor-pointer group ${
          regionalRisksCount > 0
            ? "bg-amber-50/75 border-amber-300 border-t-amber-500 shadow-xs hover:shadow-sm"
            : "bg-white border-slate-200 border-t-slate-400 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              regionalRisksCount > 0 ? "text-amber-900" : "text-slate-500"
            }`}
          >
            Regional Shortage Risks
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              regionalRisksCount > 0
                ? "bg-amber-100 text-amber-700 group-hover:bg-amber-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Network className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              regionalRisksCount > 0 ? "text-amber-800" : "text-slate-900"
            }`}
          >
            {regionalRisksCount}
          </div>
          <p
            className={`text-xs font-semibold mt-0.5 ${
              regionalRisksCount > 0 ? "text-amber-800" : "text-slate-500"
            }`}
          >
            {regionalRisksCount > 0 ? "District 4 Insulin cluster" : "No regional clusters"}
          </p>
        </div>
      </div>

      {/* 5. Recommended Transfers */}
      <div
        onClick={() => onCardClick?.("transfers")}
        className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 border-t-4 border-t-teal-600 shadow-xs hover:shadow-sm hover:border-teal-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
            Recommended Transfers
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-100 group-hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-teal-900 tracking-tight">{transfersCount}</div>
          <p className="text-xs text-teal-700 font-semibold mt-0.5">Surplus rebalance available</p>
        </div>
      </div>
    </div>
  );
};

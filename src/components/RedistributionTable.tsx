import React, { useState } from "react";
import { RedistributionRecommendation } from "../types";
import {
  ArrowRightLeft,
  Truck,
  Check,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calculator,
  TrendingUp,
  Info,
} from "lucide-react";

interface RedistributionTableProps {
  recommendations: RedistributionRecommendation[];
  onExecuteTransfer: (recommendationId: string) => void;
  onSelectFacilityPair: (fromId: string, toId: string) => void;
}

export const RedistributionTable: React.FC<RedistributionTableProps> = ({
  recommendations,
  onExecuteTransfer,
  onSelectFacilityPair,
}) => {
  const [expandedCalcs, setExpandedCalcs] = useState<Set<string>>(new Set());

  const toggleCalc = (id: string) => {
    setExpandedCalcs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Redistribution &amp; Surplus Rebalancing Engine
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              We identified nearby surplus inventory to resolve critical stockouts without risking donor safety.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
          {recommendations.length} Actionable Transfer Proposals
        </div>
      </div>

      {/* Visual Transfer Summary Cards (Above Table) */}
      {recommendations.length > 0 && (
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50/40 via-white to-emerald-50/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-teal-900 uppercase tracking-wider">
              Active Surplus Rebalance Solution
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Algorithmic safety constraint: Donor must retain &ge; 14 days of reserve stock
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isDispatched = rec.status === "DISPATCHED" || rec.status === "CONFIRMED";
              return (
                <div
                  key={`card-${rec.id}`}
                  className="p-4 rounded-2xl bg-white border-2 border-teal-300 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white">
                        {rec.priority} Priority
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {rec.medicine_name} &bull; {rec.distance_km} km transit distance
                      </span>
                    </div>

                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Coverage Extended: +{rec.days_extended} Days
                    </div>
                  </div>

                  {/* Visual 3-part corridor: SURPLUS DONOR -> TRANSFER -> CRITICAL RECEIVER */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                    {/* 1. SURPLUS DONOR */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 md:col-span-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          🟢 SURPLUS DONOR
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                          Surplus Available
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                        {rec.from_facility_name}
                      </h4>
                      <div className="mt-2 text-xs text-slate-700 space-y-0.5 font-medium">
                        <div>
                          Donor buffer after transfer: <strong className="text-emerald-800 font-mono">{rec.donor_post_transfer_days} days</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Safely retains &ge;14 days of reserve stock
                        </div>
                      </div>
                    </div>

                    {/* 2. TRANSFER ACTION */}
                    <div className="flex flex-col items-center justify-center text-center p-2 md:col-span-1">
                      <div className="w-full flex items-center justify-center">
                        <div className="h-1 w-full bg-teal-500 relative hidden md:block">
                          <div className="absolute right-0 -top-1 border-solid border-l-teal-600 border-l-6 border-y-transparent border-y-4 border-r-0"></div>
                        </div>
                      </div>
                      <div className="my-2 bg-teal-600 text-white px-3 py-1.5 rounded-xl shadow-xs text-center w-full">
                        <div className="text-[9px] font-extrabold uppercase tracking-wider">TRANSFER</div>
                        <div className="text-sm font-extrabold font-mono">{rec.transfer_units} UNITS</div>
                      </div>
                      {isDispatched ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Dispatched</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onExecuteTransfer(rec.id)}
                          className="w-full inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      )}
                    </div>

                    {/* 3. CRITICAL RECEIVER */}
                    <div className="p-3.5 rounded-xl bg-rose-50/80 border-2 border-rose-300 md:col-span-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                          🔴 CRITICAL RECEIVER
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 animate-pulse">
                          Critical Stockout Risk
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                        {rec.to_facility_name}
                      </h4>
                      <div className="mt-2 text-xs text-slate-700 space-y-0.5 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <span>Coverage improvement:</span>
                          <span className="font-extrabold text-rose-700 font-mono line-through">{rec.current_days_receiving}d</span>
                          <span>&rarr;</span>
                          <span className="font-extrabold text-emerald-700 font-mono text-sm bg-emerald-100 px-1.5 py-0.5 rounded">
                            {rec.post_transfer_days_receiving} days
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          +{rec.days_extended} days gained (Bridges past scheduled delivery!)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations Table */}
      {recommendations.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No critical facilities currently require stock transfers, or no nearby surplus buffers were found within 50km.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">From (Surplus Donor)</th>
                <th className="py-3 px-4">To (Critical Facility)</th>
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Transfer Units</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Coverage Impact</th>
                <th className="py-3 px-4">Operational Rationale</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recommendations.map((rec) => {
                const isDispatched = rec.status === "DISPATCHED" || rec.status === "CONFIRMED";
                const isCalcExpanded = expandedCalcs.has(rec.id);
                const calc = rec.calculation_details;

                const priorityBadge =
                  rec.priority === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : rec.priority === "HIGH"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-blue-100 text-blue-800 border-blue-200";

                return (
                  <React.Fragment key={rec.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDispatched ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${priorityBadge}`}
                        >
                          {rec.priority}
                        </span>
                      </td>

                      {/* From Donor */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{rec.from_facility_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-3.5">
                          Donor buffer after transfer: {rec.donor_post_transfer_days}d (&ge;14d safe)
                        </div>
                      </td>

                      {/* To Receiver */}
                      <td className="py-3.5 px-4 font-semibold text-rose-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <span>{rec.to_facility_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-3.5">
                          Currently: {rec.current_days_receiving} days
                        </div>
                      </td>

                      {/* Medicine */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {rec.medicine_name.split(" ")[0]}
                      </td>

                      {/* Transfer Units */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="font-mono text-sm px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                          {rec.transfer_units} units
                        </span>
                      </td>

                      {/* Distance */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono">
                        {rec.distance_km} km
                      </td>

                      {/* Impact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{rec.days_extended} days</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {rec.current_days_receiving}d &rarr; {rec.post_transfer_days_receiving}d coverage
                        </div>
                      </td>

                      {/* Operational Rationale */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs leading-tight">
                        <p>{rec.operational_rationale || rec.reason}</p>
                        <button
                          onClick={() => toggleCalc(rec.id)}
                          className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>{isCalcExpanded ? "Hide calculation" : "View calculation"}</span>
                          {isCalcExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isDispatched ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Dispatched</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onExecuteTransfer(rec.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Calculation Details Panel */}
                    {isCalcExpanded && calc && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="bg-white rounded-xl border border-teal-200 p-3.5 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                                <Calculator className="w-3.5 h-3.5 text-teal-600" />
                                <span>Algorithmic Rebalancing Math &bull; {rec.from_facility_name} &rarr; {rec.to_facility_name}</span>
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                Safety Threshold Constraint: &ge; {calc.min_donor_safety_days} Days
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-[11px]">
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 block text-[10px]">Donor stock:</span>
                                <span className="font-bold text-slate-900 font-mono">{calc.donor_stock} units</span>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 block text-[10px]">Donor consumption:</span>
                                <span className="font-bold text-slate-900 font-mono">{calc.donor_daily_consumption} units/day</span>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 block text-[10px]">Minimum donor safety:</span>
                                <span className="font-bold text-teal-700 font-mono">{calc.min_donor_safety_days} days</span>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 block text-[10px]">Safe donor stock:</span>
                                <span className="font-bold text-slate-900 font-mono">{calc.safe_donor_stock} units</span>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 block text-[10px]">Maximum transferable:</span>
                                <span className="font-bold text-slate-900 font-mono">{calc.max_transferable_units} units</span>
                              </div>

                              <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                                <span className="text-teal-700 block text-[10px] font-semibold">Recommended transfer:</span>
                                <span className="font-extrabold text-teal-900 font-mono">{calc.recommended_transfer} units</span>
                              </div>

                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                <span className="text-emerald-700 block text-[10px] font-semibold">Receiver coverage:</span>
                                <span className="font-extrabold text-emerald-900 font-mono">
                                  {calc.receiver_before_days} &rarr; {calc.receiver_after_days} days
                                </span>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-500 italic pt-0.5">
                              Audit Verification: Donor retains {calc.donor_after_days} days of stock buffer (exceeds {calc.min_donor_safety_days}-day safety threshold). Receiver gained +{calc.coverage_extension} days of runway.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

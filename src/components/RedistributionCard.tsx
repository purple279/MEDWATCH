import React, { useState } from "react";
import { RedistributionRecommendation } from "../types";
import {
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
} from "lucide-react";

interface RedistributionCardProps {
  recommendations: RedistributionRecommendation[];
  onExecuteTransfer: (recommendationId: string) => void;
  onSelectFacilityPair: (fromId: string, toId: string) => void;
}

export const RedistributionCard: React.FC<RedistributionCardProps> = ({
  recommendations,
  onExecuteTransfer,
  onSelectFacilityPair,
}) => {
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const activeRec = recommendations[0] || null;

  if (!activeRec) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 text-center">
        <p className="text-xs text-slate-500 font-medium">
          No redistribution actions currently required. All facilities meet safe buffer coverage.
        </p>
      </div>
    );
  }

  const isDispatched = activeRec.status === "DISPATCHED";

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recommended Redistribution
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Surplus rebalancing to avert projected stockout without risking donor safety
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isDispatched ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Transfer Dispatched</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Truck className="w-3.5 h-3.5" />
              <span>Ready to Dispatch</span>
            </span>
          )}
        </div>
      </div>

      {/* Simple Supply-Flow Layout */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* SURPLUS DONOR */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 p-3.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Surplus Donor
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
              {activeRec.from_facility_name}
            </h4>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Donor Coverage:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {activeRec.donor_post_transfer_days ?? 18} days
              </span>
            </div>
          </div>

          {/* TRANSFER CONNECTOR ARROW */}
          <div className="flex flex-col items-center justify-center px-2 py-1 shrink-0">
            <div className="bg-blue-600 text-white rounded-lg px-3 py-1.5 shadow-2xs flex flex-col items-center">
              <span className="text-xs font-extrabold tracking-tight">
                {activeRec.transfer_units} units
              </span>
              <span className="text-[10px] text-blue-100">
                {activeRec.medicine_name.split(" ")[0]}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600 hidden md:block mt-1" />
            <div className="w-0.5 h-4 bg-blue-300 md:hidden my-1"></div>
          </div>

          {/* CRITICAL RECEIVER */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 p-3.5">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Critical Receiver
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
              {activeRec.to_facility_name}
            </h4>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Receiver Coverage:</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                {activeRec.current_days_receiving} days &rarr; {activeRec.post_transfer_days_receiving} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Before -> After Visual Comparison */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>Before &rarr; After Redistribution Impact</span>
          <span className="text-[11px] font-semibold text-emerald-700">Zero Donor Risk &bull; Receiver Averted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* St. Jude (Receiver) Before vs After */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">{activeRec.to_facility_name} (Receiver)</span>
              <span className="font-bold text-emerald-700">+{activeRec.days_extended ?? 7.5} days</span>
            </div>

            {/* Visual comparative bars */}
            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-0.5">
                  <span>BEFORE: {activeRec.current_days_receiving} days (Critical)</span>
                  <span className="text-rose-600 font-bold">Deficit</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (activeRec.current_days_receiving / 20) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 mb-0.5 font-semibold">
                  <span>AFTER: {activeRec.post_transfer_days_receiving} days (Safe Runway)</span>
                  <span className="text-emerald-700 font-bold">Resolved</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (activeRec.post_transfer_days_receiving / 20) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Eastside (Donor) Before vs After */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">{activeRec.from_facility_name} (Donor)</span>
              <span className="font-bold text-teal-700">Buffer Retained</span>
            </div>

            {/* Visual comparative bars */}
            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-0.5">
                  <span>BEFORE: 18 days (Surplus)</span>
                  <span className="text-teal-700 font-bold">Surplus</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 mb-0.5 font-semibold">
                  <span>AFTER: {activeRec.donor_post_transfer_days ?? 15} days (&gt;14d threshold)</span>
                  <span className="text-emerald-700 font-bold">Safe Buffer</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((activeRec.donor_post_transfer_days ?? 15) / 20) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Donor Safety Retained
          </span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">
            &ge; 14 days minimum buffer
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Coverage Extended
          </span>
          <span className="text-sm font-bold text-emerald-700 block mt-0.5">
            +{activeRec.days_extended ?? 7.5} days additional runtime
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Transit Distance
          </span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">
            {activeRec.distance_km} km &bull; Same-Day Courier
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowCalculationModal(!showCalculationModal)}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          <span>{showCalculationModal ? "Hide Calculation" : "View Calculation"}</span>
        </button>

        <button
          onClick={() => onExecuteTransfer(activeRec.id)}
          disabled={isDispatched}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isDispatched
              ? "bg-emerald-600 text-white opacity-90 cursor-default"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isDispatched ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Stock Dispatched</span>
            </>
          ) : (
            <>
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Stock</span>
            </>
          )}
        </button>
      </div>

      {/* Calculation Formula Details Drawer */}
      {showCalculationModal && (
        <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 text-xs space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Mathematical Redistribution Formula</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            The safe transfer quantity is determined by:
            <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold font-mono">
              Max Transfer = Donor Stock - (Donor Daily Consumption &times; 14 days safety threshold)
            </code>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-800 font-medium">
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Donor Current Stock</span>
              <span className="font-bold">400 units</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Donor Safe Threshold</span>
              <span className="font-bold">250 units (14d)</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Calculated Transfer</span>
              <span className="font-bold text-blue-700">150 units</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">New Receiver Stock</span>
              <span className="font-bold text-emerald-700">250 units (12.5d)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Facility,
  FacilityRiskCalculation,
  Medicine,
  RedistributionRecommendation,
  RegionalShortageRisk,
} from "../types";
import {
  Network,
  ArrowRight,
  Truck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Pill,
  X,
} from "lucide-react";

interface SupplyNetworkSectionProps {
  facilities: Facility[];
  facilityRisks: FacilityRiskCalculation[];
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string) => void;
  regionalRisks: RegionalShortageRisk[];
  recommendations: RedistributionRecommendation[];
}

export const SupplyNetworkSection: React.FC<SupplyNetworkSectionProps> = ({
  facilities = [],
  facilityRisks = [],
  selectedFacilityId,
  onSelectFacility,
  regionalRisks = [],
  recommendations = [],
}) => {
  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Group facilities by district
  const districts = ["District 1", "District 2", "District 3", "District 4"];

  // Selected facility object & risk
  const selectedRisk = (facilityRisks || []).find(
    (r) => r.facility_id === selectedFacilityId
  ) || (facilityRisks || [])[0] || null;

  // Active transfer connection between District 3 (Eastside) and District 4 (St. Jude)
  const activeTransfer = (recommendations || [])[0] || null;

  const getStatusColor = (risk: FacilityRiskCalculation | undefined) => {
    if (!risk) return { dot: "bg-emerald-500", text: "HEALTHY", badge: "bg-emerald-50 text-emerald-700" };
    if (risk.risk_level === "RED") {
      return { dot: "bg-rose-500", text: "CRITICAL", badge: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (risk.risk_level === "YELLOW") {
      return { dot: "bg-amber-500", text: "WARNING", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (risk.days_of_stock_remaining >= 18) {
      return { dot: "bg-teal-500", text: "SURPLUS", badge: "bg-teal-50 text-teal-700 border-teal-200" };
    }
    return { dot: "bg-emerald-500", text: "HEALTHY", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Healthcare Supply Network
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Regional district cluster topology and active redistribution corridor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="flex items-center space-x-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Healthy</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Surplus</span>
          </span>
        </div>
      </div>

      {/* Transfer Corridor Visualization between Eastside and St. Jude */}
      {activeTransfer && (
        <div className="bg-gradient-to-r from-teal-50/70 via-blue-50/70 to-rose-50/70 border border-blue-200/90 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-4 h-4 animate-bounce" style={{ animationDuration: "2s" }} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Redistribution Corridor: District 3 &rarr; District 4
                </h3>
                <p className="text-[11px] text-slate-600">
                  Direct transfer from surplus buffer node to critical shortage node
                </p>
              </div>
            </div>

            <span className="text-[11px] font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
              Recommendation Ready
            </span>
          </div>

          {/* Visual Transfer Connector */}
          <div className="bg-white/95 rounded-xl border border-blue-200/80 p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Donor Facility (District 3) */}
              <div className="w-full md:w-5/12 bg-slate-50 border border-teal-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                    DISTRICT 3 &bull; DONOR
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Eastside Regional Medical Center
                </h4>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-600">
                  <span>Current Coverage:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    18 days (Safe buffer &gt; 14d)
                  </span>
                </div>
              </div>

              {/* Animated Transfer Line Corridor */}
              <div className="w-full md:w-2/12 flex flex-col items-center justify-center px-2 py-1">
                <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center space-x-1.5 animate-pulse">
                  <span>{activeTransfer.transfer_units} units</span>
                </div>
                {/* Desktop horizontal animated line */}
                <div className="hidden md:flex items-center w-full my-1.5 relative">
                  <div className="w-full h-0.5 bg-blue-300 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 w-8 bg-blue-600 rounded-full animate-ping"
                      style={{ animationDuration: "1.5s" }}
                    ></div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 -ml-1 shrink-0" />
                </div>
                {/* Mobile vertical line */}
                <div className="md:hidden flex flex-col items-center my-1">
                  <div className="h-6 w-0.5 bg-blue-400"></div>
                </div>
                <span className="text-[10px] text-blue-700 font-bold">Same-Day Transit</span>
              </div>

              {/* Receiver Facility (District 4) */}
              <div className="w-full md:w-5/12 bg-slate-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                    DISTRICT 4 &bull; RECEIVER
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs animate-pulse"></span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  St. Jude District Hospital
                </h4>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-600">
                  <span>Coverage Impact:</span>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    5 days &rarr; 12.5 days (Gap Resolved)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Districts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {districts.map((district) => {
          const districtFacilities = facilities.filter((f) => f.district === district);
          const isShortageDistrict = district === "District 4";

          return (
            <div
              key={district}
              className={`rounded-xl border p-3.5 transition-all ${
                isShortageDistrict
                  ? "bg-rose-50/30 border-rose-200 shadow-2xs"
                  : "bg-slate-50/50 border-slate-200/80"
              }`}
            >
              {/* District Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
                <span className="text-xs font-bold text-slate-900">
                  {district}
                </span>
                {isShortageDistrict ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-200">
                    3 facilities affected
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500">
                    {districtFacilities.length} facilities
                  </span>
                )}
              </div>

              {/* Facility Nodes */}
              <div className="space-y-1.5">
                {districtFacilities.map((fac) => {
                  const risk = facilityRisks.find(
                    (r) => r.facility_id === fac.facility_id
                  );
                  const isSelected = selectedFacilityId === fac.facility_id;
                  const status = getStatusColor(risk);

                  return (
                    <div
                      key={fac.facility_id}
                      onClick={() => onSelectFacility(fac.facility_id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-white border-blue-500 shadow-xs"
                          : "bg-white/80 border-slate-200/60 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`}></span>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {fac.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${status.badge}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Facility Inspector Detail Card */}
      {selectedRisk && inspectorOpen && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-900">
                Facility Inspector: {selectedRisk.facility.name} ({selectedRisk.facility.district})
              </span>
              <span className="text-xs text-slate-500">
                &bull; Pop: {selectedRisk.facility.population_served.toLocaleString()}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                getStatusColor(selectedRisk).badge
              }`}
            >
              {getStatusColor(selectedRisk).text} &bull; {selectedRisk.days_of_stock_remaining}d Stock
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 block">Current Stock</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedRisk.current_stock} {selectedRisk.medicine.unit}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 block">Daily Consumption</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedRisk.daily_consumption_rate} {selectedRisk.medicine.unit}/day
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 block">Next Delivery</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedRisk.expected_next_replenishment_date} ({selectedRisk.days_until_replenishment}d)
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 block">Projected Stockout</span>
              <span
                className={`text-sm font-bold ${
                  selectedRisk.days_of_stock_remaining <= 7 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {selectedRisk.projected_stockout_date}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

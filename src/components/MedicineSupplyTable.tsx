import React, { useState } from "react";
import { FacilityRiskCalculation, Medicine } from "../types";
import {
  MoreVertical,
  Pill,
  Filter,
  Eye,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";

interface MedicineSupplyTableProps {
  facilityRisks: FacilityRiskCalculation[];
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string, medicineId: string) => void;
  onDispatchClick?: (facilityId: string) => void;
  searchQuery?: string;
}

export const MedicineSupplyTable: React.FC<MedicineSupplyTableProps> = ({
  facilityRisks,
  selectedFacilityId,
  onSelectFacility,
  onDispatchClick,
  searchQuery = "",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter rows based on search query and category
  const filteredRows = facilityRisks.filter((risk) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      risk.medicine.name.toLowerCase().includes(q) ||
      risk.facility.name.toLowerCase().includes(q) ||
      risk.facility.district.toLowerCase().includes(q);

    const matchCategory =
      selectedCategory === "ALL" || risk.medicine.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  // Sort rows: CRITICAL first, then WARNING, then HEALTHY/SURPLUS
  const sortedRows = [...filteredRows].sort((a, b) => {
    const riskRank = { RED: 0, YELLOW: 1, GREEN: 2 };
    const rA = riskRank[a.risk_level];
    const rB = riskRank[b.risk_level];
    if (rA !== rB) return rA - rB;
    return a.days_of_stock_remaining - b.days_of_stock_remaining;
  });

  const getStatusBadge = (risk: FacilityRiskCalculation) => {
    if (risk.risk_level === "RED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
          CRITICAL
        </span>
      );
    }
    if (risk.risk_level === "YELLOW") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          WARNING
        </span>
      );
    }
    if (risk.days_of_stock_remaining >= 20) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
          SURPLUS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        HEALTHY
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Medicine Supply Status
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Active stock coverage across facilities
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center space-x-1">
          {["ALL", "Critical", "Chronic"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Medicine</th>
              <th className="px-3 py-2.5">District</th>
              <th className="px-3 py-2.5">Stock Coverage</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No medicine stock records match your query.
                </td>
              </tr>
            ) : (
              sortedRows.slice(0, 8).map((risk) => {
                const isSelected = selectedFacilityId === risk.facility_id;
                const rowKey = `${risk.facility_id}-${risk.medicine_id}`;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onSelectFacility(risk.facility_id, risk.medicine_id)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {/* Medicine & Facility */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            risk.risk_level === "RED"
                              ? "bg-rose-50 text-rose-600"
                              : risk.risk_level === "YELLOW"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {risk.medicine.name.split(" ")[0]}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {risk.facility.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                      {risk.facility.district}
                    </td>

                    {/* Stock Coverage */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-bold ${
                            risk.days_of_stock_remaining <= 7
                              ? "text-rose-600"
                              : risk.days_of_stock_remaining <= 14
                              ? "text-amber-600"
                              : "text-slate-800"
                          }`}
                        >
                          {risk.days_of_stock_remaining} days
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({risk.current_stock} {risk.medicine.unit})
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {getStatusBadge(risk)}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === rowKey ? null : rowKey);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === rowKey && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 text-xs font-medium"
                          >
                            <button
                              onClick={() => {
                                onSelectFacility(risk.facility_id, risk.medicine_id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>Inspect Facility</span>
                            </button>
                            {risk.risk_level === "RED" && onDispatchClick && (
                              <button
                                onClick={() => {
                                  onDispatchClick(risk.facility_id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                                <span>Rebalance Stock</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>Showing {Math.min(8, sortedRows.length)} of {sortedRows.length} facilities</span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
          Click any row to inspect timeline
        </span>
      </div>
    </div>
  );
};

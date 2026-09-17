import React from "react";
import { FacilityRiskCalculation } from "../types";
import { ShieldAlert, CheckCircle2, AlertTriangle, Building2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

interface StockCoverageChartProps {
  facilityRisks: FacilityRiskCalculation[];
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

export const StockCoverageChart: React.FC<StockCoverageChartProps> = ({
  facilityRisks = [],
  selectedFacilityId,
  onSelectFacility,
}) => {
  // Sort facilities: critical first, then warning, then healthy
  const safeRisks = facilityRisks || [];
  const sortedRisks = [...safeRisks].sort(
    (a, b) => a.days_of_stock_remaining - b.days_of_stock_remaining
  );

  const chartData = sortedRisks.map((risk) => {
    const days = risk.days_of_stock_remaining;
    let status: "CRITICAL" | "WARNING" | "HEALTHY" = "HEALTHY";
    let color = "#10b981"; // green

    if (days < 7) {
      status = "CRITICAL";
      color = "#e11d48"; // red
    } else if (days <= 14) {
      status = "WARNING";
      color = "#f59e0b"; // amber
    }

    // Short name for crisp X-axis display
    const shortName = risk.facility.name
      .replace("District Hospital", "DH")
      .replace("Medical Center", "MC")
      .replace("Hospital", "Hosp");

    return {
      facilityId: risk.facility_id,
      fullName: risk.facility.name,
      shortName,
      district: risk.facility.district,
      days,
      currentStock: risk.current_stock,
      dailyBurn: risk.daily_consumption_rate,
      unit: risk.medicine.unit,
      status,
      color,
      isSelected: risk.facility_id === selectedFacilityId,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Stock Coverage by Facility
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Runway in days before complete stockout across monitored facilities
            </p>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Critical (&lt; 7d)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning (7–14d)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Healthy (&gt; 14d)</span>
          </span>
        </div>
      </div>

      {/* Bar Chart Viewport */}
      <div className="w-full" style={{ height: "240px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const facId = state.activePayload[0].payload.facilityId;
                if (onSelectFacility && facId) {
                  onSelectFacility(facId);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortName"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              domain={[0, "auto"]}
              label={{
                value: "Days of Stock",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />

            {/* Critical Threshold Line (7 days) */}
            <ReferenceLine
              y={7}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Critical: 7 Days",
                position: "right",
                fill: "#e11d48",
                fontSize: 9,
                fontWeight: 700,
              }}
            />

            {/* Warning Threshold Line (14 days) */}
            <ReferenceLine
              y={14}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Buffer: 14 Days",
                position: "right",
                fill: "#d97706",
                fontSize: 9,
                fontWeight: 700,
              }}
            />

            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1.5">
                      <div className="font-bold border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
                        <span>{d.fullName}</span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                            d.status === "CRITICAL"
                              ? "bg-rose-500 text-white"
                              : d.status === "WARNING"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        District: <span className="font-bold text-white">{d.district}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Stock Runway:</span>
                        <span className="font-bold text-white font-mono">{d.days} days</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Current Stock:</span>
                        <span className="font-bold text-white font-mono">{d.currentStock} {d.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Daily Burn:</span>
                        <span className="font-bold text-white font-mono">{d.dailyBurn} {d.unit}/day</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="days" radius={[5, 5, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.isSelected ? "#1e293b" : "none"}
                  strokeWidth={entry.isSelected ? 2 : 0}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Facility Quick Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100">
        {sortedRisks.slice(0, 4).map((risk) => {
          const isSelected = risk.facility_id === selectedFacilityId;
          const isCrit = risk.days_of_stock_remaining < 7;
          const isWarn = risk.days_of_stock_remaining >= 7 && risk.days_of_stock_remaining <= 14;

          return (
            <button
              key={risk.facility_id}
              onClick={() => onSelectFacility && onSelectFacility(risk.facility_id)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50 shadow-2xs"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {risk.facility.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span
                  className={`text-xs font-extrabold ${
                    isCrit ? "text-rose-600" : isWarn ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {risk.days_of_stock_remaining}d coverage
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {risk.current_stock}u
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

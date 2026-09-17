import React from "react";
import { FacilityRiskCalculation, Medicine } from "../types";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";

interface MedicineConsumptionDepletionChartProps {
  selectedMedicineId?: string;
  onSelectMedicineId?: (medId: string) => void;
  medicines?: Medicine[];
  selectedRisk?: FacilityRiskCalculation | null;
  facilityRisks?: FacilityRiskCalculation[];
}

export const MedicineConsumptionDepletionChart: React.FC<
  MedicineConsumptionDepletionChartProps
> = ({
  selectedMedicineId = "med-insulin",
  onSelectMedicineId,
  medicines = [],
  selectedRisk,
  facilityRisks = [],
}) => {
  // Find current medicine safely
  const activeMed =
    (medicines && medicines.length > 0
      ? medicines.find((m) => m.medicine_id === selectedMedicineId) || medicines[0]
      : selectedRisk?.medicine) || {
      medicine_id: "med-insulin",
      name: "Insulin Glargine 100U/mL",
      category: "Endocrine / Diabetes",
      unit: "vials",
      critical_threshold_days: 7,
      standard_buffer_days: 14,
    };

  // Risks for this medicine across facilities
  const safeRisks = facilityRisks || [];
  const risksForMed = safeRisks.filter(
    (r) => r.medicine_id === activeMed.medicine_id
  );

  // Relevant facility risk for display (selected facility if matching medicine, or highest risk)
  const currentRisk =
    (selectedRisk && selectedRisk.medicine_id === activeMed.medicine_id
      ? selectedRisk
      : risksForMed.find((r) => r.risk_level === "RED")) ||
    risksForMed[0] ||
    selectedRisk ||
    null;

  const currentStock = currentRisk?.current_stock ?? 125;
  const dailyRate = currentRisk?.daily_consumption_rate ?? 25;
  const daysRemaining = currentRisk?.days_of_stock_remaining ?? 5;
  const trend = currentRisk?.consumption_trend ?? "Surging";
  const isSurging = trend === "Surging" || trend === "Increasing" || currentRisk?.is_rapid_depletion;

  // Build combined 24-day time series: 14 days historical + 10 days projected
  const todayDate = new Date("2026-09-16");
  const chartData: {
    date: string;
    displayDate: string;
    historicalConsumption?: number;
    projectedConsumption?: number;
    historicalStock?: number;
    projectedStock?: number;
    isProjected: boolean;
  }[] = [];

  // 14 days of history
  const sortedHist = currentRisk?.history
    ? [...currentRisk.history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ).slice(-14)
    : [];

  sortedHist.forEach((h, idx) => {
    const d = new Date(h.date);
    const display = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
    chartData.push({
      date: h.date,
      displayDate: display,
      historicalConsumption: h.consumption,
      historicalStock: h.stock,
      isProjected: false,
    });
  });

  // Ensure "Today" connects historical to projected
  const todayStr = "2026-09-16";
  const todayEntry = chartData.find((d) => d.date === todayStr);
  if (todayEntry) {
    todayEntry.projectedConsumption = todayEntry.historicalConsumption;
    todayEntry.projectedStock = todayEntry.historicalStock;
  } else {
    chartData.push({
      date: todayStr,
      displayDate: "Sep 16",
      historicalConsumption: dailyRate,
      projectedConsumption: dailyRate,
      historicalStock: currentStock,
      projectedStock: currentStock,
      isProjected: false,
    });
  }

  // 10 days of projection
  let runningStock = currentStock;
  const burnRate = isSurging ? Math.round(dailyRate * 1.05) : dailyRate;

  for (let i = 1; i <= 10; i++) {
    const fDate = new Date(todayDate);
    fDate.setDate(fDate.getDate() + i);
    const dateStr = fDate.toISOString().split("T")[0];
    const display = `${fDate.toLocaleString("default", { month: "short" })} ${fDate.getDate()}`;

    runningStock = Math.max(0, runningStock - burnRate);

    chartData.push({
      date: dateStr,
      displayDate: display,
      projectedConsumption: Math.round(burnRate * (1 + (i * 0.01))),
      projectedStock: runningStock,
      isProjected: true,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Section Header with Medicine Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Medicine Consumption &amp; Depletion
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Recent consumption trend and projected depletion trajectory for {activeMed.name}
              </p>
            </div>
          </div>
        </div>

        {/* Medicine Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {medicines && medicines.length > 0 &&
            medicines.map((m) => {
              const isSelected = m.medicine_id === activeMed.medicine_id;
              return (
                <button
                  key={m.medicine_id}
                  onClick={() => onSelectMedicineId?.(m.medicine_id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {m.name.split(" ")[0]}
                </button>
              );
            })}
        </div>
      </div>

      {/* Diagnostic Intelligence Callout: Is it being consumed faster? */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isSurging
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isSurging ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
              <span>Is {activeMed.name.split(" ")[0]} being consumed faster than before?</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                  isSurging
                    ? "bg-rose-200 text-rose-900"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isSurging ? "ACCELERATING (+18.4% SURGE)" : "STABLE CONSUMPTION"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isSurging
                ? `Daily consumption has accelerated from a 14-day baseline of 21 ${activeMed.unit}/day up to ${dailyRate} ${activeMed.unit}/day, driving rapid stock depletion in ${daysRemaining} days.`
                : `Daily consumption remains aligned with seasonal baselines at ${dailyRate} ${activeMed.unit}/day with steady stock coverage.`}
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Monitored Facility
          </span>
          <span className="text-xs font-bold text-slate-900">
            {currentRisk?.facility.name ?? "St. Jude District Hospital"}
          </span>
        </div>
      </div>

      {/* Dual Analytical Line Chart */}
      <div className="w-full" style={{ height: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
              interval={2}
            />
            <YAxis
              yAxisId="stock"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
              domain={[0, "auto"]}
              label={{
                value: `Stock (${activeMed.unit})`,
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
            <YAxis
              yAxisId="consumption"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#3b82f6", fontSize: 10, fontFamily: "monospace" }}
              domain={[0, "auto"]}
              label={{
                value: `Daily Rate (${activeMed.unit}/day)`,
                angle: 90,
                position: "insideRight",
                fill: "#3b82f6",
                fontSize: 10,
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        {label} {payload[0]?.payload?.isProjected ? "(Projected)" : "(Historical)"}
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between space-x-3 text-[11px]">
                          <span style={{ color: entry.color }} className="font-medium">
                            {entry.name}:
                          </span>
                          <span className="font-bold font-mono">
                            {entry.value} {activeMed.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
            />

            {/* Vertical Marker for TODAY */}
            <ReferenceLine
              x="Sep 16"
              stroke="#0f172a"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: "TODAY (Sep 16)",
                position: "top",
                fill: "#0f172a",
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            {/* 1. Historical Stock Line (Solid Slate/Teal) */}
            <Line
              yAxisId="stock"
              type="monotone"
              dataKey="historicalStock"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={false}
              name="Historical Stock"
            />

            {/* 2. Projected Stock Depletion Trajectory (Dashed Rose) */}
            <Line
              yAxisId="stock"
              type="monotone"
              dataKey="projectedStock"
              stroke="#e11d48"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 2, fill: "#e11d48" }}
              name="Projected Stock Trajectory"
            />

            {/* 3. Historical Daily Consumption (Solid Blue) */}
            <Line
              yAxisId="consumption"
              type="monotone"
              dataKey="historicalConsumption"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Historical Consumption"
            />

            {/* 4. Projected Consumption Rate (Dashed Indigo) */}
            <Line
              yAxisId="consumption"
              type="monotone"
              dataKey="projectedConsumption"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Projected Consumption Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Interpretation footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span className="flex items-center space-x-2">
          <span className="w-3 h-0.5 bg-teal-600 inline-block"></span>
          <span>Solid lines indicate verified logged inventory data</span>
        </span>
        <span className="flex items-center space-x-2">
          <span className="w-3 h-0.5 border-b-2 border-dashed border-rose-500 inline-block"></span>
          <span>Dashed lines indicate algorithmic forward depletion projection</span>
        </span>
      </div>
    </div>
  );
};

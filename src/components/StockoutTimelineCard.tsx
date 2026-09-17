import React from "react";
import { FacilityRiskCalculation } from "../types";
import {
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  BarChart2,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from "recharts";

interface StockoutTimelineCardProps {
  selectedRisk: FacilityRiskCalculation | null;
}

export const StockoutTimelineCard: React.FC<StockoutTimelineCardProps> = ({
  selectedRisk,
}) => {
  const coverageDays = selectedRisk?.days_of_stock_remaining ?? 5;
  const leadTimeDays = selectedRisk?.days_until_replenishment ?? 9;
  const supplyGap = selectedRisk?.replenishment_gap_days ?? 4;
  const currentStock = selectedRisk?.current_stock ?? 125;
  const dailyRate = selectedRisk?.daily_consumption_rate ?? 25;
  const unit = selectedRisk?.medicine.unit ?? "vials";
  const medName = selectedRisk?.medicine.name.split(" ")[0] ?? "Insulin";
  const facName = selectedRisk?.facility.name ?? "St. Jude District Hospital";

  const stockoutDate = selectedRisk?.projected_stockout_date ?? "2026-09-21";
  const deliveryDate = selectedRisk?.expected_next_replenishment_date ?? "2026-09-25";

  // Critical and Warning unit thresholds
  const criticalUnits = Math.round(dailyRate * 7);
  const warningUnits = Math.round(dailyRate * 14);

  // Build complete date-based trajectory points:
  // Historical (Sep 08 to Sep 16) -> Projected decline (Sep 17 to Sep 21) ->
  // Gap (Sep 21 to Sep 25) -> Delivery & Recovery jump (Sep 25) -> Safe operations (Sep 26-28)
  const trajectoryData: {
    date: string;
    displayDate: string;
    stock: number;
    historicalStock?: number;
    projectedStock?: number;
    isGap: boolean;
    note?: string;
  }[] = [];

  // 1. Historical days (Sep 08 to Sep 15)
  for (let i = 8; i >= 1; i--) {
    const d = new Date("2026-09-16");
    d.setDate(d.getDate() - i);
    const dayNum = d.getDate();
    const display = `Sep ${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const hStock = currentStock + i * dailyRate;
    trajectoryData.push({
      date: d.toISOString().split("T")[0],
      displayDate: display,
      stock: hStock,
      historicalStock: hStock,
      isGap: false,
    });
  }

  // 2. TODAY (Sep 16)
  trajectoryData.push({
    date: "2026-09-16",
    displayDate: "Sep 16",
    stock: currentStock,
    historicalStock: currentStock,
    projectedStock: currentStock,
    isGap: false,
    note: "TODAY",
  });

  // 3. Projected decline towards stockout (Sep 17 to Sep 21)
  const stockoutDayIndex = Math.min(5, Math.ceil(coverageDays));
  for (let i = 1; i <= stockoutDayIndex; i++) {
    const d = new Date("2026-09-16");
    d.setDate(d.getDate() + i);
    const dayNum = d.getDate();
    const display = `Sep ${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const remaining = Math.max(0, currentStock - i * dailyRate);
    trajectoryData.push({
      date: d.toISOString().split("T")[0],
      displayDate: display,
      stock: remaining,
      projectedStock: remaining,
      isGap: remaining === 0,
      note: remaining === 0 ? "STOCKOUT" : undefined,
    });
  }

  // 4. Supply Gap Period until Delivery (e.g. Sep 22, 23, 24)
  const deliveryDayOffset = leadTimeDays;
  for (let i = stockoutDayIndex + 1; i < deliveryDayOffset; i++) {
    const d = new Date("2026-09-16");
    d.setDate(d.getDate() + i);
    const dayNum = d.getDate();
    const display = `Sep ${dayNum < 10 ? "0" + dayNum : dayNum}`;
    trajectoryData.push({
      date: d.toISOString().split("T")[0],
      displayDate: display,
      stock: 0,
      projectedStock: 0,
      isGap: true,
      note: "SUPPLY GAP",
    });
  }

  // 5. DELIVERY DAY & STOCK RECOVERY (Sep 25)
  const replenishBatchUnits = Math.round(dailyRate * 20); // 20 days batch replenishment
  trajectoryData.push({
    date: deliveryDate,
    displayDate: "Sep 25",
    stock: replenishBatchUnits,
    projectedStock: replenishBatchUnits,
    isGap: false,
    note: "DELIVERY & RECOVERY",
  });

  // 6. Post-recovery days (Sep 26-28)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(deliveryDate);
    d.setDate(d.getDate() + i);
    const dayNum = d.getDate();
    const display = `Sep ${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const postStock = replenishBatchUnits - i * dailyRate;
    trajectoryData.push({
      date: d.toISOString().split("T")[0],
      displayDate: display,
      stock: postStock,
      projectedStock: postStock,
      isGap: false,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Stockout vs Replenishment
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Lead-time vulnerability and supply gap timeline for {facName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {supplyGap} Day Deficit Window
          </span>
        </div>
      </div>

      {/* 1. SIMPLE TIMELINE (AT THE TOP) */}
      <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5">
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Milestone 1: TODAY */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white">
              1
            </div>
            <span className="text-xs font-bold text-slate-900 mt-2">TODAY</span>
            <span className="text-[11px] font-semibold text-slate-500">Sep 16</span>
            <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 mt-1">
              {currentStock} {unit}
            </span>
          </div>

          {/* Line & Arrow from 1 to 2 */}
          <div className="hidden sm:flex flex-1 items-center justify-center px-2">
            <div className="h-0.5 w-full bg-slate-300 relative">
              <div className="absolute right-0 -top-1 border-solid border-l-slate-400 border-l-8 border-y-transparent border-y-4 border-r-0"></div>
            </div>
          </div>

          {/* Milestone 2: STOCKOUT */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white">
              2
            </div>
            <span className="text-xs font-bold text-rose-700 mt-2">STOCKOUT</span>
            <span className="text-[11px] font-semibold text-rose-600">Sep 21</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1">
              0 {unit} Left
            </span>
          </div>

          {/* Highlighted 4 DAY SUPPLY GAP Connector */}
          <div className="w-full sm:w-auto flex-1 flex flex-col items-center px-2 py-1">
            <div className="w-full h-8 sm:h-auto bg-rose-100/90 border-2 border-rose-400 rounded-lg px-3 py-1.5 flex items-center justify-center space-x-1.5 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span className="text-xs font-black text-rose-800 uppercase tracking-wide whitespace-nowrap">
                {supplyGap} DAY SUPPLY GAP
              </span>
            </div>
            <span className="text-[10px] text-rose-700 font-bold hidden sm:block mt-0.5">
              Uncovered patient care window
            </span>
          </div>

          {/* Milestone 3: DELIVERY */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white">
              3
            </div>
            <span className="text-xs font-bold text-slate-900 mt-2">DELIVERY</span>
            <span className="text-[11px] font-semibold text-slate-500">Sep 25</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 font-semibold">
              +{replenishBatchUnits} {unit}
            </span>
          </div>
        </div>
      </div>

      {/* 2. REAL ANALYTICAL CHART: PROJECTED STOCK LEVEL (DIRECTLY BELOW TIMELINE) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Projected Stock Level
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Historical inventory, projected decline, 4-day stockout gap, and delivery recovery
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center space-x-1.5 font-semibold text-slate-700">
              <span className="w-3 h-0.5 bg-teal-600 rounded"></span>
              <span>Historical Stock</span>
            </span>
            <span className="flex items-center space-x-1.5 font-semibold text-rose-600">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-rose-600"></span>
              <span>Projected Decline</span>
            </span>
            <span className="flex items-center space-x-1.5 font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <span className="w-2 h-2 rounded bg-rose-500"></span>
              <span>Supply Gap (0 units)</span>
            </span>
            <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
              <span className="w-3 h-0.5 bg-emerald-600 rounded"></span>
              <span>Delivery Recovery</span>
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trajectoryData}
              margin={{ top: 25, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
                domain={[0, "auto"]}
                label={{
                  value: `Stock Level (${unit})`,
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />

              {/* 4-Day Supply Gap Shaded Zone */}
              <ReferenceArea
                x1="Sep 21"
                x2="Sep 25"
                y1={0}
                y2={warningUnits}
                {...({
                  fill: "#fee2e2",
                  fillOpacity: 0.45,
                  stroke: "#fca5a5",
                  strokeDasharray: "3 3",
                } as any)}
              />

              {/* Warning Threshold Line (14 days) */}
              <ReferenceLine
                y={warningUnits}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                label={{
                  value: `14d Warning (${warningUnits} ${unit})`,
                  position: "right",
                  fill: "#d97706",
                  fontSize: 9,
                  fontWeight: 600,
                }}
              />

              {/* Critical Threshold Line (7 days) */}
              <ReferenceLine
                y={criticalUnits}
                stroke="#e11d48"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                label={{
                  value: `7d Critical (${criticalUnits} ${unit})`,
                  position: "right",
                  fill: "#e11d48",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />

              {/* Vertical Milestone Marker 1: TODAY */}
              <ReferenceLine
                x="Sep 16"
                stroke="#0f172a"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: "TODAY (Sep 16)",
                  position: "top",
                  fill: "#0f172a",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              />

              {/* Vertical Milestone Marker 2: STOCKOUT */}
              <ReferenceLine
                x="Sep 21"
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: "STOCKOUT (Sep 21)",
                  position: "top",
                  fill: "#be123c",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              />

              {/* Vertical Milestone Marker 3: DELIVERY */}
              <ReferenceLine
                x="Sep 25"
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: "DELIVERY (Sep 25)",
                  position: "top",
                  fill: "#047857",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                          {label} {d.note ? `— ${d.note}` : ""}
                        </div>
                        <div className="flex items-center justify-between space-x-3 text-[11px]">
                          <span className="text-slate-400">Stock Available:</span>
                          <span
                            className={`font-bold font-mono ${
                              d.stock === 0 ? "text-rose-400" : "text-white"
                            }`}
                          >
                            {d.stock} {unit}
                          </span>
                        </div>
                        {d.isGap && (
                          <div className="text-[10px] text-rose-300 font-semibold pt-0.5">
                            ⚠️ In 4-day supply gap window (0 stock)
                          </div>
                        )}
                        {label === "Sep 25" && (
                          <div className="text-[10px] text-emerald-300 font-semibold pt-0.5">
                            📦 Replenishment shipment arrived (+{replenishBatchUnits} {unit})
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Historical Stock Line */}
              <Line
                type="monotone"
                dataKey="historicalStock"
                stroke="#0d9488"
                strokeWidth={3}
                dot={false}
                name="Historical Stock"
              />

              {/* Projected Stock Line (Decline + Gap + Delivery Recovery Jump) */}
              <Line
                type="monotone"
                dataKey="projectedStock"
                stroke="#e11d48"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#e11d48" }}
                name="Projected Stock"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Informative Visual Guide Below Chart */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="font-semibold">
              Current Stock ({currentStock} {unit}) &rarr; STOCKOUT on Sep 21 &rarr; 4-DAY SUPPLY GAP &rarr; DELIVERY on Sep 25 &rarr; STOCK RECOVERY (+{replenishBatchUnits} {unit})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Redistribution from Eastside Regional (150 units) closes this 4-day gap before Sep 21.
          </span>
        </div>
      </div>
    </div>
  );
};

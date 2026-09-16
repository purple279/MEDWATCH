import React, { useState } from "react";
import { FacilityRiskCalculation } from "../types";
import {
  TrendingDown,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Package,
  ArrowRight,
} from "lucide-react";

interface StockTrendChartProps {
  selectedRisk: FacilityRiskCalculation | null;
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${months[mIdx]} ${parseInt(parts[2], 10)}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({ selectedRisk }) => {
  const [showHowToRead, setShowHowToRead] = useState(false);

  if (!selectedRisk) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <p className="text-sm text-slate-500 font-medium">
          Select a facility on the map or alerts list to inspect its stockout vs replenishment timeline.
        </p>
      </div>
    );
  }

  const {
    facility,
    medicine,
    current_stock,
    daily_consumption_rate,
    days_of_stock_remaining,
    history,
    expected_next_replenishment_date,
    days_until_replenishment,
    replenishment_gap_days,
    projected_stockout_date,
    risk_level,
  } = selectedRisk;

  const willStockoutBeforeReplenish = replenishment_gap_days > 0;

  // Build combined series: Historical + Projected future points
  const sortedHist = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Take the past 21 days for clean, readable historical baseline
  const recentHist = sortedHist.slice(-21);

  // Future days must encompass both replenishment date and stockout date + small padding
  const maxFutureDays = Math.max(
    14,
    Math.ceil(Math.max(days_until_replenishment, days_of_stock_remaining)) + 4
  );

  const today = new Date("2026-09-16");
  const projectedPoints: { date: string; stock: number; isProjected: boolean }[] = [];

  for (let d = 1; d <= maxFutureDays; d++) {
    const fDate = new Date(today);
    fDate.setDate(fDate.getDate() + d);
    const dateStr = fDate.toISOString().split("T")[0];

    // Depletes at daily_consumption_rate, floored at 0
    const projectedStock = Math.max(0, Math.round(current_stock - d * daily_consumption_rate));
    projectedPoints.push({
      date: dateStr,
      stock: projectedStock,
      isProjected: true,
    });
  }

  // Combine historical and projected points
  const allPoints = [
    ...recentHist.map((h) => ({ date: h.date, stock: h.stock, isProjected: false })),
    ...projectedPoints,
  ];

  const maxStock = Math.max(...allPoints.map((p) => p.stock), 100);

  // Chart dimensions
  const width = 860;
  const height = 310;
  const paddingLeft = 55;
  const paddingRight = 45;
  const paddingTop = 45;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const scaleX = (index: number) => {
    return paddingLeft + (index / (allPoints.length - 1)) * chartWidth;
  };

  const scaleY = (val: number) => {
    return height - paddingBottom - (val / (maxStock * 1.15)) * chartHeight;
  };

  const todayIndex = recentHist.length - 1;
  const todayX = scaleX(todayIndex);
  const todayY = scaleY(current_stock);

  // Critical and warning threshold stock values
  const criticalStockUnits = Math.round(daily_consumption_rate * 7);
  const warningStockUnits = Math.round(daily_consumption_rate * 14);

  const criticalY = scaleY(criticalStockUnits);
  const warningY = scaleY(warningStockUnits);
  const zeroY = scaleY(0);

  // Milestone X positions
  // Stockout index (when stock reaches zero)
  const stockoutDays = Math.max(0, days_of_stock_remaining);
  const stockoutIndex = Math.min(
    allPoints.length - 1,
    todayIndex + Math.max(1, Math.round(stockoutDays))
  );
  const stockoutX = scaleX(stockoutIndex);

  // Replenishment index
  const replenishIndex = Math.min(
    allPoints.length - 1,
    todayIndex + Math.max(1, Math.round(days_until_replenishment))
  );
  const replenishX = scaleX(replenishIndex);

  // SVG Paths
  const histPathPoints = recentHist.map((p, idx) => `${scaleX(idx)},${scaleY(p.stock)}`);
  const histPathD = `M ${histPathPoints.join(" L ")}`;

  const projPathPoints = [
    `${todayX},${todayY}`,
    ...projectedPoints.map((p, idx) => `${scaleX(todayIndex + 1 + idx)},${scaleY(p.stock)}`),
  ];
  const projPathD = `M ${projPathPoints.join(" L ")}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* 1. Header & Timeline Stepper */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Stockout vs Replenishment Timeline
              </h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  risk_level === "RED"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : risk_level === "YELLOW"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {facility.name} &bull; {days_of_stock_remaining} Days Remaining
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              When will the medicine run out compared with the next scheduled delivery?
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {medicine.name} &bull; Current stock: <strong className="text-slate-700">{current_stock} {medicine.unit}</strong> &bull; Daily consumption: <strong className="text-slate-700">{daily_consumption_rate} {medicine.unit}/day</strong>
            </p>
          </div>

          {/* Stepper overview: Historical -> Today -> Projected Stockout -> Next Replenishment */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
            <span className="text-teal-700">1. Historical Stock</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-extrabold">2. TODAY</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-rose-700">3. Projected Stockout</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-700">4. Next Replenishment</span>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT VISUAL TIMELINE SUMMARY (ABOVE DETAILED GRAPH) */}
      <div className="px-5 pt-4">
        <div className={`p-4 rounded-2xl border-2 shadow-xs ${
          willStockoutBeforeReplenish
            ? "bg-rose-50/80 border-rose-300"
            : "bg-emerald-50/80 border-emerald-300"
        }`}>
          {/* Main takeaway title */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 mb-3 border-rose-200/80">
            <div className="flex items-center space-x-2">
              {willStockoutBeforeReplenish ? (
                <>
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">!</span>
                  <span className="text-sm font-extrabold text-rose-900 tracking-tight">
                    CRITICAL WARNING: Medicine will run out BEFORE scheduled delivery
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-extrabold text-emerald-900 tracking-tight">
                    SAFE TIMELINE: Scheduled delivery arrives before medicine runs out
                  </span>
                </>
              )}
            </div>
            {willStockoutBeforeReplenish && (
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                {replenishment_gap_days} Days Uncovered Stockout
              </span>
            )}
          </div>

          {/* 3-Step Visual Timeline: TODAY -> STOCKOUT -> DELIVERY */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            {/* Step 1: TODAY */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Step 1 &bull; Baseline
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              </div>
              <div className="mt-1">
                <div className="text-xs font-bold text-slate-500">TODAY</div>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {formatDate("2026-09-16")}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">
                  Current Stock: <strong className="text-slate-900">{current_stock} {medicine.unit}</strong>
                </div>
              </div>
            </div>

            {/* Connector 1: Stock remaining */}
            <div className="flex flex-col items-center justify-center text-center px-1 md:col-span-1">
              <span className="text-[11px] font-extrabold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {days_of_stock_remaining} days
              </span>
              <div className="w-full flex items-center justify-center my-1">
                <div className="h-0.5 w-full bg-slate-300 relative">
                  <div className="absolute right-0 -top-1 border-solid border-l-slate-400 border-l-6 border-y-transparent border-y-4 border-r-0"></div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">burn @ {daily_consumption_rate}/day</span>
            </div>

            {/* Step 2: STOCKOUT */}
            <div className={`p-3.5 rounded-xl border shadow-2xs md:col-span-1 ${
              willStockoutBeforeReplenish
                ? "bg-white border-rose-300 ring-2 ring-rose-200"
                : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                  Step 2 &bull; Depletion
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              </div>
              <div className="mt-1">
                <div className="text-xs font-bold text-rose-700">🔴 STOCKOUT</div>
                <div className="text-base font-extrabold text-rose-800 font-mono">
                  {formatDate(projected_stockout_date)}
                </div>
                <div className="text-[11px] text-rose-700 mt-1 font-semibold">
                  Zero Stock (0 {medicine.unit})
                </div>
              </div>
            </div>

            {/* Connector 2: Supply Gap */}
            <div className="flex flex-col items-center justify-center text-center px-1 md:col-span-1">
              {willStockoutBeforeReplenish ? (
                <>
                  <span className="text-[11px] font-extrabold text-rose-900 bg-rose-200 px-2 py-0.5 rounded-md border border-rose-300 animate-pulse">
                    ⚠️ {replenishment_gap_days} DAYS WITHOUT STOCK
                  </span>
                  <div className="w-full flex items-center justify-center my-1">
                    <div className="h-1 w-full bg-rose-400 relative">
                      <div className="absolute right-0 -top-1 border-solid border-l-rose-600 border-l-6 border-y-transparent border-y-4 border-r-0"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700">Supply Gap Window</span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    Safe buffer
                  </span>
                  <div className="w-full flex items-center justify-center my-1">
                    <div className="h-0.5 w-full bg-emerald-400 relative">
                      <div className="absolute right-0 -top-1 border-solid border-l-emerald-600 border-l-6 border-y-transparent border-y-4 border-r-0"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700">No stockout gap</span>
                </>
              )}
            </div>

            {/* Step 3: DELIVERY */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  Step 3 &bull; Replenishment
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              </div>
              <div className="mt-1">
                <div className="text-xs font-bold text-blue-700">📦 DELIVERY</div>
                <div className="text-base font-extrabold text-blue-800 font-mono">
                  {formatDate(expected_next_replenishment_date)}
                </div>
                <div className="text-[11px] text-blue-600 mt-1 font-medium">
                  In {days_until_replenishment} days
                </div>
              </div>
            </div>
          </div>

          {/* Impact note */}
          <div className="mt-3 pt-2 border-t border-rose-200/70 flex flex-wrap items-center justify-between text-xs text-rose-950 font-medium">
            <span>
              {willStockoutBeforeReplenish
                ? `Without redistribution, ${facility.name} will be completely out of ${medicine.name.split(" ")[0]} for ${replenishment_gap_days} full days.`
                : `Current supply of ${medicine.name.split(" ")[0]} will safely last until the next delivery arrives on ${formatDate(expected_next_replenishment_date)}.`}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Historical &amp; projected time-series details plotted below ↓
            </span>
          </div>
        </div>
      </div>

      {/* 3. SIMPLIFIED INTERACTIVE SVG TIMELINE CHART */}
      <div className="px-5 py-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: "270px" }}
        >
          {/* Background grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
            const val = Math.round(maxStock * 1.15 * tick);
            const y = scaleY(val);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Warning Threshold line (14 days) */}
          <line
            x1={paddingLeft}
            y1={warningY}
            x2={width - paddingRight}
            y2={warningY}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text
            x={width - paddingRight + 4}
            y={warningY + 3}
            fill="#d97706"
            fontSize="9"
            fontWeight="600"
          >
            14d Warning
          </text>

          {/* Critical Threshold line (7 days) */}
          <line
            x1={paddingLeft}
            y1={criticalY}
            x2={width - paddingRight}
            y2={criticalY}
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.75"
          />
          <text
            x={width - paddingRight + 4}
            y={criticalY + 3}
            fill="#e11d48"
            fontSize="9"
            fontWeight="700"
          >
            7d Critical
          </text>

          {/* Historical Stock Line */}
          <path d={histPathD} fill="none" stroke="#0d9488" strokeWidth="3" />

          {/* Projected Depletion Line (Dashed) */}
          <path
            d={projPathD}
            fill="none"
            stroke={willStockoutBeforeReplenish ? "#e11d48" : "#d97706"}
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          {/* Highlight Supply Gap Zone if Stockout precedes Replenishment */}
          {willStockoutBeforeReplenish && stockoutX < replenishX && (
            <g>
              <rect
                x={stockoutX}
                y={zeroY - 32}
                width={Math.max(8, replenishX - stockoutX)}
                height={32}
                fill="#ffe4e6"
                opacity="0.85"
                rx="4"
              />
              <line
                x1={stockoutX}
                y1={zeroY}
                x2={replenishX}
                y2={zeroY}
                stroke="#e11d48"
                strokeWidth="3"
              />
              <text
                x={(stockoutX + replenishX) / 2}
                y={zeroY - 14}
                textAnchor="middle"
                fill="#be123c"
                fontSize="9"
                fontWeight="800"
              >
                {replenishment_gap_days}-DAY SUPPLY GAP
              </text>
            </g>
          )}

          {/* Milestone 1: TODAY Marker */}
          <g>
            <line
              x1={todayX}
              y1={paddingTop - 15}
              x2={todayX}
              y2={height - paddingBottom}
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect
              x={todayX - 32}
              y={paddingTop - 25}
              width="64"
              height="18"
              rx="4"
              fill="#0f172a"
            />
            <text
              x={todayX}
              y={paddingTop - 13}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              letterSpacing="0.5"
            >
              TODAY
            </text>
            <circle cx={todayX} cy={todayY} r="6" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Milestone 2: PROJECTED STOCKOUT Marker */}
          <g>
            <line
              x1={stockoutX}
              y1={paddingTop + 5}
              x2={stockoutX}
              y2={zeroY}
              stroke="#e11d48"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect
              x={stockoutX - 60}
              y={zeroY + 12}
              width="120"
              height="28"
              rx="5"
              fill="#fff1f2"
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <text
              x={stockoutX}
              y={zeroY + 24}
              textAnchor="middle"
              fill="#9f1239"
              fontSize="9"
              fontWeight="800"
            >
              PROJECTED STOCKOUT
            </text>
            <text
              x={stockoutX}
              y={zeroY + 36}
              textAnchor="middle"
              fill="#e11d48"
              fontSize="9"
              fontWeight="700"
              fontFamily="monospace"
            >
              {formatDate(projected_stockout_date)}
            </text>
            <circle cx={stockoutX} cy={zeroY} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Milestone 3: NEXT REPLENISHMENT / NEXT DELIVERY Marker */}
          <g>
            <line
              x1={replenishX}
              y1={paddingTop - 25}
              x2={replenishX}
              y2={zeroY}
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect
              x={replenishX - 52}
              y={paddingTop - 35}
              width="104"
              height="26"
              rx="5"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="1.2"
            />
            <text
              x={replenishX}
              y={paddingTop - 22}
              textAnchor="middle"
              fill="#1e40af"
              fontSize="9"
              fontWeight="800"
            >
              NEXT DELIVERY
            </text>
            <text
              x={replenishX}
              y={paddingTop - 11}
              textAnchor="middle"
              fill="#2563eb"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              {formatDate(expected_next_replenishment_date)}
            </text>
            <circle cx={replenishX} cy={zeroY} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* 4. COMPACT "HOW TO READ THIS GRAPH" EXPLANATION (CHANGE 3) */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setShowHowToRead(!showHowToRead)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>How to read this graph</span>
            {showHowToRead ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Quick inline legend for instant scanning */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-1 bg-teal-600 rounded"></span>
              <span>Historical stock</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-rose-600"></span>
              <span>Projected depletion</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>Stockout</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        {showHowToRead && (
          <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 shadow-2xs">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <strong className="text-teal-700 block">Green/solid line</strong>
              <span>Historical stock logged daily</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <strong className="text-rose-700 block">Dashed line</strong>
              <span>Projected future depletion rate</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <strong className="text-slate-900 block">Today</strong>
              <span>Current inventory position</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <strong className="text-rose-700 block">Stockout</strong>
              <span>Projected zero inventory</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <strong className="text-blue-700 block">Delivery</strong>
              <span>Next scheduled replenishment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { RegionalShortageRisk } from "../types";
import { getRegionalRiskPercent } from "../engine/shortageEngine";
import { TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface RegionalRiskTrendChartProps {
  regionalRisk: RegionalShortageRisk | null;
  isSimulating?: boolean;
}

export const RegionalRiskTrendChart: React.FC<RegionalRiskTrendChartProps> = ({
  regionalRisk,
  isSimulating = false,
}) => {
  // Current regional shortage risk percentage (canonical single source of truth)
  const currentRiskScore = getRegionalRiskPercent(regionalRisk);

  // 5-day evolution of Regional Shortage Risk leading up to today
  // Day 1 (Sep 12) -> Day 2 (Sep 13) -> Day 3 (Sep 14) -> Day 4 (Sep 15) -> Day 5 (Sep 16 - Today)
  const riskTrendData = [
    { day: "Day 1 (Sep 12)", date: "Sep 12", riskPct: 32, note: "Initial anomaly detection" },
    { day: "Day 2 (Sep 13)", date: "Sep 13", riskPct: 41, note: "Accelerating outpatient consumption" },
    { day: "Day 3 (Sep 14)", date: "Sep 14", riskPct: 55, note: "District 4 threshold breach" },
    { day: "Day 4 (Sep 15)", date: "Sep 15", riskPct: 68, note: "Multi-facility synchronization" },
    {
      day: "Day 5 (Sep 16)",
      date: "Sep 16",
      riskPct: currentRiskScore,
      note: "Current Regional Shortage Risk",
      isToday: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Regional Shortage Risk Trend
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Multi-facility concurrent stockout probability trajectory across District 4
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
            Regional Shortage Risk: {currentRiskScore}%
          </span>
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="w-full" style={{ height: "230px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={riskTrendData}
            margin={{ top: 15, right: 25, left: -15, bottom: 5 }}
          >
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              domain={[0, 100]}
              unit="%"
              label={{ value: "Risk %", angle: -90, position: "insideLeft", offset: 12, fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
            />

            {/* Threshold Lines */}
            <ReferenceLine
              y={70}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.2}
              label={{
                value: "High Risk Threshold (70%)",
                position: "insideTopRight",
                fill: "#e11d48",
                fontSize: 9,
                fontWeight: 700,
              }}
            />

            <ReferenceLine
              y={40}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.2}
              label={{
                value: "Moderate Alert (40%)",
                position: "insideTopRight",
                fill: "#d97706",
                fontSize: 9,
                fontWeight: 600,
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        {d.day}
                      </div>
                      <div className="flex items-center justify-between space-x-3 text-[11px]">
                        <span className="text-indigo-300">Regional Shortage Risk:</span>
                        <span className="font-bold font-mono text-white text-sm">
                          {d.riskPct}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        {d.note}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="riskPct"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#riskGradient)"
              dot={{ r: 4, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#4338ca" }}
              name="Risk Percentage"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Breakdown Footer */}
      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center">
        {riskTrendData.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg border text-xs ${
              item.isToday
                ? "bg-indigo-50 border-indigo-200 font-bold"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <span className="text-[10px] text-slate-500 block">{item.date}</span>
            <span
              className={`text-xs font-mono font-bold block mt-0.5 ${
                item.riskPct >= 70
                  ? "text-rose-600"
                  : item.riskPct >= 40
                  ? "text-amber-600"
                  : "text-slate-700"
              }`}
            >
              {item.riskPct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

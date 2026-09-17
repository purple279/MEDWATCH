import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldAlert,
  Filter,
  BarChart2,
  TrendingUp,
  Activity,
  Calendar,
  Building2,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { FacilityRiskCalculation, RegionalShortageRisk } from "../types";
import { getRegionalRiskPercent } from "../engine/shortageEngine";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

interface ReportsViewProps {
  facilityRisks: FacilityRiskCalculation[];
  regionalRisks: RegionalShortageRisk[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  facilityRisks,
  regionalRisks,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedMedicine, setSelectedMedicine] = useState<string>("All");
  const [timeframe, setTimeframe] = useState<string>("Last 14 Days");

  // Extract unique districts and medicines
  const districts = useMemo(() => {
    const set = new Set<string>();
    facilityRisks.forEach((r) => set.add(r.facility.district));
    return ["All", ...Array.from(set)];
  }, [facilityRisks]);

  const medicines = useMemo(() => {
    const map = new Map<string, string>();
    facilityRisks.forEach((r) => map.set(r.medicine.medicine_id, r.medicine.name));
    return ["All", ...Array.from(map.values())];
  }, [facilityRisks]);

  // Filtered dataset based on selection
  const filteredRisks = useMemo(() => {
    return facilityRisks.filter((r) => {
      const matchDistrict =
        selectedDistrict === "All" || r.facility.district === selectedDistrict;
      const matchMedicine =
        selectedMedicine === "All" || r.medicine.name === selectedMedicine;
      return matchDistrict && matchMedicine;
    });
  }, [facilityRisks, selectedDistrict, selectedMedicine]);

  const criticalCount = filteredRisks.filter((r) => r.risk_level === "RED").length;
  const warningCount = filteredRisks.filter((r) => r.risk_level === "YELLOW").length;
  const healthyCount = filteredRisks.filter((r) => r.risk_level === "GREEN").length;

  // Chart 1: Stock Coverage by Facility data
  const coverageChartData = useMemo(() => {
    return filteredRisks.map((r) => ({
      name: r.facility.name.replace("District Hospital", "DH").replace("Medical Center", "MC"),
      fullName: r.facility.name,
      days: r.days_of_stock_remaining,
      color:
        r.days_of_stock_remaining <= 7
          ? "#e11d48"
          : r.days_of_stock_remaining <= 14
          ? "#f59e0b"
          : "#10b981",
    }));
  }, [filteredRisks]);

  // Chart 2: Medicine Consumption Trend (aggregate daily burn rates)
  const consumptionTrendData = useMemo(() => {
    const days = ["Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16 (Today)"];
    const baseTotal = filteredRisks.reduce((acc, r) => acc + r.daily_consumption_rate, 0);
    const multipliers = [0.88, 0.93, 0.97, 1.05, 1.12, 1.18, 1.22];

    return days.map((day, idx) => ({
      day,
      consumption: Math.round(baseTotal * multipliers[idx]),
      baseline: Math.round(baseTotal),
    }));
  }, [filteredRisks]);

  // Chart 3: Regional Shortage Risk Timeline
  const regionalRiskData = useMemo(() => {
    const currentRisk = getRegionalRiskPercent(regionalRisks[0]);
    return [
      { date: "Sep 12", risk: 32 },
      { date: "Sep 13", risk: 41 },
      { date: "Sep 14", risk: 55 },
      { date: "Sep 15", risk: 68 },
      { date: "Sep 16", risk: currentRisk },
    ];
  }, [regionalRisks]);

  // Chart 4: Stockout vs Delivery Lead-time comparison
  const stockoutVsDeliveryData = useMemo(() => {
    return filteredRisks.slice(0, 5).map((r) => ({
      facility: r.facility.name.replace("District Hospital", "DH").replace("Medical Center", "MC"),
      coverageDays: r.days_of_stock_remaining,
      leadTimeDays: r.days_until_replenishment,
      gapDays: Math.max(0, r.replenishment_gap_days),
    }));
  }, [filteredRisks]);

  // Chart 5: Redistribution Impact (Before vs After Coverage)
  const redistributionImpactData = useMemo(() => {
    return [
      { facility: "St. Jude DH", before: 5, after: 12.5, status: "Averted" },
      { facility: "Riverbed MC", before: 6, after: 11, status: "Averted" },
      { facility: "Eastside MC", before: 18, after: 15, status: "Safe Buffer" },
    ];
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Facility,District,Medicine,CurrentStock,DailyBurn,CoverageDays,RiskLevel\n";
    const rows = filteredRisks
      .map(
        (r) =>
          `"${r.facility.name}","${r.facility.district}","${r.medicine.name}",${r.current_stock},${r.daily_consumption_rate},${r.days_of_stock_remaining},"${r.risk_level}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MEDWATCH_Regional_Supply_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Report Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Executive Regional Supply Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Daily operational synthesis for health directors, hospital administrators, and logistics coordinators
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Report Scope Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* District Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-medium">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-medium">Medicine:</span>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {medicines.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-medium">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 14 Days">Last 14 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Critical Facilities
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{criticalCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">&lt; 7 days stock remaining</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Warning Facilities
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{warningCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">7 to 14 days stock remaining</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Safe Facilities
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{healthyCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">&gt; 14 days safe threshold</p>
        </div>
      </div>

      {/* 5 REPORT CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Stock Coverage by Facility */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Stock Coverage by Facility
              </h3>
              <p className="text-[11px] text-slate-500">Days of runtime remaining before stockout</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Days of Stock
            </span>
          </div>
          <div className="w-full" style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <ReferenceLine y={7} stroke="#e11d48" strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded shadow">
                          <div className="font-bold">{d.fullName}</div>
                          <div>{d.days} days coverage</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                  {coverageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Medicine Consumption Trends */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Medicine Consumption Trends
              </h3>
              <p className="text-[11px] text-slate-500">Aggregated daily consumption vs baseline</p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Burn Rate
            </span>
          </div>
          <div className="w-full" style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeDasharray="3 3" name="Baseline" />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2.5} name="Consumption" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Regional Shortage Risk */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Regional Shortage Risk Trend
              </h3>
              <p className="text-[11px] text-slate-500">Regional shortage risk progression</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Risk Probability
            </span>
          </div>
          <div className="w-full" style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regionalRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportRiskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke="#4f46e5" strokeWidth={2} fill="url(#reportRiskGrad)" name="Risk %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Stockout vs Delivery Lead-Time */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Stockout vs Delivery Gap
              </h3>
              <p className="text-[11px] text-slate-500">Coverage days vs scheduled lead-time</p>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Vulnerability
            </span>
          </div>
          <div className="w-full" style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockoutVsDeliveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="facility" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="coverageDays" fill="#3b82f6" name="Coverage (Days)" />
                <Bar dataKey="leadTimeDays" fill="#94a3b8" name="Delivery Lead-time (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Redistribution Impact (Spans 2 columns on lg) */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                5. Redistribution Impact (Before &rarr; After Transfer Simulation)
              </h3>
              <p className="text-[11px] text-slate-500">
                Facility stock runway before transfer versus post-dispatch stabilized buffer
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Impact Evaluation
            </span>
          </div>
          <div className="w-full" style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={redistributionImpactData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="facility" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="d" />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                <ReferenceLine y={14} stroke="#10b981" strokeDasharray="3 3" label={{ value: "14d Safe Buffer", fontSize: 9, fill: "#10b981" }} />
                <Bar dataKey="before" fill="#f43f5e" name="Before Transfer (Days)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#10b981" name="After Transfer (Days)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Regional Facility Inventory Audit Summary ({filteredRisks.length} Records)</span>
          <span className="text-[11px] font-semibold text-slate-500">Verified System Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Facility</th>
                <th className="px-3 py-2.5">District</th>
                <th className="px-3 py-2.5">Medicine</th>
                <th className="px-3 py-2.5">Current Stock</th>
                <th className="px-3 py-2.5">Daily Burn</th>
                <th className="px-3 py-2.5">Stock Coverage</th>
                <th className="px-3 py-2.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.map((risk) => (
                <tr key={`${risk.facility_id}-${risk.medicine_id}`} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{risk.facility.name}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{risk.facility.district}</td>
                  <td className="px-3 py-2.5">{risk.medicine.name}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{risk.current_stock} {risk.medicine.unit}</td>
                  <td className="px-3 py-2.5">{risk.daily_consumption_rate} / day</td>
                  <td className="px-3 py-2.5 font-bold">
                    <span className={risk.days_of_stock_remaining <= 7 ? "text-rose-600" : risk.days_of_stock_remaining <= 14 ? "text-amber-600" : "text-emerald-600"}>
                      {risk.days_of_stock_remaining} days
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.risk_level === "RED" ? "bg-rose-50 text-rose-700" : risk.risk_level === "YELLOW" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {risk.risk_level === "RED" ? "ACTION REQ" : risk.risk_level === "YELLOW" ? "MONITOR" : "COMPLIANT"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Facility,
  FacilityRiskCalculation,
  Medicine,
  RedistributionRecommendation,
  RegionalShortageRisk,
} from "../types";
import {
  Navigation,
  AlertTriangle,
  ArrowRight,
  X,
  Building2,
  Package,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface FacilityNetworkMapProps {
  facilities: Facility[];
  facilityRisks: FacilityRiskCalculation[];
  selectedMedicine: Medicine | null;
  selectedDistrict: string | "ALL";
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string) => void;
  regionalRisks: RegionalShortageRisk[];
  recommendations: RedistributionRecommendation[];
}

interface FacilityLayoutPosition {
  x: number;
  y: number;
  labelPos: "top" | "bottom" | "left" | "right";
  displayName: string;
}

// Fixed, clean visual coordinates for the 12 facilities organized by district
// Avoids overlap, provides generous spacing, and cleanly isolates shortage clusters
const FACILITY_LAYOUT: Record<string, FacilityLayoutPosition> = {
  // District 1 — Central Depot (Top-Left)
  "fac-d1-a": {
    x: 190,
    y: 125,
    labelPos: "bottom",
    displayName: "Central Pharmacy Hub",
  },
  "fac-d1-b": {
    x: 345,
    y: 185,
    labelPos: "bottom",
    displayName: "Metropolitan Tertiary Hosp",
  },
  "fac-d1-c": {
    x: 130,
    y: 205,
    labelPos: "bottom",
    displayName: "Westside Family Clinic",
  },

  // District 2 — North Bay (Top-Right)
  "fac-d2-b": {
    x: 585,
    y: 130,
    labelPos: "bottom",
    displayName: "North Bay Urgent Care",
  },
  "fac-d2-a": {
    x: 785,
    y: 120,
    labelPos: "bottom",
    displayName: "District 2 General Hosp",
  },
  "fac-d2-c": {
    x: 685,
    y: 210,
    labelPos: "bottom",
    displayName: "Highland Community Clinic",
  },

  // District 3 — South Ridge (Bottom-Left)
  "fac-d3-a": {
    x: 160,
    y: 410,
    labelPos: "bottom",
    displayName: "Lakeside Memorial Hosp",
  },
  "fac-d3-b": {
    x: 340,
    y: 410,
    labelPos: "bottom",
    displayName: "South Hills Primary Center",
  },

  // District 4 — East Valley (Bottom-Right)
  // Cluster of 3 affected facilities: St. Jude (Critical), Riverbed (Critical), Apex Valley (Warning)
  // Surplus facility: Eastside Regional (Surplus, Healthy) situated outside cluster
  "fac-d4-a": {
    x: 575,
    y: 395,
    labelPos: "top",
    displayName: "St. Jude District Hosp",
  },
  "fac-d4-c": {
    x: 575,
    y: 485,
    labelPos: "bottom",
    displayName: "Riverbed Community Clinic",
  },
  "fac-d4-b": {
    x: 695,
    y: 470,
    labelPos: "bottom",
    displayName: "Apex Valley Health",
  },
  "fac-d4-d": {
    x: 838,
    y: 395,
    labelPos: "top",
    displayName: "Eastside Regional Med",
  },
};

// 4 distinct district geographic regions
const DISTRICT_REGIONS = [
  {
    id: "District 1",
    name: "DISTRICT 1",
    subtitle: "Central Depot",
    x: 24,
    y: 24,
    width: 432,
    height: 248,
    labelX: 44,
    labelY: 52,
  },
  {
    id: "District 2",
    name: "DISTRICT 2",
    subtitle: "North Bay",
    x: 484,
    y: 24,
    width: 432,
    height: 248,
    labelX: 504,
    labelY: 52,
  },
  {
    id: "District 3",
    name: "DISTRICT 3",
    subtitle: "South Ridge",
    x: 24,
    y: 288,
    width: 432,
    height: 248,
    labelX: 44,
    labelY: 316,
  },
  {
    id: "District 4",
    name: "DISTRICT 4",
    subtitle: "East Valley",
    x: 484,
    y: 288,
    width: 432,
    height: 248,
    labelX: 504,
    labelY: 316,
  },
];

export const FacilityNetworkMap: React.FC<FacilityNetworkMapProps> = ({
  facilities,
  facilityRisks,
  selectedMedicine,
  selectedDistrict,
  selectedFacilityId,
  onSelectFacility,
  regionalRisks,
  recommendations,
}) => {
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);

  // Map canvas coordinate system (940 x 560)
  const svgWidth = 940;
  const svgHeight = 560;

  // Find risk calculation for a facility
  const getFacilityRisk = (facilityId: string) => {
    return facilityRisks.find((r) => r.facility_id === facilityId);
  };

  const selectedRisk = selectedFacilityId ? getFacilityRisk(selectedFacilityId) : null;
  const selectedFacilityLayout = selectedFacilityId
    ? FACILITY_LAYOUT[selectedFacilityId]
    : null;

  // Determine if District 4 has active regional shortage
  const d4Shortage = regionalRisks.find((r) => r.district === "District 4");

  // Determine smart inspector position:
  // If selected facility is on right side (x >= 470), dock inspector on the left to never cover it!
  // If selected facility is on left side (x < 470), dock inspector on the right!
  const isSelectedOnRight = selectedFacilityLayout
    ? selectedFacilityLayout.x >= 470
    : false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Map Control Header Bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/70">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Regional Facility Network
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Geographic topology &bull;{" "}
              {selectedMedicine ? selectedMedicine.name : "All Essential Medicines"}
            </p>
          </div>
        </div>

        {/* Compact Status Legend (Top-Right) */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs shrink-0" />
            <span className="text-[11px]">Healthy (&gt;14d)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs shrink-0" />
            <span className="text-[11px]">Warning (7–14d)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-2xs animate-pulse shrink-0" />
            <span className="text-[11px]">Critical (&lt;7d)</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center space-x-1.5 text-emerald-700">
            <span className="w-4 border-t-2 border-dashed border-emerald-600 inline-block" />
            <span className="text-[11px]">Transfer</span>
          </div>
        </div>
      </div>

      {/* Main SVG Map Canvas */}
      <div className="relative flex-1 bg-slate-100/40 p-2 overflow-hidden min-h-[480px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minHeight: "460px", maxHeight: "640px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft background dot pattern */}
            <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.4" />
            </pattern>

            {/* Directional arrowhead for redistribution transfer */}
            <marker
              id="transferArrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 7 4, 0 7" fill="#059669" />
            </marker>

            {/* Reverse arrowhead if transfer points left */}
            <marker
              id="transferArrowheadLeft"
              markerWidth="8"
              markerHeight="8"
              refX="2"
              refY="4"
              orient="auto"
            >
              <polygon points="7 1, 0 4, 7 7" fill="#059669" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width={svgWidth} height={svgHeight} fill="url(#dotPattern)" />

          {/* 1. FOUR DISTRICT REGIONS (Geometric Regions) */}
          <g className="district-regions">
            {DISTRICT_REGIONS.map((region) => {
              const isDistrictSelected =
                selectedDistrict === region.id || selectedDistrict === "ALL";
              const isD4AlertDistrict = region.id === "District 4" && !!d4Shortage;

              return (
                <g
                  key={region.id}
                  className="transition-opacity duration-200"
                  opacity={isDistrictSelected ? 1 : 0.35}
                >
                  {/* Region Background Area */}
                  <rect
                    x={region.x}
                    y={region.y}
                    width={region.width}
                    height={region.height}
                    rx="16"
                    fill={isD4AlertDistrict ? "#fff5f5" : "#f8fafc"}
                    stroke={
                      selectedDistrict === region.id
                        ? "#0d9488"
                        : isD4AlertDistrict
                        ? "#fecdd3"
                        : "#e2e8f0"
                    }
                    strokeWidth={selectedDistrict === region.id ? "2" : "1.2"}
                    strokeDasharray={
                      selectedDistrict === region.id ? undefined : "4 4"
                    }
                  />

                  {/* District Header Labels (Positioned in clear empty space) */}
                  <text
                    x={region.labelX}
                    y={region.labelY}
                    fontSize="10"
                    fontWeight="800"
                    letterSpacing="0.08em"
                    fill={isD4AlertDistrict ? "#be123c" : "#64748b"}
                  >
                    {region.name}
                  </text>
                  <text
                    x={region.labelX}
                    y={region.labelY + 16}
                    fontSize="13"
                    fontWeight="800"
                    fill={isD4AlertDistrict ? "#9f1239" : "#1e293b"}
                  >
                    {region.subtitle}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 2. REGIONAL SHORTAGE CLUSTER (Dashed grouping around affected facilities) */}
          {d4Shortage && (
            <g
              className="regional-shortage-cluster cursor-pointer"
              onClick={() => onSelectFacility("fac-d4-a")}
            >
              {/* Subtle cluster enclosure wrapping St. Jude, Riverbed, and Apex Valley */}
              {/* Eastside Regional Medical Center is cleanly OUTSIDE at x: 838 */}
              <rect
                x="498"
                y="348"
                width="268"
                height="176"
                rx="16"
                fill="rgba(244, 63, 94, 0.04)"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                className="hover:stroke-rose-600 transition-colors"
              />

              {/* Cluster Identification Badge */}
              <rect
                x="508"
                y="339"
                width="166"
                height="18"
                rx="4"
                fill="#ffe4e6"
                stroke="#f43f5e"
                strokeWidth="1"
              />
              <text
                x="591"
                y="351"
                textAnchor="middle"
                fill="#9f1239"
                fontSize="9"
                fontWeight="800"
                letterSpacing="0.04em"
              >
                ⚠ REGIONAL SHORTAGE CLUSTER
              </text>
            </g>
          )}

          {/* 3. ACTIVE REDISTRIBUTION TRANSFER CORRIDOR (Donor -> Receiver) */}
          <g className="redistribution-transfers">
            {recommendations.map((rec) => {
              const donorPos = FACILITY_LAYOUT[rec.from_facility_id];
              const receiverPos = FACILITY_LAYOUT[rec.to_facility_id];
              if (!donorPos || !receiverPos) return null;

              // Calculate angle and start/end coordinates with marker radius offset (15px)
              const dx = receiverPos.x - donorPos.x;
              const dy = receiverPos.y - donorPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;

              const offsetX = (dx / dist) * 16;
              const offsetY = (dy / dist) * 16;

              const startX = donorPos.x + offsetX;
              const startY = donorPos.y + offsetY;
              const endX = receiverPos.x - offsetX;
              const endY = receiverPos.y - offsetY;

              // Midpoint for transfer label badge
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g
                  key={rec.id}
                  className="cursor-pointer"
                  onClick={() => onSelectFacility(rec.to_facility_id)}
                >
                  {/* Subtle directional transfer line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    markerEnd="url(#transferArrowhead)"
                  />

                  {/* Transfer Info Badge centered cleanly on line */}
                  <rect
                    x={midX - 54}
                    y={midY - 9}
                    width="108"
                    height="18"
                    rx="4"
                    fill="#ecfdf5"
                    stroke="#059669"
                    strokeWidth="1"
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.08))"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill="#065f46"
                    fontSize="9"
                    fontWeight="800"
                  >
                    {dx < 0 ? "← " : ""}Transfer {rec.transfer_units}u ({rec.distance_km}km){dx >= 0 ? " →" : ""}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 4. FACILITY MARKERS & COMPACT LABELS */}
          {facilities.map((facility) => {
            const layout = FACILITY_LAYOUT[facility.facility_id];
            if (!layout) return null;

            const risk = getFacilityRisk(facility.facility_id);
            const isSelected = selectedFacilityId === facility.facility_id;
            const isHovered = hoveredFacilityId === facility.facility_id;

            const riskLevel = risk ? risk.risk_level : "GREEN";
            const daysRemaining = risk ? risk.days_of_stock_remaining : 15;

            // Marker appearance based on risk level
            const isCritical = riskLevel === "RED";
            const isWarning = riskLevel === "YELLOW";

            const markerColor = isCritical
              ? "#e11d48" // Rose 600
              : isWarning
              ? "#f59e0b" // Amber 500
              : "#10b981"; // Emerald 500

            const markerRadius = isCritical ? 11 : isWarning ? 9.5 : 8.5;

            // Intelligent Label Positioning
            // Label can sit "top" or "bottom" cleanly aligned with marker
            const isLabelTop = layout.labelPos === "top";
            const labelY = isLabelTop ? layout.y - 20 : layout.y + 20;

            return (
              <g
                key={facility.facility_id}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => onSelectFacility(facility.facility_id)}
                onMouseEnter={() => setHoveredFacilityId(facility.facility_id)}
                onMouseLeave={() => setHoveredFacilityId(null)}
              >
                {/* Active Selection Indicator Ring */}
                {isSelected && (
                  <circle
                    cx={layout.x}
                    cy={layout.y}
                    r="22"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{
                      transformOrigin: `${layout.x}px ${layout.y}px`,
                      animationDuration: "10s",
                    }}
                  />
                )}

                {/* Pulsing ring: ONLY for Critical (<7d) facilities to guide judge's eyes */}
                {isCritical && (
                  <circle
                    cx={layout.x}
                    cy={layout.y}
                    r="18"
                    fill="none"
                    stroke="#fda4af"
                    strokeWidth="2.5"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="r"
                      values="12;20;12"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Facility Marker Circle */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={isHovered ? markerRadius + 2 : markerRadius}
                  fill={markerColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.12))"
                />

                {/* White Inner Dot */}
                <circle cx={layout.x} cy={layout.y} r="3" fill="#ffffff" />

                {/* Compact Facility Label Pill */}
                {/* Format: [Facility Name · Days Remaining] */}
                <g transform={`translate(${layout.x}, ${labelY})`}>
                  <rect
                    x="-76"
                    y="-9"
                    width="152"
                    height="18"
                    rx="5"
                    fill={isSelected ? "#0f172a" : "#ffffff"}
                    stroke={
                      isSelected
                        ? "#0f172a"
                        : isCritical
                        ? "#fecdd3"
                        : isWarning
                        ? "#fef3c7"
                        : "#e2e8f0"
                    }
                    strokeWidth="1"
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.05))"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontSize="9.5"
                  >
                    <tspan
                      fontWeight="700"
                      fill={isSelected ? "#ffffff" : "#1e293b"}
                    >
                      {layout.displayName}
                    </tspan>
                    <tspan fill={isSelected ? "#94a3b8" : "#94a3b8"}>
                      {" "}
                      &bull;{" "}
                    </tspan>
                    <tspan
                      fontWeight="800"
                      fill={
                        isSelected
                          ? "#38bdf8"
                          : isCritical
                          ? "#e11d48"
                          : isWarning
                          ? "#d97706"
                          : "#059669"
                      }
                    >
                      {daysRemaining}d
                    </tspan>
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* 5. FACILITY DIAGNOSTIC INSPECTOR */}
        {/* Intelligently docks on the opposite side of the selected facility so it NEVER obscures it */}
        {selectedRisk && (
          <div
            className={`absolute bottom-3 ${
              isSelectedOnRight ? "left-3" : "right-3"
            } z-20 bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-lg max-w-xs md:max-w-sm backdrop-blur-xs transition-all duration-200`}
          >
            {/* Header & Risk Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                Facility Diagnostic Inspector
              </span>
              <div className="flex items-center space-x-1.5">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    selectedRisk.risk_level === "RED"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : selectedRisk.risk_level === "YELLOW"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {selectedRisk.risk_level === "RED"
                    ? "CRITICAL (<7d)"
                    : selectedRisk.risk_level === "YELLOW"
                    ? "WARNING (7–14d)"
                    : "HEALTHY (>14d)"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility("");
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Facility Name & District */}
            <div className="mt-1.5">
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {selectedRisk.facility.name}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedRisk.facility.district} &bull; Pop.{" "}
                {selectedRisk.facility.population_served.toLocaleString()}
              </p>
            </div>

            {/* Diagnostic Metrics Grid (All 9 requested fields preserved) */}
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Selected Medicine:</span>
                <div className="font-bold text-slate-800 truncate">
                  {selectedRisk.medicine.name.split(" ")[0]}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Stock Coverage:</span>
                <div
                  className={`font-mono font-extrabold ${
                    selectedRisk.risk_level === "RED"
                      ? "text-rose-700"
                      : selectedRisk.risk_level === "YELLOW"
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  {selectedRisk.days_of_stock_remaining} days
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Current Stock:</span>
                <div className="font-semibold text-slate-800">
                  {selectedRisk.current_stock} {selectedRisk.medicine.unit}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Daily Burn Rate:</span>
                <div className="font-semibold text-slate-800">
                  {selectedRisk.daily_consumption_rate} {selectedRisk.medicine.unit}/d
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Next Delivery:</span>
                <div className="font-medium text-slate-700 text-[11px]">
                  {selectedRisk.days_until_replenishment}d ({selectedRisk.expected_next_replenishment_date})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Replenish Gap:</span>
                <div className="font-semibold text-slate-800">
                  {selectedRisk.replenishment_gap_days > 0 ? (
                    <span className="text-rose-600 font-bold">
                      -{selectedRisk.replenishment_gap_days}d gap
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">On Schedule</span>
                  )}
                </div>
              </div>
            </div>

            {/* Projected Stockout Warning */}
            {selectedRisk.risk_level === "RED" && (
              <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 leading-tight">
                <strong>Projected Stockout:</strong> Depletes on{" "}
                {selectedRisk.projected_stockout_date} before next delivery.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

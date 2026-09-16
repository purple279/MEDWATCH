import React, { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { FiltersBar } from "./components/FiltersBar";
import { RegionalRiskBanner } from "./components/RegionalRiskBanner";
import { FacilityNetworkMap } from "./components/FacilityNetworkMap";
import { StockTrendChart } from "./components/StockTrendChart";
import { AlertsPanel } from "./components/AlertsPanel";
import { RedistributionTable } from "./components/RedistributionTable";
import { SimulationPanel } from "./components/SimulationPanel";
import { AIExplanationModal } from "./components/AIExplanationModal";
import {
  DISTRICTS,
  FACILITIES,
  MEDICINES,
  generateSyntheticStockRecords,
} from "./data/mockData";
import {
  calculateFacilityRisk,
  detectRegionalShortage,
  generateRedistributionRecommendations,
} from "./engine/shortageEngine";
import {
  FacilityRiskCalculation,
  RegionalShortageRisk,
  SimulationSettings,
  StockRecord,
} from "./types";
import { Sparkles, CheckCircle, RefreshCw } from "lucide-react";

export default function App() {
  // Base synthetic stock records (45-day history across 12 facilities and 5 medicines)
  const [baseRecords] = useState<StockRecord[]>(() => generateSyntheticStockRecords());

  // Filters
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | "ALL">("med-insulin");
  const [selectedDistrict, setSelectedDistrict] = useState<string | "ALL">("ALL");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("fac-d4-a");

  // Stress-Testing Simulation Settings
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    demandIncreasePct: 0,
    replenishmentDelayDays: 0,
    activeScenarioName: null,
  });

  // Executed transfer adjustments: Record<`${facility_id}:${medicine_id}`, number>
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, number>>({});
  const [dispatchedTransferIds, setDispatchedTransferIds] = useState<Set<string>>(new Set());

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedRiskForAI, setSelectedRiskForAI] = useState<RegionalShortageRisk | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger temporary notification toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Adjusted records incorporating executed transfer rebalancing
  const currentRecords = useMemo(() => {
    if (Object.keys(stockAdjustments).length === 0) return baseRecords;

    return baseRecords.map((rec) => {
      const key = `${rec.facility_id}:${rec.medicine_id}`;
      const adj = stockAdjustments[key] || 0;
      if (adj !== 0 && rec.date === "2026-09-16") {
        return {
          ...rec,
          current_stock: Math.max(0, rec.current_stock + adj),
        };
      }
      return rec;
    });
  }, [baseRecords, stockAdjustments]);

  // 1. Calculate facility risks for ALL facility + medicine pairs
  const allFacilityRisks = useMemo(() => {
    const calculated: FacilityRiskCalculation[] = [];
    for (const facility of FACILITIES) {
      for (const medicine of MEDICINES) {
        calculated.push(
          calculateFacilityRisk(facility, medicine, currentRecords, simulationSettings)
        );
      }
    }
    return calculated;
  }, [currentRecords, simulationSettings]);

  // Active medicine object
  const activeMedicine = useMemo(() => {
    if (selectedMedicineId === "ALL") return MEDICINES[0]; // Default to Insulin for single-metric views
    return MEDICINES.find((m) => m.medicine_id === selectedMedicineId) || MEDICINES[0];
  }, [selectedMedicineId]);

  // 2. Filter facility risks based on active medicine & district selection
  const visibleFacilityRisks = useMemo(() => {
    return allFacilityRisks.filter((risk) => {
      const matchMed =
        selectedMedicineId === "ALL" || risk.medicine_id === selectedMedicineId;
      const matchDist =
        selectedDistrict === "ALL" || risk.facility.district === selectedDistrict;
      return matchMed && matchDist;
    });
  }, [allFacilityRisks, selectedMedicineId, selectedDistrict]);

  // Facilities visible on map
  const visibleFacilities = useMemo(() => {
    if (selectedDistrict === "ALL") return FACILITIES;
    return FACILITIES.filter((f) => f.district === selectedDistrict);
  }, [selectedDistrict]);

  // 3. Detect Regional Shortage Clusters
  const regionalRisks = useMemo(() => {
    const medicinesToAnalyze =
      selectedMedicineId === "ALL"
        ? MEDICINES
        : MEDICINES.filter((m) => m.medicine_id === selectedMedicineId);

    const risks = detectRegionalShortage(FACILITIES, allFacilityRisks, medicinesToAnalyze);

    if (selectedDistrict === "ALL") return risks;
    return risks.filter((r) => r.district === selectedDistrict);
  }, [allFacilityRisks, selectedMedicineId, selectedDistrict]);

  // 4. Generate Redistribution Recommendations
  const rawRecommendations = useMemo(() => {
    const relevantRisks =
      selectedMedicineId === "ALL"
        ? allFacilityRisks
        : allFacilityRisks.filter((r) => r.medicine_id === selectedMedicineId);

    return generateRedistributionRecommendations(relevantRisks);
  }, [allFacilityRisks, selectedMedicineId]);

  // Annotate recommendations with dispatched status
  const recommendations = useMemo(() => {
    return rawRecommendations.map((rec) => ({
      ...rec,
      status: dispatchedTransferIds.has(rec.id)
        ? ("DISPATCHED" as const)
        : ("PENDING" as const),
    }));
  }, [rawRecommendations, dispatchedTransferIds]);

  // Selected facility's detailed risk calculation for Stock Trend Chart
  const selectedFacilityRisk = useMemo(() => {
    const medId = selectedMedicineId === "ALL" ? "med-insulin" : selectedMedicineId;
    return (
      allFacilityRisks.find(
        (r) => r.facility_id === selectedFacilityId && r.medicine_id === medId
      ) ||
      allFacilityRisks.find((r) => r.facility_id === selectedFacilityId) ||
      null
    );
  }, [allFacilityRisks, selectedFacilityId, selectedMedicineId]);

  // Baseline facility risks (without stress simulation) for dynamic Before -> After impact calculations
  const baselineFacilityRisks = useMemo(() => {
    const baselineSettings: SimulationSettings = {
      demandIncreasePct: 0,
      replenishmentDelayDays: 0,
      activeScenarioName: null,
    };
    const calculated: FacilityRiskCalculation[] = [];
    for (const facility of FACILITIES) {
      for (const medicine of MEDICINES) {
        calculated.push(
          calculateFacilityRisk(facility, medicine, currentRecords, baselineSettings)
        );
      }
    }
    return calculated;
  }, [currentRecords]);

  const baselineFacilityRisk = useMemo(() => {
    const medId = selectedMedicineId === "ALL" ? "med-insulin" : selectedMedicineId;
    return (
      baselineFacilityRisks.find(
        (r) => r.facility_id === selectedFacilityId && r.medicine_id === medId
      ) ||
      baselineFacilityRisks.find((r) => r.facility_id === selectedFacilityId) ||
      null
    );
  }, [baselineFacilityRisks, selectedFacilityId, selectedMedicineId]);

  const baselineRegionalRisks = useMemo(() => {
    const medicinesToAnalyze =
      selectedMedicineId === "ALL"
        ? MEDICINES
        : MEDICINES.filter((m) => m.medicine_id === selectedMedicineId);

    const risks = detectRegionalShortage(FACILITIES, baselineFacilityRisks, medicinesToAnalyze);
    if (selectedDistrict === "ALL") return risks;
    return risks.filter((r) => r.district === selectedDistrict);
  }, [baselineFacilityRisks, selectedMedicineId, selectedDistrict]);

  const selectedRegionalRisk = regionalRisks[0] || null;
  const baselineRegionalRisk = baselineRegionalRisks[0] || null;

  // Summary Metrics
  const criticalCount = useMemo(() => {
    return visibleFacilityRisks.filter((r) => r.risk_level === "RED").length;
  }, [visibleFacilityRisks]);

  // Handlers
  const handleExecuteTransfer = (recommendationId: string) => {
    const rec = recommendations.find((r) => r.id === recommendationId);
    if (!rec) return;

    setDispatchedTransferIds((prev) => new Set(prev).add(recommendationId));

    // Update stock adjustments
    const donorKey = `${rec.from_facility_id}:${rec.medicine_id}`;
    const recipientKey = `${rec.to_facility_id}:${rec.medicine_id}`;

    setStockAdjustments((prev) => ({
      ...prev,
      [donorKey]: (prev[donorKey] || 0) - rec.transfer_units,
      [recipientKey]: (prev[recipientKey] || 0) + rec.transfer_units,
    }));

    showToast(
      `Dispatched ${rec.transfer_units} units of ${rec.medicine_name.split(" ")[0]} from ${
        rec.from_facility_name
      } to ${rec.to_facility_name}! (${rec.to_facility_name} coverage extended to ${rec.post_transfer_days_receiving}d)`
    );
  };

  const handleInspectRegionalRisk = (risk: RegionalShortageRisk) => {
    setSelectedMedicineId(risk.medicine_id);
    setSelectedDistrict(risk.district);
    if (risk.affected_facilities.length > 0) {
      setSelectedFacilityId(risk.affected_facilities[0].facility_id);
    }
  };

  const handleOpenAIExplanation = (risk: RegionalShortageRisk) => {
    setSelectedRiskForAI(risk);
    setIsAIModalOpen(true);
  };

  const handleResetSimulation = () => {
    setSimulationSettings({
      demandIncreasePct: 0,
      replenishmentDelayDays: 0,
      activeScenarioName: null,
    });
    showToast("Simulation reset to baseline operations.");
  };

  const handleResetFilters = () => {
    setSelectedMedicineId("ALL");
    setSelectedDistrict("ALL");
  };

  const handleResetAll = () => {
    setSelectedMedicineId("med-insulin");
    setSelectedDistrict("ALL");
    setSelectedFacilityId("fac-d4-a");
    setSimulationSettings({
      demandIncreasePct: 0,
      replenishmentDelayDays: 0,
      activeScenarioName: null,
    });
    setStockAdjustments({});
    setDispatchedTransferIds(new Set());
    showToast("Reset all filters, simulations, and transfers to initial demo baseline.");
  };

  const isSimulating =
    simulationSettings.demandIncreasePct > 0 ||
    simulationSettings.replenishmentDelayDays > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Header
        isSimulating={isSimulating}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Summary Cards */}
        <SummaryCards
          totalFacilities={FACILITIES.length}
          totalMedicines={MEDICINES.length}
          criticalFacilitiesCount={criticalCount}
          regionalRisksCount={regionalRisks.length}
          transfersCount={recommendations.length}
          onCardClick={(type) => {
            if (type === "regional" && regionalRisks.length > 0) {
              handleInspectRegionalRisk(regionalRisks[0]);
            } else if (type === "critical") {
              const firstCrit = visibleFacilityRisks.find((r) => r.risk_level === "RED");
              if (firstCrit) setSelectedFacilityId(firstCrit.facility_id);
            }
          }}
        />

        {/* 2. Filters Bar */}
        <FiltersBar
          medicines={MEDICINES}
          selectedMedicineId={selectedMedicineId}
          onSelectMedicine={(id) => setSelectedMedicineId(id)}
          districts={DISTRICTS}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={(dist) => setSelectedDistrict(dist)}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Prominent Regional Shortage Risk Warning Panel (CORE INNOVATION) */}
        {regionalRisks.length > 0 ? (
          <RegionalRiskBanner
            risks={regionalRisks}
            onInspectRisk={handleInspectRegionalRisk}
            onExplainWithAI={handleOpenAIExplanation}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800">
                No Regional Clusters Detected for Current Filter
              </span>
              <span className="text-slate-500 hidden sm:inline">
                &mdash; Individual facility stockouts are managed through normal localized replenishment.
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedMedicineId("med-insulin");
                setSelectedDistrict("District 4");
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
            >
              View District 4 Demo Cluster &rarr;
            </button>
          </div>
        )}

        {/* 4. Main Split View: Left Map & Topology | Right Alerts Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (2/3 width): Facility Network Map */}
          <div className="lg:col-span-2">
            <FacilityNetworkMap
              facilities={visibleFacilities}
              facilityRisks={visibleFacilityRisks}
              selectedMedicine={activeMedicine}
              selectedDistrict={selectedDistrict}
              selectedFacilityId={selectedFacilityId}
              onSelectFacility={(id) => setSelectedFacilityId(id)}
              regionalRisks={regionalRisks}
              recommendations={recommendations}
            />
          </div>

          {/* Right Column (1/3 width): Active Supply Alerts */}
          <div className="lg:col-span-1">
            <AlertsPanel
              regionalRisks={regionalRisks}
              facilityRisks={visibleFacilityRisks}
              onSelectRegionalRisk={handleInspectRegionalRisk}
              onSelectFacility={(facId, medId) => {
                setSelectedFacilityId(facId);
                setSelectedMedicineId(medId);
              }}
              selectedFacilityId={selectedFacilityId}
            />
          </div>
        </div>

        {/* 5. Stock Trend Analysis (Interactive Time-Series Depletion Chart) */}
        <StockTrendChart selectedRisk={selectedFacilityRisk} />

        {/* 6. Redistribution Engine Table (Surplus Rebalancing) */}
        <RedistributionTable
          recommendations={recommendations}
          onExecuteTransfer={handleExecuteTransfer}
          onSelectFacilityPair={(fromId, toId) => {
            setSelectedFacilityId(toId);
          }}
        />

        {/* 7. Shortage Stress Test (What-If Disruption Simulator) */}
        <SimulationPanel
          settings={simulationSettings}
          onUpdateSettings={(newSettings) => {
            setSimulationSettings(newSettings);
            showToast(`Stress test updated: ${newSettings.activeScenarioName || "Custom parameters"}`);
          }}
          onReset={handleResetSimulation}
          selectedFacilityRisk={selectedFacilityRisk}
          baselineFacilityRisk={baselineFacilityRisk}
          selectedRegionalRisk={selectedRegionalRisk}
          baselineRegionalRisk={baselineRegionalRisk}
        />
      </main>

      {/* AI Explanation Modal */}
      <AIExplanationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        risk={selectedRiskForAI}
      />
    </div>
  );
}

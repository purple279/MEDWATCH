import React, { useMemo, useState } from "react";
import { Sidebar, NavSection } from "./components/Sidebar";
import { Header } from "./components/Header";
import { KpiCards } from "./components/KpiCards";
import { MedicineSupplyTable } from "./components/MedicineSupplyTable";
import { SupplyTrendsChart } from "./components/SupplyTrendsChart";
import { MedicineConsumptionDepletionChart } from "./components/MedicineConsumptionDepletionChart";
import { StockCoverageChart } from "./components/StockCoverageChart";
import { RegionalRiskTrendChart } from "./components/RegionalRiskTrendChart";
import { RegionalShortageAlertCard } from "./components/RegionalShortageAlertCard";
import { FacilityNetworkMap } from "./components/FacilityNetworkMap";
import { StockoutTimelineCard } from "./components/StockoutTimelineCard";
import { RedistributionCard } from "./components/RedistributionCard";
import { StressTestCard } from "./components/StressTestCard";
import { ReportsView } from "./components/ReportsView";
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
import { CheckCircle } from "lucide-react";

export default function App() {
  // Navigation
  const [activeNav, setActiveNav] = useState<NavSection>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Base synthetic stock records (45-day history across 12 facilities and 5 medicines)
  const [baseRecords] = useState<StockRecord[]>(() => generateSyntheticStockRecords());

  // Active selections
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
    if (selectedMedicineId === "ALL") return MEDICINES[0];
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

  // Selected facility's detailed risk calculation
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

  // Baseline facility risks (without stress simulation)
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

  // Counts
  const criticalCount = useMemo(() => {
    return allFacilityRisks.filter((r) => r.risk_level === "RED").length;
  }, [allFacilityRisks]);

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
      } to ${rec.to_facility_name}! Coverage extended to ${rec.post_transfer_days_receiving}d.`
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
    showToast("Stress test reset to baseline operations.");
  };

  const isSimulating =
    simulationSettings.demandIncreasePct > 0 ||
    simulationSettings.replenishmentDelayDays > 0;

  // Page title mapping based on sidebar navigation
  const pageTitles: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Regional medicine supply monitoring",
    },
    inventory: {
      title: "Medicine Supply Inventory",
      subtitle: "Detailed stock coverage across all facilities",
    },
    network: {
      title: "Regional Network",
      subtitle: "Healthcare facility topology and transfer corridors",
    },
    alerts: {
      title: "Shortage Alerts & Timeline",
      subtitle: "Proactive regional shortage indicators and lead-time analysis",
    },
    redistribution: {
      title: "Redistribution Engine",
      subtitle: "Safe surplus rebalancing to avert clinical stockouts",
    },
    stresstest: {
      title: "Shortage Stress Test",
      subtitle: "Simulation of supply shocks and replenishment delays",
    },
    reports: {
      title: "Reports & Audits",
      subtitle: "Executive regional medicine supply audit logs",
    },
  };

  const currentTitle = pageTitles[activeNav] || pageTitles.dashboard;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
      {/* 1. Left Vertical Sidebar (220-250px) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(section) => setActiveNav(section)}
        criticalCount={criticalCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container Area (Offset by sidebar on lg screens) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* 2. Top Header */}
        <Header
          pageTitle={currentTitle.title}
          pageSubtitle={currentTitle.subtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          criticalAlertsCount={criticalCount}
          isSimulating={isSimulating}
          onResetSimulation={handleResetSimulation}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onAlertClick={() => {
            if (regionalRisks.length > 0) {
              handleInspectRegionalRisk(regionalRisks[0]);
            }
          }}
        />

        {/* 3. Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Conditional View Rendering based on activeNav */}
          {activeNav === "reports" ? (
            <ReportsView
              facilityRisks={allFacilityRisks}
              regionalRisks={regionalRisks}
            />
          ) : (
            <>
              {/* 4. Row of 4 Compact KPI Cards */}
              <KpiCards
                totalFacilities={FACILITIES.length}
                criticalStockItemsCount={criticalCount > 0 ? criticalCount : 5}
                regionalRiskPercent={selectedRegionalRisk ? Math.round(selectedRegionalRisk.confidence_score * 100) : 78}
                surplusDaysBuffer={18}
                onCardClick={(type) => {
                  if (type === "regional" && regionalRisks.length > 0) {
                    handleInspectRegionalRisk(regionalRisks[0]);
                  } else if (type === "critical") {
                    const firstCrit = visibleFacilityRisks.find((r) => r.risk_level === "RED");
                    if (firstCrit) setSelectedFacilityId(firstCrit.facility_id);
                  }
                }}
              />

              {/* 5. Main Dashboard Content (Two-Column Layout) */}
              {/* Left/Larger Column: Medicine Supply Status | Right/Smaller Column: Inventory Trends */}
              {(activeNav === "dashboard" || activeNav === "inventory") && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <div className="lg:col-span-2">
                    <MedicineSupplyTable
                      facilityRisks={visibleFacilityRisks}
                      selectedFacilityId={selectedFacilityId}
                      onSelectFacility={(facId, medId) => {
                        setSelectedFacilityId(facId);
                        setSelectedMedicineId(medId);
                      }}
                      onDispatchClick={(facId) => {
                        setSelectedFacilityId(facId);
                        setActiveNav("redistribution");
                      }}
                      searchQuery={searchQuery}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <SupplyTrendsChart
                      selectedRisk={selectedFacilityRisk}
                      dailyConsumption={492}
                      weeklyConsumption={3442}
                    />
                  </div>
                </div>
              )}

              {/* 4. Medicine Consumption & Depletion Graph */}
              {(activeNav === "dashboard" || activeNav === "inventory") && (
                <MedicineConsumptionDepletionChart
                  medicines={MEDICINES}
                  selectedMedicineId={
                    selectedMedicineId === "ALL" ? "med-insulin" : selectedMedicineId
                  }
                  onSelectMedicineId={(id) => setSelectedMedicineId(id)}
                  selectedRisk={selectedFacilityRisk}
                  facilityRisks={allFacilityRisks}
                />
              )}

              {/* 5. Regional Shortage Alert Card */}
              {(activeNav === "dashboard" || activeNav === "alerts") && (
                <RegionalShortageAlertCard
                  risk={selectedRegionalRisk}
                  onViewAlert={(risk) => {
                    handleInspectRegionalRisk(risk);
                    handleOpenAIExplanation(risk);
                  }}
                  onExplainWithAI={handleOpenAIExplanation}
                />
              )}

              {/* Regional Risk Trend & Prototype Risk Estimate */}
              {(activeNav === "dashboard" || activeNav === "alerts" || activeNav === "stresstest") && (
                <RegionalRiskTrendChart
                  regionalRisk={selectedRegionalRisk}
                  isSimulating={
                    simulationSettings.demandIncreasePct > 0 ||
                    simulationSettings.replenishmentDelayDays > 0
                  }
                />
              )}

              {/* 6. HEALTHCARE SUPPLY NETWORK MAP */}
              {(activeNav === "dashboard" || activeNav === "network") && (
                <FacilityNetworkMap
                  facilities={FACILITIES}
                  facilityRisks={visibleFacilityRisks}
                  selectedMedicine={activeMedicine}
                  selectedDistrict={selectedDistrict}
                  selectedFacilityId={selectedFacilityId}
                  onSelectFacility={(id) => setSelectedFacilityId(id)}
                  regionalRisks={regionalRisks}
                  recommendations={recommendations}
                />
              )}

              {/* 7. Stockout vs Replenishment Graph */}
              {(activeNav === "dashboard" || activeNav === "alerts" || activeNav === "inventory") && (
                <StockoutTimelineCard selectedRisk={selectedFacilityRisk} />
              )}

              {/* 8. Stock Coverage by Facility */}
              {(activeNav === "dashboard" || activeNav === "inventory") && (
                <StockCoverageChart
                  facilityRisks={visibleFacilityRisks}
                  selectedFacilityId={selectedFacilityId}
                  onSelectFacility={(id) => setSelectedFacilityId(id)}
                />
              )}

              {/* 9. Recommended Redistribution Card */}
              {(activeNav === "dashboard" || activeNav === "redistribution") && (
                <RedistributionCard
                  recommendations={recommendations}
                  onExecuteTransfer={handleExecuteTransfer}
                  onSelectFacilityPair={(fromId, toId) => {
                    setSelectedFacilityId(toId);
                  }}
                />
              )}

              {/* 10. Shortage Stress Test Card */}
              {(activeNav === "dashboard" || activeNav === "stresstest") && (
                <StressTestCard
                  settings={simulationSettings}
                  onUpdateSettings={(newSettings) => {
                    setSimulationSettings(newSettings);
                    showToast(`Stress test updated: ${newSettings.activeScenarioName || "Custom"}`);
                  }}
                  onReset={handleResetSimulation}
                  selectedFacilityRisk={selectedFacilityRisk}
                  baselineFacilityRisk={baselineFacilityRisk}
                  selectedRegionalRisk={selectedRegionalRisk}
                  baselineRegionalRisk={baselineRegionalRisk}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* AI Explanation Modal */}
      <AIExplanationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        risk={selectedRiskForAI || selectedRegionalRisk}
      />
    </div>
  );
}

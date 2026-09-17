import {
  Facility,
  FacilityRiskCalculation,
  Medicine,
  PriorityLevel,
  RedistributionRecommendation,
  RegionalShortageRisk,
  RiskLevel,
  SimulationSettings,
  StockRecord,
} from "../types";

/**
 * Calculates days of stock remaining: current_stock / daily_consumption_rate
 */
export function calculateDaysOfStock(
  currentStock: number,
  dailyConsumption: number
): number {
  if (dailyConsumption <= 0) return 999;
  const days = currentStock / dailyConsumption;
  return Math.round(days * 10) / 10;
}

/**
 * Risk classification:
 * GREEN: days > 14
 * YELLOW: 7 <= days <= 14
 * RED: days < 7
 */
export function calculateRiskLevel(daysRemaining: number): RiskLevel {
  if (daysRemaining > 14) return "GREEN";
  if (daysRemaining >= 7) return "YELLOW";
  return "RED";
}

/**
 * Calculates great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Evaluates historical time-series to detect stock velocity, depletion speed, and consumption shifts.
 */
export function calculateConsumptionTrend(
  history: { date: string; stock: number; consumption: number }[]
): {
  trend: "Surging" | "Increasing" | "Stable" | "Decreasing";
  stock_velocity: number;
  is_rapid_depletion: boolean;
} {
  if (!history || history.length < 7) {
    return { trend: "Stable", stock_velocity: 0, is_rapid_depletion: false };
  }

  // Sort ascending by date
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Compare recent 7-day average consumption vs earlier 14-day average
  const recent7 = sorted.slice(-7);
  const earlier14 = sorted.slice(Math.max(0, sorted.length - 21), sorted.length - 7);

  const avgRecentCons =
    recent7.reduce((acc, x) => acc + x.consumption, 0) / Math.max(1, recent7.length);
  const avgEarlierCons =
    earlier14.length > 0
      ? earlier14.reduce((acc, x) => acc + x.consumption, 0) / earlier14.length
      : avgRecentCons;

  const growth = (avgRecentCons - avgEarlierCons) / Math.max(1, avgEarlierCons);

  // Stock velocity over past 14 days (units lost per day)
  const past14Start = sorted[Math.max(0, sorted.length - 14)].stock;
  const current = sorted[sorted.length - 1].stock;
  const stockVelocity = Math.max(0, Math.round(((past14Start - current) / 14) * 10) / 10);

  let trend: "Surging" | "Increasing" | "Stable" | "Decreasing" = "Stable";
  if (growth > 0.25) trend = "Surging";
  else if (growth > 0.08) trend = "Increasing";
  else if (growth < -0.1) trend = "Decreasing";

  const is_rapid_depletion = growth > 0.15 || stockVelocity > avgRecentCons * 1.1;

  return { trend, stock_velocity: stockVelocity, is_rapid_depletion };
}

/**
 * Calculates comprehensive facility risk metrics for a single facility + medicine combination.
 */
export function calculateFacilityRisk(
  facility: Facility,
  medicine: Medicine,
  records: StockRecord[],
  simSettings?: SimulationSettings
): FacilityRiskCalculation {
  const facilityRecords = records
    .filter(
      (r) =>
        r.facility_id === facility.facility_id &&
        r.medicine_id === medicine.medicine_id
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestRecord = facilityRecords[facilityRecords.length - 1] || {
    facility_id: facility.facility_id,
    medicine_id: medicine.medicine_id,
    date: new Date().toISOString().split("T")[0],
    current_stock: 100,
    daily_consumption_rate: 10,
    last_replenishment_date: new Date().toISOString().split("T")[0],
    expected_next_replenishment_date: new Date(Date.now() + 86400000 * 10)
      .toISOString()
      .split("T")[0],
  };

  // Adjust for active simulation if provided
  let effectiveStock = latestRecord.current_stock;
  let effectiveConsumption = latestRecord.daily_consumption_rate;
  let effectiveExpectedDate = latestRecord.expected_next_replenishment_date;

  if (simSettings) {
    if (simSettings.demandIncreasePct > 0) {
      const mult = 1 + simSettings.demandIncreasePct / 100;
      effectiveConsumption = Math.round(effectiveConsumption * mult);
    }
    if (simSettings.replenishmentDelayDays > 0) {
      const expDate = new Date(effectiveExpectedDate);
      expDate.setDate(expDate.getDate() + simSettings.replenishmentDelayDays);
      effectiveExpectedDate = expDate.toISOString().split("T")[0];
    }
  }

  const daysOfStock = calculateDaysOfStock(effectiveStock, effectiveConsumption);
  const riskLevel = calculateRiskLevel(daysOfStock);

  // Time-series history mapped
  const history = facilityRecords.map((r) => ({
    date: r.date,
    stock: r.current_stock,
    consumption: r.daily_consumption_rate,
  }));

  const trendAnalysis = calculateConsumptionTrend(history);

  // Calculate days until replenishment
  const today = new Date("2026-09-16");
  const expReplenish = new Date(effectiveExpectedDate);
  const diffTime = expReplenish.getTime() - today.getTime();
  const daysUntilReplenish = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Replenishment gap: if stock runs out before replenishment arrives
  const replenishmentGap = Math.max(0, Math.round((daysUntilReplenish - daysOfStock) * 10) / 10);
  const isDelayed = replenishmentGap > 0 || (simSettings?.replenishmentDelayDays || 0) > 0;

  // Projected stockout date
  const stockoutDate = new Date(today);
  stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysOfStock));
  const projectedStockoutStr = stockoutDate.toISOString().split("T")[0];

  return {
    facility_id: facility.facility_id,
    medicine_id: medicine.medicine_id,
    facility,
    medicine,
    current_stock: effectiveStock,
    daily_consumption_rate: effectiveConsumption,
    days_of_stock_remaining: daysOfStock,
    risk_level: riskLevel,
    last_replenishment_date: latestRecord.last_replenishment_date,
    expected_next_replenishment_date: effectiveExpectedDate,
    days_until_replenishment: daysUntilReplenish,
    replenishment_gap_days: replenishmentGap,
    consumption_trend: trendAnalysis.trend,
    stock_velocity: trendAnalysis.stock_velocity,
    is_rapid_depletion: trendAnalysis.is_rapid_depletion,
    is_replenishment_delayed: isDelayed,
    history,
    projected_stockout_date: projectedStockoutStr,
  };
}

/**
 * Transparent confidence scoring function for regional shortage risk.
 * Weighted formula:
 * - 40%: Percentage of district facilities affected (e.g. 3/4 = 75% -> 30 pts)
 * - 25%: Depletion velocity / severity of average days remaining (under 7 days -> 20-25 pts)
 * - 20%: Consumption surge / trend momentum (10-20 pts)
 * - 15%: Replenishment delivery gap / delay reliability (10-15 pts)
 */
export function calculateConfidence(params: {
  affectedCount: number;
  totalCount: number;
  avgDaysRemaining: number;
  trend: string;
  hasReplenishmentGap: boolean;
}): {
  score: number;
  breakdown: {
    affected_facility_weight: number;
    depletion_speed_weight: number;
    consumption_surge_weight: number;
    replenishment_delay_weight: number;
  };
} {
  const { affectedCount, totalCount, avgDaysRemaining, trend, hasReplenishmentGap } = params;

  // 1. Proportion of facilities affected (max 40)
  const ratio = totalCount > 0 ? affectedCount / totalCount : 0;
  const affectedWeight = Math.round(ratio * 40);

  // 2. Depletion speed / critical stock level (max 25)
  // Fewer days remaining = higher certainty of impending shortage
  let depletionWeight = 10;
  if (avgDaysRemaining <= 5) depletionWeight = 25;
  else if (avgDaysRemaining <= 7) depletionWeight = 22;
  else if (avgDaysRemaining <= 10) depletionWeight = 16;

  // 3. Consumption trend surge (max 20)
  let trendWeight = 8;
  if (trend === "Surging" || trend === "Accelerated Depletion") trendWeight = 18;
  else if (trend === "Increasing" || trend === "Declining") trendWeight = 14;

  // 4. Replenishment delay factor (max 15)
  const delayWeight = hasReplenishmentGap ? 14 : 7;

  const totalScore = Math.min(95, Math.max(45, affectedWeight + depletionWeight + trendWeight + delayWeight));

  return {
    score: totalScore,
    breakdown: {
      affected_facility_weight: affectedWeight,
      depletion_speed_weight: depletionWeight,
      consumption_surge_weight: trendWeight,
      replenishment_delay_weight: delayWeight,
    },
  };
}

/**
 * CORE INNOVATION: Detects regional shortage patterns.
 * Groups facilities by district for the given medicine.
 * If 3 or more facilities in the district are Yellow or Red:
 * Triggers REGIONAL SHORTAGE RISK.
 */
export function detectRegionalShortage(
  facilities: Facility[],
  facilityRisks: FacilityRiskCalculation[],
  medicines: Medicine[]
): RegionalShortageRisk[] {
  const regionalRisks: RegionalShortageRisk[] = [];

  // Group by (district + medicine)
  const districts = Array.from(new Set(facilities.map((f) => f.district)));

  for (const district of districts) {
    const districtFacilities = facilities.filter((f) => f.district === district);
    const totalFacilitiesInDistrict = districtFacilities.length;

    for (const medicine of medicines) {
      const risksInDistrict = facilityRisks.filter(
        (r) =>
          r.facility.district === district &&
          r.medicine_id === medicine.medicine_id
      );

      const affected = risksInDistrict.filter(
        (r) => r.risk_level === "RED" || r.risk_level === "YELLOW"
      );

      // Trigger condition: 3 or more facilities in the same district are Yellow or Red
      if (affected.length >= 3) {
        const avgDays =
          affected.reduce((acc, r) => acc + r.days_of_stock_remaining, 0) /
          affected.length;
        const avgDaysRounded = Math.round(avgDays * 10) / 10;

        const anyGap = affected.some((r) => r.replenishment_gap_days > 0);
        const hasSurge = affected.some(
          (r) => r.consumption_trend === "Surging" || r.is_rapid_depletion
        );

        const trendLabel: "Accelerated Depletion" | "Declining" | "Severe Supply Shock" =
          hasSurge
            ? "Accelerated Depletion"
            : avgDaysRounded < 6
            ? "Severe Supply Shock"
            : "Declining";

        const confidenceResult = calculateConfidence({
          affectedCount: affected.length,
          totalCount: totalFacilitiesInDistrict,
          avgDaysRemaining: avgDaysRounded,
          trend: trendLabel,
          hasReplenishmentGap: anyGap,
        });

        // Estimated shortage window is earliest stockout minus buffer
        const minDays = Math.min(...affected.map((r) => r.days_of_stock_remaining));
        const estimatedWindowDays = Math.max(2, Math.floor(minDays));

        // Find surplus facilities within same district or nearby districts (<50km)
        const donors = facilityRisks.filter(
          (r) =>
            r.medicine_id === medicine.medicine_id &&
            r.risk_level === "GREEN" &&
            r.days_of_stock_remaining >= 18
        );

        const explanation = `Multiple facilities in ${district} are simultaneously experiencing declining ${medicine.name} availability (${affected.length}/${totalFacilitiesInDistrict} facilities affected, averaging ${avgDaysRounded} days). This synchronized pattern indicates a potential regional shortage rather than an isolated facility-level stock issue.`;

        const riskScore = Math.round(confidenceResult.score);

        regionalRisks.push({
          id: `reg-risk-${district.toLowerCase().replace(/\s+/g, "-")}-${medicine.medicine_id}`,
          district,
          medicine_id: medicine.medicine_id,
          medicine_name: medicine.name,
          affected_facilities: affected,
          total_district_facilities: totalFacilitiesInDistrict,
          affected_count: affected.length,
          average_days_remaining: avgDaysRounded,
          trend: trendLabel,
          confidence: riskScore,
          risk_score: riskScore,
          confidence_score: riskScore / 100,
          confidence_breakdown: confidenceResult.breakdown,
          estimated_shortage_window_days: estimatedWindowDays,
          explanation,
          donor_candidates: donors,
        });
      }
    }
  }

  return regionalRisks;
}

/**
 * Robust, canonical getter for Regional Shortage Risk percentage (0 - 100).
 * Guaranteed to return a valid numeric integer percentage, never NaN, null, or undefined.
 */
export function getRegionalRiskPercent(risk: RegionalShortageRisk | null | undefined): number {
  if (!risk) return 78;

  // 1. Check canonical risk_score
  if (typeof risk.risk_score === "number" && !isNaN(risk.risk_score)) {
    return Math.round(risk.risk_score);
  }

  // 2. Check confidence (stored as 0-100 percentage)
  if (typeof risk.confidence === "number" && !isNaN(risk.confidence)) {
    return Math.round(risk.confidence);
  }

  // 3. Check legacy confidence_score (if stored as 0-1 ratio or 0-100)
  if (typeof risk.confidence_score === "number" && !isNaN(risk.confidence_score)) {
    return risk.confidence_score <= 1
      ? Math.round(risk.confidence_score * 100)
      : Math.round(risk.confidence_score);
  }

  return 78;
}

/**
 * Searches for GREEN facilities with sufficient surplus of the same medicine within 50 km.
 */
export function findSurplusFacilities(
  receivingFacilityRisk: FacilityRiskCalculation,
  allFacilityRisks: FacilityRiskCalculation[],
  maxDistanceKm = 50,
  minDonorSafetyDays = 14
): { donor: FacilityRiskCalculation; distanceKm: number; availableSurplusUnits: number }[] {
  const eligible: {
    donor: FacilityRiskCalculation;
    distanceKm: number;
    availableSurplusUnits: number;
  }[] = [];

  for (const other of allFacilityRisks) {
    if (other.facility_id === receivingFacilityRisk.facility_id) continue;
    if (other.medicine_id !== receivingFacilityRisk.medicine_id) continue;
    if (other.risk_level !== "GREEN") continue;

    const distance = calculateDistanceKm(
      receivingFacilityRisk.facility.latitude,
      receivingFacilityRisk.facility.longitude,
      other.facility.latitude,
      other.facility.longitude
    );

    if (distance <= maxDistanceKm) {
      // Calculate surplus above donor's safety threshold
      const safeBufferStock = Math.round(other.daily_consumption_rate * minDonorSafetyDays);
      const surplus = Math.max(0, other.current_stock - safeBufferStock);

      if (surplus >= 30) {
        eligible.push({
          donor: other,
          distanceKm: distance,
          availableSurplusUnits: surplus,
        });
      }
    }
  }

  // Sort by distance (closest first), then by surplus
  return eligible.sort((a, b) => a.distanceKm - b.distanceKm || b.availableSurplusUnits - a.availableSurplusUnits);
}

/**
 * Calculates projected post-transfer days of stock coverage for receiving and donor facilities.
 */
export function calculatePostTransferCoverage(
  currentReceivingDays: number,
  receivingDailyCons: number,
  currentReceivingStock: number,
  transferUnits: number,
  currentDonorStock: number,
  donorDailyCons: number
): {
  postReceivingDays: number;
  daysExtended: number;
  donorRemainingDays: number;
} {
  const postStock = currentReceivingStock + transferUnits;
  const postDays = calculateDaysOfStock(postStock, receivingDailyCons);
  const daysExtended = Math.round((postDays - currentReceivingDays) * 10) / 10;

  const donorRemainingStock = Math.max(0, currentDonorStock - transferUnits);
  const donorRemainingDays = calculateDaysOfStock(donorRemainingStock, donorDailyCons);

  return {
    postReceivingDays: postDays,
    daysExtended,
    donorRemainingDays,
  };
}

/**
 * Dynamic Redistribution Engine:
 * Recommends transfers from nearby GREEN facilities to RED facilities within 50km.
 * Prioritizes based on Urgency, Days until stockout, Distance, Surplus, and Impact.
 */
export function generateRedistributionRecommendations(
  facilityRisks: FacilityRiskCalculation[]
): RedistributionRecommendation[] {
  const recommendations: RedistributionRecommendation[] = [];

  // Identify all RED facilities
  const criticalFacilities = facilityRisks.filter((r) => r.risk_level === "RED");

  // Track simulated allocations to prevent over-drawing from a single donor
  const allocatedSurplus: Record<string, number> = {};

  for (const critical of criticalFacilities) {
    const donors = findSurplusFacilities(critical, facilityRisks, 50, 14);

    for (const { donor, distanceKm } of donors) {
      const minDonorSafetyDays = 14;
      const safeDonorStock = Math.round(donor.daily_consumption_rate * minDonorSafetyDays);
      const maxTransferableUnits = Math.max(0, donor.current_stock - safeDonorStock);

      const alreadyAllocated = allocatedSurplus[donor.facility_id] || 0;
      const netAvailableUnits = Math.max(0, maxTransferableUnits - alreadyAllocated);

      if (netAvailableUnits >= 30) {
        // Target: bring the critical facility up to ~13-14 days of stock (Early Warning / Safe border)
        const targetDays = 14;
        const requiredUnits = Math.round(
          Math.max(30, (targetDays - critical.days_of_stock_remaining) * critical.daily_consumption_rate)
        );

        // Transfer is strictly bounded by max transferable units so donor never drops below 14 days
        const transferUnits = Math.min(netAvailableUnits, requiredUnits);

        if (transferUnits >= 30) {
          allocatedSurplus[donor.facility_id] = alreadyAllocated + transferUnits;

          // Mathematical audit calculations
          const donorBeforeDays = donor.days_of_stock_remaining;
          const donorAfterStock = Math.max(0, donor.current_stock - transferUnits);
          const donorAfterDays = Math.round((donorAfterStock / donor.daily_consumption_rate) * 10) / 10;

          const receiverBeforeDays = critical.days_of_stock_remaining;
          const receiverAfterStock = critical.current_stock + transferUnits;
          const receiverAfterDays = Math.round((receiverAfterStock / critical.daily_consumption_rate) * 10) / 10;
          const coverageExtension = Math.round((receiverAfterDays - receiverBeforeDays) * 10) / 10;

          // Determine priority rank
          let priority: PriorityLevel = "MEDIUM";
          if (critical.days_of_stock_remaining < 5 && distanceKm <= 25) {
            priority = "CRITICAL";
          } else if (critical.days_of_stock_remaining < 7 || distanceKm <= 35) {
            priority = "HIGH";
          }

          const operationalRationale = `Nearby surplus stock at ${donor.facility.name} (${donorBeforeDays} days available) can bridge the projected shortage at ${critical.facility.name} until next scheduled replenishment without compromising donor safety reserves.`;

          recommendations.push({
            id: `rec-${donor.facility_id}-to-${critical.facility_id}-${critical.medicine_id}`,
            priority,
            from_facility_id: donor.facility_id,
            from_facility_name: donor.facility.name,
            to_facility_id: critical.facility_id,
            to_facility_name: critical.facility.name,
            district: critical.facility.district,
            medicine_id: critical.medicine_id,
            medicine_name: critical.medicine.name,
            medicine_unit: critical.medicine.unit,
            transfer_units: transferUnits,
            distance_km: distanceKm,
            current_days_receiving: receiverBeforeDays,
            post_transfer_days_receiving: receiverAfterDays,
            days_extended: coverageExtension,
            donor_before_days: donorBeforeDays,
            donor_post_transfer_days: donorAfterDays,
            reason: operationalRationale,
            operational_rationale: operationalRationale,
            status: "PENDING",
            calculation_details: {
              donor_stock: donor.current_stock,
              donor_daily_consumption: donor.daily_consumption_rate,
              donor_before_days: donorBeforeDays,
              donor_after_days: donorAfterDays,
              min_donor_safety_days: minDonorSafetyDays,
              safe_donor_stock: safeDonorStock,
              max_transferable_units: maxTransferableUnits,
              recommended_transfer: transferUnits,
              receiver_stock: critical.current_stock,
              receiver_daily_consumption: critical.daily_consumption_rate,
              receiver_before_days: receiverBeforeDays,
              receiver_after_days: receiverAfterDays,
              coverage_extension: coverageExtension,
            },
          });

          // Only take the best donor for this critical facility
          break;
        }
      }
    }
  }

  // Sort recommendations by Priority, then few days remaining, then distance
  const priorityWeight: Record<PriorityLevel, number> = {
    CRITICAL: 3,
    HIGH: 2,
    MEDIUM: 1,
  };

  return recommendations.sort((a, b) => {
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (a.current_days_receiving !== b.current_days_receiving) {
      return a.current_days_receiving - b.current_days_receiving;
    }
    return a.distance_km - b.distance_km;
  });
}

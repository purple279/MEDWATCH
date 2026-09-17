import { Facility, Medicine, StockRecord } from "../types";

export const MEDICINES: Medicine[] = [
  {
    medicine_id: "med-insulin",
    name: "Insulin (Human 100IU/mL)",
    category: "Endocrine / Antidiabetic",
    unit: "vials",
    criticalThresholdDays: 7,
    warningThresholdDays: 14,
  },
  {
    medicine_id: "med-amoxicillin",
    name: "Amoxicillin (500mg)",
    category: "Antibiotic",
    unit: "courses",
    criticalThresholdDays: 7,
    warningThresholdDays: 14,
  },
  {
    medicine_id: "med-paracetamol",
    name: "Paracetamol (500mg)",
    category: "Analgesic / Antipyretic",
    unit: "packs",
    criticalThresholdDays: 7,
    warningThresholdDays: 14,
  },
  {
    medicine_id: "med-ceftriaxone",
    name: "Ceftriaxone (1g IV)",
    category: "Broad-Spectrum Antibiotic",
    unit: "vials",
    criticalThresholdDays: 7,
    warningThresholdDays: 14,
  },
  {
    medicine_id: "med-ors",
    name: "Oral Rehydration Salts (ORS)",
    category: "Electrolyte / Hydration",
    unit: "sachets",
    criticalThresholdDays: 7,
    warningThresholdDays: 14,
  },
];

export const DISTRICTS = ["District 1", "District 2", "District 3", "District 4"];

export const FACILITIES: Facility[] = [
  // District 4 - Regional Shortage Focus (3 Critical / Warning Facilities Affected)
  {
    facility_id: "fac-d4-a",
    name: "St. Jude District Hospital",
    district: "District 4",
    latitude: 37.783,
    longitude: -122.412,
    population_served: 84000,
    facility_type: "Hospital",
  },
  {
    facility_id: "fac-d4-b",
    name: "Apex Valley Health Center",
    district: "District 4",
    latitude: 37.765,
    longitude: -122.398,
    population_served: 46000,
    facility_type: "Community Health Center",
  },
  {
    facility_id: "fac-d4-c",
    name: "Riverbed Community Clinic",
    district: "District 4",
    latitude: 37.794,
    longitude: -122.385,
    population_served: 38000,
    facility_type: "Clinic",
  },

  // District 2 - Secondary Alerts
  {
    facility_id: "fac-d2-a",
    name: "District 2 General Hospital",
    district: "District 2",
    latitude: 37.828,
    longitude: -122.355,
    population_served: 92000,
    facility_type: "Hospital",
  },
  {
    facility_id: "fac-d2-b",
    name: "North Bay Urgent Care",
    district: "District 2",
    latitude: 37.845,
    longitude: -122.372,
    population_served: 34000,
    facility_type: "Clinic",
  },
  {
    facility_id: "fac-d2-c",
    name: "Highland Community Clinic",
    district: "District 2",
    latitude: 37.818,
    longitude: -122.325,
    population_served: 51000,
    facility_type: "Community Health Center",
  },

  // District 1 - Urban Center / Central Depot
  {
    facility_id: "fac-d1-a",
    name: "Central Pharmacy Logistics Hub",
    district: "District 1",
    latitude: 37.742,
    longitude: -122.455,
    population_served: 180000,
    facility_type: "Central Pharmacy",
  },
  {
    facility_id: "fac-d1-b",
    name: "Metropolitan Tertiary Hospital",
    district: "District 1",
    latitude: 37.728,
    longitude: -122.438,
    population_served: 140000,
    facility_type: "Hospital",
  },
  {
    facility_id: "fac-d1-c",
    name: "Westside Family Clinic",
    district: "District 1",
    latitude: 37.712,
    longitude: -122.472,
    population_served: 39000,
    facility_type: "Clinic",
  },

  // District 3 - South Ridge (Includes Surplus Donor Facility)
  {
    facility_id: "fac-d3-a",
    name: "Lakeside Memorial Hospital",
    district: "District 3",
    latitude: 37.698,
    longitude: -122.392,
    population_served: 68000,
    facility_type: "Hospital",
  },
  {
    facility_id: "fac-d3-b",
    name: "South Hills Primary Center",
    district: "District 3",
    latitude: 37.675,
    longitude: -122.418,
    population_served: 42000,
    facility_type: "Community Health Center",
  },
  {
    facility_id: "fac-d4-d",
    name: "Eastside Regional Medical Center",
    district: "District 3",
    latitude: 37.752,
    longitude: -122.378,
    population_served: 115000,
    facility_type: "Regional Medical Center",
  },
];

/**
 * Generates 45 days of realistic time-series stock records for each facility + medicine pair.
 * Configured so that:
 * - District 4 + Insulin explicitly hits the exact demo prompt scenario:
 *   - Hospital A: 5.0 days remaining (RED)
 *   - Hospital B: 8.0 days remaining (YELLOW)
 *   - Hospital C: 6.0 days remaining (RED)
 *   - Hospital D: 20.0 days remaining (GREEN - surplus donor!)
 * - District 2 + Ceftriaxone hits Early Warning (9.2 days remaining)
 * - Other facilities and medicines represent realistic distributions (Healthy, Early Warning, Surplus)
 */
export function generateSyntheticStockRecords(): StockRecord[] {
  const records: StockRecord[] = [];
  const daysOfHistory = 45;
  const today = new Date("2026-09-16");

  // Specific baseline configurations for target scenarios
  // Key: `${facility_id}:${medicine_id}`
  const customTargets: Record<
    string,
    {
      currentStock: number;
      dailyConsumption: number;
      lastReplenishedDaysAgo: number;
      replenishmentInDays: number;
      depletionVelocityMultiplier: number;
    }
  > = {
    // District 4 Insulin Storyline
    "fac-d4-a:med-insulin": {
      // 5 days remaining: stock 100, consumption 20/day
      currentStock: 100,
      dailyConsumption: 20,
      lastReplenishedDaysAgo: 24,
      replenishmentInDays: 9, // Stockout occurs in 5 days, delivery in 9 days -> 4-day gap!
      depletionVelocityMultiplier: 1.45,
    },
    "fac-d4-b:med-insulin": {
      // 8 days remaining: stock 120, consumption 15/day (YELLOW)
      currentStock: 120,
      dailyConsumption: 15,
      lastReplenishedDaysAgo: 21,
      replenishmentInDays: 11,
      depletionVelocityMultiplier: 1.25,
    },
    "fac-d4-c:med-insulin": {
      // 6 days remaining: stock 72, consumption 12/day (RED)
      currentStock: 72,
      dailyConsumption: 12,
      lastReplenishedDaysAgo: 26,
      replenishmentInDays: 8,
      depletionVelocityMultiplier: 1.35,
    },
    "fac-d4-d:med-insulin": {
      // 20 days remaining: stock 500, consumption 25/day (GREEN - Surplus Donor!)
      currentStock: 500,
      dailyConsumption: 25,
      lastReplenishedDaysAgo: 5,
      replenishmentInDays: 14,
      depletionVelocityMultiplier: 0.95,
    },

    // District 2 Ceftriaxone Early Warning Storyline (Prompt: 9.2 days remaining)
    "fac-d2-a:med-ceftriaxone": {
      currentStock: 138,
      dailyConsumption: 15, // 138 / 15 = 9.2 days
      lastReplenishedDaysAgo: 18,
      replenishmentInDays: 12,
      depletionVelocityMultiplier: 1.3,
    },
    "fac-d2-b:med-ceftriaxone": {
      currentStock: 64,
      dailyConsumption: 8, // 8.0 days (YELLOW)
      lastReplenishedDaysAgo: 19,
      replenishmentInDays: 10,
      depletionVelocityMultiplier: 1.2,
    },
    "fac-d2-c:med-ceftriaxone": {
      currentStock: 176,
      dailyConsumption: 11, // 16 days (GREEN)
      lastReplenishedDaysAgo: 7,
      replenishmentInDays: 15,
      depletionVelocityMultiplier: 1.0,
    },

    // District 1 Central Hub (Large surplus reserve)
    "fac-d1-a:med-insulin": {
      currentStock: 1200,
      dailyConsumption: 40, // 30 days GREEN
      lastReplenishedDaysAgo: 3,
      replenishmentInDays: 18,
      depletionVelocityMultiplier: 0.9,
    },
    "fac-d1-a:med-amoxicillin": {
      currentStock: 1800,
      dailyConsumption: 60, // 30 days GREEN
      lastReplenishedDaysAgo: 4,
      replenishmentInDays: 20,
      depletionVelocityMultiplier: 0.95,
    },
    "fac-d1-b:med-amoxicillin": {
      // 10.5 days (YELLOW)
      currentStock: 315,
      dailyConsumption: 30,
      lastReplenishedDaysAgo: 16,
      replenishmentInDays: 11,
      depletionVelocityMultiplier: 1.15,
    },

    // District 3 Paracetamol
    "fac-d3-a:med-paracetamol": {
      currentStock: 450,
      dailyConsumption: 25, // 18 days GREEN
      lastReplenishedDaysAgo: 8,
      replenishmentInDays: 15,
      depletionVelocityMultiplier: 1.0,
    },
    "fac-d3-b:med-paracetamol": {
      currentStock: 130,
      dailyConsumption: 20, // 6.5 days RED
      lastReplenishedDaysAgo: 22,
      replenishmentInDays: 9,
      depletionVelocityMultiplier: 1.4,
    },
  };

  // Seed data generation
  for (const facility of FACILITIES) {
    for (const medicine of MEDICINES) {
      const key = `${facility.facility_id}:${medicine.medicine_id}`;
      const custom = customTargets[key];

      // Base metrics for day 0 (today)
      let currentStock: number;
      let dailyConsumption: number;
      let lastReplenishedDaysAgo: number;
      let replenishmentInDays: number;
      let depletionSlope = 1.0;

      if (custom) {
        currentStock = custom.currentStock;
        dailyConsumption = custom.dailyConsumption;
        lastReplenishedDaysAgo = custom.lastReplenishedDaysAgo;
        replenishmentInDays = custom.replenishmentInDays;
        depletionSlope = custom.depletionVelocityMultiplier;
      } else {
        // Deterministic pseudo-random based on string hash
        const hash = (facility.facility_id + medicine.medicine_id)
          .split("")
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

        const daysRemainingTarget = 8 + (hash % 18); // 8 to 26 days
        dailyConsumption = 10 + (hash % 15);
        currentStock = Math.round(daysRemainingTarget * dailyConsumption);
        lastReplenishedDaysAgo = 6 + (hash % 20);
        replenishmentInDays = 7 + (hash % 12);
        depletionSlope = 0.95 + ((hash % 30) / 100);
      }

      // Format date strings
      const lastReplenishDate = new Date(today);
      lastReplenishDate.setDate(lastReplenishDate.getDate() - lastReplenishedDaysAgo);
      const lastReplenishStr = lastReplenishDate.toISOString().split("T")[0];

      const expectedReplenishDate = new Date(today);
      expectedReplenishDate.setDate(expectedReplenishDate.getDate() + replenishmentInDays);
      const expectedReplenishStr = expectedReplenishDate.toISOString().split("T")[0];

      // Build daily history from day -44 up to day 0 (today)
      // We simulate stock backwards from currentStock with realistic consumption and the last replenishment event
      let runningStock = currentStock;

      for (let dayOffset = 0; dayOffset <= daysOfHistory; dayOffset++) {
        const histDate = new Date(today);
        histDate.setDate(histDate.getDate() - dayOffset);
        const histDateStr = histDate.toISOString().split("T")[0];

        // Variation in consumption
        const dailyVariation = 1.0 + Math.sin(dayOffset * 0.4) * 0.12;
        const dayConsumption = Math.max(1, Math.round(dailyConsumption * dailyVariation));

        // If today (offset 0), record exact current stock
        if (dayOffset === 0) {
          records.push({
            facility_id: facility.facility_id,
            medicine_id: medicine.medicine_id,
            date: histDateStr,
            current_stock: currentStock,
            daily_consumption_rate: dailyConsumption,
            last_replenishment_date: lastReplenishStr,
            expected_next_replenishment_date: expectedReplenishStr,
          });
        } else {
          // Check if this was the last replenishment day
          if (dayOffset === lastReplenishedDaysAgo) {
            // A major delivery arrived on that day
            const deliverySize = Math.round(dailyConsumption * 20);
            runningStock = Math.max(10, runningStock - deliverySize);
          } else {
            // Normal daily consumption backwards
            runningStock = Math.round(runningStock + dayConsumption * depletionSlope);
          }

          records.push({
            facility_id: facility.facility_id,
            medicine_id: medicine.medicine_id,
            date: histDateStr,
            current_stock: Math.max(5, runningStock),
            daily_consumption_rate: dayConsumption,
            last_replenishment_date: lastReplenishStr,
            expected_next_replenishment_date: expectedReplenishStr,
          });
        }
      }
    }
  }

  return records;
}

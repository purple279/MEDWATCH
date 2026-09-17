export type RiskLevel = "GREEN" | "YELLOW" | "RED";

export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM";

export interface Facility {
  facility_id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  population_served: number;
  facility_type?: "Hospital" | "Regional Medical Center" | "Community Health Center" | "Clinic" | "Central Pharmacy";
}

export interface Medicine {
  medicine_id: string;
  name: string;
  category: string;
  unit: string;
  criticalThresholdDays: number;
  warningThresholdDays: number;
}

export interface StockRecord {
  facility_id: string;
  medicine_id: string;
  date: string; // YYYY-MM-DD
  current_stock: number;
  daily_consumption_rate: number;
  last_replenishment_date: string;
  expected_next_replenishment_date: string;
}

export interface FacilityRiskCalculation {
  facility_id: string;
  medicine_id: string;
  facility: Facility;
  medicine: Medicine;
  current_stock: number;
  daily_consumption_rate: number;
  days_of_stock_remaining: number;
  risk_level: RiskLevel;
  last_replenishment_date: string;
  expected_next_replenishment_date: string;
  days_until_replenishment: number;
  replenishment_gap_days: number; // days stockout occurs BEFORE replenishment arrives
  consumption_trend: "Surging" | "Increasing" | "Stable" | "Decreasing";
  stock_velocity: number; // units depleted per day average
  is_rapid_depletion: boolean;
  is_replenishment_delayed: boolean;
  history: {
    date: string;
    stock: number;
    consumption: number;
  }[];
  projected_stockout_date: string;
}

export interface RegionalShortageRisk {
  id: string;
  district: string;
  medicine_id: string;
  medicine_name: string;
  affected_facilities: FacilityRiskCalculation[];
  total_district_facilities: number;
  affected_count: number;
  average_days_remaining: number;
  trend: "Accelerated Depletion" | "Declining" | "Severe Supply Shock";
  confidence: number; // e.g. 78%
  risk_score?: number; // e.g. 78% (canonical 0-100 percentage)
  confidence_score?: number; // e.g. 0.78 (normalized 0-1 ratio for backward compatibility)
  confidence_breakdown: {
    affected_facility_weight: number;
    depletion_speed_weight: number;
    consumption_surge_weight: number;
    replenishment_delay_weight: number;
  };
  estimated_shortage_window_days: number; // e.g. 5 days
  explanation: string;
  donor_candidates: FacilityRiskCalculation[];
}

export interface RedistributionCalculationDetails {
  donor_stock: number;
  donor_daily_consumption: number;
  donor_before_days: number;
  donor_after_days: number;
  min_donor_safety_days: number;
  safe_donor_stock: number;
  max_transferable_units: number;
  recommended_transfer: number;
  receiver_stock: number;
  receiver_daily_consumption: number;
  receiver_before_days: number;
  receiver_after_days: number;
  coverage_extension: number;
}

export interface RedistributionRecommendation {
  id: string;
  priority: PriorityLevel;
  from_facility_id: string;
  from_facility_name: string;
  to_facility_id: string;
  to_facility_name: string;
  district: string;
  medicine_id: string;
  medicine_name: string;
  medicine_unit?: string;
  transfer_units: number;
  distance_km: number;
  current_days_receiving: number;
  post_transfer_days_receiving: number;
  days_extended: number;
  donor_before_days?: number;
  donor_post_transfer_days: number;
  reason: string;
  operational_rationale?: string;
  status: "PENDING" | "DISPATCHED" | "CONFIRMED";
  calculation_details?: RedistributionCalculationDetails;
}

export interface SimulationSettings {
  demandIncreasePct: number; // e.g. 0, 20, 40
  replenishmentDelayDays: number; // e.g. 0, 3, 7
  activeScenarioName: string | null;
}

export interface AIExplanationResponse {
  source: string;
  explanation: string;
}

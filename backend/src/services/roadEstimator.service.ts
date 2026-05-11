import { ROAD_CONSTANTS, ROAD_THICKNESS_TABLE } from "../config/constants";
import type {
  LayerThicknesses,
  PavementType,
  RoadInput,
  RoadResult,
  SoilType,
  TrafficCategory,
} from "../types/estimator.types";

/**
 * Road Estimator - thickness mapping source of truth.
 *
 * Mapping keys:
 * - pavementType -> trafficCategory -> soilType -> layer thicknesses in millimetres (mm)
 *
 * NOTE:
 * - Auto thickness values come from backend `ROAD_THICKNESS_TABLE` (requirement).
 * - Callers may provide `thicknessOverrides` to override only this one calculation.
 */
export const getRoadAutoThicknesses = (args: {
  pavementType: PavementType;
  trafficCategory: TrafficCategory;
  soilType: SoilType;
}): LayerThicknesses => {
  const { pavementType, trafficCategory, soilType } = args;

  const pavementTable = (ROAD_THICKNESS_TABLE as Record<string, unknown>)[pavementType];
  if (!pavementTable) {
    throw new Error(`Unknown pavement type: '${pavementType}'.`);
  }

  const trafficTable = (pavementTable as Record<string, unknown>)[trafficCategory];
  if (!trafficTable) {
    throw new Error(`No thickness data for ${pavementType} / ${trafficCategory}.`);
  }

  const thicknessMm = (trafficTable as Record<string, unknown>)[soilType];
  if (!thicknessMm) {
    throw new Error(`No thickness data for ${pavementType} / ${trafficCategory} / ${soilType}.`);
  }

  return thicknessMm as LayerThicknesses;
};

const isFinitePositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * Applies manual thickness overrides (mm) for a single calculation.
 * Only known layer keys are applied; non-positive values are ignored.
 */
export const applyThicknessOverrides = (
  auto: LayerThicknesses,
  overrides: unknown
): LayerThicknesses => {
  if (!overrides || typeof overrides !== "object") return auto;

  const next = { ...auto } as Record<string, number>;
  for (const key of Object.keys(next)) {
    const maybe = (overrides as Record<string, unknown>)[key];
    if (isFinitePositiveNumber(maybe)) {
      next[key] = maybe;
    }
  }

  // `LayerThicknesses` is a union; casting through `unknown` keeps TS happy while preserving runtime shape.
  return next as unknown as LayerThicknesses;
};

/**
 * Road Estimator - formulas and units
 *
 * Inputs:
 * - L, W in metres (m)
 * - thicknesses in millimetres (mm)
 *
 * Conversions:
 * - thickness metres: \( T(m) = T(mm) / 1000 \)
 *
 * Outputs:
 * - Bituminous: Q_DBM/Q_BC in tonnes (uses density), Q_GSB/Q_WMM in m³
 * - Concrete: quantities in m³, cement in bags (ceiling, includes wastage)
 * - Gravel: quantities in m³
 */
export const calculateRoadEstimate = (input: RoadInput): RoadResult => {
  const { pavementType, trafficCategory, soilType, roadLength: L, roadWidth: W, thicknessOverrides } =
    input;

  // Step 1: auto thickness mapping from backend table
  const auto = getRoadAutoThicknesses({ pavementType, trafficCategory, soilType });
  // Step 2: optional per-request overrides (mm)
  const t = applyThicknessOverrides(auto, thicknessOverrides);

  const {
    DBM_DENSITY,
    BC_DENSITY,
    BITUMEN_CONTENT,
    AGGREGATE_CONTENT,
    GSB_PROCURE_FACTOR,
    WMM_PROCURE_FACTOR,
    WASTAGE_FACTOR,
    M20_TOTAL_PARTS,
    M20_CEMENT_PARTS,
    M20_SAND_PARTS,
    M20_AGGREGATE_PARTS,
    CEMENT_BAGS_PER_M3,
  } = ROAD_CONSTANTS;

  if (pavementType === "Bituminous") {
    const T_GSB = (t as any).GSB / 1000;
    const T_WMM = (t as any).WMM / 1000;
    const T_DBM = (t as any).DBM / 1000;
    const T_BC = (t as any).BC / 1000;

    // Volumes in m³ (GSB/WMM), weights in tonnes (DBM/BC use density)
    const Q_GSB = L * W * T_GSB;
    const Q_WMM = L * W * T_WMM;
    const Q_DBM = L * W * T_DBM * DBM_DENSITY;
    const Q_BC = L * W * T_BC * BC_DENSITY;

    // Raw materials (tonnes for bitumen/aggregate; m³ for granular layers)
    const Bitumen_Total = (Q_DBM + Q_BC) * BITUMEN_CONTENT;
    const Aggregate_DBM = Q_DBM * AGGREGATE_CONTENT;
    const Aggregate_BC = Q_BC * AGGREGATE_CONTENT;
    const GSB_Procure = Q_GSB * GSB_PROCURE_FACTOR;
    const WMM_Procure = Q_WMM * WMM_PROCURE_FACTOR;
    const DBM_Procure = Q_DBM * WASTAGE_FACTOR;
    const BC_Procure = Q_BC * WASTAGE_FACTOR;

    return {
      layerThicknesses: { GSB: (t as any).GSB, WMM: (t as any).WMM, DBM: (t as any).DBM, BC: (t as any).BC },
      layerQuantities: { Q_GSB, Q_WMM, Q_DBM, Q_BC },
      rawMaterials: {
        Bitumen_Total,
        Aggregate_DBM,
        Aggregate_BC,
        GSB_Procure,
        WMM_Procure,
        DBM_Procure,
        BC_Procure,
      },
    };
  }

  if (pavementType === "Concrete") {
    const T_GSB = (t as any).GSB / 1000;
    const T_DLC = (t as any).DLC / 1000;
    const T_PQC = (t as any).PQC / 1000;

    const Q_GSB = L * W * T_GSB;
    const Q_DLC = L * W * T_DLC;
    const Q_PQC = L * W * T_PQC;
    const Q_Concrete = Q_DLC + Q_PQC;

    // M20 mix breakdown (cement bags uses 30 bags/m³ baseline; final includes wastage)
    const Cement_bags =
      (M20_CEMENT_PARTS / M20_TOTAL_PARTS) * Q_Concrete * CEMENT_BAGS_PER_M3;
    const Sand = (M20_SAND_PARTS / M20_TOTAL_PARTS) * Q_Concrete;
    const Aggregate = (M20_AGGREGATE_PARTS / M20_TOTAL_PARTS) * Q_Concrete;

    const Cement_Final = Math.ceil(Cement_bags * WASTAGE_FACTOR);
    const Sand_Final = Sand * WASTAGE_FACTOR;
    const Aggregate_Final = Aggregate * WASTAGE_FACTOR;
    const GSB_Procure = Q_GSB * GSB_PROCURE_FACTOR;

    return {
      layerThicknesses: { GSB: (t as any).GSB, DLC: (t as any).DLC, PQC: (t as any).PQC },
      layerQuantities: { Q_GSB, Q_DLC, Q_PQC, Q_Concrete },
      rawMaterials: { Cement_Final, Sand_Final, Aggregate_Final, GSB_Procure },
    };
  }

  if (pavementType === "Gravel") {
    const T_Gravel = (t as any).Gravel / 1000;
    const T_GSB = (t as any).GSB / 1000;

    const Q_Gravel = L * W * T_Gravel;
    const Q_GSB = L * W * T_GSB;

    const Gravel_Procure = Q_Gravel * WASTAGE_FACTOR;
    const GSB_Procure = Q_GSB * GSB_PROCURE_FACTOR;

    return {
      layerThicknesses: { Gravel: (t as any).Gravel, GSB: (t as any).GSB },
      layerQuantities: { Q_Gravel, Q_GSB },
      rawMaterials: { Gravel_Procure, GSB_Procure },
    };
  }

  throw new Error(`Unknown pavement type: '${pavementType}'.`);
};


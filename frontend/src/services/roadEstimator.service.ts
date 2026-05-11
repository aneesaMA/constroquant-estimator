/**
 * Road Estimator — fully client-side calculation.
 *
 * All thickness lookups and material calculations run in the browser using
 * the same constants and tables as the backend. No network call is needed,
 * so the estimator works on any device regardless of backend availability.
 */

import { ROAD_CONSTANTS, ROAD_THICKNESS_TABLE } from "../constants/estimator.constants";
import type {
  LayerThicknesses,
  RoadInput,
  RoadResult,
} from "../types/estimator.types";

// ── Thickness lookup ────────────────────────────────────────────────────────

export const getAutoThicknesses = (args: {
  pavementType: string;
  trafficCategory: string;
  soilType: string;
}): LayerThicknesses => {
  const { pavementType, trafficCategory, soilType } = args;

  const pavementTable = (ROAD_THICKNESS_TABLE as Record<string, unknown>)[pavementType];
  if (!pavementTable) throw new Error(`Unknown pavement type: '${pavementType}'.`);

  const trafficTable = (pavementTable as Record<string, unknown>)[trafficCategory];
  if (!trafficTable)
    throw new Error(`No thickness data for ${pavementType} / ${trafficCategory}.`);

  const thicknessMm = (trafficTable as Record<string, unknown>)[soilType];
  if (!thicknessMm)
    throw new Error(
      `No thickness data for ${pavementType} / ${trafficCategory} / ${soilType}.`
    );

  return thicknessMm as LayerThicknesses;
};

/**
 * Kept for backwards compatibility with useRoadEstimator.ts.
 * Returns the thickness object synchronously wrapped in a resolved Promise.
 */
export const fetchRoadAutoThicknesses = (args: {
  pavementType: string;
  trafficCategory: string;
  soilType: string;
}): Promise<LayerThicknesses> => Promise.resolve(getAutoThicknesses(args));

// ── Calculation ─────────────────────────────────────────────────────────────

const applyOverrides = (
  auto: LayerThicknesses,
  overrides: unknown
): LayerThicknesses => {
  if (!overrides || typeof overrides !== "object") return auto;
  const next = { ...auto } as Record<string, number>;
  for (const key of Object.keys(next)) {
    const v = (overrides as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) next[key] = v;
  }
  return next as unknown as LayerThicknesses;
};

export const calculateRoadEstimate = (input: RoadInput): Promise<RoadResult> => {
  const { pavementType, trafficCategory, soilType, roadLength: L, roadWidth: W, thicknessOverrides } =
    input;

  const auto = getAutoThicknesses({ pavementType, trafficCategory, soilType });
  const t = applyOverrides(auto, thicknessOverrides) as unknown as Record<string, number>;

  const {
    DBM_DENSITY, BC_DENSITY, BITUMEN_CONTENT, AGGREGATE_CONTENT,
    GSB_PROCURE_FACTOR, WMM_PROCURE_FACTOR, WASTAGE_FACTOR,
    M20_TOTAL_PARTS, M20_CEMENT_PARTS, M20_SAND_PARTS, M20_AGGREGATE_PARTS,
    CEMENT_BAGS_PER_M3,
  } = ROAD_CONSTANTS;

  let result: RoadResult;

  if (pavementType === "Bituminous") {
    const Q_GSB = L * W * (t.GSB / 1000);
    const Q_WMM = L * W * (t.WMM / 1000);
    const Q_DBM = L * W * (t.DBM / 1000) * DBM_DENSITY;
    const Q_BC  = L * W * (t.BC  / 1000) * BC_DENSITY;

    result = {
      layerThicknesses: { GSB: t.GSB, WMM: t.WMM, DBM: t.DBM, BC: t.BC },
      layerQuantities:  { Q_GSB, Q_WMM, Q_DBM, Q_BC },
      rawMaterials: {
        Bitumen_Total:  (Q_DBM + Q_BC) * BITUMEN_CONTENT,
        Aggregate_DBM:  Q_DBM * AGGREGATE_CONTENT,
        Aggregate_BC:   Q_BC  * AGGREGATE_CONTENT,
        GSB_Procure:    Q_GSB * GSB_PROCURE_FACTOR,
        WMM_Procure:    Q_WMM * WMM_PROCURE_FACTOR,
        DBM_Procure:    Q_DBM * WASTAGE_FACTOR,
        BC_Procure:     Q_BC  * WASTAGE_FACTOR,
      },
    };
  } else if (pavementType === "Concrete") {
    const Q_GSB      = L * W * (t.GSB / 1000);
    const Q_DLC      = L * W * (t.DLC / 1000);
    const Q_PQC      = L * W * (t.PQC / 1000);
    const Q_Concrete = Q_DLC + Q_PQC;

    const Cement_bags = (M20_CEMENT_PARTS / M20_TOTAL_PARTS) * Q_Concrete * CEMENT_BAGS_PER_M3;
    const Sand        = (M20_SAND_PARTS   / M20_TOTAL_PARTS) * Q_Concrete;
    const Aggregate   = (M20_AGGREGATE_PARTS / M20_TOTAL_PARTS) * Q_Concrete;

    result = {
      layerThicknesses: { GSB: t.GSB, DLC: t.DLC, PQC: t.PQC },
      layerQuantities:  { Q_GSB, Q_DLC, Q_PQC, Q_Concrete },
      rawMaterials: {
        Cement_Final:    Math.ceil(Cement_bags * WASTAGE_FACTOR),
        Sand_Final:      Sand      * WASTAGE_FACTOR,
        Aggregate_Final: Aggregate * WASTAGE_FACTOR,
        GSB_Procure:     Q_GSB     * GSB_PROCURE_FACTOR,
      },
    };
  } else if (pavementType === "Gravel") {
    const Q_Gravel = L * W * (t.Gravel / 1000);
    const Q_GSB    = L * W * (t.GSB    / 1000);

    result = {
      layerThicknesses: { Gravel: t.Gravel, GSB: t.GSB },
      layerQuantities:  { Q_Gravel, Q_GSB },
      rawMaterials: {
        Gravel_Procure: Q_Gravel * WASTAGE_FACTOR,
        GSB_Procure:    Q_GSB    * GSB_PROCURE_FACTOR,
      },
    };
  } else {
    return Promise.reject(new Error(`Unknown pavement type: '${pavementType}'.`));
  }

  return Promise.resolve(result);
};

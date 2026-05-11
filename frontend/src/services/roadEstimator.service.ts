import { API_BASE_URL } from "../constants/estimator.constants";
import type { LayerThicknesses, RoadInput, RoadResult } from "../types/estimator.types";

/**
 * Road Estimator APIs
 *
 * - `GET /api/road/thickness`: backend-driven thickness auto-fill values (mm)
 * - `POST /api/road/estimate`: calculation endpoint (supports optional per-request overrides)
 */

export const fetchRoadAutoThicknesses = async (args: {
  pavementType: string;
  trafficCategory: string;
  soilType: string;
}): Promise<LayerThicknesses> => {
  const qs = new URLSearchParams({
    pavementType: args.pavementType,
    trafficCategory: args.trafficCategory,
    soilType: args.soilType,
  });

  const response = await fetch(`${API_BASE_URL}/road/thickness?${qs.toString()}`);
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? "Unable to fetch road thickness values.");
  }

  const data = (await response.json()) as { layerThicknesses: LayerThicknesses };
  return data.layerThicknesses;
};

export const calculateRoadEstimate = async (payload: RoadInput): Promise<RoadResult> => {
  const response = await fetch(`${API_BASE_URL}/road/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(
      errorBody?.message ?? "Unable to calculate road estimate. Please check your inputs."
    );
  }

  return (await response.json()) as RoadResult;
};


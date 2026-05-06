import { API_BASE_URL } from "../constants/estimator.constants";
import type {
  BrickWallInput,
  BrickWallResult,
  EstimateResponse,
  EstimatorInput,
} from "../types/estimator.types";

// Legacy generic estimator
export const calculateEstimate = async (payload: EstimatorInput): Promise<EstimateResponse> => {
  const response = await fetch(`${API_BASE_URL}/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to calculate estimate");
  }

  return (await response.json()) as EstimateResponse;
};

// Brick Wall Estimator
export const calculateBrickWallEstimate = async (
  payload: BrickWallInput
): Promise<BrickWallResult> => {
  const response = await fetch(`${API_BASE_URL}/brick-wall/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(
      errorBody?.message ?? "Unable to calculate brick wall estimate. Please check your inputs."
    );
  }

  return (await response.json()) as BrickWallResult;
};

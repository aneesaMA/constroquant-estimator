import type { BrickWallInput, BrickWallResult } from "../types/estimator.types";
import { calculateBrickWallEstimate } from "./estimator.api";

/**
 * Room Estimator (Brick Wall) - frontend service wrapper.
 *
 * Keeps naming consistent alongside `roadEstimator.service.ts`.
 * API: POST `/api/brick-wall/estimate`
 */
export const calculateRoomEstimate = async (payload: BrickWallInput): Promise<BrickWallResult> => {
  return await calculateBrickWallEstimate(payload);
};


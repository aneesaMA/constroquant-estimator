import { Request, Response } from "express";
import type { RoadInput } from "../types/estimator.types";
import { calculateRoadEstimate, getRoadAutoThicknesses } from "../services/roadEstimator.service";

// ── Validations (shared by Road Estimator APIs) ──────────────────────────────

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * API: POST /api/road/estimate
 * - Uses backend thickness table for auto values.
 * - Allows optional `thicknessOverrides` for this calculation only.
 */
export const estimateRoad = (req: Request, res: Response): void => {
  const body = req.body as Partial<RoadInput>;

  const stringFields: Array<keyof RoadInput> = ["pavementType", "trafficCategory", "soilType"];
  for (const field of stringFields) {
    if (!isNonEmptyString(body[field])) {
      res.status(400).json({ message: `Field '${field}' is required.` });
      return;
    }
  }

  if (!isPositiveNumber(body.roadLength)) {
    res.status(400).json({ message: "Field 'roadLength' must be a positive number." });
    return;
  }
  if (!isPositiveNumber(body.roadWidth)) {
    res.status(400).json({ message: "Field 'roadWidth' must be a positive number." });
    return;
  }

  try {
    const result = calculateRoadEstimate(body as RoadInput);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to calculate road estimate.",
    });
  }
};

/**
 * API: GET /api/road/thickness
 * - Returns auto thicknesses (mm) from backend tables for the given selection.
 * - Intended for frontend auto-fill before running the estimate calculation.
 */
export const getRoadThickness = (req: Request, res: Response): void => {
  const pavementType = String(req.query.pavementType ?? "").trim();
  const trafficCategory = String(req.query.trafficCategory ?? "").trim();
  const soilType = String(req.query.soilType ?? "").trim();

  if (!pavementType || !trafficCategory || !soilType) {
    res.status(400).json({
      message: "Query params 'pavementType', 'trafficCategory', and 'soilType' are required.",
    });
    return;
  }

  try {
    const layerThicknesses = getRoadAutoThicknesses({
      pavementType: pavementType as RoadInput["pavementType"],
      trafficCategory: trafficCategory as RoadInput["trafficCategory"],
      soilType: soilType as RoadInput["soilType"],
    });
    res.status(200).json({ layerThicknesses });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to resolve road thicknesses.",
    });
  }
};


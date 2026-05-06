import { Request, Response } from "express";
import { calculateBrickWall, calculateMaterialEstimate } from "../services/brickWall.service";
import type { BrickWallInput, EstimateRequestBody } from "../types/estimator.types";

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
};

const isNonNegativeInteger = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && Number.isInteger(value);
};

// Legacy generic estimator handler
export const estimateMaterials = (req: Request, res: Response): void => {
  const body = req.body as Partial<EstimateRequestBody>;

  if (
    !body.constructionType ||
    !isPositiveNumber(body.length) ||
    !isPositiveNumber(body.width) ||
    !isPositiveNumber(body.depth)
  ) {
    res.status(400).json({ message: "Invalid payload" });
    return;
  }

  try {
    const result = calculateMaterialEstimate(body as EstimateRequestBody);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to calculate estimate",
    });
  }
};

// Brick Wall Estimator handler
export const estimateBrickWall = (req: Request, res: Response): void => {
  const body = req.body as Partial<BrickWallInput>;

  // Validate all 10 required fields
  const positiveFields: Array<keyof BrickWallInput> = [
    "roomLength",
    "roomBreadth",
    "wallHeight",
    "wallThickness",
    "doorHeight",
    "doorWidth",
    "windowHeight",
    "windowWidth",
  ];

  for (const field of positiveFields) {
    if (!isPositiveNumber(body[field])) {
      res.status(400).json({ message: `Field '${field}' must be a positive number.` });
      return;
    }
  }

  if (!isNonNegativeInteger(body.numDoors)) {
    res.status(400).json({ message: "Field 'numDoors' must be a non-negative integer." });
    return;
  }

  if (!isNonNegativeInteger(body.numWindows)) {
    res.status(400).json({ message: "Field 'numWindows' must be a non-negative integer." });
    return;
  }

  try {
    const result = calculateBrickWall(body as BrickWallInput);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to calculate estimate",
    });
  }
};

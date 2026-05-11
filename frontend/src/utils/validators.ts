import type { BrickWallInput, ConstructionType, EstimatorInput } from "../types/estimator.types";

export const isConstructionType = (value: string): value is ConstructionType => {
  return ["wall", "slab", "plaster", "flooring"].includes(value);
};

export const parseEstimatorForm = (formData: FormData): EstimatorInput | null => {
  const constructionTypeValue = String(formData.get("constructionType") ?? "");
  const length = Number(formData.get("length"));
  const width = Number(formData.get("width"));
  const depth = Number(formData.get("depth"));

  if (!isConstructionType(constructionTypeValue)) {
    return null;
  }

  if (length <= 0 || width <= 0 || depth <= 0) {
    return null;
  }

  return {
    constructionType: constructionTypeValue,
    length,
    width,
    depth,
  };
};

export interface BrickWallValidationError {
  field: string;
  message: string;
}

/** Standard opening sizes used when the user enables the openings toggle */
export const STANDARD_DOOR_HEIGHT = 7;   // ft
export const STANDARD_DOOR_WIDTH  = 3;   // ft
export const STANDARD_WINDOW_HEIGHT = 4; // ft
export const STANDARD_WINDOW_WIDTH  = 4; // ft

export const parseBrickWallForm = (
  formData: FormData
): { input: BrickWallInput; errors: BrickWallValidationError[] } => {
  const errors: BrickWallValidationError[] = [];

  const getPositive = (name: string, label: string): number => {
    const val = Number(formData.get(name));
    if (!Number.isFinite(val) || val <= 0) {
      errors.push({ field: name, message: `${label} must be a positive number.` });
      return 0;
    }
    return val;
  };

  const getNonNegativeInt = (name: string, label: string): number => {
    const val = Number(formData.get(name));
    if (!Number.isFinite(val) || val < 0 || !Number.isInteger(val)) {
      errors.push({ field: name, message: `${label} must be a non-negative whole number.` });
      return 0;
    }
    return val;
  };

  const roomLength    = getPositive("roomLength",    "Room Length");
  const roomBreadth   = getPositive("roomBreadth",   "Room Breadth");
  const wallHeight    = getPositive("wallHeight",    "Wall Height");
  const wallThickness = getPositive("wallThickness", "Wall Thickness");

  // Openings are optional — only parsed when the toggle is checked
  const includeOpenings = formData.get("includeOpenings") === "on";

  const numDoors   = includeOpenings ? getNonNegativeInt("numDoors",   "Number of Doors")   : 0;
  const numWindows = includeOpenings ? getNonNegativeInt("numWindows", "Number of Windows") : 0;

  return {
    input: {
      roomLength,
      roomBreadth,
      wallHeight,
      wallThickness,
      // Standard sizes injected here — user never enters these
      doorHeight:   STANDARD_DOOR_HEIGHT,
      doorWidth:    STANDARD_DOOR_WIDTH,
      numDoors,
      windowHeight: STANDARD_WINDOW_HEIGHT,
      windowWidth:  STANDARD_WINDOW_WIDTH,
      numWindows,
    },
    errors,
  };
};

import { BRICK_WALL_CONSTANTS, MATERIAL_FACTORS } from "../config/constants";
import type {
  BrickWallInput,
  BrickWallResult,
  EstimateRequestBody,
  EstimateResult,
} from "../types/estimator.types";

/**
 * Calculates brick wall material estimates using the 7-step CFT algorithm.
 *
 * Algorithm:
 *  1. Gross_Wall_Vol  = 2 × (L + B) × H × T
 *  2. Opening_Vol     = (Hd × Wd × T × Nd) + (Hw × Ww × T × Nw)
 *  3. Net_Vol         = Gross_Wall_Vol − Opening_Vol
 *  4. Bricks          = CEIL(Net_Vol × 9.40 × 1.05)
 *  5. Mortar_Dry      = Net_Vol × 0.30 × 1.33
 *  6. Cement_bags     = CEIL((1/7 × Mortar_Dry) / 1.25)
 *  7. Sand_CFT        = (6/7) × Mortar_Dry
 */
export const calculateBrickWall = (input: BrickWallInput): BrickWallResult => {
  const {
    roomLength: L,
    roomBreadth: B,
    wallHeight: H,
    wallThickness: T,
    doorHeight: Hd,
    doorWidth: Wd,
    numDoors: Nd,
    windowHeight: Hw,
    windowWidth: Ww,
    numWindows: Nw,
  } = input;

  const {
    BRICKS_PER_CFT,
    WASTAGE_FACTOR,
    MORTAR_CONTENT_RATIO,
    DRY_MORTAR_FACTOR,
    CEMENT_FRACTION,
    SAND_FRACTION,
    CEMENT_BAG_VOLUME_CFT,
  } = BRICK_WALL_CONSTANTS;

  // Step 1: Gross wall volume
  const grossWallVolume = 2 * (L + B) * H * T;

  // Step 2: Opening volume
  const openingVolume = Hd * Wd * T * Nd + Hw * Ww * T * Nw;

  // Step 3: Net wall volume
  const netWallVolume = grossWallVolume - openingVolume;

  if (netWallVolume <= 0) {
    throw new Error(
      "Opening volume equals or exceeds gross wall volume. Please check your inputs."
    );
  }

  // Step 4: Bricks (with 5% wastage, ceiling)
  const bricks = Math.ceil(netWallVolume * BRICKS_PER_CFT * WASTAGE_FACTOR);

  // Step 5: Dry mortar volume
  const mortarDry = netWallVolume * MORTAR_CONTENT_RATIO * DRY_MORTAR_FACTOR;

  // Step 6: Cement bags (ceiling)
  const cementBags = Math.ceil((CEMENT_FRACTION * mortarDry) / CEMENT_BAG_VOLUME_CFT);

  // Step 7: Sand in CFT
  const sandCFT = SAND_FRACTION * mortarDry;

  return {
    bricks,
    cementBags,
    sandCFT: Math.round(sandCFT * 100) / 100,
    netWallVolume: Math.round(netWallVolume * 100) / 100,
    grossWallVolume: Math.round(grossWallVolume * 100) / 100,
    openingVolume: Math.round(openingVolume * 100) / 100,
  };
};

// Legacy generic estimator (kept for backward compatibility)
export const calculateMaterialEstimate = (payload: EstimateRequestBody): EstimateResult => {
  const volume = payload.length * payload.width * payload.depth;

  switch (payload.constructionType) {
    case "wall":
      return {
        material: "Brick Wall",
        volume,
        estimatedBricks: Math.ceil(volume * MATERIAL_FACTORS.BRICKS_PER_M3),
      };
    case "slab":
      return {
        material: "Concrete Slab",
        volume,
        estimatedBags: Math.ceil(volume * MATERIAL_FACTORS.CEMENT_BAGS_PER_M3),
      };
    case "plaster":
      return {
        material: "Plastering",
        volume,
        estimatedBags: Math.ceil(volume * MATERIAL_FACTORS.PLASTER_BAGS_PER_M3),
      };
    case "flooring":
      return {
        material: "Flooring",
        volume,
        estimatedBags: Math.ceil(volume * MATERIAL_FACTORS.FLOORING_BAGS_PER_M3),
      };
    default:
      throw new Error("Unsupported construction type");
  }
};

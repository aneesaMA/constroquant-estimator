export type ConstructionType = "wall" | "slab" | "plaster" | "flooring";

export interface EstimatorInput {
  constructionType: ConstructionType;
  length: number;
  width: number;
  depth: number;
}

export interface EstimateResponse {
  material: string;
  volume: number;
  estimatedBags?: number;
  estimatedBricks?: number;
}

// Brick Wall Estimator types
export interface BrickWallInput {
  roomLength: number;
  roomBreadth: number;
  wallHeight: number;
  wallThickness: number;
  doorHeight: number;
  doorWidth: number;
  numDoors: number;
  windowHeight: number;
  windowWidth: number;
  numWindows: number;
}

export interface BrickWallResult {
  bricks: number;
  cementBags: number;
  sandCFT: number;
  netWallVolume: number;
  grossWallVolume: number;
  openingVolume: number;
}

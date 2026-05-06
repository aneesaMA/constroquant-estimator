export type ConstructionType = "wall" | "slab" | "plaster" | "flooring";

export interface EstimateRequestBody {
  constructionType: ConstructionType;
  length: number;
  width: number;
  depth: number;
}

export interface EstimateResult {
  material: string;
  volume: number;
  estimatedBags?: number;
  estimatedBricks?: number;
}

// Brick Wall Estimator types
export interface BrickWallInput {
  roomLength: number;       // L - ft
  roomBreadth: number;      // B - ft
  wallHeight: number;       // H - ft
  wallThickness: number;    // T - ft
  doorHeight: number;       // Hd - ft
  doorWidth: number;        // Wd - ft
  numDoors: number;         // Nd - nos
  windowHeight: number;     // Hw - ft
  windowWidth: number;      // Ww - ft
  numWindows: number;       // Nw - nos
}

export interface BrickWallResult {
  bricks: number;           // nos (ceiling, includes 5% wastage)
  cementBags: number;       // nos (ceiling, 50 kg bags)
  sandCFT: number;          // ft³
  netWallVolume: number;    // ft³
  grossWallVolume: number;  // ft³
  openingVolume: number;    // ft³
}

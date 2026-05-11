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

// ── Road Construction Estimator types ──────────────────────────────────────

export type PavementType = "Bituminous" | "Concrete" | "Gravel";

export type TrafficCategory = "Low" | "Medium" | "High" | "Heavy Industrial";

export type SoilType = "Strong" | "Medium" | "Weak";

export interface RoadInput {
  pavementType: PavementType;
  trafficCategory: TrafficCategory;
  soilType: SoilType;
  roadLength: number;   // metres
  roadWidth: number;    // metres
  /**
   * Road Estimator: optional manual thickness overrides (mm).
   * - Auto values are still sourced from backend `ROAD_THICKNESS_TABLE`.
   * - Overrides apply only to the current calculation request.
   */
  thicknessOverrides?: Partial<LayerThicknesses>;
}

// Layer thicknesses (mm)
export interface BituminousThicknesses {
  GSB: number; WMM: number; DBM: number; BC: number;
}
export interface ConcreteThicknesses {
  GSB: number; DLC: number; PQC: number;
}
export interface GravelThicknesses {
  Gravel: number; GSB: number;
}
export type LayerThicknesses = BituminousThicknesses | ConcreteThicknesses | GravelThicknesses;

// Layer quantities
export interface BituminousLayerQuantities {
  Q_GSB: number;   // m³
  Q_WMM: number;   // m³
  Q_DBM: number;   // tonnes
  Q_BC:  number;   // tonnes
}
export interface ConcreteLayerQuantities {
  Q_GSB:      number;  // m³
  Q_DLC:      number;  // m³
  Q_PQC:      number;  // m³
  Q_Concrete: number;  // m³
}
export interface GravelLayerQuantities {
  Q_Gravel: number;  // m³
  Q_GSB:    number;  // m³
}
export type LayerQuantities = BituminousLayerQuantities | ConcreteLayerQuantities | GravelLayerQuantities;

// Raw material procurement quantities
export interface BituminousRawMaterials {
  Bitumen_Total:  number;  // tonnes
  Aggregate_DBM:  number;  // tonnes
  Aggregate_BC:   number;  // tonnes
  GSB_Procure:    number;  // m³
  WMM_Procure:    number;  // m³
  DBM_Procure:    number;  // tonnes
  BC_Procure:     number;  // tonnes
}
export interface ConcreteRawMaterials {
  Cement_Final:    number;  // bags (ceiling)
  Sand_Final:      number;  // m³
  Aggregate_Final: number;  // m³
  GSB_Procure:     number;  // m³
}
export interface GravelRawMaterials {
  Gravel_Procure: number;  // m³
  GSB_Procure:    number;  // m³
}
export type RawMaterials = BituminousRawMaterials | ConcreteRawMaterials | GravelRawMaterials;

export interface RoadResult {
  layerThicknesses: LayerThicknesses;
  layerQuantities:  LayerQuantities;
  rawMaterials:     RawMaterials;
}

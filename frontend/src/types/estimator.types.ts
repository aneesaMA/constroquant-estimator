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

// ── Road Construction Estimator types ──────────────────────────────────────

export type PavementType = "Bituminous" | "Concrete" | "Gravel";

export type TrafficCategory = "Low" | "Medium" | "High" | "Heavy Industrial";

export type SoilType = "Strong" | "Medium" | "Weak";

export interface RoadInput {
  pavementType: PavementType;
  trafficCategory: TrafficCategory;
  soilType: SoilType;
  roadLength: number;
  roadWidth: number;
  /**
   * Road Estimator: optional manual thickness overrides (mm).
   * Auto thickness values are resolved via backend thickness tables.
   */
  thicknessOverrides?: Partial<LayerThicknesses>;
}

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

export interface BituminousLayerQuantities {
  Q_GSB: number; Q_WMM: number; Q_DBM: number; Q_BC: number;
}
export interface ConcreteLayerQuantities {
  Q_GSB: number; Q_DLC: number; Q_PQC: number; Q_Concrete: number;
}
export interface GravelLayerQuantities {
  Q_Gravel: number; Q_GSB: number;
}
export type LayerQuantities = BituminousLayerQuantities | ConcreteLayerQuantities | GravelLayerQuantities;

export interface BituminousRawMaterials {
  Bitumen_Total: number; Aggregate_DBM: number; Aggregate_BC: number;
  GSB_Procure: number; WMM_Procure: number; DBM_Procure: number; BC_Procure: number;
}
export interface ConcreteRawMaterials {
  Cement_Final: number; Sand_Final: number; Aggregate_Final: number; GSB_Procure: number;
}
export interface GravelRawMaterials {
  Gravel_Procure: number; GSB_Procure: number;
}
export type RawMaterials = BituminousRawMaterials | ConcreteRawMaterials | GravelRawMaterials;

export interface RoadResult {
  layerThicknesses: LayerThicknesses;
  layerQuantities: LayerQuantities;
  rawMaterials: RawMaterials;
}

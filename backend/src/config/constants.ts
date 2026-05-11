export const SERVER_CONFIG = {
  PORT: 4000,
};

export const MATERIAL_FACTORS = {
  BRICKS_PER_M3: 500,
  CEMENT_BAGS_PER_M3: 8,
  PLASTER_BAGS_PER_M3: 4,
  FLOORING_BAGS_PER_M3: 6,
};

// Brick Wall Estimator constants (CFT-based)
export const BRICK_WALL_CONSTANTS = {
  /** Nominal brick volume including 0.5" mortar joint: 10.5" × 5" × 3.5" ÷ 1728 */
  NOMINAL_BRICK_VOLUME_CFT: 0.1063,
  /** Bricks per cubic foot: 1 ÷ 0.1063 */
  BRICKS_PER_CFT: 9.40,
  /** 5% wastage multiplier */
  WASTAGE_FACTOR: 1.05,
  /** Mortar content as fraction of net wall volume (wet) */
  MORTAR_CONTENT_RATIO: 0.30,
  /** Dry mortar factor for sand bulking */
  DRY_MORTAR_FACTOR: 1.33,
  /** Cement fraction in 1:6 mix (1 part cement out of 7 total) */
  CEMENT_FRACTION: 1 / 7,
  /** Sand fraction in 1:6 mix (6 parts sand out of 7 total) */
  SAND_FRACTION: 6 / 7,
  /** Bulk volume of one 50 kg cement bag in ft³ */
  CEMENT_BAG_VOLUME_CFT: 1.25,
};

// ── Road Construction Estimator constants ───────────────────────────────────

export const ROAD_CONSTANTS = {
  DBM_DENSITY:          2.4,
  BC_DENSITY:           2.4,
  BITUMEN_CONTENT:      0.05,
  AGGREGATE_CONTENT:    0.95,
  GSB_COMPACTION:       1.25,
  WMM_COMPACTION:       1.20,
  WASTAGE_FACTOR:       1.03,
  GSB_PROCURE_FACTOR:   1.29,
  WMM_PROCURE_FACTOR:   1.24,
  M20_TOTAL_PARTS:      5.5,
  M20_CEMENT_PARTS:     1,
  M20_SAND_PARTS:       1.5,
  M20_AGGREGATE_PARTS:  3,
  CEMENT_BAGS_PER_M3:   30,
} as const;

export const ROAD_THICKNESS_TABLE = {
  Bituminous: {
    Low: {
      Strong: { GSB: 150, WMM: 200, DBM:  50, BC: 25 },
      Medium: { GSB: 175, WMM: 225, DBM:  60, BC: 30 },
      Weak:   { GSB: 200, WMM: 250, DBM:  75, BC: 40 },
    },
    Medium: {
      Strong: { GSB: 175, WMM: 225, DBM:  60, BC: 30 },
      Medium: { GSB: 200, WMM: 250, DBM:  75, BC: 40 },
      Weak:   { GSB: 225, WMM: 275, DBM:  90, BC: 40 },
    },
    High: {
      Strong: { GSB: 200, WMM: 250, DBM:  75, BC: 40 },
      Medium: { GSB: 225, WMM: 275, DBM:  90, BC: 50 },
      Weak:   { GSB: 250, WMM: 300, DBM: 100, BC: 50 },
    },
    "Heavy Industrial": {
      Strong: { GSB: 250, WMM: 300, DBM: 100, BC: 50 },
      Medium: { GSB: 275, WMM: 325, DBM: 110, BC: 50 },
      Weak:   { GSB: 300, WMM: 350, DBM: 120, BC: 60 },
    },
  },
  Concrete: {
    Low: {
      Strong: { GSB: 100, DLC: 100, PQC: 200 },
      Medium: { GSB: 125, DLC: 125, PQC: 220 },
      Weak:   { GSB: 150, DLC: 150, PQC: 230 },
    },
    Medium: {
      Strong: { GSB: 125, DLC: 125, PQC: 220 },
      Medium: { GSB: 150, DLC: 150, PQC: 250 },
      Weak:   { GSB: 175, DLC: 175, PQC: 280 },
    },
    High: {
      Strong: { GSB: 150, DLC: 150, PQC: 250 },
      Medium: { GSB: 175, DLC: 175, PQC: 280 },
      Weak:   { GSB: 200, DLC: 200, PQC: 300 },
    },
  },
  Gravel: {
    Low: {
      Strong: { Gravel: 100, GSB: 100 },
      Medium: { Gravel: 125, GSB: 100 },
      Weak:   { Gravel: 150, GSB: 100 },
    },
    Medium: {
      Strong: { Gravel: 150, GSB: 125 },
      Medium: { Gravel: 175, GSB: 125 },
      Weak:   { Gravel: 200, GSB: 125 },
    },
    High: {
      Strong: { Gravel: 200, GSB: 150 },
      Medium: { Gravel: 225, GSB: 150 },
      Weak:   { Gravel: 250, GSB: 150 },
    },
  },
} as const;

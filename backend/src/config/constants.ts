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

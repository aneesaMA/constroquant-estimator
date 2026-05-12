import type { ConstructionType } from "../types/estimator.types";

export const API_BASE_URL = "https://constroquant-estimator.onrender.com/api";

export const CONSTRUCTION_TYPE_OPTIONS: Array<{
  value: ConstructionType;
  label: string;
}> = [
  { value: "wall", label: "Brick Wall" },
  { value: "slab", label: "Concrete Slab" },
  { value: "plaster", label: "Plastering" },
  { value: "flooring", label: "Flooring" },
];

export const WALL_THICKNESS_OPTIONS = [
  { value: "0.75", label: '9" Full Brick (0.75 ft)' },
  { value: "0.375", label: '4.5" Half Brick (0.375 ft)' },
];

// ── Road Construction Estimator options ────────────────────────────────────

export const PAVEMENT_TYPE_OPTIONS = [
  { value: "",            label: "Select pavement type" },
  { value: "Bituminous",  label: "Bituminous Road" },
  { value: "Concrete",    label: "Concrete Road" },
  { value: "Gravel",      label: "Gravel Road" },
];

export const TRAFFIC_CATEGORY_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  Bituminous: [
    { value: "",                 label: "Select traffic category" },
    { value: "Low",              label: "Low Traffic" },
    { value: "Medium",           label: "Medium Traffic" },
    { value: "High",             label: "High Traffic" },
    { value: "Heavy Industrial", label: "Heavy Industrial" },
  ],
  Concrete: [
    { value: "",       label: "Select traffic category" },
    { value: "Low",    label: "Low Traffic" },
    { value: "Medium", label: "Medium Traffic" },
    { value: "High",   label: "High Traffic" },
  ],
  Gravel: [
    { value: "",       label: "Select traffic category" },
    { value: "Low",    label: "Low Traffic" },
    { value: "Medium", label: "Medium Traffic" },
    { value: "High",   label: "High Traffic" },
  ],
};

export const SOIL_TYPE_OPTIONS = [
  { value: "",       label: "Select soil type" },
  { value: "Strong", label: "Strong Soil (CBR 10%)" },
  { value: "Medium", label: "Medium Soil (CBR 5%)" },
  { value: "Weak",   label: "Weak Soil (CBR 3%)" },
];

// ── Road calculation constants (mirrors backend — no network call needed) ──

export const ROAD_CONSTANTS = {
  DBM_DENSITY:         2.4,
  BC_DENSITY:          2.4,
  BITUMEN_CONTENT:     0.05,
  AGGREGATE_CONTENT:   0.95,
  GSB_PROCURE_FACTOR:  1.29,
  WMM_PROCURE_FACTOR:  1.24,
  WASTAGE_FACTOR:      1.03,
  M20_TOTAL_PARTS:     5.5,
  M20_CEMENT_PARTS:    1,
  M20_SAND_PARTS:      1.5,
  M20_AGGREGATE_PARTS: 3,
  CEMENT_BAGS_PER_M3:  30,
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

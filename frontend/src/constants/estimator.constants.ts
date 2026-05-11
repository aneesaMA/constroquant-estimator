import type { ConstructionType } from "../types/estimator.types";

export const API_BASE_URL = "http://localhost:4000/api";

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

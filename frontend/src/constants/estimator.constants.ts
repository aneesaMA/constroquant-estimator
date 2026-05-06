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

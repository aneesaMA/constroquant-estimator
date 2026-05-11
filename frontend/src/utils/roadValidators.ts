import type { PavementType, RoadInput, SoilType, TrafficCategory } from "../types/estimator.types";

export interface RoadValidationError {
  field: string;
  message: string;
}

export const parseRoadForm = (
  formData: FormData
): { input: RoadInput; errors: RoadValidationError[] } => {
  const errors: RoadValidationError[] = [];

  const getString = (name: string, label: string): string => {
    const val = String(formData.get(name) ?? "").trim();
    if (!val) {
      errors.push({ field: name, message: `${label} is required.` });
    }
    return val;
  };

  const getPositive = (name: string, label: string): number => {
    const val = Number(formData.get(name));
    if (!Number.isFinite(val) || val <= 0) {
      errors.push({ field: name, message: `${label} must be a positive number.` });
      return 0;
    }
    return val;
  };

  const pavementType = getString("pavementType", "Pavement Type") as PavementType;
  const trafficCategory = getString("trafficCategory", "Traffic Category") as TrafficCategory;
  const soilType = getString("soilType", "Soil Type") as SoilType;
  const roadLength = getPositive("roadLength", "Road Length");
  const roadWidth = getPositive("roadWidth", "Road Width");

  return {
    input: {
      pavementType,
      trafficCategory,
      soilType,
      roadLength,
      roadWidth,
    },
    errors,
  };
};

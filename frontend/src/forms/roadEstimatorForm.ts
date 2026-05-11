import { InputField, SelectField } from "../components/InputField";
import { PAVEMENT_TYPE_OPTIONS, SOIL_TYPE_OPTIONS } from "../constants/estimator.constants";

/**
 * Road Estimator UI (string-template based).
 *
 * UX rules:
 * - Thickness auto-fill values come from backend thickness tables (via `/api/road/thickness`).
 * - Users can manually edit the auto-filled thicknesses before calculation.
 * - Manual edits override only the current calculation request.
 */

const renderPavementSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Pavement &amp; Traffic</legend>
      <div class="input-grid input-grid-2">
        ${SelectField({
          id: "pavementType",
          name: "pavementType",
          label: "Pavement Type",
          options: PAVEMENT_TYPE_OPTIONS,
        })}
        ${SelectField({
          id: "trafficCategory",
          name: "trafficCategory",
          label: "Traffic Category",
          options: [{ value: "", label: "Select pavement type first" }],
        })}
      </div>
    </fieldset>
  `;
};

const renderSoilSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Soil Conditions</legend>
      <div class="input-grid input-grid-2">
        ${SelectField({
          id: "soilType",
          name: "soilType",
          label: "Soil Type",
          options: SOIL_TYPE_OPTIONS,
        })}
      </div>
    </fieldset>
  `;
};

const renderThicknessSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Layer Thickness (mm)</legend>
      <p class="helper-text" style="margin: 0 0 10px 0;">
        Auto-filled from standard tables. You can edit before calculating.
      </p>
      <div id="road-thickness-fields" class="input-grid input-grid-2"></div>
    </fieldset>
  `;
};

const renderDimensionsSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Road Dimensions</legend>
      <div class="input-grid input-grid-2">
        ${InputField({ id: "roadLength", name: "roadLength", label: "Road Length (m)", placeholder: "e.g. 100" })}
        ${InputField({ id: "roadWidth", name: "roadWidth", label: "Road Width (m)", placeholder: "e.g. 7" })}
      </div>
    </fieldset>
  `;
};

export const roadEstimatorForm = (): string => {
  return `
    <form id="road-estimate-form" novalidate>
      ${renderPavementSection()}
      ${renderSoilSection()}
      ${renderThicknessSection()}
      ${renderDimensionsSection()}
      <button type="submit" class="bw-submit-btn">
        <span aria-hidden="true">🛣️</span> Calculate Materials
      </button>
    </form>
  `;
};


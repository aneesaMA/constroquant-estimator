import { InputField, SelectField } from "../components/InputField";
import { WALL_THICKNESS_OPTIONS } from "../constants/estimator.constants";

/**
 * Room Estimator UI (Brick Wall Material Estimator).
 * Separated from the Road Estimator to keep concerns and future changes isolated.
 *
 * Standard opening sizes (used internally, not entered by user):
 *   Door:   7 ft × 3 ft
 *   Window: 4 ft × 4 ft
 */

const renderRoomDimensionsSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Room Dimensions</legend>
      <div class="input-grid input-grid-2">
        ${InputField({ id: "roomLength", name: "roomLength", label: "Room Length (ft)", placeholder: "e.g. 16" })}
        ${InputField({ id: "roomBreadth", name: "roomBreadth", label: "Room Breadth (ft)", placeholder: "e.g. 13" })}
        ${InputField({ id: "wallHeight", name: "wallHeight", label: "Wall Height (ft)", placeholder: "e.g. 10" })}
        ${SelectField({
          id: "wallThickness",
          name: "wallThickness",
          label: "Wall Thickness",
          options: WALL_THICKNESS_OPTIONS,
          defaultValue: "0.75",
        })}
      </div>
    </fieldset>
  `;
};

const renderOpeningsSection = (): string => {
  return `
    <div class="bw-toggle-row">
      <label class="bw-toggle-label" for="includeOpenings">
        <input
          type="checkbox"
          id="includeOpenings"
          name="includeOpenings"
          class="bw-toggle-checkbox"
        />
        <span class="bw-toggle-track" aria-hidden="true"></span>
        Include Doors &amp; Windows
      </label>
      <span class="bw-toggle-hint">Standard sizes: Door 7×3 ft · Window 4×4 ft</span>
    </div>
    <div id="openings-fields" class="bw-openings-fields bw-openings-hidden">
      <fieldset class="bw-fieldset">
        <legend class="bw-legend">Openings</legend>
        <div class="input-grid input-grid-2">
          ${InputField({ id: "numDoors", name: "numDoors", label: "Number of Doors", placeholder: "e.g. 1", step: "1", min: "0" })}
          ${InputField({ id: "numWindows", name: "numWindows", label: "Number of Windows", placeholder: "e.g. 2", step: "1", min: "0" })}
        </div>
      </fieldset>
    </div>
  `;
};

export const roomEstimatorForm = (): string => {
  return `
    <form id="estimate-form" novalidate>
      ${renderRoomDimensionsSection()}
      ${renderOpeningsSection()}
      <button type="submit" class="bw-submit-btn">
        <span aria-hidden="true">🧮</span> Calculate Materials
      </button>
    </form>
  `;
};



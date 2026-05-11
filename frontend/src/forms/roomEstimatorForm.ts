import { InputField, SelectField } from "../components/InputField";
import { WALL_THICKNESS_OPTIONS } from "../constants/estimator.constants";

/**
 * Room Estimator UI (Brick Wall Material Estimator).
 * Separated from the Road Estimator to keep concerns and future changes isolated.
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

const renderDoorsSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Doors</legend>
      <div class="input-grid input-grid-3">
        ${InputField({ id: "doorHeight", name: "doorHeight", label: "Door Height (ft)", placeholder: "e.g. 7" })}
        ${InputField({ id: "doorWidth", name: "doorWidth", label: "Door Width (ft)", placeholder: "e.g. 3" })}
        ${InputField({ id: "numDoors", name: "numDoors", label: "Number of Doors", placeholder: "e.g. 1", step: "1", min: "0" })}
      </div>
    </fieldset>
  `;
};

const renderWindowsSection = (): string => {
  return `
    <fieldset class="bw-fieldset">
      <legend class="bw-legend">Windows</legend>
      <div class="input-grid input-grid-3">
        ${InputField({ id: "windowHeight", name: "windowHeight", label: "Window Height (ft)", placeholder: "e.g. 4" })}
        ${InputField({ id: "windowWidth", name: "windowWidth", label: "Window Width (ft)", placeholder: "e.g. 4" })}
        ${InputField({ id: "numWindows", name: "numWindows", label: "Number of Windows", placeholder: "e.g. 2", step: "1", min: "0" })}
      </div>
    </fieldset>
  `;
};

export const roomEstimatorForm = (): string => {
  return `
    <form id="estimate-form" novalidate>
      ${renderRoomDimensionsSection()}
      ${renderDoorsSection()}
      ${renderWindowsSection()}
      <button type="submit" class="bw-submit-btn">
        <span aria-hidden="true">🧮</span> Calculate Materials
      </button>
    </form>
  `;
};


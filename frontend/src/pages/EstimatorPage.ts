import { InputField, SelectField } from "../components/InputField";
import { SectionCard } from "../components/SectionCard";
import { WALL_THICKNESS_OPTIONS } from "../constants/estimator.constants";

const renderConstructionSelectorSection = (): string => {
  return `
    <div class="selector-section">
      ${SelectField({
        id: "constructionType",
        name: "constructionType",
        label: "Construction Type",
        options: [
          { value: "", label: "Select construction type" },
          { value: "brick-wall", label: "Brick Wall" },
        ],
      })}
    </div>
  `;
};

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

export const renderBrickWallForm = (): string => {
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

const renderEmptyState = (): string => {
  return `
    <div class="empty-state fade-in" aria-live="polite">
      <div class="empty-state-icon" aria-hidden="true">🏗️</div>
      <h3>Select a construction type</h3>
      <p>Choose a type to load the estimator form and start calculating materials.</p>
    </div>
  `;
};

export const EstimatorPage = (): string => {
  const formContent = `
    ${renderConstructionSelectorSection()}
    <div id="dynamic-form-container">${renderEmptyState()}</div>
    <div id="result" aria-live="polite"></div>
  `;

  return `
    <main class="page">
      <header class="topbar" role="banner">
        <div class="brand" aria-label="ConstroMat">ConstroMat</div>
        <nav class="menu" aria-label="Main navigation">
          <a href="#">Home</a>
          <a href="#">Products</a>
          <a href="#">Technology</a>
          <a href="#">About</a>
        </nav>
      </header>
      <section class="hero-section">
        <div class="hero-copy">
          <h1><span>Brick Wall</span> Material Estimator</h1>
          <p>
            Enter your room dimensions, wall thickness, and opening details to get an accurate
            breakdown of bricks, cement, and sand required — all in CFT.
          </p>
          <div class="hero-badges" aria-hidden="true">
            <span class="hero-badge">🧱 Bricks</span>
            <span class="hero-badge">🏗️ Cement</span>
            <span class="hero-badge">⛱️ Sand</span>
          </div>
        </div>
        ${SectionCard({
          title: "Estimate Materials",
          subtitle: "All dimensions in feet · Mix ratio 1:6 · Includes 5% brick wastage",
          content: formContent,
          className: "estimator-card",
        })}
      </section>
    </main>
  `;
};

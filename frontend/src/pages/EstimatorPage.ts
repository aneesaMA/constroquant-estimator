import { SelectField } from "../components/InputField";
import { SectionCard } from "../components/SectionCard";
import { roomEstimatorForm } from "../forms/roomEstimatorForm.ts";

const renderConstructionSelectorSection = (): string => {
  return `
    <div class="selector-section">
      ${SelectField({
        id: "constructionType",
        name: "constructionType",
        label: "Construction Type",
        options: [
          { value: "", label: "Select construction type" },
          { value: "room-construction", label: "Room Construction" },
          { value: "road-construction", label: "Road Construction" },
        ],
      })}
    </div>
  `;
};

/**
 * Backwards-compatible export.
 * The room estimator (brick wall) form now lives in `forms/roomEstimatorForm.ts`.
 */
export const renderBrickWallForm = (): string => roomEstimatorForm();

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
        ${SectionCard({
          title: "Estimate Materials",
          subtitle: '<span id="estimator-subtitle">Select a construction type to begin.</span>',
          content: formContent,
          className: "estimator-card",
        })}
      </section>
    </main>
  `;
};

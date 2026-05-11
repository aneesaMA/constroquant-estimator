import { calculateRoomEstimate } from "../services/roomEstimator.service";
import { BrickWallResultCard } from "../components/ResultCard";
import { parseBrickWallForm } from "../utils/validators";
import { renderBrickWallForm } from "../pages/EstimatorPage";
import { renderRoadEstimatorForm } from "../pages/RoadEstimatorPage";
import { useRoadEstimator } from "./useRoadEstimator";

interface UseEstimatorArgs {
  constructionSelector: string;
  formContainerSelector: string;
  resultSelector: string;
}

const renderEmptyState = (container: HTMLDivElement): void => {
  container.innerHTML = `
    <div class="empty-state fade-in" aria-live="polite">
      <div class="empty-state-icon" aria-hidden="true">🏗️</div>
      <h3>Select a construction type</h3>
      <p>Choose a type to load the estimator form and start calculating materials.</p>
    </div>
  `;
};

export const useEstimator = ({
  constructionSelector,
  formContainerSelector,
  resultSelector,
}: UseEstimatorArgs): void => {
  const constructionTypeSelect = document.querySelector<HTMLSelectElement>(constructionSelector);
  const formContainer = document.querySelector<HTMLDivElement>(formContainerSelector);
  const resultContainer = document.querySelector<HTMLDivElement>(resultSelector);

  if (!constructionTypeSelect || !formContainer || !resultContainer) {
    return;
  }

  /**
   * Room Estimator (Brick Wall) UI + submit binding.
   *
   * - UI: `forms/roomEstimatorForm.ts` (rendered via `pages/EstimatorPage.ts`)
   * - Validation: `utils/validators.ts` (`parseBrickWallForm`)
   * - API: `POST /api/brick-wall/estimate` (frontend: `services/roomEstimator.service.ts`)
   * - Formula source: backend `services/brickWall.service.ts`
   */
  const bindBrickWallForm = (): void => {
    const form = formContainer.querySelector<HTMLFormElement>("#estimate-form");
    const submitButton = form?.querySelector<HTMLButtonElement>(".bw-submit-btn");

    if (!form || !submitButton) {
      return;
    }

    submitButton.disabled = constructionTypeSelect.value !== "room-construction";

    // Wire the openings toggle to show/hide the count fields
    const toggleCheckbox = form.querySelector<HTMLInputElement>("#includeOpenings");
    const openingsFields = form.querySelector<HTMLDivElement>("#openings-fields");
    if (toggleCheckbox && openingsFields) {
      toggleCheckbox.addEventListener("change", () => {
        if (toggleCheckbox.checked) {
          openingsFields.classList.remove("bw-openings-hidden");
        } else {
          openingsFields.classList.add("bw-openings-hidden");
        }
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const { input, errors } = parseBrickWallForm(formData);

      if (errors.length > 0) {
        resultContainer.innerHTML = `
          <div class="error-message" role="alert">
            <strong>Please fix the following errors:</strong>
            <ul>${errors.map((e) => `<li>${e.message}</li>`).join("")}</ul>
          </div>
        `;
        return;
      }

      resultContainer.innerHTML = `
        <div class="loading-indicator" role="status" aria-live="polite">
          <span class="loading-spinner" aria-hidden="true">⏳</span>
          Calculating estimate…
        </div>
      `;

      try {
        const result = await calculateRoomEstimate(input);
        resultContainer.innerHTML = BrickWallResultCard(result);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch estimate. Please start the backend server and try again.";
        resultContainer.innerHTML = `<p class="error-message" role="alert">${message}</p>`;
        console.error(error);
      }
    });
  };

  const updateSubtitle = (type: string): void => {
    const el = document.querySelector<HTMLSpanElement>("#estimator-subtitle");
    if (!el) return;
    if (type === "room-construction") el.textContent = "Room Construction Estimator";
    else if (type === "road-construction") el.textContent = "Road Construction Estimator";
    else el.textContent = "Select a construction type to begin.";
  };

  const renderBySelection = (): void => {
    const selectedType = constructionTypeSelect.value;
    resultContainer.innerHTML = "";
    updateSubtitle(selectedType);

    if (selectedType === "room-construction") {
      formContainer.innerHTML = `<div class="fade-in">${renderBrickWallForm()}</div>`;
      bindBrickWallForm();
      return;
    }

    if (selectedType === "road-construction") {
      formContainer.innerHTML = `<div class="fade-in">${renderRoadEstimatorForm()}</div>`;
      useRoadEstimator(formContainerSelector, resultSelector);
      return;
    }

    renderEmptyState(formContainer);
  };

  constructionTypeSelect.addEventListener("change", renderBySelection);
  renderBySelection();
};

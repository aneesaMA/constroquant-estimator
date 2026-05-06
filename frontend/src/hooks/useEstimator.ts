import { calculateBrickWallEstimate } from "../services/estimator.api";
import { BrickWallResultCard } from "../components/ResultCard";
import { parseBrickWallForm } from "../utils/validators";
import { renderBrickWallForm } from "../pages/EstimatorPage";

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

  const bindBrickWallForm = (): void => {
    const form = formContainer.querySelector<HTMLFormElement>("#estimate-form");
    const submitButton = form?.querySelector<HTMLButtonElement>(".bw-submit-btn");

    if (!form || !submitButton) {
      return;
    }

    submitButton.disabled = constructionTypeSelect.value !== "brick-wall";

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
        const result = await calculateBrickWallEstimate(input);
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

  const renderBySelection = (): void => {
    const selectedType = constructionTypeSelect.value;
    resultContainer.innerHTML = "";

    if (selectedType === "brick-wall") {
      formContainer.innerHTML = `<div class="fade-in">${renderBrickWallForm()}</div>`;
      bindBrickWallForm();
      return;
    }

    renderEmptyState(formContainer);
  };

  constructionTypeSelect.addEventListener("change", renderBySelection);
  renderBySelection();
};

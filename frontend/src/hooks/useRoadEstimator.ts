import { TRAFFIC_CATEGORY_OPTIONS } from "../constants/estimator.constants";
import { calculateRoadEstimate, fetchRoadAutoThicknesses } from "../services/roadEstimator.service";
import { RoadResultCard } from "../components/RoadResultCard";
import { parseRoadForm } from "../utils/roadValidators";

export const useRoadEstimator = (
  formContainerSelector: string,
  resultSelector: string
): void => {
  const formContainer = document.querySelector<HTMLDivElement>(formContainerSelector);
  const resultContainer = document.querySelector<HTMLDivElement>(resultSelector);

  if (!formContainer || !resultContainer) {
    return;
  }

  const pavementTypeSelect = formContainer.querySelector<HTMLSelectElement>("#pavementType");
  const trafficCategorySelect = formContainer.querySelector<HTMLSelectElement>("#trafficCategory");
  const soilTypeSelect = formContainer.querySelector<HTMLSelectElement>("#soilType");
  const thicknessContainer = formContainer.querySelector<HTMLDivElement>("#road-thickness-fields");
  const form = formContainer.querySelector<HTMLFormElement>("#road-estimate-form");

  if (!pavementTypeSelect || !trafficCategorySelect || !soilTypeSelect || !thicknessContainer || !form) {
    return;
  }

  const setThicknessLoading = (message: string): void => {
    thicknessContainer.innerHTML = `
      <div class="loading-indicator" role="status" aria-live="polite" style="grid-column: 1 / -1;">
        <span class="loading-spinner" aria-hidden="true">⏳</span>
        ${message}
      </div>
    `;
  };

  const renderThicknessInputs = (layerThicknesses: Record<string, number>): void => {
    // Keep stable ordering per pavement type for UX consistency.
    const layerOrder = Object.keys(layerThicknesses);

    thicknessContainer.innerHTML = layerOrder
      .map((layerKey) => {
        const value = layerThicknesses[layerKey];
        return `
          <div class="input-field">
            <label for="thickness_${layerKey}">${layerKey} Thickness (mm)</label>
            <input
              id="thickness_${layerKey}"
              name="thickness_${layerKey}"
              inputmode="decimal"
              type="number"
              step="1"
              min="1"
              value="${value}"
              data-auto="${value}"
              aria-describedby="thickness_help"
            />
          </div>
        `;
      })
      .join("");
  };

  /**
   * Road Estimator thickness auto-fill logic.
   *
   * - Auto values are fetched from backend thickness tables (API: `GET /api/road/thickness`).
   * - Inputs remain editable; manual edits are sent as `thicknessOverrides`.
   * - Overrides apply only for the current `POST /api/road/estimate` call.
   */
  const maybeFetchAndFillThicknesses = async (): Promise<void> => {
    const pavementType = pavementTypeSelect.value.trim();
    const trafficCategory = trafficCategorySelect.value.trim();
    const soilType = soilTypeSelect.value.trim();

    if (!pavementType || !trafficCategory || !soilType) {
      setThicknessLoading("Select pavement, traffic, and soil to auto-fill thickness.");
      return;
    }

    setThicknessLoading("Fetching standard thickness values…");
    try {
      const layerThicknesses = await fetchRoadAutoThicknesses({
        pavementType,
        trafficCategory,
        soilType,
      });
      renderThicknessInputs(layerThicknesses as unknown as Record<string, number>);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to fetch thickness values. Please try again.";
      thicknessContainer.innerHTML = `<p class="error-message" role="alert" style="grid-column: 1 / -1;">${msg}</p>`;
    }
  };

  // Update traffic category options when pavement type changes
  pavementTypeSelect.addEventListener("change", () => {
    const selectedPavementType = pavementTypeSelect.value;
    const options = TRAFFIC_CATEGORY_OPTIONS[selectedPavementType] ?? [
      { value: "", label: "Select pavement type first" },
    ];

    trafficCategorySelect.innerHTML = options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // Reset traffic category selection (Requirement 1.4)
    trafficCategorySelect.value = "";

    // Clear thickness until the user re-selects dependent values.
    void maybeFetchAndFillThicknesses();
  });

  trafficCategorySelect.addEventListener("change", () => void maybeFetchAndFillThicknesses());
  soilTypeSelect.addEventListener("change", () => void maybeFetchAndFillThicknesses());

  // Initial state
  void maybeFetchAndFillThicknesses();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const { input, errors } = parseRoadForm(formData);

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
      // Collect manual overrides only if user changed from the auto-filled value.
      const thicknessOverrides: Record<string, number> = {};
      const thicknessInputs = Array.from(
        form.querySelectorAll<HTMLInputElement>('input[name^="thickness_"]')
      );
      for (const el of thicknessInputs) {
        const layerKey = el.name.replace(/^thickness_/, "");
        const current = Number(el.value);
        const auto = Number(el.dataset.auto);
        if (Number.isFinite(current) && current > 0 && Number.isFinite(auto) && current !== auto) {
          thicknessOverrides[layerKey] = current;
        }
      }

      const result = await calculateRoadEstimate({
        ...input,
        thicknessOverrides: Object.keys(thicknessOverrides).length > 0 ? thicknessOverrides : undefined,
      });
      resultContainer.innerHTML = RoadResultCard(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach the server. Please check your backend connection.";
      resultContainer.innerHTML = `<p class="error-message" role="alert">${message}</p>`;
      console.error(error);
    }
  });
};

import { TRAFFIC_CATEGORY_OPTIONS } from "../constants/estimator.constants";
import { calculateRoadEstimate, getAutoThicknesses } from "../services/roadEstimator.service";
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

  const renderThicknessInputs = (layerThicknesses: Record<string, number>): void => {
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
            />
          </div>
        `;
      })
      .join("");
  };

  /**
   * Thickness lookup is now fully client-side — no network call, always instant.
   */
  const maybeFillThicknesses = (): void => {
    const pavementType = pavementTypeSelect.value.trim();
    const trafficCategory = trafficCategorySelect.value.trim();
    const soilType = soilTypeSelect.value.trim();

    if (!pavementType || !trafficCategory || !soilType) {
      thicknessContainer.innerHTML = `
        <p class="road-thickness-hint" style="grid-column: 1 / -1;">
          💡 Select pavement, traffic, and soil to auto-fill thickness.
        </p>
      `;
      return;
    }

    try {
      const layerThicknesses = getAutoThicknesses({ pavementType, trafficCategory, soilType });
      renderThicknessInputs(layerThicknesses as unknown as Record<string, number>);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to resolve thickness values.";
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

    trafficCategorySelect.value = "";
    maybeFillThicknesses();
  });

  trafficCategorySelect.addEventListener("change", () => maybeFillThicknesses());
  soilTypeSelect.addEventListener("change", () => maybeFillThicknesses());

  // Initial state
  maybeFillThicknesses();

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

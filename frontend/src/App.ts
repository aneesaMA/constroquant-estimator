import { useEstimator } from "./hooks/useEstimator";
import { EstimatorPage } from "./pages/EstimatorPage";

export const App = (): string => {
  return EstimatorPage();
};

export const mountApp = (container: HTMLDivElement): void => {
  container.innerHTML = App();
  useEstimator({
    constructionSelector: "#constructionType",
    formContainerSelector: "#dynamic-form-container",
    resultSelector: "#result",
  });
};

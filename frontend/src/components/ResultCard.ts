import type { BrickWallResult, EstimateResponse } from "../types/estimator.types";

// Legacy result card
export const ResultCard = (result: EstimateResponse): string => {
  const quantity =
    result.estimatedBricks !== undefined
      ? `${result.estimatedBricks} bricks`
      : `${result.estimatedBags ?? 0} bags`;

  return `
    <article class="result-card">
      <h3>${result.material}</h3>
      <p><strong>Volume:</strong> ${result.volume.toFixed(2)} m³</p>
      <p><strong>Estimated quantity:</strong> ${quantity}</p>
    </article>
  `;
};

// Brick Wall result card
export const BrickWallResultCard = (result: BrickWallResult): string => {
  const hasOpenings = result.openingVolume > 0;

  return `
    <div class="bw-result-card" role="region" aria-label="Estimation Results">
      <h3 class="bw-result-title">Material Estimate</h3>
      <div class="bw-result-grid">
        <div class="bw-result-item bw-result-primary">
          <span class="bw-result-icon" aria-hidden="true">🧱</span>
          <span class="bw-result-label">Bricks</span>
          <span class="bw-result-value">${result.bricks.toLocaleString()}</span>
          <span class="bw-result-unit">nos (incl. 5% wastage)</span>
        </div>
        <div class="bw-result-item bw-result-primary">
          <span class="bw-result-icon" aria-hidden="true">🏗️</span>
          <span class="bw-result-label">Cement</span>
          <span class="bw-result-value">${result.cementBags}</span>
          <span class="bw-result-unit">bags (50 kg each)</span>
        </div>
        <div class="bw-result-item bw-result-primary">
          <span class="bw-result-icon" aria-hidden="true">⛱️</span>
          <span class="bw-result-label">Sand</span>
          <span class="bw-result-value">${result.sandCFT.toFixed(2)}</span>
          <span class="bw-result-unit">CFT</span>
        </div>
      </div>
      <div class="bw-result-volumes">
        <h4 class="bw-volumes-title">Volume Breakdown</h4>
        <div class="bw-volumes-grid">
          <div class="bw-volume-row">
            <span class="bw-volume-label">Gross Wall Volume</span>
            <span class="bw-volume-value">${result.grossWallVolume.toFixed(2)} ft³</span>
          </div>
          <div class="bw-volume-row">
            <span class="bw-volume-label">Total Openings</span>
            <span class="bw-volume-value">− ${result.openingVolume.toFixed(2)} ft³</span>
          </div>
          <div class="bw-volume-row bw-volume-net">
            <span class="bw-volume-label">Net Wall Volume</span>
            <span class="bw-volume-value">${result.netWallVolume.toFixed(2)} ft³</span>
          </div>
        </div>
      </div>
      <div class="bw-assumptions">
        <span class="bw-assumptions-title">Calculation Assumptions</span>
        <div class="bw-assumptions-chips">
          <span class="bw-chip">Brick 10″×4.5″×3″</span>
          <span class="bw-chip">Mortar joint 0.5″</span>
          <span class="bw-chip">9.40 bricks/ft³</span>
          <span class="bw-chip">5% wastage</span>
          <span class="bw-chip">Mortar 30% of volume</span>
          <span class="bw-chip">Dry factor 1.33×</span>
          <span class="bw-chip">Mix 1:6 (cement:sand)</span>
          <span class="bw-chip">50 kg bag = 1.25 ft³</span>
          ${hasOpenings ? `
          <span class="bw-chip">Std. door 7×3 ft</span>
          <span class="bw-chip">Std. window 4×4 ft</span>
          ` : ""}
        </div>
      </div>
    </div>
  `;
};

import type {
  BituminousLayerQuantities,
  BituminousRawMaterials,
  BituminousThicknesses,
  ConcreteLayerQuantities,
  ConcreteRawMaterials,
  ConcreteThicknesses,
  GravelLayerQuantities,
  GravelRawMaterials,
  GravelThicknesses,
  RoadResult,
} from "../types/estimator.types";

const renderBituminousLayerQuantities = (
  thicknesses: BituminousThicknesses,
  quantities: BituminousLayerQuantities
): string => {
  return `
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">GSB Layer</span>
      <span class="bw-result-value">${quantities.Q_GSB.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.GSB} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">WMM Layer</span>
      <span class="bw-result-value">${quantities.Q_WMM.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.WMM} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">DBM Layer</span>
      <span class="bw-result-value">${quantities.Q_DBM.toFixed(3)}</span>
      <span class="bw-result-unit">t (${thicknesses.DBM} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">BC Layer</span>
      <span class="bw-result-value">${quantities.Q_BC.toFixed(3)}</span>
      <span class="bw-result-unit">t (${thicknesses.BC} mm)</span>
    </div>
  `;
};

const renderConcreteLayerQuantities = (
  thicknesses: ConcreteThicknesses,
  quantities: ConcreteLayerQuantities
): string => {
  return `
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">GSB Layer</span>
      <span class="bw-result-value">${quantities.Q_GSB.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.GSB} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">DLC Layer</span>
      <span class="bw-result-value">${quantities.Q_DLC.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.DLC} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">PQC Layer</span>
      <span class="bw-result-value">${quantities.Q_PQC.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.PQC} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">Total Concrete</span>
      <span class="bw-result-value">${quantities.Q_Concrete.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
  `;
};

const renderGravelLayerQuantities = (
  thicknesses: GravelThicknesses,
  quantities: GravelLayerQuantities
): string => {
  return `
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">Gravel Layer</span>
      <span class="bw-result-value">${quantities.Q_Gravel.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.Gravel} mm)</span>
    </div>
    <div class="bw-result-item bw-result-primary">
      <span class="bw-result-label">GSB Layer</span>
      <span class="bw-result-value">${quantities.Q_GSB.toFixed(2)}</span>
      <span class="bw-result-unit">m³ (${thicknesses.GSB} mm)</span>
    </div>
  `;
};

const renderBituminousRawMaterials = (materials: BituminousRawMaterials): string => {
  return `
    <div class="bw-result-item">
      <span class="bw-result-label">Bitumen (Total)</span>
      <span class="bw-result-value">${materials.Bitumen_Total.toFixed(3)}</span>
      <span class="bw-result-unit">t</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">Aggregate (DBM)</span>
      <span class="bw-result-value">${materials.Aggregate_DBM.toFixed(3)}</span>
      <span class="bw-result-unit">t</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">Aggregate (BC)</span>
      <span class="bw-result-value">${materials.Aggregate_BC.toFixed(3)}</span>
      <span class="bw-result-unit">t</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">GSB Procurement</span>
      <span class="bw-result-value">${materials.GSB_Procure.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">WMM Procurement</span>
      <span class="bw-result-value">${materials.WMM_Procure.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">DBM Procurement</span>
      <span class="bw-result-value">${materials.DBM_Procure.toFixed(3)}</span>
      <span class="bw-result-unit">t</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">BC Procurement</span>
      <span class="bw-result-value">${materials.BC_Procure.toFixed(3)}</span>
      <span class="bw-result-unit">t</span>
    </div>
  `;
};

const renderConcreteRawMaterials = (materials: ConcreteRawMaterials): string => {
  return `
    <div class="bw-result-item">
      <span class="bw-result-label">Cement</span>
      <span class="bw-result-value">${Math.ceil(materials.Cement_Final)}</span>
      <span class="bw-result-unit">bags (50 kg each)</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">Sand</span>
      <span class="bw-result-value">${materials.Sand_Final.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">Aggregate</span>
      <span class="bw-result-value">${materials.Aggregate_Final.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">GSB Procurement</span>
      <span class="bw-result-value">${materials.GSB_Procure.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
  `;
};

const renderGravelRawMaterials = (materials: GravelRawMaterials): string => {
  return `
    <div class="bw-result-item">
      <span class="bw-result-label">Gravel Procurement</span>
      <span class="bw-result-value">${materials.Gravel_Procure.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
    <div class="bw-result-item">
      <span class="bw-result-label">GSB Procurement</span>
      <span class="bw-result-value">${materials.GSB_Procure.toFixed(2)}</span>
      <span class="bw-result-unit">m³</span>
    </div>
  `;
};

export const RoadResultCard = (result: RoadResult): string => {
  const thicknesses = result.layerThicknesses;
  const quantities = result.layerQuantities;
  const materials = result.rawMaterials;

  let layerQuantitiesHtml = "";
  let rawMaterialsHtml = "";

  if ("WMM" in thicknesses) {
    // Bituminous
    layerQuantitiesHtml = renderBituminousLayerQuantities(
      thicknesses as BituminousThicknesses,
      quantities as BituminousLayerQuantities
    );
    rawMaterialsHtml = renderBituminousRawMaterials(materials as BituminousRawMaterials);
  } else if ("DLC" in thicknesses) {
    // Concrete
    layerQuantitiesHtml = renderConcreteLayerQuantities(
      thicknesses as ConcreteThicknesses,
      quantities as ConcreteLayerQuantities
    );
    rawMaterialsHtml = renderConcreteRawMaterials(materials as ConcreteRawMaterials);
  } else {
    // Gravel
    layerQuantitiesHtml = renderGravelLayerQuantities(
      thicknesses as GravelThicknesses,
      quantities as GravelLayerQuantities
    );
    rawMaterialsHtml = renderGravelRawMaterials(materials as GravelRawMaterials);
  }

  return `
    <div class="bw-result-card" role="region" aria-label="Road Estimation Results">
      <h3 class="bw-result-title">Road Material Estimate</h3>

      <div class="bw-result-volumes">
        <h4 class="bw-volumes-title">Layer Quantities</h4>
        <div class="bw-result-grid">
          ${layerQuantitiesHtml}
        </div>
      </div>

      <div class="bw-result-volumes">
        <h4 class="bw-volumes-title">Raw Material Requirements</h4>
        <div class="bw-result-grid">
          ${rawMaterialsHtml}
        </div>
      </div>

      <p class="bw-result-note">Volumes in m³ · Masses in tonnes · Cement bags (50 kg each) · Includes compaction &amp; wastage factors</p>
    </div>
  `;
};

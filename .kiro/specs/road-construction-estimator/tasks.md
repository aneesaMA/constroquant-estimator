# Implementation Plan: Road Construction Estimator

## Overview

Integrate a Road Construction Estimator into the existing ConstroQuant application alongside the Brick Wall Estimator. The implementation follows the established architectural pattern: a dedicated backend service/controller/router, a frontend page component with a hook and result card, and minimal, targeted modifications to existing files. The Brick Wall Estimator must remain fully functional throughout.

## Tasks

- [x] 1. Extend backend types and constants
  - [x] 1.1 Add road types to `backend/src/types/estimator.types.ts`
    - Add `PavementType`, `TrafficCategory`, `SoilType` union types
    - Add `RoadInput` interface with `pavementType`, `trafficCategory`, `soilType`, `roadLength`, `roadWidth`
    - Add `BituminousThicknesses`, `ConcreteThicknesses`, `GravelThicknesses`, and `LayerThicknesses` union type
    - Add `BituminousLayerQuantities`, `ConcreteLayerQuantities`, `GravelLayerQuantities`, and `LayerQuantities` union type
    - Add `BituminousRawMaterials`, `ConcreteRawMaterials`, `GravelRawMaterials`, and `RawMaterials` union type
    - Add `RoadResult` interface with `layerThicknesses`, `layerQuantities`, `rawMaterials`
    - Do NOT modify any existing types
    - _Requirements: 3.1, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.2, 8.3, 8.4, 8.5_

  - [x] 1.2 Add road constants to `backend/src/config/constants.ts`
    - Add `ROAD_CONSTANTS` object with `DBM_DENSITY`, `BC_DENSITY`, `BITUMEN_CONTENT`, `AGGREGATE_CONTENT`, `GSB_COMPACTION`, `WMM_COMPACTION`, `WASTAGE_FACTOR`, `GSB_PROCURE_FACTOR` (1.29), `WMM_PROCURE_FACTOR` (1.24), `M20_TOTAL_PARTS`, `M20_CEMENT_PARTS`, `M20_SAND_PARTS`, `M20_AGGREGATE_PARTS`, `CEMENT_BAGS_PER_M3`
    - Add `ROAD_THICKNESS_TABLE` as a nested `as const` object keyed by `[pavementType][trafficCategory][soilType]` containing all three pavement type tables (Bituminous 12 rows, Concrete 9 rows, Gravel 9 rows) exactly as specified in Requirements 3.3, 3.4, 3.5
    - Do NOT modify any existing constants
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 2. Implement the road calculation service
  - [x] 2.1 Create `backend/src/services/road.service.ts`
    - Export `calculateRoad(input: RoadInput): RoadResult`
    - Step 1: Look up thicknesses from `ROAD_THICKNESS_TABLE[pavementType][trafficCategory][soilType]`; throw a descriptive `Error` if the key does not exist (covers unknown pavement type, invalid traffic/soil combo)
    - Step 2: Convert all thickness values from mm to metres (divide by 1000)
    - Step 3 (Bituminous): Compute `Q_GSB`, `Q_WMM`, `Q_DBM` (×2.4 t/m³), `Q_BC` (×2.4 t/m³); then compute all seven raw material values using `ROAD_CONSTANTS`
    - Step 3 (Concrete): Compute `Q_GSB`, `Q_DLC`, `Q_PQC`, `Q_Concrete`; then compute `Cement_Final` (ceiling after ×1.03), `Sand_Final`, `Aggregate_Final`, `GSB_Procure`
    - Step 3 (Gravel): Compute `Q_Gravel`, `Q_GSB`; then compute `Gravel_Procure`, `GSB_Procure`
    - Return a `RoadResult` with `layerThicknesses`, `layerQuantities`, `rawMaterials`
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2_

  - [ ]* 2.2 Write property test for Bituminous road calculation correctness
    - Create `backend/src/services/__tests__/road.service.property.test.ts`
    - **Property 3: Bituminous road calculation correctness**
    - **Validates: Requirements 5.1, 5.2, 8.2, 8.4, 8.5**
    - Use `fast-check`: generate `trafficCategory` from `["Low","Medium","High","Heavy Industrial"]`, `soilType` from `["Strong","Medium","Weak"]`, `L` and `W` as positive floats (0.1–10000); assert all 11 formula equalities hold within floating-point tolerance
    - Tag: `// Feature: road-construction-estimator, Property 3: Bituminous road calculation correctness`

  - [ ]* 2.3 Write property test for Concrete road calculation correctness
    - **Property 4: Concrete road calculation correctness**
    - **Validates: Requirements 6.1, 6.2, 8.2, 8.4, 8.5**
    - Use `fast-check`: generate `trafficCategory` from `["Low","Medium","High"]`, `soilType` from `["Strong","Medium","Weak"]`, positive `L` and `W`; assert all 8 formula equalities hold
    - Tag: `// Feature: road-construction-estimator, Property 4: Concrete road calculation correctness`

  - [ ]* 2.4 Write property test for Gravel road calculation correctness
    - **Property 5: Gravel road calculation correctness**
    - **Validates: Requirements 7.1, 7.2, 8.2, 8.4, 8.5**
    - Use `fast-check`: generate `trafficCategory` from `["Low","Medium","High"]`, `soilType` from `["Strong","Medium","Weak"]`, positive `L` and `W`; assert all 4 formula equalities hold
    - Tag: `// Feature: road-construction-estimator, Property 5: Gravel road calculation correctness`

  - [ ]* 2.5 Write property test for Bituminous mass conservation identity
    - **Property 6: Bituminous layer mass conservation identity**
    - **Validates: Requirements 11.3**
    - Use `fast-check`: same generators as Property 3; assert `Aggregate_DBM + Q_DBM×0.05 ≈ Q_DBM` and `Aggregate_BC + Q_BC×0.05 ≈ Q_BC` within floating-point epsilon
    - Tag: `// Feature: road-construction-estimator, Property 6: Bituminous layer mass conservation identity`

  - [ ]* 2.6 Write property test for calculation determinism
    - **Property 7: Calculation determinism**
    - **Validates: Requirements 11.1**
    - Use `fast-check`: generate any valid `RoadInput`; call `calculateRoad` twice; assert deep equality of both results
    - Tag: `// Feature: road-construction-estimator, Property 7: Calculation determinism`

  - [ ]* 2.7 Write property test for invalid combination returning error
    - **Property 9: Invalid input combination returns error**
    - **Validates: Requirements 3.6, 8.6**
    - Use `fast-check`: generate `pavementType` from `["Concrete","Gravel"]`, `trafficCategory` = `"Heavy Industrial"`, valid `soilType`, positive `L` and `W`; assert `calculateRoad` throws
    - Tag: `// Feature: road-construction-estimator, Property 9: Invalid input combination returns 400`

- [x] 3. Implement the road controller and router
  - [x] 3.1 Create `backend/src/controllers/road.controller.ts`
    - Export `estimateRoad(req: Request, res: Response): void`
    - Validate all five required fields: `pavementType` (non-empty string), `trafficCategory` (non-empty string), `soilType` (non-empty string), `roadLength` (positive number), `roadWidth` (positive number)
    - Return HTTP 400 with `{ message: "Field 'X' is required." }` or `{ message: "Field 'X' must be a positive number." }` for each invalid field, following the same guard pattern as `estimator.controller.ts`
    - Delegate to `calculateRoad`; catch thrown errors and return HTTP 400 with `{ message: error.message }`
    - Return HTTP 200 with the `RoadResult` on success
    - _Requirements: 8.1, 8.6_

  - [x] 3.2 Create `backend/src/routes/road.routes.ts`
    - Create a new `Router` instance
    - Register `POST /estimate` → `estimateRoad`
    - Export as default
    - _Requirements: 8.1_

  - [x] 3.3 Register the road router in `backend/src/app.ts`
    - Import `roadRouter` from `./routes/road.routes.js`
    - Mount it at `/api/road` with `app.use("/api/road", roadRouter)`
    - Update the root route's `endpoints` object to include `roadEstimate: "POST /api/road/estimate"`
    - Do NOT modify the existing `estimatorRouter` registration
    - _Requirements: 8.1_

- [x] 4. Checkpoint — verify backend compiles and existing tests pass
  - Run `tsc --noEmit` in the `backend` directory to confirm no TypeScript errors
  - Confirm the existing brick-wall endpoint is unaffected
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Extend frontend types and constants
  - [x] 5.1 Add road types to `frontend/src/types/estimator.types.ts`
    - Mirror the backend road types: `PavementType`, `TrafficCategory`, `SoilType`, `RoadInput`, all thickness/quantity/raw-material interfaces, `LayerThicknesses`, `LayerQuantities`, `RawMaterials`, `RoadResult`
    - Do NOT modify any existing types
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 5.2 Add road options to `frontend/src/constants/estimator.constants.ts`
    - Add `PAVEMENT_TYPE_OPTIONS` array with four entries (empty default + three pavement types)
    - Add `TRAFFIC_CATEGORY_OPTIONS` as a `Record<string, Array<{value, label}>>` keyed by pavement type, with `Bituminous` having four options (including `Heavy Industrial`) and `Concrete`/`Gravel` having three options each
    - Add `SOIL_TYPE_OPTIONS` array with four entries (empty default + Strong/Medium/Weak)
    - Do NOT modify `API_BASE_URL`, `CONSTRUCTION_TYPE_OPTIONS`, or `WALL_THICKNESS_OPTIONS`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 6. Implement frontend road service and validators
  - [x] 6.1 Create `frontend/src/services/road.api.ts`
    - Export `calculateRoadEstimate(payload: RoadInput): Promise<RoadResult>`
    - `POST ${API_BASE_URL}/road/estimate` with JSON body
    - On non-OK response: parse JSON body and throw `new Error(body.message ?? "Unable to calculate road estimate.")`
    - On network failure: let the error propagate (caught by the hook)
    - _Requirements: 8.1, 9.4, 9.5_

  - [x] 6.2 Create `frontend/src/utils/roadValidators.ts`
    - Export `interface RoadValidationError { field: string; message: string }`
    - Export `parseRoadForm(formData: FormData): { input: RoadInput; errors: RoadValidationError[] }`
    - Validate `pavementType`, `trafficCategory`, `soilType` as non-empty strings; push a descriptive error for each missing field
    - Validate `roadLength` and `roadWidth` as positive numbers; push a descriptive error for each invalid field
    - _Requirements: 2.3, 2.4, 4.3, 4.4_

  - [ ]* 6.3 Write property test for form validation rejecting non-positive dimensions
    - Create `frontend/src/utils/__tests__/roadValidators.property.test.ts`
    - **Property 10: Form validation rejects non-positive dimensions**
    - **Validates: Requirements 4.3, 4.4**
    - Use `fast-check`: generate `roadLength` or `roadWidth` as zero or negative number; assert `parseRoadForm` returns at least one `RoadValidationError` identifying the invalid field
    - Tag: `// Feature: road-construction-estimator, Property 10: Form validation rejects non-positive dimensions`

- [x] 7. Implement the RoadResultCard component
  - [x] 7.1 Create `frontend/src/components/RoadResultCard.ts`
    - Export `RoadResultCard(result: RoadResult): string`
    - Render two sections inside a container styled with existing `.bw-result-card` classes: "Layer Quantities" and "Raw Material Requirements"
    - In "Layer Quantities": display each layer's thickness (mm) alongside its computed quantity; use `toFixed(2)` for m³ values and `toFixed(3)` for tonne values
    - In "Raw Material Requirements": display each procurement quantity with its unit; use `toFixed(2)` for m³, `toFixed(3)` for tonnes, `Math.ceil` for cement bags (display as integer)
    - Use the same `.bw-result-item`, `.bw-result-primary`, `.bw-result-value`, `.bw-result-unit` CSS classes as `BrickWallResultCard`
    - _Requirements: 9.1, 9.2, 9.6, 9.7_

  - [ ]* 7.2 Write property test for result card numeric formatting
    - Create `frontend/src/components/__tests__/RoadResultCard.property.test.ts`
    - **Property 8: Result card numeric formatting**
    - **Validates: Requirements 9.6, 9.7**
    - Use `fast-check`: generate arbitrary positive floats for all numeric result fields; assert rendered HTML contains volume values formatted to exactly 2 decimal places, mass values to exactly 3 decimal places, and cement bag counts as whole integers (no decimal point)
    - Tag: `// Feature: road-construction-estimator, Property 8: Result card numeric formatting`

- [x] 8. Implement the RoadEstimatorPage component
  - [x] 8.1 Create `frontend/src/pages/RoadEstimatorPage.ts`
    - Export `renderRoadEstimatorForm(): string` — renders the full road form HTML using `SelectField` and `InputField` primitives
    - Form structure: pavement type selector (id `pavementType`), traffic category selector (id `trafficCategory`), soil type selector (id `soilType`), road length input (id `roadLength`, metres), road width input (id `roadWidth`, metres), submit button with class `bw-submit-btn`
    - Wrap inputs in `<fieldset class="bw-fieldset">` sections matching the brick wall form style
    - Use `PAVEMENT_TYPE_OPTIONS` for the initial pavement type options; traffic category options will be populated dynamically by the hook
    - Use `SOIL_TYPE_OPTIONS` for soil type
    - _Requirements: 1.1, 2.1, 2.2, 4.1, 4.2, 10.5_

- [x] 9. Implement the useRoadEstimator hook
  - [x] 9.1 Create `frontend/src/hooks/useRoadEstimator.ts`
    - Export `useRoadEstimator(formContainerSelector: string, resultSelector: string): void`
    - After mounting, attach a `change` listener to `#pavementType`: update `#trafficCategory` options from `TRAFFIC_CATEGORY_OPTIONS[selectedPavementType]` and reset its value to `""` (Requirement 1.4)
    - Attach a `submit` listener to `#road-estimate-form`: call `parseRoadForm`, display inline errors if any, show loading indicator, call `calculateRoadEstimate`, render `RoadResultCard` on success
    - On API error: display `error.message` in `.error-message` style (Requirement 9.4)
    - On network error (non-`Error` or fetch failure): display "Could not reach the server. Please check your backend connection." (Requirement 9.5)
    - Loading state: render `<div class="loading-indicator">…Calculating estimate…</div>` (Requirement 9.3)
    - _Requirements: 1.2, 1.3, 1.4, 9.3, 9.4, 9.5_

  - [ ]* 9.2 Write property test for traffic category options filtered by pavement type
    - Create `frontend/src/hooks/__tests__/useRoadEstimator.property.test.ts`
    - **Property 1: Traffic category options are filtered by pavement type**
    - **Validates: Requirements 1.2, 1.3, 2.1**
    - Use `fast-check` with jsdom: generate `pavementType` from `["Bituminous","Concrete","Gravel"]`; simulate selection change; assert option values match the expected set and `Heavy Industrial` is absent for `Concrete` and `Gravel`
    - Tag: `// Feature: road-construction-estimator, Property 1: Traffic category options are filtered by pavement type`

  - [ ]* 9.3 Write property test for pavement type change resetting traffic category
    - **Property 2: Pavement type change resets traffic category**
    - **Validates: Requirements 1.4**
    - Use `fast-check` with jsdom: generate pavement type A, a valid traffic category for A, and pavement type B ≠ A; simulate the selection sequence; assert traffic category value is `""` after the pavement type change
    - Tag: `// Feature: road-construction-estimator, Property 2: Pavement type change resets traffic category`

- [x] 10. Wire road construction into App.ts and EstimatorPage.ts
  - [x] 10.1 Add `Road Construction` option to the construction type selector in `frontend/src/pages/EstimatorPage.ts`
    - In `renderConstructionSelectorSection`, add `{ value: "road-construction", label: "Road Construction" }` to the options array after the existing `room-construction` option
    - This is the only change to `EstimatorPage.ts`
    - _Requirements: 10.1_

  - [x] 10.2 Add road construction branch to `frontend/src/hooks/useEstimator.ts`
    - In `renderBySelection`, add an `else if (selectedType === "road-construction")` branch that: sets `formContainer.innerHTML` to `renderRoadEstimatorForm()` wrapped in a `fade-in` div, then calls `useRoadEstimator(formContainerSelector, resultSelector)`
    - Import `renderRoadEstimatorForm` from `../pages/RoadEstimatorPage` and `useRoadEstimator` from `./useRoadEstimator`
    - The existing `room-construction` branch and `renderEmptyState` fallback must remain unchanged
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ]* 10.3 Write property test for construction type switch clearing results
    - **Property 11: Construction type switch clears results**
    - **Validates: Requirements 10.4**
    - Use `fast-check` with jsdom: for any construction type change, assert the results container is empty (innerHTML `""`) immediately after the switch
    - Tag: `// Feature: road-construction-estimator, Property 11: Construction type switch clears results`

- [x] 11. Add road-specific responsive styles to `frontend/src/styles/global.css`
  - Add `.road-result-card` section styles for the two-section layout ("Layer Quantities" and "Raw Material Requirements") if the existing `.bw-result-card` classes are insufficient
  - Ensure road form inputs stack to a single column on viewports narrower than 640px (extend the existing `@media (max-width: 640px)` block if needed)
  - Do NOT remove or override any existing CSS rules
  - _Requirements: 10.5, 10.6_

- [ ] 12. Final checkpoint — full integration verification
  - Run `tsc --noEmit` in both `backend` and `frontend` directories to confirm zero TypeScript errors
  - Verify the Bituminous worked example from Requirement 8.7 manually or via the integration test: `pavementType=Bituminous`, `trafficCategory=Medium`, `soilType=Medium`, `L=100`, `W=7` → `T_GSB=200mm`, `Q_GSB=140 m³`, `Q_WMM=175 m³`, `Q_DBM=126 t`, `Q_BC=67.2 t`, `Bitumen_Total=9.66 t`, `GSB_Procure=180.6 m³`, `WMM_Procure=217 m³`, `DBM_Procure=129.78 t`, `BC_Procure=69.216 t`
  - Confirm the existing `POST /api/brick-wall/estimate` endpoint still returns correct results
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The Brick Wall Estimator (`EstimatorPage.ts`, `brickWall.service.ts`, `estimator.controller.ts`, `estimator.routes.ts`) must not be modified except where explicitly noted
- Property tests use `fast-check` (TypeScript/Vitest ecosystem) with a minimum of 100 iterations per run
- All numeric outputs follow the formatting rules: volumes to 2 dp, masses to 3 dp, cement bags as ceiling integers

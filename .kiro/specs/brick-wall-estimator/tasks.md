# Implementation Plan: Brick Wall Estimator

## Overview

Fill in all empty/stub files across the full-stack TypeScript project so the Brick Wall Estimator runs end-to-end. The backend (Node.js/Express on port 4000) exposes `POST /api/brick-wall/estimate` using a 7-step CFT algorithm; the frontend (Vite/Vanilla TypeScript on port 5173) renders 10 input fields, calls the API, and displays the material breakdown. All scaffolded files already exist — every task below is about writing or completing code inside them.

## Tasks

- [x] 1. Complete backend constants and types
  - Fill in `backend/src/config/constants.ts` with `SERVER_CONFIG`, `MATERIAL_FACTORS`, and `BRICK_WALL_CONSTANTS` (all numeric constants for the 7-step algorithm: `BRICKS_PER_CFT=9.40`, `WASTAGE_FACTOR=1.05`, `MORTAR_CONTENT_RATIO=0.30`, `DRY_MORTAR_FACTOR=1.33`, `CEMENT_FRACTION=1/7`, `SAND_FRACTION=6/7`, `CEMENT_BAG_VOLUME_CFT=1.25`)
  - Fill in `backend/src/types/estimator.types.ts` with `ConstructionType`, `EstimateRequestBody`, `EstimateResult`, `BrickWallInput` (10 fields), and `BrickWallResult` (6 fields)
  - _Requirements: 1.1, 1.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.2_

- [x] 2. Implement the backend calculation service
  - [x] 2.1 Implement `calculateBrickWall` in `backend/src/services/brickWall.service.ts`
    - Step 1: `grossWallVolume = 2 × (L + B) × H × T`
    - Step 2: `openingVolume = (Hd × Wd × T × Nd) + (Hw × Ww × T × Nw)`
    - Step 3: `netWallVolume = grossWallVolume − openingVolume`; throw `Error` if `netWallVolume <= 0`
    - Step 4: `bricks = Math.ceil(netWallVolume × 9.40 × 1.05)`
    - Step 5: `mortarDry = netWallVolume × 0.30 × 1.33`
    - Step 6: `cementBags = Math.ceil((1/7 × mortarDry) / 1.25)`
    - Step 7: `sandCFT = (6/7) × mortarDry`
    - Round volumes to 2 dp; use `Math.ceil` for bricks and cementBags
    - _Requirements: 1.4, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.2 Write example tests for `calculateBrickWall` in `backend/src/__tests__/brickWall.service.example.test.ts`
    - Canonical worked example: L=16, B=13, H=10, T=0.75, Hd=7, Wd=3, Nd=1, Hw=4, Ww=4, Nw=2 → bricks=3902, cementBags=19, sandCFT=136.08, netWallVolume=395.25, grossWallVolume=435.00, openingVolume=39.75
    - Zero doors (Nd=0): door term is zero
    - Zero windows (Nw=0): window term is zero
    - Openings equal gross volume: throws with descriptive message
    - Openings exceed gross volume: throws with descriptive message
    - _Requirements: 3.2, 6.5_

  - [ ]* 2.3 Write property tests for `calculateBrickWall` in `backend/src/__tests__/brickWall.service.property.test.ts`
    - Install `fast-check` as a dev dependency in the backend (`npm install --save-dev fast-check`)
    - **Property 2: Gross Wall Volume Formula** — for any positive L, B, H, T: `result.grossWallVolume === 2*(L+B)*H*T` (within floating-point tolerance) — **Validates: Requirements 1.4**
    - **Property 3: Opening Volume Formula** — for any valid input: `result.openingVolume === (Hd*Wd*T*Nd)+(Hw*Ww*T*Nw)` — **Validates: Requirements 2.3, 2.4, 2.5**
    - **Property 4: Net Volume Is Gross Minus Openings** — for inputs where openings < gross: `result.netWallVolume === result.grossWallVolume - result.openingVolume` — **Validates: Requirements 3.1**
    - **Property 5: Oversized Openings Throw an Error** — for inputs where openings ≥ gross: `expect(() => calculateBrickWall(input)).toThrow()` — **Validates: Requirements 3.2**
    - **Property 6: Brick Count Formula** — for any valid input: `result.bricks === Math.ceil(result.netWallVolume * 9.40 * 1.05)` — **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - **Property 7: Cement and Sand Formulas** — for any valid input: cement and sand match their respective formulas within tolerance — **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - **Property 8: All Output Fields Are Present and Numeric** — for any valid input: all 6 output fields are finite numbers — **Validates: Requirements 6.2, 8.2**
    - **Property 10: Calculation Is Deterministic** — two calls with same input return deeply equal results — **Validates: Requirements 8.1**
    - Each test must include comment tag: `// Feature: brick-wall-estimator, Property N: <property_text>`
    - _Requirements: 1.4, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.2, 8.1, 8.2_

- [x] 3. Implement the backend controller and routes
  - [x] 3.1 Implement `estimateBrickWall` in `backend/src/controllers/estimator.controller.ts`
    - Validate 8 positive-number fields: `roomLength`, `roomBreadth`, `wallHeight`, `wallThickness`, `doorHeight`, `doorWidth`, `windowHeight`, `windowWidth`
    - Validate 2 non-negative-integer fields: `numDoors`, `numWindows`
    - Return `400 { message }` on any validation failure
    - Delegate to `calculateBrickWall`; catch service errors and return `400`
    - Return `200` with `BrickWallResult` on success
    - _Requirements: 1.2, 1.3, 2.2, 6.1, 6.3, 6.4_

  - [ ]* 3.2 Write controller example tests in `backend/src/__tests__/estimator.controller.example.test.ts`
    - Valid request body → 200 + correct result shape
    - Each of the 10 fields missing → 400 + message
    - Negative dimensional field → 400 + message
    - Non-integer count field → 400 + message
    - _Requirements: 1.2, 1.3, 2.2, 6.3, 6.4_

  - [x] 3.3 Verify `backend/src/routes/estimator.routes.ts` wires `POST /api/brick-wall/estimate` to `estimateBrickWall`
    - Confirm `estimatorRouter.post("/brick-wall/estimate", estimateBrickWall)` is present
    - Confirm `estimatorRouter.post("/estimate", estimateMaterials)` is present for legacy support
    - _Requirements: 6.1_

  - [x] 3.4 Verify `backend/src/app.ts` registers the router and starts on port 4000
    - Confirm CORS middleware, JSON body parser, health check at `GET /api/health`, and `app.use("/api", estimatorRouter)` are all present
    - Confirm `app.listen(SERVER_CONFIG.PORT, ...)` uses port 4000
    - _Requirements: 6.1_

- [x] 4. Checkpoint — backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 5. Complete frontend types and constants
  - Fill in `frontend/src/types/estimator.types.ts` with `ConstructionType`, `EstimatorInput`, `EstimateResponse`, `BrickWallInput`, and `BrickWallResult` (mirroring backend types)
  - Fill in `frontend/src/constants/estimator.constants.ts` with `API_BASE_URL = "http://localhost:4000/api"`, `WALL_THICKNESS_OPTIONS` (9" full brick = 0.75 ft, 4.5" half brick = 0.375 ft), and `CONSTRUCTION_TYPE_OPTIONS`
  - _Requirements: 1.1, 6.1_

- [x] 6. Implement frontend utility and service layers
  - [x] 6.1 Implement `parseBrickWallForm` in `frontend/src/utils/validators.ts`
    - Parse all 10 fields from `FormData`
    - `getPositive(name, label)`: rejects zero, negative, non-finite values
    - `getNonNegativeInt(name, label)`: rejects negative, non-integer, non-finite values
    - Return `{ input: BrickWallInput, errors: BrickWallValidationError[] }`
    - _Requirements: 1.2, 1.3, 2.2_

  - [ ]* 6.2 Write property test for `parseBrickWallForm` in `frontend/src/__tests__/validators.property.test.ts`
    - Install `fast-check` and `vitest` as dev dependencies in the frontend (`npm install --save-dev fast-check vitest`)
    - **Property 1: Input Validation Rejects Non-Positive Dimensional Values** — for any form submission where at least one of the 8 dimensional fields is zero, negative, or non-finite: `errors.length > 0` and the error identifies the offending field — **Validates: Requirements 1.2, 1.3, 2.2**
    - _Requirements: 1.2, 1.3, 2.2_

  - [ ]* 6.3 Write example tests for `parseBrickWallForm` in `frontend/src/__tests__/validators.example.test.ts`
    - Valid form data → empty errors array, correct input values
    - Empty form → errors for all 10 fields
    - Canonical worked example values → parses correctly
    - _Requirements: 1.2, 2.2_

  - [x] 6.4 Implement `calculateBrickWallEstimate` in `frontend/src/services/estimator.api.ts`
    - POST `BrickWallInput` to `${API_BASE_URL}/brick-wall/estimate`
    - On non-2xx: extract `message` from JSON body and throw `Error`
    - On success: return `BrickWallResult`
    - _Requirements: 6.1, 7.3, 7.4_

- [x] 7. Implement frontend components
  - [x] 7.1 Implement `InputField` and `SelectField` in `frontend/src/components/InputField.ts`
    - `InputField(props)`: renders `<div class="input-field">` with `<label>` and `<input type="number">` using configurable `id`, `name`, `label`, `placeholder`, `step` (default `"0.01"`), `min` (default `"0"`), `value` (default `""`)
    - `SelectField(props)`: renders `<div class="input-field">` with `<label>` and `<select>` with pre-built `<option>` elements; marks `defaultValue` as `selected`
    - _Requirements: 1.1, 2.1_

  - [x] 7.2 Implement `BrickWallResultCard` in `frontend/src/components/ResultCard.ts`
    - Render three primary metric cards: Bricks (formatted as integer with `toLocaleString()`), Cement Bags (integer), Sand (2 dp with `toFixed(2)`)
    - Render volume breakdown: Gross Wall Volume, Total Openings (prefixed with `−`), Net Wall Volume — all formatted to 2 dp
    - Include `role="region"` and `aria-label="Estimation Results"` for accessibility
    - Include mix ratio note at the bottom
    - _Requirements: 7.1, 7.5_

  - [ ]* 7.3 Write example tests for `BrickWallResultCard` in `frontend/src/__tests__/ResultCard.example.test.ts`
    - Canonical result renders all 6 fields with correct labels
    - Bricks formatted as integer (no decimal point)
    - Volumes formatted to 2 decimal places
    - _Requirements: 7.1, 7.5_

  - [ ]* 7.4 Write property test for `BrickWallResultCard` in `frontend/src/__tests__/ResultCard.property.test.ts`
    - **Property 9: Result Card Renders All Required Fields with Correct Formatting** — for any `BrickWallResult`, the HTML output contains bricks as a whole integer, cementBags as a whole integer, sandCFT to 2 dp, and all three volume fields to 2 dp — **Validates: Requirements 7.1, 7.5**
    - _Requirements: 7.1, 7.5_

  - [x] 7.5 Implement `SectionCard` in `frontend/src/components/SectionCard.ts`
    - Render `<section class="section-card {className}">` with `<h2>` title, optional `<p class="subtitle">`, and arbitrary `content` HTML
    - _Requirements: 7.1_

- [x] 8. Implement frontend page and hook
  - [x] 8.1 Implement `EstimatorPage` in `frontend/src/pages/EstimatorPage.ts`
    - Render topbar with brand name "ConstroMat" and nav links
    - Render hero section with `<h1>` and description paragraph
    - Render `SectionCard` wrapping the estimator form
    - Form contains three `<fieldset>` groups using `InputField`/`SelectField`:
      - Room Dimensions: roomLength, roomBreadth, wallHeight, wallThickness (SelectField with `WALL_THICKNESS_OPTIONS`)
      - Doors: doorHeight, doorWidth, numDoors (step="1", min="0")
      - Windows: windowHeight, windowWidth, numWindows (step="1", min="0")
    - Submit button with emoji and text "Calculate Materials"
    - Empty `<div id="result" aria-live="polite"></div>` below the form
    - _Requirements: 1.1, 2.1_

  - [x] 8.2 Implement `useEstimator` in `frontend/src/hooks/useEstimator.ts`
    - Attach `submit` event listener to the form element at `formSelector`
    - On submit: call `parseBrickWallForm` → show inline error list if errors exist
    - Show loading indicator in `resultSelector` while API call is in progress
    - On success: render `BrickWallResultCard` into `resultSelector`
    - On error: render error message (use API `message` field if available, else fallback message)
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 9. Wire up frontend entry point
  - [x] 9.1 Implement `mountApp` in `frontend/src/App.ts`
    - Render `EstimatorPage()` into the container's `innerHTML`
    - Call `useEstimator({ formSelector: "#estimate-form", resultSelector: "#result" })`
    - _Requirements: 7.1_

  - [x] 9.2 Implement `frontend/src/main.ts`
    - Import `./styles/global.css`
    - Query `#app` div; throw if not found
    - Call `mountApp(app)`
    - _Requirements: 7.1_

  - [x] 9.3 Verify `frontend/src/styles/global.css` contains all required CSS classes
    - Confirm classes exist for: `.page`, `.topbar`, `.brand`, `.menu`, `.hero-section`, `.hero-copy`, `.hero-badges`, `.hero-badge`, `.section-card`, `.subtitle`, `.bw-fieldset`, `.bw-legend`, `.input-grid`, `.input-grid-2`, `.input-grid-3`, `.bw-submit-btn`, `.loading-indicator`, `.loading-spinner`, `.bw-result-card`, `.bw-result-grid`, `.bw-result-item`, `.bw-result-primary`, `.bw-result-value`, `.bw-result-volumes`, `.bw-volume-row`, `.bw-volume-net`, `.error-message`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Final checkpoint — full stack integration
  - Ensure all tests pass (backend and frontend), ask the user if questions arise.
  - Verify the canonical worked example end-to-end: POST to `http://localhost:4000/api/brick-wall/estimate` with L=16, B=13, H=10, T=0.75, Hd=7, Wd=3, Nd=1, Hw=4, Ww=4, Nw=2 returns bricks=3902, cementBags=19, sandCFT=136.08
  - Confirm `GET http://localhost:4000/api/health` returns `{ "status": "ok" }`
  - _Requirements: 6.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The backend runs on port 4000 (`npm run dev` in `/backend`); the frontend runs on port 5173 (`npm run dev` in `/frontend`)
- All scaffolded files already exist — no new files need to be created, only filled in (except test files which are new)
- Property tests use **fast-check** and must run a minimum of 100 iterations
- Each property test must include the comment tag: `// Feature: brick-wall-estimator, Property N: <property_text>`
- The canonical worked example (Requirement 6.5) is the primary integration verification target

# Design Document — Brick Wall Estimator

## Overview

The Brick Wall Estimator is a full-stack TypeScript feature within the **ConstroMat** application. A user fills in 10 numeric fields describing a rectangular room's geometry and its door/window openings; the system applies a 7-step CFT-based algorithm on the backend and returns the quantities of bricks, cement bags, and sand required to build the perimeter walls.

The feature is already partially scaffolded. The design below describes the complete, intended architecture so that every empty or stub file can be filled in consistently.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Calculation location | Backend only | Keeps business logic testable and authoritative; frontend never re-derives results |
| Unit system | CFT throughout | Matches the industry standard used by the requirements |
| Mortar mix | 1:6 (cement:sand) | Standard mix ratio specified in requirements |
| Brick wastage | 5% (factor 1.05) | Industry standard for breakage allowance |
| Rounding | `Math.ceil` for bricks and cement bags; `Math.round` to 2 dp for volumes | Ensures over-ordering rather than under-ordering |
| Frontend framework | Vanilla TypeScript + Vite | Matches existing project setup |
| API transport | JSON over HTTP REST | Simple, stateless, easy to test |

---

## Architecture

The system follows a classic three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Vite / Vanilla TypeScript)                    │
│                                                         │
│  main.ts → App.ts → EstimatorPage.ts                   │
│               ↓                                         │
│  useEstimator (hook) ← parseBrickWallForm (validator)  │
│               ↓                                         │
│  estimator.api.ts  (fetch wrapper)                      │
└──────────────────────┬──────────────────────────────────┘
                       │  POST /api/brick-wall/estimate
                       │  JSON body: BrickWallInput (10 fields)
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Node.js / Express Backend                              │
│                                                         │
│  app.ts → estimator.routes.ts                          │
│               ↓                                         │
│  estimator.controller.ts  (HTTP validation)            │
│               ↓                                         │
│  brickWall.service.ts     (pure calculation)           │
│               ↓                                         │
│  constants.ts             (BRICK_WALL_CONSTANTS)       │
└─────────────────────────────────────────────────────────┘
```

### Request / Response Flow

```
User fills form
      │
      ▼
parseBrickWallForm()   ← validates 10 fields client-side
      │ errors? → show inline error list, stop
      ▼
show loading indicator
      │
      ▼
calculateBrickWallEstimate()   ← POST /api/brick-wall/estimate
      │
      ▼
estimateBrickWall controller   ← server-side validation (type + range)
      │ invalid? → 400 + { message }
      ▼
calculateBrickWall service     ← pure 7-step algorithm
      │ openings >= gross? → throw Error
      ▼
BrickWallResult JSON           ← 200 + 6 output fields
      │
      ▼
BrickWallResultCard()          ← renders result HTML
      │
      ▼
inject into #result div
```

---

## Components and Interfaces

### Backend

#### `app.ts`
Express application entry point. Registers CORS, JSON body parser, health check route, and the estimator router. Starts the server on `SERVER_CONFIG.PORT` (4000).

#### `routes/estimator.routes.ts`
```
POST /api/estimate            → estimateMaterials   (legacy)
POST /api/brick-wall/estimate → estimateBrickWall   (brick wall feature)
```

#### `controllers/estimator.controller.ts` — `estimateBrickWall`
Responsibilities:
- Extract and type-check all 10 fields from `req.body`
- Validate positive numbers for the 8 dimensional fields
- Validate non-negative integers for `numDoors` and `numWindows`
- Return `400` with a `{ message }` body on any validation failure
- Delegate to `calculateBrickWall` and return `200` with the result
- Catch service errors (e.g. openings exceed wall) and return `400`

#### `services/brickWall.service.ts` — `calculateBrickWall`
Pure function. No I/O. Implements the 7-step algorithm (see Data Models section). Throws a descriptive `Error` if `netWallVolume <= 0`.

#### `config/constants.ts` — `BRICK_WALL_CONSTANTS`
All numeric constants used by the algorithm are centralised here to avoid magic numbers in the service.

### Frontend

#### `pages/EstimatorPage.ts`
Renders the full page HTML as a string. Composed of:
- Topbar / navigation
- Hero copy section
- `SectionCard` wrapping the estimator form
- The form contains three `<fieldset>` groups: Room Dimensions, Doors, Windows
- A submit button and an empty `#result` div

#### `components/InputField.ts`
Two exported functions:
- `InputField(props)` — renders a labelled `<input type="number">` with configurable `min`, `step`, `placeholder`, and `value`
- `SelectField(props)` — renders a labelled `<select>` with pre-built options (used for wall thickness)

#### `components/ResultCard.ts` — `BrickWallResultCard`
Renders the result HTML from a `BrickWallResult` object. Shows:
- Three primary metric cards: Bricks, Cement Bags, Sand
- Volume breakdown table: Gross → minus Openings → Net
- A note about mix ratio and units

#### `components/SectionCard.ts`
Generic card wrapper that renders a `<section>` with a title, optional subtitle, and arbitrary content HTML.

#### `hooks/useEstimator.ts` — `useEstimator`
Attaches a `submit` event listener to the form. On submit:
1. Calls `parseBrickWallForm` — shows errors if any
2. Shows loading indicator
3. Calls `calculateBrickWallEstimate` (API service)
4. On success: renders `BrickWallResultCard`
5. On error: renders error message

#### `services/estimator.api.ts` — `calculateBrickWallEstimate`
Thin `fetch` wrapper. Posts `BrickWallInput` to `POST /api/brick-wall/estimate`. Throws a typed `Error` on non-2xx responses, extracting the `message` field from the JSON body when available.

#### `utils/validators.ts` — `parseBrickWallForm`
Parses a `FormData` object into a `BrickWallInput`. Returns both the parsed input and an array of `BrickWallValidationError` objects. Uses two helpers:
- `getPositive(name, label)` — rejects zero, negative, and non-finite values
- `getNonNegativeInt(name, label)` — rejects negative, non-integer, and non-finite values

#### `constants/estimator.constants.ts`
- `API_BASE_URL` — base URL for all API calls (`http://localhost:4000/api`)
- `WALL_THICKNESS_OPTIONS` — dropdown options for the wall thickness select field
- `CONSTRUCTION_TYPE_OPTIONS` — legacy options (kept for backward compatibility)

---

## Data Models

### Input — `BrickWallInput`

| Field | Type | Unit | Description |
|---|---|---|---|
| `roomLength` | `number` | ft | L — room internal length |
| `roomBreadth` | `number` | ft | B — room internal breadth |
| `wallHeight` | `number` | ft | H — wall height |
| `wallThickness` | `number` | ft | T — wall thickness (e.g. 0.75 for 9") |
| `doorHeight` | `number` | ft | Hd — height of each door |
| `doorWidth` | `number` | ft | Wd — width of each door |
| `numDoors` | `number` | nos | Nd — number of doors (non-negative integer) |
| `windowHeight` | `number` | ft | Hw — height of each window |
| `windowWidth` | `number` | ft | Ww — width of each window |
| `numWindows` | `number` | nos | Nw — number of windows (non-negative integer) |

### Output — `BrickWallResult`

| Field | Type | Unit | Description |
|---|---|---|---|
| `bricks` | `number` | nos | Brick count including 5% wastage (ceiling integer) |
| `cementBags` | `number` | nos | 50 kg cement bags (ceiling integer) |
| `sandCFT` | `number` | ft³ | Sand volume (2 dp) |
| `netWallVolume` | `number` | ft³ | Net wall volume after openings (2 dp) |
| `grossWallVolume` | `number` | ft³ | Gross wall volume before openings (2 dp) |
| `openingVolume` | `number` | ft³ | Total opening volume (2 dp) |

### The 7-Step Algorithm

All values in cubic feet (CFT).

```
Step 1 — Gross Wall Volume
  grossWallVolume = 2 × (L + B) × H × T

Step 2 — Opening Volume
  openingVolume = (Hd × Wd × T × Nd) + (Hw × Ww × T × Nw)

Step 3 — Net Wall Volume
  netWallVolume = grossWallVolume − openingVolume
  Guard: if netWallVolume ≤ 0 → throw Error

Step 4 — Bricks (with 5% wastage)
  bricks = CEIL(netWallVolume × 9.40 × 1.05)

Step 5 — Dry Mortar Volume
  mortarDry = netWallVolume × 0.30 × 1.33

Step 6 — Cement Bags (1:6 mix, 50 kg bags = 1.25 ft³)
  cementBags = CEIL((1/7 × mortarDry) / 1.25)

Step 7 — Sand (1:6 mix)
  sandCFT = (6/7) × mortarDry
```

### Worked Example (Canonical Verification)

| Input | Value |
|---|---|
| L | 16 ft |
| B | 13 ft |
| H | 10 ft |
| T | 0.75 ft |
| Hd | 7 ft |
| Wd | 3 ft |
| Nd | 1 |
| Hw | 4 ft |
| Ww | 4 ft |
| Nw | 2 |

| Output | Expected |
|---|---|
| `grossWallVolume` | 435.00 ft³ |
| `openingVolume` | 39.75 ft³ |
| `netWallVolume` | 395.25 ft³ |
| `bricks` | 3902 nos |
| `cementBags` | 19 bags |
| `sandCFT` | 136.08 ft³ |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is well-suited for property-based testing: the core is a set of pure mathematical functions whose outputs must satisfy precise algebraic relationships for all valid inputs. The PBT library chosen is **[fast-check](https://fast-check.dev/)** (TypeScript-native, widely used).

---

### Property Reflection

Before writing the final properties, redundancies in the prework are resolved:

- **1.2 and 2.2** (validation rejects invalid inputs) can be unified into one property covering all 10 fields.
- **4.1, 5.2, 5.3** (brick count, cement bags, sand) all derive from `netWallVolume`. They can be expressed as a single comprehensive formula-correctness property, or kept separate for clarity. They are kept separate because they test distinct formulas.
- **3.1 and 3.2** (net volume computation and the guard) are kept separate — one tests the arithmetic, the other tests the error condition.
- **6.2 and 8.2** (response shape and numeric types) are combined into one property: "all output fields are present and are numbers".
- **7.1 and 7.5** (result card renders all fields and formats numbers correctly) are combined into one property.
- **8.1** (idempotence / determinism) stands alone.

---

### Property 1: Input Validation Rejects Non-Positive Dimensional Values

*For any* form submission where at least one of the 8 dimensional fields (roomLength, roomBreadth, wallHeight, wallThickness, doorHeight, doorWidth, windowHeight, windowWidth) is zero, negative, or non-finite, `parseBrickWallForm` SHALL return a non-empty errors array identifying the offending field.

**Validates: Requirements 1.2, 1.3, 2.2**

---

### Property 2: Gross Wall Volume Formula

*For any* combination of positive values for L, B, H, and T, `calculateBrickWall` SHALL return a `grossWallVolume` equal to `2 × (L + B) × H × T`.

**Validates: Requirements 1.4**

---

### Property 3: Opening Volume Formula

*For any* valid input set, `calculateBrickWall` SHALL return an `openingVolume` equal to `(Hd × Wd × T × Nd) + (Hw × Ww × T × Nw)`. When `Nd = 0` the door term is zero; when `Nw = 0` the window term is zero.

**Validates: Requirements 2.3, 2.4, 2.5**

---

### Property 4: Net Volume Is Gross Minus Openings

*For any* valid input where `openingVolume < grossWallVolume`, `calculateBrickWall` SHALL return a `netWallVolume` equal to `grossWallVolume − openingVolume`.

**Validates: Requirements 3.1**

---

### Property 5: Oversized Openings Throw an Error

*For any* input configuration where the computed `openingVolume` is greater than or equal to the computed `grossWallVolume`, `calculateBrickWall` SHALL throw an `Error` with a descriptive message.

**Validates: Requirements 3.2**

---

### Property 6: Brick Count Formula

*For any* valid input, `calculateBrickWall` SHALL return `bricks` equal to `Math.ceil(netWallVolume × 9.40 × 1.05)`.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

---

### Property 7: Cement and Sand Formulas

*For any* valid input, `calculateBrickWall` SHALL return:
- `cementBags` equal to `Math.ceil((1/7 × netWallVolume × 0.30 × 1.33) / 1.25)`
- `sandCFT` equal to `(6/7) × netWallVolume × 0.30 × 1.33` (within floating-point tolerance of 0.01)

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

---

### Property 8: All Output Fields Are Present and Numeric

*For any* valid `BrickWallInput`, `calculateBrickWall` SHALL return an object where all six fields (`bricks`, `cementBags`, `sandCFT`, `netWallVolume`, `grossWallVolume`, `openingVolume`) are present and have `typeof === 'number'` with finite values.

**Validates: Requirements 6.2, 8.2**

---

### Property 9: Result Card Renders All Required Fields with Correct Formatting

*For any* `BrickWallResult` object, `BrickWallResultCard` SHALL produce an HTML string that:
- Contains the numeric value of `bricks` formatted as a whole integer
- Contains the numeric value of `cementBags` formatted as a whole integer
- Contains `sandCFT` formatted to 2 decimal places
- Contains `netWallVolume`, `grossWallVolume`, and `openingVolume` each formatted to 2 decimal places

**Validates: Requirements 7.1, 7.5**

---

### Property 10: Calculation Is Deterministic

*For any* valid `BrickWallInput`, calling `calculateBrickWall` twice with the same input SHALL produce deeply equal output objects.

**Validates: Requirements 8.1**

---

## Error Handling

### Backend Error Handling

| Scenario | HTTP Status | Response Body |
|---|---|---|
| Missing or non-positive dimensional field | 400 | `{ "message": "Field '<name>' must be a positive number." }` |
| Missing or invalid count field (non-integer / negative) | 400 | `{ "message": "Field '<name>' must be a non-negative integer." }` |
| Opening volume ≥ gross wall volume | 400 | `{ "message": "Opening volume equals or exceeds gross wall volume. Please check your inputs." }` |
| Unexpected server error | 400 | `{ "message": "Unable to calculate estimate" }` |
| Valid request | 200 | `BrickWallResult` JSON object |

The controller validates all 10 fields before calling the service. The service is a pure function and only throws for the opening-exceeds-wall guard. All thrown errors are caught by the controller's try/catch and returned as 400 responses.

### Frontend Error Handling

| Scenario | UI Behaviour |
|---|---|
| Client-side validation failure | Inline error list rendered in `#result` with `role="alert"` |
| API returns 400 with `message` | Error message from API body displayed in `#result` |
| Network error / server unreachable | Fallback message: "Failed to fetch estimate. Please start the backend server and try again." |
| API in progress | Loading indicator with spinner animation shown in `#result` |

All error states are rendered into the `#result` div which has `aria-live="polite"` for screen reader accessibility.

---

## Testing Strategy

### Dual Testing Approach

Both unit/example tests and property-based tests are used. They are complementary:
- **Example tests** verify specific known-good and known-bad scenarios (including the canonical worked example from Requirement 6.5)
- **Property tests** verify universal algebraic invariants across hundreds of randomly generated inputs

### Property-Based Testing Library

**[fast-check](https://fast-check.dev/)** — TypeScript-native, zero runtime dependencies, supports arbitrary generators, runs in Node.js and browsers.

Install: `npm install --save-dev fast-check`

Each property test is configured to run a minimum of **100 iterations**.

### Test Tag Format

Each property test must include a comment tag:

```typescript
// Feature: brick-wall-estimator, Property N: <property_text>
```

### Backend Tests (`backend/src/__tests__/`)

#### Example Tests — `brickWall.service.example.test.ts`

| Test | Description |
|---|---|
| Canonical worked example | Inputs from Req 6.5 → exact expected outputs |
| Zero doors | Nd=0 → door term is zero |
| Zero windows | Nw=0 → window term is zero |
| Openings equal gross volume | Throws with descriptive message |
| Openings exceed gross volume | Throws with descriptive message |

#### Property Tests — `brickWall.service.property.test.ts`

| Property | Generator | Assertion |
|---|---|---|
| Property 2: Gross volume formula | `fc.tuple(fc.float({min:0.1,max:100}), ...)` for L,B,H,T | `grossWallVolume === 2*(L+B)*H*T` |
| Property 3: Opening volume formula | Valid inputs with Nd,Nw ∈ [0,10] | `openingVolume === (Hd*Wd*T*Nd)+(Hw*Ww*T*Nw)` |
| Property 4: Net = Gross − Openings | Inputs constrained so openings < gross | `netWallVolume === grossWallVolume - openingVolume` |
| Property 5: Oversized openings throw | Inputs where openings ≥ gross | `expect(() => calculateBrickWall(input)).toThrow()` |
| Property 6: Brick count formula | Valid inputs | `bricks === Math.ceil(netVol * 9.40 * 1.05)` |
| Property 7: Cement and sand formulas | Valid inputs | Cement and sand match formulas within tolerance |
| Property 8: All outputs present and numeric | Valid inputs | All 6 fields are finite numbers |
| Property 10: Determinism | Valid inputs | Two calls return deeply equal results |

#### Controller Tests — `estimator.controller.example.test.ts`

| Test | Description |
|---|---|
| Valid request → 200 | Full valid body returns 200 + result |
| Missing field → 400 | Each of the 10 fields missing returns 400 + message |
| Negative dimensional field → 400 | Returns 400 + message |
| Non-integer count → 400 | Returns 400 + message |

### Frontend Tests (`frontend/src/__tests__/`)

#### Example Tests — `validators.example.test.ts`

| Test | Description |
|---|---|
| Valid form data | Returns input with empty errors array |
| Empty form | Returns errors for all 10 fields |
| Canonical worked example values | Parses correctly |

#### Property Tests — `validators.property.test.ts`

| Property | Generator | Assertion |
|---|---|---|
| Property 1: Validation rejects non-positive dimensions | Generate invalid values for each dimensional field | `errors.length > 0` and error identifies the field |

#### Example Tests — `ResultCard.example.test.ts`

| Test | Description |
|---|---|
| Canonical result renders all 6 fields | BrickWallResultCard output contains all labels |
| Bricks formatted as integer | No decimal point in bricks value |
| Volumes formatted to 2 dp | sandCFT, netWallVolume etc. show 2 decimal places |

#### Property Tests — `ResultCard.property.test.ts`

| Property | Generator | Assertion |
|---|---|---|
| Property 9: All fields rendered with correct format | `fc.record({bricks: fc.integer(...), ...})` | HTML contains all 6 values formatted correctly |

### Integration / Smoke Tests

| Test | Type | Description |
|---|---|---|
| `GET /api/health` returns 200 | Smoke | Server is running |
| `POST /api/brick-wall/estimate` with valid body returns 200 | Smoke | Route is wired correctly |
| End-to-end canonical example via HTTP | Integration | Full stack: POST → service → response matches expected values |

### Test Runner

The backend uses **Jest** (or **Vitest** if added). The frontend uses **Vitest** (already in the Vite ecosystem). Run tests with `--run` flag for single execution (no watch mode).

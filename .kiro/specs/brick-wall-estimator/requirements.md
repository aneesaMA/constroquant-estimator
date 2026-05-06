# Requirements Document

## Introduction

The Brick Wall Estimator is a feature within the ConstroQuant application that calculates the quantity of materials (bricks, cement, and sand) required to build a rectangular room's perimeter walls. The estimator accepts 10 inputs describing the room geometry, wall thickness, and openings (doors and windows), then applies a standard CFT-based algorithm to produce accurate material quantities including a 5% brick wastage allowance and a 1:6 cement-to-sand mortar mix ratio.

## Glossary

- **Estimator**: The Brick Wall Estimator feature, encompassing both the frontend UI and backend calculation service.
- **Calculator**: The backend service component that performs the 7-step CFT calculation algorithm.
- **API**: The HTTP REST endpoint exposed by the backend at `POST /api/brick-wall/estimate`.
- **UI**: The frontend web page that collects inputs and displays results.
- **CFT**: Cubic Feet — the unit used for all volumetric calculations.
- **Gross_Wall_Volume**: The total wall volume before subtracting openings, in CFT.
- **Opening_Volume**: The combined volume of all door and window openings, in CFT.
- **Net_Wall_Volume**: The wall volume after subtracting openings (`Gross_Wall_Volume − Opening_Volume`), in CFT.
- **Mortar_Dry_Volume**: The dry mortar volume required, computed as `Net_Wall_Volume × 0.30 × 1.33`.
- **Nominal_Brick_Volume**: The volume of one brick including a 0.5" mortar joint = 0.1063 ft³.
- **Bricks_Per_CFT**: The number of bricks per cubic foot = 9.40 nos/ft³.
- **Wastage_Factor**: The multiplier applied to account for brick breakage = 1.05 (5%).
- **Dry_Mortar_Factor**: The bulking factor converting wet mortar volume to dry = 1.33.
- **Mortar_Ratio_Total**: The sum of cement and sand parts in the mix = 7 (1 part cement + 6 parts sand).
- **Cement_Bag_Volume**: The bulk volume of one 50 kg cement bag = 1.25 ft³.

## Requirements

### Requirement 1: Accept Room and Wall Geometry Inputs

**User Story:** As a construction estimator, I want to enter room dimensions and wall thickness, so that the system can compute the total gross wall volume.

#### Acceptance Criteria

1. THE UI SHALL provide numeric input fields for Room Length (L) in feet, Room Breadth (B) in feet, Wall Height (H) in feet, and Wall Thickness (T) in feet.
2. WHEN a user submits the form, THE UI SHALL validate that L, B, H, and T are each positive numbers greater than zero.
3. IF L, B, H, or T is missing or not a positive number, THEN THE UI SHALL display a descriptive validation error message identifying the invalid field.
4. THE Calculator SHALL accept L, B, H, and T as numeric inputs in feet and compute `Gross_Wall_Volume = 2 × (L + B) × H × T`.

### Requirement 2: Accept Door and Window Opening Inputs

**User Story:** As a construction estimator, I want to specify door and window dimensions and counts, so that the system can subtract opening volumes from the gross wall volume.

#### Acceptance Criteria

1. THE UI SHALL provide numeric input fields for Door Height (Hd) in feet, Door Width (Wd) in feet, Number of Doors (Nd), Window Height (Hw) in feet, Window Width (Ww) in feet, and Number of Windows (Nw).
2. WHEN a user submits the form, THE UI SHALL validate that Hd, Wd, Hw, and Ww are each positive numbers greater than zero, and that Nd and Nw are non-negative integers.
3. IF Nd equals zero, THEN THE Calculator SHALL treat the door opening volume contribution as zero.
4. IF Nw equals zero, THEN THE Calculator SHALL treat the window opening volume contribution as zero.
5. THE Calculator SHALL compute `Opening_Volume = (Hd × Wd × T × Nd) + (Hw × Ww × T × Nw)`.

### Requirement 3: Calculate Net Wall Volume

**User Story:** As a construction estimator, I want the system to subtract opening volumes from the gross wall volume, so that material quantities are based only on solid wall area.

#### Acceptance Criteria

1. THE Calculator SHALL compute `Net_Wall_Volume = Gross_Wall_Volume − Opening_Volume`.
2. IF `Opening_Volume` is greater than or equal to `Gross_Wall_Volume`, THEN THE API SHALL return a 400 error with a descriptive message indicating the openings exceed the wall volume.

### Requirement 4: Calculate Brick Quantity

**User Story:** As a construction estimator, I want the system to calculate the number of bricks required including wastage, so that I can order the correct quantity.

#### Acceptance Criteria

1. THE Calculator SHALL compute the brick count as `CEIL(Net_Wall_Volume × 9.40 × 1.05)`.
2. THE Calculator SHALL use a Bricks_Per_CFT constant of 9.40 nos/ft³ derived from a nominal brick volume of 0.1063 ft³ (10.5" × 5" × 3.5" including 0.5" mortar joint, converted to ft³).
3. THE Calculator SHALL apply a Wastage_Factor of 1.05 to account for 5% brick breakage.
4. THE Calculator SHALL round the brick count up to the nearest whole number using ceiling rounding.

### Requirement 5: Calculate Cement and Sand Quantities

**User Story:** As a construction estimator, I want the system to calculate cement bags and sand volume for a 1:6 mortar mix, so that I can procure the correct materials.

#### Acceptance Criteria

1. THE Calculator SHALL compute `Mortar_Dry_Volume = Net_Wall_Volume × 0.30 × 1.33`, where 0.30 represents 30% mortar content of net volume and 1.33 is the Dry_Mortar_Factor for sand bulking.
2. THE Calculator SHALL compute `Cement_bags = CEIL((1/7 × Mortar_Dry_Volume) / 1.25)`, where 1/7 is the cement fraction in a 1:6 mix and 1.25 ft³ is the Cement_Bag_Volume per 50 kg bag.
3. THE Calculator SHALL compute `Sand_CFT = (6/7) × Mortar_Dry_Volume`, where 6/7 is the sand fraction in a 1:6 mix.
4. THE Calculator SHALL round the cement bag count up to the nearest whole number using ceiling rounding.

### Requirement 6: Return Calculation Results via API

**User Story:** As a frontend developer, I want the backend to return all calculated values in a structured response, so that the UI can display a complete material breakdown.

#### Acceptance Criteria

1. THE API SHALL expose a `POST /api/brick-wall/estimate` endpoint that accepts a JSON body containing all 10 input fields.
2. WHEN a valid request is received, THE API SHALL return a JSON response containing: `bricks` (integer), `cementBags` (integer), `sandCFT` (number, 2 decimal places), `netWallVolume` (number, 2 decimal places), `grossWallVolume` (number, 2 decimal places), and `openingVolume` (number, 2 decimal places).
3. IF any required input field is missing or invalid, THEN THE API SHALL return HTTP 400 with a JSON body containing a `message` field describing the validation error.
4. WHEN a valid request is received, THE API SHALL return HTTP 200.
5. THE API SHALL validate the worked example: inputs L=16, B=13, H=10, T=0.75, Hd=7, Wd=3, Nd=1, Hw=4, Ww=4, Nw=2 SHALL produce bricks=3902, cementBags=19, sandCFT=136.08 (±0.01), netWallVolume=395.25, grossWallVolume=435.00, openingVolume=39.75.

### Requirement 7: Display Results in the UI

**User Story:** As a construction estimator, I want to see all calculated material quantities clearly displayed after submitting the form, so that I can use the results for procurement planning.

#### Acceptance Criteria

1. WHEN the API returns a successful response, THE UI SHALL display the following result fields: Bricks (nos), Cement Bags (50 kg bags), Sand (CFT), Net Wall Volume (ft³), Gross Wall Volume (ft³), and Total Openings (ft³).
2. WHILE the API request is in progress, THE UI SHALL display a loading indicator to inform the user that calculation is underway.
3. IF the API returns an error response, THEN THE UI SHALL display the error message from the API response to the user.
4. IF a network error occurs, THEN THE UI SHALL display a descriptive message instructing the user to check the backend server connection.
5. THE UI SHALL display numeric results rounded to 2 decimal places for volume values and as whole integers for brick and cement bag counts.

### Requirement 8: Round-Trip Serialization Consistency

**User Story:** As a developer, I want the API request and response data to serialize and deserialize consistently, so that no precision is lost between the frontend and backend.

#### Acceptance Criteria

1. FOR ALL valid input combinations, THE API SHALL return a response that, when re-submitted as input to the Calculator, produces identical output values (idempotent calculation — same inputs always yield same outputs).
2. THE API SHALL accept and return all numeric values as JSON numbers, not strings.

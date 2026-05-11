# Requirements Document

## Introduction

The Road Construction Estimator is a new feature within the ConstroQuant application that calculates layer quantities and raw material procurement requirements for three pavement types: Bituminous Road, Concrete Road, and Gravel Road. The estimator accepts a pavement type, traffic category, soil type, road length, and road width. It auto-assigns layer thicknesses from lookup tables (no manual entry), computes per-layer volumes or tonnages, and produces procurement-ready material quantities including compaction and wastage factors. The feature integrates into the existing UI via a "Road Construction" option in the construction-type selector, alongside the existing "Room Construction" estimator.

## Glossary

- **Estimator**: The Road Construction Estimator feature, encompassing both the frontend UI and backend calculation service.
- **Road_Service**: The backend service component that performs layer thickness lookup and material quantity calculations.
- **API**: The HTTP REST endpoint exposed by the backend at `POST /api/road/estimate`.
- **UI**: The frontend web page that collects inputs and displays results.
- **Pavement_Type**: One of three road surface categories: `Bituminous`, `Concrete`, or `Gravel`.
- **Traffic_Category**: The design traffic load level: `Low`, `Medium`, `High`, or `Heavy Industrial`. Note: `Heavy Industrial` is only valid for Bituminous roads.
- **Soil_Type**: The subgrade bearing capacity classification: `Weak`, `Medium`, or `Strong`.
- **Thickness_Table**: The lookup table that maps `(Pavement_Type, Traffic_Category, Soil_Type)` to layer thicknesses in millimetres.
- **GSB**: Granular Sub-Base layer — a compacted granular foundation layer, measured in mm.
- **WMM**: Wet Mix Macadam layer — a bound granular base layer used in Bituminous roads, measured in mm.
- **DBM**: Dense Bituminous Macadam layer — a bituminous binder course used in Bituminous roads, measured in mm.
- **BC**: Bituminous Concrete layer — the wearing course used in Bituminous roads, measured in mm.
- **DLC**: Dry Lean Concrete layer — a lean concrete sub-base used in Concrete roads, measured in mm.
- **PQC**: Pavement Quality Concrete layer — the structural concrete slab used in Concrete roads, measured in mm.
- **Gravel**: The compacted gravel wearing course used in Gravel roads, measured in mm.
- **Layer_Quantity**: The computed volume (m³) or mass (tonnes) of a single pavement layer.
- **Raw_Material**: A procurement-ready material quantity after applying compaction and wastage factors.
- **Compaction_Factor**: The multiplier applied to a loose-material volume to account for compaction during placement (GSB = 1.25, WMM = 1.20).
- **Wastage_Factor**: The multiplier applied to account for material loss during transport and placement = 1.03 (3%).
- **GSB_Procurement_Factor**: Combined factor for GSB procurement = 1.25 × 1.03 = 1.2875, rounded to 1.29 in formulas.
- **WMM_Procurement_Factor**: Combined factor for WMM procurement = 1.20 × 1.03 = 1.236, rounded to 1.24 in formulas.
- **DBM_Density**: The compacted density of Dense Bituminous Macadam = 2.4 t/m³.
- **BC_Density**: The compacted density of Bituminous Concrete = 2.4 t/m³.
- **Bitumen_Content**: The bitumen fraction by mass in DBM and BC layers = 5% (0.05).
- **M20_Mix_Ratio**: The concrete mix ratio for DLC and PQC = 1:1.5:3 (cement:sand:aggregate), total parts = 5.5.
- **Cement_Bags_Per_m3**: The number of 50 kg cement bags required per m³ of concrete = 30 bags.
- **L**: Road length in metres.
- **W**: Road width in metres.
- **T_layer**: Thickness of a named layer converted to metres (mm ÷ 1000).

## Requirements

### Requirement 1: Select Pavement Type

**User Story:** As a road construction estimator, I want to select the pavement type, so that the system can apply the correct layer structure and thickness lookup table.

#### Acceptance Criteria

1. THE UI SHALL provide a dropdown selector for Pavement_Type with the options: `Bituminous Road`, `Concrete Road`, and `Gravel Road`.
2. WHEN a Pavement_Type is selected, THE UI SHALL update the available Traffic_Category options to reflect only the categories valid for that pavement type.
3. THE UI SHALL restrict the `Heavy Industrial` Traffic_Category option to Bituminous Road only; it SHALL NOT appear as a selectable option for Concrete Road or Gravel Road.
4. WHEN a user changes the Pavement_Type after having already selected a Traffic_Category, THE UI SHALL reset the Traffic_Category selection to its default empty state.

### Requirement 2: Select Traffic Category and Soil Type

**User Story:** As a road construction estimator, I want to select the traffic category and soil type, so that the system can look up the correct layer thicknesses for the design conditions.

#### Acceptance Criteria

1. THE UI SHALL provide a dropdown selector for Traffic_Category with the options appropriate to the selected Pavement_Type.
2. THE UI SHALL provide a dropdown selector for Soil_Type with the options: `Strong`, `Medium`, and `Weak`.
3. WHEN a user submits the form, THE UI SHALL validate that Pavement_Type, Traffic_Category, and Soil_Type are each selected and non-empty.
4. IF Pavement_Type, Traffic_Category, or Soil_Type is not selected, THEN THE UI SHALL display a descriptive validation error message identifying the unselected field.

### Requirement 3: Auto-Assign Layer Thicknesses from Lookup Tables

**User Story:** As a road construction estimator, I want the system to automatically assign layer thicknesses based on my selections, so that I do not need to manually enter thickness values.

#### Acceptance Criteria

1. THE Road_Service SHALL look up layer thicknesses using the combination of `(Pavement_Type, Traffic_Category, Soil_Type)` as a composite key against the Thickness_Table.
2. THE Road_Service SHALL NOT accept manual thickness inputs; all thicknesses SHALL be derived exclusively from the Thickness_Table.
3. THE Road_Service SHALL apply the following Bituminous Road thickness table (all values in mm):

   | Traffic Category | Soil Type | GSB | WMM | DBM | BC |
   |---|---|---|---|---|---|
   | Low | Strong | 150 | 200 | 50 | 25 |
   | Low | Medium | 175 | 225 | 60 | 30 |
   | Low | Weak | 200 | 250 | 75 | 40 |
   | Medium | Strong | 175 | 225 | 60 | 30 |
   | Medium | Medium | 200 | 250 | 75 | 40 |
   | Medium | Weak | 225 | 275 | 90 | 40 |
   | High | Strong | 200 | 250 | 75 | 40 |
   | High | Medium | 225 | 275 | 90 | 50 |
   | High | Weak | 250 | 300 | 100 | 50 |
   | Heavy Industrial | Strong | 250 | 300 | 100 | 50 |
   | Heavy Industrial | Medium | 275 | 325 | 110 | 50 |
   | Heavy Industrial | Weak | 300 | 350 | 120 | 60 |

4. THE Road_Service SHALL apply the following Concrete Road thickness table (all values in mm):

   | Traffic Category | Soil Type | GSB | DLC | PQC |
   |---|---|---|---|---|
   | Low | Strong | 100 | 100 | 200 |
   | Low | Medium | 125 | 125 | 220 |
   | Low | Weak | 150 | 150 | 230 |
   | Medium | Strong | 125 | 125 | 220 |
   | Medium | Medium | 150 | 150 | 250 |
   | Medium | Weak | 175 | 175 | 280 |
   | High | Strong | 150 | 150 | 250 |
   | High | Medium | 175 | 175 | 280 |
   | High | Weak | 200 | 200 | 300 |

5. THE Road_Service SHALL apply the following Gravel Road thickness table (all values in mm):

   | Traffic Category | Soil Type | Gravel | GSB |
   |---|---|---|---|
   | Low | Strong | 100 | 100 |
   | Low | Medium | 125 | 100 |
   | Low | Weak | 150 | 100 |
   | Medium | Strong | 150 | 125 |
   | Medium | Medium | 175 | 125 |
   | Medium | Weak | 200 | 125 |
   | High | Strong | 200 | 150 |
   | High | Medium | 225 | 150 |
   | High | Weak | 250 | 150 |

6. IF the combination of `(Pavement_Type, Traffic_Category, Soil_Type)` does not exist in the Thickness_Table, THEN THE API SHALL return HTTP 400 with a descriptive error message.

### Requirement 4: Enter Road Dimensions

**User Story:** As a road construction estimator, I want to enter the road length and width in metres, so that the system can compute layer volumes.

#### Acceptance Criteria

1. THE UI SHALL provide a numeric input field for Road Length (L) in metres.
2. THE UI SHALL provide a numeric input field for Road Width (W) in metres.
3. WHEN a user submits the form, THE UI SHALL validate that L and W are each positive numbers greater than zero.
4. IF L or W is missing or not a positive number, THEN THE UI SHALL display a descriptive validation error message identifying the invalid field.
5. THE Road_Service SHALL accept L and W as numeric inputs in metres.

### Requirement 5: Calculate Bituminous Road Layer Quantities and Raw Materials

**User Story:** As a road construction estimator, I want the system to calculate layer quantities and procurement materials for a Bituminous Road, so that I can plan material orders accurately.

#### Acceptance Criteria

1. WHEN Pavement_Type is `Bituminous`, THE Road_Service SHALL compute layer quantities as follows:
   - `Q_GSB = L × W × T_GSB` (m³)
   - `Q_WMM = L × W × T_WMM` (m³)
   - `Q_DBM = L × W × T_DBM × 2.4` (tonnes, using DBM_Density)
   - `Q_BC = L × W × T_BC × 2.4` (tonnes, using BC_Density)
2. WHEN Pavement_Type is `Bituminous`, THE Road_Service SHALL compute raw material requirements as follows:
   - `Bitumen_Total = (Q_DBM + Q_BC) × 0.05` (tonnes)
   - `Aggregate_DBM = Q_DBM × 0.95` (tonnes)
   - `Aggregate_BC = Q_BC × 0.95` (tonnes)
   - `GSB_Procure = Q_GSB × 1.29` (m³)
   - `WMM_Procure = Q_WMM × 1.24` (m³)
   - `DBM_Procure = Q_DBM × 1.03` (tonnes)
   - `BC_Procure = Q_BC × 1.03` (tonnes)

### Requirement 6: Calculate Concrete Road Layer Quantities and Raw Materials

**User Story:** As a road construction estimator, I want the system to calculate layer quantities and procurement materials for a Concrete Road, so that I can plan material orders accurately.

#### Acceptance Criteria

1. WHEN Pavement_Type is `Concrete`, THE Road_Service SHALL compute layer quantities as follows:
   - `Q_GSB = L × W × T_GSB` (m³)
   - `Q_DLC = L × W × T_DLC` (m³)
   - `Q_PQC = L × W × T_PQC` (m³)
   - `Q_Concrete = Q_DLC + Q_PQC` (m³, total concrete volume)
2. WHEN Pavement_Type is `Concrete`, THE Road_Service SHALL compute raw material requirements using M20_Mix_Ratio (1:1.5:3, total parts = 5.5) and Cement_Bags_Per_m3 = 30 as follows:
   - `Cement_bags = (1 / 5.5) × Q_Concrete × 30` (bags, before wastage)
   - `Sand = (1.5 / 5.5) × Q_Concrete` (m³, before wastage)
   - `Aggregate = (3 / 5.5) × Q_Concrete` (m³, before wastage)
   - `GSB_Procure = Q_GSB × 1.29` (m³)
   - `Cement_Final = Cement_bags × 1.03` (bags, after 3% wastage, ceiling rounded)
   - `Sand_Final = Sand × 1.03` (m³, after 3% wastage)
   - `Aggregate_Final = Aggregate × 1.03` (m³, after 3% wastage)

### Requirement 7: Calculate Gravel Road Layer Quantities and Raw Materials

**User Story:** As a road construction estimator, I want the system to calculate layer quantities and procurement materials for a Gravel Road, so that I can plan material orders accurately.

#### Acceptance Criteria

1. WHEN Pavement_Type is `Gravel`, THE Road_Service SHALL compute layer quantities as follows:
   - `Q_Gravel = L × W × T_Gravel` (m³)
   - `Q_GSB = L × W × T_GSB` (m³)
2. WHEN Pavement_Type is `Gravel`, THE Road_Service SHALL compute raw material requirements as follows:
   - `Gravel_Procure = Q_Gravel × 1.03` (m³)
   - `GSB_Procure = Q_GSB × 1.29` (m³)

### Requirement 8: Return Calculation Results via API

**User Story:** As a frontend developer, I want the backend to return all calculated values in a structured response, so that the UI can display a complete layer and material breakdown.

#### Acceptance Criteria

1. THE API SHALL expose a `POST /api/road/estimate` endpoint that accepts a JSON body with the fields: `pavementType` (string), `trafficCategory` (string), `soilType` (string), `roadLength` (number), and `roadWidth` (number).
2. WHEN a valid request is received, THE API SHALL return HTTP 200 with a JSON response containing three top-level objects: `layerThicknesses`, `layerQuantities`, and `rawMaterials`.
3. THE `layerThicknesses` object SHALL contain the auto-assigned thickness values (in mm) for each layer applicable to the selected Pavement_Type.
4. THE `layerQuantities` object SHALL contain the computed per-layer quantities in their respective units (m³ for volumetric layers, tonnes for bituminous layers).
5. THE `rawMaterials` object SHALL contain the procurement-ready quantities for each material in their respective units (m³ or tonnes or bags).
6. IF any required input field is missing or invalid, THEN THE API SHALL return HTTP 400 with a JSON body containing a `message` field describing the validation error.
7. THE API SHALL validate the following Bituminous Road worked example: inputs `pavementType=Bituminous`, `trafficCategory=Medium`, `soilType=Medium`, `roadLength=100`, `roadWidth=7` SHALL produce `T_GSB=200mm`, `T_WMM=250mm`, `T_DBM=75mm`, `T_BC=40mm`, `Q_GSB=140 m³`, `Q_WMM=175 m³`, `Q_DBM=126 t`, `Q_BC=67.2 t`, `Bitumen_Total=9.66 t`, `GSB_Procure=180.6 m³`, `WMM_Procure=217 m³`, `DBM_Procure=129.78 t`, `BC_Procure=69.216 t` (all values ±0.01).

### Requirement 9: Display Results in the UI

**User Story:** As a road construction estimator, I want to see all calculated layer quantities and raw material requirements clearly displayed after submitting the form, so that I can use the results for procurement planning.

#### Acceptance Criteria

1. WHEN the API returns a successful response, THE UI SHALL display results in two distinct sections: "Layer Quantities" and "Raw Material Requirements".
2. THE UI SHALL display the auto-assigned layer thicknesses alongside each layer quantity result so the estimator can verify the design inputs.
3. WHILE the API request is in progress, THE UI SHALL display a loading indicator to inform the user that calculation is underway.
4. IF the API returns an error response, THEN THE UI SHALL display the error message from the API response to the user.
5. IF a network error occurs, THEN THE UI SHALL display a descriptive message instructing the user to check the backend server connection.
6. THE UI SHALL display volume values rounded to 2 decimal places and mass values (tonnes) rounded to 3 decimal places.
7. THE UI SHALL display cement bag counts as ceiling-rounded whole integers.

### Requirement 10: Integrate Road Construction into the Construction Type Selector

**User Story:** As a user of ConstroQuant, I want to switch between Room Construction and Road Construction from a single selector, so that I can access both estimators from one page without navigating away.

#### Acceptance Criteria

1. THE UI SHALL add a `Road Construction` option to the existing construction-type dropdown selector alongside the existing `Room Construction` option.
2. WHEN `Room Construction` is selected, THE UI SHALL display the existing Brick Wall Estimator form and hide the Road Construction form.
3. WHEN `Road Construction` is selected, THE UI SHALL display the Road Construction Estimator form and hide the Room Construction form.
4. WHEN the construction type is changed, THE UI SHALL clear any previously displayed results.
5. THE UI SHALL render the Road Construction form using the same card and component style as the existing Brick Wall Estimator.
6. THE UI SHALL be mobile responsive, with form inputs stacking to a single column on viewports narrower than 640px.

### Requirement 11: Round-Trip Calculation Consistency

**User Story:** As a developer, I want the API calculations to be deterministic and consistent, so that the same inputs always produce the same outputs.

#### Acceptance Criteria

1. FOR ALL valid input combinations, THE Road_Service SHALL produce identical output values when called multiple times with the same inputs (deterministic calculation).
2. THE API SHALL accept and return all numeric values as JSON numbers, not strings.
3. FOR ALL valid Bituminous Road inputs, THE Road_Service SHALL satisfy the identity: `Aggregate_DBM + Bitumen_DBM = Q_DBM` and `Aggregate_BC + Bitumen_BC = Q_BC`, where `Bitumen_DBM = Q_DBM × 0.05` and `Bitumen_BC = Q_BC × 0.05`.

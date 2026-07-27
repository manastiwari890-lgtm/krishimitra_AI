# KrishiMitra AI — System Architecture

## 1. Purpose

This document describes the technical architecture of KrishiMitra AI.

It must distinguish between:

- Current implemented architecture
- Planned architecture
- Experimental ideas

The repository source code remains the final source of truth for implementation details.

---

# 2. Core Architectural Principle

KrishiMitra is being designed around an interactive:

## 3D Digital Farm / Agricultural Digital Twin

Supporting systems such as:

- Disease Detection
- Soil Analysis
- Weather
- Crop Recommendation
- Irrigation Intelligence
- Farm Reports

should eventually provide intelligence to the Digital Farm.

Conceptually:

User / Farm Data
        ↓
KrishiMitra Intelligence
        ↓
Farm State
        ↓
Simulation Systems
        ↓
3D Digital Farm
        ↓
User Interaction

The 3D farm should not become a collection of disconnected visual effects.

Its appearance and behavior should increasingly be driven by meaningful farm state.

---

# 3. Architecture Status Labels

The following labels should be used in this document:

### IMPLEMENTED

Exists and is currently part of the project.

### PARTIALLY IMPLEMENTED

Some supporting functionality exists, but the complete architecture is not finished.

### PLANNED

Approved direction but not yet implemented.

### EXPERIMENTAL

An idea being considered but not yet accepted as project architecture.

---

# 4. Current High-Level Architecture

Status: PARTIALLY IMPLEMENTED

Current known architecture:

Frontend
│
├── Main Application UI
│
├── Navigation
│
├── Agriculture Features
│
└── 3D Digital Farm
    │
    ├── React Three Fiber
    ├── Three.js
    ├── Drei
    │
    ├── Terrain
    ├── Fields
    ├── Crops
    ├── Vegetation
    ├── Ground Details
    ├── Clouds
    ├── Rain
    └── Camera / Controls

Backend, AI, database, API, and other systems may also exist in the repository.

Their exact architecture must be verified from current source files before this document describes them as implemented.

---

# 5. 3D Rendering Architecture

Status: IMPLEMENTED / EVOLVING

The Digital Farm currently uses:

- React
- Three.js
- React Three Fiber
- @react-three/drei
- GLTF / GLB assets

The main 3D scene is organized into reusable React components.

Known components include:

- `Farm3DScene`
- `FarmTerrain`
- `FarmFields`
- `CropField`
- `CropPlant`
- `FarmVegetation`
- `FarmGroundDetails`
- `FarmClouds`

Shared environment configuration also exists.

---

# 6. Farm3DScene Responsibility

Status: IMPLEMENTED

`Farm3DScene` acts as a major scene-level component.

Its responsibilities include or may include:

- Creating the Three.js Canvas
- Camera configuration
- Lighting
- Sky
- Fog
- Rendering farm systems
- Rendering environmental systems
- Camera controls
- Graphics/performance configuration
- Simulation state coordination

IMPORTANT:

As the project grows, `Farm3DScene` should not become responsible for all agricultural logic.

Agricultural decisions should eventually exist outside low-level rendering components.

---

# 7. Rendering Layer

Status: IMPLEMENTED / EVOLVING

The rendering layer is responsible for converting farm state into visual output.

Examples:

Farm State:
`health = "healthy"`

Rendering:
Healthy crop appearance

Farm State:
`health = "diseased"`

Rendering:
Diseased crop appearance

Farm State:
`raining = true`

Rendering:
Dark rain clouds + localized rainfall

The rendering layer should display state.

It should not eventually be responsible for deciding complex agricultural recommendations.

---

# 8. Environment Configuration

Status: IMPLEMENTED

A shared configuration file exists:

`farmEnvironmentConfig.js`

Known responsibilities include:

- Cloud positions
- Cloud scale
- Cloud movement speed
- Rain-capable cloud configuration
- Rain coverage radius
- Cloud movement boundaries
- Rain behavior settings

This follows an important architectural rule:

> Shared information should have one source of truth whenever practical.

Avoid maintaining independent copies of the same cloud/environment configuration in multiple components.

---

# 9. Cloud and Rain Architecture

Status: IMPLEMENTED / STABLE

Cloud and rain behavior are currently connected.

Architecture:

Cloud Configuration
        ↓
FarmCloud
        ↓
Rain-capable?
   ↓         ↓
  No        Yes
             ↓
      Rain enabled?
        ↓       ↓
       No      Yes
                ↓
        Localized Rain

Rain is rendered underneath selected rain-capable clouds.

Rain movement follows the parent cloud.

Individual raindrops are recycled independently.

The complete rain layer must NOT be teleported/reset as one object because that previously caused visible discontinuity and jerking.

Current rain architecture prioritizes:

- Smoothness
- Localization
- Low object count
- GPU-friendly rendering
- Mobile/laptop compatibility

---

# 10. Crop Rendering Architecture

Status: IMPLEMENTED / EVOLVING

Current crop rendering supports a real GLTF/GLB maize model.

Conceptual structure:

CropField
    ↓
Plant placement generation
    ↓
CropPlant
    ↓
GLB crop model

Current optimizations include:

- GLTF caching
- Shared geometry where possible
- Shared/optimized materials
- Reduced crop density
- Deterministic variation
- Controlled shadow cost

Future architecture may require stronger instancing and LOD systems as farm size increases.

---

# 11. Adaptive Graphics Architecture

Status: PARTIALLY IMPLEMENTED / HIGH PRIORITY

KrishiMitra must support a range of devices.

Target:

High-end device
→ better visual quality

Average laptop
→ balanced quality

Mobile / weaker hardware
→ optimized quality

Possible adaptive parameters include:

- Device pixel ratio
- Crop density
- Cloud count
- Rain particle/drop count
- Shadow quality
- Model complexity
- Environmental detail
- LOD distance
- Animation complexity

Functionality should remain available even when visual quality is reduced.

---

# 12. Planned Farm State Layer

Status: PLANNED

A centralized Farm State system is one of the most important future architectural changes.

The exact implementation has NOT yet been finalized.

Conceptually:

External Data
      ↓
Farm State Layer
      ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Rendering    Simulation      UI / Reports

Possible farm state domains:

- Farm metadata
- Plot state
- Crop state
- Soil state
- Weather state
- Disease state
- Irrigation state
- Simulation state

IMPORTANT:

Do not create one giant uncontrolled global object.

The state architecture should be designed before implementation.

---

# 13. Planned Plot State

Status: PLANNED

Each plot should eventually have its own data representation.

Conceptual example only:

Plot
│
├── Identity
├── Dimensions
├── Crop
├── Growth
├── Health
├── Soil
├── Moisture
├── Disease
├── Irrigation
└── Alerts

The 3D plot should render from this state.

This will replace increasing amounts of manually hardcoded plot behavior.

---

# 14. Planned Intelligence Layer

Status: PLANNED / PARTIALLY AVAILABLE THROUGH FEATURES

The intelligence layer should interpret agricultural data.

Potential systems:

## Disease Intelligence

Input:
Crop image / observations

Output:
- Disease result
- Confidence
- Severity
- Recommendations


## Soil Intelligence

Input:
- N
- P
- K
- pH
- Moisture
- Other available measurements

Output:
- Soil condition
- Crop suitability
- Nutrient recommendations
- Irrigation-related information


## Weather Intelligence

Input:
Weather API / forecast

Output:
- Current conditions
- Rain expectation
- Temperature
- Other relevant weather information


## Irrigation Intelligence

Input:
- Soil moisture
- Crop requirement
- Weather
- Rain forecast

Output:
- Irrigation requirement
- Recommended action

These systems should eventually update or influence Farm State rather than directly manipulating Three.js objects.

---

# 15. Planned Simulation Layer

Status: PLANNED / RAIN PARTIALLY IMPLEMENTED

The simulation layer represents changes over time.

Potential simulation systems:

- Rain
- Irrigation
- Soil moisture
- Crop growth
- Disease progression
- Crop treatment
- Fertilizer effects
- Weather effects

Desired separation:

Agricultural Logic
        ↓
Simulation State
        ↓
Rendering

Example:

Irrigation Engine:
Plot C requires irrigation
        ↓
Farm State:
plotC.irrigation.active = true
        ↓
3D Renderer:
show sprinkler/water animation

The visual component should not independently decide that Plot C requires irrigation.

---

# 16. Planned Digital Twin Architecture

Status: PLANNED

Long-term target:

Real / User Farm
        ↓
Farm Configuration
        ↓
KrishiMitra Farm Model
        ↓
Digital Twin State
        ↓
3D Farm Representation

Potential user inputs:

- Farm size
- Plot dimensions
- Crop
- Soil data
- Moisture
- Disease tests
- Irrigation configuration

Potential external inputs:

- Weather API
- Agricultural datasets
- AI model results

The Digital Twin should update as its underlying data changes.

---

# 17. Planned Interaction Layer

Status: PLANNED

The Digital Farm should eventually support two interaction modes.

## Overview Mode

Current OrbitControls architecture forms the beginning of this mode.

Purpose:

- Whole-farm inspection
- Plot selection
- Alerts
- Simulation controls
- High-level analysis


## Explore Mode

Future first-person experience.

Possible desktop interaction:

- WASD movement
- Mouse look
- Click / E interaction

Possible mobile interaction:

- Virtual joystick
- Touch camera
- Tap interaction

Explore Mode should interact with the same Farm State used by Overview Mode.

There should not be two separate farm implementations.

---

# 18. Future Interaction Architecture

Status: PLANNED

Concept:

User approaches crop
        ↓
Interaction Detector
        ↓
Identify plant / plot
        ↓
Read Farm State
        ↓
Show contextual information

Example:

User walks toward diseased maize
        ↓
Interact
        ↓
Plot C
Disease detected
Severity: Moderate
        ↓
Show diagnosis and recommended action

This creates meaningful exploration rather than decorative first-person movement.

---

# 19. Backend Architecture

Status: MUST BE VERIFIED

Do not assume backend architecture from this document.

Before documenting backend implementation, inspect the current repository.

Future backend responsibilities may include:

- Authentication
- User farms
- Plot data
- Soil records
- Disease results
- Weather integration
- Simulation persistence
- AI service communication
- Reports
- Database access

Exact technology choices and current implementation must be documented after repository review.

---

# 20. AI / ML Architecture

Status: MUST BE VERIFIED

Known project direction includes AI/ML features such as disease detection and agricultural recommendations.

Exact current models, endpoints, model formats, training pipelines, and deployment architecture must be verified from the repository.

Future architecture should avoid tightly coupling ML models to the 3D renderer.

Preferred conceptual separation:

AI Model
   ↓
Structured Result
   ↓
Application / Farm State
   ↓
3D Visualization

---

# 21. Database Architecture

Status: NOT FINALIZED / MUST BE VERIFIED

The database architecture must support future Digital Twin requirements.

Potential entities may eventually include:

- User
- Farm
- Plot
- Crop
- SoilReading
- DiseaseObservation
- WeatherSnapshot
- IrrigationEvent
- SimulationEvent

This is conceptual only.

Do not create database schemas solely from this list without architectural review.

---

# 22. API Architecture

Status: EVOLVING / MUST BE VERIFIED

Future API boundaries should preferably return structured agricultural data rather than UI-specific visual instructions.

Prefer:

```json
{
  "plotId": "plot-c",
  "moisture": 28,
  "irrigationRequired": true
}
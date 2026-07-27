# KrishiMitra AI — Development Status

## Last Updated

July 2026

---

# 1. Current Development Stage

KrishiMitra AI is currently under active development.

The major product direction has been finalized:

> The interactive 3D Digital Farm / Digital Twin is the core experience of KrishiMitra.

Traditional agriculture features such as disease detection, soil analysis, weather, crop recommendation, and irrigation intelligence will eventually feed data into the Digital Farm rather than existing only as disconnected dashboard features.

---

# 2. Current Main Priority

Current priority:

## 3D Digital Farm Foundation

The goal is to transform the existing 3D farm from a visualization into a data-driven agricultural simulation environment.

Development priority:

Digital Farm State
→ Simulation
→ Interaction
→ First-Person Exploration
→ Advanced Immersion
→ VR

---

# 3. Frontend 3D Stack

Current technologies:

- React
- Three.js
- React Three Fiber
- @react-three/drei
- GLTF / GLB models

---

# 4. Current 3D Farm Components

Known 3D farm components include:

- `Farm3DScene`
- `FarmTerrain`
- `FarmFields`
- `CropField`
- `CropPlant`
- `FarmVegetation`
- `FarmGroundDetails`
- `FarmClouds`
- shared farm environment configuration

Additional components/configuration may exist in the repository.

Always inspect the current repository before modifying architecture.

---

# 5. Farm Scene

Status: WORKING

Implemented:

- Main Three.js Canvas
- Farm world
- Camera
- OrbitControls
- Lighting
- Natural sky
- Fog
- Terrain
- Farm plots
- Vegetation
- Ground details
- Crop fields

The current camera supports overview/orbit exploration.

Future:

- Overview Mode
- Explore Mode
- First-person controls
- Mobile movement controls

---

# 6. Performance System

Status: WORKING / HIGH PRIORITY

The farm previously experienced performance problems.

Optimization work has already been performed.

Current principles include:

- Adaptive graphics quality
- Controlled DPR
- Reduced shadow cost
- Shared materials/geometries where possible
- Reduced crop density
- GLTF caching
- GPU instancing where appropriate
- Render-on-demand when possible
- Continuous rendering only for active animation

IMPORTANT:

Do not casually increase:

- Crop density
- Particle counts
- Shadow resolution
- Geometry complexity
- DPR
- Number of animated objects

Performance must be tested after major visual changes.

---

# 7. Crop System

Status: WORKING

Current crop:

Maize / Corn

Real crop model:

`maize_corn_plant.glb`

Known functionality:

- Real GLB crop rendering
- Growth variation
- Rotation variation
- Multiple crop plots
- Crop health states

Health states currently include:

- healthy
- warning
- diseased

Crop rendering has already undergone performance optimization.

Future:

- Multiple crop species
- Data-driven crop selection
- Crop lifecycle
- Growth stages
- Disease-specific appearance
- Treatment response

---

# 8. Farm Plot System

Status: WORKING

Current scene contains multiple farm plots.

Known current arrangement:

- Plot A
- Plot B
- Plot C
- Plot D

Different plots can already receive different crop health/growth values.

Future:

Plot data should come from a centralized Farm State Engine instead of being manually hardcoded into the scene.

---

# 9. Cloud System

Status: WORKING

Clouds are lightweight procedural 3D clouds.

Current functionality:

- Multiple clouds
- Horizontal movement
- Adaptive cloud count
- Low-poly geometry
- No expensive cloud shadows
- Rain-capable cloud configuration

Shared configuration file:

`farmEnvironmentConfig.js`

This file contains shared environmental configuration such as:

- Cloud positions
- Cloud scale
- Cloud speed
- Rain-cloud capability
- Rain radius
- Cloud movement boundaries
- Rain settings

IMPORTANT:

Environmental data should not be duplicated unnecessarily between components.

---

# 10. Rain System

Status: STABLE / WORKING

This system went through several iterations because of visual and performance problems.

Final design:

## Localized Cloud-Linked Rain

Rain does NOT originate globally from the sky.

Only configured rain clouds generate rainfall.

When rain simulation is active:

- Selected clouds become darker.
- Rain originates underneath those clouds.
- Rain follows cloud movement.
- Rain remains localized around the cloud.
- Individual raindrops fall independently.
- Individual drops recycle after reaching the bottom.
- The entire rain layer is never reset together.

This solved previous problems including:

- Invisible rain
- Rain originating from empty sky
- Rain disappearing periodically
- Rain appearing in pulses
- Whole rain layer teleportation
- Jerky rain animation

Implementation uses:

- `InstancedMesh`
- Dynamic instance matrices
- Adaptive drop counts
- Individual drop Y movement
- Delta protection
- Lightweight rain geometry

IMPORTANT:

Do NOT return to whole-layer rain movement unless there is a strong architectural reason.

The individual-drop recycling approach is the current stable implementation.

---

# 11. Rain Simulation Control

Status: WORKING

The user can manually trigger rain simulation.

Rain should NOT automatically occur everywhere simply because the 3D farm exists.

Long-term behavior:

Farm data + soil moisture + weather forecast
→ KrishiMitra decision
→ determine whether rain/irrigation simulation is relevant

Manual simulation controls should remain useful for demonstrations and testing.

---

# 12. Git Checkpoint

A stable checkpoint was committed and pushed after the continuous cloud-linked rain system became functional.

Known commit intention/message:

`Add optimized cloud-linked continuous rain system`

Before major future changes:

1. Check Git status.
2. Protect stable functionality.
3. Commit meaningful stable milestones.
4. Push changes.

---

# 13. Next Planned Development

Next previously planned feature:

## Smart Irrigation

Possible development stages:

### Phase 1

Lightweight irrigation infrastructure.

Examples:

- Pipes
- Sprinklers
- Plot irrigation points

### Phase 2

Irrigation simulation.

Requirements:

- Irrigate only relevant plots.
- Avoid unnecessary full-farm particle simulation.
- Maintain mobile/laptop performance.

### Phase 3

Data-driven irrigation.

Potential inputs:

- Soil moisture
- Crop type
- Crop water requirement
- Weather
- Rain forecast

Decision concept:

Low soil moisture
+
Crop requires water
+
No sufficient rain expected
→
Recommend irrigation

---

# 14. IMPORTANT ARCHITECTURAL CHANGE BEFORE LARGE EXPANSION

Before adding many independent simulations, the farm should move toward a:

## Farm State Engine

Instead of hardcoding information directly into 3D components, the farm should eventually receive centralized state.

Conceptual example:

```js
farmState = {
  weather: {
    condition: "cloudy",
    raining: false,
  },

  plots: {
    plotA: {
      crop: "maize",
      health: "healthy",
      moisture: 62,
      disease: null,
    },

    plotB: {
      crop: "maize",
      health: "warning",
      moisture: 31,
      disease: null,
    },

    plotC: {
      crop: "maize",
      health: "diseased",
      moisture: 45,
      disease: "example-disease",
    },
  },
};
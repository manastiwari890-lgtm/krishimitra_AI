# KrishiMitra AI — Project Master Document

## 1. Project Vision

KrishiMitra AI is an intelligent agriculture platform centered around an interactive 3D Digital Farm.

The project must NOT become only another agriculture dashboard containing common features such as weather, crop recommendation, disease detection, and soil analysis.

These systems are supporting intelligence for the main experience:

> An interactive, data-driven 3D Digital Farm / Digital Twin where farmers can visualize, explore, simulate, and understand their farm.

The long-term goal is to allow a user to experience a virtual representation of their own farm and use real agricultural data to understand problems and simulate possible actions before applying them to the real farm.


---

## 2. Core Product Principle

The 3D Digital Farm is the primary differentiator of KrishiMitra.

Other systems feed information into the Digital Farm:

- Disease Detection
- Soil Analysis
- Weather
- Crop Recommendation
- Irrigation Intelligence
- Crop Health
- Farm Reports
- Future AI systems

The desired architecture is:

Real Farm Data
↓
KrishiMitra Intelligence
↓
Farm State Engine
↓
3D Digital Farm
↓
Simulation + Interaction
↓
Farmer Decision


---

## 3. User Experience Principle

User experience is a first-class requirement.

The project should NOT sacrifice usability or performance simply to achieve better graphics.

Every major 3D feature should be evaluated using three questions:

1. Does this make the Digital Farm more useful?
2. Does this improve immersion or interaction?
3. Can this remain smooth on ordinary phones and laptops?

If a feature significantly damages performance, it should be optimized, simplified, made adaptive, or postponed.


---

## 4. Digital Farm Experience

The Digital Farm should eventually support two primary modes.

### Overview Mode

The user views the entire farm from above or from an orbit camera.

Purpose:

- Understand complete farm condition
- Inspect plots
- View crop health
- View soil status
- Observe weather
- View alerts
- Trigger simulations


### Explore Mode

The user enters the farm at approximately human eye level.

Future controls may include:

Desktop:

- WASD — movement
- Mouse — camera/look
- E / Click — interaction

Mobile:

- Virtual joystick
- Touch camera
- Tap interactions

Future VR support may build on Explore Mode.


---

## 5. Digital Twin Direction

The long-term goal is for the 3D environment to represent the user's actual or configured farm.

Example farm state:

Plot A
- Crop: Maize
- Moisture: 62%
- Health: Healthy

Plot B
- Crop: Maize
- Moisture: 31%
- Health: Water Stress

Plot C
- Crop: Maize
- Disease: Detected
- Severity: Moderate

Plot D
- Crop: Empty
- Soil suitability: Wheat

The 3D farm should visually respond to this state.


---

## 6. AI → Digital Farm Integration

### Disease Detection

User uploads crop image
↓
AI detects disease
↓
Affected crop/plot identified
↓
Digital Farm displays affected plants
↓
User can inspect the problem
↓
KrishiMitra recommends an action


### Soil Intelligence

Soil data such as:

- Nitrogen
- Phosphorus
- Potassium
- pH
- Moisture

should influence plot state and recommendations.


### Weather

Weather information should influence the 3D environment.

Examples:

- Rain
- Clouds
- Temperature conditions
- Future environmental effects


### Irrigation

Soil moisture + crop requirement + weather forecast
↓
KrishiMitra determines water requirement
↓
Irrigation recommendation
↓
User can simulate irrigation in the Digital Farm.


---

## 7. Simulation Philosophy

KrishiMitra should not become a farming game.

Simulation must remain connected to agricultural information.

The goal is:

> Let the farmer understand possible farm conditions and agricultural actions through an interactive virtual environment.

Simulation systems may eventually include:

- Rain
- Irrigation
- Disease progression
- Crop treatment
- Crop growth
- Soil moisture
- Fertilization
- Crop lifecycle
- Weather effects


---

## 8. Current 3D Technology

Current frontend 3D stack includes:

- React
- Three.js
- React Three Fiber
- @react-three/drei
- GLB/GLTF models

Current optimization philosophy includes:

- Adaptive graphics quality
- Reduced device pixel ratio when necessary
- GPU instancing where appropriate
- Low-poly environmental elements
- Shared geometry/materials where possible
- Controlled particle counts
- Render-on-demand when animation is unnecessary
- Continuous rendering only when required
- Mobile/laptop performance consideration


---

## 9. Current 3D Farm Progress

Implemented:

- 3D farm scene
- Farm terrain
- Multiple farm plots
- Crop fields
- Real GLB maize crop model
- Crop health states
- Crop growth variation
- Vegetation
- Ground details
- Stones
- Soil clumps
- Wild grass
- Boundary elements
- Camera/orbit exploration
- Adaptive graphics system
- Moving cloud system
- Rain simulation control
- Rain-cloud state
- Localized rain linked to selected clouds
- Rain follows moving clouds
- Continuous individual raindrop recycling
- GPU-instanced rain
- Performance optimization for rain
- Git checkpoint for stable rain system


---

## 10. Current Rain Architecture

Rain is NOT global sky rain.

Selected clouds are marked as rain-capable clouds.

When rain simulation is enabled:

- Selected clouds become darker.
- Rain originates underneath those clouds.
- Rain follows the moving cloud.
- Individual drops fall independently.
- Individual drops recycle when reaching the ground.
- The entire rain layer is never teleported/reset together.

This design was selected specifically to prevent:

- Rain appearing from empty sky
- Rain disappearing periodically
- Whole-layer reset jerk
- Poor visual continuity


---

## 11. Next Planned Feature

Smart Irrigation.

Initial planned stages:

1. Lightweight irrigation infrastructure
2. Plot-specific irrigation
3. Irrigation simulation control
4. Soil moisture integration
5. Weather/rain integration
6. KrishiMitra irrigation recommendation engine

However, Digital Farm architecture and data-driven farm state should remain higher priority than decorative additions.


---

## 12. Long-Term Development Direction

Priority order:

Digital Twin
↓
Simulation
↓
Interaction
↓
Immersion
↓
Advanced visualization
↓
VR

Potential future systems:

- User-defined farms
- Real farm dimensions
- Dynamic plot generation
- Multiple crops
- Crop lifecycle
- Disease visualization
- Disease progression
- Treatment simulation
- Fertilizer simulation
- Irrigation simulation
- Soil visualization
- Dynamic weather
- First-person exploration
- Interactive plants
- Farm equipment
- Farmer/avatar presence
- Mobile Explore Mode
- VR exploration


---

## 13. Development Rules

### Rule 1 — Protect Stable Features

Do not rewrite a stable system without a clear reason.

Commit stable milestones before major architectural changes.


### Rule 2 — Performance Before Decoration

Do not add large amounts of geometry, particles, shadows, or high-resolution assets without considering mobile performance.


### Rule 3 — Data Before Animation

Animations should eventually represent meaningful farm states rather than existing only for visual effect.


### Rule 4 — One Source of Truth

Shared environmental/farm information should live in centralized configuration/state rather than being duplicated across components.


### Rule 5 — Adaptive Experience

High-performance devices may receive better graphical quality.

Lower-performance devices should receive simplified rendering while preserving functionality.


### Rule 6 — Preserve User Experience

Smooth interaction is more important than maximum graphical fidelity.


---

## 14. Project Memory System

The repository itself is the permanent source of truth for KrishiMitra development.

Important documentation:

- PROJECT_MASTER.md
- DEVELOPMENT_STATUS.md
- ARCHITECTURE.md
- DECISIONS.md
- docs/3D_FARM.md

At the end of meaningful development sessions:

1. Update DEVELOPMENT_STATUS.md.
2. Update architecture documentation if architecture changed.
3. Record important decisions in DECISIONS.md.
4. Commit changes.
5. Push to Git.

This allows development to resume accurately even after long breaks or new ChatGPT conversations.


---

## 15. Core Identity

KrishiMitra should ultimately be understood as:

> An intelligent agricultural Digital Twin platform where farmers can explore, understand, and simulate conditions on a data-driven 3D representation of their farm.

The 3D farm is not an additional feature.

It is the center of the KrishiMitra experience.
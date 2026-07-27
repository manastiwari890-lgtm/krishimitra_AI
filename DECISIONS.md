# KrishiMitra AI — Architecture & Product Decisions

## Purpose

This document records important product, architecture, UX, performance, and development decisions made during KrishiMitra development.

The purpose is to preserve WHY a decision was made.

When a major decision changes:

1. Do not silently delete the old decision.
2. Mark it as superseded.
3. Add the new decision.
4. Explain why it changed.

---

# DECISION 001 — 3D Digital Farm Is the Core Product

Status: ACTIVE

## Decision

The interactive 3D Digital Farm / Digital Twin will be the primary differentiator and central experience of KrishiMitra.

KrishiMitra should NOT primarily become a dashboard containing disconnected agriculture features.

Features such as:

- Disease detection
- Soil analysis
- Weather
- Crop recommendation
- Irrigation intelligence
- Reports

should eventually provide intelligence to the Digital Farm.

## Reason

Many agricultural applications can provide recommendations, weather information, disease detection, or crop suggestions.

A data-driven interactive farm provides KrishiMitra with a stronger product identity.

The desired experience is:

Real Farm Data
↓
KrishiMitra Intelligence
↓
Digital Farm
↓
Simulation
↓
Interaction
↓
Farmer Decision

---

# DECISION 002 — User Experience Has Priority Over Maximum Graphics

Status: ACTIVE

## Decision

Smooth user experience is more important than maximum graphical fidelity.

The 3D Digital Farm must target ordinary smartphones and laptops, not only high-end gaming hardware.

## Reason

A visually impressive farm that performs poorly is not a good product experience.

When necessary:

- Reduce graphical complexity
- Reduce particles
- Reduce crop density
- Reduce shadow quality
- Reduce DPR
- Use LOD
- Use instancing
- Simplify distant objects
- Use adaptive graphics

while preserving core functionality.

---

# DECISION 003 — Adaptive Graphics

Status: ACTIVE

## Decision

The Digital Farm should adapt graphical complexity according to device capability where practical.

## Goal

Higher-capability devices:

- Better visual quality
- Higher environmental detail
- Potentially higher crop/detail density

Lower-capability devices:

- Reduced visual complexity
- Lower particle counts
- Reduced expensive effects

Core agricultural functionality should remain available on both.

---

# DECISION 004 — Digital Farm Must Become Data-Driven

Status: ACTIVE

## Decision

The long-term 3D farm should not depend primarily on manually hardcoded plot conditions.

A centralized farm-state architecture should eventually determine:

- Plot conditions
- Crop conditions
- Soil conditions
- Disease state
- Weather
- Irrigation
- Alerts
- Simulation state

## Reason

KrishiMitra is intended to evolve toward an agricultural Digital Twin.

A Digital Twin requires meaningful state to drive its visual representation.

---

# DECISION 005 — Data Before Decorative Animation

Status: ACTIVE

## Decision

New animations should increasingly represent meaningful agricultural state.

Examples:

Rain should represent a weather/simulation condition.

Irrigation should represent a plot's irrigation state.

Diseased crops should represent disease information.

Crop growth should represent growth state.

## Reason

The Digital Farm should be useful and educational rather than simply decorative.

---

# DECISION 006 — Overview Mode + Explore Mode

Status: PLANNED

## Decision

The same Digital Farm should eventually support two major interaction experiences.

### Overview Mode

Used for:

- Whole farm inspection
- Plot selection
- Alerts
- Reports
- Simulation controls
- Farm status

### Explore Mode

Used for:

- Human-level farm exploration
- Walking between plots
- Inspecting crops
- Interacting with farm objects
- Viewing contextual agricultural information

## Important

These should NOT become two independent farm implementations.

Both should use the same underlying Digital Twin / Farm State.

---

# DECISION 007 — First-Person Mode Must Be Meaningful

Status: ACTIVE

## Decision

Do not prioritize first-person movement merely so the user can walk around a decorative farm.

Before Explore Mode becomes a major feature, the farm should contain meaningful data and interactions.

## Desired Experience

Walk toward crop
↓
Interact
↓
Identify plot/crop
↓
Read farm state
↓
Show relevant information
↓
Allow meaningful action

---

# DECISION 008 — VR Is a Long-Term Extension

Status: PLANNED

## Decision

VR may eventually become part of KrishiMitra, but it should build on the same Digital Twin architecture.

Do not create a separate VR-specific farm implementation.

## Development Direction

Digital Twin
↓
Simulation
↓
Interaction
↓
Immersion
↓
VR

---

# DECISION 009 — Shared Environmental Configuration

Status: IMPLEMENTED

## Decision

Cloud/environment configuration should be shared rather than independently duplicated across visual systems.

Current shared configuration:

`farmEnvironmentConfig.js`

## Reason

Clouds and rain need consistent information such as:

- Position
- Scale
- Movement
- Rain capability
- Rain coverage

One source of truth reduces synchronization problems.

---

# DECISION 010 — Rain Must Be Localized to Clouds

Status: IMPLEMENTED / STABLE

## Previous Problem

Early rain implementations allowed rain to appear across broad areas of the sky.

This made rainfall visually disconnected from clouds.

## Decision

Rain should originate underneath selected rain-capable clouds.

Rain should move with those clouds.

## Result

The user should visually understand:

Cloud
↓
Rain
↓
Farm

rather than rain appearing from arbitrary empty sky.

---

# DECISION 011 — Individual Raindrop Recycling

Status: IMPLEMENTED / STABLE

## Previous Approach

Rain columns/layers were moved downward as complete units.

When a layer reached the bottom, the entire layer was reset.

## Problems

This caused:

- Visible gaps
- Rain appearing/disappearing
- Pulsing
- Jerky resets
- Unnatural rainfall

## Decision

Use individually animated/recycled drops inside an InstancedMesh.

When one drop reaches the bottom:

Only that drop resets underneath the cloud.

The entire rain system is never reset together.

## Reason

This provides significantly smoother and more continuous rainfall while retaining GPU-friendly instancing.

## Important

Do not return to whole-layer reset behavior without a strong reason.

---

# DECISION 012 — Rain Uses Instanced Rendering

Status: IMPLEMENTED

## Decision

Localized rain should use GPU-friendly instancing rather than creating a large number of independent React/Three.js mesh objects.

## Reason

Rain may contain many moving visual elements.

Instancing reduces object and draw-call overhead and is more appropriate for mobile/laptop performance.

---

# DECISION 013 — Rain Is Not Automatically Always Active

Status: ACTIVE

## Decision

Rain should not automatically start simply because the user enters the 3D farm.

Manual simulation control is currently useful.

Long term, weather and farm intelligence may determine when rainfall is relevant.

## Reason

The Digital Farm should represent meaningful conditions rather than continuously displaying effects.

---

# DECISION 014 — Smart Irrigation Should Be Plot-Specific

Status: PLANNED

## Decision

Future irrigation should not unnecessarily irrigate the entire virtual farm.

Irrigation should eventually respond to individual plot requirements.

Possible inputs:

- Soil moisture
- Crop type
- Crop water requirement
- Weather
- Rain forecast

## Concept

Plot requires water
+
Insufficient rain expected
↓
Irrigation recommendation
↓
Relevant plot irrigation simulation

---

# DECISION 015 — Agricultural Logic Should Not Live Inside Rendering Components

Status: ACTIVE

## Decision

Three.js components should primarily:

- Render
- Animate
- Respond to state
- Handle visual interaction

They should not become the main location for complex agricultural decision-making.

## Preferred Direction

Agricultural Data
↓
Intelligence / Decision Logic
↓
Farm State
↓
3D Renderer

## Reason

This keeps the project modular and makes future backend, AI, mobile, and VR integration easier.

---

# DECISION 016 — AI Output Should Become Structured Farm Data

Status: PLANNED

## Decision

AI systems should eventually return structured results that can update farm state.

Example:

Disease AI
↓
Disease result
↓
Affected plot/crop state
↓
3D visualization

Rather than:

Disease AI
↓
Directly manipulate Three.js material

## Reason

AI and rendering should remain loosely coupled.

---

# DECISION 017 — Disease Detection Should Affect the Digital Farm

Status: PLANNED

## Desired Flow

User submits crop image
↓
Disease detection
↓
Disease identified
↓
Relevant crop/plot state updated
↓
Affected plants visually change
↓
User can inspect them in Digital Farm
↓
KrishiMitra explains recommended action

## Reason

This transforms disease detection from a disconnected AI tool into part of the central KrishiMitra experience.

---

# DECISION 018 — Soil Reports Should Affect the Digital Farm

Status: PLANNED

## Decision

Soil readings should eventually influence farm state and recommendations.

Possible inputs:

- Nitrogen
- Phosphorus
- Potassium
- pH
- Moisture

Possible outcomes:

- Crop suitability
- Nutrient recommendations
- Irrigation recommendations
- Plot warnings
- Visual/contextual farm information

---

# DECISION 019 — Real User Farm → Digital Twin

Status: LONG-TERM ACTIVE DIRECTION

## Decision

KrishiMitra should eventually allow the user to create a virtual representation of their own farm.

Potential configuration:

- Farm dimensions
- Plot layout
- Crop type
- Soil information
- Moisture
- Crop health
- Disease results
- Irrigation information

## Goal

The user should eventually experience THEIR farm rather than only a generic demonstration farm.

---

# DECISION 020 — Avoid Premature Farm State Implementation

Status: ACTIVE

## Decision

A Farm State Engine is considered necessary, but its exact architecture should not be implemented blindly from documentation examples.

Before implementation:

1. Inspect current repository structure.
2. Identify existing application state.
3. Identify backend/API architecture.
4. Determine state ownership.
5. Design scalable plot/crop/environment state.
6. Then implement.

## Reason

Prematurely choosing a global state structure could create technical debt as KrishiMitra expands.

---

# DECISION 021 — Repository Is the Development Source of Truth

Status: ACTIVE

## Decision

Do not rely on ChatGPT conversation history as the permanent memory of the project.

The repository must preserve:

- Current code
- Architecture
- Development status
- Product decisions
- 3D farm documentation

Important documents:

- `PROJECT_MASTER.md`
- `DEVELOPMENT_STATUS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `docs/3D_FARM.md`

## Reason

KrishiMitra is intended to become a large project.

Development must be resumable after:

- Long breaks
- New conversations
- Context loss
- Different development sessions

---

# DECISION 022 — Stable Milestones Must Be Committed

Status: ACTIVE

## Decision

When an important system reaches a stable state:

1. Test it.
2. Update documentation.
3. Commit it.
4. Push it.

Before risky architectural changes, preserve a stable Git checkpoint.

## Reason

This makes experimentation safer and prevents loss of working implementations.

---

# DECISION 023 — Do Not Rewrite Stable Systems Without Reason

Status: ACTIVE

## Decision

If a system is working smoothly and meets requirements, avoid repeatedly rewriting it simply to make it different.

Changes should have a clear benefit such as:

- Better UX
- Better performance
- Fixing a bug
- Better scalability
- Required new functionality

## Current Example

The continuous cloud-linked rain system is currently considered stable.

Do not modify its core architecture while developing unrelated features unless necessary.

---

# DECISION 024 — KrishiMitra Is Not Merely a Hackathon Prototype

Status: ACTIVE

## Decision

Architecture decisions should consider long-term development rather than optimizing only for a short demonstration.

## Priorities

- Maintainability
- Modularity
- Performance
- Scalability
- Clear data flow
- Reusable systems
- Documentation

Temporary shortcuts may still be used when appropriate, but they should be recognized as temporary.

---

# DECISION 025 — Product Name Is Not the Current Priority

Status: ACTIVE

## Context

The name "KrishiMitra" is relatively common.

## Decision

Continue using KrishiMitra as the working product name for now.

Do not allow branding discussions to distract from building the product's unique identity.

## Reason

The Digital Farm/Digital Twin experience is currently more important than final branding.

Brand identity can be revisited as the product matures.

---

# Current Highest-Level Product Statement

KrishiMitra is being developed toward:

> An intelligent agricultural Digital Twin platform where farmers can explore, understand, and simulate conditions on a data-driven 3D representation of their farm.

The Digital Farm is not an extra feature attached to KrishiMitra.

It is intended to become the center of the product experience.

---

# Decision Maintenance

When adding a new major decision:

Use:

## DECISION XXX — Title

Status: ACTIVE / PLANNED / IMPLEMENTED / SUPERSEDED

### Context

Why was this question raised?

### Decision

What did we decide?

### Reason

Why?

### Consequences

What does this affect?

If an existing decision changes, preserve the historical decision and mark it:

`Status: SUPERSEDED`

Then reference the replacement decision.
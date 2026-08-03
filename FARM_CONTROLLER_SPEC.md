# KrishiMitra AI — Farm Controller Specification

Version: 1.0

Status: DESIGN

---

# Purpose

The Farm Controller is the coordinator of the Digital Twin.

It does not render the farm.

It does not call APIs.

It does not perform AI calculations.

Its responsibility is to receive results from engines and update the Farm State.

---

# Architecture

Backend
        ↓
Services
        ↓
AI / Simulation Engines
        ↓
Farm Controller
        ↓
Farm State
        ↓
React Components
        ↓
3D Digital Twin

---

# Responsibilities

The Farm Controller should:

- Update weather
- Update plots
- Update crop health
- Update irrigation
- Update soil conditions
- Coordinate simulation events

The Farm Controller should NOT:

- Render UI
- Call backend APIs
- Contain Three.js code
- Store historical data

---

# Update Flow

Example 1

Weather API
        ↓
Weather Engine
        ↓
Farm Controller
        ↓
Farm State
        ↓
Clouds
Rain
Sky

---

Example 2

Disease Detection
        ↓
Disease Engine
        ↓
Farm Controller
        ↓
Farm State
        ↓
Crop Visualization

---

Example 3

Soil Report
        ↓
Parser
        ↓
Farm Controller
        ↓
Farm State
        ↓
Recommendation Engine
        ↓
Visualization

---

# Initial Responsibilities

Version 1 of the Farm Controller should support only:

- Weather updates
- Plot updates

Nothing more.

Keep it intentionally small.

---

# Future Responsibilities

Later versions may support:

- Crop growth simulation
- Disease spread
- Smart irrigation
- Pest simulation
- Fertilizer schedule
- Time simulation
- Seasonal changes

---

# Design Rules

1. Farm State is the single source of truth.

2. The Farm Controller is the only module allowed to modify Farm State.

3. React components only read Farm State.

4. Engines never directly update UI.

5. APIs never directly update UI.

6. Every state change passes through the Farm Controller.

---

# Example Flow

User presses "Simulate Rain"

↓

Weather Engine

↓

Farm Controller

↓

Farm State.weather.isRaining = true

↓

Clouds become dark

↓

Rain starts

↓

Soil moisture begins increasing

↓

Irrigation recommendation changes

---

# Long-Term Vision

The Farm Controller should eventually coordinate the entire Digital Twin.

Instead of independent systems,

Weather

Disease

Soil

Irrigation

Growth

should all communicate through one controller.

This ensures predictable updates, easier debugging, and a scalable architecture.

---

# Guiding Principle

Think of the Farm Controller as the "brain" of the Digital Twin.

Think of the Farm State as its "memory".

Think of the 3D Farm as its "body".

The brain decides.

The memory stores.

The body displays.
# KrishiMitra Farm State Specification

Version: 1.0

Status: DESIGN

---

# Purpose

The Farm State is the single source of truth for the Digital Twin.

It stores the current condition of the virtual farm.

Every visual system should render from the Farm State instead of maintaining independent agricultural state.

The Farm State does NOT replace:

- Backend
- AI Engines
- Weather Engine

Instead, it connects them.

---

# Architecture

Backend
        ↓
Services
        ↓
AI / Engines
        ↓
Farm State
        ↓
3D Renderer
        ↓
User

---

# Responsibilities

Farm State owns the CURRENT farm condition.

It should answer questions such as:

- Is it raining?
- Which plots exist?
- Which crop grows in Plot A?
- Is irrigation active?
- Which crops are diseased?
- What is the moisture level?
- What is the current growth stage?

It should NOT decide these values.

Decision logic belongs to Engines.

---

# Data Ownership

## Backend

Owns:

- User account
- Farm database
- Historical records
- Uploaded reports
- Sensor data

---

## Services

Responsible for:

- Calling APIs
- Sending requests
- Receiving responses

Example:

WeatherService

↓

Current weather JSON

---

## Engines

Responsible for interpreting information.

Example:

Weather API

↓

Weather Engine

↓

Should rain?

↓

Farm State

---

## Farm State

Stores the current farm.

It should NOT fetch APIs.

It should NOT perform heavy calculations.

It stores results.

---

## Renderer

Reads Farm State.

Never invents farm conditions.

---

# Initial Farm State

Version 1

```javascript
farmState = {
  weather: {},
  environment: {},
  plots: []
}
```

Very small.

No unnecessary complexity.

---

# Weather

Owns:

- isRaining
- cloudCoverage
- temperature
- humidity
- windSpeed

Future:

- forecast
- sunrise
- sunset

---

# Environment

Owns:

- sky
- lighting
- fog
- season

---

# Plot

Each plot contains:

- id
- crop
- soil
- irrigation
- disease
- health
- moisture

Example

```javascript
{
 id: "A",

 crop: {
   type: "maize",
   stage: "vegetative"
 },

 soil: {
   moisture: 42,
   nitrogen: "medium"
 },

 disease: null,

 irrigation: {
   active: false
 },

 health: "healthy"
}
```

---

# Rule

The Farm State contains CURRENT state.

Not history.

Historical information belongs in the backend.

---

# Update Flow

Weather API

↓

Weather Engine

↓

Farm State.weather

↓

Clouds

Rain

Sky

---

Disease Detection

↓

Disease Engine

↓

Farm State.plot.disease

↓

Crop Rendering

↓

User sees affected crop

---

Soil Report

↓

Parser

↓

Farm State.plot.soil

↓

Recommendation Engine

↓

Visualization

---

# Rendering Rule

Components should render only.

Good

FarmRain

↓

Read

farmState.weather.isRaining

Bad

FarmRain

↓

Generate weather

---

# Future Expansion

Farm State will later support:

- Yield prediction
- Fertilizer schedule
- Pest simulation
- Sensors
- Drone mapping
- Explore Mode
- VR

without changing the rendering architecture.

---

# Design Principles

1. Single source of truth.
2. Renderer never owns agricultural data.
3. Engines perform calculations.
4. Services fetch information.
5. Backend stores history.
6. Farm State stores the current world.
7. Digital Twin reflects Farm State.
// =====================================================
// KRISHIMITRA AI
// FARM STATE MANAGER
// =====================================================
//
// This file manages the Farm State.
//
// Responsibilities:
//
// ✔ Return current state
// ✔ Update weather
// ✔ Update plots
// ✔ Notify listeners (later)
//
// It DOES NOT:
//
// ✖ Fetch APIs
// ✖ Perform AI calculations
// ✖ Render UI
//
// =====================================================

import { initialFarmState } from "./farmState";

// =====================================================
// CREATE FARM STATE
// =====================================================

export function createFarmState() {
  // Clone the initial state so we don't mutate the original
  let state = structuredClone(initialFarmState);

  // ===================================================
  // GET CURRENT STATE
  // ===================================================

  function getState() {
    return state;
  }

  // ===================================================
  // UPDATE WEATHER
  // ===================================================

  function updateWeather(weatherUpdate) {
    state.weather = {
      ...state.weather,
      ...weatherUpdate,
    };
  }

  // ===================================================
  // UPDATE PLOT
  // ===================================================

  function updatePlot(plotId, updates) {
    state.plots = state.plots.map((plot) =>
      plot.id === plotId
        ? {
            ...plot,
            ...updates,
          }
        : plot,
    );
  }

  // ===================================================
  // PUBLIC API
  // ===================================================

  return {
    getState,
    updateWeather,
    updatePlot,
  };
}
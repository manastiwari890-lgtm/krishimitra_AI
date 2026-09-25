// =====================================================
// KRISHIMITRA AI
// FARM STATE
// =====================================================
//
// Single Source of Truth
//
// This file represents the CURRENT state of the
// Digital Twin.
//
// It DOES NOT:
//
// - Call APIs
// - Perform calculations
// - Render anything
//
// It ONLY stores the current condition of the farm.
//
// =====================================================

// =====================================================
// INITIAL FARM STATE
// =====================================================

export const initialFarmState = {

  // ===================================================
  // WEATHER
  // ===================================================

  weather: {

    isRaining: true,

    cloudCoverage: 0.4,

    temperature: 28,

    humidity: 80,

    windSpeed: 6,
  },

  // ===================================================
  // ENVIRONMENT
  // ===================================================

  environment: {

    timeOfDay: "day",

    season: "summer",
  },

  // ===================================================
  // FARM PLOTS
  // ===================================================

  plots: [

    {
      id: "A",

      crop: "maize",

      health: "healthy",

      moisture: 58,
      growth: 0,
      diseaseRisk: "Low",
    },

    {
      id: "B",

      crop: "maize",

      health: "healthy",

      moisture: 80,
      growth: 0,
      diseaseRisk: "Low",
    },

    {
      id: "C",

      crop: "maize",

      health: "warning",

      moisture: 34,
      growth: 0,
      diseaseRisk: "Low",
    },

    {
      id: "D",

      crop: "maize",

      health: "healthy",

      moisture: 60,
      growth: 0,
      diseaseRisk: "Low",
    },
  ],
};
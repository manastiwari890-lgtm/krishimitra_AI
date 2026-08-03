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

    isRaining: false,

    cloudCoverage: 0.4,

    temperature: 28,

    humidity: 62,

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
    },

    {
      id: "B",

      crop: "maize",

      health: "healthy",

      moisture: 56,
    },

    {
      id: "C",

      crop: "maize",

      health: "warning",

      moisture: 34,
    },

    {
      id: "D",

      crop: "maize",

      health: "healthy",

      moisture: 60,
    },
  ],
};
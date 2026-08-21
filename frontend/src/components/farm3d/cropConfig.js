// =====================================================
// KRISHIMITRA AI
// CROP SPECIES CONFIGURATION
// =====================================================

export const CROP_CONFIG = {
  maize: {
    name: "Maize",

    // Actual GLB file
    model:
      "/assets/farm3d/models/crops/farm_plants_models_mobile_game_ready_lowpoly.glb",

    // Mesh inside the GLB
    modelName:
      "Corn_Plants_0",

    // Growth speed
    //
    // Lower = slower growth.
    //
    growthRate: 0.35,

    // Visual limits
    minHeight: 0.15,
    maxHeight: 0.85,

    // Width of the plant
    widthScale: 0.75,

    // Height at which crop becomes mature
    maturity: 100,
  },

  // ---------------------------------------------------
  // WHEAT
  // ---------------------------------------------------
  //
  // Model can be connected when we select the correct
  // mesh from your farm GLB.
  //
  wheat: {
    name: "Wheat",

    model:
      "/assets/farm3d/models/crops/farm_plants_models_mobile_game_ready_lowpoly.glb",

    modelName:
      "Wheat_Plants_0",

    growthRate: 0.45,

    minHeight: 0.15,
    maxHeight: 0.75,

    widthScale: 0.70,

    maturity: 100,
  },

  // ---------------------------------------------------
  // RICE
  // ---------------------------------------------------

  rice: {
    name: "Rice",

    model:
      "/assets/farm3d/models/crops/farm_plants_models_mobile_game_ready_lowpoly.glb",

    modelName:
      "Rice_Plants_0",

    growthRate: 0.40,

    minHeight: 0.15,
    maxHeight: 0.70,

    widthScale: 0.70,

    maturity: 100,
  },
};

// =====================================================
// SAFE CROP LOOKUP
// =====================================================

export function getCropConfig(crop) {
  return (
    CROP_CONFIG[crop] ??
    CROP_CONFIG.maize
  );
}
// =====================================================
// KRISHIMITRA AI
// CROP HEALTH & STRESS SIMULATION
// =====================================================
//
// Moisture → Crop Health
//
// 0–9     : severe drought
// 10–19   : drought stress
// 20–34   : moderate stress
// 35–40   : recovering
// 40–80   : healthy
// 81–90   : excess moisture
// 91–100  : waterlogging stress
//
// Health affects the visual appearance of the maize,
// while CropGrowthSimulation controls actual growth.
// =====================================================

export class CropHealthSimulation {

  static update(plot, deltaHours) {

    let health =
      plot.health ?? "healthy";

    const moisture =
      Number.isFinite(plot.moisture)
        ? Math.max(
            0,
            Math.min(
              100,
              plot.moisture,
            ),
          )
        : 50;

    // =================================================
    // SEVERE DROUGHT
    // =================================================

    if (moisture < 10) {

      health = "stressed";

    }

    // =================================================
    // DROUGHT STRESS
    // =================================================

    else if (moisture < 20) {

      health = "stressed";

    }

    // =================================================
    // MODERATE WATER STRESS
    // =================================================

    else if (moisture < 35) {

      health = "warning";

    }

    // =================================================
    // HEALTHY RANGE
    // =================================================

    else if (
      moisture >= 35 &&
      moisture <= 80
    ) {

      health = "healthy";

    }

    // =================================================
    // EXCESS WATER
    // =================================================

    else if (
      moisture > 80 &&
      moisture <= 90
    ) {

      health = "warning";

    }

    // =================================================
    // WATERLOGGING
    // =================================================
    //
    // Very high moisture causes stress rather than
    // unlimited healthy growth.
    //

    else {

      health = "stressed";

    }

    return {
      ...plot,
      health,
    };
  }
}
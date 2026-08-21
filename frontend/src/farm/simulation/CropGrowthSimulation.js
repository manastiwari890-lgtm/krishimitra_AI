// =====================================================
// KRISHIMITRA AI
// MAIZE CROP GROWTH SIMULATION
// =====================================================
//
// RULES:
//
// 1. Maize grows slowly.
// 2. Growth eventually reaches 100%.
// 3. Growth never exceeds 100%.
// 4. Moisture affects growth speed.
// 5. Good moisture gives optimal growth.
// 6. Too much water causes water stress.
// 7. Low water causes drought stress.
// 8. Irrigation NEVER changes plant count.
// 9. Irrigation NEVER merges plants.
// =====================================================

export class CropGrowthSimulation {

  static update(plot, deltaHours) {

    // =================================================
    // CURRENT GROWTH
    // =================================================

    let growth =
      Number.isFinite(plot.growth)
        ? plot.growth
        : 0;

    // =================================================
    // MOISTURE
    // =================================================

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
    // LIMITS
    // =================================================

    const MAX_GROWTH = 100;

    const MIN_GROWTH = 0;

    // =================================================
    // BASE GROWTH SPEED
    // =================================================
    //
    // Growth is intentionally slow.
    //
    // At ideal moisture:
    //
    // approximately 100 simulation hours
    // for complete growth.
    //
    // =================================================

    const BASE_GROWTH_RATE = 1.0;

    let growthMultiplier = 0;

    // =================================================
    // MOISTURE RESPONSE
    // =================================================
    //
    //              Growth
    //
    // 0-19    → severe drought
    // 20-39   → water stress
    // 40-80   → ideal
    // 81-90   → slightly excessive
    // 91-100  → waterlogging stress
    //
    // =================================================

    if (
      moisture >= 40 &&
      moisture <= 80
    ) {

      // ===============================================
      // IDEAL MOISTURE
      // ===============================================

      growthMultiplier = 1.0;

    } else if (
      moisture >= 30 &&
      moisture < 40
    ) {

      // ===============================================
      // MODERATE WATER STRESS
      // ===============================================

      growthMultiplier = 0.55;

    } else if (
      moisture >= 20 &&
      moisture < 30
    ) {

      // ===============================================
      // HIGH WATER STRESS
      // ===============================================

      growthMultiplier = 0.25;

    } else if (
      moisture >= 10 &&
      moisture < 20
    ) {

      // ===============================================
      // SEVERE DROUGHT
      // ===============================================

      growthMultiplier = 0.08;

    } else if (
      moisture > 80 &&
      moisture <= 90
    ) {

      // ===============================================
      // EXCESS WATER
      // ===============================================
      //
      // Still grows, but not optimally.
      //
      // ===============================================

      growthMultiplier = 0.75;

    } else if (
      moisture > 90
    ) {

      // ===============================================
      // WATERLOGGING
      // ===============================================
      //
      // 100 moisture does NOT make the plant huge.
      //
      // It actually stresses the crop.
      //
      // ===============================================

      growthMultiplier = 0.35;

    } else {

      // ===============================================
      // ALMOST COMPLETELY DRY
      // ===============================================

      growthMultiplier = 0;
    }

    // =================================================
    // APPLY GROWTH
    // =================================================

    const safeDelta =
      Math.max(
        0,
        Number.isFinite(deltaHours)
          ? deltaHours
          : 0,
      );

    if (
      growth < MAX_GROWTH &&
      growthMultiplier > 0
    ) {

      const growthIncrease =
        BASE_GROWTH_RATE *
        growthMultiplier *
        safeDelta;

      growth += growthIncrease;
    }

    // =================================================
    // HARD LIMIT
    // =================================================
    //
    // NEVER allow:
    //
    // 100 → 101 → 102...
    //
    // =================================================

    growth =
      Math.max(
        MIN_GROWTH,
        Math.min(
          MAX_GROWTH,
          growth,
        ),
      );

    // =================================================
    // RETURN UPDATED PLOT
    // =================================================

    return {
      ...plot,
      growth,
    };
  }
}
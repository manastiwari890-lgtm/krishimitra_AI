// =====================================================
// KRISHIMITRA AI
// IRRIGATION INTELLIGENCE SIMULATION
// =====================================================

export class IrrigationSimulation {
  static update(plot, farmState, deltaHours) {
    const moisture = plot.moisture ?? 0;
    const health = plot.health ?? "healthy";
    const isRaining =
      farmState.weather?.isRaining ?? false;

    let irrigationRequired = false;
    let irrigationLevel = "None";
    let irrigationReason = "Soil moisture is adequate.";

    // ===================================================
    // RAIN PROTECTION
    // ===================================================

    if (isRaining) {
      irrigationRequired = false;
      irrigationLevel = "None";
      irrigationReason =
        "Rain is currently supplying water to the crop.";
    }

    // ===================================================
    // VERY LOW MOISTURE
    // ===================================================

    else if (moisture < 20) {
      irrigationRequired = true;
      irrigationLevel = "High";
      irrigationReason =
        "Critical soil moisture. Immediate irrigation is recommended.";
    }

    // ===================================================
    // LOW MOISTURE
    // ===================================================

    else if (moisture < 35) {
      irrigationRequired = true;
      irrigationLevel = "Medium";
      irrigationReason =
        "Soil moisture is low and the crop may experience water stress.";
    }

    // ===================================================
    // MODERATE MOISTURE + WARNING HEALTH
    // ===================================================

    else if (
      moisture < 45 &&
      health === "warning"
    ) {
      irrigationRequired = true;
      irrigationLevel = "Medium";
      irrigationReason =
        "Crop health is under warning and soil moisture is below the preferred range.";
    }

    // ===================================================
    // HEALTHY CONDITION
    // ===================================================

    else {
      irrigationRequired = false;
      irrigationLevel = "None";
      irrigationReason =
        "Current soil conditions do not require irrigation.";
    }

    return {
      ...plot,

      irrigationRequired,

      irrigationLevel,

      irrigationReason,
    };
  }
}
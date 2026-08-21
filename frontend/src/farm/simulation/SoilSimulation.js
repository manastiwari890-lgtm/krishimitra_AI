// =====================================================
// KRISHIMITRA AI
// SOIL SIMULATION ENGINE
// =====================================================

export class SoilSimulation {
  static update(plot, weather, deltaHours) {
    let moisture = plot.moisture;

    // Rain increases moisture
    if (weather.isRaining) {
      moisture += 12 * deltaHours;
    }

    // Natural evaporation
    else {
      moisture -= 2 * deltaHours;
    }

    // Clamp values

    moisture = Math.max(0, Math.min(100, moisture));

    return {
      ...plot,
      moisture,
    };
  }
}
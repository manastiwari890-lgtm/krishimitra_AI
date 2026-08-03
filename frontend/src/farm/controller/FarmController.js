// =====================================================
// KRISHIMITRA AI
// FARM CONTROLLER
// =====================================================

export class FarmController {
  constructor(farmContext) {
    this.farm = farmContext;
  }

  // ===================================================
  // WEATHER
  // ===================================================

  startRain() {
    this.farm.updateWeather({
      isRaining: true,
    });
  }

  stopRain() {
    this.farm.updateWeather({
      isRaining: false,
    });
  }

  // ===================================================
  // PLOTS
  // ===================================================

  updatePlotHealth(plotId, health) {
    this.farm.updatePlot(plotId, {
      health,
    });
  }

  updatePlotMoisture(plotId, moisture) {
    this.farm.updatePlot(plotId, {
      moisture,
    });
  }
}
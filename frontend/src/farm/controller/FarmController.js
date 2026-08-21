import { SoilSimulation } from "../simulation/SoilSimulation";

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
  updatePlotDiseaseRisk(plotId, diseaseRisk) {
    this.farm.updatePlot(plotId, {
      diseaseRisk,
    });
  }
  // ===================================================
  // IRRIGATION
  // ===================================================

  updatePlotIrrigation(
    plotId,
    irrigationRequired,
    irrigationLevel,
    irrigationReason,
  ) {
    this.farm.updatePlot(plotId, {
      irrigationRequired,
      irrigationLevel,
      irrigationReason,
    });
  }
  updatePlotMoisture(plotId, moisture) {
    this.farm.updatePlot(plotId, {
      moisture,
    });
  }

  // General plot update
  updatePlot(plotId, update) {
    this.farm.updatePlot(plotId, update);
  }

  // ===================================================
  // SOIL SIMULATION
  // ===================================================

  simulateSoil(farmState, deltaHours = 1) {
    farmState.plots.forEach((plot) => {
      const updatedPlot = SoilSimulation.update(
        plot,
        farmState.weather,
        deltaHours,
      );

      this.updatePlotMoisture(plot.id, updatedPlot.moisture);
    });
  }
}

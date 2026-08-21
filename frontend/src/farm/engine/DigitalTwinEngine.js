// =====================================================
// KRISHIMITRA AI
// DIGITAL TWIN ENGINE
// =====================================================
import { CropGrowthSimulation } from "../simulation/CropGrowthSimulation";
import { CropHealthSimulation } from "../simulation/CropHealthSimulation";
import { DiseaseRiskSimulation } from "../simulation/DiseaseRiskSimulation";

export class DigitalTwinEngine {
  constructor(controller) {
    this.controller = controller;

    this.modules = [];

    // =================================================
    // SOIL SIMULATION MODULE
    // =================================================

    this.register({
      update: (farmState, controller, deltaHours) => {
        controller.simulateSoil(farmState, deltaHours);
      },
    });
    this.register({
      update: (farmState, controller, deltaHours) => {
        farmState.plots.forEach((plot) => {
          const updatedPlot = CropGrowthSimulation.update(plot, deltaHours);

          controller.updatePlot(plot.id, {
            growth: updatedPlot.growth,
          });
        });
      },
    });
    // ===================================================
    // CROP HEALTH SIMULATION MODULE
    // ===================================================

    this.register({
      update: (farmState, controller, deltaHours) => {
        farmState.plots.forEach((plot) => {
          const updatedPlot = CropHealthSimulation.update(plot, deltaHours);

          controller.updatePlot(plot.id, {
            health: updatedPlot.health,
          });
        });
      },
    });
    // ===================================================
    // DISEASE RISK SIMULATION MODULE
    // ===================================================

    this.register({
      update: (farmState, controller, deltaHours) => {
        farmState.plots.forEach((plot) => {
          const updatedPlot = DiseaseRiskSimulation.update(
            plot,
            farmState,
            deltaHours,
          );

          controller.updatePlotDiseaseRisk(plot.id, updatedPlot.diseaseRisk);
        });
      },
    });
  }

  // ===================================================
  // REGISTER MODULE
  // ===================================================

  register(module) {
    this.modules.push(module);
  }

  // ===================================================
  // UPDATE
  // ===================================================

  update(farmState, deltaHours) {
    this.modules.forEach((module) => {
      module.update(farmState, this.controller, deltaHours);
    });
  }
}

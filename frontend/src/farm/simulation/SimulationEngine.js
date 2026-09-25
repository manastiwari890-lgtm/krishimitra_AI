// =====================================================
// KRISHIMITRA AI
// SIMULATION ENGINE
// =====================================================

export class SimulationEngine {
  constructor(controller, digitalTwin) {
    this.controller = controller;
    this.digitalTwin = digitalTwin;

    this.interval = null;

    // Run one simulation tick every real second.
    this.tickDuration = 1000;

    // Simulated farm time advanced per real second.
    //
    // 0.03 hours = 1.8 simulated minutes.
    //
    // This keeps soil moisture, crop growth and
    // other Digital Twin processes moving gradually
    // instead of reaching their limits too quickly.
    this.simulationDeltaHours = 0.03;
  }

  // ===================================================
  // START
  // ===================================================

  start() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.tick();
    }, this.tickDuration);
  }

  // ===================================================
  // STOP
  // ===================================================

  stop() {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);

    this.interval = null;
  }

  // ===================================================
  // SIMULATION TICK
  // ===================================================

  tick() {
    this.digitalTwin.update(
      this.controller.farm.farmState,
      this.simulationDeltaHours,
    );
  }
}
// =====================================================
// KRISHIMITRA AI
// SIMULATION ENGINE
// =====================================================

export class SimulationEngine {
  constructor(controller, digitalTwin) {
    this.controller = controller;
    this.digitalTwin = digitalTwin;

    this.interval = null;

    this.tickDuration = 1000; // 1 second
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
      0.1,
    );
  }
}

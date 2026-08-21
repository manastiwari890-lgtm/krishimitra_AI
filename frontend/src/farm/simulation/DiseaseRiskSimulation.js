// =====================================================
// KRISHIMITRA AI
// DISEASE RISK SIMULATION
// =====================================================

export class DiseaseRiskSimulation {
  static update(plot, farmState, deltaHours) {
    let riskScore = 0;

    const moisture = plot.moisture ?? 0;
    const humidity = farmState.weather?.humidity ?? 0;
    const health = plot.health ?? "healthy";

    // ===================================================
    // SOIL MOISTURE FACTOR
    // ===================================================

    if (moisture >= 80) {
      riskScore += 3;
    } else if (moisture >= 65) {
      riskScore += 2;
    } else if (moisture >= 50) {
      riskScore += 1;
    }

    // ===================================================
    // HUMIDITY FACTOR
    // ===================================================

    if (humidity >= 80) {
      riskScore += 3;
    } else if (humidity >= 65) {
      riskScore += 2;
    } else if (humidity >= 50) {
      riskScore += 1;
    }

    // ===================================================
    // CROP HEALTH FACTOR
    // ===================================================

    if (health === "warning") {
      riskScore += 2;
    } else if (health === "critical") {
      riskScore += 3;
    }

    // ===================================================
    // RAIN FACTOR
    // ===================================================

    if (farmState.weather?.isRaining) {
      riskScore += 2;
    }

    // ===================================================
    // FINAL DISEASE RISK
    // ===================================================

    let diseaseRisk = "Low";

    if (riskScore >= 7) {
      diseaseRisk = "High";
    } else if (riskScore >= 4) {
      diseaseRisk = "Medium";
    }

    console.log(
      "DISEASE RISK:",
      plot.id,
      diseaseRisk,
      "SCORE:",
      riskScore,
    );

    return {
      ...plot,
      diseaseRisk,
    };
  }
}
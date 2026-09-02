// =====================================================
// KRISHIMITRA AI
// FARM HEALTH ENGINE
// =====================================================
//
// Converts Digital Twin data into a farm-health score,
// identifies the main problem in each plot, and produces
// an actionable recommendation.
//
// PURE CALCULATION ENGINE
//
// It does NOT:
// - Modify farmState
// - Call APIs
// - Render UI
// =====================================================

export class FarmHealthEngine {

  // ===================================================
  // CALCULATE SINGLE PLOT HEALTH
  // ===================================================

  static calculatePlotHealth(
    plot,
    weather,
  ) {

    const moisture =
      Number.isFinite(plot?.moisture)
        ? Math.max(0, Math.min(100, plot.moisture))
        : 0;

    const humidity =
      Number.isFinite(weather?.humidity)
        ? weather.humidity
        : 0;

    const temperature =
      Number.isFinite(weather?.temperature)
        ? weather.temperature
        : 0;

    const health =
      plot?.health ?? "healthy";

    const diseaseRisk =
      plot?.diseaseRisk ?? "Low";


    // =================================================
    // MOISTURE SCORE
    // =================================================

    let moistureScore;

    if (moisture >= 60) {
      moistureScore = 100;
    } else if (moisture >= 40) {
      moistureScore = 75;
    } else if (moisture >= 20) {
      moistureScore = 45;
    } else {
      moistureScore = 20;
    }


    // =================================================
    // CROP HEALTH SCORE
    // =================================================

    let healthScore;

    switch (health) {

      case "healthy":
        healthScore = 100;
        break;

      case "warning":
        healthScore = 60;
        break;

      case "critical":
        healthScore = 25;
        break;

      default:
        healthScore = 70;
        break;
    }


    // =================================================
    // DISEASE RISK SCORE
    // =================================================

    let diseaseScore;

    switch (diseaseRisk) {

      case "Low":
        diseaseScore = 100;
        break;

      case "Medium":
        diseaseScore = 65;
        break;

      case "High":
        diseaseScore = 30;
        break;

      default:
        diseaseScore = 75;
        break;
    }


    // =================================================
    // WEATHER SCORE
    // =================================================

    let weatherScore = 100;

    // High humidity increases disease pressure.

    if (humidity >= 85) {

      weatherScore -= 25;

    } else if (humidity >= 75) {

      weatherScore -= 10;

    }


    // High temperature creates crop stress.

    if (temperature >= 38) {

      weatherScore -= 25;

    } else if (temperature >= 34) {

      weatherScore -= 10;

    }


    weatherScore =
      Math.max(
        0,
        weatherScore,
      );


    // =================================================
    // FINAL SCORE
    // =================================================
    //
    // Moisture      -> 30%
    // Crop health   -> 30%
    // Disease risk  -> 25%
    // Weather       -> 15%
    // =================================================

    const score =
      Math.round(
        moistureScore * 0.30 +
        healthScore * 0.30 +
        diseaseScore * 0.25 +
        weatherScore * 0.15
      );


    // =================================================
    // STATUS
    // =================================================

    let status;

    if (score >= 80) {

      status = "Healthy";

    } else if (score >= 60) {

      status = "Moderate";

    } else if (score >= 40) {

      status = "Warning";

    } else {

      status = "Critical";

    }


    // =================================================
    // FIND MAIN ISSUE
    // =================================================

    let issue =
      "No major issue detected.";

    let priority =
      "Low";


    // Moisture has highest priority when critically low.

    if (moisture < 20) {

      issue =
        "Critical soil moisture";

      priority =
        "High";

    } else if (moisture < 40) {

      issue =
        "Low soil moisture";

      priority =
        "High";

    } else if (
      health === "critical"
    ) {

      issue =
        "Crop health is critical";

      priority =
        "High";

    } else if (
      diseaseRisk === "High"
    ) {

      issue =
        "High disease risk";

      priority =
        "High";

    } else if (
      temperature >= 38
    ) {

      issue =
        "Severe heat stress";

      priority =
        "High";

    } else if (
      humidity >= 85 &&
      diseaseRisk !== "Low"
    ) {

      issue =
        "High humidity and disease pressure";

      priority =
        "Medium";

    } else if (
      temperature >= 34
    ) {

      issue =
        "High temperature stress";

      priority =
        "Medium";

    } else if (
      health === "warning"
    ) {

      issue =
        "Crop health requires attention";

      priority =
        "Medium";

    } else if (
      moisture < 60
    ) {

      issue =
        "Moderate soil moisture";

      priority =
        "Low";
    }


    // =================================================
    // AI RECOMMENDATION
    // =================================================

    let recommendation =
      "Crop conditions are stable. Continue normal monitoring.";


    if (moisture < 20) {

      recommendation =
        "Critical moisture level. Irrigate this plot immediately.";

    } else if (moisture < 40) {

      recommendation =
        "Soil moisture is low. Irrigation is recommended.";

    } else if (
      health === "critical"
    ) {

      recommendation =
        "Crop health is critical. Inspect the plants for stress or disease.";

    } else if (
      diseaseRisk === "High"
    ) {

      recommendation =
        "High disease risk detected. Inspect the crop and avoid unnecessary leaf wetting.";

    } else if (
      humidity >= 85 &&
      diseaseRisk !== "Low"
    ) {

      recommendation =
        "High humidity may increase disease pressure. Closely monitor the crop.";

    } else if (
      temperature >= 38
    ) {

      recommendation =
        "Severe heat stress is possible. Monitor soil moisture and crop condition closely.";

    } else if (
      temperature >= 34
    ) {

      recommendation =
        "High temperature may stress the crop. Monitor moisture closely.";

    } else if (
      health === "warning"
    ) {

      recommendation =
        "Crop health requires attention. Inspect this plot for visible stress.";

    } else if (
      moisture < 60
    ) {

      recommendation =
        "Moisture is moderate. Continue monitoring before the next irrigation.";

    }


    // =================================================
    // RETURN PLOT ANALYSIS
    // =================================================

    return {

      plotId:
        plot?.id ?? null,

      score,

      status,

      issue,

      priority,

      recommendation,

      factors: {

        // Actual readings are useful to the UI.

        moistureValue:
          Math.round(moisture),

        humidityValue:
          Math.round(humidity),

        temperatureValue:
          Math.round(temperature),

        // Normalized component scores.

        moisture:
          moistureScore,

        cropHealth:
          healthScore,

        diseaseRisk:
          diseaseScore,

        weather:
          weatherScore,
      },

    };
  }


  // ===================================================
  // CALCULATE ENTIRE FARM
  // ===================================================

  static calculateFarmHealth(
    farmState,
  ) {

    const plots =
      farmState?.plots ?? [];

    const weather =
      farmState?.weather ?? {};


    // =================================================
    // EMPTY FARM
    // =================================================

    if (
      plots.length === 0
    ) {

      return {

        score: 0,

        status:
          "Unknown",

        plots: [],

        priorityPlot:
          null,

        farmRecommendation:
          "No farm plot data is available.",

      };
    }


    // =================================================
    // ANALYZE ALL PLOTS
    // =================================================

    const plotResults =
      plots.map(
        (plot) =>
          this.calculatePlotHealth(
            plot,
            weather,
          )
      );


    // =================================================
    // FARM SCORE
    // =================================================

    const totalScore =
      plotResults.reduce(
        (sum, plot) =>
          sum + plot.score,
        0,
      );

    const score =
      Math.round(
        totalScore /
        plotResults.length
      );


    // =================================================
    // FARM STATUS
    // =================================================

    let status;

    if (score >= 80) {

      status = "Healthy";

    } else if (score >= 60) {

      status = "Moderate";

    } else if (score >= 40) {

      status = "Warning";

    } else {

      status = "Critical";

    }


    // =================================================
    // PRIORITY PLOT
    // =================================================
    //
    // High priority issues come first.
    // If priorities are equal, lowest score wins.
    // =================================================

    const priorityWeight = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    const sortedPlots =
      [...plotResults].sort(
        (a, b) => {

          const priorityDifference =
            (
              priorityWeight[b.priority] ?? 0
            ) -
            (
              priorityWeight[a.priority] ?? 0
            );

          if (
            priorityDifference !== 0
          ) {

            return priorityDifference;

          }

          return a.score - b.score;

        }
      );


    const priorityPlot =
      sortedPlots[0] ?? null;


    // =================================================
    // FARM RECOMMENDATION
    // =================================================

    let farmRecommendation =
      "All plots are currently stable. Continue regular monitoring.";


    if (
      priorityPlot?.priority === "High"
    ) {

      farmRecommendation =
        `Plot ${priorityPlot.plotId} needs immediate attention: ${priorityPlot.issue}.`;

    } else if (
      priorityPlot?.priority === "Medium"
    ) {

      farmRecommendation =
        `Plot ${priorityPlot.plotId} should be monitored: ${priorityPlot.issue}.`;

    } else if (
      score >= 80
    ) {

      farmRecommendation =
        "Farm conditions are healthy. Continue normal monitoring.";

    } else {

      farmRecommendation =
        "Farm conditions are moderate. Continue monitoring all plots.";

    }


    // =================================================
    // FINAL FARM RESULT
    // =================================================

    return {

      score,

      status,

      plots:
        plotResults,

      priorityPlot,

      farmRecommendation,

    };
  }
}
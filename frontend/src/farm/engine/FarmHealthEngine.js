// =====================================================
// KRISHIMITRA AI
// FARM HEALTH + CROP PERFORMANCE ENGINE
// =====================================================
//
// Converts Digital Twin data into:
//
// - Farm health score
// - Plot health score
// - Main plot problem
// - Actionable recommendation
// - Crop performance score
// - Growth progress
// - Yield potential indicator
// - Performance limiting factor
//
// IMPORTANT:
//
// Performance / yield values are INDICATORS.
// They are NOT calibrated kg/acre yield predictions.
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
  // HELPERS
  // ===================================================

  static clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
  }

  static number(value, fallback = null) {
    return Number.isFinite(value) ? value : fallback;
  }

  // ===================================================
  // NORMALIZE DISEASE RISK
  // ===================================================

  static normalizeDiseaseRisk(value) {
    if (!value) {
      return "Low";
    }

    const normalized = String(value).toLowerCase();

    if (normalized === "high") {
      return "High";
    }

    if (normalized === "medium") {
      return "Medium";
    }

    return "Low";
  }

  // ===================================================
  // NORMALIZE CROP HEALTH
  // ===================================================

  static normalizeHealth(value) {
    if (!value) {
      return "healthy";
    }

    const normalized = String(value).toLowerCase();

    if (normalized === "stressed" || normalized === "critical") {
      return "stressed";
    }

    if (normalized === "warning") {
      return "warning";
    }

    return "healthy";
  }

  // ===================================================
  // CALCULATE WEATHER STRESS
  // ===================================================

  static calculateWeatherStress(weather = {}) {
    const humidity = this.number(weather?.humidity, 0);

    const temperature = this.number(weather?.temperature, 0);

    let stress = 0;

    // -------------------------------------------------
    // HUMIDITY STRESS
    // -------------------------------------------------

    if (humidity >= 90) {
      stress += 30;
    } else if (humidity >= 85) {
      stress += 20;
    } else if (humidity >= 75) {
      stress += 10;
    }

    // -------------------------------------------------
    // HEAT STRESS
    // -------------------------------------------------

    if (temperature >= 40) {
      stress += 35;
    } else if (temperature >= 38) {
      stress += 25;
    } else if (temperature >= 34) {
      stress += 10;
    }

    stress = this.clamp(stress);

    return {
      stress,

      score: this.clamp(100 - stress),
    };
  }

  // ===================================================
  // CALCULATE SINGLE PLOT HEALTH
  // ===================================================

  static calculatePlotHealth(plot, weather) {
    const moisture = Number.isFinite(plot?.moisture)
      ? this.clamp(plot.moisture)
      : 0;

    const humidity = Number.isFinite(weather?.humidity) ? weather.humidity : 0;

    const temperature = Number.isFinite(weather?.temperature)
      ? weather.temperature
      : 0;

    const health = this.normalizeHealth(plot?.health);

    const diseaseRisk = this.normalizeDiseaseRisk(plot?.diseaseRisk);

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

      case "stressed":
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

    const weatherAnalysis = this.calculateWeatherStress(weather);

    const weatherScore = weatherAnalysis.score;

    // =================================================
    // FINAL HEALTH SCORE
    // =================================================
    //
    // Moisture      -> 30%
    // Crop health   -> 30%
    // Disease risk  -> 25%
    // Weather       -> 15%
    // =================================================

    const score = Math.round(
      moistureScore * 0.3 +
        healthScore * 0.3 +
        diseaseScore * 0.25 +
        weatherScore * 0.15,
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

    let issue = "No major issue detected.";

    let priority = "Low";

    if (moisture < 20) {
      issue = "Critical soil moisture";

      priority = "High";
    } else if (moisture < 40) {
      issue = "Low soil moisture";

      priority = "High";
    } else if (health === "stressed") {
      issue = "Crop is under stress";

      priority = "High";
    } else if (diseaseRisk === "High") {
      issue = "High disease risk";

      priority = "High";
    } else if (temperature >= 38) {
      issue = "Severe heat stress";

      priority = "High";
    } else if (humidity >= 85 && diseaseRisk !== "Low") {
      issue = "High humidity and disease pressure";

      priority = "Medium";
    } else if (temperature >= 34) {
      issue = "High temperature stress";

      priority = "Medium";
    } else if (health === "warning") {
      issue = "Crop health requires attention";

      priority = "Medium";
    } else if (moisture < 60) {
      issue = "Moderate soil moisture";

      priority = "Low";
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
      recommendation = "Soil moisture is low. Irrigation is recommended.";
    } else if (health === "stressed") {
      recommendation =
        "Crop is under stress. Inspect the plants for visible damage or water stress.";
    } else if (diseaseRisk === "High") {
      recommendation =
        "High disease risk detected. Inspect the crop and avoid unnecessary leaf wetting.";
    } else if (humidity >= 85 && diseaseRisk !== "Low") {
      recommendation =
        "High humidity may increase disease pressure. Closely monitor the crop.";
    } else if (temperature >= 38) {
      recommendation =
        "Severe heat stress is possible. Monitor soil moisture and crop condition closely.";
    } else if (temperature >= 34) {
      recommendation =
        "High temperature may stress the crop. Monitor moisture closely.";
    } else if (health === "warning") {
      recommendation =
        "Crop health requires attention. Inspect this plot for visible stress.";
    } else if (moisture < 60) {
      recommendation =
        "Moisture is moderate. Continue monitoring before the next irrigation.";
    }

    // =================================================
    // RETURN PLOT HEALTH
    // =================================================

    return {
      plotId: plot?.id ?? null,

      score,

      status,

      issue,

      priority,

      recommendation,

      factors: {
        moistureValue: Math.round(moisture),

        humidityValue: Math.round(humidity),

        temperatureValue: Math.round(temperature),

        moisture: moistureScore,

        cropHealth: healthScore,

        diseaseRisk: diseaseScore,

        weather: weatherScore,
      },
    };
  }

  // ===================================================
  // CROP PERFORMANCE INTELLIGENCE
  // ===================================================

  static calculateCropPerformance(plot, weather) {
    // =================================================
    // REAL DIGITAL TWIN VALUES
    // =================================================

    const moisture = Number.isFinite(plot?.moisture)
      ? this.clamp(plot.moisture)
      : 0;

    const growth = Number.isFinite(plot?.growth) ? this.clamp(plot.growth) : 0;

    const health = this.normalizeHealth(plot?.health);

    const diseaseRisk = this.normalizeDiseaseRisk(plot?.diseaseRisk);

    const temperature = Number.isFinite(weather?.temperature)
      ? weather.temperature
      : 0;

    const humidity = Number.isFinite(weather?.humidity) ? weather.humidity : 0;

    // =================================================
    // GROWTH PROGRESS
    // =================================================
    //
    // This is the REAL Digital Twin growth value.
    //
    // It represents simulation progress toward 100%.
    //
    // It is NOT a biological growth-stage classifier.
    // =================================================

    const growthProgress = Math.round(growth);

    // =================================================
    // GROWTH PERFORMANCE
    // =================================================

    let growthPerformance;

    if (growth >= 90) {
      growthPerformance = 100;
    } else if (growth >= 70) {
      growthPerformance = 90;
    } else if (growth >= 50) {
      growthPerformance = 75;
    } else if (growth >= 30) {
      growthPerformance = 60;
    } else if (growth >= 10) {
      growthPerformance = 40;
    } else {
      growthPerformance = 20;
    }

    // =================================================
    // MOISTURE PERFORMANCE
    // =================================================
    //
    // Based on the actual maize growth simulation:
    //
    // 40–80 = ideal
    // 30–39 = moderate stress
    // 20–29 = high stress
    // 10–19 = severe drought
    // >80    = excess water
    // >90    = waterlogging
    // =================================================

    let moisturePerformance;

    if (moisture >= 40 && moisture <= 80) {
      moisturePerformance = 100;
    } else if (moisture > 80 && moisture <= 90) {
      moisturePerformance = 75;
    } else if (moisture >= 30 && moisture < 40) {
      moisturePerformance = 55;
    } else if (moisture >= 20 && moisture < 30) {
      moisturePerformance = 35;
    } else if (moisture >= 10 && moisture < 20) {
      moisturePerformance = 15;
    } else if (moisture > 90) {
      moisturePerformance = 25;
    } else {
      moisturePerformance = 5;
    }

    // =================================================
    // CROP HEALTH PERFORMANCE
    // =================================================

    let healthPerformance;

    switch (health) {
      case "healthy":
        healthPerformance = 100;

        break;

      case "warning":
        healthPerformance = 60;

        break;

      case "stressed":
        healthPerformance = 25;

        break;

      default:
        healthPerformance = 70;

        break;
    }

    // =================================================
    // DISEASE PERFORMANCE
    // =================================================

    let diseasePerformance;

    switch (diseaseRisk) {
      case "Low":
        diseasePerformance = 100;

        break;

      case "Medium":
        diseasePerformance = 65;

        break;

      case "High":
        diseasePerformance = 30;

        break;

      default:
        diseasePerformance = 75;

        break;
    }

    // =================================================
    // WEATHER PERFORMANCE
    // =================================================

    let weatherPerformance = 100;

    if (temperature >= 40) {
      weatherPerformance -= 35;
    } else if (temperature >= 38) {
      weatherPerformance -= 25;
    } else if (temperature >= 34) {
      weatherPerformance -= 10;
    }

    if (humidity >= 90) {
      weatherPerformance -= 25;
    } else if (humidity >= 85) {
      weatherPerformance -= 20;
    } else if (humidity >= 75) {
      weatherPerformance -= 10;
    }

    weatherPerformance = this.clamp(weatherPerformance);

    // =================================================
    // PERFORMANCE SCORE
    // =================================================
    //
    // Growth          -> 25%
    // Moisture        -> 25%
    // Crop health     -> 25%
    // Disease         -> 15%
    // Weather         -> 10%
    //
    // Total            = 100%
    // =================================================

    const performanceScore = Math.round(
      growthPerformance * 0.25 +
        moisturePerformance * 0.25 +
        healthPerformance * 0.25 +
        diseasePerformance * 0.15 +
        weatherPerformance * 0.1,
    );

    // =================================================
    // PERFORMANCE STATUS
    // =================================================

    let performanceStatus;

    if (performanceScore >= 85) {
      performanceStatus = "Excellent";
    } else if (performanceScore >= 70) {
      performanceStatus = "Good";
    } else if (performanceScore >= 50) {
      performanceStatus = "Moderate";
    } else if (performanceScore >= 30) {
      performanceStatus = "Low";
    } else {
      performanceStatus = "Critical";
    }

    // =================================================
    // PERFORMANCE FACTORS
    // =================================================

    const factors = [
      {
        key: "growth",

        label: "Growth progress",

        score: growthPerformance,
      },

      {
        key: "moisture",

        label: "Soil moisture",

        score: moisturePerformance,
      },

      {
        key: "cropHealth",

        label: "Crop health",

        score: healthPerformance,
      },

      {
        key: "disease",

        label: "Disease pressure",

        score: diseasePerformance,
      },

      {
        key: "weather",

        label: "Weather conditions",

        score: weatherPerformance,
      },
    ];
    // =================================================
    // LIMITING FACTOR
    // =================================================

    // Start with the mathematically lowest factor.
    let limitingFactor = [...factors].sort((a, b) => a.score - b.score)[0];

    // -------------------------------------------------
    // AI INTERVENTION PRIORITY
    // -------------------------------------------------
    // The lowest numerical score is not always the most
    // actionable problem.
    //
    // Priority:
    // 1. Low moisture
    // 2. High disease risk
    // 3. Crop stress
    // 4. Severe weather
    // 5. Low growth
    // 6. Otherwise lowest factor
    // -------------------------------------------------

    if (moisture < 30) {
      limitingFactor =
        factors.find((factor) => factor.key === "moisture") ?? limitingFactor;
    } else if (diseaseRisk === "High") {
      limitingFactor =
        factors.find((factor) => factor.key === "disease") ?? limitingFactor;
    } else if (healthPerformance < 40) {
      limitingFactor =
        factors.find((factor) => factor.key === "cropHealth") ?? limitingFactor;
    } else if (weatherPerformance < 50) {
      limitingFactor =
        factors.find((factor) => factor.key === "weather") ?? limitingFactor;
    } else if (growthPerformance < 40) {
      limitingFactor =
        factors.find((factor) => factor.key === "growth") ?? limitingFactor;
    }
    // =================================================
    // PERFORMANCE RECOMMENDATION
    // =================================================

    let performanceRecommendation =
      "Current conditions are favorable for crop performance.";

    if (moisturePerformance < 40) {
      performanceRecommendation =
        "Low soil moisture is currently limiting crop performance. Prioritize irrigation.";
    } else if (healthPerformance < 40) {
      performanceRecommendation =
        "Crop stress is limiting performance. Inspect the plants and check their growing conditions.";
    } else if (diseasePerformance < 40) {
      performanceRecommendation =
        "High disease pressure may reduce crop performance. Inspect affected plants promptly.";
    } else if (weatherPerformance < 50) {
      performanceRecommendation =
        "Current weather conditions may reduce crop performance. Closely monitor crop stress.";
    } else if (growthPerformance < 40) {
      performanceRecommendation =
        "Growth progress is currently low. Maintain suitable moisture and monitor crop development.";
    } else if (limitingFactor.score < 70) {
      performanceRecommendation = `${limitingFactor.label} is the main factor limiting current crop performance.`;
    }

    // =================================================
    // YIELD POTENTIAL INDICATOR
    // =================================================
    //
    // Relative indicator only.
    //
    // NOT:
    // - kg/acre
    // - tons/hectare
    // - guaranteed production
    // =================================================

    let yieldPotential;

    if (performanceScore >= 85) {
      yieldPotential = "High";
    } else if (performanceScore >= 70) {
      yieldPotential = "Good";
    } else if (performanceScore >= 50) {
      yieldPotential = "Moderate";
    } else if (performanceScore >= 30) {
      yieldPotential = "Low";
    } else {
      yieldPotential = "Very Low";
    }

    // =================================================
    // RETURN PERFORMANCE
    // =================================================

    return {
      score: performanceScore,

      status: performanceStatus,

      growthProgress,

      yieldPotential,

      limitingFactor: {
        key: limitingFactor.key,

        label: limitingFactor.label,

        score: limitingFactor.score,
      },

      factors: {
        growth: Math.round(growthPerformance),

        moisture: Math.round(moisturePerformance),

        cropHealth: Math.round(healthPerformance),

        disease: Math.round(diseasePerformance),

        weather: Math.round(weatherPerformance),
      },

      readings: {
        growth: Math.round(growth),

        moisture: Math.round(moisture),

        temperature: Math.round(temperature),

        humidity: Math.round(humidity),

        health,

        diseaseRisk,
      },

      recommendation: performanceRecommendation,
    };
  }

  // ===================================================
  // CALCULATE ENTIRE FARM
  // ===================================================

  static calculateFarmHealth(farmState) {
    const plots = farmState?.plots ?? [];

    const weather = farmState?.weather ?? {};

    // =================================================
    // EMPTY FARM
    // =================================================

    if (plots.length === 0) {
      return {
        score: 0,

        status: "Unknown",

        plots: [],

        priorityPlot: null,

        farmRecommendation: "No farm plot data is available.",

        performance: {
          score: 0,

          status: "Unknown",

          growthProgress: 0,

          yieldPotential: "Unknown",

          limitingFactor: null,

          recommendation: "No crop performance data is available.",

          plots: [],
        },
      };
    }

    // =================================================
    // ANALYZE ALL PLOTS
    // =================================================

    const plotResults = plots.map((plot) =>
      this.calculatePlotHealth(plot, weather),
    );

    // =================================================
    // ANALYZE CROP PERFORMANCE
    // =================================================

    const performanceResults = plots.map((plot) => {
      const performance = this.calculateCropPerformance(plot, weather);

      return {
        plotId: plot?.id ?? null,

        crop: plot?.crop ?? null,

        ...performance,
      };
    });

    // =================================================
    // FARM HEALTH SCORE
    // =================================================

    const totalScore = plotResults.reduce((sum, plot) => sum + plot.score, 0);

    const score = Math.round(totalScore / plotResults.length);

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

    const priorityWeight = {
      High: 3,

      Medium: 2,

      Low: 1,
    };

    const sortedPlots = [...plotResults].sort((a, b) => {
      const priorityDifference =
        (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return a.score - b.score;
    });

    const priorityPlot = sortedPlots[0] ?? null;

    // =================================================
    // FARM HEALTH RECOMMENDATION
    // =================================================

    let farmRecommendation =
      "All plots are currently stable. Continue regular monitoring.";

    if (priorityPlot?.priority === "High") {
      farmRecommendation = `Plot ${priorityPlot.plotId} needs immediate attention: ${priorityPlot.issue}.`;
    } else if (priorityPlot?.priority === "Medium") {
      farmRecommendation = `Plot ${priorityPlot.plotId} should be monitored: ${priorityPlot.issue}.`;
    } else if (score >= 80) {
      farmRecommendation =
        "Farm conditions are healthy. Continue normal monitoring.";
    } else {
      farmRecommendation =
        "Farm conditions are moderate. Continue monitoring all plots.";
    }

    // =================================================
    // FARM PERFORMANCE SCORE
    // =================================================

    const totalPerformance = performanceResults.reduce(
      (sum, plot) => sum + plot.score,
      0,
    );

    const performanceScore = Math.round(
      totalPerformance / performanceResults.length,
    );

    // =================================================
    // FARM PERFORMANCE STATUS
    // =================================================

    let performanceStatus;

    if (performanceScore >= 85) {
      performanceStatus = "Excellent";
    } else if (performanceScore >= 70) {
      performanceStatus = "Good";
    } else if (performanceScore >= 50) {
      performanceStatus = "Moderate";
    } else if (performanceScore >= 30) {
      performanceStatus = "Low";
    } else {
      performanceStatus = "Critical";
    }

    // =================================================
    // FARM GROWTH PROGRESS
    // =================================================

    const totalGrowth = performanceResults.reduce(
      (sum, plot) =>
        sum +
        (Number.isFinite(plot?.readings?.growth) ? plot.readings.growth : 0),
      0,
    );

    const farmGrowthProgress = Math.round(
      totalGrowth / performanceResults.length,
    );

    // =================================================
    // FARM YIELD POTENTIAL
    // =================================================

    let yieldPotential;

    if (performanceScore >= 85) {
      yieldPotential = "High";
    } else if (performanceScore >= 70) {
      yieldPotential = "Good";
    } else if (performanceScore >= 50) {
      yieldPotential = "Moderate";
    } else if (performanceScore >= 30) {
      yieldPotential = "Low";
    } else {
      yieldPotential = "Very Low";
    }

    // =================================================
    // FARM PERFORMANCE LIMITING FACTOR
    // =================================================

    const limitingFactorCounts = {};

    performanceResults.forEach((plot) => {
      const key = plot?.limitingFactor?.key;

      if (!key) {
        return;
      }

      if (!limitingFactorCounts[key]) {
        limitingFactorCounts[key] = {
          key,

          label: plot.limitingFactor.label,

          count: 0,
        };
      }

      limitingFactorCounts[key].count += 1;
    });

    const farmLimitingFactor =
      Object.values(limitingFactorCounts).sort(
        (a, b) => b.count - a.count,
      )[0] ?? null;

    // =================================================
    // FARM PERFORMANCE RECOMMENDATION
    // =================================================

    let performanceRecommendation =
      "Farm conditions are favorable for crop performance.";

    if (farmLimitingFactor) {
      performanceRecommendation = `${farmLimitingFactor.label} is currently the most common performance constraint across the farm.`;
    }

    // =================================================
    // FINAL FARM RESULT
    // =================================================

    return {
      // ------------------------------------------------
      // EXISTING HEALTH API
      // ------------------------------------------------

      score,

      status,

      plots: plotResults,

      priorityPlot,

      farmRecommendation,

      // ------------------------------------------------
      // PERFORMANCE INTELLIGENCE
      // ------------------------------------------------

      performance: {
        score: performanceScore,

        status: performanceStatus,

        growthProgress: farmGrowthProgress,

        yieldPotential,

        limitingFactor: farmLimitingFactor,

        recommendation: performanceRecommendation,

        plots: performanceResults,
      },
    };
  }
}

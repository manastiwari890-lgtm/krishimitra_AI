// =====================================================
// KRISHIMITRA AI
// CROP-SPECIFIC WEATHER INTELLIGENCE ENGINE
// =====================================================

import {
  getCropWeatherProfile,
  isCriticalCropStage,
} from "../data/cropWeatherProfiles";

// =====================================================
// HELPERS
// =====================================================

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function getText(object, language) {
  if (!object) return "";

  return (
    object[language] ||
    object.en ||
    ""
  );
}

function createRisk({
  id,
  icon,
  severity,
  title,
  message,
}) {
  return {
    id,
    icon,
    severity,
    title,
    message,
  };
}

// =====================================================
// WEATHER FLAGS
//
// These describe the WEATHER.
// They are not crop-specific thresholds.
//
// Later we can replace/extend these with:
// - IMD alerts
// - regional thresholds
// - crop variety data
// - historical weather
// =====================================================

function getWeatherFlags(weather) {
  const current =
    weather?.current || {};

  const daily =
    weather?.daily || [];

  const today =
    daily[0] || {};

  const nextThreeDays =
    daily.slice(0, 3);

  const temperature =
    safeNumber(
      current.temperature
    );

  const humidity =
    safeNumber(
      current.humidity
    );

  const windSpeed =
    safeNumber(
      current.windSpeed
    );

  const windGust =
    safeNumber(
      current.windGust
    );

  const precipitation =
    safeNumber(
      current.precipitation
    );

  const todayRain =
    safeNumber(
      today.rain
    );

  const rainProbability =
    safeNumber(
      today.rainProbability
    );

  const totalThreeDayRain =
    nextThreeDays.reduce(
      (total, day) =>
        total +
        safeNumber(day.rain),
      0
    );

  const highestRainProbability =
    nextThreeDays.reduce(
      (highest, day) =>
        Math.max(
          highest,
          safeNumber(
            day.rainProbability
          )
        ),
      0
    );

  return {
    temperature,
    humidity,
    windSpeed,
    windGust,
    precipitation,
    todayRain,
    rainProbability,
    totalThreeDayRain,
    highestRainProbability,

    hot:
      temperature >= 35,

    veryHot:
      temperature >= 40,

    cold:
      temperature <= 10,

    veryCold:
      temperature <= 5,

    highHumidity:
      humidity >= 80,

    veryHighHumidity:
      humidity >= 90,

    windy:
      windSpeed >= 20,

    strongWind:
      windSpeed >= 35 ||
      windGust >= 50,

    wetConditions:
      precipitation > 0 ||
      todayRain >= 2 ||
      rainProbability >= 60,

    heavyRainRisk:
      todayRain >= 10 ||
      totalThreeDayRain >= 25 ||
      highestRainProbability >= 85,

    dryWeather:
      precipitation === 0 &&
      todayRain === 0 &&
      rainProbability < 30,
  };
}

// =====================================================
// SENSITIVITY → SEVERITY
// =====================================================

function sensitivityToSeverity(
  sensitivity,
  weatherStrength = "normal"
) {
  if (weatherStrength === "extreme") {
    if (sensitivity === "high") {
      return "high";
    }

    return "medium";
  }

  if (sensitivity === "high") {
    return "medium";
  }

  if (sensitivity === "medium") {
    return "medium";
  }

  return "low";
}

// =====================================================
// HEAT RISK
// =====================================================

function analyzeHeat(
  crop,
  stageId,
  flags,
  language
) {
  if (!flags.hot) {
    return null;
  }

  const risk =
    crop.risks?.heat;

  if (!risk) {
    return null;
  }

  const stageSensitive =
    !risk.sensitiveStages ||
    risk.sensitiveStages.includes(
      stageId
    );

  if (!stageSensitive) {
    return null;
  }

  const severity =
    sensitivityToSeverity(
      crop.sensitivity?.heat,
      flags.veryHot
        ? "extreme"
        : "normal"
    );

  return createRisk({
    id: "crop-heat-risk",

    icon: "🔥",

    severity,

    title:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} में गर्मी का जोखिम`
        : `Heat Risk for ${getText(
            crop.name,
            language
          )}`,

    message:
      getText(
        risk.message,
        language
      ),
  });
}

// =====================================================
// COLD RISK
// =====================================================

function analyzeCold(
  crop,
  stageId,
  flags,
  language
) {
  if (!flags.cold) {
    return null;
  }

  const risk =
    crop.risks?.cold;

  if (!risk) {
    return null;
  }

  const stageSensitive =
    !risk.sensitiveStages ||
    risk.sensitiveStages.includes(
      stageId
    );

  if (!stageSensitive) {
    return null;
  }

  return createRisk({
    id: "crop-cold-risk",

    icon: "🥶",

    severity:
      sensitivityToSeverity(
        crop.sensitivity?.cold,
        flags.veryCold
          ? "extreme"
          : "normal"
      ),

    title:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} में ठंड का जोखिम`
        : `Cold Risk for ${getText(
            crop.name,
            language
          )}`,

    message:
      getText(
        risk.message,
        language
      ),
  });
}

// =====================================================
// HEAVY RAIN / WATERLOGGING RISK
// =====================================================

function analyzeHeavyRain(
  crop,
  flags,
  language
) {
  if (!flags.heavyRainRisk) {
    return null;
  }

  const risk =
    crop.risks?.heavyRain;

  if (!risk) {
    return null;
  }

  return createRisk({
    id: "crop-heavy-rain-risk",

    icon: "🌧️",

    severity:
      sensitivityToSeverity(
        crop.sensitivity
          ?.excessRain,
        "extreme"
      ),

    title:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} के लिए भारी बारिश की चेतावनी`
        : `Heavy Rain Watch for ${getText(
            crop.name,
            language
          )}`,

    message:
      getText(
        risk.message,
        language
      ),
  });
}

// =====================================================
// WIND RISK
// =====================================================

function analyzeWind(
  crop,
  flags,
  language
) {
  if (!flags.windy) {
    return null;
  }

  const risk =
    crop.risks?.wind;

  if (!risk) {
    return null;
  }

  return createRisk({
    id: "crop-wind-risk",

    icon: "💨",

    severity:
      sensitivityToSeverity(
        crop.sensitivity?.wind,
        flags.strongWind
          ? "extreme"
          : "normal"
      ),

    title:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} के लिए हवा की चेतावनी`
        : `Wind Risk for ${getText(
            crop.name,
            language
          )}`,

    message:
      getText(
        risk.message,
        language
      ),
  });
}

// =====================================================
// DROUGHT / WATER-STRESS WATCH
//
// IMPORTANT:
// Weather alone cannot determine soil water status.
// Therefore we deliberately call this a WATCH,
// not a diagnosis.
// =====================================================

function analyzeWaterStress(
  crop,
  stageId,
  flags,
  weather,
  language
) {
  const risk =
    crop.risks?.drought;

  if (!risk) {
    return null;
  }

  const stageSensitive =
    !risk.sensitiveStages ||
    risk.sensitiveStages.includes(
      stageId
    );

  if (!stageSensitive) {
    return null;
  }

  const hourly =
    weather?.hourly || [];

  const nextHours =
    hourly.slice(0, 12);

  const soilMoistureValues =
    nextHours
      .map(
        (hour) =>
          Number(
            hour.soilMoisture
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  const hasSoilMoistureEstimate =
    soilMoistureValues.length > 0;

  const averageEstimatedMoisture =
    hasSoilMoistureEstimate
      ? soilMoistureValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        soilMoistureValues.length
      : null;

  // We intentionally do NOT classify
  // Open-Meteo soil moisture as universally
  // "dry" or "wet" for every soil/crop.
  //
  // It is retained as supporting context.

  const weatherSuggestsStress =
    flags.hot &&
    flags.dryWeather;

  if (!weatherSuggestsStress) {
    return null;
  }

  return createRisk({
    id: "crop-water-stress-watch",

    icon: "💧",

    severity:
      crop.sensitivity?.drought ===
      "high"
        ? "medium"
        : "low",

    title:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} में Water Stress की निगरानी`
        : `Water Stress Watch for ${getText(
            crop.name,
            language
          )}`,

    message:
      language === "hi"
        ? `${getText(
            risk.message,
            language
          )}${
            averageEstimatedMoisture !==
            null
              ? " Weather model में soil-moisture estimate भी उपलब्ध है, लेकिन सिंचाई का निर्णय खेत की वास्तविक नमी देखकर करें।"
              : ""
          }`
        : `${getText(
            risk.message,
            language
          )}${
            averageEstimatedMoisture !==
            null
              ? " A modelled soil-moisture estimate is also available, but irrigation decisions should be based on actual field moisture."
              : ""
          }`,
  });
}

// =====================================================
// WEATHER-RELATED DISEASE WATCH
// =====================================================

function analyzeDiseaseWeatherRisk(
  crop,
  flags,
  language
) {
  const risks = [];

  const diseaseRules =
    crop.diseaseWeatherRisks ||
    [];

  diseaseRules.forEach(
    (rule) => {
      const factors =
        rule.weatherFactors || [];

      const matched =
        factors.every(
          (factor) =>
            Boolean(flags[factor])
        );

      if (!matched) {
        return;
      }

      risks.push(
        createRisk({
          id: rule.id,

          icon: "🦠",

          severity: "medium",

          title:
            getText(
              rule.name,
              language
            ),

          message:
            getText(
              rule.advice,
              language
            ),
        })
      );
    }
  );

  return risks;
}

// =====================================================
// CRITICAL STAGE MESSAGE
// =====================================================

function getCriticalStageMessage(
  crop,
  stageId,
  language
) {
  const critical =
    isCriticalCropStage(
      crop.id,
      stageId
    );

  if (!critical) {
    return null;
  }

  return {
    icon: "🎯",

    title:
      language === "hi"
        ? "संवेदनशील फसल अवस्था"
        : "Sensitive Crop Stage",

    message:
      language === "hi"
        ? `${getText(
            crop.name,
            language
          )} अभी ऐसी अवस्था में है जहाँ मौसम की निगरानी विशेष रूप से महत्वपूर्ण हो सकती है।`
        : `${getText(
            crop.name,
            language
          )} is currently at a stage where weather monitoring may be particularly important.`,
  };
}

// =====================================================
// OVERALL RISK LEVEL
// =====================================================

function calculateOverallRisk(
  risks
) {
  if (
    risks.some(
      (risk) =>
        risk.severity === "high"
    )
  ) {
    return "high";
  }

  if (
    risks.some(
      (risk) =>
        risk.severity === "medium"
    )
  ) {
    return "medium";
  }

  if (risks.length > 0) {
    return "low";
  }

  return "normal";
}

// =====================================================
// FARMER SUMMARY
// =====================================================

function createSummary(
  crop,
  stageId,
  risks,
  language
) {
  const cropName =
    getText(
      crop.name,
      language
    );

  if (risks.length === 0) {
    return language === "hi"
      ? `${cropName} के लिए वर्तमान मौसम में कोई प्रमुख crop-specific weather warning नहीं मिली। फिर भी खेत की वास्तविक स्थिति की निगरानी करते रहें।`
      : `No major crop-specific weather warning was identified for ${cropName} under the current conditions. Continue monitoring actual field conditions.`;
  }

  const highRisks =
    risks.filter(
      (risk) =>
        risk.severity === "high"
    ).length;

  const mediumRisks =
    risks.filter(
      (risk) =>
        risk.severity === "medium"
    ).length;

  if (highRisks > 0) {
    return language === "hi"
      ? `${cropName} के लिए मौसम से जुड़ा महत्वपूर्ण जोखिम मिला है। नीचे दी गई warnings को प्राथमिकता से देखें।`
      : `An important weather-related risk has been identified for ${cropName}. Review the warnings below carefully.`;
  }

  if (mediumRisks > 0) {
    return language === "hi"
      ? `${cropName} के लिए कुछ मौसम संबंधी स्थितियों पर ध्यान देने की जरूरत है।`
      : `Some weather conditions require attention for ${cropName}.`;
  }

  return language === "hi"
    ? `${cropName} के लिए हल्की मौसम निगरानी की सलाह है।`
    : `Minor weather monitoring is advised for ${cropName}.`;
}

// =====================================================
// MAIN CROP WEATHER ENGINE
// =====================================================

export function analyzeCropWeather({
  weather,
  cropId,
  stageId,
  language = "hi",
}) {
  if (
    !weather ||
    !cropId ||
    !stageId
  ) {
    return null;
  }

  const crop =
    getCropWeatherProfile(
      cropId
    );

  if (!crop) {
    return null;
  }

  if (
    !crop.stages.includes(
      stageId
    )
  ) {
    return null;
  }

  const flags =
    getWeatherFlags(
      weather
    );

  const risks = [];

  // ===================================================
  // HEAT
  // ===================================================

  const heatRisk =
    analyzeHeat(
      crop,
      stageId,
      flags,
      language
    );

  if (heatRisk) {
    risks.push(heatRisk);
  }

  // ===================================================
  // COLD
  // ===================================================

  const coldRisk =
    analyzeCold(
      crop,
      stageId,
      flags,
      language
    );

  if (coldRisk) {
    risks.push(coldRisk);
  }

  // ===================================================
  // RAIN
  // ===================================================

  const rainRisk =
    analyzeHeavyRain(
      crop,
      flags,
      language
    );

  if (rainRisk) {
    risks.push(rainRisk);
  }

  // ===================================================
  // WIND
  // ===================================================

  const windRisk =
    analyzeWind(
      crop,
      flags,
      language
    );

  if (windRisk) {
    risks.push(windRisk);
  }

  // ===================================================
  // WATER STRESS
  // ===================================================

  const waterRisk =
    analyzeWaterStress(
      crop,
      stageId,
      flags,
      weather,
      language
    );

  if (waterRisk) {
    risks.push(waterRisk);
  }

  // ===================================================
  // DISEASE WEATHER WATCH
  // ===================================================

  const diseaseRisks =
    analyzeDiseaseWeatherRisk(
      crop,
      flags,
      language
    );

  risks.push(
    ...diseaseRisks
  );

  // ===================================================
  // CRITICAL STAGE
  // ===================================================

  const criticalStage =
    getCriticalStageMessage(
      crop,
      stageId,
      language
    );

  // ===================================================
  // RESULT
  // ===================================================

  const overallRisk =
    calculateOverallRisk(
      risks
    );

  const summary =
    createSummary(
      crop,
      stageId,
      risks,
      language
    );

  return {
    cropId:
      crop.id,

    cropName:
      getText(
        crop.name,
        language
      ),

    cropIcon:
      crop.icon,

    stageId,

    criticalStage,

    overallRisk,

    summary,

    risks,

    weatherContext: {
      temperature:
        flags.temperature,

      humidity:
        flags.humidity,

      windSpeed:
        flags.windSpeed,

      rainProbability:
        flags.rainProbability,

      todayRain:
        flags.todayRain,
    },

    generatedAt:
      new Date().toISOString(),
  };
}
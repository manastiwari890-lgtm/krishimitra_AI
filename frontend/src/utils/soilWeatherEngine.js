// =====================================================
// KRISHIMITRA AI
// SOIL × WEATHER INTELLIGENCE ENGINE
// =====================================================
//
// Combines:
// - Farmer soil observations
// - Optional Soil Health Card / lab values
// - Current weather
//
// IMPORTANT:
// N, P and K are NOT classified as Low/Medium/High
// without units, testing method and reference ranges.
// =====================================================


// =====================================================
// HELPERS
// =====================================================

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


function getWeatherValue(
  weather,
  keys,
  fallback = null
) {
  if (!weather) return fallback;

  for (const key of keys) {
    const value =
      numberOrNull(weather[key]);

    if (value !== null) {
      return value;
    }
  }

  return fallback;
}


// =====================================================
// RISK CREATOR
// =====================================================

function createInsight({
  id,
  type,
  icon,
  severity = "low",
  title,
  message,
  action,
}) {
  return {
    id,
    type,
    icon,
    severity,
    title,
    message,
    action,
  };
}


// =====================================================
// SOIL MOISTURE STATUS
// =====================================================

function getMoistureStatus(
  moisture
) {
  if (moisture === null) {
    return "unknown";
  }

  if (moisture < 25) {
    return "dry";
  }

  if (moisture < 40) {
    return "moderately-dry";
  }

  if (moisture <= 70) {
    return "adequate";
  }

  if (moisture <= 85) {
    return "wet";
  }

  return "very-wet";
}


// =====================================================
// pH STATUS
// =====================================================

function getPhStatus(ph) {
  if (ph === null) {
    return "unknown";
  }

  if (ph < 5.5) {
    return "strongly-acidic";
  }

  if (ph < 6.5) {
    return "slightly-acidic";
  }

  if (ph <= 7.5) {
    return "near-neutral";
  }

  if (ph <= 8.5) {
    return "alkaline";
  }

  return "strongly-alkaline";
}


// =====================================================
// DRY SOIL + HEAT
// =====================================================

function analyzeDryHeat({
  moisture,
  waterBehavior,
  plantCondition,
  temperature,
  language,
}) {
  const moistureDry =
    moisture !== null &&
    moisture < 30;

  const observedDry =
    waterBehavior === "fast";

  const cropDry =
    plantCondition === "dry";

  if (
    temperature === null ||
    temperature < 32 ||
    (!moistureDry &&
      !observedDry &&
      !cropDry)
  ) {
    return null;
  }

  const highRisk =
    temperature >= 38 &&
    (
      moistureDry ||
      cropDry
    );

  return createInsight({
    id: "dry-soil-heat",

    type: "water-stress",

    icon: "🔥",

    severity:
      highRisk
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "गर्मी + मिट्टी सूखने का जोखिम"
        : "Heat + Soil Drying Risk",

    message:
      language === "hi"
        ? `तापमान लगभग ${Math.round(
            temperature
          )}°C है और उपलब्ध soil information मिट्टी या फसल में moisture stress की संभावना दिखाती है।`
        : `Temperature is around ${Math.round(
            temperature
          )}°C and the available soil information indicates possible soil or crop moisture stress.`,

    action:
      language === "hi"
        ? "Soil moisture को field में जाँचें और वास्तविक crop requirement के अनुसार irrigation timing तय करें।"
        : "Check soil moisture in the field and plan irrigation according to the crop's actual water requirement.",
  });
}


// =====================================================
// WET SOIL + RAIN
// =====================================================

function analyzeWetRain({
  moisture,
  waterBehavior,
  precipitation,
  humidity,
  language,
}) {
  const wetMeasured =
    moisture !== null &&
    moisture > 70;

  const slowDrainage =
    waterBehavior === "slow";

  const wetWeather =
    precipitation > 0 ||
    (
      humidity !== null &&
      humidity >= 85
    );

  if (
    (!wetMeasured &&
      !slowDrainage) ||
    !wetWeather
  ) {
    return null;
  }

  const highRisk =
    (
      moisture !== null &&
      moisture > 85
    ) ||
    (
      slowDrainage &&
      precipitation >= 5
    );

  return createInsight({
    id: "wet-soil-rain",

    type: "waterlogging",

    icon: "🌧️",

    severity:
      highRisk
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "गीली मिट्टी + बारिश का जोखिम"
        : "Wet Soil + Rain Risk",

    message:
      language === "hi"
        ? "मिट्टी में पहले से अधिक नमी या धीमी drainage के साथ wet weather अतिरिक्त पानी रुकने का जोखिम बढ़ा सकता है।"
        : "Existing soil wetness or slow drainage combined with wet weather may increase the risk of excess water remaining in the field.",

    action:
      language === "hi"
        ? "अतिरिक्त irrigation से बचें और field drainage तथा पानी के जमाव की जाँच करें।"
        : "Avoid unnecessary irrigation and check field drainage and standing water.",
  });
}


// =====================================================
// LOW MOISTURE + LOW HUMIDITY
// =====================================================

function analyzeDryAir({
  moisture,
  waterBehavior,
  humidity,
  language,
}) {
  if (
    humidity === null ||
    humidity >= 35
  ) {
    return null;
  }

  const drySoil =
    (
      moisture !== null &&
      moisture < 30
    ) ||
    waterBehavior === "fast";

  if (!drySoil) {
    return null;
  }

  return createInsight({
    id: "dry-air-soil",

    type: "moisture-loss",

    icon: "💨",

    severity: "medium",

    title:
      language === "hi"
        ? "तेजी से नमी कम होने की संभावना"
        : "Faster Moisture Loss Possible",

    message:
      language === "hi"
        ? `हवा की humidity लगभग ${Math.round(
            humidity
          )}% है और soil information जल्दी moisture loss की संभावना दिखाती है।`
        : `Air humidity is around ${Math.round(
            humidity
          )}% and the soil information indicates the possibility of faster moisture loss.`,

    action:
      language === "hi"
        ? "मिट्टी की नमी को अधिक नियमित रूप से जाँचें, खासकर गर्म और हवा वाले समय में।"
        : "Check soil moisture more frequently, especially during hot or windy periods.",
  });
}


// =====================================================
// FERTILIZER TIMING + WEATHER
// =====================================================

function analyzeFertilizerTiming({
  precipitation,
  moisture,
  language,
}) {
  const heavyWetCondition =
    precipitation >= 5;

  const saturatedSoil =
    moisture !== null &&
    moisture > 85;

  if (
    !heavyWetCondition &&
    !saturatedSoil
  ) {
    return null;
  }

  return createInsight({
    id: "fertilizer-weather",

    type: "fertilizer-timing",

    icon: "🧪",

    severity:
      heavyWetCondition &&
      saturatedSoil
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "Fertilizer Timing सावधानी"
        : "Fertilizer Timing Caution",

    message:
      language === "hi"
        ? "Wet soil या significant rainfall fertilizer application के लिए उपयुक्त timing को प्रभावित कर सकती है।"
        : "Wet soil or significant rainfall may affect the suitability of fertilizer application timing.",

    action:
      language === "hi"
        ? "Fertilizer की मात्रा अनुमान से न बदलें। Application timing के लिए product instructions, Soil Health Card और स्थानीय कृषि सलाह देखें।"
        : "Do not change fertilizer quantity by guesswork. Use product instructions, Soil Health Card recommendations and local agricultural guidance when deciding application timing.",
  });
}


// =====================================================
// pH + WEATHER CONTEXT
// =====================================================

function analyzePhContext({
  ph,
  language,
}) {
  if (ph === null) {
    return null;
  }

  const status =
    getPhStatus(ph);

  if (
    status === "near-neutral"
  ) {
    return createInsight({
      id: "ph-context",

      type: "soil-ph",

      icon: "🧪",

      severity: "low",

      title:
        language === "hi"
          ? "Soil pH लगभग Neutral"
          : "Soil pH Near Neutral",

      message:
        language === "hi"
          ? `दर्ज किया गया soil pH ${ph} है, जो इस engine की सामान्य neutral range के आसपास है।`
          : `The entered soil pH is ${ph}, which is around the general neutral range used by this engine.`,

      action:
        language === "hi"
          ? "Crop-specific nutrient management के लिए Soil Health Card recommendation को प्राथमिकता दें।"
          : "Prioritize Soil Health Card recommendations for crop-specific nutrient management.",
    });
  }

  const severe =
    status ===
      "strongly-acidic" ||
    status ===
      "strongly-alkaline";

  return createInsight({
    id: "ph-context",

    type: "soil-ph",

    icon: "🧪",

    severity:
      severe
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "Soil pH पर ध्यान दें"
        : "Soil pH Needs Attention",

    message:
      language === "hi"
        ? `दर्ज किया गया soil pH ${ph} है। यह nutrient availability और crop suitability को प्रभावित कर सकता है।`
        : `The entered soil pH is ${ph}. Soil pH can affect nutrient availability and crop suitability.`,

    action:
      language === "hi"
        ? "pH correction की मात्रा अनुमान से न तय करें। Soil Test recommendation या स्थानीय कृषि विशेषज्ञ की crop-specific सलाह लें।"
        : "Do not guess amendment quantities. Follow the soil-test recommendation or locally appropriate crop-specific advice.",
  });
}


// =====================================================
// PLANT CONDITION CONTEXT
// =====================================================

function analyzePlantCondition({
  plantCondition,
  temperature,
  humidity,
  language,
}) {
  if (
    !plantCondition ||
    plantCondition === "healthy"
  ) {
    return null;
  }

  if (
    plantCondition === "yellow"
  ) {
    return createInsight({
      id: "plant-yellow",

      type: "crop-observation",

      icon: "🟡",

      severity: "medium",

      title:
        language === "hi"
          ? "पीले पत्तों की जाँच जरूरी"
          : "Yellow Leaves Need Investigation",

      message:
        language === "hi"
          ? "पीले पत्ते nutrient stress सहित कई कारणों से हो सकते हैं; केवल weather या NPK value से कारण तय नहीं किया जा सकता।"
          : "Yellow leaves can have several causes, including nutrient stress; weather or NPK values alone cannot determine the cause.",

      action:
        language === "hi"
          ? "Crop symptoms, soil report और Disease Detection को साथ में देखें। बिना diagnosis fertilizer मात्रा न बढ़ाएँ।"
          : "Review crop symptoms, the soil report and Disease Detection together. Do not increase fertilizer quantity without diagnosis.",
    });
  }

  if (
    plantCondition === "dry"
  ) {
    return createInsight({
      id: "plant-dry",

      type: "crop-stress",

      icon: "🍂",

      severity:
        temperature !== null &&
        temperature >= 35
          ? "high"
          : "medium",

      title:
        language === "hi"
          ? "फसल में सूखने के लक्षण"
          : "Crop Drying Symptoms",

      message:
        language === "hi"
          ? "Farmer observation में crop drying दर्ज की गई है। Weather और soil moisture इस stress को प्रभावित कर सकते हैं।"
          : "Crop drying was reported by the farmer. Weather and soil moisture may contribute to this stress.",

      action:
        language === "hi"
          ? "Root-zone moisture, irrigation supply और पौधे के symptoms की field inspection करें।"
          : "Inspect root-zone moisture, irrigation availability and plant symptoms in the field.",
    });
  }

  if (
    plantCondition === "weak"
  ) {
    return createInsight({
      id: "plant-weak",

      type: "crop-stress",

      icon: "🥀",

      severity: "medium",

      title:
        language === "hi"
          ? "कमजोर बढ़वार"
          : "Weak Crop Growth",

      message:
        language === "hi"
          ? "कमजोर growth पानी, soil condition, nutrition, disease या अन्य कारणों से हो सकती है।"
          : "Weak growth may result from water, soil condition, nutrition, disease or other factors.",

      action:
        language === "hi"
          ? "Soil report, moisture, crop symptoms और field conditions को साथ में जाँचें।"
          : "Review the soil report, moisture, crop symptoms and field conditions together.",
    });
  }

  return null;
}


// =====================================================
// OVERALL RISK
// =====================================================

function riskScore(severity) {
  switch (severity) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
}


function calculateOverallRisk(
  insights
) {
  if (
    insights.some(
      (item) =>
        item.severity === "high"
    )
  ) {
    return "high";
  }

  if (
    insights.some(
      (item) =>
        item.severity === "medium"
    )
  ) {
    return "medium";
  }

  if (insights.length) {
    return "low";
  }

  return "normal";
}


// =====================================================
// MAIN ENGINE
// =====================================================

export function analyzeSoilWeather({
  soil = {},
  weather = null,
  crop = null,
  language = "hi",
}) {
  const moisture =
    numberOrNull(
      soil.moisture
    );

  const ph =
    numberOrNull(
      soil.ph
    );

  const nitrogen =
    numberOrNull(
      soil.nitrogen
    );

  const phosphorus =
    numberOrNull(
      soil.phosphorus
    );

  const potassium =
    numberOrNull(
      soil.potassium
    );

  const temperature =
    getWeatherValue(
      weather,
      [
        "temperature",
        "temperature_2m",
      ]
    );

  const humidity =
    getWeatherValue(
      weather,
      [
        "humidity",
        "relativeHumidity",
        "relative_humidity_2m",
      ]
    );

  const precipitation =
    getWeatherValue(
      weather,
      [
        "precipitation",
        "rain",
      ],
      0
    );

  const insights = [
    analyzeDryHeat({
      moisture,
      waterBehavior:
        soil.waterBehavior,
      plantCondition:
        soil.plantCondition,
      temperature,
      language,
    }),

    analyzeWetRain({
      moisture,
      waterBehavior:
        soil.waterBehavior,
      precipitation,
      humidity,
      language,
    }),

    analyzeDryAir({
      moisture,
      waterBehavior:
        soil.waterBehavior,
      humidity,
      language,
    }),

    analyzeFertilizerTiming({
      precipitation,
      moisture,
      language,
    }),

    analyzePhContext({
      ph,
      language,
    }),

    analyzePlantCondition({
      plantCondition:
        soil.plantCondition,
      temperature,
      humidity,
      language,
    }),
  ].filter(Boolean);

  insights.sort(
    (a, b) =>
      riskScore(b.severity) -
      riskScore(a.severity)
  );

  const overallRisk =
    calculateOverallRisk(
      insights
    );

  return {
    overallRisk,

    crop,

    soil: {
      nitrogen,
      phosphorus,
      potassium,
      ph,
      moisture,

      moistureStatus:
        getMoistureStatus(
          moisture
        ),

      phStatus:
        getPhStatus(ph),

      waterBehavior:
        soil.waterBehavior ||
        null,

      plantCondition:
        soil.plantCondition ||
        null,

      soilType:
        soil.soilType ||
        soil.soilColor ||
        null,
    },

    weather: {
      temperature,
      humidity,
      precipitation,
    },

    insights,

    highRiskCount:
      insights.filter(
        (item) =>
          item.severity === "high"
      ).length,

    mediumRiskCount:
      insights.filter(
        (item) =>
          item.severity === "medium"
      ).length,

    summary:
      insights.length === 0
        ? language === "hi"
          ? "उपलब्ध soil और weather data में कोई प्रमुख combined risk नहीं मिला।"
          : "No major combined soil-weather risk was identified from the available data."
        : language === "hi"
        ? `${insights.length} soil-weather insight मिले हैं।`
        : `${insights.length} soil-weather insight(s) were identified.`,

    // We intentionally preserve raw NPK values.
    // Classification requires proper report units/reference ranges.
    npkClassificationAvailable:
      false,

    generatedAt:
      new Date().toISOString(),
  };
}
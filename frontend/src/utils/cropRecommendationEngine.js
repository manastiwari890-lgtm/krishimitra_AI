import { cropKnowledgeBase } from "../data/cropKnowledgeBase";

// =====================================================
// KRISHIMITRA AI
// CROP RECOMMENDATION ENGINE
// =====================================================

// =====================================================
// NUMBER CONVERSION
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

// =====================================================
// RANGE SCORING
// =====================================================

function scoreRange(value, range) {
  if (value === null || !range) {
    return {
      score: null,
      status: "unknown",
    };
  }

  if (
    value >= range.idealMin &&
    value <= range.idealMax
  ) {
    return {
      score: 100,
      status: "ideal",
    };
  }

  if (
    value >= range.min &&
    value <= range.max
  ) {
    return {
      score: 70,
      status: "acceptable",
    };
  }

  return {
    score: 25,
    status: "poor",
  };
}

// =====================================================
// SOIL TYPE SCORING
// =====================================================

function scoreSoilType(
  soilType,
  suitableSoils
) {
  if (!soilType) {
    return {
      score: null,
      status: "unknown",
    };
  }

  if (
    !Array.isArray(suitableSoils) ||
    suitableSoils.length === 0
  ) {
    return {
      score: null,
      status: "unknown",
    };
  }

  const normalized =
    String(soilType)
      .trim()
      .toLowerCase();

  const suitable =
    suitableSoils.some((soil) =>
      normalized.includes(
        String(soil).toLowerCase()
      )
    );

  return suitable
    ? {
        score: 100,
        status: "ideal",
      }
    : {
        score: 50,
        status: "less-suitable",
      };
}

// =====================================================
// SEASON SCORING
// =====================================================

function scoreSeason(
  season,
  cropSeasons
) {
  if (!season) {
    return {
      score: null,
      status: "unknown",
    };
  }

  if (
    !Array.isArray(cropSeasons) ||
    cropSeasons.length === 0
  ) {
    return {
      score: null,
      status: "unknown",
    };
  }

  const normalizedSeason =
    String(season)
      .trim()
      .toLowerCase();

  const suitable =
    cropSeasons.some(
      (cropSeason) =>
        String(cropSeason)
          .toLowerCase() ===
        normalizedSeason
    );

  return suitable
    ? {
        score: 100,
        status: "ideal",
      }
    : {
        score: 20,
        status: "poor",
      };
}

// =====================================================
// WEIGHTED SCORE
// =====================================================

function calculateWeightedScore(
  factors
) {
  let totalScore = 0;
  let totalWeight = 0;

  factors.forEach((factor) => {
    if (
      factor.score !== null &&
      factor.score !== undefined
    ) {
      totalScore +=
        factor.score *
        factor.weight;

      totalWeight +=
        factor.weight;
    }
  });

  if (totalWeight === 0) {
    return null;
  }

  return Math.round(
    totalScore / totalWeight
  );
}

// =====================================================
// SUITABILITY LABEL
// =====================================================

function getSuitability(score) {
  if (score === null) {
    return "unknown";
  }

  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 50) {
    return "moderate";
  }

  return "poor";
}

// =====================================================
// LIVE WEATHER CONTEXT
// =====================================================

function analyzeLiveWeather({
  humidity,
  precipitation,
  rain,
}) {
  const observations = [];

  if (
    humidity !== null &&
    humidity >= 85
  ) {
    observations.push({
      type: "high-humidity",
      severity: "medium",
    });
  }

  if (
    precipitation !== null &&
    precipitation >= 5
  ) {
    observations.push({
      type: "active-precipitation",
      severity: "medium",
    });
  }

  if (
    rain !== null &&
    rain >= 10
  ) {
    observations.push({
      type: "heavy-rain",
      severity: "high",
    });
  }

  return observations;
}

// =====================================================
// BUILD POSITIVE REASONS
// =====================================================

function buildReasons({
  crop,
  temperatureResult,
  phResult,
  moistureResult,
  soilResult,
  seasonResult,
  humidity,
  precipitation,
  language,
}) {
  const reasons = [];

  if (
    temperatureResult.status ===
    "ideal"
  ) {
    reasons.push(
      language === "hi"
        ? "मौजूदा तापमान इस फसल की ideal range में है।"
        : "Current temperature is within the crop's ideal range."
    );
  }

  if (phResult.status === "ideal") {
    reasons.push(
      language === "hi"
        ? "मिट्टी का pH इस फसल के लिए अनुकूल है।"
        : "Soil pH is favorable for this crop."
    );
  }

  if (
    moistureResult.status ===
    "ideal"
  ) {
    reasons.push(
      language === "hi"
        ? "मिट्टी की नमी इस फसल की आवश्यकता के अनुकूल है।"
        : "Soil moisture matches this crop's preferred range."
    );
  }

  if (
    soilResult.status === "ideal"
  ) {
    reasons.push(
      language === "hi"
        ? "मिट्टी का प्रकार इस फसल के लिए उपयुक्त है।"
        : "The soil type is suitable for this crop."
    );
  }

  if (
    seasonResult.status ===
    "ideal"
  ) {
    reasons.push(
      language === "hi"
        ? "चुना गया season इस फसल के लिए उपयुक्त है।"
        : "The selected season is suitable for this crop."
    );
  }

  if (
    humidity !== null &&
    humidity >= 40 &&
    humidity <= 80
  ) {
    reasons.push(
      language === "hi"
        ? "वर्तमान humidity अत्यधिक नहीं है।"
        : "Current humidity is not at an extreme level."
    );
  }

  if (
    precipitation !== null &&
    precipitation === 0
  ) {
    reasons.push(
      language === "hi"
        ? "इस समय सक्रिय वर्षा दर्ज नहीं हुई है।"
        : "No active precipitation is currently recorded."
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      language === "hi"
        ? `${crop.name.hi} के लिए उपलब्ध data में कोई strong ideal match नहीं मिला।`
        : `No strong ideal match was identified for ${crop.name.en} from the available data.`
    );
  }

  return reasons;
}

// =====================================================
// BUILD RISKS
// =====================================================

function buildRisks({
  crop,
  temperatureResult,
  phResult,
  moistureResult,
  soilResult,
  seasonResult,
  humidity,
  precipitation,
  rain,
  language,
}) {
  const risks = [];

  if (
    temperatureResult.status ===
    "poor"
  ) {
    risks.push(
      language === "hi"
        ? "तापमान इस फसल की उपयुक्त range से बाहर है।"
        : "Temperature is outside the crop's preferred range."
    );
  }

  if (phResult.status === "poor") {
    risks.push(
      language === "hi"
        ? "मिट्टी का pH इस फसल की उपयुक्त range से बाहर है।"
        : "Soil pH is outside the crop's suitable range."
    );
  }

  if (
    moistureResult.status ===
    "poor"
  ) {
    risks.push(
      language === "hi"
        ? "मौजूदा soil moisture इस फसल की आवश्यकता से मेल नहीं खाती।"
        : "Current soil moisture does not match the crop requirement."
    );
  }

  if (
    soilResult.status ===
    "less-suitable"
  ) {
    risks.push(
      language === "hi"
        ? "मिट्टी का प्रकार इस फसल की preferred soil list में नहीं है।"
        : "The soil type is not among this crop's preferred soils."
    );
  }

  if (
    seasonResult.status === "poor"
  ) {
    risks.push(
      language === "hi"
        ? "चुना गया season इस फसल का मुख्य growing season नहीं है।"
        : "The selected season is not a primary growing season for this crop."
    );
  }

  // ===================================================
  // HUMIDITY RISK
  // ===================================================

  if (
    humidity !== null &&
    humidity >= 85
  ) {
    risks.push(
      language === "hi"
        ? "बहुत अधिक humidity fungal disease का जोखिम बढ़ा सकती है।"
        : "Very high humidity may increase fungal disease risk."
    );
  }

  // ===================================================
  // ACTIVE PRECIPITATION
  // ===================================================

  if (
    precipitation !== null &&
    precipitation >= 5
  ) {
    risks.push(
      language === "hi"
        ? "वर्तमान precipitation अधिक है। सिंचाई या fertilizer application से पहले मौसम देखें।"
        : "Current precipitation is elevated. Check conditions before irrigation or fertilizer application."
    );
  }

  // ===================================================
  // HEAVY RAIN
  // ===================================================

  if (
    rain !== null &&
    rain >= 10
  ) {
    risks.push(
      language === "hi"
        ? "भारी वर्षा की स्थिति में waterlogging और nutrient loss का जोखिम हो सकता है।"
        : "Heavy rain may increase waterlogging and nutrient-loss risk."
    );
  }

  // ===================================================
  // WATER REQUIREMENT CONTEXT
  // ===================================================

  if (
    crop.waterRequirement ===
      "low" &&
    moistureResult.status ===
      "poor" &&
    rain !== null &&
    rain > 0
  ) {
    risks.push(
      language === "hi"
        ? "यह कम पानी वाली फसल है; अधिक soil moisture और बारिश drainage समस्या पैदा कर सकती है।"
        : "This is a low-water crop; excessive soil moisture combined with rain may create drainage problems."
    );
  }

  return risks;
}

// =====================================================
// FARM ACTIONS
// =====================================================

function buildActions({
  crop,
  temperatureResult,
  phResult,
  moistureResult,
  humidity,
  precipitation,
  rain,
  language,
}) {
  const actions = [];

  if (
    moistureResult.status === "poor"
  ) {
    actions.push(
      language === "hi"
        ? "बुवाई से पहले soil moisture की स्थिति जाँचें और आवश्यकता के अनुसार irrigation/drainage plan बनाएं।"
        : "Check soil moisture before sowing and plan irrigation or drainage accordingly."
    );
  }

  if (phResult.status === "poor") {
    actions.push(
      language === "hi"
        ? "फसल लगाने से पहले soil test के आधार पर pH correction की सलाह लें।"
        : "Consider soil-test-based pH correction before planting."
    );
  }

  if (
    temperatureResult.status ===
    "poor"
  ) {
    actions.push(
      language === "hi"
        ? "तापमान अनुकूल होने तक sowing timing पर दोबारा विचार करें।"
        : "Reconsider sowing timing until temperature conditions become more suitable."
    );
  }

  if (
    humidity !== null &&
    humidity >= 85
  ) {
    actions.push(
      language === "hi"
        ? "फसल में fungal symptoms की नियमित निगरानी करें।"
        : "Monitor the crop regularly for fungal symptoms."
    );
  }

  if (
    (precipitation !== null &&
      precipitation >= 5) ||
    (rain !== null &&
      rain >= 10)
  ) {
    actions.push(
      language === "hi"
        ? "बारिश के दौरान अनावश्यक irrigation और fertilizer application से बचें।"
        : "Avoid unnecessary irrigation and fertilizer application during significant rain."
    );
  }

  if (
    crop.waterRequirement ===
    "high"
  ) {
    actions.push(
      language === "hi"
        ? "इस फसल के लिए पर्याप्त और नियमित water availability सुनिश्चित करें।"
        : "Ensure adequate and reliable water availability for this crop."
    );
  }

  if (actions.length === 0) {
    actions.push(
      language === "hi"
        ? "वर्तमान conditions अनुकूल दिख रही हैं। स्थानीय कृषि सलाह के अनुसार sowing plan करें।"
        : "Current conditions appear suitable. Plan sowing according to local agricultural guidance."
    );
  }

  return actions;
}

// =====================================================
// MAIN CROP RECOMMENDATION ENGINE
// =====================================================

export function recommendCrops({
  soil = {},
  weather = {},
  season = null,
  language = "hi",
  limit = 5,
}) {
  // ===================================================
  // NORMALIZE INPUT
  // ===================================================

  const temperature =
    numberOrNull(
      weather.temperature
    );

  const humidity =
    numberOrNull(
      weather.humidity
    );

  const precipitation =
    numberOrNull(
      weather.precipitation
    );

  const rain =
    numberOrNull(
      weather.rain
    );

  const ph =
    numberOrNull(
      soil.ph
    );

  const moisture =
    numberOrNull(
      soil.moisture
    );

  const soilType =
    soil.soilType ||
    soil.soilColor ||
    null;

  // ===================================================
  // LIVE WEATHER OBSERVATIONS
  // ===================================================

  const weatherObservations =
    analyzeLiveWeather({
      humidity,
      precipitation,
      rain,
    });

  // ===================================================
  // ANALYZE EVERY CROP
  // ===================================================

  const recommendations =
    cropKnowledgeBase.map(
      (crop) => {

        // TEMPERATURE

        const temperatureResult =
          scoreRange(
            temperature,
            crop.temperature
          );

        // SOIL PH

        const phResult =
          scoreRange(
            ph,
            crop.soilPh
          );

        // SOIL MOISTURE

        const moistureResult =
          scoreRange(
            moisture,
            crop.moisture
          );

        // SOIL TYPE

        const soilResult =
          scoreSoilType(
            soilType,
            crop.suitableSoils
          );

        // SEASON

        const seasonResult =
          scoreSeason(
            season,
            crop.seasons
          );

        // =================================================
        // WEIGHTED AGRONOMIC SCORE
        // =================================================

        const factors = [
          {
            name: "temperature",
            score:
              temperatureResult.score,
            weight: 0.25,
          },

          {
            name: "ph",
            score:
              phResult.score,
            weight: 0.25,
          },

          {
            name: "moisture",
            score:
              moistureResult.score,
            weight: 0.2,
          },

          {
            name: "soil",
            score:
              soilResult.score,
            weight: 0.15,
          },

          {
            name: "season",
            score:
              seasonResult.score,
            weight: 0.15,
          },
        ];

        const score =
          calculateWeightedScore(
            factors
          );

        // =================================================
        // EXPLANATIONS
        // =================================================

        const reasons =
          buildReasons({
            crop,
            temperatureResult,
            phResult,
            moistureResult,
            soilResult,
            seasonResult,
            humidity,
            precipitation,
            language,
          });

        const risks =
          buildRisks({
            crop,
            temperatureResult,
            phResult,
            moistureResult,
            soilResult,
            seasonResult,
            humidity,
            precipitation,
            rain,
            language,
          });

        const actions =
          buildActions({
            crop,
            temperatureResult,
            phResult,
            moistureResult,
            humidity,
            precipitation,
            rain,
            language,
          });

        // =================================================
        // RESULT FOR THIS CROP
        // =================================================

        return {
          id: crop.id,

          name:
            language === "hi"
              ? crop.name.hi
              : crop.name.en,

          englishName:
            crop.name.en,

          icon:
            crop.icon,

          category:
            crop.category,

          score,

          suitability:
            getSuitability(score),

          waterRequirement:
            crop.waterRequirement,

          seasons:
            crop.seasons,

          factors: {
            temperature:
              temperatureResult,

            ph:
              phResult,

            moisture:
              moistureResult,

            soil:
              soilResult,

            season:
              seasonResult,
          },

          liveWeather: {
            humidity,
            precipitation,
            rain,
          },

          reasons,

          risks,

          actions,
        };
      }
    );

  // ===================================================
  // RANK BEST → WORST
  // ===================================================

  recommendations.sort(
    (a, b) =>
      (b.score ?? 0) -
      (a.score ?? 0)
  );

  // ===================================================
  // FINAL RESPONSE
  // ===================================================

  return {
    recommendations:
      recommendations.slice(
        0,
        limit
      ),

    bestCrop:
      recommendations[0] ||
      null,

    analyzedCrops:
      recommendations.length,

    weatherObservations,

    input: {
      temperature,
      humidity,
      precipitation,
      rain,
      ph,
      moisture,
      soilType,
      season,
    },

    generatedAt:
      new Date().toISOString(),
  };
}
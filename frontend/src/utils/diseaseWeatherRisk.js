// =====================================================
// KRISHIMITRA AI
// DISEASE WEATHER RISK ENGINE
// =====================================================
//
// This module does NOT diagnose crop disease.
//
// Disease diagnosis is handled by the ML model.
// This engine only evaluates whether CURRENT weather
// contains conditions that may favor the detected disease.
//
// IMPORTANT:
// The score is an internal heuristic.
// It is NOT a disease probability.
// =====================================================


// =====================================================
// HELPERS
// =====================================================

function numberOrNull(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function inRange(value, min, max) {
  if (value === null) {
    return false;
  }

  return value >= min && value <= max;
}


// =====================================================
// DISEASE WEATHER KNOWLEDGE BASE
// =====================================================

const diseaseWeatherRules = {

  // ===================================================
  // CORN
  // ===================================================

  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    label: "Gray Leaf Spot",
    crop: "Corn",

    temperature: {
      min: 20,
      max: 30,
      weight: 30,
    },

    humidity: {
      min: 95,
      weight: 40,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Monitor lower and middle leaves for expanding gray lesions.",
      "Improve airflow where practical and avoid unnecessary prolonged leaf wetness.",
      "Continue scouting during extended humid or wet periods.",
    ],
  },


  "Corn_(maize)___Common_rust_": {
    label: "Common Rust",
    crop: "Corn",

    temperature: {
      min: 15.5,
      max: 24.5,
      weight: 35,
    },

    humidity: {
      min: 95,
      weight: 35,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Inspect leaves for rust-colored pustules.",
      "Continue monitoring during cool and humid weather.",
      "Watch susceptible crops closely if prolonged leaf wetness occurs.",
    ],
  },


  "Corn_(maize)___Northern_Leaf_Blight": {
    label: "Northern Leaf Blight",
    crop: "Corn",

    temperature: {
      min: 18,
      max: 27,
      weight: 35,
    },

    humidity: {
      min: 85,
      weight: 30,
    },

    moisture: {
      weight: 35,
    },

    actions: [
      "Scout leaves for long gray-green or tan lesions.",
      "Monitor the crop closely during prolonged moist weather.",
      "Reduce unnecessary leaf wetness where irrigation practices allow.",
    ],
  },


  // ===================================================
  // BELL PEPPER
  // ===================================================

  "Pepper,_bell___Bacterial_spot": {
    label: "Bacterial Spot",
    crop: "Bell Pepper",

    temperature: {
      min: 24,
      max: 30,
      weight: 30,
    },

    humidity: {
      min: 85,
      weight: 30,
    },

    moisture: {
      weight: 40,
    },

    actions: [
      "Avoid working with plants while foliage is wet.",
      "Avoid overhead irrigation where possible.",
      "Monitor nearby leaves and fruit for new bacterial spot symptoms.",
    ],
  },


  // ===================================================
  // POTATO
  // ===================================================

  "Potato___Early_blight": {
    label: "Early Blight",
    crop: "Potato",

    temperature: {
      min: 15,
      max: 30,
      weight: 30,
    },

    humidity: {
      min: 90,
      weight: 40,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Monitor older leaves for expanding lesions.",
      "Avoid unnecessary prolonged leaf wetness.",
      "Continue scouting after rain, heavy dew or humid periods.",
    ],
  },


  "Potato___Late_blight": {
    label: "Late Blight",
    crop: "Potato",

    temperature: {
      min: 15.5,
      max: 21.5,
      weight: 35,
    },

    humidity: {
      min: 85,
      weight: 35,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Inspect nearby plants closely for rapidly developing symptoms.",
      "Keep foliage as dry as practical.",
      "Monitor the field closely during cool, damp periods.",
    ],
  },


  // ===================================================
  // TOMATO
  // ===================================================

  "Tomato___Bacterial_spot": {
    label: "Bacterial Spot",
    crop: "Tomato",

    temperature: {
      min: 24,
      max: 30,
      weight: 30,
    },

    humidity: {
      min: 85,
      weight: 30,
    },

    moisture: {
      weight: 40,
    },

    actions: [
      "Avoid handling plants while leaves are wet.",
      "Use irrigation practices that keep foliage as dry as possible.",
      "Monitor nearby plants for new spots after warm, wet weather.",
    ],
  },


  "Tomato___Early_blight": {
    label: "Early Blight",
    crop: "Tomato",

    temperature: {
      min: 15,
      max: 30,
      weight: 30,
    },

    humidity: {
      min: 90,
      weight: 40,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Inspect lower leaves for expanding target-like lesions.",
      "Keep foliage dry where possible.",
      "Continue scouting after humid periods, rainfall or heavy dew.",
    ],
  },


  "Tomato___Late_blight": {
    label: "Late Blight",
    crop: "Tomato",

    temperature: {
      min: 15.5,
      max: 21.5,
      weight: 35,
    },

    humidity: {
      min: 85,
      weight: 35,
    },

    moisture: {
      weight: 30,
    },

    actions: [
      "Inspect nearby plants closely for rapidly developing symptoms.",
      "Avoid unnecessary overhead irrigation.",
      "Monitor affected areas closely during cool and damp weather.",
    ],
  },


  "Tomato___Leaf_Mold": {
    label: "Leaf Mold",
    crop: "Tomato",

    temperature: {
      min: 20,
      max: 27,
      weight: 30,
    },

    humidity: {
      min: 85,
      weight: 50,
    },

    moisture: {
      weight: 20,
    },

    actions: [
      "Improve ventilation and airflow around plants where possible.",
      "Reduce prolonged high humidity around foliage.",
      "Avoid wetting leaves unnecessarily.",
    ],
  },


  "Tomato___Septoria_leaf_spot": {
    label: "Septoria Leaf Spot",
    crop: "Tomato",

    temperature: {
      min: 20,
      max: 25,
      weight: 30,
    },

    humidity: {
      min: 85,
      weight: 35,
    },

    moisture: {
      weight: 35,
    },

    actions: [
      "Inspect lower leaves for additional small circular spots.",
      "Keep foliage dry and improve airflow where possible.",
      "Continue scouting after wet or highly humid periods.",
    ],
  },


  // ===================================================
  // TWO-SPOTTED SPIDER MITE
  // ===================================================

  "Tomato___Spider_mites Two-spotted_spider_mite": {
    label: "Two-Spotted Spider Mite",
    crop: "Tomato",

    dryWeather: true,

    temperature: {
      min: 27,
      max: 45,
      weight: 50,
    },

    humidityMaximum: {
      max: 60,
      weight: 30,
    },

    noRain: {
      weight: 20,
    },

    actions: [
      "Inspect the undersides of leaves for mites, stippling and webbing.",
      "Watch plants closely during hot and dry periods.",
      "Avoid allowing plants to become severely water-stressed.",
    ],
  },
};


// =====================================================
// MAIN WEATHER RISK ANALYSIS
// =====================================================

export function analyzeDiseaseWeatherRisk({
  className,
  disease,
  weather,
}) {

  // ---------------------------------------------------
  // WEATHER VALIDATION
  // ---------------------------------------------------

  if (!weather) {
    return {
      supported: false,
      level: "unknown",
      score: null,
      reasons: [],
      actions: [],
      message: "Current weather data is unavailable.",
    };
  }


  // ---------------------------------------------------
  // MODEL CLASS VALIDATION
  // ---------------------------------------------------

  if (!className) {
    return {
      supported: false,
      level: "unknown",
      score: null,
      reasons: [],
      actions: [],
      message: "Disease class information is unavailable.",
    };
  }


  // ---------------------------------------------------
  // HEALTHY CROPS
  // ---------------------------------------------------

  if (className.toLowerCase().includes("healthy")) {
    return {
      supported: false,
      healthy: true,
      level: "unknown",
      score: null,
      reasons: [],
      actions: [],
    };
  }


  // ---------------------------------------------------
  // FIND EXACT MODEL CLASS RULE
  // ---------------------------------------------------

  const rule = diseaseWeatherRules[className];

  if (!rule) {
    return {
      supported: false,

      level: "unknown",

      score: null,

      disease: disease || null,

      className,

      reasons: [],

      actions: [],

      message:
        "Weather-specific risk rules are not yet available for this condition.",
    };
  }


  // ===================================================
  // NORMALIZE WEATHER
  // ===================================================

  const temperature = numberOrNull(
    weather.temperature
  );

  const humidity = numberOrNull(
    weather.humidity
  );

  const precipitation = numberOrNull(
    weather.precipitation
  );

  const rain = numberOrNull(
    weather.rain
  );


  // ===================================================
  // INITIAL SCORE
  // ===================================================

  let score = 0;

  const reasons = [];


  // ===================================================
  // HOT / DRY WEATHER LOGIC
  // TWO-SPOTTED SPIDER MITE
  // ===================================================

  if (rule.dryWeather) {

    // TEMPERATURE

    if (
      rule.temperature &&
      inRange(
        temperature,
        rule.temperature.min,
        rule.temperature.max
      )
    ) {
      score += rule.temperature.weight;

      reasons.push(
        `Current temperature (${temperature}°C) is warm enough to favor spider mite activity.`
      );
    }


    // LOW HUMIDITY

    if (
      rule.humidityMaximum &&
      humidity !== null &&
      humidity <= rule.humidityMaximum.max
    ) {
      score += rule.humidityMaximum.weight;

      reasons.push(
        `Current humidity (${humidity}%) indicates relatively dry conditions that may favor spider mites.`
      );
    }


    // NO RAIN

    const dryNow =
      (rain === null || rain <= 0) &&
      (precipitation === null || precipitation <= 0);

    if (
      rule.noRain &&
      dryNow
    ) {
      score += rule.noRain.weight;

      reasons.push(
        "No current rain or precipitation is being reported, which supports dry-weather conditions."
      );
    }

  } else {

    // =================================================
    // TEMPERATURE
    // =================================================

    if (
      rule.temperature &&
      inRange(
        temperature,
        rule.temperature.min,
        rule.temperature.max
      )
    ) {
      score += rule.temperature.weight;

      reasons.push(
        `Current temperature (${temperature}°C) is within a range that may favor ${rule.label}.`
      );
    }


    // =================================================
    // HUMIDITY
    // =================================================

    if (
      rule.humidity &&
      humidity !== null &&
      humidity >= rule.humidity.min
    ) {
      score += rule.humidity.weight;

      reasons.push(
        `High humidity (${humidity}%) may favor ${rule.label} development.`
      );
    }


    // =================================================
    // RAIN / PRECIPITATION
    // =================================================

    const wetWeather =
      (rain !== null && rain > 0) ||
      (precipitation !== null && precipitation > 0);

    if (
      rule.moisture &&
      wetWeather
    ) {
      score += rule.moisture.weight;

      reasons.push(
        "Current rain or precipitation may increase leaf wetness and disease pressure."
      );
    }
  }


  // ===================================================
  // KEEP SCORE WITHIN 0–100
  // ===================================================

  score = Math.max(
    0,
    Math.min(100, score)
  );


  // ===================================================
  // RISK LEVEL
  // ===================================================

  let level = "low";

  if (score >= 70) {
    level = "high";
  } else if (score >= 35) {
    level = "moderate";
  }


  // ===================================================
  // FARMER ACTIONS
  // ===================================================

  let actions = [
    ...(rule.actions || [])
  ];


  // For low weather support, avoid unnecessarily
  // alarming the farmer.

  if (level === "low") {
    actions = [
      "Continue regular crop monitoring.",
      "Weather conditions can change quickly, so continue watching visible symptoms.",
    ];
  }


  // ===================================================
  // FINAL RESULT
  // ===================================================

  return {
    supported: true,

    disease: rule.label,

    crop: rule.crop,

    className,

    level,

    score,

    reasons,

    actions,

    weather: {
      temperature,
      humidity,
      precipitation,
      rain,
    },

    disclaimer:
      "This weather rating is a decision-support indicator and is not a disease probability or diagnosis.",
  };
}
// =====================================================
// KRISHIMITRA AI
// SMART SOWING & HARVEST INTELLIGENCE ENGINE
// =====================================================
//
// PURPOSE:
// Analyse upcoming weather to identify potentially
// useful sowing and harvesting weather windows.
//
// IMPORTANT:
// Weather alone cannot decide whether a farmer should
// sow or harvest. Crop variety, soil moisture, maturity,
// local season and field conditions also matter.
// =====================================================


// =====================================================
// HELPERS
// =====================================================

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function getRainProbability(hour) {
  return safeNumber(
    hour?.rainProbability ??
      hour?.precipitationProbability
  );
}


function getRain(hour) {
  return safeNumber(
    hour?.rain ??
      hour?.precipitation
  );
}


function getTemperature(hour) {
  return safeNumber(
    hour?.temperature
  );
}


function getWind(hour) {
  return safeNumber(
    hour?.windSpeed ??
      hour?.wind_speed
  );
}


// =====================================================
// GET UPCOMING HOURS
// =====================================================

function getUpcomingHours(
  weather,
  limit = 72
) {
  if (!weather?.hourly?.length) {
    return [];
  }

  const now =
    Date.now() -
    60 * 60 * 1000;

  return weather.hourly
    .filter((hour) => {
      const time =
        new Date(
          hour.time
        ).getTime();

      return (
        Number.isFinite(time) &&
        time >= now
      );
    })
    .slice(0, limit);
}


// =====================================================
// SOWING WEATHER SCORE
// =====================================================
//
// This evaluates WEATHER suitability.
//
// It deliberately does not claim that the field is
// ready for sowing because actual soil moisture,
// seedbed condition and local sowing recommendations
// still need to be checked.
// =====================================================

function calculateSowingScore(hour) {
  const rain =
    getRain(hour);

  const rainProbability =
    getRainProbability(hour);

  const temperature =
    getTemperature(hour);

  const wind =
    getWind(hour);

  let score = 100;

  // -----------------------------------------------
  // ACTIVE RAIN
  // -----------------------------------------------

  if (rain >= 10) {
    score -= 60;
  } else if (rain >= 3) {
    score -= 30;
  } else if (rain > 0) {
    score -= 10;
  }

  // -----------------------------------------------
  // HIGH RAIN PROBABILITY
  // -----------------------------------------------

  if (rainProbability >= 80) {
    score -= 40;
  } else if (
    rainProbability >= 60
  ) {
    score -= 25;
  }

  // -----------------------------------------------
  // TEMPERATURE EXTREMES
  //
  // Broad weather-safety filters only.
  // Crop-specific agronomic thresholds can be added
  // through crop profiles later.
  // -----------------------------------------------

  if (
    temperature >= 40 ||
    temperature <= 5
  ) {
    score -= 45;
  } else if (
    temperature >= 36 ||
    temperature <= 10
  ) {
    score -= 20;
  }

  // -----------------------------------------------
  // STRONG WIND
  // -----------------------------------------------

  if (wind >= 35) {
    score -= 35;
  } else if (
    wind >= 25
  ) {
    score -= 15;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}


// =====================================================
// HARVEST WEATHER SCORE
// =====================================================

function calculateHarvestScore(hour) {
  const rain =
    getRain(hour);

  const rainProbability =
    getRainProbability(hour);

  const wind =
    getWind(hour);

  const temperature =
    getTemperature(hour);

  let score = 100;

  // Rain is especially undesirable
  // during harvesting operations.

  if (rain >= 5) {
    score -= 75;
  } else if (rain > 0) {
    score -= 45;
  }

  if (rainProbability >= 70) {
    score -= 50;
  } else if (
    rainProbability >= 40
  ) {
    score -= 25;
  }

  if (wind >= 35) {
    score -= 35;
  } else if (
    wind >= 25
  ) {
    score -= 15;
  }

  if (temperature >= 40) {
    score -= 20;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}


// =====================================================
// FIND CONSECUTIVE WEATHER WINDOW
// =====================================================

function findBestWindow({
  hours,
  scoreFunction,
  minimumScore,
  minimumHours,
}) {
  const scored =
    hours.map((hour) => ({
      ...hour,

      suitabilityScore:
        scoreFunction(hour),
    }));

  const windows = [];

  let current = [];

  scored.forEach((hour) => {
    if (
      hour.suitabilityScore >=
      minimumScore
    ) {
      current.push(hour);
    } else {
      if (
        current.length >=
        minimumHours
      ) {
        windows.push(current);
      }

      current = [];
    }
  });

  if (
    current.length >=
    minimumHours
  ) {
    windows.push(current);
  }

  if (!windows.length) {
    return null;
  }

  const ranked =
    windows.map((window) => {
      const average =
        window.reduce(
          (total, hour) =>
            total +
            hour.suitabilityScore,
          0
        ) /
        window.length;

      return {
        hours: window,

        score:
          Math.round(average),
      };
    });

  ranked.sort(
    (a, b) =>
      b.score - a.score
  );

  const best =
    ranked[0];

  return {
    start:
      best.hours[0].time,

    end:
      best.hours[
        best.hours.length - 1
      ].time,

    durationHours:
      best.hours.length,

    score:
      best.score,
  };
}


// =====================================================
// RAIN ANALYSIS
// =====================================================

function analyzeRain(hours) {
  const totalRain =
    hours.reduce(
      (total, hour) =>
        total +
        getRain(hour),
      0
    );

  const highestProbability =
    Math.max(
      0,
      ...hours.map(
        getRainProbability
      )
    );

  const firstRainHour =
    hours.find(
      (hour) =>
        getRain(hour) > 0 ||
        getRainProbability(hour) >=
          60
    );

  return {
    expected:
      Boolean(firstRainHour),

    totalRain:
      Number(
        totalRain.toFixed(1)
      ),

    highestProbability,

    firstRainTime:
      firstRainHour?.time ||
      null,
  };
}


// =====================================================
// STATUS
// =====================================================

function getStatus(window) {
  if (!window) {
    return "avoid";
  }

  if (window.score >= 85) {
    return "excellent";
  }

  if (window.score >= 70) {
    return "good";
  }

  return "caution";
}


// =====================================================
// MAIN ENGINE
// =====================================================

export function analyzeSowingHarvest({
  weather,
  cropIntelligence = null,
  selectedStage = null,
  language = "hi",
}) {
  if (!weather) {
    return null;
  }

  const hours =
    getUpcomingHours(
      weather,
      72
    );

  if (!hours.length) {
    return null;
  }

  // ===================================================
  // WEATHER WINDOWS
  // ===================================================

  const sowingWindow =
    findBestWindow({
      hours,

      scoreFunction:
        calculateSowingScore,

      minimumScore: 70,

      minimumHours: 3,
    });

  const harvestWindow =
    findBestWindow({
      hours,

      scoreFunction:
        calculateHarvestScore,

      minimumScore: 75,

      minimumHours: 4,
    });

  // ===================================================
  // WEATHER OUTLOOK
  // ===================================================

  const rain =
    analyzeRain(hours);

  // ===================================================
  // CROP INFORMATION
  // ===================================================

  const cropName =
    cropIntelligence
      ?.cropName || null;

  // ===================================================
  // STAGE CONTEXT
  // ===================================================

  const sowingStage =
    selectedStage ===
      "establishment";

  const harvestStage =
    selectedStage ===
      "maturity";

  // ===================================================
  // SOWING MESSAGE
  // ===================================================

  let sowingMessage;

  if (!sowingStage) {
    sowingMessage =
      language === "hi"
        ? `${cropName || "चुनी गई फसल"} अभी establishment stage में नहीं है। इसलिए sowing window केवल weather information के रूप में दिखाई जा रही है।`
        : `${cropName || "The selected crop"} is not currently in the establishment stage, so the sowing window is shown for weather information only.`;
  } else if (sowingWindow) {
    sowingMessage =
      language === "hi"
        ? "मौसम के आधार पर sowing के लिए संभावित अनुकूल समय मिला है। बुवाई से पहले मिट्टी की वास्तविक नमी, seedbed condition और स्थानीय sowing recommendation भी जाँचें।"
        : "A potentially suitable weather window for sowing was found. Check actual soil moisture, seedbed condition and local sowing recommendations before sowing.";
  } else {
    sowingMessage =
      language === "hi"
        ? "अगले forecast period में sowing के लिए पर्याप्त अनुकूल weather window नहीं मिला।"
        : "No sufficiently suitable sowing weather window was found in the upcoming forecast period.";
  }

  // ===================================================
  // HARVEST MESSAGE
  // ===================================================

  let harvestMessage;

  if (!harvestStage) {
    harvestMessage =
      language === "hi"
        ? `${cropName || "चुनी गई फसल"} अभी maturity stage में नहीं है। Harvest recommendation crop maturity की पुष्टि के बाद ही उपयोग करें।`
        : `${cropName || "The selected crop"} is not currently in the maturity stage. Use harvest recommendations only after confirming crop maturity.`;
  } else if (harvestWindow) {
    harvestMessage =
      language === "hi"
        ? "Weather forecast में harvesting के लिए संभावित dry window मिला है। वास्तविक crop maturity और field condition की पुष्टि करें।"
        : "A potentially useful dry harvesting window was found. Confirm actual crop maturity and field conditions before harvesting.";
  } else {
    harvestMessage =
      language === "hi"
        ? "Forecast में harvesting के लिए पर्याप्त अच्छा dry-weather window नहीं मिला।"
        : "No sufficiently good dry-weather harvesting window was found in the forecast.";
  }

  // ===================================================
  // RESULT
  // ===================================================

  return {
    periodHours: 72,

    cropName,

    selectedStage,

    sowing: {
      relevant:
        sowingStage,

      status:
        getStatus(
          sowingWindow
        ),

      window:
        sowingWindow,

      message:
        sowingMessage,
    },

    harvest: {
      relevant:
        harvestStage,

      status:
        getStatus(
          harvestWindow
        ),

      window:
        harvestWindow,

      message:
        harvestMessage,
    },

    rain,

    summary:
      language === "hi"
        ? "KrishiMitra ने अगले 72 घंटों के forecast का sowing और harvesting weather suitability के लिए विश्लेषण किया है।"
        : "KrishiMitra analysed the next 72 hours for sowing and harvesting weather suitability.",

    generatedAt:
      new Date().toISOString(),
  };
}
// =====================================================
// KRISHIMITRA AI
// SMART FARM OPERATIONS ENGINE
// =====================================================
//
// PURPOSE:
// Convert hourly weather forecasts into practical
// farming-operation windows.
//
// This is decision-support logic, not a replacement
// for local agronomic advice or product instructions.
// =====================================================


// =====================================================
// HELPERS
// =====================================================

function number(value, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}


function getHourValue(hour, keys, fallback = 0) {
  for (const key of keys) {
    if (
      hour?.[key] !== undefined &&
      hour?.[key] !== null
    ) {
      return number(
        hour[key],
        fallback
      );
    }
  }

  return fallback;
}


function getTemperature(hour) {
  return getHourValue(
    hour,
    ["temperature"],
    0
  );
}


function getHumidity(hour) {
  return getHourValue(
    hour,
    ["humidity"],
    0
  );
}


function getWind(hour) {
  return getHourValue(
    hour,
    [
      "windSpeed",
      "wind_speed",
    ],
    0
  );
}


function getRainProbability(hour) {
  return getHourValue(
    hour,
    [
      "rainProbability",
      "precipitationProbability",
    ],
    0
  );
}


function getRain(hour) {
  return getHourValue(
    hour,
    [
      "rain",
      "precipitation",
    ],
    0
  );
}


// =====================================================
// FUTURE FORECAST
// =====================================================

function getFutureHours(
  weather,
  limit = 48
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
// SPRAYING SCORE
// =====================================================
//
// This is deliberately conservative.
//
// Actual pesticide/fertilizer labels may specify
// different wind/rain/temperature restrictions.
// Those instructions must take priority.
// =====================================================

function calculateSprayingScore(
  hour
) {
  const rainProbability =
    getRainProbability(hour);

  const rain =
    getRain(hour);

  const wind =
    getWind(hour);

  const temperature =
    getTemperature(hour);

  let score = 100;

  // Rain
  if (rain > 0) {
    score -= 60;
  }

  if (rainProbability >= 70) {
    score -= 45;
  } else if (
    rainProbability >= 40
  ) {
    score -= 25;
  } else if (
    rainProbability >= 20
  ) {
    score -= 10;
  }

  // Wind
  if (wind >= 25) {
    score -= 60;
  } else if (
    wind >= 18
  ) {
    score -= 35;
  } else if (
    wind >= 12
  ) {
    score -= 15;
  }

  // Extreme heat
  if (temperature >= 38) {
    score -= 35;
  } else if (
    temperature >= 34
  ) {
    score -= 15;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}


// =====================================================
// FIELD WORK SCORE
// =====================================================

function calculateFieldWorkScore(
  hour
) {
  const rainProbability =
    getRainProbability(hour);

  const rain =
    getRain(hour);

  const wind =
    getWind(hour);

  const temperature =
    getTemperature(hour);

  let score = 100;

  if (rain > 0) {
    score -= 45;
  }

  if (rainProbability >= 70) {
    score -= 35;
  } else if (
    rainProbability >= 40
  ) {
    score -= 20;
  }

  if (wind >= 35) {
    score -= 40;
  } else if (
    wind >= 25
  ) {
    score -= 20;
  }

  if (temperature >= 40) {
    score -= 40;
  } else if (
    temperature >= 36
  ) {
    score -= 20;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}


// =====================================================
// IRRIGATION WEATHER SCORE
// =====================================================
//
// IMPORTANT:
//
// This does NOT determine whether the crop NEEDS water.
//
// Soil moisture, crop, stage, irrigation system,
// recent rainfall and field observations are needed
// for that.
//
// It only evaluates whether upcoming WEATHER makes
// irrigation more or less sensible.
// =====================================================

function calculateIrrigationScore(
  hour
) {
  const rainProbability =
    getRainProbability(hour);

  const rain =
    getRain(hour);

  const temperature =
    getTemperature(hour);

  const wind =
    getWind(hour);

  let score = 100;

  if (rain > 0) {
    score -= 70;
  }

  if (rainProbability >= 70) {
    score -= 55;
  } else if (
    rainProbability >= 40
  ) {
    score -= 30;
  } else if (
    rainProbability >= 20
  ) {
    score -= 10;
  }

  // Hot/windy conditions can increase losses.
  if (temperature >= 38) {
    score -= 20;
  }

  if (wind >= 25) {
    score -= 20;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}


// =====================================================
// CONSECUTIVE WINDOW FINDER
// =====================================================

function findBestWindow(
  hours,
  scoreFunction,
  minimumScore = 65,
  minimumHours = 2
) {
  const candidates =
    hours.map((hour) => ({
      ...hour,

      operationScore:
        scoreFunction(hour),
    }));

  const windows = [];

  let currentWindow = [];

  candidates.forEach(
    (hour) => {
      if (
        hour.operationScore >=
        minimumScore
      ) {
        currentWindow.push(
          hour
        );
      } else {
        if (
          currentWindow.length >=
          minimumHours
        ) {
          windows.push(
            currentWindow
          );
        }

        currentWindow = [];
      }
    }
  );

  if (
    currentWindow.length >=
    minimumHours
  ) {
    windows.push(
      currentWindow
    );
  }

  if (!windows.length) {
    return null;
  }

  // Score every available window.
  const scoredWindows =
    windows.map((window) => {
      const averageScore =
        window.reduce(
          (sum, hour) =>
            sum +
            hour.operationScore,
          0
        ) /
        window.length;

      return {
        hours: window,
        averageScore,
      };
    });

  scoredWindows.sort(
    (a, b) =>
      b.averageScore -
      a.averageScore
  );

  const best =
    scoredWindows[0];

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
      Math.round(
        best.averageScore
      ),

    hours:
      best.hours,
  };
}


// =====================================================
// UPCOMING RAIN
// =====================================================

function analyzeRain(
  hours
) {
  const rainyHours =
    hours.filter(
      (hour) =>
        getRain(hour) > 0 ||
        getRainProbability(hour) >=
          60
    );

  if (!rainyHours.length) {
    return {
      expected: false,

      firstRainTime: null,

      highestProbability:
        Math.max(
          0,
          ...hours.map(
            getRainProbability
          )
        ),

      expectedRain:
        hours.reduce(
          (sum, hour) =>
            sum +
            getRain(hour),
          0
        ),
    };
  }

  return {
    expected: true,

    firstRainTime:
      rainyHours[0].time,

    highestProbability:
      Math.max(
        ...rainyHours.map(
          getRainProbability
        )
      ),

    expectedRain:
      hours.reduce(
        (sum, hour) =>
          sum +
          getRain(hour),
        0
      ),
  };
}


// =====================================================
// HEAT WINDOW
// =====================================================

function analyzeHeat(
  hours
) {
  const hotHours =
    hours.filter(
      (hour) =>
        getTemperature(hour) >=
        35
    );

  if (!hotHours.length) {
    return {
      risk: false,
      maximumTemperature: Math.max(
        0,
        ...hours.map(
          getTemperature
        )
      ),
      firstHotHour: null,
    };
  }

  return {
    risk: true,

    maximumTemperature:
      Math.max(
        ...hotHours.map(
          getTemperature
        )
      ),

    firstHotHour:
      hotHours[0].time,
  };
}


// =====================================================
// WIND WINDOW
// =====================================================

function analyzeWind(
  hours
) {
  const windyHours =
    hours.filter(
      (hour) =>
        getWind(hour) >= 25
    );

  return {
    risk:
      windyHours.length > 0,

    maximumWind:
      Math.max(
        0,
        ...hours.map(
          getWind
        )
      ),

    firstWindyHour:
      windyHours[0]?.time ||
      null,
  };
}


// =====================================================
// OPERATION STATUS
// =====================================================

function getStatus(
  window
) {
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

export function analyzeFarmOperations({
  weather,
  cropIntelligence = null,
  language = "hi",
}) {
  if (!weather) {
    return null;
  }

  const hours =
    getFutureHours(
      weather,
      48
    );

  if (!hours.length) {
    return null;
  }

  // ===================================================
  // FIND WINDOWS
  // ===================================================

  const sprayingWindow =
    findBestWindow(
      hours,
      calculateSprayingScore,
      70,
      2
    );

  const irrigationWindow =
    findBestWindow(
      hours,
      calculateIrrigationScore,
      65,
      2
    );

  const fieldWorkWindow =
    findBestWindow(
      hours,
      calculateFieldWorkScore,
      65,
      2
    );

  // ===================================================
  // WEATHER RISKS
  // ===================================================

  const rain =
    analyzeRain(hours);

  const heat =
    analyzeHeat(hours);

  const wind =
    analyzeWind(hours);

  // ===================================================
  // CROP CONTEXT
  // ===================================================

  const cropName =
    cropIntelligence?.cropName ||
    null;

  const cropRisk =
    cropIntelligence
      ?.overallRisk ||
    "normal";

  // ===================================================
  // FARMER SUMMARY
  // ===================================================

  let summary;

  if (language === "hi") {
    if (cropName) {
      summary =
        `${cropName} के लिए अगले 48 घंटों के मौसम को देखकर ` +
        "KrishiMitra ने irrigation, spraying और field work के लिए उपयोगी समय का विश्लेषण किया है।";
    } else {
      summary =
        "अगले 48 घंटों के मौसम को देखकर KrishiMitra ने irrigation, spraying और field work के लिए उपयोगी समय का विश्लेषण किया है।";
    }
  } else {
    summary = cropName
      ? `KrishiMitra analysed the next 48 hours for irrigation, spraying and field-work opportunities for ${cropName}.`
      : "KrishiMitra analysed the next 48 hours for irrigation, spraying and field-work opportunities.";
  }

  // ===================================================
  // RESULT
  // ===================================================

  return {
    periodHours: 48,

    cropName,

    cropRisk,

    summary,

    spraying: {
      status:
        getStatus(
          sprayingWindow
        ),

      window:
        sprayingWindow,

      message:
        sprayingWindow
          ? language === "hi"
            ? "मौसम के आधार पर spraying के लिए एक संभावित अनुकूल समय मिला है। Product label, हवा और स्थानीय परिस्थितियाँ भी जाँचें।"
            : "A potentially suitable weather window for spraying was found. Also check the product label, wind and local conditions."
          : language === "hi"
          ? "अगले forecast period में spraying के लिए अच्छा weather window नहीं मिला।"
          : "No good spraying weather window was found in the upcoming forecast period.",
    },

    irrigation: {
      status:
        getStatus(
          irrigationWindow
        ),

      window:
        irrigationWindow,

      message:
        irrigationWindow
          ? language === "hi"
            ? "Weather के आधार पर irrigation के लिए एक संभावित समय मिला है। सिंचाई करने से पहले soil moisture और crop requirement जाँचें।"
            : "A potential irrigation weather window was found. Check soil moisture and crop requirements before irrigating."
          : language === "hi"
          ? "मौसम के आधार पर अभी irrigation timing सावधानी से तय करें।"
          : "Irrigation timing should currently be decided cautiously based on field conditions.",
    },

    fieldWork: {
      status:
        getStatus(
          fieldWorkWindow
        ),

      window:
        fieldWorkWindow,

      message:
        fieldWorkWindow
          ? language === "hi"
            ? "Field operations के लिए मौसम का एक उपयोगी समय मिला है।"
            : "A useful weather window for field operations was found."
          : language === "hi"
          ? "अगले forecast period में field operations के लिए परिस्थितियाँ कम अनुकूल हैं।"
          : "Conditions are less favorable for field operations during the upcoming forecast period.",
    },

    rain,

    heat,

    wind,

    generatedAt:
      new Date().toISOString(),
  };
}
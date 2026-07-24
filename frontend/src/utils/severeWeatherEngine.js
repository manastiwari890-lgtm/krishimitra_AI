// =====================================================
// KRISHIMITRA AI
// SEVERE FARM WEATHER ALERT ENGINE
// =====================================================
//
// Analyses upcoming hourly weather and converts
// potentially dangerous conditions into prioritized
// farmer-facing alerts.
//
// This is weather-based decision support.
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

function getTemperature(hour) {
  return safeNumber(
    hour?.temperature
  );
}

function getRain(hour) {
  return safeNumber(
    hour?.rain ??
      hour?.precipitation
  );
}

function getRainProbability(hour) {
  return safeNumber(
    hour?.rainProbability ??
      hour?.precipitationProbability
  );
}

function getWind(hour) {
  return safeNumber(
    hour?.windSpeed ??
      hour?.wind_speed
  );
}

function getWindGust(hour) {
  return safeNumber(
    hour?.windGust ??
      hour?.wind_gust
  );
}

function getHumidity(hour) {
  return safeNumber(
    hour?.humidity
  );
}


// =====================================================
// UPCOMING FORECAST
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
// ALERT CREATOR
// =====================================================

function createAlert({
  id,
  type,
  icon,
  severity,
  title,
  message,
  action,
  time = null,
  value = null,
}) {
  return {
    id,
    type,
    icon,
    severity,
    title,
    message,
    action,
    time,
    value,
  };
}


// =====================================================
// HEAVY RAIN
// =====================================================

function analyzeHeavyRain(
  hours,
  language
) {
  const risky =
    hours.filter(
      (hour) =>
        getRain(hour) >= 10 ||
        getRainProbability(hour) >= 85
    );

  if (!risky.length) {
    return null;
  }

  const highestRain =
    Math.max(
      ...risky.map(getRain)
    );

  const highestProbability =
    Math.max(
      ...risky.map(
        getRainProbability
      )
    );

  return createAlert({
    id: "heavy-rain",

    type: "rain",

    icon: "🌧️",

    severity:
      highestRain >= 20
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "भारी बारिश का जोखिम"
        : "Heavy Rain Risk",

    message:
      language === "hi"
        ? `आने वाले forecast में बारिश की संभावना ${Math.round(
            highestProbability
          )}% तक और hourly rainfall लगभग ${highestRain.toFixed(
            1
          )} mm तक पहुँच सकती है।`
        : `Rain probability may reach ${Math.round(
            highestProbability
          )}% with hourly rainfall around ${highestRain.toFixed(
            1
          )} mm.`,

    action:
      language === "hi"
        ? "खेत की drainage जाँचें और spraying तथा weather-sensitive field work को दोबारा plan करें।"
        : "Check field drainage and reconsider spraying and weather-sensitive field operations.",

    time:
      risky[0].time,

    value:
      highestRain,
  });
}


// =====================================================
// EXTREME HEAT
// =====================================================

function analyzeHeat(
  hours,
  language
) {
  const risky =
    hours.filter(
      (hour) =>
        getTemperature(hour) >=
        38
    );

  if (!risky.length) {
    return null;
  }

  const maximum =
    Math.max(
      ...risky.map(
        getTemperature
      )
    );

  return createAlert({
    id: "extreme-heat",

    type: "heat",

    icon: "🔥",

    severity:
      maximum >= 42
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "तेज गर्मी का जोखिम"
        : "Extreme Heat Risk",

    message:
      language === "hi"
        ? `तापमान लगभग ${Math.round(
            maximum
          )}°C तक जा सकता है।`
        : `Temperature may reach approximately ${Math.round(
            maximum
          )}°C.`,

    action:
      language === "hi"
        ? "दोपहर की तेज गर्मी में spraying और भारी field work से बचें। Crop water stress की निगरानी करें।"
        : "Avoid spraying and strenuous field work during peak afternoon heat. Monitor crops for water stress.",

    time:
      risky[0].time,

    value:
      maximum,
  });
}


// =====================================================
// COLD / FROST WATCH
// =====================================================

function analyzeCold(
  hours,
  language
) {
  const risky =
    hours.filter(
      (hour) =>
        getTemperature(hour) <= 5
    );

  if (!risky.length) {
    return null;
  }

  const minimum =
    Math.min(
      ...risky.map(
        getTemperature
      )
    );

  return createAlert({
    id: "cold-risk",

    type: "cold",

    icon: "🥶",

    severity:
      minimum <= 2
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "ठंड / पाला जोखिम"
        : "Cold / Frost Watch",

    message:
      language === "hi"
        ? `तापमान लगभग ${Math.round(
            minimum
          )}°C तक गिर सकता है।`
        : `Temperature may fall to approximately ${Math.round(
            minimum
          )}°C.`,

    action:
      language === "hi"
        ? "संवेदनशील फसलों की निगरानी करें और स्थानीय frost-protection सलाह देखें।"
        : "Monitor sensitive crops and follow locally appropriate frost-protection guidance.",

    time:
      risky[0].time,

    value:
      minimum,
  });
}


// =====================================================
// STRONG WIND
// =====================================================

function analyzeWind(
  hours,
  language
) {
  const risky =
    hours.filter((hour) => {
      return (
        getWind(hour) >= 30 ||
        getWindGust(hour) >= 45
      );
    });

  if (!risky.length) {
    return null;
  }

  const maximumWind =
    Math.max(
      ...risky.map(getWind)
    );

  const maximumGust =
    Math.max(
      ...risky.map(
        getWindGust
      )
    );

  return createAlert({
    id: "strong-wind",

    type: "wind",

    icon: "💨",

    severity:
      maximumWind >= 40 ||
      maximumGust >= 60
        ? "high"
        : "medium",

    title:
      language === "hi"
        ? "तेज हवा का जोखिम"
        : "Strong Wind Risk",

    message:
      language === "hi"
        ? `हवा लगभग ${Math.round(
            maximumWind
          )} km/h और gusts ${Math.round(
            maximumGust
          )} km/h तक जा सकते हैं।`
        : `Wind may reach ${Math.round(
            maximumWind
          )} km/h with gusts around ${Math.round(
            maximumGust
          )} km/h.`,

    action:
      language === "hi"
        ? "तेज हवा के दौरान spraying टालें और कमजोर पौधों/संरचनाओं की जाँच करें।"
        : "Avoid spraying during strong winds and check vulnerable crops or farm structures.",

    time:
      risky[0].time,

    value:
      Math.max(
        maximumWind,
        maximumGust
      ),
  });
}


// =====================================================
// HUMID + WET DISEASE WEATHER WATCH
// =====================================================

function analyzeDiseaseWeather(
  hours,
  language
) {
  const risky =
    hours.filter(
      (hour) =>
        getHumidity(hour) >= 85 &&
        (
          getRain(hour) > 0 ||
          getRainProbability(hour) >=
            60
        )
    );

  if (risky.length < 3) {
    return null;
  }

  return createAlert({
    id: "disease-weather",

    type: "disease-weather",

    icon: "🦠",

    severity: "medium",

    title:
      language === "hi"
        ? "Disease-Friendly Weather"
        : "Disease-Friendly Weather",

    message:
      language === "hi"
        ? "लगातार अधिक humidity और wet conditions कुछ crop diseases के लिए अनुकूल वातावरण बना सकती हैं।"
        : "Persistent high humidity and wet conditions may create favorable weather for some crop diseases.",

    action:
      language === "hi"
        ? "फसल की नियमित जाँच करें। यह disease diagnosis नहीं है; symptoms मिलने पर Disease Detection module का उपयोग करें।"
        : "Inspect crops regularly. This is not a disease diagnosis; use the Disease Detection module if symptoms appear.",

    time:
      risky[0].time,
  });
}


// =====================================================
// COMPOUND WEATHER RISK
// =====================================================

function analyzeCompoundRisk(
  hours,
  language
) {
  const risky =
    hours.find((hour) => {
      const heavyRain =
        getRain(hour) >= 8 ||
        getRainProbability(hour) >=
          80;

      const strongWind =
        getWind(hour) >= 25 ||
        getWindGust(hour) >= 40;

      return (
        heavyRain &&
        strongWind
      );
    });

  if (!risky) {
    return null;
  }

  return createAlert({
    id: "compound-storm-risk",

    type: "compound",

    icon: "⛈️",

    severity: "high",

    title:
      language === "hi"
        ? "बारिश + तेज हवा का संयुक्त जोखिम"
        : "Rain + Strong Wind Risk",

    message:
      language === "hi"
        ? "एक ही समय में तेज बारिश और हवा की स्थिति बन सकती है, जिससे field operations और कुछ crops पर अधिक प्रभाव पड़ सकता है।"
        : "Heavy rain and strong wind may occur together, increasing risk to field operations and some crops.",

    action:
      language === "hi"
        ? "Weather-sensitive operations रोकें, drainage जाँचें और खेत की स्थिति पर नजर रखें।"
        : "Postpone weather-sensitive operations, check drainage and monitor field conditions.",

    time:
      risky.time,
  });
}


// =====================================================
// SEVERITY ORDER
// =====================================================

function severityScore(
  severity
) {
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


// =====================================================
// OVERALL FARM ALERT LEVEL
// =====================================================

function calculateOverallLevel(
  alerts
) {
  if (
    alerts.some(
      (alert) =>
        alert.severity === "high"
    )
  ) {
    return "high";
  }

  if (
    alerts.some(
      (alert) =>
        alert.severity === "medium"
    )
  ) {
    return "medium";
  }

  if (alerts.length) {
    return "low";
  }

  return "normal";
}


// =====================================================
// MAIN ENGINE
// =====================================================

export function analyzeSevereWeather({
  weather,
  cropIntelligence = null,
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

  const alerts = [
    analyzeCompoundRisk(
      hours,
      language
    ),

    analyzeHeavyRain(
      hours,
      language
    ),

    analyzeHeat(
      hours,
      language
    ),

    analyzeCold(
      hours,
      language
    ),

    analyzeWind(
      hours,
      language
    ),

    analyzeDiseaseWeather(
      hours,
      language
    ),
  ].filter(Boolean);

  // Highest-priority alerts first.

  alerts.sort(
    (a, b) =>
      severityScore(
        b.severity
      ) -
      severityScore(
        a.severity
      )
  );

  const overallLevel =
    calculateOverallLevel(
      alerts
    );

  const cropName =
    cropIntelligence
      ?.cropName || null;

  const cropRisk =
    cropIntelligence
      ?.overallRisk || "normal";

  return {
    periodHours: 72,

    overallLevel,

    cropName,

    cropRisk,

    alerts,

    alertCount:
      alerts.length,

    highPriorityCount:
      alerts.filter(
        (alert) =>
          alert.severity === "high"
      ).length,

    summary:
      alerts.length === 0
        ? language === "hi"
          ? "अगले 72 घंटों में कोई प्रमुख severe-weather alert नहीं मिला।"
          : "No major severe-weather alert was identified for the next 72 hours."
        : language === "hi"
        ? `अगले 72 घंटों में ${alerts.length} महत्वपूर्ण weather alert मिले हैं।`
        : `${alerts.length} important weather alert(s) were identified for the next 72 hours.`,

    generatedAt:
      new Date().toISOString(),
  };
}
// =====================================================
// KRISHIMITRA AI
// AGRICULTURAL WEATHER INTELLIGENCE ENGINE
// =====================================================

// This module does NOT fetch weather.
// It receives weather data from weatherService.js
// and converts it into farmer-friendly guidance.

// =====================================================
// HELPERS
// =====================================================

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function createAlert(
  type,
  severity,
  title,
  message,
  icon
) {
  return {
    type,
    severity,
    title,
    message,
    icon,
  };
}

// =====================================================
// CURRENT WEATHER RISK ANALYSIS
// =====================================================

function analyzeCurrentConditions(
  current,
  language
) {
  const alerts = [];

  if (!current) return alerts;

  const temperature = safeNumber(
    current.temperature
  );

  const humidity = safeNumber(
    current.humidity
  );

  const windSpeed = safeNumber(
    current.windSpeed
  );

  const windGust = safeNumber(
    current.windGust
  );

  const precipitation = safeNumber(
    current.precipitation
  );

  // ===================================================
  // EXTREME HEAT
  // ===================================================

  if (temperature >= 40) {
    alerts.push(
      createAlert(
        "heat",
        "high",
        language === "hi"
          ? "अत्यधिक गर्मी"
          : "Extreme Heat",
        language === "hi"
          ? "तापमान बहुत अधिक है। फसल में पानी की कमी और heat stress का खतरा बढ़ सकता है।"
          : "Temperature is very high. Crops may face increased water loss and heat stress.",
        "🔥"
      )
    );
  } else if (temperature >= 35) {
    alerts.push(
      createAlert(
        "heat",
        "medium",
        language === "hi"
          ? "गर्मी का ध्यान रखें"
          : "Heat Alert",
        language === "hi"
          ? "गर्म मौसम के कारण मिट्टी की नमी तेजी से कम हो सकती है।"
          : "Hot weather may cause soil moisture to decrease faster.",
        "☀️"
      )
    );
  }

  // ===================================================
  // COLD
  // ===================================================

  if (temperature <= 5) {
    alerts.push(
      createAlert(
        "cold",
        "high",
        language === "hi"
          ? "बहुत कम तापमान"
          : "Very Low Temperature",
        language === "hi"
          ? "कम तापमान संवेदनशील फसलों को प्रभावित कर सकता है।"
          : "Very low temperature may affect sensitive crops.",
        "🥶"
      )
    );
  }

  // ===================================================
  // STRONG WIND
  // ===================================================

  if (
    windSpeed >= 35 ||
    windGust >= 50
  ) {
    alerts.push(
      createAlert(
        "wind",
        "high",
        language === "hi"
          ? "तेज हवा"
          : "Strong Wind",
        language === "hi"
          ? "तेज हवा में pesticide या fertilizer spray करना उचित नहीं हो सकता।"
          : "Strong winds may make pesticide or fertilizer spraying unsuitable.",
        "💨"
      )
    );
  } else if (windSpeed >= 20) {
    alerts.push(
      createAlert(
        "wind",
        "medium",
        language === "hi"
          ? "हवा तेज है"
          : "Windy Conditions",
        language === "hi"
          ? "Spraying से पहले हवा की स्थिति जाँचें।"
          : "Check wind conditions before spraying.",
        "🌬️"
      )
    );
  }

  // ===================================================
  // CURRENT RAIN
  // ===================================================

  if (precipitation >= 5) {
    alerts.push(
      createAlert(
        "rain",
        "medium",
        language === "hi"
          ? "वर्षा हो रही है"
          : "Rainfall Detected",
        language === "hi"
          ? "अभी सिंचाई की आवश्यकता कम हो सकती है। खेत में पानी जमा होने पर drainage जाँचें।"
          : "Irrigation demand may currently be lower. Check drainage if water is accumulating.",
        "🌧️"
      )
    );
  }

  // ===================================================
  // HIGH HUMIDITY
  // ===================================================

  if (humidity >= 85) {
    alerts.push(
      createAlert(
        "humidity",
        "medium",
        language === "hi"
          ? "बहुत अधिक नमी"
          : "High Humidity",
        language === "hi"
          ? "लंबे समय तक अधिक humidity कुछ fungal diseases के लिए अनुकूल परिस्थितियाँ बना सकती है।"
          : "Prolonged high humidity can create conditions favorable for some fungal diseases.",
        "💧"
      )
    );
  }

  return alerts;
}

// =====================================================
// UPCOMING RAIN ANALYSIS
// =====================================================

function analyzeUpcomingRain(
  daily,
  language
) {
  if (!daily?.length) {
    return null;
  }

  const nextThreeDays =
    daily.slice(0, 3);

  let highestProbability = 0;
  let totalRain = 0;

  nextThreeDays.forEach((day) => {
    highestProbability = Math.max(
      highestProbability,
      safeNumber(day.rainProbability)
    );

    totalRain += safeNumber(day.rain);
  });

  if (
    highestProbability >= 80 ||
    totalRain >= 20
  ) {
    return {
      level: "high",

      icon: "🌧️",

      title:
        language === "hi"
          ? "बारिश की मजबूत संभावना"
          : "High Rain Chance",

      message:
        language === "hi"
          ? "अगले कुछ दिनों में बारिश की अच्छी संभावना है। सिंचाई और field operations की योजना forecast देखकर करें।"
          : "Rain is likely over the next few days. Plan irrigation and field operations around the forecast.",
    };
  }

  if (highestProbability >= 50) {
    return {
      level: "medium",

      icon: "🌦️",

      title:
        language === "hi"
          ? "बारिश संभव है"
          : "Rain Possible",

      message:
        language === "hi"
          ? "आने वाले दिनों में बारिश संभव है। सिंचाई से पहले updated forecast जाँचें।"
          : "Rain is possible in the coming days. Check the updated forecast before irrigation.",
    };
  }

  return {
    level: "low",

    icon: "☀️",

    title:
      language === "hi"
        ? "बारिश की संभावना कम"
        : "Low Rain Chance",

    message:
      language === "hi"
        ? "अगले कुछ दिनों में बारिश की संभावना कम दिखाई दे रही है।"
        : "Rain probability appears relatively low over the next few days.",
  };
}

// =====================================================
// IRRIGATION GUIDANCE
// =====================================================

function getIrrigationAdvice(
  weather,
  language
) {
  const current =
    weather?.current || {};

  const daily =
    weather?.daily || [];

  const temperature = safeNumber(
    current.temperature
  );

  const humidity = safeNumber(
    current.humidity
  );

  const precipitation = safeNumber(
    current.precipitation
  );

  const today =
    daily[0] || {};

  const rainProbability = safeNumber(
    today.rainProbability
  );

  const expectedRain = safeNumber(
    today.rain
  );

  // ===================================================
  // CURRENT/EXPECTED RAIN
  // ===================================================

  if (
    precipitation >= 3 ||
    expectedRain >= 5 ||
    rainProbability >= 75
  ) {
    return {
      status: "wait",

      icon: "🌧️",

      title:
        language === "hi"
          ? "सिंचाई रोककर मौसम देखें"
          : "Consider Delaying Irrigation",

      message:
        language === "hi"
          ? "वर्षा हो रही है या बारिश की संभावना अधिक है। सिंचाई करने से पहले खेत की वास्तविक मिट्टी की नमी जाँचें।"
          : "Rain is occurring or likely. Check actual field soil moisture before irrigating.",
    };
  }

  // ===================================================
  // HOT + DRY
  // ===================================================

  if (
    temperature >= 35 &&
    humidity <= 45
  ) {
    return {
      status: "check",

      icon: "💦",

      title:
        language === "hi"
          ? "मिट्टी की नमी जाँचें"
          : "Check Soil Moisture",

      message:
        language === "hi"
          ? "गर्म और अपेक्षाकृत शुष्क मौसम में पानी की कमी जल्दी हो सकती है। मिट्टी की नमी देखकर सिंचाई का निर्णय लें।"
          : "Hot and relatively dry conditions may increase water loss. Check soil moisture before deciding to irrigate.",
    };
  }

  return {
    status: "normal",

    icon: "🌱",

    title:
      language === "hi"
        ? "सामान्य निगरानी"
        : "Normal Monitoring",

    message:
      language === "hi"
        ? "सिर्फ मौसम के आधार पर तत्काल सिंचाई की जरूरत स्पष्ट नहीं है। फसल और मिट्टी की नमी जाँचते रहें।"
        : "Weather alone does not indicate an urgent irrigation need. Continue checking the crop and actual soil moisture.",
  };
}

// =====================================================
// SPRAYING CONDITIONS
// =====================================================

function getSprayingAdvice(
  weather,
  language
) {
  const current =
    weather?.current || {};

  const today =
    weather?.daily?.[0] || {};

  const windSpeed = safeNumber(
    current.windSpeed
  );

  const rainProbability = safeNumber(
    today.rainProbability
  );

  const precipitation = safeNumber(
    current.precipitation
  );

  if (
    windSpeed >= 20 ||
    precipitation > 0 ||
    rainProbability >= 70
  ) {
    return {
      suitable: false,

      icon: "🚫",

      title:
        language === "hi"
          ? "Spraying के लिए खराब समय"
          : "Poor Spraying Conditions",

      message:
        language === "hi"
          ? "हवा या बारिश के कारण spray drift या wash-off का खतरा हो सकता है।"
          : "Wind or rain may increase the risk of spray drift or wash-off.",
    };
  }

  return {
    suitable: true,

    icon: "✅",

    title:
      language === "hi"
        ? "मौसम अपेक्षाकृत अनुकूल"
        : "Conditions Relatively Suitable",

    message:
      language === "hi"
        ? "मौसम की वर्तमान स्थिति spraying के लिए अपेक्षाकृत अनुकूल है, लेकिन product label और स्थानीय सलाह भी जरूर देखें।"
        : "Current weather appears relatively suitable for spraying, but always follow the product label and local recommendations.",
  };
}

// =====================================================
// FIELD WORK CONDITIONS
// =====================================================

function getFieldWorkAdvice(
  weather,
  language
) {
  const current =
    weather?.current || {};

  const today =
    weather?.daily?.[0] || {};

  const temperature = safeNumber(
    current.temperature
  );

  const wind = safeNumber(
    current.windSpeed
  );

  const rainProbability = safeNumber(
    today.rainProbability
  );

  if (
    temperature >= 40 ||
    wind >= 35 ||
    rainProbability >= 85
  ) {
    return {
      status: "poor",

      icon: "⚠️",

      title:
        language === "hi"
          ? "Field Work में सावधानी"
          : "Field Work Caution",

      message:
        language === "hi"
          ? "मौसम की स्थिति field operations के लिए कठिन हो सकती है।"
          : "Weather conditions may make field operations difficult.",
    };
  }

  return {
    status: "good",

    icon: "🚜",

    title:
      language === "hi"
        ? "Field Work संभव"
        : "Field Work Possible",

    message:
      language === "hi"
        ? "वर्तमान मौसम सामान्य field activities के लिए अपेक्षाकृत ठीक दिखाई देता है।"
        : "Current weather appears relatively suitable for normal field activities.",
  };
}

// =====================================================
// GENERAL FARMING TIPS
// =====================================================

function generateFarmingTips(
  weather,
  language
) {
  const tips = [];

  const current =
    weather?.current || {};

  const temperature = safeNumber(
    current.temperature
  );

  const humidity = safeNumber(
    current.humidity
  );

  const wind = safeNumber(
    current.windSpeed
  );

  if (temperature >= 35) {
    tips.push(
      language === "hi"
        ? "गर्म मौसम में मिट्टी की नमी अधिक बार जाँचें।"
        : "Check soil moisture more frequently during hot weather."
    );
  }

  if (humidity >= 80) {
    tips.push(
      language === "hi"
        ? "अधिक humidity में पत्तियों पर fungal symptoms की निगरानी करें।"
        : "Monitor leaves for fungal symptoms during prolonged high humidity."
    );
  }

  if (wind >= 20) {
    tips.push(
      language === "hi"
        ? "तेज हवा में spraying से बचना बेहतर हो सकता है।"
        : "Consider avoiding spraying during strong winds."
    );
  }

  if (tips.length === 0) {
    tips.push(
      language === "hi"
        ? "फसल, मिट्टी और स्थानीय मौसम की नियमित निगरानी करते रहें।"
        : "Continue regular monitoring of crops, soil and local weather."
    );
  }

  return tips;
}

// =====================================================
// MAIN AGRICULTURAL WEATHER ENGINE
// =====================================================

export function analyzeAgriculturalWeather(
  weather,
  language = "hi"
) {
  if (!weather) {
    return null;
  }

  const alerts =
    analyzeCurrentConditions(
      weather.current,
      language
    );

  const rainOutlook =
    analyzeUpcomingRain(
      weather.daily,
      language
    );

  const irrigation =
    getIrrigationAdvice(
      weather,
      language
    );

  const spraying =
    getSprayingAdvice(
      weather,
      language
    );

  const fieldWork =
    getFieldWorkAdvice(
      weather,
      language
    );

  const tips =
    generateFarmingTips(
      weather,
      language
    );

  return {
    alerts,
    rainOutlook,
    irrigation,
    spraying,
    fieldWork,
    tips,

    generatedAt:
      new Date().toISOString(),
  };
}
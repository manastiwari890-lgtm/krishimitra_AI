// =====================================================
// KRISHIMITRA AI - WEATHER SERVICE
// Open-Meteo Weather API
// =====================================================

const BASE_URL =
  "https://api.open-meteo.com/v1/forecast";

// =====================================================
// WEATHER CODE → CONDITION
// =====================================================

export function getWeatherCondition(code) {
  const conditions = {
    0: {
      label: "Clear Sky",
      icon: "☀️",
    },

    1: {
      label: "Mainly Clear",
      icon: "🌤️",
    },

    2: {
      label: "Partly Cloudy",
      icon: "⛅",
    },

    3: {
      label: "Cloudy",
      icon: "☁️",
    },

    45: {
      label: "Fog",
      icon: "🌫️",
    },

    48: {
      label: "Fog",
      icon: "🌫️",
    },

    51: {
      label: "Light Drizzle",
      icon: "🌦️",
    },

    53: {
      label: "Drizzle",
      icon: "🌦️",
    },

    55: {
      label: "Heavy Drizzle",
      icon: "🌧️",
    },

    61: {
      label: "Light Rain",
      icon: "🌧️",
    },

    63: {
      label: "Rain",
      icon: "🌧️",
    },

    65: {
      label: "Heavy Rain",
      icon: "🌧️",
    },

    71: {
      label: "Light Snow",
      icon: "🌨️",
    },

    73: {
      label: "Snow",
      icon: "🌨️",
    },

    75: {
      label: "Heavy Snow",
      icon: "❄️",
    },

    80: {
      label: "Rain Showers",
      icon: "🌦️",
    },

    81: {
      label: "Rain Showers",
      icon: "🌧️",
    },

    82: {
      label: "Heavy Showers",
      icon: "⛈️",
    },

    95: {
      label: "Thunderstorm",
      icon: "⛈️",
    },

    96: {
      label: "Thunderstorm",
      icon: "⛈️",
    },

    99: {
      label: "Severe Thunderstorm",
      icon: "⛈️",
    },
  };

  return (
    conditions[code] || {
      label: "Unknown",
      icon: "🌤️",
    }
  );
}

// =====================================================
// CURRENT WEATHER
//
// IMPORTANT:
// Keep this function because SoilFertility.jsx already
// uses it.
// =====================================================

export async function getCurrentWeather(
  latitude,
  longitude
) {
  const url =
    `${BASE_URL}` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=` +
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(",") +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Weather data could not be loaded."
    );
  }

  const data = await response.json();

  const condition = getWeatherCondition(
    data.current?.weather_code
  );

  return {
    temperature:
      data.current?.temperature_2m,

    humidity:
      data.current?.relative_humidity_2m,

    apparentTemperature:
      data.current?.apparent_temperature,

    precipitation:
      data.current?.precipitation,

    rain:
      data.current?.rain,

    weatherCode:
      data.current?.weather_code,

    cloudCover:
      data.current?.cloud_cover,

    windSpeed:
      data.current?.wind_speed_10m,

    windDirection:
      data.current?.wind_direction_10m,

    windGust:
      data.current?.wind_gusts_10m,

    condition: condition.label,

    icon: condition.icon,

    time: data.current?.time,

    timezone: data.timezone,
  };
}

// =====================================================
// COMPLETE WEATHER INTELLIGENCE
// =====================================================

export async function getWeatherForecast(
  latitude,
  longitude
) {
  const currentParameters = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "rain",
    "weather_code",
    "cloud_cover",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
  ].join(",");

  const hourlyParameters = [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation_probability",
    "precipitation",
    "rain",
    "weather_code",
    "cloud_cover",
    "wind_speed_10m",
    "soil_temperature_0cm",
    "soil_moisture_0_to_1cm",
  ].join(",");

  const dailyParameters = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "sunrise",
    "sunset",
    "precipitation_sum",
    "rain_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "uv_index_max",
  ].join(",");

  const url =
    `${BASE_URL}` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=${currentParameters}` +
    `&hourly=${hourlyParameters}` +
    `&daily=${dailyParameters}` +
    `&forecast_days=7` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Weather forecast could not be loaded."
    );
  }

  const data = await response.json();

  return formatWeatherData(data);
}

// =====================================================
// FORMAT COMPLETE WEATHER DATA
// =====================================================

function formatWeatherData(data) {
  const currentCondition =
    getWeatherCondition(
      data.current?.weather_code
    );

  // ===================================================
  // CURRENT
  // ===================================================

  const current = {
    temperature:
      data.current?.temperature_2m,

    humidity:
      data.current?.relative_humidity_2m,

    feelsLike:
      data.current?.apparent_temperature,

    precipitation:
      data.current?.precipitation,

    rain:
      data.current?.rain,

    cloudCover:
      data.current?.cloud_cover,

    pressure:
      data.current?.surface_pressure,

    windSpeed:
      data.current?.wind_speed_10m,

    windDirection:
      data.current?.wind_direction_10m,

    windGust:
      data.current?.wind_gusts_10m,

    weatherCode:
      data.current?.weather_code,

    condition:
      currentCondition.label,

    icon:
      currentCondition.icon,

    time:
      data.current?.time,
  };

  // ===================================================
  // HOURLY
  // ===================================================

  const hourly =
    data.hourly?.time?.map(
      (time, index) => {
        const condition =
          getWeatherCondition(
            data.hourly.weather_code?.[
              index
            ]
          );

        return {
          time,

          temperature:
            data.hourly
              .temperature_2m?.[index],

          humidity:
            data.hourly
              .relative_humidity_2m?.[
                index
              ],

          rainProbability:
            data.hourly
              .precipitation_probability?.[
                index
              ],

          precipitation:
            data.hourly
              .precipitation?.[index],

          rain:
            data.hourly.rain?.[
              index
            ],

          cloudCover:
            data.hourly
              .cloud_cover?.[index],

          windSpeed:
            data.hourly
              .wind_speed_10m?.[
                index
              ],

          soilTemperature:
            data.hourly
              .soil_temperature_0cm?.[
                index
              ],

          soilMoisture:
            data.hourly
              .soil_moisture_0_to_1cm?.[
                index
              ],

          weatherCode:
            data.hourly
              .weather_code?.[index],

          condition:
            condition.label,

          icon:
            condition.icon,
        };
      }
    ) || [];

  // ===================================================
  // DAILY
  // ===================================================

  const daily =
    data.daily?.time?.map(
      (date, index) => {
        const condition =
          getWeatherCondition(
            data.daily.weather_code?.[
              index
            ]
          );

        return {
          date,

          weatherCode:
            data.daily
              .weather_code?.[index],

          condition:
            condition.label,

          icon:
            condition.icon,

          maxTemperature:
            data.daily
              .temperature_2m_max?.[
                index
              ],

          minTemperature:
            data.daily
              .temperature_2m_min?.[
                index
              ],

          maxFeelsLike:
            data.daily
              .apparent_temperature_max?.[
                index
              ],

          minFeelsLike:
            data.daily
              .apparent_temperature_min?.[
                index
              ],

          sunrise:
            data.daily.sunrise?.[
              index
            ],

          sunset:
            data.daily.sunset?.[
              index
            ],

          precipitation:
            data.daily
              .precipitation_sum?.[
                index
              ],

          rain:
            data.daily.rain_sum?.[
              index
            ],

          rainProbability:
            data.daily
              .precipitation_probability_max?.[
                index
              ],

          maxWindSpeed:
            data.daily
              .wind_speed_10m_max?.[
                index
              ],

          maxWindGust:
            data.daily
              .wind_gusts_10m_max?.[
                index
              ],

          uvIndex:
            data.daily
              .uv_index_max?.[
                index
              ],
        };
      }
    ) || [];

  return {
    latitude: data.latitude,

    longitude: data.longitude,

    timezone: data.timezone,

    elevation: data.elevation,

    current,

    hourly,

    daily,

    fetchedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// WEATHER CACHE
// Useful later for weak internet / offline-first mode
// =====================================================

const WEATHER_CACHE_KEY =
  "krishimitra_weather_cache";

// =====================================================
// SAVE WEATHER
// =====================================================

export function saveWeatherCache(
  weatherData
) {
  try {
    const cache = {
      data: weatherData,
      savedAt: Date.now(),
    };

    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error(
      "Weather cache save error:",
      error
    );
  }
}

// =====================================================
// GET WEATHER CACHE
// =====================================================

export function getWeatherCache() {
  try {
    const saved =
      localStorage.getItem(
        WEATHER_CACHE_KEY
      );

    if (!saved) {
      return null;
    }

    const cache = JSON.parse(saved);

    return cache;
  } catch (error) {
    console.error(
      "Weather cache read error:",
      error
    );

    return null;
  }
}

// =====================================================
// CHECK CACHE AGE
// =====================================================

export function isWeatherCacheFresh(
  savedAt,
  maxAgeMinutes = 30
) {
  if (!savedAt) {
    return false;
  }

  const age =
    Date.now() - savedAt;

  const maxAge =
    maxAgeMinutes * 60 * 1000;

  return age <= maxAge;
}

// =====================================================
// GPS LOCATION
// =====================================================

export function getUserCoordinates() {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    }
  );
}
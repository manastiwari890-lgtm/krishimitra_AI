import { useEffect, useMemo, useState } from "react";

import {
  getWeatherForecast,
  getUserCoordinates,
  saveWeatherCache,
  getWeatherCache,
  isWeatherCacheFresh,
} from "../services/weatherService";

import { getLocationName, getLocationCache } from "../services/locationService";

import {
  getCropWeatherOptions,
  getCropGrowthStages,
} from "../data/cropWeatherProfiles";

import { analyzeAgriculturalWeather } from "../utils/agriculturalWeatherEngine";
import { analyzeCropWeather } from "../utils/cropWeatherEngine";
import { analyzeFarmOperations } from "../utils/farmOperationsEngine";
import { analyzeSowingHarvest } from "../utils/sowingHarvestEngine";
import { analyzeSevereWeather } from "../utils/severeWeatherEngine";

import SowingHarvestPlanner from "../components/weather/SowingHarvestPlanner";
import SevereWeatherAlerts from "../components/weather/SevereWeatherAlerts";

import "./Weather.css";

function Weather({ language = "hi" }) {
  // =====================================================
  // STATES
  // =====================================================

  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const [usingCache, setUsingCache] = useState(false);

  // =====================================================
  // CROP WEATHER STATES
  // =====================================================

  const [selectedCrop, setSelectedCrop] = useState(() => {
    return localStorage.getItem("krishimitra_selected_crop") || "wheat";
  });

  const [selectedStage, setSelectedStage] = useState(() => {
    return localStorage.getItem("krishimitra_crop_stage") || "vegetative";
  });

  // =====================================================
  // AGRICULTURAL ANALYSIS
  // =====================================================

  const intelligence = useMemo(() => {
    if (!weather) return null;

    return analyzeAgriculturalWeather(weather, language);
  }, [weather, language]);

  // =====================================================
  // CROP OPTIONS
  // =====================================================

  const cropOptions = useMemo(() => {
    return getCropWeatherOptions(language);
  }, [language]);

  // =====================================================
  // GROWTH STAGE OPTIONS
  // =====================================================

  const growthStageOptions = useMemo(() => {
    return getCropGrowthStages(selectedCrop, language);
  }, [selectedCrop, language]);

  // =====================================================
  // CROP-SPECIFIC WEATHER INTELLIGENCE
  // =====================================================

  const cropIntelligence = useMemo(() => {
    if (!weather || !selectedCrop || !selectedStage) {
      return null;
    }

    return analyzeCropWeather({
      weather,
      cropId: selectedCrop,
      stageId: selectedStage,
      language,
    });
  }, [weather, selectedCrop, selectedStage, language]);

  // =====================================================
  // SMART FARM OPERATIONS PLANNER
  // =====================================================

  const farmOperations = useMemo(() => {
    if (!weather) return null;

    return analyzeFarmOperations({
      weather,
      cropIntelligence,
      language,
    });
  }, [weather, cropIntelligence, language]);

  // =====================================================
  // SOWING & HARVEST INTELLIGENCE
  // =====================================================

  const sowingHarvest = useMemo(() => {
    if (!weather) return null;

    return analyzeSowingHarvest({
      weather,
      cropIntelligence,
      selectedStage,
      language,
    });
  }, [weather, cropIntelligence, selectedStage, language]);
  // =====================================================
  // SEVERE WEATHER INTELLIGENCE
  // =====================================================

  const severeWeather = useMemo(() => {
    if (!weather) return null;

    return analyzeSevereWeather({
      weather,
      cropIntelligence,
      language,
    });
  }, [weather, cropIntelligence, language]);

  // =====================================================
  // SAVE FARMER CROP SELECTION
  // =====================================================

  useEffect(() => {
    localStorage.setItem("krishimitra_selected_crop", selectedCrop);

    localStorage.setItem("krishimitra_crop_stage", selectedStage);
  }, [selectedCrop, selectedStage]);

  // =====================================================
  // VALIDATE SAVED GROWTH STAGE
  // =====================================================

  useEffect(() => {
    if (!growthStageOptions.length) return;

    const stageStillValid = growthStageOptions.some(
      (stage) => stage.id === selectedStage,
    );

    if (!stageStillValid) {
      setSelectedStage(growthStageOptions[0].id);
    }
  }, [growthStageOptions, selectedStage]);

  // =====================================================
  // HANDLE CROP CHANGE
  // =====================================================

  const handleCropChange = (event) => {
    const cropId = event.target.value;

    setSelectedCrop(cropId);

    const stages = getCropGrowthStages(cropId, language);

    if (stages.length > 0) {
      setSelectedStage(stages[0].id);
    }
  };

  // =====================================================
  // LOAD HUMAN-READABLE LOCATION
  // =====================================================

  const loadLocationName = async (latitude, longitude) => {
    setLocationLoading(true);
    setLocationError("");

    try {
      const locationData = await getLocationName(latitude, longitude, language);

      setLocation(locationData);
    } catch (locationRequestError) {
      console.error("KrishiMitra location error:", locationRequestError);

      const cachedLocation = getLocationCache();

      if (cachedLocation?.data) {
        setLocation(cachedLocation.data);

        setLocationError(
          language === "hi"
            ? "Location name live नहीं मिल पाया। Saved location दिखाई जा रही है।"
            : "Live location name could not be loaded. Saved location is being shown.",
        );
      } else {
        setLocationError(
          language === "hi"
            ? "Location का नाम नहीं मिल पाया। GPS coordinates उपलब्ध हैं।"
            : "Location name could not be determined. GPS coordinates are still available.",
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // =====================================================
  // LOAD WEATHER + GPS
  // =====================================================

  const loadWeather = async () => {
    setLoading(true);
    setError("");
    setLocationError("");
    setUsingCache(false);

    try {
      // ===============================================
      // GPS
      // ===============================================

      const coordinates = await getUserCoordinates();

      setLocationAccuracy(coordinates.accuracy);

      // ===============================================
      // WEATHER + LOCATION NAME
      // ===============================================

      const [weatherResult, locationResult] = await Promise.allSettled([
        getWeatherForecast(coordinates.latitude, coordinates.longitude),

        getLocationName(coordinates.latitude, coordinates.longitude, language),
      ]);

      // ===============================================
      // WEATHER RESULT
      // ===============================================

      if (weatherResult.status === "fulfilled") {
        setWeather(weatherResult.value);

        saveWeatherCache(weatherResult.value);
      } else {
        throw weatherResult.reason;
      }

      // ===============================================
      // LOCATION RESULT
      // ===============================================

      if (locationResult.status === "fulfilled") {
        setLocation(locationResult.value);
      } else {
        console.error("Location lookup failed:", locationResult.reason);

        const cachedLocation = getLocationCache();

        if (cachedLocation?.data) {
          setLocation(cachedLocation.data);
        }

        setLocationError(
          language === "hi"
            ? "Location का नाम नहीं मिल पाया। GPS location का उपयोग किया जा रहा है।"
            : "Location name could not be loaded. GPS location is still being used.",
        );
      }
    } catch (weatherError) {
      console.error("KrishiMitra weather error:", weatherError);

      // ===============================================
      // OFFLINE / CACHE FALLBACK
      // ===============================================

      const cache = getWeatherCache();

      const cachedLocation = getLocationCache();

      if (cachedLocation?.data) {
        setLocation(cachedLocation.data);
      }

      if (cache?.data) {
        setWeather(cache.data);
        setUsingCache(true);

        const fresh = isWeatherCacheFresh(cache.savedAt, 30);

        setError(
          fresh
            ? language === "hi"
              ? "Live weather नहीं मिल पाया। हाल का saved weather दिखाया जा रहा है।"
              : "Live weather could not be loaded. Recent saved weather is being shown."
            : language === "hi"
              ? "Live weather नहीं मिल पाया। पुराना saved weather दिखाया जा रहा है।"
              : "Live weather could not be loaded. Older saved weather is being shown.",
        );
      } else {
        setError(
          language === "hi"
            ? "Weather load नहीं हो पाया। Location permission और internet connection check करें।"
            : "Weather could not be loaded. Check location permission and your internet connection.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadWeather();
  }, []);

  // =====================================================
  // RELOAD LOCATION WHEN LANGUAGE CHANGES
  // =====================================================

  useEffect(() => {
    if (weather?.latitude !== undefined && weather?.longitude !== undefined) {
      loadLocationName(weather.latitude, weather.longitude);
    }
  }, [language]);

  // =====================================================
  // NEXT 12 HOURS
  // =====================================================

  const upcomingHours = useMemo(() => {
    if (!weather?.hourly?.length) {
      return [];
    }

    const now = new Date();

    const future = weather.hourly.filter(
      (hour) => new Date(hour.time) >= new Date(now.getTime() - 60 * 60 * 1000),
    );

    return future.slice(0, 12);
  }, [weather]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDay = (date) => {
    const value = new Date(`${date}T12:00:00`);

    return value.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString(
      language === "hi" ? "hi-IN" : "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    );
  };

  // =====================================================
  // SPEAK FARMING ADVICE
  // =====================================================

  const speakAdvice = () => {
    if (!intelligence) return;

    if (!("speechSynthesis" in window)) {
      alert(
        language === "hi"
          ? "आपका browser voice सुविधा support नहीं करता।"
          : "Your browser does not support voice output.",
      );

      return;
    }

    window.speechSynthesis.cancel();

    const place = location?.primaryPlace || "";

    const cropAdvice = cropIntelligence
      ? [
          cropIntelligence.summary,
          cropIntelligence.criticalStage?.message,
          ...cropIntelligence.risks.map((risk) => risk.message),
        ]
      : [];

    const text = [
      place
        ? language === "hi"
          ? `${place} के लिए आज की कृषि मौसम सलाह।`
          : `Today's agricultural weather advice for ${place}.`
        : "",

      cropIntelligence
        ? language === "hi"
          ? `${cropIntelligence.cropName} के लिए फसल विशेष मौसम विश्लेषण।`
          : `Crop-specific weather analysis for ${cropIntelligence.cropName}.`
        : "",

      ...cropAdvice,

      intelligence.rainOutlook?.message,

      intelligence.irrigation?.message,

      intelligence.spraying?.message,

      intelligence.fieldWork?.message,

      farmOperations?.summary,

      farmOperations?.spraying?.message,

      farmOperations?.irrigation?.message,

      farmOperations?.fieldWork?.message,

      ...(intelligence.tips || []),
    ]
      .filter(Boolean)
      .join(" ");

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = language === "hi" ? "hi-IN" : "en-IN";

    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !weather) {
    return (
      <div className="weather-page">
        <div className="weather-loading">
          <div className="weather-loading-icon">🌦️</div>

          <h2>
            {language === "hi"
              ? "KrishiMitra आपके खेत का मौसम देख रहा है..."
              : "KrishiMitra is checking your farm weather..."}
          </h2>

          <p>
            {language === "hi"
              ? "GPS location, weather forecast और agricultural conditions load हो रही हैं।"
              : "Loading GPS location, weather forecast and agricultural conditions."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO WEATHER
  // =====================================================

  if (!weather) {
    return (
      <div className="weather-page">
        <div className="weather-error-screen">
          <div className="weather-loading-icon">📍</div>

          <h2>
            {language === "hi"
              ? "Weather Intelligence उपलब्ध नहीं है"
              : "Weather Intelligence Unavailable"}
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="weather-primary-button"
            onClick={loadWeather}
          >
            ↻ {language === "hi" ? "दोबारा कोशिश करें" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="weather-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="weather-hero">
        <div>
          <span className="weather-label">🌾 KRISHIMITRA AI</span>

          <h1>🌦️ Weather Intelligence</h1>

          <p>
            {language === "hi"
              ? "आपके खेत के स्थानीय मौसम को खेती के उपयोगी फैसलों में बदलें।"
              : "Turn your farm's local weather into useful agricultural decisions."}
          </p>
        </div>

        <button
          type="button"
          className="weather-refresh-button"
          onClick={loadWeather}
          disabled={loading}
        >
          {loading ? "⏳" : "↻"} Refresh
        </button>
      </section>

      {/* =================================================
          LOCATION INTELLIGENCE
      ================================================= */}

      <section className="weather-location-card">
        <div className="weather-location-icon">📍</div>

        <div className="weather-location-content">
          <span className="weather-label">FARM LOCATION</span>

          {locationLoading ? (
            <h2>
              {language === "hi"
                ? "Location पहचान रहे हैं..."
                : "Identifying location..."}
            </h2>
          ) : (
            <>
              <h2>
                {location?.primaryPlace ||
                  (language === "hi"
                    ? "आपकी GPS Location"
                    : "Your GPS Location")}
              </h2>

              {location?.secondaryPlace && <p>{location.secondaryPlace}</p>}

              {location?.country && (
                <span className="location-country">{location.country}</span>
              )}
            </>
          )}
        </div>

        <div className="location-coordinates">
          <span>GPS</span>

          <strong>
            {weather.latitude?.toFixed(4)}, {weather.longitude?.toFixed(4)}
          </strong>

          {locationAccuracy && <small>±{Math.round(locationAccuracy)}m</small>}
        </div>
      </section>

      {locationError && (
        <div className="weather-notice">📍 {locationError}</div>
      )}

      {/* =================================================
          CACHE NOTICE
      ================================================= */}

      {error && (
        <div className="weather-notice">
          {usingCache ? "💾" : "⚠️"} {error}
        </div>
      )}

      {/* =================================================
          CURRENT WEATHER
      ================================================= */}

      <section className="current-weather-card">
        <div className="current-weather-main">
          <div className="current-weather-icon">{weather.current.icon}</div>

          <div>
            <span className="weather-label">
              {language === "hi" ? "अभी का मौसम" : "CURRENT WEATHER"}
            </span>

            <div className="temperature-display">
              {Math.round(weather.current.temperature)}
              °C
            </div>

            <h2>{weather.current.condition}</h2>

            <p>
              {language === "hi" ? "महसूस हो रहा है" : "Feels like"}{" "}
              {Math.round(weather.current.feelsLike)}
              °C
            </p>
          </div>
        </div>

        <div className="current-weather-stats">
          <WeatherStat
            icon="💧"
            title="Humidity"
            value={`${weather.current.humidity}%`}
          />

          <WeatherStat
            icon="🌧️"
            title="Rain"
            value={`${weather.current.rain ?? 0} mm`}
          />

          <WeatherStat
            icon="💨"
            title="Wind"
            value={`${weather.current.windSpeed ?? 0} km/h`}
          />

          <WeatherStat
            icon="☁️"
            title="Cloud Cover"
            value={`${weather.current.cloudCover ?? 0}%`}
          />
        </div>
      </section>

      {/* =================================================
          CROP-SPECIFIC WEATHER INTELLIGENCE
      ================================================= */}

      <section className="weather-section crop-weather-section">
        <div className="weather-section-heading">
          <div>
            <span className="weather-label">🌾 CROP WEATHER AI</span>

            <h2>
              {language === "hi"
                ? "फसल के अनुसार मौसम सलाह"
                : "Crop-Specific Weather Intelligence"}
            </h2>

            <p className="crop-weather-description">
              {language === "hi"
                ? "अपनी फसल और उसकी वर्तमान अवस्था चुनें। KrishiMitra उसी के अनुसार मौसम के जोखिम बताएगा।"
                : "Select your crop and its current growth stage. KrishiMitra will analyse weather risks for that crop."}
            </p>
          </div>
        </div>

        {/* CROP + STAGE SELECTORS */}

        <div className="crop-weather-selectors">
          <div className="crop-selector-group">
            <label>{language === "hi" ? "🌱 आपकी फसल" : "🌱 Your Crop"}</label>

            <select value={selectedCrop} onChange={handleCropChange}>
              {cropOptions.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.icon} {crop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="crop-selector-group">
            <label>
              {language === "hi" ? "🌿 फसल की अवस्था" : "🌿 Growth Stage"}
            </label>

            <select
              value={selectedStage}
              onChange={(event) => setSelectedStage(event.target.value)}
            >
              {growthStageOptions.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CROP ANALYSIS */}

        {cropIntelligence && (
          <div className="crop-intelligence-result">
            <div className="crop-intelligence-header">
              <div className="crop-intelligence-crop">
                <span className="crop-big-icon">
                  {cropIntelligence.cropIcon}
                </span>

                <div>
                  <small>
                    {language === "hi" ? "चुनी गई फसल" : "SELECTED CROP"}
                  </small>

                  <h3>{cropIntelligence.cropName}</h3>
                </div>
              </div>

              <div
                className={`crop-risk-badge crop-risk-${cropIntelligence.overallRisk}`}
              >
                {cropIntelligence.overallRisk === "high"
                  ? "🔴"
                  : cropIntelligence.overallRisk === "medium"
                    ? "🟠"
                    : cropIntelligence.overallRisk === "low"
                      ? "🟡"
                      : "🟢"}{" "}
                {language === "hi"
                  ? `जोखिम: ${cropIntelligence.overallRisk}`
                  : `Risk: ${cropIntelligence.overallRisk}`}
              </div>
            </div>

            <p className="crop-intelligence-summary">
              {cropIntelligence.summary}
            </p>

            {/* WEATHER CONTEXT */}

            <div className="current-weather-stats">
              <WeatherStat
                icon="🌡️"
                title={language === "hi" ? "तापमान" : "Temperature"}
                value={`${Math.round(
                  cropIntelligence.weatherContext.temperature,
                )}°C`}
              />

              <WeatherStat
                icon="💧"
                title="Humidity"
                value={`${cropIntelligence.weatherContext.humidity}%`}
              />

              <WeatherStat
                icon="💨"
                title="Wind"
                value={`${cropIntelligence.weatherContext.windSpeed} km/h`}
              />

              <WeatherStat
                icon="🌧️"
                title={language === "hi" ? "बारिश संभावना" : "Rain Chance"}
                value={`${cropIntelligence.weatherContext.rainProbability}%`}
              />
            </div>

            {/* CRITICAL STAGE */}

            {cropIntelligence.criticalStage && (
              <div className="crop-critical-stage">
                <span>{cropIntelligence.criticalStage.icon}</span>

                <div>
                  <strong>{cropIntelligence.criticalStage.title}</strong>

                  <p>{cropIntelligence.criticalStage.message}</p>
                </div>
              </div>
            )}

            {/* WEATHER RISKS */}

            {cropIntelligence.risks.length > 0 ? (
              <div className="crop-risk-grid">
                {cropIntelligence.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`crop-risk-card crop-risk-card-${risk.severity}`}
                  >
                    <span className="crop-risk-icon">{risk.icon}</span>

                    <div>
                      <h4>{risk.title}</h4>

                      <p>{risk.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="crop-weather-safe">
                <span>✅</span>

                <div>
                  <strong>
                    {language === "hi"
                      ? "कोई प्रमुख मौसम जोखिम नहीं"
                      : "No Major Weather Risk"}
                  </strong>

                  <p>
                    {language === "hi"
                      ? "वर्तमान मौसम में इस फसल और अवस्था के लिए कोई प्रमुख crop-specific warning नहीं मिली।"
                      : "No major crop-specific warning was identified for the selected crop and stage."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =================================================
          SMART FARM OPERATIONS PLANNER
      ================================================= */}

      {farmOperations && (
        <section className="weather-section farm-operations-section">
          <div className="weather-section-heading">
            <div>
              <span className="weather-label">🚜 SMART FARM OPERATIONS</span>

              <h2>
                {language === "hi"
                  ? "अगले 48 घंटों की कार्य योजना"
                  : "48-Hour Farm Operations Planner"}
              </h2>

              <p className="crop-weather-description">
                {farmOperations.summary}
              </p>
            </div>
          </div>

          <div className="agriculture-grid">
            <OperationCard
              icon="🧴"
              title={
                language === "hi" ? "स्प्रे करने का समय" : "Spraying Window"
              }
              operation={farmOperations.spraying}
              language={language}
              formatTime={formatTime}
            />

            <OperationCard
              icon="💧"
              title={language === "hi" ? "सिंचाई का समय" : "Irrigation Window"}
              operation={farmOperations.irrigation}
              language={language}
              formatTime={formatTime}
            />

            <OperationCard
              icon="🚜"
              title={
                language === "hi" ? "खेत में काम का समय" : "Field Work Window"
              }
              operation={farmOperations.fieldWork}
              language={language}
              formatTime={formatTime}
            />
          </div>

          <div className="current-weather-stats">
            <WeatherStat
              icon="🌧️"
              title={language === "hi" ? "बारिश का जोखिम" : "Rain Risk"}
              value={
                farmOperations.rain.expected
                  ? `${Math.round(farmOperations.rain.highestProbability)}%`
                  : language === "hi"
                    ? "कम"
                    : "Low"
              }
            />

            <WeatherStat
              icon="🌡️"
              title={language === "hi" ? "अधिकतम तापमान" : "Max Temperature"}
              value={`${Math.round(farmOperations.heat.maximumTemperature)}°C`}
            />

            <WeatherStat
              icon="💨"
              title={language === "hi" ? "अधिकतम हवा" : "Max Wind"}
              value={`${Math.round(farmOperations.wind.maximumWind)} km/h`}
            />

            <WeatherStat
              icon="🌾"
              title={language === "hi" ? "फसल जोखिम" : "Crop Risk"}
              value={farmOperations.cropRisk || "normal"}
            />
          </div>

          {(farmOperations.rain.expected ||
            farmOperations.heat.risk ||
            farmOperations.wind.risk) && (
            <div className="weather-alert-list">
              {farmOperations.rain.expected && (
                <div className="weather-alert weather-alert-medium">
                  <div className="alert-icon">🌧️</div>

                  <div>
                    <strong>
                      {language === "hi" ? "बारिश की संभावना" : "Upcoming Rain"}
                    </strong>

                    <p>
                      {language === "hi"
                        ? `बारिश की सबसे अधिक संभावना लगभग ${Math.round(
                            farmOperations.rain.highestProbability,
                          )}% है। Irrigation और spraying का फैसला इससे पहले जाँचें।`
                        : `Rain probability reaches about ${Math.round(
                            farmOperations.rain.highestProbability,
                          )}%. Recheck irrigation and spraying plans before acting.`}
                    </p>
                  </div>
                </div>
              )}

              {farmOperations.heat.risk && (
                <div className="weather-alert weather-alert-medium">
                  <div className="alert-icon">🔥</div>

                  <div>
                    <strong>
                      {language === "hi" ? "गर्मी का जोखिम" : "Heat Risk"}
                    </strong>

                    <p>
                      {language === "hi"
                        ? `तापमान लगभग ${Math.round(
                            farmOperations.heat.maximumTemperature,
                          )}°C तक जा सकता है। तेज गर्मी में field work और spraying से बचें।`
                        : `Temperature may reach about ${Math.round(
                            farmOperations.heat.maximumTemperature,
                          )}°C. Avoid strenuous field work and spraying during peak heat.`}
                    </p>
                  </div>
                </div>
              )}

              {farmOperations.wind.risk && (
                <div className="weather-alert weather-alert-medium">
                  <div className="alert-icon">💨</div>

                  <div>
                    <strong>
                      {language === "hi"
                        ? "तेज हवा का जोखिम"
                        : "High Wind Risk"}
                    </strong>

                    <p>
                      {language === "hi"
                        ? `हवा लगभग ${Math.round(
                            farmOperations.wind.maximumWind,
                          )} km/h तक जा सकती है। तेज हवा में spraying टालें।`
                        : `Wind may reach about ${Math.round(
                            farmOperations.wind.maximumWind,
                          )} km/h. Avoid spraying during high winds.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="weather-disclaimer">
            ℹ️{" "}
            {language === "hi"
              ? "Operations Planner मौसम के आधार पर उपयुक्त समय सुझाता है। सिंचाई की वास्तविक आवश्यकता के लिए soil moisture, crop stage और field condition भी जरूरी हैं। Spray product label की instructions हमेशा प्राथमिक हैं।"
              : "The Operations Planner suggests weather-based timing. Actual irrigation need also depends on soil moisture, crop stage and field conditions. Always follow spray-product label instructions."}
          </div>
        </section>
      )}
      {/* =================================================
    SOWING & HARVEST INTELLIGENCE
================================================= */}

      <SowingHarvestPlanner data={sowingHarvest} language={language} />
      {/* =================================================
    SEVERE WEATHER INTELLIGENCE
================================================= */}

      <SevereWeatherAlerts data={severeWeather} language={language} />

      {/* =================================================
          FARMING INTELLIGENCE
      ================================================= */}

      {intelligence && (
        <section className="weather-section">
          <div className="weather-section-heading">
            <div>
              <span className="weather-label">🤖 KRISHIMITRA ANALYSIS</span>

              <h2>
                {language === "hi"
                  ? "आज की खेती की सलाह"
                  : "Today's Farming Intelligence"}
              </h2>
            </div>

            <button
              type="button"
              className="voice-weather-button"
              onClick={speakAdvice}
            >
              🔊 {language === "hi" ? "सलाह सुनें" : "Listen"}
            </button>
          </div>

          <div className="agriculture-grid">
            <AdviceCard data={intelligence.irrigation} />

            <AdviceCard data={intelligence.spraying} />

            <AdviceCard data={intelligence.fieldWork} />

            <AdviceCard data={intelligence.rainOutlook} />
          </div>
        </section>
      )}

      {/* =================================================
          ALERTS
      ================================================= */}

      {intelligence?.alerts?.length > 0 && (
        <section className="weather-section">
          <span className="weather-label">⚠️ FARM ALERTS</span>

          <h2>{language === "hi" ? "मौसम चेतावनी" : "Weather Alerts"}</h2>

          <div className="weather-alert-list">
            {intelligence.alerts.map((alert, index) => (
              <div
                key={`${alert.type}-${index}`}
                className={`weather-alert weather-alert-${alert.severity}`}
              >
                <div className="alert-icon">{alert.icon}</div>

                <div>
                  <strong>{alert.title}</strong>

                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          HOURLY
      ================================================= */}

      <section className="weather-section">
        <span className="weather-label">🕐 NEXT 12 HOURS</span>

        <h2>{language === "hi" ? "घंटे के अनुसार मौसम" : "Hourly Forecast"}</h2>

        <div className="hourly-scroll">
          {upcomingHours.map((hour) => (
            <div className="hourly-card" key={hour.time}>
              <span>{formatTime(hour.time)}</span>

              <div className="hourly-icon">{hour.icon}</div>

              <strong>
                {Math.round(hour.temperature)}
                °C
              </strong>

              <small>🌧️ {hour.rainProbability ?? 0}%</small>

              <small>💧 {hour.humidity}%</small>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================
          7 DAY
      ================================================= */}

      <section className="weather-section">
        <span className="weather-label">📅 7 DAY FORECAST</span>

        <h2>
          {language === "hi"
            ? "अगले 7 दिनों का मौसम"
            : "7-Day Weather Forecast"}
        </h2>

        <div className="daily-forecast-grid">
          {weather.daily.map((day) => (
            <div className="daily-weather-card" key={day.date}>
              <strong>{formatDay(day.date)}</strong>

              <div className="daily-icon">{day.icon}</div>

              <span className="daily-condition">{day.condition}</span>

              <div className="daily-temperature">
                <strong>{Math.round(day.maxTemperature)}°</strong>

                <span>{Math.round(day.minTemperature)}°</span>
              </div>

              <div className="daily-details">
                <span>🌧️ {day.rainProbability ?? 0}%</span>

                <span>💧 {day.rain ?? 0} mm</span>

                <span>💨 {Math.round(day.maxWindSpeed ?? 0)} km/h</span>

                <span>☀️ UV {Math.round(day.uvIndex ?? 0)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================
          TIPS
      ================================================= */}

      {intelligence?.tips?.length > 0 && (
        <section className="weather-section">
          <span className="weather-label">🌱 SMART FARMING</span>

          <h2>
            {language === "hi" ? "KrishiMitra सुझाव" : "KrishiMitra Tips"}
          </h2>

          <div className="weather-tips">
            {intelligence.tips.map((tip, index) => (
              <div className="weather-tip" key={index}>
                <span>✓</span>

                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <div className="weather-disclaimer">
        ℹ️{" "}
        {language === "hi"
          ? "KrishiMitra की मौसम आधारित सलाह forecast data पर आधारित है। Crop-specific warnings भी केवल weather risk indicators हैं। सिंचाई, pesticide और fertilizer के फैसले लेते समय खेत की वास्तविक स्थिति, फसल, soil condition और स्थानीय कृषि सलाह भी देखें।"
          : "KrishiMitra weather guidance is based on forecast data. Crop-specific warnings are weather-risk indicators, not diagnoses. Consider actual field conditions, crop requirements, soil conditions, product instructions and local agricultural advice before irrigation or chemical application."}
      </div>
    </div>
  );
}

// =====================================================
// WEATHER STAT
// =====================================================

function WeatherStat({ icon, title, value }) {
  return (
    <div className="weather-stat">
      <span className="weather-stat-icon">{icon}</span>

      <div>
        <small>{title}</small>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

// =====================================================
// OPERATION CARD
// =====================================================

function OperationCard({ icon, title, operation, language, formatTime }) {
  if (!operation) return null;

  const window = operation.window;

  const statusText = {
    excellent: language === "hi" ? "बहुत अच्छा" : "Excellent",
    good: language === "hi" ? "अच्छा" : "Good",
    caution: language === "hi" ? "सावधानी" : "Caution",
    avoid: language === "hi" ? "अभी टालें" : "Avoid",
  };

  const statusIcon = {
    excellent: "🟢",
    good: "🟢",
    caution: "🟠",
    avoid: "🔴",
  };

  return (
    <div className="agriculture-advice-card operation-planner-card">
      <div className="advice-icon">{icon}</div>

      <h3>{title}</h3>

      <strong>
        {statusIcon[operation.status] || "🟡"}{" "}
        {statusText[operation.status] || operation.status}
      </strong>

      {window ? (
        <>
          <p>
            <strong>
              {formatTime(window.start)}
              {" → "}
              {formatTime(window.end)}
            </strong>
          </p>

          <p>
            {language === "hi"
              ? `लगभग ${window.durationHours} घंटे का window`
              : `Approx. ${window.durationHours}-hour window`}
          </p>

          <p>
            {language === "hi"
              ? `Weather suitability score: ${window.score}/100`
              : `Weather suitability score: ${window.score}/100`}
          </p>
        </>
      ) : (
        <p>
          {language === "hi"
            ? "अगले 48 घंटों में पर्याप्त सुरक्षित weather window नहीं मिला।"
            : "No sufficiently suitable weather window was found in the next 48 hours."}
        </p>
      )}

      <p>{operation.message}</p>
    </div>
  );
}

// =====================================================
// ADVICE CARD
// =====================================================

function AdviceCard({ data }) {
  if (!data) return null;

  return (
    <div className="agriculture-advice-card">
      <div className="advice-icon">{data.icon}</div>

      <h3>{data.title}</h3>

      <p>{data.message}</p>
    </div>
  );
}

export default Weather;

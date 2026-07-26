import { useState } from "react";

import { recommendCrops } from "../utils/cropRecommendationEngine";

import {
  getCurrentWeather,
  getUserCoordinates,
} from "../services/weatherService";

import { getLocationName } from "../services/locationService";

import "./CropRecommendation.css";

function CropRecommendation() {
  const [language, setLanguage] = useState("hi");

  const [farmData, setFarmData] = useState({
    temperature: "",
    ph: "",
    moisture: "",
    soilType: "",
    season: "",

    // Soil Intelligence V2 nutrient data
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    npkUnit: "kg/ha",

    nutrientStatus: {
      nitrogen: null,
      phosphorus: null,
      potassium: null,
    },
  });

  const [result, setResult] = useState(null);
  // =====================================================
  // SAVED SOIL REPORT
  // =====================================================

  const [savedSoilReport, setSavedSoilReport] = useState(() => {
    try {
      const saved = localStorage.getItem("krishimitra_latest_soil_report");

      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Could not read saved soil report:", error);

      return null;
    }
  });

  const [soilReportMessage, setSoilReportMessage] = useState("");

  // =====================================================
  // LIVE WEATHER STATES
  // =====================================================

  const [liveWeather, setLiveWeather] = useState(null);
  const [location, setLocation] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);

  const [weatherError, setWeatherError] = useState("");

  // =====================================================
  // UPDATE INPUT
  // =====================================================

  const updateFarmData = (field, value) => {
    setFarmData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };
  // =====================================================
  // USE LATEST SOIL REPORT
  // =====================================================

  const useLatestSoilReport = () => {
    try {
      const saved = localStorage.getItem("krishimitra_latest_soil_report");

      if (!saved) {
        setSoilReportMessage(
          language === "hi"
            ? "कोई saved soil report नहीं मिली। पहले Soil Fertility में Advanced Soil Test करें।"
            : "No saved soil report found. Complete an Advanced Soil Test in Soil Fertility first.",
        );

        return;
      }

      const report = JSON.parse(saved);

      setSavedSoilReport(report);

      setFarmData((previous) => ({
        ...previous,

        ph: report.ph ?? previous.ph,
        moisture: report.moisture ?? previous.moisture,

        soilType:
          normalizeSoilType(report.soilType || report.soilColor) ||
          previous.soilType,

        nitrogen: report.nitrogen ?? previous.nitrogen,

        phosphorus: report.phosphorus ?? previous.phosphorus,

        potassium: report.potassium ?? previous.potassium,

        npkUnit: report.npkUnit || previous.npkUnit || "kg/ha",

        nutrientStatus: {
          nitrogen: report.nutrientStatus?.nitrogen ?? null,

          phosphorus: report.nutrientStatus?.phosphorus ?? null,

          potassium: report.nutrientStatus?.potassium ?? null,
        },
      }));

      setResult(null);

      setSoilReportMessage(
        language === "hi"
          ? "✅ नवीनतम Soil Fertility report लागू कर दी गई है।"
          : "✅ Latest Soil Fertility report applied.",
      );
    } catch (error) {
      console.error("Could not load soil report:", error);

      setSoilReportMessage(
        language === "hi"
          ? "Soil report पढ़ने में समस्या हुई।"
          : "There was a problem reading the soil report.",
      );
    }
  };

  // =====================================================
  // NORMALIZE SOIL TYPE
  // =====================================================

  const normalizeSoilType = (value) => {
    if (!value) return "";

    const soil = String(value).trim().toLowerCase();

    if (soil.includes("loam") || soil.includes("दोमट")) {
      return "loamy";
    }

    if (soil.includes("clay") || soil.includes("चिकनी")) {
      return "clayey";
    }

    if (soil.includes("sand") || soil.includes("रेतीली")) {
      return "sandy";
    }

    return "";
  };

  // =====================================================
  // LIVE LOCATION + WEATHER
  // =====================================================

  const loadLiveFarmWeather = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      // Get farmer GPS coordinates
      const coordinates = await getUserCoordinates();

      // Fetch current weather
      const currentWeather = await getCurrentWeather(
        coordinates.latitude,
        coordinates.longitude,
      );

      // Convert coordinates into readable location
      const locationData = await getLocationName(
        coordinates.latitude,
        coordinates.longitude,
        language,
      );

      setLiveWeather(currentWeather);
      setLocation(locationData);

      // Automatically fill temperature
      setFarmData((previous) => ({
        ...previous,
        temperature: currentWeather.temperature ?? "",
      }));
    } catch (error) {
      console.error("Crop recommendation weather error:", error);

      setWeatherError(
        language === "hi"
          ? "Live location या weather load नहीं हो सका। आप temperature manually दर्ज कर सकते हैं।"
          : "Live location or weather could not be loaded. You can enter the temperature manually.",
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  // =====================================================
  // ANALYZE
  // =====================================================

  const analyzeFarm = () => {
    const recommendation = recommendCrops({
      soil: {
        ph: farmData.ph,
        moisture: farmData.moisture,
        soilType: farmData.soilType,

        nitrogen: farmData.nitrogen,
        phosphorus: farmData.phosphorus,
        potassium: farmData.potassium,
        npkUnit: farmData.npkUnit,

        nutrientStatus: farmData.nutrientStatus,
      },

      weather: {
        temperature: farmData.temperature,

        // Stored now so the engine can use these
        // as we expand weather compatibility.
        humidity: liveWeather?.humidity ?? null,

        precipitation: liveWeather?.precipitation ?? null,

        rain: liveWeather?.rain ?? null,
      },

      season: farmData.season || null,

      language,

      limit: 5,
    });
    console.log("🌱 KrishiMitra Recommendation Input:", recommendation.input);

    setResult(recommendation);
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetAnalysis = () => {
    setFarmData({
      temperature: liveWeather?.temperature ?? "",
      ph: "",
      moisture: "",
      soilType: "",
      season: "",

      nitrogen: "",
      phosphorus: "",
      potassium: "",
      npkUnit: "kg/ha",

      nutrientStatus: {
        nitrogen: null,
        phosphorus: null,
        potassium: null,
      },
    });

    setResult(null);
  };

  // =====================================================
  // LANGUAGE CHANGE
  // =====================================================

  const toggleLanguage = () => {
    setLanguage((previous) => (previous === "hi" ? "en" : "hi"));
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="crop-recommendation-page">
      <div className="crop-recommendation-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="crop-recommendation-header">
          <div>
            <span className="crop-ai-label">🌱 KRISHIMITRA AI</span>

            <h1>
              {language === "hi"
                ? "स्मार्ट फसल सिफारिश"
                : "Smart Crop Recommendation"}
            </h1>

            <p>
              {language === "hi"
                ? "अपनी मिट्टी, मौसम और season की जानकारी देकर अपने खेत के लिए उपयुक्त फसलों का विश्लेषण करें।"
                : "Analyze suitable crops for your farm using soil, weather and seasonal conditions."}
            </p>
          </div>

          <button type="button" onClick={toggleLanguage}>
            {language === "hi" ? "English" : "हिंदी"}
          </button>
        </header>

        {/* =================================================
            FARM CONDITIONS
        ================================================= */}

        <section className="crop-input-section">
          <h2>
            {language === "hi" ? "🌾 खेत की जानकारी" : "🌾 Farm Conditions"}
          </h2>

          {/* ===============================================
              LIVE FARM WEATHER
          =============================================== */}
          {/* ===============================================
    SAVED SOIL REPORT
=============================================== */}

          <div className="crop-saved-soil">
            <div className="crop-saved-soil-heading">
              <div>
                <strong>
                  🧪{" "}
                  {language === "hi"
                    ? "Soil Fertility Report"
                    : "Soil Fertility Report"}
                </strong>

                <p>
                  {savedSoilReport
                    ? language === "hi"
                      ? "आपकी पिछली Advanced Soil Test report उपलब्ध है।"
                      : "Your latest Advanced Soil Test report is available."
                    : language === "hi"
                      ? "अभी कोई saved soil report उपलब्ध नहीं है।"
                      : "No saved soil report is currently available."}
                </p>
              </div>

              <button
                type="button"
                onClick={useLatestSoilReport}
                className="crop-use-soil-button"
              >
                🧪{" "}
                {language === "hi"
                  ? "Latest Soil Report उपयोग करें"
                  : "Use Latest Soil Report"}
              </button>
            </div>

            {soilReportMessage && (
              <p className="crop-soil-report-message">{soilReportMessage}</p>
            )}

            {savedSoilReport && (
              <div className="crop-soil-report-preview">
                {savedSoilReport.ph !== undefined &&
                  savedSoilReport.ph !== null && (
                    <span>🧪 pH: {savedSoilReport.ph}</span>
                  )}

                {savedSoilReport.moisture !== undefined &&
                  savedSoilReport.moisture !== null && (
                    <span>💧 Moisture: {savedSoilReport.moisture}%</span>
                  )}

                {savedSoilReport.nitrogen !== undefined &&
                  savedSoilReport.nitrogen !== null && (
                    <span>N: {savedSoilReport.nitrogen}</span>
                  )}

                {savedSoilReport.phosphorus !== undefined &&
                  savedSoilReport.phosphorus !== null && (
                    <span>P: {savedSoilReport.phosphorus}</span>
                  )}

                {savedSoilReport.potassium !== undefined &&
                  savedSoilReport.potassium !== null && (
                    <span>K: {savedSoilReport.potassium}</span>
                  )}
              </div>
            )}
          </div>

          <div className="crop-live-weather">
            <button
              type="button"
              onClick={loadLiveFarmWeather}
              disabled={weatherLoading}
              className="crop-live-weather-button"
            >
              {weatherLoading
                ? language === "hi"
                  ? "⏳ मौसम लोड हो रहा है..."
                  : "⏳ Loading Weather..."
                : language === "hi"
                  ? "📍 लाइव खेत मौसम उपयोग करें"
                  : "📍 Use Live Farm Weather"}
            </button>

            {location && liveWeather && (
              <div className="crop-live-weather-info">
                <div>
                  <strong>📍 {location.primaryPlace}</strong>

                  {location.secondaryPlace && (
                    <span>{location.secondaryPlace}</span>
                  )}
                </div>

                <div>
                  <strong>
                    {liveWeather.icon} {liveWeather.temperature}°C
                  </strong>

                  <span>
                    💧 {liveWeather.humidity}%{" • "}
                    {liveWeather.condition}
                  </span>
                </div>
              </div>
            )}

            {weatherError && (
              <p className="crop-weather-error">⚠️ {weatherError}</p>
            )}
          </div>

          {/* ===============================================
              INPUT GRID
          =============================================== */}

          <div className="crop-input-grid">
            {/* TEMPERATURE */}

            <label>
              <span>
                🌡️ {language === "hi" ? "तापमान (°C)" : "Temperature (°C)"}
              </span>

              <input
                type="number"
                value={farmData.temperature}
                onChange={(event) =>
                  updateFarmData("temperature", event.target.value)
                }
                placeholder="28"
              />

              {liveWeather && (
                <small>
                  🌦️{" "}
                  {language === "hi"
                    ? "Live weather से प्राप्त"
                    : "Loaded from live weather"}
                </small>
              )}
            </label>

            {/* SOIL PH */}

            <label>
              <span>🧪 Soil pH</span>

              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={farmData.ph}
                onChange={(event) => updateFarmData("ph", event.target.value)}
                placeholder="6.8"
              />
            </label>

            {/* SOIL MOISTURE */}

            <label>
              <span>
                💧{" "}
                {language === "hi" ? "मिट्टी की नमी (%)" : "Soil Moisture (%)"}
              </span>

              <input
                type="number"
                min="0"
                max="100"
                value={farmData.moisture}
                onChange={(event) =>
                  updateFarmData("moisture", event.target.value)
                }
                placeholder="45"
              />
            </label>

            {/* SOIL TYPE */}

            <label>
              <span>
                🪨 {language === "hi" ? "मिट्टी का प्रकार" : "Soil Type"}
              </span>

              <select
                value={farmData.soilType}
                onChange={(event) =>
                  updateFarmData("soilType", event.target.value)
                }
              >
                <option value="">
                  {language === "hi" ? "मिट्टी चुनें" : "Select soil"}
                </option>

                <option value="loamy">
                  {language === "hi" ? "दोमट मिट्टी" : "Loamy"}
                </option>

                <option value="clayey">
                  {language === "hi" ? "चिकनी मिट्टी" : "Clayey"}
                </option>

                <option value="sandy">
                  {language === "hi" ? "रेतीली मिट्टी" : "Sandy"}
                </option>
              </select>
            </label>

            {/* SEASON */}

            <label>
              <span>
                📅 {language === "hi" ? "फसल का मौसम" : "Growing Season"}
              </span>

              <select
                value={farmData.season}
                onChange={(event) =>
                  updateFarmData("season", event.target.value)
                }
              >
                <option value="">
                  {language === "hi" ? "Season चुनें" : "Select season"}
                </option>

                <option value="kharif">Kharif</option>

                <option value="rabi">Rabi</option>
              </select>
            </label>
          </div>

          {/* ===============================================
              ACTIONS
          =============================================== */}

          <div className="crop-analysis-actions">
            <button
              type="button"
              onClick={analyzeFarm}
              className="crop-analyze-button"
            >
              🌱 {language === "hi" ? "फसल विश्लेषण करें" : "Analyze Crops"}
            </button>

            {result && (
              <button
                type="button"
                onClick={resetAnalysis}
                className="crop-reset-button"
              >
                ↻ {language === "hi" ? "नया विश्लेषण" : "New Analysis"}
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        {result && (
          <section className="crop-results-section">
            <div className="crop-results-heading">
              <div>
                <span className="crop-ai-label">
                  🤖 KRISHIMITRA CROP INTELLIGENCE
                </span>

                <h2>
                  {language === "hi"
                    ? "आपके खेत के लिए फसलें"
                    : "Recommended Crops"}
                </h2>
              </div>

              <span>
                {result.analyzedCrops}{" "}
                {language === "hi" ? "फसलों का विश्लेषण" : "crops analyzed"}
              </span>
            </div>
            {result.dataConfidence && (
              <div className="crop-data-confidence">
                <div>
                  <strong>
                    🎯{" "}
                    {language === "hi"
                      ? "Recommendation Confidence"
                      : "Recommendation Confidence"}
                  </strong>

                  <span>
                    {result.dataConfidence.score}% —{" "}
                    {result.dataConfidence.level === "high"
                      ? language === "hi"
                        ? "उच्च"
                        : "High"
                      : result.dataConfidence.level === "medium"
                        ? language === "hi"
                          ? "मध्यम"
                          : "Medium"
                        : language === "hi"
                          ? "कम"
                          : "Low"}
                  </span>
                </div>

                <p>
                  {language === "hi"
                    ? `${result.dataConfidence.availableFields}/${result.dataConfidence.totalFields} महत्वपूर्ण data inputs उपलब्ध हैं।`
                    : `${result.dataConfidence.availableFields}/${result.dataConfidence.totalFields} important data inputs are available.`}
                </p>
              </div>
            )}

            {/* LIVE DATA USED */}

            {liveWeather && location && (
              <div className="crop-analysis-source">
                <span>📍 {location.primaryPlace}</span>

                <span>🌡️ {liveWeather.temperature}°C</span>

                <span>💧 {liveWeather.humidity}%</span>

                <span>
                  {liveWeather.icon} {liveWeather.condition}
                </span>
              </div>
            )}

            {/* =============================================
                RECOMMENDATION LIST
            ============================================= */}

            <div className="crop-recommendation-list">
              {result.recommendations.map((crop, index) => (
                <article
                  key={crop.id}
                  className={`crop-result-card ${
                    index === 0 ? "best-crop-card" : ""
                  }`}
                >
                  <div className="crop-result-rank">#{index + 1}</div>

                  <div className="crop-result-icon">{crop.icon}</div>

                  <div className="crop-result-main">
                    <div className="crop-result-title">
                      <div>
                        <h3>{crop.name}</h3>

                        <span>{crop.category}</span>
                      </div>

                      <strong>
                        {crop.score !== null ? `${crop.score}%` : "—"}
                      </strong>
                    </div>

                    {/* SCORE BAR */}

                    <div className="crop-score-bar">
                      <div
                        style={{
                          width: `${crop.score ?? 0}%`,
                        }}
                      />
                    </div>

                    <p>Suitability: {crop.suitability}</p>

                    {/* WHY IT MATCHES */}

                    {crop.reasons.length > 0 && (
                      <div className="crop-reasons">
                        <strong>
                          ✅{" "}
                          {language === "hi"
                            ? "क्यों उपयुक्त है"
                            : "Why it matches"}
                        </strong>

                        <ul>
                          {crop.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* RISKS */}

                    {crop.risks.length > 0 && (
                      <div className="crop-risks">
                        <strong>
                          ⚠️{" "}
                          {language === "hi"
                            ? "ध्यान देने योग्य बातें"
                            : "Things to consider"}
                        </strong>

                        <ul>
                          {crop.risks.map((risk, riskIndex) => (
                            <li key={riskIndex}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* =============================================
    DISEASE WEATHER WATCH
============================================= */}

                    {Array.isArray(crop.diseaseWeatherRisks) &&
                      crop.diseaseWeatherRisks.length > 0 && (
                        <div className="crop-disease-weather-watch">
                          <div className="crop-disease-watch-heading">
                            <strong>
                              🦠{" "}
                              {language === "hi"
                                ? "Disease Weather Watch"
                                : "Disease Weather Watch"}
                            </strong>

                            <span>
                              {language === "hi"
                                ? "मौसम आधारित"
                                : "Weather-based"}
                            </span>
                          </div>

                          <p className="crop-disease-watch-note">
                            {language === "hi"
                              ? "मौजूदा मौसम कुछ रोगों के लिए अनुकूल परिस्थितियाँ बना सकता है। यह रोग की पुष्टि नहीं है।"
                              : "Current weather may create favorable conditions for some diseases. This is not a disease diagnosis."}
                          </p>

                          <ul>
                            {crop.diseaseWeatherRisks.map((risk, riskIndex) => (
                              <li key={`${risk.disease}-${riskIndex}`}>
                                <strong>{risk.disease}</strong>

                                <span>
                                  {risk.level === "high"
                                    ? language === "hi"
                                      ? "उच्च मौसम जोखिम"
                                      : "High weather risk"
                                    : language === "hi"
                                      ? "मौसम निगरानी"
                                      : "Weather watch"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default CropRecommendation;

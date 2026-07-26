import { useEffect, useState } from "react";
import "./DiseaseDetection.css";

import {
  getCurrentWeather,
  getUserCoordinates,
  getWeatherCache,
  saveWeatherCache,
  isWeatherCacheFresh,
} from "../services/weatherService";

import {
  detectCropDisease,
  validateDiseaseImage,
  isDiseaseModelConnected,
} from "../services/diseaseDetectionService";

import { analyzeDiseaseWeatherRisk } from "../utils/diseaseWeatherRisk";
import PageNavigation from "../components/navigation/PageNavigation";

function DiseaseDetection() {
  // =====================================================
  // STATE
  // =====================================================

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Weather intelligence
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const modelConnected = isDiseaseModelConnected();

  // =====================================================
  // LOAD WEATHER FOR DISEASE INTELLIGENCE
  // =====================================================

  async function loadDiseaseWeather() {
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      // -------------------------------------------------
      // 1. TRY FRESH CACHED WEATHER FIRST
      // -------------------------------------------------

      const cachedWeather = getWeatherCache();

      if (cachedWeather && isWeatherCacheFresh(cachedWeather)) {
        setWeatherData(cachedWeather.data);

        return cachedWeather.data;
      }

      // -------------------------------------------------
      // 2. GET USER LOCATION
      // -------------------------------------------------

      const coordinates = await getUserCoordinates();

      // -------------------------------------------------
      // 3. FETCH CURRENT WEATHER
      // -------------------------------------------------

      const weather = await getCurrentWeather(
        coordinates.latitude,
        coordinates.longitude,
      );

      // -------------------------------------------------
      // 4. CACHE WEATHER
      // -------------------------------------------------

      saveWeatherCache(weather);

      setWeatherData(weather);

      return weather;
    } catch (weatherLoadError) {
      console.error("Disease weather intelligence error:", weatherLoadError);

      setWeatherError("Live weather could not be loaded.");

      return null;
    } finally {
      setWeatherLoading(false);
    }
  }

  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setResult(null);

    const validation = validateDiseaseImage(file);

    if (!validation.valid) {
      setError(validation.error);

      event.target.value = "";

      return;
    }

    // Remove previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(file);

    setImage(file);
    setPreview(imageUrl);
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);

    setResult(null);
    setError("");

    setWeatherData(null);
    setWeatherError(null);
  };

  // =====================================================
  // ANALYSE IMAGE
  // =====================================================

  const handleAnalyze = async () => {
    if (!image || isAnalyzing) {
      return;
    }

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      // -------------------------------------------------
      // AI DISEASE DETECTION
      // -------------------------------------------------

      const prediction = await detectCropDisease(image);

      // -------------------------------------------------
      // LOAD LIVE / CACHED WEATHER
      // -------------------------------------------------

      const currentWeather = await loadDiseaseWeather();

      // -------------------------------------------------
      // DISEASE WEATHER RISK ANALYSIS
      // -------------------------------------------------
      const weatherRisk = analyzeDiseaseWeatherRisk({
        className: prediction.className,
        disease: prediction.disease,
        weather: currentWeather,
      });

      console.log("🌦️ Disease Detection Weather:", currentWeather);

      console.log("🦠 Disease Weather Risk:", weatherRisk);

      // -------------------------------------------------
      // COMBINE RESULT
      // -------------------------------------------------

      setResult({
        ...prediction,
        weatherRisk,
      });
    } catch (analysisError) {
      console.error("Crop disease analysis error:", analysisError);

      setError(analysisError?.message || "Crop disease analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // =====================================================
  // CLEAN PREVIEW URL
  // =====================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <PageNavigation />
    <main className="disease-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="disease-hero">
        <span className="disease-label">🌿 KRISHIMITRA CROP HEALTH</span>

        <h1>📸 AI Crop Disease Detection</h1>

        <p>
          Upload a clear crop leaf image and let KrishiMitra analyse it for
          possible disease symptoms.
        </p>
      </section>

      {/* =================================================
          MODEL STATUS
      ================================================= */}

      <div
        className={
          modelConnected
            ? "disease-model-status connected"
            : "disease-model-status disconnected"
        }
      >
        <span>{modelConnected ? "●" : "○"}</span>

        <p>
          {modelConnected
            ? "AI disease detection model connected"
            : "AI disease detection model not connected yet"}
        </p>
      </div>

      {/* =================================================
          IMAGE UPLOAD
      ================================================= */}

      <section className="disease-upload-card">
        {!preview ? (
          <>
            <div className="disease-upload-icon">📷</div>

            <h2>Upload Crop Image</h2>

            <p>
              Take a clear close-up photo of the affected leaf in good lighting.
            </p>

            <label className="disease-upload-button">
              📸 Select Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                hidden
              />
            </label>

            <div className="disease-photo-tips">
              <span>✓ Clear leaf</span>

              <span>✓ Good lighting</span>

              <span>✓ Close-up image</span>
            </div>
          </>
        ) : (
          <div className="disease-preview">
            <img src={preview} alt="Selected crop leaf" />

            <div className="disease-image-info">
              <strong>{image?.name}</strong>

              {image?.size && (
                <span>{(image.size / (1024 * 1024)).toFixed(2)} MB</span>
              )}
            </div>

            <div className="disease-preview-actions">
              <button
                type="button"
                className="disease-remove-button"
                onClick={removeImage}
                disabled={isAnalyzing}
              >
                ✕ Remove
              </button>

              <button
                type="button"
                className="disease-analyze-button"
                onClick={handleAnalyze}
                disabled={!image || isAnalyzing}
              >
                {isAnalyzing ? "⏳ Analysing..." : "🔬 Analyse Crop"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =================================================
          WEATHER LOADING STATUS
      ================================================= */}

      {weatherLoading && (
        <section className="disease-weather-loading">
          🌦️ Checking current farm weather...
        </section>
      )}

      {/* =================================================
          WEATHER ERROR
      ================================================= */}

      {weatherError && !weatherLoading && (
        <section className="disease-weather-error">
          <strong>🌦️ Weather intelligence unavailable</strong>

          <p>{weatherError}</p>

          <p>
            Disease detection can still be used without weather intelligence.
          </p>
        </section>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <section className="disease-error-card">
          <strong>⚠️ Analysis unavailable</strong>

          <p>{error}</p>
        </section>
      )}

      {/* =================================================
          ANALYSIS RESULT
      ================================================= */}

      {result && (
        <section className="disease-result-card">
          {/* =============================================
              RESULT HEADER
          ============================================= */}

          <div className="disease-result-header">
            <div>
              <span className="disease-result-label">ANALYSIS RESULT</span>

              <h2>
                {result.isLowConfidence
                  ? "⚠️ Unable to Reliably Diagnose"
                  : result.healthy
                    ? "🌿 Healthy Crop"
                    : `🦠 ${result.disease}`}
              </h2>
            </div>

            {result.confidence !== null && (
              <div className="disease-confidence">
                <strong>
                  {Math.round(
                    result.confidence <= 1
                      ? result.confidence * 100
                      : result.confidence,
                  )}
                  %
                </strong>

                <span>Confidence</span>
              </div>
            )}
          </div>

          {/* =============================================
              ALTERNATIVE AI PREDICTION
          ============================================= */}

          {result.secondPrediction &&
            !result.healthy &&
            ((typeof result.secondPrediction.confidence === "number" &&
              (result.secondPrediction.confidence <= 1
                ? result.secondPrediction.confidence * 100
                : result.secondPrediction.confidence) >= 10) ||
              result.reliability === "medium" ||
              result.reliability === "low") && (
              <div className="disease-alternative-prediction">
                <div className="disease-alternative-heading">
                  <strong>🔎 Alternative Possibility</strong>

                  {typeof result.secondPrediction.confidence === "number" && (
                    <span>
                      {Math.round(
                        result.secondPrediction.confidence <= 1
                          ? result.secondPrediction.confidence * 100
                          : result.secondPrediction.confidence,
                      )}
                      %
                    </span>
                  )}
                </div>

                <p>
                  The AI also considered{" "}
                  <strong>
                    {result.secondPrediction.className
                      ?.split("___")[1]
                      ?.replaceAll("_", " ") || "another disease"}
                  </strong>
                  . Consider this possibility if the visible symptoms do not
                  closely match the primary prediction.
                </p>
              </div>
            )}

          {/* =============================================
              AI RELIABILITY
          ============================================= */}

          {result.message && (
            <div
              className={
                result.reliability === "high"
                  ? "disease-ai-message high"
                  : result.reliability === "medium"
                    ? "disease-ai-message medium"
                    : "disease-ai-message low"
              }
            >
              <strong>
                {result.reliability === "high"
                  ? "✅ High confidence"
                  : result.reliability === "medium"
                    ? "⚠️ Verification recommended"
                    : "⚠️ Low confidence"}
              </strong>

              <p>{result.message}</p>
            </div>
          )}

          {/* =============================================
              CROP
          ============================================= */}

          {!result.isLowConfidence && (
            <div className="disease-result-row">
              <span>🌱 Crop</span>

              <strong>{result.crop}</strong>
            </div>
          )}

          {/* =============================================
              SEVERITY
          ============================================= */}

          {!result.isLowConfidence && result.severity && (
            <div className="disease-result-row">
              <span>⚠️ Severity</span>

              <strong>{result.severity}</strong>
            </div>
          )}

          {/* =============================================
              SYMPTOMS
          ============================================= */}

          {!result.isLowConfidence && result.symptoms?.length > 0 && (
            <div className="disease-result-section">
              <h3>🔍 Symptoms</h3>

              <ul>
                {result.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
          )}

          {/* =============================================
              TREATMENT
          ============================================= */}

          {!result.isLowConfidence && result.treatment?.length > 0 && (
            <div className="disease-result-section">
              <h3>💊 Management</h3>

              <ul>
                {result.treatment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* =============================================
              PREVENTION
          ============================================= */}

          {!result.isLowConfidence && result.prevention?.length > 0 && (
            <div className="disease-result-section">
              <h3>🛡️ Prevention</h3>

              <ul>
                {result.prevention.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* =============================================
              WEATHER & DISEASE RISK
          ============================================= */}

          {!result.isLowConfidence &&
            !result.healthy &&
            result.weatherRisk?.supported && (
              <div
                className={`disease-weather-risk ${result.weatherRisk.level}`}
              >
                {/* WEATHER RISK HEADER */}

                <div className="disease-weather-risk-header">
                  <div>
                    <span className="disease-weather-label">
                      🌦️ WEATHER & DISEASE RISK
                    </span>

                    <h3>Current Weather Risk</h3>
                  </div>

                  <div className="disease-weather-risk-badge">
                    {result.weatherRisk.level.toUpperCase()}
                  </div>
                </div>

                {/* WEATHER VALUES */}

                <div className="disease-weather-values">
                  {result.weatherRisk.weather?.temperature !== null &&
                    result.weatherRisk.weather?.temperature !== undefined && (
                      <span>
                        🌡️ {result.weatherRisk.weather.temperature}
                        °C
                      </span>
                    )}

                  {result.weatherRisk.weather?.humidity !== null &&
                    result.weatherRisk.weather?.humidity !== undefined && (
                      <span>💧 {result.weatherRisk.weather.humidity}%</span>
                    )}

                  {result.weatherRisk.weather?.rain !== null &&
                    result.weatherRisk.weather?.rain !== undefined && (
                      <span>🌧️ {result.weatherRisk.weather.rain} mm</span>
                    )}
                </div>

                {/* RISK SUMMARY */}

                <div className="disease-weather-summary">
                  {result.weatherRisk.level === "high" && (
                    <p>
                      Current weather contains several conditions that may favor{" "}
                      <strong>{result.weatherRisk.disease}</strong> development
                      or spread.
                    </p>
                  )}

                  {result.weatherRisk.level === "moderate" && (
                    <p>
                      Current weather contains some conditions that may favor{" "}
                      <strong>{result.weatherRisk.disease}</strong>.
                    </p>
                  )}

                  {result.weatherRisk.level === "low" && (
                    <p>
                      Current weather shows limited support for{" "}
                      <strong>{result.weatherRisk.disease}</strong> development
                      based on the available weather signals.
                    </p>
                  )}
                </div>

                {/* WHY THIS RATING */}

                {result.weatherRisk.reasons?.length > 0 && (
                  <div className="disease-weather-details">
                    <strong>🔎 Why this rating?</strong>

                    <ul>
                      {result.weatherRisk.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FARMER ACTIONS */}

                {result.weatherRisk.actions?.length > 0 && (
                  <div className="disease-weather-actions">
                    <strong>🌱 Recommended actions</strong>

                    <ul>
                      {result.weatherRisk.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* IMPORTANT NOTE */}

                <p className="disease-weather-note">
                  ℹ️ Weather risk indicates whether current conditions may favor
                  disease development. It does not confirm or rule out the AI
                  disease diagnosis.
                </p>
              </div>
            )}

          {/* =============================================
              UNSUPPORTED WEATHER KNOWLEDGE
          ============================================= */}

          {!result.isLowConfidence &&
            !result.healthy &&
            result.weatherRisk &&
            !result.weatherRisk.supported && (
              <div className="disease-weather-unsupported">
                <strong>🌦️ Weather Risk Analysis</strong>

                <p>
                  Weather-specific risk rules are not yet available for this
                  disease. The AI disease result is still shown normally.
                </p>
              </div>
            )}
        </section>
      )}

      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <div className="disease-disclaimer">
        ℹ️ KrishiMitra disease detection provides decision-support and should
        not replace professional agricultural diagnosis.
      </div>
    </main>
    </>
  );
}

export default DiseaseDetection;

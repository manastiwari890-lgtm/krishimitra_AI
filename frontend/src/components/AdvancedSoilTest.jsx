import { useState } from "react";
import SoilCardScanner from "./SoilCardScanner";
import { analyzeSoilData } from "../services/soilService";

// =====================================================
// KRISHIMITRA AI
// ADVANCED SOIL TEST
// =====================================================

// =====================================================
// NPK SOIL STATUS - KG/HA ONLY
// =====================================================

function getNutrientStatus(nutrient, value, unit) {
  if (value === null || value === undefined || value === "") {
    return "unknown";
  }

  // General kg/ha classification must NOT
  // be applied to ppm, mg/kg, %, etc.
  if (unit !== "kg/ha") {
    return "unclassified";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "unknown";
  }

  // Nitrogen
  if (nutrient === "nitrogen") {
    if (number < 240) return "low";
    if (number <= 480) return "medium";
    return "high";
  }

  // Phosphorus
  if (nutrient === "phosphorus") {
    if (number < 11) return "low";
    if (number <= 22) return "medium";
    return "high";
  }

  // Potassium
  if (nutrient === "potassium") {
    if (number < 110) return "low";
    if (number <= 280) return "medium";
    return "high";
  }

  return "unknown";
}

// =====================================================
// STATUS DISPLAY
// =====================================================

function getStatusDisplay(status, language) {
  if (status === "low") {
    return {
      icon: "🔴",
      label: language === "hi" ? "कम" : "Low",
    };
  }

  if (status === "medium") {
    return {
      icon: "🟢",
      label: language === "hi" ? "मध्यम" : "Medium",
    };
  }

  if (status === "high") {
    return {
      icon: "🟠",
      label: language === "hi" ? "अधिक" : "High",
    };
  }

  if (status === "unclassified") {
    return {
      icon: "⚪",
      label: language === "hi" ? "वर्गीकृत नहीं" : "Unclassified",
    };
  }

  return {
    icon: "⚪",
    label: language === "hi" ? "अज्ञात" : "Unknown",
  };
}

// =====================================================
// COMPONENT
// =====================================================

function AdvancedSoilTest({ language = "hi", onClose, onReportGenerated }) {
  // =====================================================
  // STATES
  // =====================================================

  const [values, setValues] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    npkUnit: "",
    ph: "",
    moisture: "",
  });

  const [report, setReport] = useState(null);

  // =====================================================
  // UPDATE INPUT
  // =====================================================

  const updateValue = (field, value) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (report) {
      setReport(null);
    }
  };

  // =====================================================
  // VALUES RECEIVED FROM SOIL CARD SCANNER
  // =====================================================

  const handleDetectedValues = (detectedValues) => {
    setValues((previous) => ({
      ...previous,
      ...detectedValues,
    }));

    setReport(null);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateValues = () => {
    if (
      values.nitrogen === "" ||
      values.phosphorus === "" ||
      values.potassium === "" ||
      values.ph === ""
    ) {
      alert(
        language === "hi"
          ? "कृपया Nitrogen, Phosphorus, Potassium और pH की सभी values भरें।"
          : "Please enter Nitrogen, Phosphorus, Potassium and pH values.",
      );

      return false;
    }

    const n = Number(values.nitrogen);
    const p = Number(values.phosphorus);
    const k = Number(values.potassium);
    const ph = Number(values.ph);

    if (
      Number.isNaN(n) ||
      Number.isNaN(p) ||
      Number.isNaN(k) ||
      Number.isNaN(ph)
    ) {
      alert(
        language === "hi"
          ? "कृपया सही numeric values भरें।"
          : "Please enter valid numeric values.",
      );

      return false;
    }

    if (n < 0 || p < 0 || k < 0) {
      alert(
        language === "hi"
          ? "N, P और K की values negative नहीं हो सकतीं।"
          : "N, P and K values cannot be negative.",
      );

      return false;
    }

    if (ph < 0 || ph > 14) {
      alert(
        language === "hi"
          ? "pH की value 0 से 14 के बीच होनी चाहिए।"
          : "pH must be between 0 and 14.",
      );

      return false;
    }

    if (values.moisture !== "") {
      const moisture = Number(values.moisture);

      if (Number.isNaN(moisture) || moisture < 0 || moisture > 100) {
        alert(
          language === "hi"
            ? "Moisture की value 0 से 100% के बीच होनी चाहिए।"
            : "Moisture must be between 0 and 100%.",
        );

        return false;
      }
    }

    return true;
  };

  // =====================================================
  // ANALYZE SOIL REPORT
  // =====================================================

  const analyzeAdvancedSoil = async () => {
    if (!validateValues()) {
      return;
    }

    const n = Number(values.nitrogen);
    const p = Number(values.phosphorus);
    const k = Number(values.potassium);
    const ph = Number(values.ph);

    const moisture = values.moisture !== "" ? Number(values.moisture) : null;
    // ===================================================
    // KRISHIMITRA SOIL INTELLIGENCE V2 - BACKEND
    // ===================================================

    let backendResult = null;

    try {
      backendResult = await analyzeSoilData({
        nitrogen: n,
        phosphorus: p,
        potassium: k,

        npkUnit: values.npkUnit || "kg/ha",

        ph,

        moisture,

        // Temporary value.
        // Later this will come automatically
        // from KrishiMitra live weather.
        temperature: 25,
      });

      console.log("KrishiMitra Soil V2 Result:", backendResult);
    } catch (error) {
      console.error("KrishiMitra Soil API Error:", error);

      alert(
        language === "hi"
          ? `Soil Intelligence से connection नहीं हो पाया: ${error.message}`
          : `Could not connect to Soil Intelligence: ${error.message}`,
      );

      return;
    }
    // =====================================================
    // BUILD REPORT FROM SOIL INTELLIGENCE V2 BACKEND
    // =====================================================

    const backendSoilValues = backendResult.soilValues || {};

    const backendNutrients = backendResult.nutrientAnalysis || {};

    const backendPh = backendResult.phAnalysis || {};

    const backendHealth = backendResult.soilHealth || {};

    const nitrogenStatus = backendNutrients.nitrogen?.status || "unknown";

    const phosphorusStatus = backendNutrients.phosphorus?.status || "unknown";

    const potassiumStatus = backendNutrients.potassium?.status || "unknown";

    // =====================================================
    // REPORT STATUS
    // =====================================================

    const phStatus =
      backendPh.label ||
      (language === "hi" ? "मिट्टी विश्लेषण" : "Soil Analysis");

    let statusIcon = "🟢";

    if (backendPh.severity === "high") {
      statusIcon = "🔴";
    } else if (backendPh.severity === "moderate") {
      statusIcon = "🟡";
    }

    // =====================================================
    // AUTHORITATIVE BACKEND REPORT
    // =====================================================

    const generatedReport = {
      status: phStatus,

      icon: statusIcon,

      observations: backendResult.observations || [],

      recommendations: backendResult.recommendations || [],

      nitrogen: backendSoilValues.nitrogen ?? n,

      phosphorus: backendSoilValues.phosphorus ?? p,

      potassium: backendSoilValues.potassium ?? k,

      npkUnit: backendSoilValues.npkUnit || values.npkUnit || "kg/ha",

      nutrientStatus: {
        nitrogen: nitrogenStatus,
        phosphorus: phosphorusStatus,
        potassium: potassiumStatus,
      },

      ph: backendSoilValues.ph ?? ph,

      moisture: backendSoilValues.moisture ?? moisture,

      temperature: backendSoilValues.temperature ?? null,

      // Soil Intelligence V2 data
      soilHealth: backendHealth,

      phAnalysis: backendPh,

      moistureAnalysis: backendResult.moistureAnalysis || null,

      recommendedCrops: backendResult.recommendedCrops || [],

      allCropScores: backendResult.allCropScores || [],

      // Keep this for Module 8:
      // 3D Soil Visualization
      visualization: backendResult.visualization || null,

      engine: backendResult.engine || null,

      generatedAt: new Date().toISOString(),
    };

    setReport(generatedReport);

    if (onReportGenerated) {
      onReportGenerated(generatedReport);
    }
  };

  // =====================================================
  // RESET TEST
  // =====================================================

  const resetAdvancedTest = () => {
    setValues({
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      npkUnit: "",
      ph: "",
      moisture: "",
    });

    setReport(null);
  };

  // =====================================================
  // VOICE REPORT
  // =====================================================

  const speakReport = () => {
    if (!report) return;

    if (!("speechSynthesis" in window)) {
      alert(
        language === "hi"
          ? "आपका Browser Voice सुविधा support नहीं करता।"
          : "Your browser does not support voice output.",
      );

      return;
    }

    window.speechSynthesis.cancel();

    const speechText = [
      report.status,
      ...report.observations,
      ...report.recommendations,
    ].join(" ");

    const speech = new SpeechSynthesisUtterance(speechText);

    speech.lang = language === "hi" ? "hi-IN" : "en-IN";

    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="advanced-soil-panel">
      {/* HEADER */}

      <div className="advanced-header">
        <div>
          <span className="assistant-label">🔬 ADVANCED SOIL ANALYSIS</span>

          <h2>Soil Health Card Analysis</h2>
        </div>

        <button
          type="button"
          className="advanced-close"
          onClick={onClose}
          aria-label="Close advanced soil test"
        >
          ✕
        </button>
      </div>

      <p className="advanced-description">
        {language === "hi"
          ? "अगर आपके पास Soil Health Card या Lab Soil Test Report है, तो उसे scan करें या नीचे values manually भरें।"
          : "If you have a Soil Health Card or laboratory soil test report, scan it or enter the values manually below."}
      </p>

      {/* SOIL CARD SCANNER */}

      <SoilCardScanner
        language={language}
        onValuesDetected={handleDetectedValues}
      />

      {/* DIVIDER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          margin: "30px 0",
          color: "#91a79b",
        }}
      >
        <div
          style={{
            height: "1px",
            flex: 1,
            background: "rgba(255,255,255,0.1)",
          }}
        />

        <span>
          {language === "hi" ? "या manually भरें" : "OR ENTER MANUALLY"}
        </span>

        <div
          style={{
            height: "1px",
            flex: 1,
            background: "rgba(255,255,255,0.1)",
          }}
        />
      </div>

      {/* MANUAL VALUES */}

      <div className="manual-soil-heading">
        <span className="assistant-label">✍️ MANUAL SOIL VALUES</span>

        <h3>
          {language === "hi" ? "Report की Values भरें" : "Enter Report Values"}
        </h3>

        <p className="advanced-description">
          {language === "hi"
            ? "ये values आपकी Soil Health Card या Lab Report से होनी चाहिए।"
            : "These values should come from your Soil Health Card or laboratory report."}
        </p>
      </div>

      {/* INPUT GRID */}

      <div className="advanced-input-grid">
        <label>
          <span>🌿 Nitrogen (N)</span>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={values.nitrogen}
            placeholder={language === "hi" ? "N की value" : "Enter N"}
            onChange={(event) => updateValue("nitrogen", event.target.value)}
          />
        </label>

        <label>
          <span>🌱 Phosphorus (P)</span>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={values.phosphorus}
            placeholder={language === "hi" ? "P की value" : "Enter P"}
            onChange={(event) => updateValue("phosphorus", event.target.value)}
          />
        </label>

        <label>
          <span>🥔 Potassium (K)</span>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={values.potassium}
            placeholder={language === "hi" ? "K की value" : "Enter K"}
            onChange={(event) => updateValue("potassium", event.target.value)}
          />
        </label>

        {/* NPK UNIT */}

        <label>
          <span>📏 NPK Unit</span>

          <select
            value={values.npkUnit}
            onChange={(event) => updateValue("npkUnit", event.target.value)}
          >
            <option value="">
              {language === "hi"
                ? "Report की unit चुनें"
                : "Select report unit"}
            </option>

            <option value="kg/ha">kg/ha</option>

            <option value="mg/kg">mg/kg</option>

            <option value="ppm">ppm</option>

            <option value="%">%</option>

            <option value="other">Other / अन्य</option>
          </select>
        </label>

        <label>
          <span>🧪 Soil pH</span>

          <input
            type="number"
            min="0"
            max="14"
            step="0.1"
            inputMode="decimal"
            value={values.ph}
            placeholder="0 - 14"
            onChange={(event) => updateValue("ph", event.target.value)}
          />
        </label>

        <label>
          <span>💧 Soil Moisture (Optional)</span>

          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            inputMode="decimal"
            value={values.moisture}
            placeholder="%"
            onChange={(event) => updateValue("moisture", event.target.value)}
          />
        </label>
      </div>

      {/* WARNING */}

      <div className="advanced-warning">
        ⚠️{" "}
        {language === "hi"
          ? "N, P और K की unit वही चुनें जो आपकी Soil Test Report में दी गई है। kg/ha classification को दूसरी units पर लागू नहीं किया जाएगा।"
          : "Select the N, P and K unit shown on your Soil Test Report. kg/ha classification will not be applied to other units."}
      </div>

      {/* ANALYZE */}

      {!report && (
        <button
          type="button"
          className="advanced-analyze-button"
          onClick={analyzeAdvancedSoil}
        >
          🔬{" "}
          {language === "hi"
            ? "Soil Report Analyze करें"
            : "Analyze Soil Report"}
        </button>
      )}

      {/* REPORT */}

      {report && (
        <div className="advanced-result">
          <div className="advanced-result-status">
            <div className="health-icon">{report.icon}</div>

            <span className="assistant-label">KRISHIMITRA ADVANCED REPORT</span>

            <h2>{report.status}</h2>
          </div>

          {/* VALUES */}

          <div className="advanced-report-values">
            <div>
              <span>🌿 Nitrogen</span>

              <strong>
                {report.nitrogen}
                {report.npkUnit ? ` ${report.npkUnit}` : ""}
              </strong>

              <small>
                {
                  getStatusDisplay(report.nutrientStatus.nitrogen, language)
                    .icon
                }{" "}
                {
                  getStatusDisplay(report.nutrientStatus.nitrogen, language)
                    .label
                }
              </small>
            </div>

            <div>
              <span>🌱 Phosphorus</span>

              <strong>
                {report.phosphorus}
                {report.npkUnit ? ` ${report.npkUnit}` : ""}
              </strong>

              <small>
                {
                  getStatusDisplay(report.nutrientStatus.phosphorus, language)
                    .icon
                }{" "}
                {
                  getStatusDisplay(report.nutrientStatus.phosphorus, language)
                    .label
                }
              </small>
            </div>

            <div>
              <span>🥔 Potassium</span>

              <strong>
                {report.potassium}
                {report.npkUnit ? ` ${report.npkUnit}` : ""}
              </strong>

              <small>
                {
                  getStatusDisplay(report.nutrientStatus.potassium, language)
                    .icon
                }{" "}
                {
                  getStatusDisplay(report.nutrientStatus.potassium, language)
                    .label
                }
              </small>
            </div>

            <div>
              <span>🧪 pH</span>
              <strong>{report.ph}</strong>
            </div>

            {report.moisture !== null && (
              <div>
                <span>💧 Moisture</span>

                <strong>{report.moisture}%</strong>
              </div>
            )}
          </div>

          {/* OBSERVATIONS */}

          <div className="advanced-observations">
            <h3>🔎 KrishiMitra Observation</h3>

            {report.observations.map((observation, index) => (
              <p key={index}>✓ {observation}</p>
            ))}
          </div>

          {/* RECOMMENDATIONS */}

          <div className="advanced-recommendations">
            <h3>
              💡{" "}
              {language === "hi" ? "KrishiMitra की सलाह" : "KrishiMitra Advice"}
            </h3>

            {report.recommendations.map((recommendation, index) => (
              <p key={index}>✓ {recommendation}</p>
            ))}
          </div>

          <div className="advanced-result-note">
            ℹ️{" "}
            {language === "hi"
              ? "यह analysis आपकी Soil Test Report values पर आधारित है। Low/Medium/High classification केवल kg/ha unit के लिए general soil-test reference के रूप में लागू होती है।"
              : "This analysis is based on your Soil Test Report values. Low/Medium/High classification is applied only to kg/ha values as a general soil-test reference."}
          </div>

          {/* ACTIONS */}

          <div className="result-actions">
            <button
              type="button"
              className="voice-button"
              onClick={speakReport}
            >
              🔊 {language === "hi" ? "Report सुनें" : "Listen to Report"}
            </button>

            <button
              type="button"
              className="restart-button"
              onClick={resetAdvancedTest}
            >
              ↻{" "}
              {language === "hi" ? "नई Report जाँचें" : "Check Another Report"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdvancedSoilTest;

import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

import {
  parseSoilReport,
  getSimpleSoilValues,
} from "../utils/soilReportParser";

function SoilCardScanner({
  language = "hi",
  onValuesDetected,
}) {
  // =====================================================
  // STATES
  // =====================================================

  const [reportImage, setReportImage] = useState(null);

  const [scanning, setScanning] = useState(false);

  const [progress, setProgress] = useState(0);

  const [ocrText, setOcrText] = useState("");

  const [error, setError] = useState("");

  const [parsedReport, setParsedReport] = useState(null);

  const [detected, setDetected] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
  });

  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert(
        language === "hi"
          ? "कृपया Soil Health Card की फोटो चुनें।"
          : "Please select an image of the Soil Health Card."
      );

      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert(
        language === "hi"
          ? "फोटो 10 MB से छोटी होनी चाहिए।"
          : "Please select an image smaller than 10 MB."
      );

      return;
    }

    // Remove previous preview
    if (reportImage?.preview) {
      URL.revokeObjectURL(reportImage.preview);
    }

    const preview = URL.createObjectURL(file);

    setReportImage({
      file,
      preview,
    });

    // Reset previous results
    setOcrText("");
    setError("");
    setProgress(0);
    setParsedReport(null);

    setDetected({
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      ph: "",
    });
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    if (reportImage?.preview) {
      URL.revokeObjectURL(reportImage.preview);
    }

    setReportImage(null);

    setOcrText("");

    setError("");

    setProgress(0);

    setParsedReport(null);

    setDetected({
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      ph: "",
    });
  };

  // =====================================================
  // OCR IMAGE PREPROCESSING
  // Improves contrast and resolution for table-heavy cards
  // =====================================================

  const preprocessImageForOCR = (file) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        try {
          const maxWidth = 2400;
          const scale = Math.max(
            1,
            Math.min(2.5, maxWidth / image.width)
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          const context = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          if (!context) {
            throw new Error("Canvas context unavailable.");
          }

          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          const pixels = imageData.data;

          for (let index = 0; index < pixels.length; index += 4) {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];

            const gray =
              0.299 * red +
              0.587 * green +
              0.114 * blue;

            // Increase contrast without using a hard threshold,
            // which helps preserve thin table text.
            const contrasted = Math.max(
              0,
              Math.min(255, (gray - 128) * 1.45 + 128)
            );

            pixels[index] = contrasted;
            pixels[index + 1] = contrasted;
            pixels[index + 2] = contrasted;
          }

          context.putImageData(imageData, 0, 0);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);

              if (!blob) {
                reject(
                  new Error(
                    "Could not prepare the image for OCR."
                  )
                );
                return;
              }

              resolve(blob);
            },
            "image/png",
            1
          );
        } catch (preprocessError) {
          URL.revokeObjectURL(objectUrl);
          reject(preprocessError);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error("Could not load the selected image.")
        );
      };

      image.src = objectUrl;
    });
  };

  // =====================================================
  // OCR SCANNER
  // =====================================================

  const scanReport = async () => {
    if (!reportImage?.file) {
      alert(
        language === "hi"
          ? "पहले Soil Health Card की फोटो चुनें।"
          : "Please select a Soil Health Card image first."
      );

      return;
    }

    setScanning(true);

    setError("");

    setOcrText("");

    setProgress(0);

    setParsedReport(null);

    let worker;

    try {
      // =================================================
      // CREATE TESSERACT WORKER
      // =================================================

      worker = await createWorker("eng", 1, {
        logger: (message) => {
          if (
            message.status === "recognizing text" &&
            typeof message.progress === "number"
          ) {
            setProgress(
              Math.round(message.progress * 100)
            );
          }
        },
      });

      // =================================================
      // OCR IMAGE PREPROCESSING
      // =================================================

      let imageForOCR = reportImage.file;

      try {
        imageForOCR = await preprocessImageForOCR(
          reportImage.file
        );
      } catch (preprocessError) {
        // If preprocessing fails, OCR still runs on the
        // original image instead of failing the whole scan.
        console.warn(
          "Soil Health Card preprocessing skipped:",
          preprocessError
        );
      }

      // =================================================
      // OCR
      // PSM 6 asks Tesseract to treat the card as one
      // structured block, which is usually better for tables.
      // =================================================

      const result = await worker.recognize(
        imageForOCR,
        {
          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: "6",
        }
      );

      const extractedText =
        result?.data?.text || "";

      setOcrText(extractedText);

      // =================================================
      // KRISHIMITRA SOIL REPORT PARSER
      // =================================================

      const parsed =
        parseSoilReport(extractedText);

      setParsedReport(parsed);

      // Convert parsed object into values expected by
      // AdvancedSoilTest
      const simpleValues =
        getSimpleSoilValues(parsed);

      setDetected(simpleValues);

      // =================================================
      // CHECK IF SOMETHING WAS FOUND
      // =================================================

      const foundValues = Object.values(
        simpleValues
      ).filter((value) => value !== "");

      if (foundValues.length === 0) {
        setError(
          language === "hi"
            ? "Report का text पढ़ा गया, लेकिन N, P, K या pH की values नहीं मिलीं। कृपया नीचे OCR text देखें या साफ फोटो से दोबारा कोशिश करें।"
            : "The report text was read, but N, P, K or pH values were not detected. Check the OCR text below or try again with a clearer image."
        );
      }
    } catch (scanError) {
      console.error(
        "Soil Health Card OCR Error:",
        scanError
      );

      setError(
        language === "hi"
          ? "Report scan नहीं हो सकी। Internet connection और फोटो की quality जाँचकर दोबारा कोशिश करें।"
          : "The report could not be scanned. Check your internet connection and image quality, then try again."
      );
    } finally {
      // =================================================
      // TERMINATE WORKER
      // =================================================

      if (worker) {
        try {
          await worker.terminate();
        } catch (workerError) {
          console.error(
            "Tesseract worker termination error:",
            workerError
          );
        }
      }

      setScanning(false);
    }
  };

  // =====================================================
  // UPDATE DETECTED VALUE
  // Farmer can correct OCR mistakes
  // =====================================================

  const updateDetectedValue = (field, value) => {
    setDetected((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // GET UNIT
  // =====================================================

  const getUnit = (field) => {
    if (!parsedReport) return "";

    return parsedReport?.[field]?.unit || "";
  };

  // =====================================================
  // DISPLAY UNIT
  // =====================================================

  const displayUnit = (field) => {
    const unit = getUnit(field);

    if (!unit) {
      return language === "hi"
        ? "Unit नहीं मिली"
        : "Unit not detected";
    }

    return unit;
  };

  // =====================================================
  // CONFIRM DETECTED VALUES
  // =====================================================

  const confirmDetectedValues = () => {
    const confirmed = {};

    // =================================================
    // NITROGEN
    // =================================================

    if (detected.nitrogen !== "") {
      const value = Number(detected.nitrogen);

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        alert(
          language === "hi"
            ? "Nitrogen की सही value भरें।"
            : "Please enter a valid Nitrogen value."
        );

        return;
      }

      confirmed.nitrogen =
        detected.nitrogen;
    }

    // =================================================
    // PHOSPHORUS
    // =================================================

    if (detected.phosphorus !== "") {
      const value = Number(
        detected.phosphorus
      );

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        alert(
          language === "hi"
            ? "Phosphorus की सही value भरें।"
            : "Please enter a valid Phosphorus value."
        );

        return;
      }

      confirmed.phosphorus =
        detected.phosphorus;
    }

    // =================================================
    // POTASSIUM
    // =================================================

    if (detected.potassium !== "") {
      const value = Number(
        detected.potassium
      );

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        alert(
          language === "hi"
            ? "Potassium की सही value भरें।"
            : "Please enter a valid Potassium value."
        );

        return;
      }

      confirmed.potassium =
        detected.potassium;
    }

    // =================================================
    // PH
    // =================================================

    if (detected.ph !== "") {
      const value = Number(detected.ph);

      if (
        Number.isNaN(value) ||
        value < 0 ||
        value > 14
      ) {
        alert(
          language === "hi"
            ? "pH की value 0 से 14 के बीच होनी चाहिए।"
            : "pH must be between 0 and 14."
        );

        return;
      }

      confirmed.ph =
        detected.ph;
    }

    // =================================================
    // NOTHING FOUND
    // =================================================

    if (
      Object.keys(confirmed).length === 0
    ) {
      alert(
        language === "hi"
          ? "Confirm करने के लिए कोई value नहीं है।"
          : "There are no values available to confirm."
      );

      return;
    }

    // =================================================
    // NPK UNIT
    // Pass the detected report unit to AdvancedSoilTest.
    // Use it only when the detected N/P/K units agree.
    // =================================================

    const detectedNpkUnits = [
      getUnit("nitrogen"),
      getUnit("phosphorus"),
      getUnit("potassium"),
    ].filter(Boolean);

    if (
      detectedNpkUnits.length > 0 &&
      detectedNpkUnits.every(
        (unit) => unit === detectedNpkUnits[0]
      )
    ) {
      confirmed.npkUnit = detectedNpkUnits[0];
    }

    // =================================================
    // SEND VALUES TO AdvancedSoilTest
    // =================================================

    if (onValuesDetected) {
      onValuesDetected({ ...confirmed });

      // The manual fields are below the scanner. Move the
      // user there so the transferred values are immediately
      // visible and can be verified before analysis.
      window.setTimeout(() => {
        document
          .querySelector(".manual-soil-heading")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }

    alert(
      language === "hi"
        ? "Values Advanced Soil Test में भेज दी गई हैं। Analysis करने से पहले उन्हें Soil Health Card से एक बार मिलाकर देखें।"
        : "The values have been sent to the Advanced Soil Test. Please compare them with the Soil Health Card before analysis."
    );
  };

  // =====================================================
  // CLEAN PREVIEW URL
  // =====================================================

  useEffect(() => {
    return () => {
      if (reportImage?.preview) {
        URL.revokeObjectURL(
          reportImage.preview
        );
      }
    };
  }, [reportImage]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="soil-card-scanner">

      {/* =================================================
          HEADING
      ================================================= */}

      <div className="scanner-heading">

        <span className="scanner-icon">
          📄
        </span>

        <div>

          <span className="assistant-label">
            KRISHIMITRA SMART SCANNER
          </span>

          <h3>
            {language === "hi"
              ? "Soil Health Card Scan करें"
              : "Scan Soil Health Card"}
          </h3>

          <p>
            {language === "hi"
              ? "Soil Health Card की साफ फोटो लें। KrishiMitra N, P, K, pH और उनकी units पढ़ने की कोशिश करेगा।"
              : "Take a clear photo of your Soil Health Card. KrishiMitra will try to detect N, P, K, pH and their units."}
          </p>

        </div>

      </div>

      {/* =================================================
          NO IMAGE SELECTED
      ================================================= */}

      {!reportImage && (

        <div className="scanner-upload-area">

          <div className="scanner-big-icon">
            📸
          </div>

          <h3>
            {language === "hi"
              ? "Soil Health Card की फोटो"
              : "Soil Health Card Photo"}
          </h3>

          <p>
            {language === "hi"
              ? "पूरा कार्ड साफ दिखाई देना चाहिए। N, P, K और pH वाली table blur नहीं होनी चाहिए।"
              : "Make sure the complete card is visible and the N, P, K and pH table is not blurry."}
          </p>

          <div className="scanner-buttons">

            {/* CAMERA */}

            <label className="scanner-camera-button">

              📷{" "}
              {language === "hi"
                ? "फोटो खींचें"
                : "Take Photo"}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImage}
              />

            </label>

            {/* GALLERY */}

            <label className="scanner-gallery-button">

              📁{" "}
              {language === "hi"
                ? "Gallery से चुनें"
                : "Choose From Gallery"}

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
              />

            </label>

          </div>

        </div>

      )}

      {/* =================================================
          IMAGE PREVIEW
      ================================================= */}

      {reportImage && (

        <div className="scanner-preview">

          <div className="scanner-preview-header">

            <span>
              ✓{" "}
              {language === "hi"
                ? "Soil Health Card चुना गया"
                : "Soil Health Card Selected"}
            </span>

            <button
              type="button"
              onClick={removeImage}
              disabled={scanning}
            >
              ✕
            </button>

          </div>

          <img
            src={reportImage.preview}
            alt="Soil Health Card"
            className="soil-card-preview-image"
          />

          {/* =================================================
              SCAN BUTTON
          ================================================= */}

          <button
            type="button"
            className="scan-report-button"
            onClick={scanReport}
            disabled={scanning}
          >

            {scanning
              ? language === "hi"
                ? `🔍 Report पढ़ रहे हैं... ${progress}%`
                : `🔍 Reading Report... ${progress}%`
              : language === "hi"
              ? "✨ Report Scan करें"
              : "✨ Scan Report"}

          </button>

          {/* =================================================
              PROGRESS BAR
          ================================================= */}

          {scanning && (

            <div
              style={{
                marginTop: "12px",
                width: "100%",
                height: "8px",
                background:
                  "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#4be58a",
                  transition:
                    "width 0.25s ease",
                }}
              />

            </div>

          )}

        </div>

      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="scanner-message">
          ⚠️ {error}
        </div>

      )}

      {/* =================================================
          DETECTED VALUES
      ================================================= */}

      {ocrText && (

        <div
          className="advanced-result"
          style={{
            marginTop: "20px",
          }}
        >

          <span className="assistant-label">
            🤖 KRISHIMITRA OCR
          </span>

          <h3>
            {language === "hi"
              ? "मिली हुई Values Confirm करें"
              : "Confirm Detected Values"}
          </h3>

          <p className="advanced-description">

            {language === "hi"
              ? "OCR गलती कर सकता है। Soil Health Card देखकर numbers और units को जरूर check करें।"
              : "OCR can make mistakes. Compare the numbers and units with your Soil Health Card before confirming."}

          </p>

          {/* =================================================
              NPK + PH INPUTS
          ================================================= */}

          <div className="advanced-input-grid">

            {/* NITROGEN */}

            <label>

              <span>
                🌿 Nitrogen (N)
              </span>

              <input
                type="number"
                min="0"
                value={detected.nitrogen}
                placeholder={
                  language === "hi"
                    ? "नहीं मिला"
                    : "Not detected"
                }
                onChange={(event) =>
                  updateDetectedValue(
                    "nitrogen",
                    event.target.value
                  )
                }
              />

              <small>
                Unit:{" "}
                {displayUnit("nitrogen")}
              </small>

            </label>

            {/* PHOSPHORUS */}

            <label>

              <span>
                🌱 Phosphorus (P)
              </span>

              <input
                type="number"
                min="0"
                value={detected.phosphorus}
                placeholder={
                  language === "hi"
                    ? "नहीं मिला"
                    : "Not detected"
                }
                onChange={(event) =>
                  updateDetectedValue(
                    "phosphorus",
                    event.target.value
                  )
                }
              />

              <small>
                Unit:{" "}
                {displayUnit(
                  "phosphorus"
                )}
              </small>

            </label>

            {/* POTASSIUM */}

            <label>

              <span>
                🥔 Potassium (K)
              </span>

              <input
                type="number"
                min="0"
                value={detected.potassium}
                placeholder={
                  language === "hi"
                    ? "नहीं मिला"
                    : "Not detected"
                }
                onChange={(event) =>
                  updateDetectedValue(
                    "potassium",
                    event.target.value
                  )
                }
              />

              <small>
                Unit:{" "}
                {displayUnit(
                  "potassium"
                )}
              </small>

            </label>

            {/* PH */}

            <label>

              <span>
                🧪 Soil pH
              </span>

              <input
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={detected.ph}
                placeholder={
                  language === "hi"
                    ? "नहीं मिला"
                    : "Not detected"
                }
                onChange={(event) =>
                  updateDetectedValue(
                    "ph",
                    event.target.value
                  )
                }
              />

              <small>
                {language === "hi"
                  ? "pH की कोई unit नहीं होती"
                  : "pH has no unit"}
              </small>

            </label>

          </div>

          {/* =================================================
              UNIT WARNING
          ================================================= */}

          <div className="advanced-warning">

            ⚠️{" "}

            {language === "hi"
              ? "अगर किसी nutrient की unit नहीं मिली है तो KrishiMitra अभी उसकी Low / Medium / High fertility category अनुमान से नहीं बताएगा।"
              : "If a nutrient unit was not detected, KrishiMitra will not guess its Low / Medium / High fertility category."}

          </div>

          {/* =================================================
              CONFIRM BUTTON
          ================================================= */}

          <button
            type="button"
            className="advanced-analyze-button"
            onClick={confirmDetectedValues}
          >

            ✓{" "}

            {language === "hi"
              ? "Values सही हैं — इस्तेमाल करें"
              : "Values Are Correct — Use Them"}

          </button>

          {/* =================================================
              RAW OCR TEXT
          ================================================= */}

          <details
            style={{
              marginTop: "20px",
            }}
          >

            <summary
              style={{
                cursor: "pointer",
                color: "#91a79b",
              }}
            >

              {language === "hi"
                ? "🔎 OCR ने क्या पढ़ा?"
                : "🔎 View OCR Text"}

            </summary>

            <pre
              style={{
                marginTop: "12px",
                padding: "15px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background:
                  "rgba(0,0,0,0.25)",
                borderRadius: "10px",
                color: "#a9bcb1",
                fontSize: "12px",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {ocrText}
            </pre>

          </details>

        </div>

      )}

      {/* =================================================
          SCANNING TIPS
      ================================================= */}

      <div className="scanner-tips">

        <strong>
          💡{" "}
          {language === "hi"
            ? "बेहतर Scan के लिए"
            : "For Better Scanning"}
        </strong>

        <p>
          {language === "hi"
            ? "कार्ड को सीधा रखें, अच्छी रोशनी में फोटो लें, shadow से बचें और N, P, K, pH वाली nutrient table को जितना संभव हो साफ और बड़ा रखें।"
            : "Keep the card straight, use good lighting, avoid shadows, and make the N, P, K and pH nutrient table as clear and large as possible."}
        </p>

      </div>

    </div>
  );
}

export default SoilCardScanner;
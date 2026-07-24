import { useEffect, useState } from "react";
import "./DiseaseDetection.css";

import {
  detectCropDisease,
  validateDiseaseImage,
  isDiseaseModelConnected,
} from "../services/diseaseDetectionService";


function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const modelConnected =
    isDiseaseModelConnected();


  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setResult(null);

    const validation =
      validateDiseaseImage(file);

    if (!validation.valid) {
      setError(validation.error);

      event.target.value = "";
      return;
    }

    // Remove previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl =
      URL.createObjectURL(file);

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
      const prediction =
        await detectCropDisease(image);

      setResult(prediction);

    } catch (analysisError) {
      console.error(
        "Crop disease analysis error:",
        analysisError
      );

      setError(
        analysisError?.message ||
          "Crop disease analysis failed."
      );

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
    <main className="disease-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <section className="disease-hero">

        <span className="disease-label">
          🌿 KRISHIMITRA CROP HEALTH
        </span>

        <h1>
          📸 AI Crop Disease Detection
        </h1>

        <p>
          Upload a clear crop leaf image and
          let KrishiMitra analyse it for possible
          disease symptoms.
        </p>

      </section>


      {/* ================================================
          MODEL STATUS
      ================================================= */}

      <div
        className={
          modelConnected
            ? "disease-model-status connected"
            : "disease-model-status disconnected"
        }
      >
        <span>
          {modelConnected ? "●" : "○"}
        </span>

        <p>
          {modelConnected
            ? "AI disease detection model connected"
            : "AI disease detection model not connected yet"}
        </p>
      </div>


      {/* ================================================
          IMAGE UPLOAD
      ================================================= */}

      <section className="disease-upload-card">

        {!preview ? (
          <>

            <div className="disease-upload-icon">
              📷
            </div>

            <h2>
              Upload Crop Image
            </h2>

            <p>
              Take a clear close-up photo of the
              affected leaf in good lighting.
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

              <span>
                ✓ Clear leaf
              </span>

              <span>
                ✓ Good lighting
              </span>

              <span>
                ✓ Close-up image
              </span>

            </div>

          </>
        ) : (

          <div className="disease-preview">

            <img
              src={preview}
              alt="Selected crop leaf"
            />


            <div className="disease-image-info">

              <strong>
                {image?.name}
              </strong>

              {image?.size && (
                <span>
                  {(
                    image.size /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </span>
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
                disabled={
                  !image ||
                  isAnalyzing
                }
              >
                {isAnalyzing
                  ? "⏳ Analysing..."
                  : "🔬 Analyse Crop"}
              </button>

            </div>

          </div>
        )}

      </section>


      {/* ================================================
          ERROR
      ================================================= */}

      {error && (
        <section className="disease-error-card">

          <strong>
            ⚠️ Analysis unavailable
          </strong>

          <p>{error}</p>

        </section>
      )}


      {/* ================================================
          ANALYSIS RESULT
      ================================================= */}

      {result && (
        <section className="disease-result-card">


          {/* RESULT HEADER */}

          <div className="disease-result-header">

            <div>

              <span className="disease-result-label">
                ANALYSIS RESULT
              </span>

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
                      : result.confidence
                  )}
                  %
                </strong>

                <span>
                  Confidence
                </span>

              </div>
            )}

          </div>


          {/* ================================================
              AI RELIABILITY
          ================================================= */}

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

              <p>
                {result.message}
              </p>

            </div>
          )}


          {/* ================================================
              CROP
          ================================================= */}

          {!result.isLowConfidence && (
            <div className="disease-result-row">

              <span>
                🌱 Crop
              </span>

              <strong>
                {result.crop}
              </strong>

            </div>
          )}


          {/* ================================================
              SEVERITY
          ================================================= */}

          {!result.isLowConfidence &&
            result.severity && (

            <div className="disease-result-row">

              <span>
                ⚠️ Severity
              </span>

              <strong>
                {result.severity}
              </strong>

            </div>
          )}


          {/* ================================================
              SYMPTOMS
          ================================================= */}

          {!result.isLowConfidence &&
            result.symptoms.length > 0 && (

            <div className="disease-result-section">

              <h3>
                🔍 Symptoms
              </h3>

              <ul>
                {result.symptoms.map(
                  (symptom, index) => (

                    <li key={index}>
                      {symptom}
                    </li>

                  )
                )}
              </ul>

            </div>
          )}


          {/* ================================================
              TREATMENT
          ================================================= */}

          {!result.isLowConfidence &&
            result.treatment.length > 0 && (

            <div className="disease-result-section">

              <h3>
                💊 Management
              </h3>

              <ul>
                {result.treatment.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}
              </ul>

            </div>
          )}


          {/* ================================================
              PREVENTION
          ================================================= */}

          {!result.isLowConfidence &&
            result.prevention.length > 0 && (

            <div className="disease-result-section">

              <h3>
                🛡️ Prevention
              </h3>

              <ul>
                {result.prevention.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}
              </ul>

            </div>
          )}

        </section>
      )}


      {/* ================================================
          DISCLAIMER
      ================================================= */}

      <div className="disease-disclaimer">

        ℹ️ KrishiMitra disease detection provides
        decision-support and should not replace
        professional agricultural diagnosis.

      </div>

    </main>
  );
}

export default DiseaseDetection;
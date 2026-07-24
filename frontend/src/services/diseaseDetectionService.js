import { getDiseaseKnowledge } from "../data/diseaseKnowledgeBase";
// =====================================================
// KRISHIMITRA AI
// DISEASE DETECTION SERVICE
// =====================================================

// =====================================================
// CONFIGURATION
// =====================================================

const DISEASE_API_URL =
  import.meta.env.VITE_DISEASE_API_URL ||
  "http://127.0.0.1:8000/api/disease/detect";

// =====================================================
// IMAGE SETTINGS
// =====================================================

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// =====================================================
// VALIDATE IMAGE
// =====================================================

export function validateDiseaseImage(file) {
  if (!file) {
    return {
      valid: false,
      error: "Please select a crop image.",
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a JPG, JPEG, PNG or WEBP image.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: "Image size must be less than 8 MB.",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

// =====================================================
// FORMAT CLASS NAME
// =====================================================

function formatPredictionClass(className) {
  if (!className) {
    return {
      crop: "Unknown",
      disease: "Unknown",
      healthy: false,
    };
  }

  // PlantVillage classes use:
  // Tomato___Early_blight
  // Potato___healthy
  // Corn_(maize)___Northern_Leaf_Blight

  const parts = className.split("___");

  const rawCrop = parts[0] || "Unknown";
  const rawDisease = parts[1] || "Unknown";

  const crop = rawCrop.replaceAll("_", " ").replace(/\s+/g, " ").trim();

  const disease = rawDisease.replaceAll("_", " ").replace(/\s+/g, " ").trim();

  const healthy = disease.toLowerCase() === "healthy";

  return {
    crop,
    disease,
    healthy,
  };
}

// =====================================================
// NORMALIZE API RESULT
// =====================================================

function normalizeDiseaseResult(data) {
  if (!data) {
    throw new Error("Disease detection returned an empty response.");
  }

  if (!data.prediction) {
    throw new Error(
      "Disease detection response does not contain a prediction.",
    );
  }

  const prediction = data.prediction;

  const formatted = formatPredictionClass(prediction.className);
  const knowledge = getDiseaseKnowledge(prediction.className);

  const reliability = prediction.reliability || "unknown";

  const needsReview = Boolean(prediction.needsReview);

  const isLowConfidence = reliability === "low";

  return {
    // -----------------------------------------------
    // MAIN RESULT
    // -----------------------------------------------

    crop: formatted.crop,

    disease: formatted.disease,

    healthy: formatted.healthy,

    confidence:
      typeof prediction.confidence === "number" ? prediction.confidence : null,

    // -----------------------------------------------
    // AI RELIABILITY
    // -----------------------------------------------

    reliability,

    needsReview,

    isLowConfidence,

    message: prediction.message || null,

    // -----------------------------------------------
    // MODEL INFORMATION
    // -----------------------------------------------

    classIndex: prediction.classIndex ?? null,

    className: prediction.className || null,

    // -----------------------------------------------
    // SECOND PREDICTION
    // -----------------------------------------------

    secondPrediction: prediction.secondPrediction || null,

    // -----------------------------------------------
    // FUTURE DISEASE INFORMATION
    // -----------------------------------------------
    severity: null,

    symptoms: knowledge?.symptoms || [],

    treatment: knowledge?.treatment || [],

    prevention: knowledge?.prevention || [],
    // -----------------------------------------------
    // METADATA
    // -----------------------------------------------

    filename: data.filename || null,

    modelConnected: Boolean(data.modelConnected),

    raw: data,

    analyzedAt: new Date().toISOString(),
  };
}

// =====================================================
// CALL DISEASE DETECTION API
// =====================================================

export async function detectCropDisease(imageFile) {
  // -----------------------------------------------
  // VALIDATE IMAGE
  // -----------------------------------------------

  const validation = validateDiseaseImage(imageFile);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // -----------------------------------------------
  // CHECK API CONFIGURATION
  // -----------------------------------------------

  if (!DISEASE_API_URL) {
    throw new Error("Disease detection model is not connected.");
  }

  // -----------------------------------------------
  // CREATE FORM DATA
  // -----------------------------------------------

  const formData = new FormData();

  formData.append("image", imageFile);

  // -----------------------------------------------
  // SEND REQUEST
  // -----------------------------------------------

  let response;

  try {
    response = await fetch(DISEASE_API_URL, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Disease API network error:", error);

    throw new Error(
      "Could not connect to the KrishiMitra disease detection service.",
    );
  }

  // -----------------------------------------------
  // HANDLE HTTP ERROR
  // -----------------------------------------------

  if (!response.ok) {
    let message = "Disease analysis failed.";

    try {
      const errorData = await response.json();

      // FastAPI normally returns:
      // { "detail": "error message" }

      if (errorData?.detail) {
        message = errorData.detail;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.error) {
        message = errorData.error;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  // -----------------------------------------------
  // READ JSON
  // -----------------------------------------------

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Disease service returned an invalid response.");
  }

  // -----------------------------------------------
  // NORMALIZE RESULT
  // -----------------------------------------------

  return normalizeDiseaseResult(data);
}

// =====================================================
// CHECK WHETHER MODEL IS CONFIGURED
// =====================================================

export function isDiseaseModelConnected() {
  return Boolean(DISEASE_API_URL);
}

import { getDiseaseKnowledge } from "../data/diseaseKnowledgeBase";

// =====================================================
// KRISHIMITRA AI
// DISEASE DETECTION SERVICE
// =====================================================
//
// Handles communication with the disease detection API
// and converts the raw ML response into a consistent
// frontend-friendly result.
//
// IMPORTANT:
// - Does NOT modify farmState
// - Does NOT invent disease severity
// - Uses the existing disease knowledge base
// - Preserves the existing API contract
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

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

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
      error:
        "Please select a crop image.",
    };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return {
      valid: false,
      error:
        "Please upload a JPG, JPEG, PNG or WEBP image.",
    };
  }

  if (
    file.size > MAX_IMAGE_SIZE
  ) {
    return {
      valid: false,
      error:
        "Image size must be less than 8 MB.",
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
//
// PlantVillage-style examples:
//
// Tomato___Early_blight
// Potato___healthy
// Corn_(maize)___Northern_Leaf_Blight
// =====================================================

function formatPredictionClass(
  className
) {
  if (!className) {
    return {
      crop: "Unknown",
      disease: "Unknown",
      healthy: false,
    };
  }

  const parts =
    String(className).split(
      "___"
    );

  const rawCrop =
    parts[0] || "Unknown";

  const rawDisease =
    parts[1] || "Unknown";

  const crop =
    rawCrop
      .replaceAll("_", " ")
      .replace(/\s+/g, " ")
      .trim();

  const disease =
    rawDisease
      .replaceAll("_", " ")
      .replace(/\s+/g, " ")
      .trim();

  const healthy =
    disease.toLowerCase() ===
    "healthy";

  return {
    crop,
    disease,
    healthy,
  };
}

// =====================================================
// NORMALIZE CONFIDENCE
// =====================================================
//
// Keeps confidence predictable for the UI.
//
// API may return:
// 0.92
// 92
// null
// =====================================================

function normalizeConfidence(
  confidence
) {
  if (
    typeof confidence !==
    "number" ||
    !Number.isFinite(confidence)
  ) {
    return null;
  }

  let value =
    confidence;

  // Convert percentage-style
  // confidence into 0-1.

  if (value > 1 && value <= 100) {
    value =
      value / 100;
  }

  return Math.max(
    0,
    Math.min(1, value)
  );
}

// =====================================================
// NORMALIZE RELIABILITY
// =====================================================

function normalizeReliability(
  reliability
) {
  const value =
    String(
      reliability || "unknown"
    )
      .trim()
      .toLowerCase();

  if (
    value === "high" ||
    value === "medium" ||
    value === "low"
  ) {
    return value;
  }

  return "unknown";
}

// =====================================================
// NORMALIZE SECOND PREDICTION
// =====================================================

function normalizeSecondPrediction(
  secondPrediction
) {
  if (!secondPrediction) {
    return null;
  }

  if (
    typeof secondPrediction !==
    "object"
  ) {
    return null;
  }

  const className =
    secondPrediction.className ||
    null;

  const formatted =
    formatPredictionClass(
      className
    );

  return {
    className,

    crop:
      secondPrediction.crop ||
      formatted.crop,

    disease:
      secondPrediction.disease ||
      formatted.disease,

    healthy:
      typeof secondPrediction.healthy ===
      "boolean"
        ? secondPrediction.healthy
        : formatted.healthy,

    confidence:
      normalizeConfidence(
        secondPrediction.confidence
      ),

    classIndex:
      secondPrediction.classIndex ??
      null,
  };
}

// =====================================================
// NORMALIZE WEATHER RISK
// =====================================================

function normalizeWeatherRisk(
  knowledge
) {
  const weatherRisk =
    knowledge?.weatherRisk;

  if (!weatherRisk) {
    return {
      available: false,
      level: "low",
      factors: [],
    };
  }

  const factors =
    Array.isArray(
      weatherRisk.factors
    )
      ? weatherRisk.factors
          .filter(Boolean)
          .map(String)
      : [];

  const level =
    ["low", "medium", "high"].includes(
      String(
        weatherRisk.level || "low"
      ).toLowerCase()
    )
      ? String(
          weatherRisk.level || "low"
        ).toLowerCase()
      : "low";

  return {
    available:
      factors.length > 0,

    level,

    factors,
  };
}

// =====================================================
// NORMALIZE KNOWLEDGE ARRAYS
// =====================================================

function normalizeKnowledgeList(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(Boolean)
    .map(String);
}

// =====================================================
// NORMALIZE API RESULT
// =====================================================

function normalizeDiseaseResult(
  data
) {
  if (!data) {
    throw new Error(
      "Disease detection returned an empty response."
    );
  }

  if (!data.prediction) {
    throw new Error(
      "Disease detection response does not contain a prediction."
    );
  }

  const prediction =
    data.prediction;

  const formatted =
    formatPredictionClass(
      prediction.className
    );

  const knowledge =
    getDiseaseKnowledge(
      prediction.className
    );

  const reliability =
    normalizeReliability(
      prediction.reliability
    );

  const confidence =
    normalizeConfidence(
      prediction.confidence
    );

  const needsReview =
    Boolean(
      prediction.needsReview
    );

  const isLowConfidence =
    reliability === "low" ||
    needsReview;

  const secondPrediction =
    normalizeSecondPrediction(
      prediction.secondPrediction
    );

  const weatherRisk =
    normalizeWeatherRisk(
      knowledge
    );

  // =================================================
  // SEVERITY
  // =================================================
  //
  // Do NOT estimate severity from confidence.
  //
  // Confidence answers:
  // "How confident is the model?"
  //
  // Severity answers:
  // "How serious is the disease?"
  //
  // These are different things.
  //
  // We only use severity if the knowledge base
  // explicitly provides it.
  // =================================================

  const severity =
    knowledge?.severity ??
    null;

  const severityLevel =
    knowledge?.severityLevel ??
    null;

  // =================================================
  // RETURN NORMALIZED RESULT
  // =================================================

  return {
    // -----------------------------------------------
    // MAIN RESULT
    // -----------------------------------------------

    crop:
      knowledge?.crop ||
      formatted.crop,

    disease:
      knowledge?.disease ||
      formatted.disease,

    healthy:
      typeof knowledge?.healthy ===
      "boolean"
        ? knowledge.healthy
        : formatted.healthy,

    confidence,

    // -----------------------------------------------
    // AI RELIABILITY
    // -----------------------------------------------

    reliability,

    needsReview,

    isLowConfidence,

    message:
      prediction.message ||
      null,

    // -----------------------------------------------
    // MODEL INFORMATION
    // -----------------------------------------------

    classIndex:
      prediction.classIndex ??
      null,

    className:
      prediction.className ||
      null,

    modelConnected:
      Boolean(
        data.modelConnected
      ),

    // -----------------------------------------------
    // SECOND PREDICTION
    // -----------------------------------------------

    secondPrediction,

    // -----------------------------------------------
    // DISEASE INFORMATION
    // -----------------------------------------------

    severity,

    severityLevel,

    symptoms:
      normalizeKnowledgeList(
        knowledge?.symptoms
      ),

    treatment:
      normalizeKnowledgeList(
        knowledge?.treatment
      ),

    prevention:
      normalizeKnowledgeList(
        knowledge?.prevention
      ),

    // -----------------------------------------------
    // WEATHER RISK
    // -----------------------------------------------

    weatherRisk,

    // -----------------------------------------------
    // METADATA
    // -----------------------------------------------

    filename:
      data.filename ||
      null,

    analyzedAt:
      new Date().toISOString(),

    // -----------------------------------------------
    // RAW API RESPONSE
    // -----------------------------------------------

    raw: data,
  };
}

// =====================================================
// CALL DISEASE DETECTION API
// =====================================================

export async function detectCropDisease(
  imageFile
) {
  // -----------------------------------------------
  // VALIDATE IMAGE
  // -----------------------------------------------

  const validation =
    validateDiseaseImage(
      imageFile
    );

  if (!validation.valid) {
    throw new Error(
      validation.error
    );
  }

  // -----------------------------------------------
  // CHECK API CONFIGURATION
  // -----------------------------------------------

  if (!DISEASE_API_URL) {
    throw new Error(
      "Disease detection model is not connected."
    );
  }

  // -----------------------------------------------
  // CREATE FORM DATA
  // -----------------------------------------------

  const formData =
    new FormData();

  formData.append(
    "image",
    imageFile
  );

  // -----------------------------------------------
  // SEND REQUEST
  // -----------------------------------------------

  let response;

  try {
    response =
      await fetch(
        DISEASE_API_URL,
        {
          method: "POST",
          body: formData,
        }
      );
  } catch (error) {
    console.error(
      "Disease API network error:",
      error
    );

    throw new Error(
      "Could not connect to the KrishiMitra disease detection service."
    );
  }

  // -----------------------------------------------
  // HANDLE HTTP ERROR
  // -----------------------------------------------

  if (!response.ok) {
    let message =
      "Disease analysis failed.";

    try {
      const errorData =
        await response.json();

      if (
        errorData?.detail
      ) {
        message =
          errorData.detail;
      } else if (
        errorData?.message
      ) {
        message =
          errorData.message;
      } else if (
        errorData?.error
      ) {
        message =
          errorData.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(
      message
    );
  }

  // -----------------------------------------------
  // READ JSON
  // -----------------------------------------------

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Disease service returned an invalid response."
    );
  }

  // -----------------------------------------------
  // NORMALIZE RESULT
  // -----------------------------------------------

  return normalizeDiseaseResult(
    data
  );
}

// =====================================================
// CHECK WHETHER MODEL IS CONFIGURED
// =====================================================

export function isDiseaseModelConnected() {
  return Boolean(
    DISEASE_API_URL
  );
}
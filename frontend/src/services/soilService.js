// =====================================================
// KRISHIMITRA AI
// SOIL INTELLIGENCE SERVICE
// =====================================================

const SOIL_API_URL =
  import.meta.env.VITE_SOIL_API_URL ||
  "http://127.0.0.1:8000/api/soil/analyze";


// =====================================================
// VALIDATE SOIL VALUES
// =====================================================

function validateSoilData(data) {
  const requiredFields = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "ph",
    "moisture",
    "temperature",
  ];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      throw new Error(
        `Missing soil value: ${field}`
      );
    }

    if (!Number.isFinite(Number(data[field]))) {
      throw new Error(
        `Invalid soil value: ${field}`
      );
    }
  }
}


// =====================================================
// ANALYZE SOIL
// =====================================================

export async function analyzeSoilData(soilData) {
  validateSoilData(soilData);

  const payload = {
    nitrogen: Number(soilData.nitrogen),
    phosphorus: Number(soilData.phosphorus),
    potassium: Number(soilData.potassium),
    ph: Number(soilData.ph),
    moisture: Number(soilData.moisture),
    temperature: Number(soilData.temperature),
  };

  let response;

  try {
    response = await fetch(
      SOIL_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );
  } catch (error) {
    console.error(
      "KrishiMitra Soil API network error:",
      error
    );

    throw new Error(
      "Could not connect to KrishiMitra Soil Intelligence."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Soil Intelligence returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Soil analysis failed."
    );
  }

  return data;
}


// =====================================================
// CHECK CONNECTION
// =====================================================

export function isSoilServiceConfigured() {
  return Boolean(SOIL_API_URL);
}
// =====================================================
// KRISHIMITRA AI
// SOIL INTELLIGENCE SERVICE
// =====================================================

const SOIL_API_URL =
  import.meta.env.VITE_SOIL_API_URL ||
  "http://127.0.0.1:8000/api/soil/analyze";


// =====================================================
// HELPERS
// =====================================================

function isMissing(value) {
  return (
    value === undefined ||
    value === null ||
    value === ""
  );
}


function validateNumber(field, value) {
  if (!Number.isFinite(Number(value))) {
    throw new Error(
      `Invalid soil value: ${field}`
    );
  }
}


// =====================================================
// VALIDATE SOIL VALUES
// =====================================================

function validateSoilData(data) {

  // ---------------------------------------------------
  // REQUIRED VALUES
  // ---------------------------------------------------

  const requiredFields = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "ph",
  ];

  for (const field of requiredFields) {

    if (isMissing(data[field])) {
      throw new Error(
        `Missing soil value: ${field}`
      );
    }

    validateNumber(
      field,
      data[field]
    );
  }


  // ---------------------------------------------------
  // OPTIONAL VALUES
  // ---------------------------------------------------

  const optionalFields = [
    "moisture",
    "temperature",
  ];

  for (const field of optionalFields) {

    if (!isMissing(data[field])) {
      validateNumber(
        field,
        data[field]
      );
    }
  }
}


// =====================================================
// OPTIONAL NUMBER CONVERSION
// =====================================================

function optionalNumber(value) {

  if (isMissing(value)) {
    return null;
  }

  return Number(value);
}


// =====================================================
// ANALYZE SOIL
// =====================================================

export async function analyzeSoilData(
  soilData
) {

  validateSoilData(soilData);


  // ===================================================
  // BUILD BACKEND PAYLOAD
  // ===================================================

  const payload = {

    nitrogen:
      Number(soilData.nitrogen),

    phosphorus:
      Number(soilData.phosphorus),

    potassium:
      Number(soilData.potassium),

    npkUnit:
      soilData.npkUnit || "kg/ha",

    ph:
      Number(soilData.ph),

    // Missing optional values remain null.
    // They must NOT become 0.
    moisture:
      optionalNumber(
        soilData.moisture
      ),

    temperature:
      optionalNumber(
        soilData.temperature
      ),
  };


  // ===================================================
  // SEND REQUEST
  // ===================================================

  let response;

  try {

    response = await fetch(
      SOIL_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(payload),
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


  // ===================================================
  // READ RESPONSE
  // ===================================================

  let data;

  try {

    data = await response.json();

  } catch {

    throw new Error(
      "Soil Intelligence returned an invalid response."
    );
  }


  // ===================================================
  // BACKEND ERROR
  // ===================================================

  if (!response.ok) {

    throw new Error(
      data?.detail ||
      data?.message ||
      "Soil analysis failed."
    );
  }


  // ===================================================
  // SUCCESS
  // ===================================================

  return data;
}


// =====================================================
// CHECK CONNECTION
// =====================================================

export function isSoilServiceConfigured() {
  return Boolean(SOIL_API_URL);
}
// =====================================================
// KRISHIMITRA AI - SOIL REPORT PARSER V2.1
// OCR-TOLERANT + CHEMICAL FORMULA SAFE
// =====================================================

const cleanText = (text = "") => {
  return text
    .replace(/\r/g, "\n")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/kg\s*\/?\s*ha/gi, "kg/ha")
    .replace(/k[gqe]\s*\/?\s*ha/gi, "kg/ha")
    .replace(/mg\s*\/?\s*kg/gi, "mg/kg")
    .trim();
};

// =====================================================
// CLEAN OCR NUMBER
// =====================================================

const cleanNumber = (value = "") => {
  if (!value) return "";

  const cleaned = String(value)
    .replace(",", ".")
    .replace(/[Oo]/g, "0")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return "";
  }

  return String(number);
};

// =====================================================
// FIND FIRST VALID MATCH
// =====================================================

const findMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[1]) continue;

    const value = cleanNumber(match[1]);

    if (value === "") continue;

    return {
      value,
      unit: match[2] || "",
    };
  }

  return {
    value: "",
    unit: "",
  };
};

// =====================================================
// NORMALIZE UNIT
// =====================================================

const normalizeUnit = (unit = "") => {
  const cleaned = String(unit)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/hectare/g, "ha");

  if (
    cleaned.includes("kg/ha") ||
    cleaned.includes("kgha") ||
    cleaned.includes("ke/ha")
  ) {
    return "kg/ha";
  }

  if (
    cleaned.includes("mg/kg") ||
    cleaned.includes("mgkg")
  ) {
    return "mg/kg";
  }

  if (cleaned.includes("ppm")) {
    return "ppm";
  }

  if (cleaned.includes("%")) {
    return "%";
  }

  return unit.trim();
};

// =====================================================
// COMMON OCR PATTERNS
// =====================================================

const NUMBER =
  "([0-9Oo]+(?:[.,][0-9Oo]+)?)";

const UNIT =
  "(kg\\s*\\/?\\s*ha|k[gqe]\\s*\\/?\\s*ha|mg\\s*\\/?\\s*kg|ppm|%)?";

// =====================================================
// NITROGEN
// =====================================================

const extractNitrogen = (text) => {
  return findMatch(text, [
    new RegExp(
      `available\\s+nitrogen\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `available\\s+nitrogen\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `nitrogen\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `\\bn\\s*[:=\\-]\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),
  ]);
};

// =====================================================
// PHOSPHORUS
//
// IMPORTANT:
// Measurement is searched AFTER the closing ")".
// Therefore digits inside P2O5 / P,0s / P;05 cannot
// become the phosphorus measurement.
// =====================================================

const extractPhosphorus = (text) => {
  return findMatch(text, [
    new RegExp(
      `available\\s+phosph(?:orus|orous)\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `phosph(?:orus|orous)\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `available\\s+phosph(?:orus|orous)\\s*[:=\\-]\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),
  ]);
};

// =====================================================
// POTASSIUM
//
// Same protection for K2O / K,0 / K;0.
// =====================================================

const extractPotassium = (text) => {
  return findMatch(text, [
    new RegExp(
      `available\\s+potassium\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `potassium\\s*\\([^)]*\\)\\s*[:=\\-]?\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `available\\s+potassium\\s*[:=\\-]\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),

    new RegExp(
      `potash\\s*[:=\\-]\\s*${NUMBER}\\s*${UNIT}`,
      "i"
    ),
  ]);
};

// =====================================================
// PH
// =====================================================

const extractPH = (text) => {
  const patterns = [
    new RegExp(
      `soil\\s*p\\s*\\.?\\s*h\\s*\\.?[^0-9Oo]{0,15}${NUMBER}`,
      "i"
    ),

    new RegExp(
      `\\bp\\s*\\.?\\s*h\\s*\\.?\\s*(?:value)?[^0-9Oo]{0,15}${NUMBER}`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[1]) continue;

    const value = cleanNumber(match[1]);
    const number = Number(value);

    if (
      Number.isFinite(number) &&
      number >= 0 &&
      number <= 14
    ) {
      return {
        value,
        unit: "",
      };
    }
  }

  return {
    value: "",
    unit: "",
  };
};

// =====================================================
// MAIN PARSER
// =====================================================

export const parseSoilReport = (ocrText = "") => {
  const text = cleanText(ocrText);

  const nitrogen = extractNitrogen(text);
  const phosphorus = extractPhosphorus(text);
  const potassium = extractPotassium(text);
  const ph = extractPH(text);

  return {
    nitrogen: {
      value: nitrogen.value,
      unit: normalizeUnit(nitrogen.unit),
    },

    phosphorus: {
      value: phosphorus.value,
      unit: normalizeUnit(phosphorus.unit),
    },

    potassium: {
      value: potassium.value,
      unit: normalizeUnit(potassium.unit),
    },

    ph: {
      value: ph.value,
      unit: "",
    },
  };
};

// =====================================================
// SIMPLE VALUES FOR AdvancedSoilTest
// =====================================================

export const getSimpleSoilValues = (parsedReport) => {
  return {
    nitrogen:
      parsedReport?.nitrogen?.value || "",

    phosphorus:
      parsedReport?.phosphorus?.value || "",

    potassium:
      parsedReport?.potassium?.value || "",

    ph:
      parsedReport?.ph?.value || "",
  };
};
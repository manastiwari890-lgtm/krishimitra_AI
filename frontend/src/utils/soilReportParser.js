// =====================================================
// KRISHIMITRA AI - SOIL REPORT PARSER
// =====================================================

const cleanText = (text = "") => {
  return text
    .replace(/\r/g, "\n")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
};

// =====================================================
// CONVERT OCR NUMBER
// =====================================================

const cleanNumber = (value) => {
  if (!value) return "";

  const cleaned = value.replace(",", ".");

  const number = Number(cleaned);

  if (Number.isNaN(number)) {
    return "";
  }

  return String(number);
};

// =====================================================
// FIND FIRST MATCH
// =====================================================

const findMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return {
        value: cleanNumber(match[1]),
        unit: match[2] || "",
      };
    }
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
  const cleaned = unit
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("hectare", "ha");

  if (
    cleaned.includes("kg/ha") ||
    cleaned.includes("kgha")
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

  if (cleaned === "%") {
    return "%";
  }

  return unit.trim();
};

// =====================================================
// NITROGEN
// =====================================================

const extractNitrogen = (text) => {
  return findMatch(text, [
    /available\s+nitrogen(?:\s*\(n\))?\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /nitrogen\s*\(n\)\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /nitrogen\s*[:=-]\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,
  ]);
};

// =====================================================
// PHOSPHORUS
// =====================================================

const extractPhosphorus = (text) => {
  return findMatch(text, [
    /available\s+phosph(?:orus|orous)(?:\s*\(p\))?\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /phosph(?:orus|orous)\s*\(p\)\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /phosph(?:orus|orous)\s*[:=-]\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,
  ]);
};

// =====================================================
// POTASSIUM
// =====================================================

const extractPotassium = (text) => {
  return findMatch(text, [
    /available\s+potassium(?:\s*\(k\))?\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /potassium\s*\(k\)\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /potassium\s*[:=-]\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,

    /potash\s*[:=-]\s*([0-9]+(?:[.,][0-9]+)?)\s*(kg\s*\/?\s*ha|ppm|mg\s*\/?\s*kg)?/i,
  ]);
};

// =====================================================
// PH
// =====================================================

const extractPH = (text) => {
  const patterns = [
    /soil\s*p\s*\.?\s*h\s*\.?\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)/i,

    /\bp\s*\.?\s*h\s*\.?\s*(?:value)?\s*[:=-]?\s*([0-9]+(?:[.,][0-9]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const value = cleanNumber(match[1]);
      const number = Number(value);

      if (
        !Number.isNaN(number) &&
        number >= 0 &&
        number <= 14
      ) {
        return {
          value,
          unit: "",
        };
      }
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
// SIMPLE VALUE FORMAT FOR AdvancedSoilTest
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
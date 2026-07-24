// =====================================================
// KRISHIMITRA AI
// CROP KNOWLEDGE BASE
// =====================================================
//
// IMPORTANT:
// These values are broad agronomic suitability ranges.
// Exact requirements can vary by variety, location,
// soil condition, irrigation and crop growth stage.
//
// =====================================================

export const cropKnowledgeBase = [

  // ===================================================
  // 1. WHEAT
  // ===================================================

  {
    id: "wheat",

    name: {
      en: "Wheat",
      hi: "गेहूँ",
    },

    icon: "🌾",
    category: "cereal",

    seasons: ["rabi"],

    temperature: {
      min: 10,
      idealMin: 15,
      idealMax: 25,
      max: 30,
    },

    soilPh: {
      min: 6.0,
      idealMin: 6.5,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 35,
      idealMin: 45,
      idealMax: 65,
      max: 75,
    },

    rainfall: {
      min: 300,
      idealMin: 450,
      idealMax: 650,
      max: 900,
    },

    suitableSoils: [
      "loamy",
      "clayey",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 2. RICE
  // ===================================================

  {
    id: "rice",

    name: {
      en: "Rice",
      hi: "धान",
    },

    icon: "🌾",
    category: "cereal",

    seasons: ["kharif"],

    temperature: {
      min: 20,
      idealMin: 24,
      idealMax: 32,
      max: 38,
    },

    soilPh: {
      min: 5.0,
      idealMin: 5.5,
      idealMax: 7.0,
      max: 8.0,
    },

    moisture: {
      min: 55,
      idealMin: 65,
      idealMax: 85,
      max: 95,
    },

    rainfall: {
      min: 800,
      idealMin: 1000,
      idealMax: 1800,
      max: 2500,
    },

    suitableSoils: [
      "clayey",
      "loamy",
    ],

    waterRequirement: "high",
  },

  // ===================================================
  // 3. MAIZE
  // ===================================================

  {
    id: "maize",

    name: {
      en: "Maize",
      hi: "मक्का",
    },

    icon: "🌽",
    category: "cereal",

    seasons: [
      "kharif",
      "rabi",
    ],

    temperature: {
      min: 15,
      idealMin: 20,
      idealMax: 30,
      max: 35,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 35,
      idealMin: 45,
      idealMax: 65,
      max: 75,
    },

    rainfall: {
      min: 400,
      idealMin: 500,
      idealMax: 800,
      max: 1200,
    },

    suitableSoils: [
      "loamy",
      "sandy",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 4. MUSTARD
  // ===================================================

  {
    id: "mustard",

    name: {
      en: "Mustard",
      hi: "सरसों",
    },

    icon: "🌼",
    category: "oilseed",

    seasons: ["rabi"],

    temperature: {
      min: 8,
      idealMin: 15,
      idealMax: 25,
      max: 30,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.5,
    },

    moisture: {
      min: 25,
      idealMin: 35,
      idealMax: 55,
      max: 70,
    },

    rainfall: {
      min: 250,
      idealMin: 350,
      idealMax: 500,
      max: 750,
    },

    suitableSoils: [
      "loamy",
      "sandy",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 5. CHICKPEA
  // ===================================================

  {
    id: "chickpea",

    name: {
      en: "Chickpea",
      hi: "चना",
    },

    icon: "🌱",
    category: "pulse",

    seasons: ["rabi"],

    temperature: {
      min: 10,
      idealMin: 15,
      idealMax: 25,
      max: 30,
    },

    soilPh: {
      min: 6.0,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 20,
      idealMin: 30,
      idealMax: 50,
      max: 65,
    },

    rainfall: {
      min: 250,
      idealMin: 300,
      idealMax: 500,
      max: 700,
    },

    suitableSoils: [
      "loamy",
      "clayey",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 6. SUGARCANE
  // ===================================================

  {
    id: "sugarcane",

    name: {
      en: "Sugarcane",
      hi: "गन्ना",
    },

    icon: "🎋",
    category: "cash-crop",

    seasons: [
      "kharif",
      "zaid",
    ],

    temperature: {
      min: 18,
      idealMin: 24,
      idealMax: 32,
      max: 38,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.5,
    },

    moisture: {
      min: 45,
      idealMin: 55,
      idealMax: 75,
      max: 85,
    },

    rainfall: {
      min: 750,
      idealMin: 1000,
      idealMax: 1500,
      max: 2000,
    },

    suitableSoils: [
      "loamy",
      "clayey",
    ],

    waterRequirement: "high",
  },

  // ===================================================
  // 7. COTTON
  // ===================================================

  {
    id: "cotton",

    name: {
      en: "Cotton",
      hi: "कपास",
    },

    icon: "☁️",
    category: "fiber",

    seasons: ["kharif"],

    temperature: {
      min: 18,
      idealMin: 21,
      idealMax: 30,
      max: 35,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 8.0,
      max: 8.5,
    },

    moisture: {
      min: 30,
      idealMin: 40,
      idealMax: 60,
      max: 70,
    },

    rainfall: {
      min: 500,
      idealMin: 600,
      idealMax: 1000,
      max: 1200,
    },

    suitableSoils: [
      "clayey",
      "loamy",
      "black",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 8. SOYBEAN
  // ===================================================

  {
    id: "soybean",

    name: {
      en: "Soybean",
      hi: "सोयाबीन",
    },

    icon: "🫘",
    category: "oilseed",

    seasons: ["kharif"],

    temperature: {
      min: 15,
      idealMin: 20,
      idealMax: 30,
      max: 35,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 35,
      idealMin: 45,
      idealMax: 65,
      max: 75,
    },

    rainfall: {
      min: 450,
      idealMin: 600,
      idealMax: 1000,
      max: 1300,
    },

    suitableSoils: [
      "loamy",
      "clayey",
      "black",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 9. PEARL MILLET / BAJRA
  // ===================================================

  {
    id: "bajra",

    name: {
      en: "Pearl Millet",
      hi: "बाजरा",
    },

    icon: "🌾",
    category: "cereal",

    seasons: ["kharif"],

    temperature: {
      min: 20,
      idealMin: 25,
      idealMax: 35,
      max: 40,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.5,
    },

    moisture: {
      min: 20,
      idealMin: 30,
      idealMax: 50,
      max: 65,
    },

    rainfall: {
      min: 200,
      idealMin: 300,
      idealMax: 600,
      max: 800,
    },

    suitableSoils: [
      "sandy",
      "loamy",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 10. SORGHUM / JOWAR
  // ===================================================

  {
    id: "jowar",

    name: {
      en: "Sorghum",
      hi: "ज्वार",
    },

    icon: "🌾",
    category: "cereal",

    seasons: [
      "kharif",
      "rabi",
    ],

    temperature: {
      min: 18,
      idealMin: 25,
      idealMax: 32,
      max: 38,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 8.0,
      max: 8.5,
    },

    moisture: {
      min: 25,
      idealMin: 35,
      idealMax: 55,
      max: 70,
    },

    rainfall: {
      min: 300,
      idealMin: 400,
      idealMax: 700,
      max: 1000,
    },

    suitableSoils: [
      "loamy",
      "clayey",
      "black",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 11. GROUNDNUT
  // ===================================================

  {
    id: "groundnut",

    name: {
      en: "Groundnut",
      hi: "मूंगफली",
    },

    icon: "🥜",
    category: "oilseed",

    seasons: ["kharif"],

    temperature: {
      min: 18,
      idealMin: 22,
      idealMax: 30,
      max: 35,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 25,
      idealMin: 35,
      idealMax: 55,
      max: 70,
    },

    rainfall: {
      min: 400,
      idealMin: 500,
      idealMax: 900,
      max: 1200,
    },

    suitableSoils: [
      "sandy",
      "loamy",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 12. POTATO
  // ===================================================

  {
    id: "potato",

    name: {
      en: "Potato",
      hi: "आलू",
    },

    icon: "🥔",
    category: "vegetable",

    seasons: ["rabi"],

    temperature: {
      min: 8,
      idealMin: 15,
      idealMax: 22,
      max: 30,
    },

    soilPh: {
      min: 5.0,
      idealMin: 5.5,
      idealMax: 6.5,
      max: 7.5,
    },

    moisture: {
      min: 35,
      idealMin: 45,
      idealMax: 65,
      max: 75,
    },

    rainfall: {
      min: 300,
      idealMin: 500,
      idealMax: 700,
      max: 1000,
    },

    suitableSoils: [
      "loamy",
      "sandy",
    ],

    waterRequirement: "medium",
  },

  // ===================================================
  // 13. BARLEY
  // ===================================================

  {
    id: "barley",

    name: {
      en: "Barley",
      hi: "जौ",
    },

    icon: "🌾",
    category: "cereal",

    seasons: ["rabi"],

    temperature: {
      min: 7,
      idealMin: 12,
      idealMax: 25,
      max: 30,
    },

    soilPh: {
      min: 6.0,
      idealMin: 6.5,
      idealMax: 8.0,
      max: 8.5,
    },

    moisture: {
      min: 20,
      idealMin: 30,
      idealMax: 50,
      max: 65,
    },

    rainfall: {
      min: 200,
      idealMin: 300,
      idealMax: 500,
      max: 700,
    },

    suitableSoils: [
      "loamy",
      "sandy",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 14. PIGEON PEA / ARHAR
  // ===================================================

  {
    id: "pigeon-pea",

    name: {
      en: "Pigeon Pea",
      hi: "अरहर",
    },

    icon: "🌱",
    category: "pulse",

    seasons: ["kharif"],

    temperature: {
      min: 18,
      idealMin: 22,
      idealMax: 30,
      max: 35,
    },

    soilPh: {
      min: 5.5,
      idealMin: 6.0,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 25,
      idealMin: 35,
      idealMax: 55,
      max: 70,
    },

    rainfall: {
      min: 400,
      idealMin: 600,
      idealMax: 1000,
      max: 1300,
    },

    suitableSoils: [
      "loamy",
      "clayey",
    ],

    waterRequirement: "low",
  },

  // ===================================================
  // 15. GREEN GRAM / MOONG
  // ===================================================

  {
    id: "moong",

    name: {
      en: "Green Gram",
      hi: "मूंग",
    },

    icon: "🌱",
    category: "pulse",

    seasons: [
      "kharif",
      "zaid",
    ],

    temperature: {
      min: 18,
      idealMin: 25,
      idealMax: 35,
      max: 40,
    },

    soilPh: {
      min: 6.0,
      idealMin: 6.5,
      idealMax: 7.5,
      max: 8.0,
    },

    moisture: {
      min: 20,
      idealMin: 30,
      idealMax: 50,
      max: 65,
    },

    rainfall: {
      min: 300,
      idealMin: 400,
      idealMax: 700,
      max: 900,
    },

    suitableSoils: [
      "loamy",
      "sandy",
    ],

    waterRequirement: "low",
  },
];

// =====================================================
// OPTIONAL HELPER
// Find one crop by ID
// =====================================================

export function getCropById(id) {
  if (!id) {
    return null;
  }

  return (
    cropKnowledgeBase.find(
      (crop) => crop.id === id
    ) || null
  );
}
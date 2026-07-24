// =====================================================
// KRISHIMITRA AI
// CROP WEATHER PROFILE DATABASE
// =====================================================
//
// IMPORTANT:
//
// These are configurable BASE profiles.
//
// Production recommendations should eventually consider:
// - crop variety
// - growth stage
// - location / agro-climatic zone
// - sowing date
// - irrigation system
// - soil conditions
// - local agricultural advisories
//
// Do NOT treat these profiles as universal agronomic
// prescriptions.
// =====================================================


// =====================================================
// SHARED GROWTH STAGES
// =====================================================

export const GROWTH_STAGES = {
  establishment: {
    id: "establishment",
    en: "Establishment",
    hi: "स्थापना / शुरुआती अवस्था",
  },

  vegetative: {
    id: "vegetative",
    en: "Vegetative Growth",
    hi: "वानस्पतिक वृद्धि",
  },

  flowering: {
    id: "flowering",
    en: "Flowering",
    hi: "फूल आने की अवस्था",
  },

  reproductive: {
    id: "reproductive",
    en: "Reproductive / Grain or Fruit Development",
    hi: "दाना / फल विकास",
  },

  maturity: {
    id: "maturity",
    en: "Maturity / Harvest",
    hi: "पकने / कटाई की अवस्था",
  },
};


// =====================================================
// CROP DATABASE
// =====================================================

export const CROP_WEATHER_PROFILES = {

  // ===================================================
  // RICE
  // ===================================================

  rice: {
    id: "rice",

    name: {
      en: "Rice",
      hi: "धान",
    },

    icon: "🌾",

    category: "cereal",

    season: ["kharif", "boro"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "high",
      drought: "high",
      excessRain: "medium",
      wind: "medium",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      cold: {
        sensitiveStages: [
          "flowering",
          "maturity",
        ],

        message: {
          en:
            "Low temperature can be important during sensitive rice stages, particularly flowering and maturity.",

          hi:
            "धान में फूल आने और पकने जैसी संवेदनशील अवस्थाओं में कम तापमान महत्वपूर्ण जोखिम बन सकता है।",
        },
      },

      drought: {
        sensitiveStages: [
          "establishment",
          "flowering",
          "reproductive",
        ],

        message: {
          en:
            "Water stress can affect rice, but irrigation decisions should depend on the production system, crop stage and actual field moisture.",

          hi:
            "धान में पानी की कमी नुकसान पहुँचा सकती है, लेकिन सिंचाई का निर्णय उत्पादन प्रणाली, फसल अवस्था और खेत की वास्तविक नमी देखकर होना चाहिए।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Heavy rainfall can increase waterlogging or flooding risk depending on the field and rice production system.",

          hi:
            "तेज बारिश में खेत और धान की उत्पादन प्रणाली के अनुसार जलभराव या बाढ़ का खतरा बढ़ सकता है।",
        },
      },
    },

    diseaseWeatherRisks: [
      {
        id: "blast-risk",

        weatherFactors: [
          "highHumidity",
          "wetConditions",
        ],

        name: {
          en: "Rice Blast Risk",
          hi: "धान ब्लास्ट जोखिम",
        },

        advice: {
          en:
            "Persistent humid and wet conditions warrant closer monitoring for blast symptoms, especially where the disease is locally important.",

          hi:
            "लगातार नमी और गीली परिस्थितियों में ब्लास्ट के लक्षणों की अधिक निगरानी करें, विशेषकर उन क्षेत्रों में जहाँ यह रोग सामान्य है।",
        },
      },
    ],
  },


  // ===================================================
  // WHEAT
  // ===================================================

  wheat: {
    id: "wheat",

    name: {
      en: "Wheat",
      hi: "गेहूँ",
    },

    icon: "🌾",

    category: "cereal",

    season: ["rabi"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "high",
      cold: "medium",
      drought: "medium",
      excessRain: "medium",
      wind: "medium",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      heat: {
        sensitiveStages: [
          "flowering",
          "reproductive",
          "maturity",
        ],

        message: {
          en:
            "High temperatures late in the season can create terminal heat stress and may reduce grain development.",

          hi:
            "मौसम के अंतिम भाग में अधिक तापमान terminal heat stress पैदा कर सकता है और दाना विकास प्रभावित हो सकता है।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Unexpected rain around maturity or harvest can interfere with harvesting and grain quality.",

          hi:
            "पकने या कटाई के समय अनचाही बारिश कटाई और दाने की गुणवत्ता को प्रभावित कर सकती है।",
        },
      },
    },

    diseaseWeatherRisks: [
      {
        id: "wheat-humid-disease-risk",

        weatherFactors: [
          "highHumidity",
          "wetConditions",
        ],

        name: {
          en: "Humidity-related Disease Watch",
          hi: "नमी से जुड़े रोगों की निगरानी",
        },

        advice: {
          en:
            "Prolonged humid conditions can favor some wheat diseases. Monitor the crop rather than diagnosing disease from weather alone.",

          hi:
            "लंबे समय तक अधिक नमी गेहूँ के कुछ रोगों के लिए अनुकूल हो सकती है। केवल मौसम से रोग तय न करें, फसल की निगरानी करें।",
        },
      },
    ],
  },


  // ===================================================
  // MAIZE
  // ===================================================

  maize: {
    id: "maize",

    name: {
      en: "Maize",
      hi: "मक्का",
    },

    icon: "🌽",

    category: "cereal",

    season: [
      "kharif",
      "rabi",
      "spring",
    ],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "medium",
      drought: "high",
      excessRain: "high",
      wind: "high",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      drought: {
        sensitiveStages: [
          "flowering",
          "reproductive",
        ],

        message: {
          en:
            "Water stress around flowering and grain development can be particularly important in maize.",

          hi:
            "मक्का में फूल आने और दाना बनने की अवस्था के आसपास पानी की कमी विशेष रूप से महत्वपूर्ण हो सकती है।",
        },
      },

      wind: {
        message: {
          en:
            "Strong wind and storms can increase lodging risk, especially in taller crops.",

          hi:
            "तेज हवा और तूफान में विशेषकर लंबी फसल में पौधों के गिरने का खतरा बढ़ सकता है।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Poor drainage after heavy rain can create waterlogging stress.",

          hi:
            "तेज बारिश के बाद खराब drainage से जलभराव का stress हो सकता है।",
        },
      },
    },

    diseaseWeatherRisks: [],
  },


  // ===================================================
  // POTATO
  // ===================================================

  potato: {
    id: "potato",

    name: {
      en: "Potato",
      hi: "आलू",
    },

    icon: "🥔",

    category: "vegetable",

    season: ["rabi"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "high",
      cold: "medium",
      drought: "medium",
      excessRain: "high",
      wind: "low",
      humidity: "high",
    },

    criticalStages: [
      "vegetative",
      "reproductive",
    ],

    risks: {
      heat: {
        message: {
          en:
            "Unusually warm conditions can stress potato crops and should trigger closer crop and soil-moisture monitoring.",

          hi:
            "असामान्य रूप से गर्म मौसम आलू की फसल पर stress बढ़ा सकता है, इसलिए फसल और मिट्टी की नमी की निगरानी बढ़ाएँ।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Excess water and poor drainage can be harmful to potato fields.",

          hi:
            "अधिक पानी और खराब drainage आलू के खेत के लिए नुकसानदायक हो सकते हैं।",
        },
      },
    },

    diseaseWeatherRisks: [
      {
        id: "potato-wet-disease-risk",

        weatherFactors: [
          "highHumidity",
          "wetConditions",
        ],

        name: {
          en: "Wet-weather Disease Watch",
          hi: "गीले मौसम में रोग निगरानी",
        },

        advice: {
          en:
            "Extended cool, humid or wet periods can increase concern for important potato diseases. Inspect plants and use disease-specific diagnosis before treatment.",

          hi:
            "लंबे समय तक ठंडा, नम या गीला मौसम आलू के महत्वपूर्ण रोगों का खतरा बढ़ा सकता है। उपचार से पहले पौधों की जाँच और रोग की सही पहचान करें।",
        },
      },
    ],
  },


  // ===================================================
  // MUSTARD
  // ===================================================

  mustard: {
    id: "mustard",

    name: {
      en: "Mustard",
      hi: "सरसों",
    },

    icon: "🌼",

    category: "oilseed",

    season: ["rabi"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "medium",
      drought: "medium",
      excessRain: "medium",
      wind: "medium",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      heat: {
        sensitiveStages: [
          "flowering",
          "reproductive",
        ],

        message: {
          en:
            "Unseasonably warm conditions during reproductive development warrant closer crop monitoring.",

          hi:
            "प्रजनन अवस्था के दौरान असामान्य गर्म मौसम में फसल की अधिक निगरानी करें।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Unexpected rain can interfere with field operations and may increase disease-conducive moisture.",

          hi:
            "अनचाही बारिश खेत के काम में बाधा डाल सकती है और रोगों के अनुकूल नमी बढ़ा सकती है।",
        },
      },
    },

    diseaseWeatherRisks: [
      {
        id: "mustard-alternaria-risk",

        weatherFactors: [
          "highHumidity",
          "wetConditions",
        ],

        name: {
          en: "Alternaria Blight Watch",
          hi: "अल्टरनेरिया ब्लाइट निगरानी",
        },

        advice: {
          en:
            "Humid and wet conditions warrant monitoring for Alternaria blight symptoms where the disease is prevalent.",

          hi:
            "नम और गीली परिस्थितियों में उन क्षेत्रों में अल्टरनेरिया ब्लाइट के लक्षण देखें जहाँ यह रोग सामान्य है।",
        },
      },
    ],
  },


  // ===================================================
  // CHICKPEA
  // ===================================================

  chickpea: {
    id: "chickpea",

    name: {
      en: "Chickpea",
      hi: "चना",
    },

    icon: "🫘",

    category: "pulse",

    season: ["rabi"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "medium",
      drought: "medium",
      excessRain: "high",
      wind: "low",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      heavyRain: {
        message: {
          en:
            "Persistent excess moisture can create unfavorable conditions for chickpea and increase disease concerns.",

          hi:
            "लगातार अधिक नमी चने के लिए प्रतिकूल परिस्थितियाँ बना सकती है और रोग का खतरा बढ़ा सकती है।",
        },
      },

      heat: {
        sensitiveStages: [
          "flowering",
          "reproductive",
        ],

        message: {
          en:
            "Unusually high temperatures during flowering or pod development may stress the crop.",

          hi:
            "फूल आने या फली बनने के दौरान असामान्य अधिक तापमान फसल पर stress डाल सकता है।",
        },
      },
    },

    diseaseWeatherRisks: [],
  },


  // ===================================================
  // COTTON
  // ===================================================

  cotton: {
    id: "cotton",

    name: {
      en: "Cotton",
      hi: "कपास",
    },

    icon: "☁️",

    category: "fiber",

    season: ["kharif"],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "high",
      drought: "medium",
      excessRain: "high",
      wind: "medium",
      humidity: "medium",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      heavyRain: {
        message: {
          en:
            "Heavy or persistent rainfall can cause waterlogging and interfere with crop protection and picking operations.",

          hi:
            "तेज या लगातार बारिश जलभराव पैदा कर सकती है और crop protection तथा picking के काम में बाधा डाल सकती है।",
        },
      },

      cold: {
        message: {
          en:
            "Cool conditions can slow crop development, depending on growth stage and variety.",

          hi:
            "फसल अवस्था और variety के अनुसार ठंडा मौसम कपास की वृद्धि धीमी कर सकता है।",
        },
      },
    },

    diseaseWeatherRisks: [],
  },


  // ===================================================
  // SUGARCANE
  // ===================================================

  sugarcane: {
    id: "sugarcane",

    name: {
      en: "Sugarcane",
      hi: "गन्ना",
    },

    icon: "🎋",

    category: "commercial",

    season: [
      "spring",
      "autumn",
    ],

    stages: [
      "establishment",
      "vegetative",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "medium",
      cold: "medium",
      drought: "high",
      excessRain: "medium",
      wind: "high",
      humidity: "medium",
    },

    criticalStages: [
      "establishment",
      "vegetative",
    ],

    risks: {
      drought: {
        message: {
          en:
            "Extended dry conditions can increase water stress, particularly during active growth.",

          hi:
            "लंबे समय तक सूखा मौसम विशेषकर सक्रिय वृद्धि के दौरान water stress बढ़ा सकता है।",
        },
      },

      wind: {
        message: {
          en:
            "Strong winds can increase lodging risk in tall sugarcane.",

          hi:
            "तेज हवा में लंबे गन्ने के गिरने का खतरा बढ़ सकता है।",
        },
      },
    },

    diseaseWeatherRisks: [],
  },


  // ===================================================
  // TOMATO
  // ===================================================

  tomato: {
    id: "tomato",

    name: {
      en: "Tomato",
      hi: "टमाटर",
    },

    icon: "🍅",

    category: "vegetable",

    season: [
      "kharif",
      "rabi",
      "summer",
    ],

    stages: [
      "establishment",
      "vegetative",
      "flowering",
      "reproductive",
      "maturity",
    ],

    sensitivity: {
      heat: "high",
      cold: "medium",
      drought: "medium",
      excessRain: "high",
      wind: "medium",
      humidity: "high",
    },

    criticalStages: [
      "flowering",
      "reproductive",
    ],

    risks: {
      heat: {
        sensitiveStages: [
          "flowering",
        ],

        message: {
          en:
            "Flowering is particularly vulnerable to heat stress in tomato. High-temperature periods warrant closer monitoring.",

          hi:
            "टमाटर में flowering अवस्था heat stress के प्रति विशेष रूप से संवेदनशील होती है। अधिक तापमान में फसल की अधिक निगरानी करें।",
        },
      },

      heavyRain: {
        message: {
          en:
            "Persistent rainfall and poor drainage can increase crop stress and disease-conducive conditions.",

          hi:
            "लगातार बारिश और खराब drainage फसल stress तथा रोग के अनुकूल परिस्थितियाँ बढ़ा सकते हैं।",
        },
      },
    },

    diseaseWeatherRisks: [
      {
        id: "tomato-humidity-risk",

        weatherFactors: [
          "highHumidity",
          "wetConditions",
        ],

        name: {
          en: "Humidity-related Disease Watch",
          hi: "नमी से जुड़े रोगों की निगरानी",
        },

        advice: {
          en:
            "Persistent humid and wet weather warrants closer monitoring for foliar and fruit disease symptoms.",

          hi:
            "लगातार नम और गीले मौसम में पत्तियों और फलों पर रोग के लक्षणों की अधिक निगरानी करें।",
        },
      },
    ],
  },
};


// =====================================================
// GET SINGLE CROP
// =====================================================

export function getCropWeatherProfile(
  cropId
) {
  if (!cropId) return null;

  return (
    CROP_WEATHER_PROFILES[cropId] ||
    null
  );
}


// =====================================================
// GET ALL CROPS
// Used for dropdown / crop selection UI
// =====================================================

export function getCropWeatherOptions(
  language = "hi"
) {
  return Object.values(
    CROP_WEATHER_PROFILES
  ).map((crop) => ({
    id: crop.id,

    name:
      crop.name?.[language] ||
      crop.name?.en ||
      crop.id,

    icon: crop.icon,

    category: crop.category,
  }));
}


// =====================================================
// GET GROWTH STAGES FOR CROP
// =====================================================

export function getCropGrowthStages(
  cropId,
  language = "hi"
) {
  const crop =
    getCropWeatherProfile(cropId);

  if (!crop) return [];

  return crop.stages.map(
    (stageId) => {
      const stage =
        GROWTH_STAGES[stageId];

      return {
        id: stageId,

        name:
          stage?.[language] ||
          stage?.en ||
          stageId,
      };
    }
  );
}


// =====================================================
// CHECK CRITICAL STAGE
// =====================================================

export function isCriticalCropStage(
  cropId,
  stageId
) {
  const crop =
    getCropWeatherProfile(cropId);

  if (!crop) return false;

  return (
    crop.criticalStages?.includes(
      stageId
    ) || false
  );
}
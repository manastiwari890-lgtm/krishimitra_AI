# =========================================================
# KRISHIMITRA AI
# SOIL INTELLIGENCE ENGINE - V2
# =========================================================

from typing import Dict, List, Optional


# =========================================================
# SUPPORTED NPK UNITS
# =========================================================

SUPPORTED_NPK_UNITS = {
    "kg/ha",
    "mg/kg",
    "ppm",
    "%",
    "other",
}


# =========================================================
# KG/HA NUTRIENT CLASSIFICATION
# =========================================================
#
# These thresholds are used only when NPK values are
# explicitly supplied in kg/ha.
#
# We DO NOT apply them to ppm, mg/kg, %, or unknown units.
# =========================================================

KG_HA_NUTRIENT_RANGES = {
    "nitrogen": {
        "low_max": 240,
        "medium_max": 480,
    },

    "phosphorus": {
        "low_max": 11,
        "medium_max": 22,
    },

    "potassium": {
        "low_max": 110,
        "medium_max": 280,
    },
}


# =========================================================
# CROP ENVIRONMENT PROFILES
# =========================================================
#
# V2 crop suitability uses parameters that we can interpret
# safely regardless of NPK laboratory units:
#
# - pH
# - moisture
# - temperature
#
# NPK is NOT included in crop suitability unless its
# measurement basis is known/calibrated.
#
# Later:
# - location
# - rainfall
# - season
# - soil type
# - crop history
# - validated nutrient requirements
# can be added.
# =========================================================

CROP_PROFILES = {
    "Rice": {
        "ph": (5.0, 7.0),
        "moisture": (70, 100),
        "temperature": (20, 35),
    },

    "Wheat": {
        "ph": (6.0, 7.5),
        "moisture": (40, 70),
        "temperature": (10, 25),
    },

    "Maize": {
        "ph": (5.5, 7.5),
        "moisture": (40, 70),
        "temperature": (18, 32),
    },

    "Potato": {
        "ph": (5.0, 6.5),
        "moisture": (50, 80),
        "temperature": (15, 25),
    },

    "Tomato": {
        "ph": (5.5, 7.0),
        "moisture": (50, 80),
        "temperature": (18, 30),
    },

    "Bell Pepper": {
        "ph": (5.5, 7.0),
        "moisture": (50, 80),
        "temperature": (18, 30),
    },

    "Soybean": {
        "ph": (6.0, 7.5),
        "moisture": (40, 70),
        "temperature": (20, 30),
    },

    "Cotton": {
        "ph": (5.8, 8.0),
        "moisture": (35, 65),
        "temperature": (21, 35),
    },
}


# =========================================================
# BASIC VALIDATION LIMITS
# =========================================================

VALID_RANGES = {
    "nitrogen": (0, 100000),
    "phosphorus": (0, 100000),
    "potassium": (0, 100000),
    "ph": (0, 14),
    "moisture": (0, 100),
    "temperature": (-10, 60),
}


# =========================================================
# VALIDATE NUMBER
# =========================================================

def validate_number(
    name: str,
    value: float,
    minimum: float,
    maximum: float,
) -> None:

    if value < minimum or value > maximum:
        raise ValueError(
            f"{name} must be between "
            f"{minimum} and {maximum}."
        )


# =========================================================
# VALIDATE SOIL INPUT
# =========================================================

def validate_soil_data(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    npk_unit: str,
    ph: float,
    moisture: Optional[float],
    temperature: Optional[float],
) -> None:

    if npk_unit not in SUPPORTED_NPK_UNITS:
        raise ValueError(
            "Unsupported NPK unit. "
            "Use kg/ha, mg/kg, ppm, %, or other."
        )

    validate_number(
        "Nitrogen",
        nitrogen,
        *VALID_RANGES["nitrogen"],
    )

    validate_number(
        "Phosphorus",
        phosphorus,
        *VALID_RANGES["phosphorus"],
    )

    validate_number(
        "Potassium",
        potassium,
        *VALID_RANGES["potassium"],
    )

    validate_number(
        "pH",
        ph,
        *VALID_RANGES["ph"],
    )

    if moisture is not None:
        validate_number(
            "Moisture",
            moisture,
            *VALID_RANGES["moisture"],
        )

    if temperature is not None:
        validate_number(
            "Temperature",
            temperature,
            *VALID_RANGES["temperature"],
        )


# =========================================================
# NUTRIENT STATUS
# =========================================================

def classify_nutrient(
    nutrient: str,
    value: float,
    npk_unit: str,
) -> Dict:

    # -----------------------------------------------------
    # ONLY KG/HA IS CLASSIFIED IN V2
    # -----------------------------------------------------

    if npk_unit != "kg/ha":
        return {
            "status": "unclassified",

            "value": value,

            "unit": npk_unit,

            "message": (
                "KrishiMitra does not apply kg/ha nutrient "
                "thresholds to this unit. Laboratory method "
                "and reference ranges are required for "
                "reliable classification."
            ),
        }

    ranges = KG_HA_NUTRIENT_RANGES[nutrient]

    low_max = ranges["low_max"]
    medium_max = ranges["medium_max"]

    if value < low_max:
        status = "low"

    elif value <= medium_max:
        status = "medium"

    else:
        status = "high"

    return {
        "status": status,
        "value": value,
        "unit": npk_unit,
    }


# =========================================================
# NPK ANALYSIS
# =========================================================

def analyse_nutrients(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    npk_unit: str,
) -> Dict:

    return {
        "nitrogen": classify_nutrient(
            "nitrogen",
            nitrogen,
            npk_unit,
        ),

        "phosphorus": classify_nutrient(
            "phosphorus",
            phosphorus,
            npk_unit,
        ),

        "potassium": classify_nutrient(
            "potassium",
            potassium,
            npk_unit,
        ),
    }


# =========================================================
# PH STATUS
# =========================================================

def analyse_ph(ph: float) -> Dict:

    if ph < 5.5:
        return {
            "status": "strongly_acidic",
            "label": "Strongly Acidic Soil",
            "severity": "high",
        }

    if ph < 6.5:
        return {
            "status": "slightly_acidic",
            "label": "Slightly Acidic Soil",
            "severity": "moderate",
        }

    if ph <= 7.5:
        return {
            "status": "near_neutral",
            "label": "Near Neutral pH",
            "severity": "good",
        }

    if ph <= 8.5:
        return {
            "status": "alkaline",
            "label": "Alkaline Soil",
            "severity": "moderate",
        }

    return {
        "status": "strongly_alkaline",
        "label": "Strongly Alkaline Soil",
        "severity": "high",
    }


# =========================================================
# MOISTURE STATUS
# =========================================================

def analyse_moisture(
    moisture: Optional[float],
) -> Dict:

    if moisture is None:
        return {
            "status": "unknown",
            "label": "Moisture not provided",
        }

    if moisture < 30:
        return {
            "status": "low",
            "label": "Low Soil Moisture",
        }

    if moisture > 85:
        return {
            "status": "high",
            "label": "High Soil Moisture",
        }

    return {
        "status": "moderate",
        "label": "Moderate Soil Moisture",
    }


# =========================================================
# PARAMETER SUITABILITY SCORE
# =========================================================

def calculate_parameter_score(
    value: float,
    minimum: float,
    maximum: float,
) -> float:

    if minimum <= value <= maximum:
        return 100.0

    range_width = maximum - minimum

    if range_width <= 0:
        return 0.0

    if value < minimum:
        distance = minimum - value
    else:
        distance = value - maximum

    score = (
        100
        - ((distance / range_width) * 100)
    )

    return round(
        max(
            0.0,
            min(100.0, score),
        ),
        2,
    )


# =========================================================
# BUILD OBSERVATIONS
# =========================================================

def build_observations(
    nutrient_analysis: Dict,
    ph_analysis: Dict,
    moisture_analysis: Dict,
    temperature: Optional[float],
) -> List[str]:

    observations: List[str] = []

    observations.append(
        f"Soil pH condition: "
        f"{ph_analysis['label']}."
    )

    observations.append(
        f"Soil moisture condition: "
        f"{moisture_analysis['label']}."
    )

    for nutrient_name in (
        "nitrogen",
        "phosphorus",
        "potassium",
    ):

        nutrient = nutrient_analysis[
            nutrient_name
        ]

        display_name = nutrient_name.capitalize()

        if nutrient["status"] == "unclassified":

            observations.append(
                f"{display_name}: "
                f"{nutrient['value']} "
                f"{nutrient['unit']} — "
                f"not automatically classified."
            )

        else:

            observations.append(
                f"{display_name}: "
                f"{nutrient['value']} "
                f"{nutrient['unit']} — "
                f"{nutrient['status'].capitalize()}."
            )

    if temperature is not None:
        observations.append(
            f"Temperature used for crop suitability: "
            f"{temperature}°C."
        )

    return observations


# =========================================================
# BUILD RECOMMENDATIONS
# =========================================================

def build_recommendations(
    nutrient_analysis: Dict,
    ph_analysis: Dict,
    moisture_analysis: Dict,
    npk_unit: str,
) -> List[str]:

    recommendations: List[str] = []

    # -----------------------------------------------------
    # PH
    # -----------------------------------------------------

    ph_status = ph_analysis["status"]

    if ph_status == "strongly_acidic":

        recommendations.append(
            "The soil is strongly acidic. Use the "
            "crop-specific Soil Health Card or local "
            "agricultural recommendation before applying "
            "soil amendments."
        )

    elif ph_status == "slightly_acidic":

        recommendations.append(
            "The soil is slightly acidic. Check whether "
            "the intended crop is suitable for this pH."
        )

    elif ph_status == "near_neutral":

        recommendations.append(
            "The soil pH is within a range suitable for "
            "many common crops."
        )

    elif ph_status == "alkaline":

        recommendations.append(
            "The soil is alkaline. Crop selection and "
            "nutrient availability should be evaluated "
            "before amendment decisions."
        )

    else:

        recommendations.append(
            "The soil is strongly alkaline. Local "
            "crop-specific soil-management guidance "
            "is recommended."
        )

    # -----------------------------------------------------
    # MOISTURE
    # -----------------------------------------------------

    moisture_status = moisture_analysis["status"]

    if moisture_status == "low":

        recommendations.append(
            "Soil moisture is low. Check irrigation needs "
            "according to crop stage and local weather."
        )

    elif moisture_status == "high":

        recommendations.append(
            "Soil moisture is high. Check drainage and "
            "avoid unnecessary irrigation."
        )

    # -----------------------------------------------------
    # NPK
    # -----------------------------------------------------

    if npk_unit == "kg/ha":

        for nutrient_name in (
            "nitrogen",
            "phosphorus",
            "potassium",
        ):

            nutrient = nutrient_analysis[
                nutrient_name
            ]

            status = nutrient["status"]

            display_name = (
                nutrient_name.capitalize()
            )

            if status == "low":

                recommendations.append(
                    f"{display_name} falls in the low "
                    f"soil-test category. Follow a "
                    f"crop-specific Soil Health Card "
                    f"recommendation before deciding "
                    f"fertilizer quantity."
                )

            elif status == "high":

                recommendations.append(
                    f"{display_name} falls in the high "
                    f"soil-test category. Avoid assuming "
                    f"that additional fertilizer is needed."
                )

    else:

        recommendations.append(
            "NPK values were not classified because their "
            "unit is not kg/ha. KrishiMitra requires the "
            "laboratory testing method and reference range "
            "before interpreting these nutrient values."
        )

    recommendations.append(
        "KrishiMitra does not estimate fertilizer dosage "
        "from these values alone. Crop, soil-test method, "
        "location and local recommendations are required."
    )

    return recommendations


# =========================================================
# CROP SUITABILITY
# =========================================================

def calculate_crop_suitability(
    crop_name: str,
    profile: Dict,
    ph: float,
    moisture: Optional[float],
    temperature: Optional[float],
) -> Dict:

    scores = {}

    # pH is always available
    scores["ph"] = calculate_parameter_score(
        ph,
        profile["ph"][0],
        profile["ph"][1],
    )

    # Moisture is optional
    if moisture is not None:

        scores["moisture"] = (
            calculate_parameter_score(
                moisture,
                profile["moisture"][0],
                profile["moisture"][1],
            )
        )

    # Temperature is optional
    if temperature is not None:

        scores["temperature"] = (
            calculate_parameter_score(
                temperature,
                profile["temperature"][0],
                profile["temperature"][1],
            )
        )

    # -----------------------------------------------------
    # DYNAMIC WEIGHTS
    # -----------------------------------------------------

    base_weights = {
        "ph": 0.40,
        "moisture": 0.30,
        "temperature": 0.30,
    }

    active_weight_total = sum(
        base_weights[key]
        for key in scores
    )

    suitability = sum(
        scores[key]
        * (
            base_weights[key]
            / active_weight_total
        )
        for key in scores
    )

    suitability = round(
        suitability,
        2,
    )

    if suitability >= 85:
        category = "excellent"

    elif suitability >= 70:
        category = "good"

    elif suitability >= 55:
        category = "moderate"

    else:
        category = "poor"

    reasons = []

    for parameter, score in scores.items():

        if score >= 90:

            reasons.append(
                f"{parameter.capitalize()} is "
                f"highly suitable."
            )

        elif score < 60:

            reasons.append(
                f"{parameter.capitalize()} may "
                f"limit suitability."
            )

    return {
        "crop": crop_name,

        "suitability": suitability,

        "category": category,

        "parameterScores": scores,

        "reasons": reasons,

        "nutrientScoreIncluded": False,
    }


# =========================================================
# SOIL HEALTH SCORE
# =========================================================

def calculate_soil_health(
    nutrient_analysis: Dict,
    ph_analysis: Dict,
    moisture_analysis: Dict,
) -> Dict:

    score = 100.0

    # -----------------------------------------------------
    # PH PENALTY
    # -----------------------------------------------------

    ph_status = ph_analysis["status"]

    if ph_status in {
        "strongly_acidic",
        "strongly_alkaline",
    }:
        score -= 30

    elif ph_status in {
        "slightly_acidic",
        "alkaline",
    }:
        score -= 10

    # -----------------------------------------------------
    # MOISTURE PENALTY
    # -----------------------------------------------------

    moisture_status = moisture_analysis[
        "status"
    ]

    if moisture_status in {
        "low",
        "high",
    }:
        score -= 15

    # -----------------------------------------------------
    # NUTRIENT PENALTY
    # -----------------------------------------------------

    classified_nutrients = [
        nutrient
        for nutrient in nutrient_analysis.values()
        if nutrient["status"]
        != "unclassified"
    ]

    for nutrient in classified_nutrients:

        if nutrient["status"] == "low":
            score -= 10

        elif nutrient["status"] == "high":
            score -= 5

    score = max(
        0.0,
        min(100.0, score),
    )

    if score >= 85:
        status = "excellent"

    elif score >= 70:
        status = "good"

    elif score >= 50:
        status = "moderate"

    else:
        status = "needs_attention"

    return {
        "score": round(score, 2),

        "status": status,

        "nutrientsIncluded": (
            len(classified_nutrients) > 0
        ),
    }


# =========================================================
# MAIN SOIL INTELLIGENCE FUNCTION
# =========================================================

def analyse_soil(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    npk_unit: str = "kg/ha",
    moisture: Optional[float] = None,
    temperature: Optional[float] = None,
) -> Dict:

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    validate_soil_data(
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        npk_unit=npk_unit,
        ph=ph,
        moisture=moisture,
        temperature=temperature,
    )

    # -----------------------------------------------------
    # NUTRIENT ANALYSIS
    # -----------------------------------------------------

    nutrient_analysis = analyse_nutrients(
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        npk_unit=npk_unit,
    )

    # -----------------------------------------------------
    # PH
    # -----------------------------------------------------

    ph_analysis = analyse_ph(ph)

    # -----------------------------------------------------
    # MOISTURE
    # -----------------------------------------------------

    moisture_analysis = analyse_moisture(
        moisture
    )

    # -----------------------------------------------------
    # OBSERVATIONS
    # -----------------------------------------------------

    observations = build_observations(
        nutrient_analysis=nutrient_analysis,
        ph_analysis=ph_analysis,
        moisture_analysis=moisture_analysis,
        temperature=temperature,
    )

    # -----------------------------------------------------
    # RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations = build_recommendations(
        nutrient_analysis=nutrient_analysis,
        ph_analysis=ph_analysis,
        moisture_analysis=moisture_analysis,
        npk_unit=npk_unit,
    )

    # -----------------------------------------------------
    # SOIL HEALTH
    # -----------------------------------------------------

    soil_health = calculate_soil_health(
        nutrient_analysis=nutrient_analysis,
        ph_analysis=ph_analysis,
        moisture_analysis=moisture_analysis,
    )

    # -----------------------------------------------------
    # CROP SUITABILITY
    # -----------------------------------------------------

    crop_results = []

    for crop_name, profile in CROP_PROFILES.items():

        crop_result = (
            calculate_crop_suitability(
                crop_name=crop_name,
                profile=profile,
                ph=ph,
                moisture=moisture,
                temperature=temperature,
            )
        )

        crop_results.append(
            crop_result
        )

    crop_results.sort(
        key=lambda crop: crop["suitability"],
        reverse=True,
    )

    recommended_crops = (
        crop_results[:5]
    )

    # -----------------------------------------------------
    # 3D VISUALIZATION DATA
    # -----------------------------------------------------

    visualization = {
        "soilHealthScore": (
            soil_health["score"]
        ),

        "soilStatus": (
            soil_health["status"]
        ),

        "phLevel": ph,

        "moistureLevel": moisture,

        "nutrientStatus": {
            "nitrogen": (
                nutrient_analysis[
                    "nitrogen"
                ]["status"]
            ),

            "phosphorus": (
                nutrient_analysis[
                    "phosphorus"
                ]["status"]
            ),

            "potassium": (
                nutrient_analysis[
                    "potassium"
                ]["status"]
            ),
        },
    }

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "status": "success",

        "soilHealth": soil_health,

        "soilValues": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "npkUnit": npk_unit,
            "ph": ph,
            "moisture": moisture,
            "temperature": temperature,
        },

        "nutrientAnalysis": (
            nutrient_analysis
        ),

        "phAnalysis": (
            ph_analysis
        ),

        "moistureAnalysis": (
            moisture_analysis
        ),

        "observations": observations,

        "warnings": [],

        "recommendations": (
            recommendations
        ),

        "recommendedCrops": (
            recommended_crops
        ),

        "allCropScores": (
            crop_results
        ),

        "visualization": visualization,

        "engine": {
            "name": (
                "KrishiMitra Soil Intelligence"
            ),

            "version": "2.0",

            "type": (
                "unit-aware rule-based"
            ),

            "nutrientPolicy": (
                "NPK classification is currently "
                "performed only for kg/ha."
            ),
        },
    }
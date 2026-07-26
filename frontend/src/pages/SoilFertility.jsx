import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./SoilFertility.css";

import { getCurrentWeather } from "../services/weatherService";
import SoilWeatherCard from "../components/SoilWeatherCard";
import AdvancedSoilTest from "../components/AdvancedSoilTest";
import SoilWeatherIntelligence from "../components/SoilWeatherIntelligence";

import { analyzeSoilWeather } from "../utils/soilWeatherEngine";
import PageNavigation from "../components/navigation/PageNavigation";

function SoilFertility() {
  // =====================================================
  // STATES
  // =====================================================

  const [language, setLanguage] = useState("hi");
  const [step, setStep] = useState(1);

  const [locationLoading, setLocationLoading] = useState(false);

  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [advancedSoilReport, setAdvancedSoilReport] = useState(null);

  const [soilPhoto, setSoilPhoto] = useState(null);
  const [cropPhoto, setCropPhoto] = useState(null);

  // NEW: Advanced Soil Test mode
  const [advancedMode, setAdvancedMode] = useState(false);

  const [answers, setAnswers] = useState({
    location: "",
    crop: "",
    soilColor: "",
    waterBehavior: "",
    plantCondition: "",
  });

  const [result, setResult] = useState(null);
  // =====================================================
  // SOIL × WEATHER INTELLIGENCE
  // =====================================================

  const soilWeatherIntelligence =
    advancedSoilReport && weather
      ? analyzeSoilWeather({
          soil: {
            ...advancedSoilReport,
            soilColor: answers.soilColor,
            waterBehavior: answers.waterBehavior,
            plantCondition: answers.plantCondition,
          },
          weather,
          crop: answers.crop || null,
          language,
        })
      : null;

  // =====================================================
  // LANGUAGE TEXT
  // =====================================================

  const text = {
    hi: {
      title: "अपनी मिट्टी को समझें",

      subtitle:
        "कुछ आसान सवालों के जवाब दें। KrishiMitra आपकी मिट्टी और फसल की स्थिति समझने में मदद करेगा।",

      location: "आपका खेत कहाँ है?",

      locationPlaceholder: "गाँव, जिला या शहर लिखें",

      crop: "आप कौन सी फसल उगा रहे हैं या उगाना चाहते हैं?",

      soil: "आपकी मिट्टी कैसी दिखती है?",

      water: "पानी देने के बाद मिट्टी का क्या होता है?",

      plant: "आपकी फसल या पौधे कैसे दिख रहे हैं?",

      next: "आगे बढ़ें",

      back: "पीछे जाएँ",

      analyze: "मिट्टी की सेहत जाँचें",

      resultTitle: "KrishiMitra Soil Health Report",

      advice: "KrishiMitra की सलाह",

      advanced: "मेरे पास Soil Test Report है",
    },

    en: {
      title: "Understand Your Soil",

      subtitle:
        "Answer a few simple questions. KrishiMitra will help you understand your soil and crop condition.",

      location: "Where is your farm?",

      locationPlaceholder: "Enter village, district or city",

      crop: "Which crop are you growing or planning to grow?",

      soil: "What does your soil look like?",

      water: "What happens after you water the soil?",

      plant: "How are your crops or plants looking?",

      next: "Continue",

      back: "Back",

      analyze: "Check Soil Health",

      resultTitle: "KrishiMitra Soil Health Report",

      advice: "KrishiMitra Advice",

      advanced: "I have a Soil Test Report",
    },
  };

  const t = text[language];

  // =====================================================
  // SAVE ANSWER
  // =====================================================

  const selectAnswer = (field, value) => {
    setAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // NEXT STEP + VALIDATION
  // =====================================================

  const nextStep = () => {
    let answered = true;

    if (step === 1 && !answers.location.trim()) {
      answered = false;
    }

    if (step === 2 && !answers.crop) {
      answered = false;
    }

    if (step === 3 && !answers.soilColor) {
      answered = false;
    }

    if (step === 4 && !answers.waterBehavior) {
      answered = false;
    }

    if (!answered) {
      alert(
        language === "hi"
          ? "कृपया आगे बढ़ने से पहले इस सवाल का जवाब दें।"
          : "Please answer this question before continuing.",
      );

      return;
    }

    if (step < 5) {
      setStep((previous) => previous + 1);
    }
  };

  // =====================================================
  // PREVIOUS STEP
  // =====================================================

  const previousStep = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  // =====================================================
  // GPS → READABLE LOCATION
  // =====================================================

  const getReadableLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();

      const address = data.address || {};

      const village =
        address.village ||
        address.town ||
        address.city ||
        address.municipality ||
        address.county ||
        "";

      const district = address.state_district || address.district || "";

      const state = address.state || "";
      const country = address.country || "";

      const locationParts = [village, district, state, country].filter(
        (item, index, array) => item && array.indexOf(item) === index,
      );

      if (locationParts.length > 0) {
        return locationParts.join(", ");
      }

      return data.display_name || "";
    } catch (error) {
      console.error("Location name error:", error);

      return "";
    }
  };

  // =====================================================
  // GPS + LIVE WEATHER
  // =====================================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        language === "hi"
          ? "आपका डिवाइस Location सुविधा सपोर्ट नहीं करता।"
          : "Your device does not support location.",
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Store coordinates
        setCoordinates({
          latitude,
          longitude,
        });

        // -----------------------------------------
        // READABLE LOCATION
        // -----------------------------------------

        try {
          const readableLocation = await getReadableLocation(
            latitude,
            longitude,
          );

          if (readableLocation) {
            setAnswers((previous) => ({
              ...previous,
              location: readableLocation,
            }));
          } else {
            setAnswers((previous) => ({
              ...previous,
              location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            }));
          }
        } catch (error) {
          console.error("Location conversion error:", error);

          setAnswers((previous) => ({
            ...previous,
            location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
        }

        // -----------------------------------------
        // LIVE WEATHER
        // -----------------------------------------

        setWeatherLoading(true);

        try {
          const weatherData = await getCurrentWeather(latitude, longitude);

          setWeather(weatherData);
        } catch (error) {
          console.error("Weather error:", error);

          setWeather(null);
        } finally {
          setWeatherLoading(false);
        }

        setLocationLoading(false);
      },

      (error) => {
        console.error("GPS error:", error);

        setLocationLoading(false);
        setWeatherLoading(false);

        let message;

        if (error.code === 1) {
          message =
            language === "hi"
              ? "Location permission बंद है। कृपया Browser में Location की अनुमति दें।"
              : "Location permission is blocked. Please allow location access in your browser.";
        } else if (error.code === 2) {
          message =
            language === "hi"
              ? "आपकी Location अभी उपलब्ध नहीं है।"
              : "Your location is currently unavailable.";
        } else {
          message =
            language === "hi"
              ? "Location नहीं मिल सकी। कृपया दोबारा कोशिश करें।"
              : "Location could not be detected. Please try again.";
        }

        alert(message);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  };

  // =====================================================
  // PHOTO UPLOAD
  // =====================================================

  const handlePhoto = (event, type) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        language === "hi"
          ? "कृपया केवल फोटो चुनें।"
          : "Please select an image file.",
      );

      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert(
        language === "hi"
          ? "फोटो बहुत बड़ी है। कृपया 8 MB से छोटी फोटो चुनें।"
          : "The image is too large. Please choose an image under 8 MB.",
      );

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (type === "soil") {
      if (soilPhoto?.preview) {
        URL.revokeObjectURL(soilPhoto.preview);
      }

      setSoilPhoto({
        file,
        preview: previewUrl,
      });
    }

    if (type === "crop") {
      if (cropPhoto?.preview) {
        URL.revokeObjectURL(cropPhoto.preview);
      }

      setCropPhoto({
        file,
        preview: previewUrl,
      });
    }
  };

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  const removePhoto = (type) => {
    if (type === "soil") {
      if (soilPhoto?.preview) {
        URL.revokeObjectURL(soilPhoto.preview);
      }

      setSoilPhoto(null);
    }

    if (type === "crop") {
      if (cropPhoto?.preview) {
        URL.revokeObjectURL(cropPhoto.preview);
      }

      setCropPhoto(null);
    }
  };

  // =====================================================
  // CLEAN IMAGE PREVIEW URLS
  // =====================================================

  useEffect(() => {
    return () => {
      if (soilPhoto?.preview) {
        URL.revokeObjectURL(soilPhoto.preview);
      }

      if (cropPhoto?.preview) {
        URL.revokeObjectURL(cropPhoto.preview);
      }
    };
  }, [soilPhoto, cropPhoto]);

  // =====================================================
  // SOIL HEALTH ANALYSIS
  // =====================================================

  const analyzeSoil = () => {
    if (!answers.plantCondition) {
      alert(
        language === "hi"
          ? "कृपया पौधे की स्थिति चुनें।"
          : "Please select the plant condition.",
      );

      return;
    }

    let health = language === "hi" ? "अच्छी स्थिति" : "Good";

    let icon = "🟢";

    const problems = [];
    const advice = [];

    // =====================================================
    // WATER BEHAVIOUR
    // =====================================================

    if (answers.waterBehavior === "fast") {
      problems.push(
        language === "hi"
          ? "मिट्टी जल्दी सूख रही है।"
          : "The soil appears to dry quickly.",
      );

      advice.push(
        language === "hi"
          ? "सिंचाई की स्थिति पर ध्यान दें और मिट्टी में नमी बनाए रखने के उपाय करें।"
          : "Review irrigation and consider ways to retain soil moisture.",
      );
    }

    if (answers.waterBehavior === "slow") {
      problems.push(
        language === "hi"
          ? "मिट्टी में पानी लंबे समय तक रुक रहा है।"
          : "Water appears to remain in the soil for a long time.",
      );

      advice.push(
        language === "hi"
          ? "खेत की जल निकासी की जाँच करें।"
          : "Check the field's drainage.",
      );
    }

    // =====================================================
    // SOIL APPEARANCE
    // =====================================================

    if (answers.soilColor === "sandy" && answers.waterBehavior === "fast") {
      advice.push(
        language === "hi"
          ? "रेतीली मिट्टी में पानी जल्दी निकल सकता है। जैविक पदार्थ मिट्टी में नमी बनाए रखने में मदद कर सकते हैं।"
          : "Sandy soil can lose water quickly. Organic matter may help improve moisture retention.",
      );
    }

    // =====================================================
    // PLANT CONDITION
    // =====================================================

    if (answers.plantCondition === "yellow") {
      problems.push(
        language === "hi"
          ? "पीले पत्ते पोषण या दूसरी पौध समस्या का संकेत हो सकते हैं।"
          : "Yellow leaves may indicate a nutrient or other plant-health problem.",
      );

      advice.push(
        language === "hi"
          ? "खाद डालने से पहले Soil Test करवाना बेहतर होगा।"
          : "Consider a soil test before applying fertilizer.",
      );
    }

    if (answers.plantCondition === "weak") {
      problems.push(
        language === "hi"
          ? "पौधों की बढ़वार कमजोर दिखाई दे रही है।"
          : "Plant growth appears weak.",
      );

      advice.push(
        language === "hi"
          ? "पानी, मिट्टी और पोषण की स्थिति की जाँच करें।"
          : "Check irrigation, soil condition and plant nutrition.",
      );
    }

    if (answers.plantCondition === "dry") {
      problems.push(
        language === "hi"
          ? "पौधों में सूखने के लक्षण दिखाई दे रहे हैं।"
          : "The plants show signs of drying.",
      );

      advice.push(
        language === "hi"
          ? "पानी की उपलब्धता और पौधों की स्थिति को जल्द जाँचें।"
          : "Check water availability and crop condition promptly.",
      );
    }

    // =====================================================
    // WEATHER-AWARE ANALYSIS
    // =====================================================

    if (
      weather &&
      weather.temperature >= 32 &&
      answers.waterBehavior === "fast"
    ) {
      problems.push(
        language === "hi"
          ? "गर्म मौसम मिट्टी की नमी जल्दी कम होने में योगदान दे सकता है।"
          : "Hot weather may be contributing to faster soil moisture loss.",
      );

      advice.push(
        language === "hi"
          ? "गर्म मौसम में मिट्टी की नमी और सिंचाई की जरूरत को अधिक बार जाँचें।"
          : "Check soil moisture and irrigation needs more frequently during hot conditions.",
      );
    }

    if (
      weather &&
      weather.precipitation > 0 &&
      answers.waterBehavior === "slow"
    ) {
      advice.push(
        language === "hi"
          ? "मौजूदा वर्षा और मिट्टी में पानी रुकने के कारण खेत की जल निकासी पर ध्यान दें।"
          : "With current precipitation and slow drainage, monitor the field for excess water.",
      );
    }

    if (weather && weather.humidity < 35 && answers.plantCondition === "dry") {
      advice.push(
        language === "hi"
          ? "कम हवा की नमी पौधों से पानी की कमी को बढ़ा सकती है। सिंचाई की स्थिति जाँचें।"
          : "Low humidity may increase plant water loss. Check irrigation conditions.",
      );
    }

    // =====================================================
    // HEALTH STATUS
    // =====================================================

    if (problems.length >= 1) {
      health = language === "hi" ? "थोड़ा ध्यान दें" : "Monitor Carefully";

      icon = "🟡";
    }

    if (problems.length >= 2) {
      health = language === "hi" ? "ध्यान देने की जरूरत" : "Needs Attention";

      icon = "🟠";
    }

    if (problems.length >= 3) {
      health = language === "hi" ? "जाँच की सलाह" : "Check Recommended";

      icon = "🔴";
    }

    // =====================================================
    // HEALTHY CONDITION
    // =====================================================

    if (problems.length === 0) {
      problems.push(
        language === "hi"
          ? "आपके दिए गए जवाबों और उपलब्ध मौसम की जानकारी में कोई स्पष्ट समस्या दिखाई नहीं दी।"
          : "No obvious problem was identified from your answers and the available weather information.",
      );

      advice.push(
        language === "hi"
          ? "फसल और मिट्टी की नियमित निगरानी करते रहें।"
          : "Continue monitoring your crop and soil regularly.",
      );
    }

    setResult({
      health,
      icon,
      problems,
      advice,
    });
  };

  // =====================================================
  // VOICE ADVICE
  // =====================================================

  const speakAdvice = () => {
    if (!result) return;

    if (!("speechSynthesis" in window)) {
      alert(
        language === "hi"
          ? "आपका Browser Voice सुविधा सपोर्ट नहीं करता।"
          : "Your browser does not support voice output.",
      );

      return;
    }

    window.speechSynthesis.cancel();

    const speechText = [
      result.health,
      ...result.problems,
      ...result.advice,
    ].join(" ");

    const speech = new SpeechSynthesisUtterance(speechText);

    speech.lang = language === "hi" ? "hi-IN" : "en-IN";

    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // RESET NORMAL SOIL TEST
  // =====================================================

  const resetTest = () => {
    if (soilPhoto?.preview) {
      URL.revokeObjectURL(soilPhoto.preview);
    }

    if (cropPhoto?.preview) {
      URL.revokeObjectURL(cropPhoto.preview);
    }

    setSoilPhoto(null);
    setCropPhoto(null);

    setCoordinates({
      latitude: null,
      longitude: null,
    });

    setWeather(null);
    setWeatherLoading(false);

    setStep(1);
    setResult(null);
    setAdvancedMode(false);

    setAnswers({
      location: "",
      crop: "",
      soilColor: "",
      waterBehavior: "",
      plantCondition: "",
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <PageNavigation />
    <div className="farmer-soil-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="soil-topbar">
        <Link to="/" className="soil-brand">
          🌱 <strong>KRISHIMITRA AI</strong>
        </Link>

        <div className="language-switch">
          <button
            type="button"
            className={language === "hi" ? "selected-language" : ""}
            onClick={() => setLanguage("hi")}
          >
            हिंदी
          </button>

          <button
            type="button"
            className={language === "en" ? "selected-language" : ""}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="soil-assistant">
        {/* =================================================
            NORMAL FARMER TEST
        ================================================= */}

        {!result && !advancedMode && (
          <>
            {/* INTRO */}

            <section className="soil-intro">
              <div className="soil-main-icon">🌱</div>

              <span className="assistant-label">
                KRISHIMITRA SOIL ASSISTANT
              </span>

              <h1>{t.title}</h1>

              <p>{t.subtitle}</p>
            </section>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="soil-progress">
              {[1, 2, 3, 4, 5].map((number) => (
                <div
                  key={number}
                  className={`progress-dot ${
                    number <= step ? "progress-active" : ""
                  }`}
                >
                  {number}
                </div>
              ))}
            </div>

            {/* =================================================
                QUESTION CARD
            ================================================= */}

            <section className="question-card">
              {/* =================================================
                  STEP 1 — LOCATION + WEATHER
              ================================================= */}

              {step === 1 && (
                <>
                  <div className="question-icon">📍</div>

                  <h2>{t.location}</h2>

                  <input
                    className="location-input"
                    type="text"
                    placeholder={t.locationPlaceholder}
                    value={answers.location}
                    onChange={(event) =>
                      selectAnswer("location", event.target.value)
                    }
                  />

                  <button
                    className="location-button"
                    type="button"
                    onClick={getLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? language === "hi"
                        ? "📡 आपका स्थान खोज रहे हैं..."
                        : "📡 Finding your location..."
                      : language === "hi"
                        ? "📍 मेरी Location इस्तेमाल करें"
                        : "📍 Use My Location"}
                  </button>

                  {coordinates.latitude !== null &&
                    coordinates.longitude !== null && (
                      <div className="gps-success">
                        ✓{" "}
                        {language === "hi"
                          ? "GPS Location मिल गई"
                          : "GPS location detected"}
                      </div>
                    )}

                  <SoilWeatherCard
                    weather={weather}
                    loading={weatherLoading}
                    language={language}
                  />
                </>
              )}

              {/* =================================================
                  STEP 2 — CROP
              ================================================= */}

              {step === 2 && (
                <>
                  <div className="question-icon">🌾</div>

                  <h2>{t.crop}</h2>

                  <div className="choice-grid">
                    {[
                      ["wheat", "🌾", language === "hi" ? "गेहूँ" : "Wheat"],

                      ["rice", "🌾", language === "hi" ? "धान" : "Rice"],

                      ["maize", "🌽", language === "hi" ? "मक्का" : "Maize"],

                      ["potato", "🥔", language === "hi" ? "आलू" : "Potato"],
                    ].map(([value, icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          answers.crop === value
                            ? "choice-card selected-choice"
                            : "choice-card"
                        }
                        onClick={() => selectAnswer("crop", value)}
                      >
                        <span>{icon}</span>

                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 3 — SOIL
              ================================================= */}

              {step === 3 && (
                <>
                  <div className="question-icon">🟤</div>

                  <h2>{t.soil}</h2>

                  <div className="choice-grid">
                    {[
                      ["black", "⚫", language === "hi" ? "काली" : "Black"],

                      ["brown", "🟤", language === "hi" ? "भूरी" : "Brown"],

                      ["red", "🔴", language === "hi" ? "लाल" : "Red"],

                      ["sandy", "🏖️", language === "hi" ? "रेतीली" : "Sandy"],
                    ].map(([value, icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          answers.soilColor === value
                            ? "choice-card selected-choice"
                            : "choice-card"
                        }
                        onClick={() => selectAnswer("soilColor", value)}
                      >
                        <span>{icon}</span>

                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>

                  {/* SOIL PHOTO */}

                  {!soilPhoto ? (
                    <label className="photo-upload">
                      <span>
                        📷{" "}
                        {language === "hi"
                          ? "मिट्टी की फोटो लें / अपलोड करें"
                          : "Take / Upload Soil Photo"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(event) => handlePhoto(event, "soil")}
                      />
                    </label>
                  ) : (
                    <div className="photo-preview-card">
                      <p>
                        🌱 {language === "hi" ? "मिट्टी की फोटो" : "Soil Photo"}
                      </p>

                      <img
                        src={soilPhoto.preview}
                        alt="Selected soil"
                        className="uploaded-preview"
                      />

                      <div className="photo-actions">
                        <label className="change-photo-button">
                          📷 {language === "hi" ? "फोटो बदलें" : "Change Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(event) => handlePhoto(event, "soil")}
                          />
                        </label>

                        <button
                          type="button"
                          className="remove-photo-button"
                          onClick={() => removePhoto("soil")}
                        >
                          🗑️ {language === "hi" ? "हटाएँ" : "Remove"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =================================================
                  STEP 4 — WATER
              ================================================= */}

              {step === 4 && (
                <>
                  <div className="question-icon">💧</div>

                  <h2>{t.water}</h2>

                  <div className="vertical-choices">
                    <button
                      type="button"
                      className={
                        answers.waterBehavior === "fast"
                          ? "wide-choice selected-choice"
                          : "wide-choice"
                      }
                      onClick={() => selectAnswer("waterBehavior", "fast")}
                    >
                      💨
                      <span>
                        {language === "hi"
                          ? "जल्दी सूख जाती है"
                          : "Dries quickly"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        answers.waterBehavior === "normal"
                          ? "wide-choice selected-choice"
                          : "wide-choice"
                      }
                      onClick={() => selectAnswer("waterBehavior", "normal")}
                    >
                      🌱
                      <span>
                        {language === "hi" ? "सामान्य रहती है" : "Stays normal"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        answers.waterBehavior === "slow"
                          ? "wide-choice selected-choice"
                          : "wide-choice"
                      }
                      onClick={() => selectAnswer("waterBehavior", "slow")}
                    >
                      💧
                      <span>
                        {language === "hi"
                          ? "काफी देर तक गीली रहती है"
                          : "Stays wet for long"}
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 5 — PLANT
              ================================================= */}

              {step === 5 && (
                <>
                  <div className="question-icon">🌿</div>

                  <h2>{t.plant}</h2>

                  <div className="choice-grid">
                    {[
                      [
                        "healthy",
                        "💚",
                        language === "hi" ? "स्वस्थ" : "Healthy",
                      ],

                      [
                        "yellow",
                        "🟡",
                        language === "hi" ? "पीले पत्ते" : "Yellow Leaves",
                      ],

                      [
                        "weak",
                        "🥀",
                        language === "hi" ? "कमजोर बढ़वार" : "Weak Growth",
                      ],

                      [
                        "dry",
                        "🍂",
                        language === "hi" ? "सूख रहे हैं" : "Drying",
                      ],
                    ].map(([value, icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          answers.plantCondition === value
                            ? "choice-card selected-choice"
                            : "choice-card"
                        }
                        onClick={() => selectAnswer("plantCondition", value)}
                      >
                        <span>{icon}</span>

                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>

                  {/* CROP PHOTO */}

                  {!cropPhoto ? (
                    <label className="photo-upload">
                      <span>
                        📷{" "}
                        {language === "hi"
                          ? "फसल की फोटो लें / अपलोड करें"
                          : "Take / Upload Crop Photo"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(event) => handlePhoto(event, "crop")}
                      />
                    </label>
                  ) : (
                    <div className="photo-preview-card">
                      <p>
                        🌿 {language === "hi" ? "फसल की फोटो" : "Crop Photo"}
                      </p>

                      <img
                        src={cropPhoto.preview}
                        alt="Selected crop"
                        className="uploaded-preview"
                      />

                      <div className="photo-actions">
                        <label className="change-photo-button">
                          📷 {language === "hi" ? "फोटो बदलें" : "Change Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(event) => handlePhoto(event, "crop")}
                          />
                        </label>

                        <button
                          type="button"
                          className="remove-photo-button"
                          onClick={() => removePhoto("crop")}
                        >
                          🗑️ {language === "hi" ? "हटाएँ" : "Remove"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =================================================
                  NAVIGATION
              ================================================= */}

              <div className="question-navigation">
                {step > 1 && (
                  <button
                    type="button"
                    className="back-button"
                    onClick={previousStep}
                  >
                    ← {t.back}
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    className="continue-button"
                    onClick={nextStep}
                  >
                    {t.next} →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="analyze-soil-button"
                    onClick={analyzeSoil}
                  >
                    🔍 {t.analyze}
                  </button>
                )}
              </div>
            </section>
          </>
        )}

        {/* =================================================
            NORMAL SOIL HEALTH RESULT
        ================================================= */}

        {result && !advancedMode && (
          <section className="soil-health-result">
            <span className="assistant-label">{t.resultTitle}</span>

            <div className="health-icon">{result.icon}</div>

            <h1>{result.health}</h1>

            {/* LOCATION */}

            <div className="result-message">📍 {answers.location}</div>

            {/* WEATHER */}

            {weather && (
              <SoilWeatherCard
                weather={weather}
                loading={false}
                language={language}
              />
            )}

            {/* OBSERVATIONS */}

            <div className="result-section">
              {result.problems.map((problem, index) => (
                <div className="result-message" key={index}>
                  🌱 {problem}
                </div>
              ))}
            </div>

            {/* ADVICE */}

            <div className="advice-box">
              <h2>💡 {t.advice}</h2>

              {result.advice.map((item, index) => (
                <p key={index}>✓ {item}</p>
              ))}
            </div>

            {/* RESULT ACTIONS */}

            <div className="result-actions">
              <button
                type="button"
                className="voice-button"
                onClick={speakAdvice}
              >
                🔊 {language === "hi" ? "सलाह सुनें" : "Listen to Advice"}
              </button>

              <button
                type="button"
                className="restart-button"
                onClick={resetTest}
              >
                ↻ {language === "hi" ? "फिर से जाँचें" : "Check Again"}
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            ADVANCED MODE OPEN
        ================================================= */}

        {!result && advancedMode && (
          <AdvancedSoilTest
          language={language}
          onClose={() => setAdvancedMode(false)}
          onReportGenerated={(generatedReport) => {
            setAdvancedSoilReport(generatedReport);
          
            try {
              const soilData = {
                ...generatedReport,
          
                soilType:
                  generatedReport.soilType ||
                  answers.soilColor ||
                  null,
          
                soilColor: answers.soilColor || null,
                crop: answers.crop || null,
                location: answers.location || null,
          
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
          
                savedAt: new Date().toISOString(),
              };
          
              localStorage.setItem(
                "krishimitra_latest_soil_report",
                JSON.stringify(soilData)
              );
            } catch (error) {
              console.error(
                "Could not save soil report:",
                error
              );
            }
          }}
          />
        )}
         {/* =====================================================
             SOIL × WEATHER INTELLIGENCE
        ===================================================== */}

        {soilWeatherIntelligence && (
          <SoilWeatherIntelligence
            data={soilWeatherIntelligence}
            language={language}
          />
        )}

        {/* =================================================
            OPEN ADVANCED TEST CARD
        ================================================= */}

        {!result && !advancedMode && (
          <div className="advanced-test">
            <span>🔬 {t.advanced}</span>

            <p>
              {language === "hi"
                ? "अगर आपके पास Lab Report या Soil Health Card है तो उसकी वास्तविक N, P, K और pH values का Advanced Analysis करें।"
                : "If you have a lab report or Soil Health Card, analyze its actual N, P, K and pH values."}
            </p>

            <button type="button" onClick={() => setAdvancedMode(true)}>
              {language === "hi"
                ? "Advanced Test खोलें →"
                : "Open Advanced Test →"}
            </button>
          </div>
        )}
      </main>
    </div>
    </>
  );
}

export default SoilFertility;

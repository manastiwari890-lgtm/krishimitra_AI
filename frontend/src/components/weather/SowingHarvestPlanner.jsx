function SowingHarvestPlanner({
    data,
    language = "hi",
  }) {
    if (!data) {
      return null;
    }
  
    // =====================================================
    // TIME FORMATTER
    // =====================================================
  
    const formatTime = (time) => {
      if (!time) return "--";
  
      return new Date(time).toLocaleTimeString(
        language === "hi"
          ? "hi-IN"
          : "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    };
  
    // =====================================================
    // DATE FORMATTER
    // =====================================================
  
    const formatDate = (time) => {
      if (!time) return "";
  
      return new Date(time).toLocaleDateString(
        language === "hi"
          ? "hi-IN"
          : "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        }
      );
    };
  
    // =====================================================
    // STATUS INFORMATION
    // =====================================================
  
    const getStatusInfo = (status) => {
      switch (status) {
        case "excellent":
          return {
            icon: "🟢",
            label:
              language === "hi"
                ? "बहुत अनुकूल"
                : "Excellent",
          };
  
        case "good":
          return {
            icon: "🟢",
            label:
              language === "hi"
                ? "अनुकूल"
                : "Good",
          };
  
        case "caution":
          return {
            icon: "🟠",
            label:
              language === "hi"
                ? "सावधानी"
                : "Caution",
          };
  
        case "avoid":
          return {
            icon: "🔴",
            label:
              language === "hi"
                ? "अभी टालें"
                : "Avoid",
          };
  
        default:
          return {
            icon: "⚪",
            label:
              language === "hi"
                ? "जानकारी उपलब्ध नहीं"
                : "Unknown",
          };
      }
    };
  
    // =====================================================
    // OPERATION CARD
    // =====================================================
  
    const PlannerCard = ({
      icon,
      title,
      operation,
      type,
    }) => {
      if (!operation) {
        return null;
      }
  
      const status =
        getStatusInfo(operation.status);
  
      const window =
        operation.window;
  
      const relevant =
        operation.relevant;
  
      return (
        <div
          className={`sowing-harvest-card ${
            relevant
              ? "sowing-harvest-relevant"
              : ""
          }`}
        >
          <div className="sowing-harvest-card-header">
  
            <div className="sowing-harvest-title">
  
              <span className="sowing-harvest-icon">
                {icon}
              </span>
  
              <div>
                <span className="weather-label">
                  {type}
                </span>
  
                <h3>
                  {title}
                </h3>
              </div>
  
            </div>
  
            <div
              className={`sowing-harvest-status status-${operation.status}`}
            >
              <span>
                {status.icon}
              </span>
  
              {status.label}
            </div>
  
          </div>
  
          {/* =============================================
              STAGE RELEVANCE
          ============================================= */}
  
          <div className="sowing-stage-status">
  
            {relevant ? (
              <>
                <span>🎯</span>
  
                <div>
                  <strong>
                    {language === "hi"
                      ? "वर्तमान फसल अवस्था के लिए प्रासंगिक"
                      : "Relevant to Current Crop Stage"}
                  </strong>
  
                  <p>
                    {language === "hi"
                      ? "आपकी चुनी गई crop stage इस operation से संबंधित है।"
                      : "Your selected crop stage is relevant to this operation."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span>ℹ️</span>
  
                <div>
                  <strong>
                    {language === "hi"
                      ? "Weather Information Only"
                      : "Weather Information Only"}
                  </strong>
  
                  <p>
                    {language === "hi"
                      ? "यह operation आपकी वर्तमान crop stage के लिए मुख्य recommendation नहीं है।"
                      : "This operation is not currently the primary recommendation for the selected crop stage."}
                  </p>
                </div>
              </>
            )}
  
          </div>
  
          {/* =============================================
              BEST WINDOW
          ============================================= */}
  
          {window ? (
            <div className="sowing-window-box">
  
              <span className="weather-label">
                {language === "hi"
                  ? "BEST WEATHER WINDOW"
                  : "BEST WEATHER WINDOW"}
              </span>
  
              <div className="sowing-window-date">
                📅 {formatDate(window.start)}
              </div>
  
              <div className="sowing-window-time">
                {formatTime(window.start)}
                {" → "}
                {formatTime(window.end)}
              </div>
  
              <div className="sowing-window-meta">
  
                <span>
                  ⏱️{" "}
                  {window.durationHours}{" "}
                  {language === "hi"
                    ? "घंटे"
                    : "hours"}
                </span>
  
                <span>
                  📊 {window.score}/100
                </span>
  
              </div>
  
            </div>
          ) : (
            <div className="sowing-window-unavailable">
  
              <span>⚠️</span>
  
              <div>
                <strong>
                  {language === "hi"
                    ? "अच्छा weather window नहीं मिला"
                    : "No Suitable Weather Window"}
                </strong>
  
                <p>
                  {language === "hi"
                    ? "अगले 72 घंटों में पर्याप्त अनुकूल परिस्थितियाँ नहीं मिलीं।"
                    : "No sufficiently suitable conditions were found in the next 72 hours."}
                </p>
              </div>
  
            </div>
          )}
  
          {/* =============================================
              ADVICE
          ============================================= */}
  
          <p className="sowing-harvest-message">
            {operation.message}
          </p>
  
        </div>
      );
    };
  
    // =====================================================
    // MAIN UI
    // =====================================================
  
    return (
      <section className="weather-section sowing-harvest-section">
  
        {/* =================================================
            HEADER
        ================================================= */}
  
        <div className="weather-section-heading">
  
          <div>
  
            <span className="weather-label">
              🌱 SMART CROP OPERATIONS
            </span>
  
            <h2>
              {language === "hi"
                ? "बुवाई और कटाई की मौसम योजना"
                : "Sowing & Harvest Intelligence"}
            </h2>
  
            <p className="crop-weather-description">
              {data.summary}
            </p>
  
          </div>
  
        </div>
  
        {/* =================================================
            CROP CONTEXT
        ================================================= */}
  
        {data.cropName && (
          <div className="sowing-crop-context">
  
            <span>
              🌾
            </span>
  
            <div>
              <small>
                {language === "hi"
                  ? "विश्लेषण की गई फसल"
                  : "CROP BEING ANALYSED"}
              </small>
  
              <strong>
                {data.cropName}
              </strong>
            </div>
  
          </div>
        )}
  
        {/* =================================================
            SOWING + HARVEST CARDS
        ================================================= */}
  
        <div className="sowing-harvest-grid">
  
          <PlannerCard
            icon="🌱"
            type={
              language === "hi"
                ? "बुवाई"
                : "SOWING"
            }
            title={
              language === "hi"
                ? "बुवाई का मौसम"
                : "Sowing Window"
            }
            operation={data.sowing}
          />
  
          <PlannerCard
            icon="🌾"
            type={
              language === "hi"
                ? "कटाई"
                : "HARVEST"
            }
            title={
              language === "hi"
                ? "कटाई का मौसम"
                : "Harvest Window"
            }
            operation={data.harvest}
          />
  
        </div>
  
        {/* =================================================
            RAIN OUTLOOK
        ================================================= */}
  
        <div className="sowing-rain-outlook">
  
          <div className="sowing-rain-icon">
            🌧️
          </div>
  
          <div className="sowing-rain-content">
  
            <span className="weather-label">
              72 HOUR RAIN OUTLOOK
            </span>
  
            <h3>
              {data.rain.expected
                ? language === "hi"
                  ? "बारिश की संभावना है"
                  : "Rain Expected"
                : language === "hi"
                ? "महत्वपूर्ण बारिश नहीं"
                : "No Significant Rain Expected"}
            </h3>
  
            <p>
              {language === "hi"
                ? `अगले 72 घंटों में अनुमानित बारिश ${data.rain.totalRain} mm तक है और अधिकतम rain probability लगभग ${Math.round(
                    data.rain.highestProbability
                  )}% है।`
                : `Forecast rainfall over the next 72 hours is approximately ${data.rain.totalRain} mm, with a maximum rain probability of about ${Math.round(
                    data.rain.highestProbability
                  )}%.`}
            </p>
  
          </div>
  
        </div>
  
        {/* =================================================
            DISCLAIMER
        ================================================= */}
  
        <div className="weather-disclaimer">
  
          ℹ️{" "}
  
          {language === "hi"
            ? "Sowing और harvesting का अंतिम निर्णय केवल weather forecast पर न लें। Soil moisture, crop maturity, crop variety, seedbed condition, field condition और स्थानीय कृषि सलाह भी जरूरी हैं।"
            : "Do not make final sowing or harvesting decisions from the weather forecast alone. Soil moisture, crop maturity, crop variety, seedbed condition, field conditions and local agricultural guidance also matter."}
  
        </div>
  
      </section>
    );
  }
  
  export default SowingHarvestPlanner;
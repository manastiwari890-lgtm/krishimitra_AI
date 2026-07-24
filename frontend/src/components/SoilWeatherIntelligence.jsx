function SoilWeatherIntelligence({
    data,
    language = "hi",
  }) {
    if (!data) return null;
  
    const getRiskInfo = (risk) => {
      switch (risk) {
        case "high":
          return {
            icon: "🔴",
            label:
              language === "hi"
                ? "उच्च जोखिम"
                : "High Risk",
          };
  
        case "medium":
          return {
            icon: "🟠",
            label:
              language === "hi"
                ? "मध्यम जोखिम"
                : "Medium Risk",
          };
  
        case "low":
          return {
            icon: "🟡",
            label:
              language === "hi"
                ? "कम जोखिम"
                : "Low Risk",
          };
  
        default:
          return {
            icon: "🟢",
            label:
              language === "hi"
                ? "सामान्य"
                : "Normal",
          };
      }
    };
  
    const overall = getRiskInfo(data.overallRisk);
  
    return (
      <section className="soil-weather-intelligence">
  
        {/* HEADER */}
  
        <div className="soil-weather-intelligence-header">
          <div>
            <span className="soil-ai-label">
              🌱 KRISHIMITRA COMBINED INTELLIGENCE
            </span>
  
            <h2>
              {language === "hi"
                ? "मिट्टी × मौसम विश्लेषण"
                : "Soil × Weather Intelligence"}
            </h2>
  
            <p>{data.summary}</p>
          </div>
  
          <div
            className={`soil-weather-risk risk-${data.overallRisk}`}
          >
            {overall.icon} {overall.label}
          </div>
        </div>
  
        {/* DATA SNAPSHOT */}
  
        <div className="soil-weather-data-grid">
  
          <div className="soil-weather-data-card">
            <span>🌡️</span>
  
            <small>
              {language === "hi"
                ? "तापमान"
                : "TEMPERATURE"}
            </small>
  
            <strong>
              {data.weather.temperature !== null
                ? `${Math.round(
                    data.weather.temperature
                  )}°C`
                : "—"}
            </strong>
          </div>
  
          <div className="soil-weather-data-card">
            <span>💧</span>
  
            <small>
              {language === "hi"
                ? "मिट्टी नमी"
                : "SOIL MOISTURE"}
            </small>
  
            <strong>
              {data.soil.moisture !== null
                ? `${data.soil.moisture}%`
                : "—"}
            </strong>
          </div>
  
          <div className="soil-weather-data-card">
            <span>🧪</span>
  
            <small>SOIL pH</small>
  
            <strong>
              {data.soil.ph !== null
                ? data.soil.ph
                : "—"}
            </strong>
          </div>
  
          <div className="soil-weather-data-card">
            <span>🌧️</span>
  
            <small>
              {language === "hi"
                ? "वर्षा"
                : "PRECIPITATION"}
            </small>
  
            <strong>
              {data.weather.precipitation !== null
                ? `${data.weather.precipitation} mm`
                : "—"}
            </strong>
          </div>
  
        </div>
  
        {/* NPK SNAPSHOT */}
  
        <div className="soil-weather-npk">
  
          <div>
            <span>N</span>
            <strong>
              {data.soil.nitrogen ?? "—"}
            </strong>
          </div>
  
          <div>
            <span>P</span>
            <strong>
              {data.soil.phosphorus ?? "—"}
            </strong>
          </div>
  
          <div>
            <span>K</span>
            <strong>
              {data.soil.potassium ?? "—"}
            </strong>
          </div>
  
        </div>
  
        <p className="soil-weather-npk-note">
          ℹ️{" "}
          {language === "hi"
            ? "N, P और K values को units और Soil Test reference range के बिना Low/Medium/High classify नहीं किया गया है।"
            : "N, P and K values are not classified as Low/Medium/High without report units and reference ranges."}
        </p>
  
        {/* INTELLIGENCE */}
  
        {data.insights?.length > 0 ? (
          <div className="soil-weather-insights">
  
            {data.insights.map((insight) => {
              const risk =
                getRiskInfo(insight.severity);
  
              return (
                <article
                  key={insight.id}
                  className={`soil-weather-insight-card soil-insight-${insight.severity}`}
                >
  
                  <div className="soil-insight-icon">
                    {insight.icon}
                  </div>
  
                  <div className="soil-insight-content">
  
                    <div className="soil-insight-heading">
  
                      <h3>
                        {insight.title}
                      </h3>
  
                      <span
                        className={`soil-insight-risk risk-${insight.severity}`}
                      >
                        {risk.icon} {risk.label}
                      </span>
  
                    </div>
  
                    <p>{insight.message}</p>
  
                    <div className="soil-insight-action">
                      <span>💡</span>
  
                      <div>
                        <strong>
                          {language === "hi"
                            ? "सुझाई गई कार्रवाई"
                            : "Recommended Action"}
                        </strong>
  
                        <p>{insight.action}</p>
                      </div>
                    </div>
  
                  </div>
  
                </article>
              );
            })}
  
          </div>
        ) : (
          <div className="soil-weather-safe">
            <span>✅</span>
  
            <div>
              <strong>
                {language === "hi"
                  ? "कोई प्रमुख संयुक्त जोखिम नहीं"
                  : "No Major Combined Risk"}
              </strong>
  
              <p>{data.summary}</p>
            </div>
          </div>
        )}
  
      </section>
    );
  }
  
  export default SoilWeatherIntelligence;
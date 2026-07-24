function SoilWeatherCard({ weather, loading, language }) {
    if (loading) {
      return (
        <div className="soil-weather-card">
          <h3>🌦️ KrishiMitra Weather</h3>
  
          <p>
            {language === "hi"
              ? "मौसम की जानकारी प्राप्त की जा रही है..."
              : "Getting local weather..."}
          </p>
        </div>
      );
    }
  
    if (!weather) return null;
  
    return (
      <div className="soil-weather-card">
  
        <div>
          <span className="weather-label">
            LIVE FARM WEATHER
          </span>
  
          <h3>🌦️ Local Weather</h3>
        </div>
  
        <div className="weather-values">
  
          <div>
            <span>🌡️</span>
            <strong>{weather.temperature}°C</strong>
            <small>
              {language === "hi" ? "तापमान" : "Temperature"}
            </small>
          </div>
  
          <div>
            <span>💧</span>
            <strong>{weather.humidity}%</strong>
            <small>
              {language === "hi" ? "नमी" : "Humidity"}
            </small>
          </div>
  
          <div>
            <span>🌧️</span>
            <strong>{weather.precipitation} mm</strong>
            <small>
              {language === "hi" ? "वर्षा" : "Precipitation"}
            </small>
          </div>
  
        </div>
  
        <p className="weather-note">
          {language === "hi"
            ? "यह मौसम की जानकारी आपकी Soil Health सलाह को बेहतर बनाने में इस्तेमाल होगी।"
            : "This weather information will be used to improve your Soil Health advice."}
        </p>
  
      </div>
    );
  }
  
  export default SoilWeatherCard;
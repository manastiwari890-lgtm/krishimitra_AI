import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Weather from "./pages/weather";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import SoilFertility from "./pages/SoilFertility";

function Home() {
  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">
        <div className="logo">
          <div className="logo-symbol">🌱</div>

          <div className="logo-name">
            <span>KRISHIMITRA</span>
            <strong>AI</strong>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#home" className="active">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          <Link to="/weather">
            Weather
          </Link>

          <Link to="/crop">
            Crop AI
          </Link>

          <Link to="/disease">
            Disease AI
          </Link>

          {/* NEW SOIL FERTILITY LINK */}
          <Link to="/soil">
            Soil Test
          </Link>

          <a href="#about">
            About Us
          </a>
        </nav>

        <button className="dashboard-btn">
          <span>👤</span>
          Farmer Dashboard
          <span>→</span>
        </button>
      </header>


      {/* ================= HERO ================= */}

      <main id="home" className="hero">

        <div className="hero-overlay"></div>

        <div className="ai-glow ai-glow-one"></div>
        <div className="ai-glow ai-glow-two"></div>


        {/* ================= LEFT CONTENT ================= */}

        <section className="hero-content">

          <div className="ai-label">
            <span className="leaf">🌱</span>

            <span className="pulse"></span>

            AI POWERED AGRICULTURE
          </div>


          <h1>
            <span className="white-heading">
              KrishiMitra
            </span>

            <span className="green-heading">
              AI
            </span>

            <br />

            Smart Farming.
            <br />

            <span className="gradient-heading">
              Better Tomorrow.
            </span>
          </h1>


          <p className="hero-description">
            Your intelligent farming companion that helps you make
            better decisions with real-time weather insights,
            AI-powered crop recommendations, soil fertility analysis
            and intelligent crop disease detection.
          </p>


          <div className="hero-buttons">

            <button className="primary-btn">
              Get Started
              <span>→</span>
            </button>

            <button className="explore-btn">
              Explore Features
              <span className="play">▶</span>
            </button>

          </div>


          {/* ================= STATS ================= */}

          <div className="stats-panel">

            <div className="stat-box">
              <div className="stat-icon">
                👥
              </div>

              <div>
                <strong>10K+</strong>
                <span>Farmers Connected</span>
              </div>
            </div>


            <div className="stat-divider"></div>


            <div className="stat-box">
              <div className="stat-icon">
                🎯
              </div>

              <div>
                <strong>95%</strong>
                <span>AI Model Accuracy</span>
              </div>
            </div>


            <div className="stat-divider"></div>


            <div className="stat-box">
              <div className="stat-icon">
                🎧
              </div>

              <div>
                <strong>24/7</strong>
                <span>AI Assistance</span>
              </div>
            </div>

          </div>

        </section>


        {/* ================= RIGHT DASHBOARD ================= */}

        <aside className="right-dashboard">

          <div className="welcome-card">
            <strong>
              Good Morning, Farmer! 👋
            </strong>

            <span>
              Your smart farm assistant is ready
            </span>
          </div>


          {/* WEATHER */}

          <div
            id="weather"
            className="dashboard-card weather-card"
          >

            <div className="card-title">
              <span>📍</span>
              Lucknow, Uttar Pradesh
            </div>


            <div className="weather-main">

              <div>
                <strong className="temperature">
                  28<span>°C</span>
                </strong>

                <p>Partly Cloudy</p>
              </div>

              <div className="weather-symbol">
                🌤️
              </div>

            </div>


            <div className="weather-info">

              <div>
                <strong>💧 72%</strong>
                <span>Humidity</span>
              </div>

              <div>
                <strong>💨 15 km/h</strong>
                <span>Wind</span>
              </div>

              <div>
                <strong>🌧️ 0 mm</strong>
                <span>Rainfall</span>
              </div>

            </div>

          </div>


          {/* CROP RECOMMENDATION */}

          <div
            id="crop"
            className="dashboard-card crop-card"
          >

            <div className="card-heading">
              <div className="small-icon">
                🌱
              </div>

              AI Crop Recommendation
            </div>


            <div className="crop-content">

              <div className="wheat-icon">
                🌾
              </div>

              <div className="crop-details">

                <span>BEST MATCH</span>

                <div className="percentage">
                  94%
                </div>

                <h3>Wheat</h3>

                <p>
                  Recommended for your soil
                </p>

              </div>

            </div>


            <button className="details-btn">
              View Details
              <span>→</span>
            </button>

          </div>

        </aside>

      </main>


      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="features-section"
      >

        <div className="features-grid">

          {/* WEATHER FEATURE */}

          <article className="feature-card weather-feature">

            <div className="feature-visual">
              🌦️
            </div>

            <div className="feature-content">

              <span className="feature-number">
                01
              </span>

              <h2>
                Smart Weather
              </h2>

              <p>
                Real-time weather updates, 7-day forecasts
                and intelligent weather alerts designed
                specifically for your farm.
              </p>

              <Link to="/weather" className="feature-link">
                Check Weather
                <span>→</span>
              </Link>

            </div>

          </article>


          {/* CROP FEATURE */}

          <article className="feature-card crop-feature">

            <div className="feature-visual">
              🌱
            </div>

            <div className="feature-content">

              <span className="feature-number">
                02
              </span>

              <h2>
                Crop Recommendation
              </h2>

              <p>
                Get intelligent crop suggestions based on
                soil nutrients, pH, moisture, weather and
                environmental conditions.
              </p>

              <Link to="/crop" className="feature-link crop-link">
                Find Best Crop
                <span>→</span>
              </Link>

            </div>

          </article>


          {/* DISEASE FEATURE */}

          <article
            id="disease"
            className="feature-card disease-feature"
          >

            <div className="feature-visual scan-visual">
              🍃
              <div className="scan-line"></div>
            </div>

            <div className="feature-content">

              <span className="feature-number">
                03
              </span>

              <h2>
                Disease Detection
              </h2>

              <p>
                Upload a crop leaf image and let our AI
                identify diseases and provide actionable
                prevention and treatment guidance.
              </p>

              {/* FIXED DISEASE LINK */}

              <Link
                to="/disease"
                className="feature-link crop-link"
              >
                Detect Disease
                <span>→</span>
              </Link>

            </div>

          </article>


          {/* ================= SOIL FERTILITY FEATURE ================= */}

          <article className="feature-card soil-feature">

            <div className="feature-visual">
              🧪
            </div>

            <div className="feature-content">

              <span className="feature-number">
                04
              </span>

              <h2>
                Soil Fertility Test
              </h2>

              <p>
                Analyze nitrogen, phosphorus, potassium,
                soil pH and moisture to understand your
                soil health and receive smart recommendations.
              </p>

              <Link
                to="/soil"
                className="feature-link crop-link"
              >
                Analyze Soil
                <span>→</span>
              </Link>

            </div>

          </article>

        </div>


        {/* ================= BENEFITS ================= */}

        <div className="benefits">

          <div className="benefit">
            <span>✥</span>

            <div>
              <strong>
                Increase Productivity
              </strong>

              <p>
                with AI Insights
              </p>
            </div>
          </div>


          <div className="benefit">
            <span>🛡</span>

            <div>
              <strong>
                Reduce Crop Loss
              </strong>

              <p>
                with Early Detection
              </p>
            </div>
          </div>


          <div className="benefit">
            <span>◉</span>

            <div>
              <strong>
                Save Time & Money
              </strong>

              <p>
                with Smart Decisions
              </p>
            </div>
          </div>


          <div className="benefit">
            <span>♧</span>

            <div>
              <strong>
                Sustainable Farming
              </strong>

              <p>
                for Better Future
              </p>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}


/* ================= ROUTES ================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/weather"
          element={<Weather />}
        />

        <Route
          path="/crop"
          element={<CropRecommendation />}
        />

        <Route
          path="/disease"
          element={<DiseaseDetection />}
        />

        {/* NEW SOIL FERTILITY ROUTE */}

        <Route
          path="/soil"
          element={<SoilFertility />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
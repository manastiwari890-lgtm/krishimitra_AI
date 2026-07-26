import {
    useEffect,
    useState,
  } from "react";
  
  import {
    NavLink,
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import "./PageNavigation.css";
  
  
  // =====================================================
  // KRISHIMITRA AI
  // GLOBAL PAGE NAVIGATION
  // =====================================================
  //
  // Provides consistent navigation across all major
  // KrishiMitra modules.
  //
  // FEATURES:
  //
  // - Smart Back navigation
  // - Dashboard/Home navigation
  // - Major module navigation
  // - Active page highlighting
  // - Responsive mobile menu
  // - Accessible navigation controls
  // - Browser history support
  //
  // =====================================================
  
  
  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================
  
  const navigationItems = [
    {
      id: "weather",
      label: "Weather",
      icon: "🌦️",
      path: "/weather",
    },
  
    {
      id: "crop",
      label: "Crop AI",
      icon: "🌱",
      path: "/crop",
    },
  
    {
      id: "disease",
      label: "Disease AI",
      icon: "🔬",
      path: "/disease",
    },
  
    {
      id: "soil",
      label: "Soil Test",
      icon: "🧪",
      path: "/soil",
    },
  
    {
      id: "farm",
      label: "3D Farm",
      icon: "🌾",
      path: "/farm",
    },
  ];
  
  
  // =====================================================
  // PAGE NAVIGATION COMPONENT
  // =====================================================
  
  export default function PageNavigation() {
  
    const navigate =
      useNavigate();
  
    const location =
      useLocation();
  
  
    // ===================================================
    // MOBILE MENU STATE
    // ===================================================
  
    const [
      mobileMenuOpen,
      setMobileMenuOpen,
    ] =
      useState(false);
  
  
    // ===================================================
    // CLOSE MOBILE MENU WHEN ROUTE CHANGES
    // ===================================================
  
    useEffect(() => {
  
      setMobileMenuOpen(
        false
      );
  
    }, [
      location.pathname,
    ]);
  
  
    // ===================================================
    // SMART BACK NAVIGATION
    // ===================================================
  
    const handleBack =
      () => {
  
        // If the user arrived here through another
        // KrishiMitra page, use browser history.
        //
        // If the page was opened directly in a new tab,
        // send the user safely to the dashboard.
  
        if (
          window.history.length >
          1
        ) {
  
          navigate(
            -1
          );
  
        } else {
  
          navigate(
            "/"
          );
        }
      };
  
  
    // ===================================================
    // DASHBOARD
    // ===================================================
  
    const goToDashboard =
      () => {
  
        navigate(
          "/"
        );
      };
  
  
    // ===================================================
    // MOBILE MENU
    // ===================================================
  
    const toggleMobileMenu =
      () => {
  
        setMobileMenuOpen(
          (currentState) =>
            !currentState
        );
      };
  
  
    // ===================================================
    // RENDER
    // ===================================================
  
    return (
  
      <header
        className="page-navigation"
      >
  
        <div
          className="page-navigation-inner"
        >
  
          {/* =============================================
              LEFT SIDE
          ============================================= */}
  
          <div
            className="page-navigation-left"
          >
  
            {/* ===========================================
                BACK
            =========================================== */}
  
            <button
              type="button"
  
              className="page-navigation-back"
  
              onClick={
                handleBack
              }
  
              aria-label="Go back"
            >
  
              <span
                className="page-navigation-back-arrow"
                aria-hidden="true"
              >
                ←
              </span>
  
              <span
                className="page-navigation-back-text"
              >
                Back
              </span>
  
            </button>
  
  
            {/* ===========================================
                BRAND
            =========================================== */}
  
            <button
              type="button"
  
              className="page-navigation-brand"
  
              onClick={
                goToDashboard
              }
  
              aria-label="Go to KrishiMitra dashboard"
            >
  
              <span
                className="page-navigation-brand-icon"
                aria-hidden="true"
              >
                🌱
              </span>
  
              <span
                className="page-navigation-brand-content"
              >
  
                <strong>
                  KrishiMitra
                </strong>
  
                <small>
                  AI
                </small>
  
              </span>
  
            </button>
  
          </div>
  
  
          {/* =============================================
              DESKTOP NAVIGATION
          ============================================= */}
  
          <nav
            className="page-navigation-links"
            aria-label="KrishiMitra modules"
          >
  
            {navigationItems.map(
              (item) => (
  
                <NavLink
  
                  key={
                    item.id
                  }
  
                  to={
                    item.path
                  }
  
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "page-navigation-link page-navigation-link-active"
                      : "page-navigation-link"
                  }
  
                >
  
                  <span
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
  
                  <span>
                    {item.label}
                  </span>
  
                </NavLink>
  
              )
            )}
  
          </nav>
  
  
          {/* =============================================
              RIGHT SIDE
          ============================================= */}
  
          <div
            className="page-navigation-actions"
          >
  
            {/* ===========================================
                DASHBOARD
            =========================================== */}
  
            <button
              type="button"
  
              className="page-navigation-home"
  
              onClick={
                goToDashboard
              }
            >
  
              <span
                aria-hidden="true"
              >
                🏠
              </span>
  
              <span
                className="page-navigation-home-text"
              >
                Dashboard
              </span>
  
            </button>
  
  
            {/* ===========================================
                MOBILE MENU BUTTON
            =========================================== */}
  
            <button
              type="button"
  
              className={
                mobileMenuOpen
                  ? "page-navigation-menu-button page-navigation-menu-button-open"
                  : "page-navigation-menu-button"
              }
  
              onClick={
                toggleMobileMenu
              }
  
              aria-expanded={
                mobileMenuOpen
              }
  
              aria-controls="krishimitra-mobile-navigation"
  
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
            >
  
              <span />
  
              <span />
  
              <span />
  
            </button>
  
          </div>
  
        </div>
  
  
        {/* ===============================================
            MOBILE NAVIGATION
        =============================================== */}
  
        <div
  
          id="krishimitra-mobile-navigation"
  
          className={
            mobileMenuOpen
              ? "page-navigation-mobile page-navigation-mobile-open"
              : "page-navigation-mobile"
          }
  
        >
  
          <nav
            className="page-navigation-mobile-links"
            aria-label="Mobile KrishiMitra modules"
          >
  
            <NavLink
  
              to="/"
  
              end
  
              className={({
                isActive,
              }) =>
                isActive
                  ? "page-navigation-mobile-link page-navigation-mobile-link-active"
                  : "page-navigation-mobile-link"
              }
  
            >
  
              <span>
                🏠
              </span>
  
              <span>
                Dashboard
              </span>
  
            </NavLink>
  
  
            {navigationItems.map(
              (item) => (
  
                <NavLink
  
                  key={
                    item.id
                  }
  
                  to={
                    item.path
                  }
  
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "page-navigation-mobile-link page-navigation-mobile-link-active"
                      : "page-navigation-mobile-link"
                  }
  
                >
  
                  <span>
                    {item.icon}
                  </span>
  
                  <span>
                    {item.label}
                  </span>
  
                </NavLink>
  
              )
            )}
  
          </nav>
  
        </div>
  
      </header>
    );
  }
import { useEffect, useState } from "react";

import { useFarmState } from "../../farm/hooks/useFarmState";

// =====================================================
// KRISHIMITRA AI
// SMART IRRIGATION
// =====================================================
//
// IMPORTANT:
//
// Smart Irrigation now uses the REAL moisture values
// from FarmState.
//
// There is NO separate/local moisture simulation.
//
// Therefore:
//
// 🌧 Rain
//      ↓
// SoilSimulation
//      ↓
// FarmState.plots[].moisture
//      ↓
// Smart Irrigation
//
// 💧 Manual irrigation
//      ↓
// FarmController
//      ↓
// FarmState.plots[].moisture
//
// This keeps the Digital Twin synchronized.
// =====================================================

const PLOTS = ["A", "B", "C", "D"];

// =====================================================
// STATUS
// =====================================================

function getStatus(value) {
  if (value >= 70) {
    return {
      label: "Healthy",
      icon: "🟢",
      color: "#4ade80",
      text: "Good",
    };
  }

  if (value >= 40) {
    return {
      label: "Moderate",
      icon: "🟡",
      color: "#facc15",
      text: "Monitor",
    };
  }

  return {
    label: "Needs irrigation",
    icon: "🔴",
    color: "#f87171",
    text: "Irrigation needed",
  };
}

// =====================================================
// COMPONENT
// =====================================================

export default function SmartIrrigation() {

  // ===================================================
  // FARM STATE
  // ===================================================

  const {
    farmState,
    controller,
  } = useFarmState();

  // ===================================================
  // MOBILE
  // ===================================================

  const [isMobile, setIsMobile] =
    useState(false);

  // ===================================================
  // PANEL VISIBILITY
  // ===================================================

  const [isOpen, setIsOpen] =
    useState(true);

  // ===================================================
  // CURRENT IRRIGATION
  // ===================================================

  const [irrigatingPlot, setIrrigatingPlot] =
    useState(null);

  // ===================================================
  // MOBILE DETECTION
  // ===================================================

  useEffect(() => {

    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 600
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };

  }, []);

  // ===================================================
  // GET REAL MOISTURE
  // ===================================================
  //
  // IMPORTANT:
  //
  // These values come directly from FarmState.
  //
  // No duplicated useState.
  // No random moisture loss.
  //
  // Rain and irrigation therefore affect these
  // exact same values.
  // ===================================================

  const moisture = {
    A:
      farmState.plots.find(
        (plot) => plot.id === "A"
      )?.moisture ?? 0,

    B:
      farmState.plots.find(
        (plot) => plot.id === "B"
      )?.moisture ?? 0,

    C:
      farmState.plots.find(
        (plot) => plot.id === "C"
      )?.moisture ?? 0,

    D:
      farmState.plots.find(
        (plot) => plot.id === "D"
      )?.moisture ?? 0,
  };

  // ===================================================
  // DRY PLOTS
  // ===================================================

  const dryPlots = PLOTS.filter(
    (plot) =>
      moisture[plot] < 40
  );

  // ===================================================
  // MANUAL IRRIGATION
  // ===================================================

  useEffect(() => {

    if (!irrigatingPlot) {
      return;
    }

    const timer = setInterval(() => {

      const currentPlot =
        farmState.plots.find(
          (plot) =>
            plot.id === irrigatingPlot
        );

      if (!currentPlot) {
        setIrrigatingPlot(null);
        return;
      }

      const currentMoisture =
        Number(currentPlot.moisture) || 0;

      const nextValue =
        Math.min(
          100,
          currentMoisture + 5
        );

      // =============================================
      // UPDATE REAL FARM STATE
      // =============================================

      controller.updatePlotMoisture(
        irrigatingPlot,
        nextValue
      );

      // =============================================
      // STOP AUTOMATICALLY AT HEALTHY LEVEL
      // =============================================

      if (nextValue >= 70) {
        setIrrigatingPlot(null);
      }

    }, 900);

    return () => {
      clearInterval(timer);
    };

  }, [
    irrigatingPlot,
    farmState.plots,
    controller,
  ]);

  // ===================================================
  // START IRRIGATION
  // ===================================================

  const startIrrigation = (plot) => {

    setIrrigatingPlot(plot);

  };

  // ===================================================
  // STOP IRRIGATION
  // ===================================================

  const stopIrrigation = () => {

    setIrrigatingPlot(null);

  };

  // ===================================================
  // TOGGLE BUTTON
  // ===================================================

  const ToggleButton = () => (

    <button
      type="button"
      onClick={() =>
        setIsOpen(
          (current) => !current
        )
      }
      aria-label={
        isOpen
          ? "Hide smart irrigation"
          : "Show smart irrigation"
      }
      style={{

        position: "absolute",

        left:
          isMobile
            ? "10px"
            : "18px",

        top:
          isMobile
            ? "10px"
            : "18px",

        zIndex: 30,

        width:
          isMobile
            ? "42px"
            : "46px",

        height:
          isMobile
            ? "42px"
            : "46px",

        border:
          "1px solid rgba(255,255,255,0.16)",

        borderRadius:
          "13px",

        background:
          "rgba(7, 26, 18, 0.88)",

        backdropFilter:
          "blur(12px)",

        color:
          "#ffffff",

        fontSize:
          isMobile
            ? "18px"
            : "20px",

        cursor:
          "pointer",

        boxShadow:
          "0 8px 25px rgba(0,0,0,0.25)",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          0,

      }}
    >
      {isOpen ? "✕" : "🌱"}
    </button>
  );

  // ===================================================
  // CLOSED
  // ===================================================

  if (!isOpen) {

    return (
      <ToggleButton />
    );

  }

  // ===================================================
  // MOBILE
  // ===================================================

  if (isMobile) {

    return (
      <>
        <ToggleButton />

        <div
          style={{

            position:
              "absolute",

            left:
              "58px",

            right:
              "10px",

            top:
              "10px",

            zIndex:
              20,

            padding:
              "10px",

            borderRadius:
              "15px",

            background:
              "rgba(7, 26, 18, 0.88)",

            backdropFilter:
              "blur(12px)",

            border:
              "1px solid rgba(255,255,255,0.12)",

            color:
              "#ffffff",

            boxShadow:
              "0 8px 25px rgba(0,0,0,0.25)",

            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

            maxHeight:
              "42vh",

            overflowY:
              "auto",

          }}
        >

          {/* HEADER */}

          <div
            style={{

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              marginBottom:
                "8px",

            }}
          >

            <div>

              <div
                style={{
                  fontSize:
                    "13px",

                  fontWeight:
                    800,
                }}
              >
                🌱 Smart Irrigation
              </div>

              <div
                style={{

                  fontSize:
                    "9px",

                  opacity:
                    0.65,

                  marginTop:
                    "2px",

                }}
              >
                Soil moisture monitoring
              </div>

            </div>

            <div
              style={{

                fontSize:
                  "9px",

                padding:
                  "4px 7px",

                borderRadius:
                  "7px",

                background:
                  "rgba(255,255,255,0.08)",

              }}
            >

              {farmState.weather.isRaining
                ? "🌧 Raining"
                : dryPlots.length > 0
                  ? `${dryPlots.length} dry`
                  : "All good"}

            </div>

          </div>

          {/* PLOTS */}

          <div
            style={{

              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                "7px",

            }}
          >

            {PLOTS.map((plot) => {

              const value =
                moisture[plot];

              const status =
                getStatus(value);

              const isIrrigating =
                irrigatingPlot === plot;

              return (

                <div
                  key={plot}
                  style={{

                    padding:
                      "8px",

                    borderRadius:
                      "10px",

                    background:
                      "rgba(255,255,255,0.07)",

                    minWidth:
                      0,

                  }}
                >

                  <div
                    style={{

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap:
                        "4px",

                    }}
                  >

                    <strong
                      style={{
                        fontSize:
                          "11px",
                      }}
                    >
                      Plot {plot}
                    </strong>

                    <span
                      style={{

                        fontSize:
                          "8px",

                        color:
                          status.color,

                        whiteSpace:
                          "nowrap",

                      }}
                    >
                      {status.icon}{" "}
                      {status.text}
                    </span>

                  </div>

                  {/* MOISTURE */}

                  <div
                    style={{

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      marginTop:
                        "6px",

                    }}
                  >

                    <span
                      style={{

                        fontSize:
                          "13px",

                        fontWeight:
                          800,

                      }}
                    >
                      {Math.round(value)}%
                    </span>

                    {value < 40 &&
                      !isIrrigating && (

                        <button
                          type="button"
                          onClick={() =>
                            startIrrigation(
                              plot
                            )
                          }
                          style={{

                            border:
                              0,

                            borderRadius:
                              "6px",

                            padding:
                              "4px 6px",

                            background:
                              "#2563eb",

                            color:
                              "#ffffff",

                            fontSize:
                              "8px",

                            fontWeight:
                              700,

                            cursor:
                              "pointer",

                          }}
                        >
                          💧
                        </button>

                      )}

                    {isIrrigating && (

                      <button
                        type="button"
                        onClick={
                          stopIrrigation
                        }
                        style={{

                          border:
                            0,

                          borderRadius:
                            "6px",

                          padding:
                            "4px 7px",

                          background:
                            "#dc2626",

                          color:
                            "#ffffff",

                          fontSize:
                            "8px",

                          fontWeight:
                            700,

                          cursor:
                            "pointer",

                        }}
                      >
                        Stop
                      </button>

                    )}

                  </div>

                  {/* PROGRESS */}

                  <div
                    style={{

                      marginTop:
                        "5px",

                      height:
                        "4px",

                      borderRadius:
                        "99px",

                      background:
                        "rgba(255,255,255,0.12)",

                      overflow:
                        "hidden",

                    }}
                  >

                    <div
                      style={{

                        width:
                          `${value}%`,

                        height:
                          "100%",

                        borderRadius:
                          "99px",

                        background:
                          status.color,

                        transition:
                          "width 0.5s ease",

                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

          {/* RECOMMENDATION */}

          <div
            style={{

              marginTop:
                "7px",

              padding:
                "7px 8px",

              borderRadius:
                "8px",

              background:
                dryPlots.length > 0
                  ? "rgba(127,29,29,0.35)"
                  : "rgba(21,128,61,0.28)",

              fontSize:
                "9px",

              lineHeight:
                1.3,

            }}
          >

            {farmState.weather.isRaining
              ? "🌧 Rain is increasing soil moisture."
              : dryPlots.length > 0
                ? `⚠️ Plot ${dryPlots.join(
                    ", "
                  )} needs irrigation.`
                : "✅ All plots have sufficient moisture."}

          </div>

        </div>
      </>
    );
  }

  // ===================================================
  // DESKTOP
  // ===================================================

  return (
    <>
      <ToggleButton />

      <div
        style={{

          position:
            "absolute",

          left:
            "18px",

          top:
            "18px",

          zIndex:
            20,

          width:
            "270px",

          padding:
            "14px",

          paddingTop:
            "66px",

          borderRadius:
            "18px",

          background:
            "rgba(7, 26, 18, 0.82)",

          backdropFilter:
            "blur(14px)",

          border:
            "1px solid rgba(255,255,255,0.12)",

          color:
            "#ffffff",

          boxShadow:
            "0 12px 35px rgba(0,0,0,0.22)",

          fontFamily:
            "system-ui, sans-serif",

        }}
      >

        {/* HEADER */}

        <div
          style={{

            fontSize:
              "14px",

            fontWeight:
              800,

            marginBottom:
              "4px",

          }}
        >
          🌱 KrishiMitra Smart Irrigation
        </div>

        <div
          style={{

            fontSize:
              "11px",

            opacity:
              0.7,

            marginBottom:
              "12px",

          }}
        >
          Soil moisture monitoring
        </div>

        {/* PLOTS */}

        {PLOTS.map((plot) => {

          const value =
            moisture[plot];

          const status =
            getStatus(value);

          const isIrrigating =
            irrigatingPlot === plot;

          return (

            <div
              key={plot}
              style={{

                padding:
                  "9px 10px",

                marginBottom:
                  "7px",

                borderRadius:
                  "12px",

                background:
                  "rgba(255,255,255,0.07)",

              }}
            >

              <div
                style={{

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                }}
              >

                <strong>
                  Plot {plot}
                </strong>

                <span
                  style={{

                    fontSize:
                      "11px",

                    opacity:
                      0.9,

                    color:
                      status.color,

                  }}
                >
                  {status.icon}{" "}
                  {status.label}
                </span>

              </div>

              {/* BAR */}

              <div
                style={{

                  marginTop:
                    "7px",

                  height:
                    "6px",

                  borderRadius:
                    "99px",

                  background:
                    "rgba(255,255,255,0.12)",

                  overflow:
                    "hidden",

                }}
              >

                <div
                  style={{

                    width:
                      `${value}%`,

                    height:
                      "100%",

                    borderRadius:
                      "99px",

                    background:
                      status.color,

                    transition:
                      "width 0.5s ease",

                  }}
                />

              </div>

              {/* VALUE + BUTTON */}

              <div
                style={{

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  marginTop:
                    "7px",

                }}
              >

                <span
                  style={{
                    fontSize:
                      "12px",
                  }}
                >
                  {Math.round(value)}%
                </span>

                {value < 40 &&
                  !isIrrigating && (

                    <button
                      type="button"
                      onClick={() =>
                        startIrrigation(
                          plot
                        )
                      }
                      style={{

                        border:
                          0,

                        borderRadius:
                          "8px",

                        padding:
                          "5px 8px",

                        background:
                          "#2563eb",

                        color:
                          "#ffffff",

                        fontSize:
                          "10px",

                        fontWeight:
                          700,

                        cursor:
                          "pointer",

                      }}
                    >
                      💧 Irrigate
                    </button>

                  )}

                {isIrrigating && (

                  <button
                    type="button"
                    onClick={
                      stopIrrigation
                    }
                    style={{

                      border:
                        0,

                      borderRadius:
                        "8px",

                      padding:
                        "5px 8px",

                      background:
                        "#dc2626",

                      color:
                        "#ffffff",

                      fontSize:
                        "10px",

                      fontWeight:
                        700,

                      cursor:
                        "pointer",

                    }}
                  >
                    Stop
                  </button>

                )}

              </div>

            </div>

          );

        })}

        {/* RECOMMENDATION */}

        <div
          style={{

            marginTop:
              "9px",

            padding:
              "9px 10px",

            borderRadius:
              "11px",

            background:
              farmState.weather.isRaining
                ? "rgba(30,64,175,0.35)"
                : dryPlots.length > 0
                  ? "rgba(127,29,29,0.35)"
                  : "rgba(21,128,61,0.28)",

            fontSize:
              "11px",

            lineHeight:
              1.4,

          }}
        >

          {farmState.weather.isRaining
            ? "🌧 Rain is increasing soil moisture."
            : dryPlots.length > 0
              ? `⚠️ Recommendation: Plot ${dryPlots.join(
                  ", "
                )} needs irrigation.`
              : "✅ All plots have sufficient moisture."}

        </div>

      </div>
    </>
  );
}
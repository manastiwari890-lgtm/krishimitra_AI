import { useEffect, useState } from "react";

// =====================================================
// KRISHIMITRA AI
// SMART IRRIGATION - RESPONSIVE VERSION
// =====================================================
//
// Mobile optimized:
// - Compact dashboard
// - 2-column plot layout
// - Smaller spacing
// - Same irrigation logic
// - Does not modify 3D farm geometry
// =====================================================

const INITIAL_MOISTURE = {
  A: 72,
  B: 48,
  C: 24,
  D: 61,
};

const PLOTS = ["A", "B", "C", "D"];

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

export default function SmartIrrigation() {
  const [moisture, setMoisture] = useState(INITIAL_MOISTURE);
  const [irrigatingPlot, setIrrigatingPlot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // ---------------------------------------------------
  // Detect mobile screen
  // ---------------------------------------------------

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // ---------------------------------------------------
  // Natural moisture loss
  // ---------------------------------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setMoisture((current) => {
        const next = { ...current };

        PLOTS.forEach((plot) => {
          const loss = Math.random() < 0.45 ? 1 : 0;

          next[plot] = Math.max(0, next[plot] - loss);
        });

        return next;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------
  // Irrigation simulation
  // ---------------------------------------------------

  useEffect(() => {
    if (!irrigatingPlot) return;

    const timer = setInterval(() => {
      setMoisture((current) => {
        const nextValue = Math.min(
          100,
          current[irrigatingPlot] + 5
        );

        if (nextValue >= 70) {
          setIrrigatingPlot(null);
        }

        return {
          ...current,
          [irrigatingPlot]: nextValue,
        };
      });
    }, 900);

    return () => clearInterval(timer);
  }, [irrigatingPlot]);

  // ---------------------------------------------------
  // Actions
  // ---------------------------------------------------

  const startIrrigation = (plot) => {
    setIrrigatingPlot(plot);
  };

  const stopIrrigation = () => {
    setIrrigatingPlot(null);
  };

  const dryPlots = PLOTS.filter(
    (plot) => moisture[plot] < 40
  );

  // ===================================================
  // MOBILE UI
  // ===================================================

  if (isMobile) {
    return (
      <div
        style={{
          position: "absolute",
          left: "10px",
          right: "10px",
          top: "10px",
          zIndex: 20,

          padding: "10px",

          borderRadius: "15px",

          background: "rgba(7, 26, 18, 0.88)",
          backdropFilter: "blur(12px)",

          border: "1px solid rgba(255,255,255,0.12)",

          color: "#fff",

          boxShadow:
            "0 8px 25px rgba(0,0,0,0.25)",

          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

          maxHeight: "42vh",
          overflowY: "auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            marginBottom: "8px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              🌱 Smart Irrigation
            </div>

            <div
              style={{
                fontSize: "9px",
                opacity: 0.65,
                marginTop: "2px",
              }}
            >
              Soil moisture
            </div>
          </div>

          <div
            style={{
              fontSize: "9px",
              padding: "4px 7px",
              borderRadius: "7px",
              background:
                "rgba(255,255,255,0.08)",
            }}
          >
            {dryPlots.length > 0
              ? `${dryPlots.length} dry`
              : "All good"}
          </div>
        </div>

        {/* PLOTS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7px",
          }}
        >
          {PLOTS.map((plot) => {
            const value = moisture[plot];

            const status = getStatus(value);

            const isIrrigating =
              irrigatingPlot === plot;

            return (
              <div
                key={plot}
                style={{
                  padding: "8px",

                  borderRadius: "10px",

                  background:
                    "rgba(255,255,255,0.07)",

                  minWidth: 0,
                }}
              >
                {/* Plot title */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",

                    gap: "4px",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "11px",
                    }}
                  >
                    Plot {plot}
                  </strong>

                  <span
                    style={{
                      fontSize: "8px",
                      color: status.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status.icon} {status.text}
                  </span>
                </div>

                {/* Moisture */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",

                    marginTop: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {value}%
                  </span>

                  {/* Button */}

                  {value < 40 &&
                    !isIrrigating && (
                      <button
                        type="button"
                        onClick={() =>
                          startIrrigation(plot)
                        }
                        style={{
                          border: 0,
                          borderRadius: "6px",

                          padding:
                            "4px 6px",

                          background:
                            "#2563eb",

                          color: "#fff",

                          fontSize: "8px",

                          fontWeight: 700,

                          cursor: "pointer",
                        }}
                      >
                        💧
                      </button>
                    )}

                  {isIrrigating && (
                    <button
                      type="button"
                      onClick={stopIrrigation}
                      style={{
                        border: 0,
                        borderRadius: "6px",

                        padding:
                          "4px 7px",

                        background:
                          "#dc2626",

                        color: "#fff",

                        fontSize: "8px",

                        fontWeight: 700,

                        cursor: "pointer",
                      }}
                    >
                      Stop
                    </button>
                  )}
                </div>

                {/* Progress */}

                <div
                  style={{
                    marginTop: "5px",

                    height: "4px",

                    borderRadius: "99px",

                    background:
                      "rgba(255,255,255,0.12)",

                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${value}%`,

                      height: "100%",

                      borderRadius: "99px",

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
            marginTop: "7px",

            padding: "7px 8px",

            borderRadius: "8px",

            background:
              dryPlots.length > 0
                ? "rgba(127,29,29,0.35)"
                : "rgba(21,128,61,0.28)",

            fontSize: "9px",

            lineHeight: 1.3,
          }}
        >
          {dryPlots.length > 0
            ? `⚠️ Plot ${dryPlots.join(
                ", "
              )} needs irrigation`
            : "✅ All plots have sufficient moisture"}
        </div>
      </div>
    );
  }

  // ===================================================
  // DESKTOP UI
  // ===================================================

  return (
    <div
      style={{
        position: "absolute",
        left: "18px",
        top: "18px",

        zIndex: 20,

        width: "270px",

        padding: "14px",

        borderRadius: "18px",

        background:
          "rgba(7, 26, 18, 0.82)",

        backdropFilter: "blur(14px)",

        border:
          "1px solid rgba(255,255,255,0.12)",

        color: "#fff",

        boxShadow:
          "0 12px 35px rgba(0,0,0,0.22)",

        fontFamily:
          "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 800,
          marginBottom: "4px",
        }}
      >
        🌱 KrishiMitra Smart Irrigation
      </div>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "12px",
        }}
      >
        Soil moisture monitoring
      </div>

      {PLOTS.map((plot) => {
        const value = moisture[plot];

        const status = getStatus(value);

        const isIrrigating =
          irrigatingPlot === plot;

        return (
          <div
            key={plot}
            style={{
              padding: "9px 10px",
              marginBottom: "7px",

              borderRadius: "12px",

              background:
                "rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",

                alignItems: "center",
              }}
            >
              <strong>
                Plot {plot}
              </strong>

              <span
                style={{
                  fontSize: "11px",
                  opacity: 0.9,
                }}
              >
                {status.icon}{" "}
                {status.label}
              </span>
            </div>

            <div
              style={{
                marginTop: "7px",

                height: "6px",

                borderRadius: "99px",

                background:
                  "rgba(255,255,255,0.12)",

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${value}%`,

                  height: "100%",

                  borderRadius: "99px",

                  background:
                    status.color,

                  transition:
                    "width 0.5s ease",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",

                marginTop: "7px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                }}
              >
                {value}%
              </span>

              {value < 40 &&
                !isIrrigating && (
                  <button
                    type="button"
                    onClick={() =>
                      startIrrigation(plot)
                    }
                    style={{
                      border: 0,
                      borderRadius: "8px",

                      padding:
                        "5px 8px",

                      background:
                        "#2563eb",

                      color: "#fff",

                      fontSize: "10px",

                      fontWeight: 700,

                      cursor: "pointer",
                    }}
                  >
                    💧 Irrigate
                  </button>
                )}

              {isIrrigating && (
                <button
                  type="button"
                  onClick={stopIrrigation}
                  style={{
                    border: 0,
                    borderRadius: "8px",

                    padding:
                      "5px 8px",

                    background:
                      "#dc2626",

                    color: "#fff",

                    fontSize: "10px",

                    fontWeight: 700,

                    cursor: "pointer",
                  }}
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div
        style={{
          marginTop: "9px",

          padding: "9px 10px",

          borderRadius: "11px",

          background:
            dryPlots.length > 0
              ? "rgba(127,29,29,0.35)"
              : "rgba(21,128,61,0.28)",

          fontSize: "11px",

          lineHeight: 1.4,
        }}
      >
        {dryPlots.length > 0
          ? `⚠️ Recommendation: Plot ${dryPlots.join(
              ", "
            )} needs irrigation.`
          : "✅ All plots have sufficient moisture."}
      </div>
    </div>
  );
}
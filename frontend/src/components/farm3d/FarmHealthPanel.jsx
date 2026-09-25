import { useMemo, useState } from "react";

import { useFarmState } from "../../farm/hooks/useFarmState";
import { FarmHealthEngine } from "../../farm/engine/FarmHealthEngine";

// =====================================================
// KRISHIMITRA AI
// FARM HEALTH + CROP PERFORMANCE PANEL
// =====================================================

function getStatusStyle(status) {
  switch (status) {
    case "Healthy":
    case "Excellent":
      return {
        icon: "🟢",
        background: "rgba(21,128,61,0.28)",
      };

    case "Good":
      return {
        icon: "🟢",
        background: "rgba(22,101,52,0.25)",
      };

    case "Moderate":
      return {
        icon: "🟡",
        background: "rgba(161,98,7,0.30)",
      };

    case "Warning":
    case "Low":
      return {
        icon: "🟠",
        background: "rgba(194,65,12,0.30)",
      };

    case "Critical":
    case "Very Low":
      return {
        icon: "🔴",
        background: "rgba(127,29,29,0.35)",
      };

    default:
      return {
        icon: "⚪",
        background: "rgba(255,255,255,0.08)",
      };
  }
}

function getPerformanceBarColor(score) {
  if (score >= 85) return "#4ade80";
  if (score >= 70) return "#a3e635";
  if (score >= 50) return "#facc15";
  if (score >= 30) return "#fb923c";

  return "#f87171";
}

function getFactorIcon(key) {
  switch (key) {
    case "moisture":
      return "💧";

    case "cropHealth":
      return "🌱";

    case "disease":
      return "🦠";

    case "weather":
      return "🌤️";

    default:
      return "⚠️";
  }
}

export default function FarmHealthPanel() {
  const { farmState } = useFarmState();

  const [isHidden, setIsHidden] = useState(false);

  const farmHealth = useMemo(
    () =>
      FarmHealthEngine.calculateFarmHealth(
        farmState
      ),
    [farmState]
  );

  const farmStatus = getStatusStyle(
    farmHealth.status
  );

  const performance =
    farmHealth.performance ?? null;

  const performanceStatus =
    performance
      ? getStatusStyle(performance.status)
      : null;

  // ===================================================
  // HIDDEN STATE
  // ===================================================

  if (isHidden) {
    return (
      <button
        type="button"
        onClick={() => setIsHidden(false)}
        aria-label="Show AI Farm Intelligence"
        style={{
          position: "absolute",

          right: "18px",
          bottom: "18px",

          zIndex: 100,

          border:
            "1px solid rgba(255,255,255,0.18)",

          background:
            "rgba(7, 26, 18, 0.92)",

          color: "#ffffff",

          padding: "10px 14px",

          borderRadius: "12px",

          cursor: "pointer",

          fontSize: "12px",
          fontWeight: "700",

          boxShadow:
            "0 8px 24px rgba(0,0,0,0.28)",

          backdropFilter: "blur(12px)",

          WebkitBackdropFilter: "blur(12px)",

          pointerEvents: "auto",

          touchAction: "manipulation",
        }}
      >
        🌱 AI Intelligence
      </button>
    );
  }

  // ===================================================
  // FULL PANEL
  // ===================================================

  return (
    <div
      style={{
        position: "absolute",

        right: "18px",
        bottom: "18px",

        zIndex: 90,

        width: "290px",

        maxWidth:
          "calc(100% - 36px)",

        maxHeight:
          "calc(100% - 36px)",

        boxSizing: "border-box",

        padding: "14px",

        borderRadius: "18px",

        background:
          "rgba(7, 26, 18, 0.90)",

        backdropFilter: "blur(14px)",

        WebkitBackdropFilter:
          "blur(14px)",

        border:
          "1px solid rgba(255,255,255,0.12)",

        color: "#ffffff",

        boxShadow:
          "0 12px 35px rgba(0,0,0,0.28)",

        fontFamily:
          "system-ui, sans-serif",

        overflowY: "auto",

        pointerEvents: "auto",

        touchAction: "pan-y",

        isolation: "isolate",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: "8px",

          marginBottom: "4px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,

            whiteSpace: "nowrap",

            overflow: "hidden",

            textOverflow: "ellipsis",
          }}
        >
          🌱 AI Farm Intelligence
        </div>

        {/* =================================================
            HIDE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsHidden(true);
          }}
          aria-label="Hide AI Farm Intelligence panel"
          title="Hide panel"
          style={{
            position: "relative",

            zIndex: 200,

            flexShrink: 0,

            width: "30px",
            height: "30px",

            padding: 0,

            border:
              "1px solid rgba(255,255,255,0.16)",

            borderRadius: "9px",

            background:
              "rgba(255,255,255,0.10)",

            color: "#ffffff",

            cursor: "pointer",

            display: "flex",

            alignItems: "center",
            justifyContent: "center",

            fontSize: "18px",
            fontWeight: "700",

            lineHeight: 1,

            pointerEvents: "auto",

            touchAction: "manipulation",

            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          fontSize: "11px",

          opacity: 0.7,

          marginBottom: "12px",
        }}
      >
        Digital Twin health & performance analysis
      </div>

      {/* =================================================
          OVERALL HEALTH
      ================================================= */}

      <div
        style={{
          padding: "11px",

          borderRadius: "13px",

          background:
            farmStatus.background,

          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            gap: "8px",
          }}
        >
          <strong>
            Overall Health
          </strong>

          <span
            style={{
              fontSize: "12px",

              fontWeight: 700,

              whiteSpace: "nowrap",
            }}
          >
            {farmStatus.icon}{" "}
            {farmHealth.status}
          </span>
        </div>

        <div
          style={{
            display: "flex",

            alignItems: "baseline",

            gap: "4px",

            marginTop: "6px",
          }}
        >
          <span
            style={{
              fontSize: "28px",

              fontWeight: 800,
            }}
          >
            {farmHealth.score}
          </span>

          <span
            style={{
              fontSize: "11px",

              opacity: 0.65,
            }}
          >
            / 100
          </span>
        </div>

        {/* SCORE BAR */}

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
              width:
                `${farmHealth.score}%`,

              height: "100%",

              borderRadius: "99px",

              background:
                farmHealth.score >= 80
                  ? "#4ade80"
                  : farmHealth.score >= 60
                    ? "#facc15"
                    : farmHealth.score >= 40
                      ? "#fb923c"
                      : "#f87171",

              transition:
                "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* =================================================
          CROP PERFORMANCE
      ================================================= */}

      {performance && (
        <div
          style={{
            padding: "11px",

            borderRadius: "13px",

            background:
              "rgba(255,255,255,0.07)",

            border:
              "1px solid rgba(255,255,255,0.08)",

            marginBottom: "10px",
          }}
        >

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems: "center",

              gap: "8px",
            }}
          >
            <strong>
              📈 Crop Performance
            </strong>

            <span
              style={{
                fontSize: "11px",

                whiteSpace: "nowrap",
              }}
            >
              {performanceStatus.icon}{" "}
              {performance.status}
            </span>
          </div>

          <div
            style={{
              display: "flex",

              alignItems: "baseline",

              gap: "4px",

              marginTop: "7px",
            }}
          >
            <span
              style={{
                fontSize: "25px",

                fontWeight: 800,
              }}
            >
              {performance.score}
            </span>

            <span
              style={{
                fontSize: "11px",

                opacity: 0.65,
              }}
            >
              / 100
            </span>
          </div>

          {/* PERFORMANCE BAR */}

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
                width:
                  `${performance.score}%`,

                height: "100%",

                borderRadius: "99px",

                background:
                  getPerformanceBarColor(
                    performance.score
                  ),

                transition:
                  "width 0.5s ease",
              }}
            />
          </div>

          {/* YIELD POTENTIAL */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems: "center",

              marginTop: "9px",

              fontSize: "11px",
            }}
          >
            <span
              style={{
                opacity: 0.7,
              }}
            >
              🌾 Yield potential
            </span>

            <strong>
              {performance.yieldPotential}
            </strong>
          </div>

          {/* LIMITING FACTOR */}

          {performance.limitingFactor && (
            <div
              style={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",

                gap: "8px",

                marginTop: "6px",

                fontSize: "11px",
              }}
            >
              <span
                style={{
                  opacity: 0.7,
                }}
              >
                {getFactorIcon(
                  performance.limitingFactor.key
                )} Main factor
              </span>

              <strong
                style={{
                  textAlign: "right",
                }}
              >
                {performance.limitingFactor.label}
              </strong>
            </div>
          )}

          {/* AI PERFORMANCE INSIGHT */}

          {performance.recommendation && (
            <div
              style={{
                marginTop: "9px",

                paddingTop: "8px",

                borderTop:
                  "1px solid rgba(255,255,255,0.08)",

                fontSize: "10px",

                lineHeight: 1.45,

                opacity: 0.72,
              }}
            >
              🤖 {performance.recommendation}
            </div>
          )}
        </div>
      )}

      {/* =================================================
          PLOTS
      ================================================= */}

      {farmHealth.plots.map(
        (plot) => {

          const status =
            getStatusStyle(
              plot.status
            );

          const plotPerformance =
            performance?.plots?.find(
              (item) =>
                item.plotId ===
                plot.plotId
            );

          return (
            <div
              key={plot.plotId}
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
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap: "8px",
                }}
              >
                <strong>
                  Plot {plot.plotId}
                </strong>

                <span
                  style={{
                    fontSize: "11px",

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {status.icon}{" "}
                  {plot.status}
                </span>
              </div>

              {/* HEALTH SCORE */}

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  marginTop: "6px",

                  fontSize: "11px",

                  opacity: 0.8,
                }}
              >
                <span>
                  Health score
                </span>

                <strong>
                  {plot.score}/100
                </strong>
              </div>

              {/* PERFORMANCE SCORE */}

              {plotPerformance && (
                <div
                  style={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    marginTop: "5px",

                    fontSize: "11px",
                  }}
                >
                  <span
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    📈 Performance
                  </span>

                  <strong>
                    {plotPerformance.score}/100
                  </strong>
                </div>
              )}

              {/* YIELD POTENTIAL */}

              {plotPerformance && (
                <div
                  style={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    marginTop: "4px",

                    fontSize: "10px",

                    opacity: 0.75,
                  }}
                >
                  <span>
                    🌾 Yield potential
                  </span>

                  <strong>
                    {plotPerformance.yieldPotential}
                  </strong>
                </div>
              )}

              {/* LIMITING FACTOR */}

              {plotPerformance?.limitingFactor && (
                <div
                  style={{
                    marginTop: "5px",

                    fontSize: "10px",

                    opacity: 0.65,
                  }}
                >
                  {getFactorIcon(
                    plotPerformance
                      .limitingFactor
                      .key
                  )}{" "}
                  Main factor:{" "}
                  {plotPerformance
                    .limitingFactor
                    .label}
                </div>
              )}

              {/* HEALTH RECOMMENDATION */}

              <div
                style={{
                  marginTop: "6px",

                  fontSize: "10px",

                  lineHeight: 1.4,

                  opacity: 0.68,
                }}
              >
                {plot.recommendation}
              </div>
            </div>
          );
        }
      )}

    </div>
  );
}
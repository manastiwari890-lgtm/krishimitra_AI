import { useEffect, useMemo, useState } from "react";

import { useFarmState } from "../../farm/hooks/useFarmState";

// =====================================================
// KRISHIMITRA AI
// SMART IRRIGATION
// =====================================================
//
// IMPORTANT:
//
// This component uses the FARM STATE as the SINGLE
// SOURCE OF TRUTH.
//
// It does NOT maintain its own moisture values.
//
// Actual moisture:
// farmState.plots[].moisture
//
// Irrigation:
// controller.updatePlotMoisture()
//
// =====================================================

const PLOTS = ["A", "B", "C", "D"];

function getStatus(value) {
  if (value >= 70) {
    return {
      label: "Healthy",
      icon: "🟢",
      text: "Moisture is good",
    };
  }

  if (value >= 40) {
    return {
      label: "Moderate",
      icon: "🟡",
      text: "Monitor moisture",
    };
  }

  return {
    label: "Needs irrigation",
    icon: "🔴",
    text: "Irrigation recommended",
  };
}

export default function SmartIrrigation() {

  // ===================================================
  // REAL FARM STATE
  // ===================================================

  const {
    farmState,
    controller,
  } = useFarmState();

  // ===================================================
  // CURRENT IRRIGATION TARGET
  // ===================================================

  const [
    irrigatingPlot,
    setIrrigatingPlot,
  ] = useState(null);

  // ===================================================
  // REAL PLOT DATA
  // ===================================================

  const plots = useMemo(() => {

    return PLOTS.map((id) => {

      const plot =
        farmState.plots.find(
          (item) => item.id === id
        );

      return {
        id,
        moisture: Number(
          plot?.moisture ?? 0
        ),
        health:
          plot?.health ?? "healthy",
        crop:
          plot?.crop ?? "maize",
      };

    });

  }, [farmState.plots]);

  // ===================================================
  // DRY PLOTS
  // ===================================================

  const dryPlots = useMemo(
    () =>
      plots.filter(
        (plot) =>
          plot.moisture < 40
      ),
    [plots]
  );

  // ===================================================
  // STOP IRRIGATION IF TARGET IS NO LONGER DRY
  // ===================================================

  useEffect(() => {

    if (!irrigatingPlot) {
      return;
    }

    const plot =
      plots.find(
        (item) =>
          item.id === irrigatingPlot
      );

    if (
      !plot ||
      plot.moisture >= 70
    ) {
      setIrrigatingPlot(null);
    }

  }, [
    plots,
    irrigatingPlot,
  ]);

  // ===================================================
  // REAL IRRIGATION
  // ===================================================
  //
  // This changes the actual farmState moisture.
  //
  // Therefore:
  //
  // Smart Irrigation
  //        ↓
  // FarmController
  //        ↓
  // farmState.plots
  //        ↓
  // Digital Twin
  //        ↓
  // CropField
  //
  // ===================================================

  useEffect(() => {

    if (!irrigatingPlot) {
      return;
    }

    const timer =
      setInterval(() => {

        const plot =
          farmState.plots.find(
            (item) =>
              item.id === irrigatingPlot
          );

        if (!plot) {
          setIrrigatingPlot(null);
          return;
        }

        const currentMoisture =
          Number(plot.moisture ?? 0);

        // ---------------------------------------------
        // STOP AT 70%
        // ---------------------------------------------

        if (
          currentMoisture >= 70
        ) {
          setIrrigatingPlot(null);
          return;
        }

        // ---------------------------------------------
        // ADD WATER
        // ---------------------------------------------

        const nextMoisture =
          Math.min(
            70,
            currentMoisture + 5
          );

        controller.updatePlotMoisture(
          irrigatingPlot,
          nextMoisture
        );

      }, 900);

    return () =>
      clearInterval(timer);

  }, [
    irrigatingPlot,
    farmState,
    controller,
  ]);

  // ===================================================
  // START IRRIGATION
  // ===================================================

  const startIrrigation = (
    plotId
  ) => {

    setIrrigatingPlot(
      plotId
    );

    controller.updatePlot(
      plotId,
      {
        irrigationRequired: true,
        irrigationLevel: "active",
        irrigationReason:
          "Soil moisture below recommended level.",
      }
    );

  };

  // ===================================================
  // STOP IRRIGATION
  // ===================================================

  const stopIrrigation = () => {

    if (irrigatingPlot) {

      controller.updatePlot(
        irrigatingPlot,
        {
          irrigationRequired: false,
          irrigationLevel: "normal",
          irrigationReason:
            "Irrigation stopped manually.",
        }
      );

    }

    setIrrigatingPlot(null);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      style={{
        position: "absolute",
        left: "18px",
        top: "18px",
        zIndex: 20,
        width: "300px",
        maxHeight: "590px",
        overflowY: "auto",
        padding: "14px",
        borderRadius: "18px",
        background:
          "rgba(7, 26, 18, 0.84)",
        backdropFilter:
          "blur(14px)",
        border:
          "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        boxShadow:
          "0 12px 35px rgba(0,0,0,0.22)",
        fontFamily:
          "system-ui, sans-serif",
      }}
    >

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <div
        style={{
          fontSize: "15px",
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

      {/* ============================================= */}
      {/* PLOTS */}
      {/* ============================================= */}

      {plots.map((plot) => {

        const value =
          Math.max(
            0,
            Math.min(
              100,
              plot.moisture
            )
          );

        const status =
          getStatus(value);

        const isIrrigating =
          irrigatingPlot === plot.id;

        return (
          <div
            key={plot.id}
            style={{
              padding:
                "10px 11px",
              marginBottom:
                "7px",
              borderRadius:
                "12px",
              background:
                "rgba(255,255,255,0.07)",
            }}
          >

            {/* --------------------------------------- */}
            {/* TITLE */}
            {/* --------------------------------------- */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <strong>
                Plot {plot.id}
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

            {/* --------------------------------------- */}
            {/* MOISTURE BAR */}
            {/* --------------------------------------- */}

            <div
              style={{
                marginTop: "7px",
                height: "7px",
                borderRadius: "99px",
                background:
                  "rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  width:
                    `${value}%`,
                  height: "100%",
                  borderRadius:
                    "99px",

                  background:
                    value >= 70
                      ? "#4ade80"
                      : value >= 40
                        ? "#facc15"
                        : "#f87171",

                  transition:
                    "width 0.5s ease",
                }}
              />

            </div>

            {/* --------------------------------------- */}
            {/* VALUE + BUTTON */}
            {/* --------------------------------------- */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginTop: "7px",
              }}
            >

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {value.toFixed(0)}%
              </span>

              {/* IRRIGATE */}

              {value < 40 &&
                !isIrrigating && (

                  <button
                    type="button"
                    onClick={() =>
                      startIrrigation(
                        plot.id
                      )
                    }
                    style={{
                      border: 0,
                      borderRadius:
                        "8px",
                      padding:
                        "6px 9px",
                      background:
                        "#2563eb",
                      color:
                        "#fff",
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

              {/* STOP */}

              {isIrrigating && (

                <button
                  type="button"
                  onClick={
                    stopIrrigation
                  }
                  style={{
                    border: 0,
                    borderRadius:
                      "8px",
                    padding:
                      "6px 9px",
                    background:
                      "#dc2626",
                    color:
                      "#fff",
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

      {/* ============================================= */}
      {/* RECOMMENDATION */}
      {/* ============================================= */}

      <div
        style={{
          marginTop: "9px",
          padding:
            "10px",
          borderRadius:
            "11px",

          background:
            dryPlots.length > 0
              ? "rgba(127,29,29,0.35)"
              : "rgba(21,128,61,0.28)",

          fontSize:
            "11px",

          lineHeight:
            1.4,
        }}
      >

        {dryPlots.length > 0

          ? `⚠️ Recommendation: Plot ${dryPlots
              .map(
                (plot) =>
                  plot.id
              )
              .join(
                ", "
              )} needs irrigation.`

          : "✅ All plots have sufficient moisture."}

      </div>

    </div>
  );
}
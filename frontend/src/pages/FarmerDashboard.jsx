import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useFarmState } from "../farm/hooks/useFarmState";
import { useFarmController } from "../farm/controller/useFarmController";
import { FarmHealthEngine } from "../farm/engine/FarmHealthEngine";

// =====================================================
// KRISHIMITRA AI
// FARMER DASHBOARD / AI FARM COMMAND CENTER
// =====================================================

function getStatusStyle(status) {
  switch (status) {
    case "Healthy":
    case "Excellent":
      return {
        icon: "🟢",
        background: "rgba(21,128,61,0.24)",
        border: "rgba(74,222,128,0.28)",
      };

    case "Good":
      return {
        icon: "🟢",
        background: "rgba(22,101,52,0.24)",
        border: "rgba(74,222,128,0.24)",
      };

    case "Moderate":
      return {
        icon: "🟡",
        background: "rgba(161,98,7,0.25)",
        border: "rgba(250,204,21,0.25)",
      };

    case "Warning":
    case "Low":
      return {
        icon: "🟠",
        background: "rgba(194,65,12,0.25)",
        border: "rgba(251,146,60,0.28)",
      };

    case "Critical":
    case "Very Low":
      return {
        icon: "🔴",
        background: "rgba(127,29,29,0.28)",
        border: "rgba(248,113,113,0.28)",
      };

    default:
      return {
        icon: "⚪",
        background: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.10)",
      };
  }
}

function getPerformanceColor(score) {
  if (score >= 85) return "#4ade80";
  if (score >= 70) return "#a3e635";
  if (score >= 50) return "#facc15";
  if (score >= 30) return "#fb923c";
  return "#f87171";
}

function getDiseaseStyle(risk) {
  switch (String(risk || "").toLowerCase()) {
    case "high":
      return {
        icon: "🔴",
        text: "High",
      };

    case "medium":
      return {
        icon: "🟡",
        text: "Medium",
      };

    default:
      return {
        icon: "🟢",
        text: "Low",
      };
  }
}

function getWeatherLabel(weather) {
  if (!weather) return "Weather unavailable";

  if (weather.isRaining) {
    return "Rain detected";
  }

  const temperature = Number(weather.temperature);

  if (temperature >= 38) {
    return "High heat";
  }

  if (temperature >= 34) {
    return "Warm conditions";
  }

  return "Stable conditions";
}

function getPlotAction(plotPerformance, plotHealth) {
  if (!plotPerformance) {
    return plotHealth?.recommendation || "Continue monitoring this plot.";
  }

  const factor = plotPerformance.limitingFactor?.key;

  switch (factor) {
    case "moisture":
      return "Irrigation recommended.";

    case "cropHealth":
      return "Inspect crop stress and field conditions.";

    case "disease":
      return "Inspect crops for disease symptoms.";

    case "weather":
      return "Monitor weather stress conditions.";

    case "growth":
      return "Monitor crop growth and field conditions.";

    default:
      return plotHealth?.recommendation || "Continue monitoring this plot.";
  }
}
function getFarmAlerts(farmState, farmHealth) {
  const alerts = [];

  const plots = farmState?.plots ?? [];
  const weather = farmState?.weather ?? {};

  // ===================================================
  // WEATHER VALUES
  // ===================================================

  const temperature = Number(weather.temperature);
  const humidity = Number(weather.humidity);

  // ===================================================
  // COMMAND CENTER PRIORITY
  // ===================================================
  // Use the same priority plot selected by FarmHealthEngine.
  // This keeps AI Farm Alerts aligned with:
  // AI Farm Insight
  // Smart Action
  // AI Decision Log
  // ===================================================

  const priorityPlotId = farmHealth?.priorityPlot?.plotId ?? null;

  const priorityPerformance = priorityPlotId
    ? farmHealth?.performance?.plots?.find(
        (plot) => plot?.plotId === priorityPlotId,
      )
    : null;

  const limitingFactor = priorityPerformance?.limitingFactor?.key ?? null;

  // ===================================================
  // WEATHER ALERTS
  // ===================================================

  if (temperature >= 38) {
    alerts.push({
      id: "heat",
      type: "warning",
      icon: "🌡️",
      title: "High Temperature",
      message:
        `Current temperature: ${temperature}°C. ` +
        `Reason: high heat can increase crop stress. ` +
        `Recommended: monitor crop condition and soil moisture.`,
    });
  }

  if (humidity >= 85) {
    alerts.push({
      id: "humidity",
      type: "warning",
      icon: "💧",
      title: "High Humidity",
      message:
        `Current humidity: ${humidity}%. ` +
        `Reason: prolonged high humidity can increase disease pressure. ` +
        `Recommended: inspect crops and maintain airflow where possible.`,
    });
  }

  // ===================================================
  // PLOT ALERTS
  // ===================================================

  plots.forEach((plot) => {
    const moisture = Number(plot?.moisture);

    const diseaseRisk = String(plot?.diseaseRisk || "").toLowerCase();

    const health = String(plot?.health || "").toLowerCase();

    // =================================================
    // LOW MOISTURE
    // =================================================

    if (moisture < 30) {
      alerts.push({
        id: `moisture-${plot.id}`,
        type: "critical",
        icon: "💧",
        title: `Plot ${plot.id} Low Moisture`,
        message:
          `Current soil moisture: ${Math.round(moisture)}%. ` +
          `Reason: the soil is below the preferred moisture monitoring range. ` +
          `Recommended: irrigate this plot and continue monitoring moisture.`,
        plotId: plot.id,
      });
    }

    // =================================================
    // EXCESS MOISTURE
    // =================================================

    if (moisture > 90) {
      alerts.push({
        id: `excess-moisture-${plot.id}`,
        type: "warning",
        icon: "🌊",
        title: `Plot ${plot.id} Excess Moisture`,
        message:
          `Current soil moisture: ${Math.round(moisture)}%. ` +
          `Reason: moisture is very high and may indicate waterlogging risk. ` +
          `Recommended: monitor drainage and avoid unnecessary irrigation.`,
        plotId: plot.id,
      });
    }

    // =================================================
    // HIGH DISEASE RISK
    // =================================================

    if (diseaseRisk === "high") {
      alerts.push({
        id: `disease-${plot.id}`,
        type: "critical",
        icon: "🦠",
        title: `Plot ${plot.id} High Disease Risk`,
        message:
          `Current disease risk: High. ` +
          `Reason: the Digital Twin has identified elevated disease pressure. ` +
          `Recommended: inspect crops for visible disease symptoms.`,
        plotId: plot.id,
      });
    }

    // =================================================
    // CROP STRESS
    // =================================================

    if (health === "stressed" || health === "critical") {
      alerts.push({
        id: `health-${plot.id}`,
        type: "critical",
        icon: "🌱",
        title: `Plot ${plot.id} Crop Stress`,
        message:
          `Current crop health: ${health}. ` +
          `Reason: the crop health simulation indicates significant stress. ` +
          `Recommended: inspect the plants and field conditions.`,
        plotId: plot.id,
      });
    }

    // =================================================
    // HEALTH WARNING
    // =================================================

    if (health === "warning") {
      alerts.push({
        id: `health-warning-${plot.id}`,
        type: "warning",
        icon: "🌱",
        title: `Plot ${plot.id} Health Warning`,
        message:
          `Current crop health: Warning. ` +
          `Soil moisture: ${Math.round(moisture)}%. ` +
          `Reason: crop health requires closer monitoring. ` +
          `Recommended: inspect this plot for visible crop stress.`,
        plotId: plot.id,
      });
    }
  });

  // ===================================================
  // FARM PERFORMANCE ALERT
  // ===================================================

  const performanceScore = Number(farmHealth?.performance?.score);

  if (Number.isFinite(performanceScore) && performanceScore < 50) {
    alerts.push({
      id: "farm-performance",
      type: "critical",
      icon: "📉",
      title: "Low Farm Performance",
      message:
        `Current farm performance: ${performanceScore}/100. ` +
        `Reason: overall Digital Twin performance is below the monitoring threshold. ` +
        `Recommended: inspect the plots with the lowest performance and address their limiting factors.`,
    });
  }

  // ===================================================
  // ALERT PRIORITIZATION
  // ===================================================
  // First align with the FarmHealthEngine priority plot.
  // Then prioritize the same limiting factor.
  // Finally fall back to alert severity.
  // ===================================================

  const alertPriority = {
    critical: 1,
    warning: 2,
    info: 3,
  };

  const limitingFactorAlertScore = (alert) => {
    if (!alert?.plotId || alert.plotId !== priorityPlotId) {
      return 0;
    }

    if (
      limitingFactor === "disease" &&
      alert.id === `disease-${priorityPlotId}`
    ) {
      return 3;
    }

    if (
      limitingFactor === "moisture" &&
      alert.id === `moisture-${priorityPlotId}`
    ) {
      return 3;
    }

    if (
      limitingFactor === "cropHealth" &&
      alert.id === `health-${priorityPlotId}`
    ) {
      return 3;
    }

    if (
      limitingFactor === "weather" &&
      (alert.id === "heat" || alert.id === "humidity")
    ) {
      return 3;
    }

    if (limitingFactor === "growth" && alert.plotId === priorityPlotId) {
      return 2;
    }

    return 1;
  };

  alerts.sort((a, b) => {
    const priorityPlotA = a.plotId === priorityPlotId ? 1 : 0;

    const priorityPlotB = b.plotId === priorityPlotId ? 1 : 0;

    if (priorityPlotA !== priorityPlotB) {
      return priorityPlotB - priorityPlotA;
    }

    const limitingScoreA = limitingFactorAlertScore(a);
    const limitingScoreB = limitingFactorAlertScore(b);

    if (limitingScoreA !== limitingScoreB) {
      return limitingScoreB - limitingScoreA;
    }

    const priorityA = alertPriority[a.type] ?? 99;
    const priorityB = alertPriority[b.type] ?? 99;

    return priorityA - priorityB;
  });

  return alerts;
}
function ScoreBar({ score, height = 7 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "999px",
        background: "rgba(255,255,255,0.09)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${safeScore}%`,
          height: "100%",
          borderRadius: "999px",
          background: getPerformanceColor(safeScore),
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color = "#ffffff" }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.08)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          opacity: 0.72,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
      </div>

      <div
        style={{
          marginTop: "9px",
          fontSize: "26px",
          lineHeight: 1,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "7px",
            fontSize: "11px",
            opacity: 0.58,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function FarmerDashboard() {
  const { farmState } = useFarmState();
  const controller = useFarmController();

  // ===================================================
  // AI FARM ACTION HISTORY
  // ===================================================

  const [actionHistory, setActionHistory] = useState(() => {
    try {
      const savedActions = localStorage.getItem("krishimitra-farm-actions");

      return savedActions ? JSON.parse(savedActions) : [];
    } catch {
      return [];
    }
  });
  const [actionFeedback, setActionFeedback] = useState(null);

  const addFarmAction = (action) => {
    setActionHistory((previous) =>
      [
        {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          ...action,
        },
        ...previous,
      ].slice(0, 6),
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        "krishimitra-farm-actions",
        JSON.stringify(actionHistory),
      );
    } catch {
      // Ignore storage errors.
    }
  }, [actionHistory]);

  // ===================================================
  // LIVE FARM INTELLIGENCE
  // ===================================================

  const farmHealth = useMemo(
    () => FarmHealthEngine.calculateFarmHealth(farmState),
    [farmState],
  );
  const farmAlerts = useMemo(
    () => getFarmAlerts(farmState, farmHealth),
    [farmState, farmHealth],
  );
  const alertSummary = useMemo(() => {
    const critical = farmAlerts.filter(
      (alert) => alert.type === "critical",
    ).length;

    const warning = farmAlerts.filter(
      (alert) => alert.type === "warning",
    ).length;

    const info = farmAlerts.filter((alert) => alert.type === "info").length;

    return {
      critical,
      warning,
      info,
      total: farmAlerts.length,
      plotsMonitored: farmState?.plots?.length ?? 0,
      priorityAlert: farmAlerts[0] ?? null,
    };
  }, [farmAlerts, farmState]);

  const performance = farmHealth?.performance ?? null;

  const weather = farmState?.weather ?? {};

  const plots = farmHealth?.plots ?? [];

  const performancePlots = performance?.plots ?? [];

  // ===================================================
  // REAL FARM ACTION
  // ===================================================

  const irrigatePlot = (plotId) => {
    const plot = farmState?.plots?.find((item) => item.id === plotId);

    if (!plot) return;

    const currentMoisture = Number(plot.moisture) || 0;

    // Controlled irrigation.
    // Increase moisture by 20 percentage points
    // without exceeding 100%.
    const newMoisture = Math.min(100, currentMoisture + 20);

    controller.updatePlotMoisture(plotId, newMoisture);
    addFarmAction({
      icon: "💧",
      text: `Plot ${plotId} irrigated`,
    });
    setActionFeedback({
      icon: "💧",
      title: `Plot ${plotId} irrigation applied`,
      message: `Soil moisture increased from ${Math.round(
        currentMoisture,
      )}% to ${Math.round(newMoisture)}%.`,
    });
    if (currentMoisture < 30 && newMoisture >= 30) {
      addFarmAction({
        icon: "✅",
        text: `Plot ${plotId} moisture alert resolved`,
      });
      setActionFeedback({
        icon: "✅",
        title: `Plot ${plotId} moisture alert resolved`,
        message: `Moisture improved from ${Math.round(
          currentMoisture,
        )}% to ${Math.round(newMoisture)}%. The low-moisture alert is now resolved.`,
      });
    }
  };
  const startFarmRain = () => {
    controller.startRain();

    addFarmAction({
      icon: "🌧️",
      text: "Rain started",
    });

    setActionFeedback({
      icon: "🌧️",
      title: "Rain started",
      message:
        "Farm weather state updated. Rain is now active across the Digital Twin.",
    });
  };
  const stopFarmRain = () => {
    controller.stopRain();

    addFarmAction({
      icon: "☀️",
      text: "Rain stopped",
    });

    setActionFeedback({
      icon: "☀️",
      title: "Rain stopped",
      message:
        "Farm weather state updated. Rain is now inactive across the Digital Twin.",
    });
  };
  const handleAlertAction = (alert) => {
    if (!alert) return;

    if (alert.id.startsWith("moisture-") && alert.plotId) {
      irrigatePlot(alert.plotId);
    }
  };
  // ===================================================
  // FARM SUMMARY
  // ===================================================

  const averageMoisture = useMemo(() => {
    const values =
      farmState?.plots
        ?.map((plot) => Number(plot?.moisture))
        .filter(Number.isFinite) ?? [];

    if (!values.length) return 0;

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [farmState]);

  const averageGrowth = Math.round(Number(performance?.growthProgress ?? 0));

  const farmStatus = getStatusStyle(farmHealth?.status);

  const performanceStatus = performance
    ? getStatusStyle(performance.status)
    : getStatusStyle(null);

  const weatherLabel = getWeatherLabel(weather);

  // ===================================================
  // MOST IMPORTANT PLOT
  // ===================================================

  const priorityPlot = farmHealth?.priorityPlot ?? null;

  const priorityPerformance = priorityPlot
    ? performancePlots.find((item) => item.plotId === priorityPlot.plotId)
    : null;
  // ===================================================
  // SMART ACTION SUGGESTION
  // ===================================================

  const smartAction = useMemo(() => {
    if (!priorityPlot) {
      return null;
    }

    const plot = farmState?.plots?.find(
      (item) => item.id === priorityPlot.plotId,
    );

    if (!plot) {
      return null;
    }

    const moisture = Number(plot.moisture) || 0;
    const temperature = Number(farmState?.weather?.temperature) || 0;
    const humidity = Number(farmState?.weather?.humidity) || 0;

    const limitingFactor = priorityPerformance?.limitingFactor?.key;

    if (limitingFactor === "moisture" && moisture < 60) {
      return {
        icon: "💧",
        title: `Irrigate Plot ${plot.id}`,
        reason: `Soil moisture is currently ${Math.round(
          moisture,
        )}%, which requires attention.`,
        action: "irrigate",
        plotId: plot.id,
      };
    }

    if (
      limitingFactor === "disease" ||
      String(plot.diseaseRisk).toLowerCase() === "high"
    ) {
      return {
        icon: "🦠",
        title: `Inspect Plot ${plot.id}`,
        reason: "Disease risk is currently limiting plot performance.",
        action: "inspect",
        plotId: plot.id,
      };
    }

    if (limitingFactor === "weather" || temperature >= 38 || humidity >= 85) {
      return {
        icon: "🌦️",
        title: `Monitor Plot ${plot.id}`,
        reason: `Current weather is ${temperature}°C and ${humidity}% humidity.`,
        action: "monitor",
        plotId: plot.id,
      };
    }

    if (limitingFactor === "cropHealth") {
      return {
        icon: "🌱",
        title: `Inspect Plot ${plot.id}`,
        reason: "Crop health is currently limiting plot performance.",
        action: "inspect",
        plotId: plot.id,
      };
    }

    return {
      icon: "📈",
      title: `Monitor Plot ${plot.id}`,
      reason: "Growth progress is currently the main limiting factor.",
      action: "monitor",
      plotId: plot.id,
    };
  }, [priorityPlot, priorityPerformance, farmState]);

  // ===================================================
  // AI DECISION EXPLAINABILITY
  // ===================================================

  const decisionLog = useMemo(() => {
    if (!priorityPlot) {
      return [];
    }

    const plot = farmState?.plots?.find(
      (item) => item.id === priorityPlot.plotId,
    );

    if (!plot) {
      return [];
    }

    const moisture = Number(plot.moisture) || 0;
    const temperature = Number(farmState?.weather?.temperature) || 0;
    const humidity = Number(farmState?.weather?.humidity) || 0;

    const health = String(plot.health || "Monitoring");

    const diseaseRisk = String(plot.diseaseRisk || "Low");

    const growth = Number(plot.growth) || 0;

    const limitingFactor = priorityPerformance?.limitingFactor?.key;

    const decisions = [];

    if (limitingFactor === "moisture") {
      if (moisture < 40) {
        decisions.push({
          icon: "💧",
          label: "Soil Moisture",
          value: `${Math.round(moisture)}%`,
          reason: "Soil moisture is below the preferred monitoring range.",
          decision: "Irrigation recommended.",
        });
      } else if (moisture > 80) {
        decisions.push({
          icon: "🌊",
          label: "Soil Moisture",
          value: `${Math.round(moisture)}%`,
          reason: "Soil moisture is high and may increase waterlogging risk.",
          decision: "Avoid unnecessary irrigation and monitor drainage.",
        });
      }
    }

    if (limitingFactor === "cropHealth") {
      decisions.push({
        icon: "🌱",
        label: "Crop Health",
        value: health,
        reason: "The Digital Twin indicates crop health stress.",
        decision: "Inspect the priority plot for visible crop stress.",
      });
    }

    if (limitingFactor === "disease") {
      decisions.push({
        icon: "🦠",
        label: "Disease Risk",
        value: diseaseRisk,
        reason: "Disease risk is currently limiting plot performance.",
        decision: "Inspect crops for visible disease symptoms.",
      });
    }

    if (limitingFactor === "weather") {
      decisions.push({
        icon: "🌦️",
        label: "Weather",
        value: `${temperature}°C / ${humidity}%`,
        reason: "Current weather conditions are reducing plot performance.",
        decision: "Monitor crop stress and field conditions.",
      });
    }

    if (limitingFactor === "growth") {
      decisions.push({
        icon: "📈",
        label: "Crop Growth",
        value: `${Math.round(growth)}%`,
        reason: "Crop growth progress is currently limiting performance.",
        decision:
          "Continue monitoring moisture, health and environmental conditions.",
      });
    }

    if (decisions.length === 0) {
      decisions.push({
        icon: "🧠",
        label: "Farm Status",
        value: "Monitoring",
        reason: "No single limiting factor requires immediate intervention.",
        decision: "Continue monitoring the Digital Twin.",
      });
    }

    return decisions;
  }, [priorityPlot, priorityPerformance, farmState]);

  // ===================================================
  // PLOT DATA
  // ===================================================

  const dashboardPlots = plots.map((plot) => {
    const sourcePlot = farmState?.plots?.find(
      (item) => item.id === plot.plotId,
    );

    const plotPerformance = performancePlots.find(
      (item) => item.plotId === plot.plotId,
    );

    return {
      ...plot,
      sourcePlot,
      plotPerformance,
    };
  });

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top right, rgba(34,197,94,0.12), transparent 32%), linear-gradient(135deg, #06140e 0%, #0a2116 45%, #06130d 100%)",
        color: "#ffffff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "24px",
      }}
    >
      {/* =================================================
          PAGE CONTAINER
      ================================================= */}

      <div
        style={{
          width: "100%",
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(74,222,128,0.22)",
                  fontSize: "22px",
                }}
              >
                🌱
              </div>

              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    letterSpacing: "0.3px",
                  }}
                >
                  KRISHIMITRA
                  <span
                    style={{
                      color: "#4ade80",
                      marginLeft: "4px",
                    }}
                  >
                    AI
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.58,
                    marginTop: "2px",
                  }}
                >
                  AI Farm Command Center
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/farm"
            style={{
              textDecoration: "none",
              color: "#ffffff",
              padding: "10px 14px",
              borderRadius: "11px",
              border: "1px solid rgba(74,222,128,0.28)",
              background: "rgba(34,197,94,0.10)",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            🌾 Open 3D Farm →
          </Link>
        </header>

        {/* =================================================
            LIVE STATUS
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
            fontSize: "11px",
            opacity: 0.68,
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 10px rgba(74,222,128,0.7)",
            }}
          />
          Live Digital Twin intelligence
        </div>

        {/* =================================================
            TOP METRICS
        ================================================= */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <MetricCard
            icon="❤️"
            title="Farm Health"
            value={`${farmHealth.score}/100`}
            subtitle={`${farmStatus.icon} ${farmHealth.status}`}
            color="#4ade80"
          />

          <MetricCard
            icon="📈"
            title="Performance"
            value={`${performance?.score ?? 0}/100`}
            subtitle={
              performance
                ? `${performanceStatus.icon} ${performance.status}`
                : "Unavailable"
            }
            color={getPerformanceColor(performance?.score ?? 0)}
          />

          <MetricCard
            icon="🌱"
            title="Average Growth"
            value={`${averageGrowth}%`}
            subtitle="Digital Twin growth progress"
            color="#a3e635"
          />

          <MetricCard
            icon="💧"
            title="Average Moisture"
            value={`${averageMoisture}%`}
            subtitle="Across active plots"
            color="#67e8f9"
          />
        </section>
        {/* =================================================
    AI ALERT CENTER
================================================= */}

        <section
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                🚨 AI Farm Alerts
              </strong>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  opacity: 0.5,
                }}
              >
                Live alerts generated from Digital Twin conditions
              </div>
            </div>

            <div
              style={{
                padding: "5px 8px",
                borderRadius: "999px",
                background:
                  farmAlerts.length > 0
                    ? "rgba(251,146,60,0.12)"
                    : "rgba(74,222,128,0.12)",
                color: farmAlerts.length > 0 ? "#fdba74" : "#86efac",
                fontSize: "9px",
                fontWeight: 800,
              }}
            >
              {farmAlerts.length > 0
                ? `${farmAlerts.length} ACTIVE`
                : "ALL CLEAR"}
            </div>
          </div>
          {/* =================================================
    ALERT SUMMARY
================================================= */}

          <div
            style={{
              marginTop: "13px",
              padding: "11px",
              borderRadius: "11px",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                opacity: 0.65,
                marginBottom: "9px",
              }}
            >
              🧠 FARM STATUS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              {/* PLOTS */}

              <div
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.045)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    opacity: 0.5,
                  }}
                >
                  🌾 Plots
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "15px",
                  }}
                >
                  {alertSummary.plotsMonitored}
                </strong>
              </div>

              {/* CRITICAL */}

              <div
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  background: "rgba(127,29,29,0.13)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    opacity: 0.6,
                  }}
                >
                  🔴 Critical
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "15px",
                    color: alertSummary.critical > 0 ? "#fca5a5" : "#86efac",
                  }}
                >
                  {alertSummary.critical}
                </strong>
              </div>

              {/* WARNING */}

              <div
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  background: "rgba(194,65,12,0.11)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    opacity: 0.6,
                  }}
                >
                  🟠 Warnings
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "15px",
                    color: alertSummary.warning > 0 ? "#fdba74" : "#86efac",
                  }}
                >
                  {alertSummary.warning}
                </strong>
              </div>

              {/* TOTAL */}

              <div
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.045)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    opacity: 0.5,
                  }}
                >
                  🚨 Active
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "15px",
                  }}
                >
                  {alertSummary.total}
                </strong>
              </div>
            </div>

            {/* PRIORITY ALERT */}

            {alertSummary.priorityAlert && (
              <div
                style={{
                  marginTop: "9px",
                  padding: "9px 10px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.045)",
                  fontSize: "10px",
                }}
              >
                <span
                  style={{
                    opacity: 0.55,
                  }}
                >
                  🎯 Highest priority:
                </span>{" "}
                <strong>
                  {alertSummary.priorityAlert.icon}{" "}
                  {alertSummary.priorityAlert.title}
                </strong>
              </div>
            )}
          </div>

          {farmAlerts.length === 0 ? (
            <div
              style={{
                marginTop: "14px",
                padding: "13px",
                borderRadius: "11px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(74,222,128,0.12)",
                fontSize: "11px",
                color: "#bbf7d0",
              }}
            >
              🟢 No critical farm alerts detected. Continue monitoring the
              Digital Twin.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "9px",
                marginTop: "13px",
              }}
            >
              {farmAlerts.map((alert) => {
                const isCritical = alert.type === "critical";

                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      background: isCritical
                        ? "rgba(127,29,29,0.16)"
                        : "rgba(194,65,12,0.13)",
                      border: isCritical
                        ? "1px solid rgba(248,113,113,0.20)"
                        : "1px solid rgba(251,146,60,0.18)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                        }}
                      >
                        {alert.icon}
                      </span>

                      <strong
                        style={{
                          fontSize: "11px",
                        }}
                      >
                        {alert.title}
                      </strong>
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "10px",
                        lineHeight: 1.5,
                        opacity: 0.68,
                      }}
                    >
                      {alert.message}
                    </div>
                    {alert.type === "critical" &&
                      alert.id.startsWith("moisture-") &&
                      alert.plotId && (
                        <button
                          type="button"
                          onClick={() => handleAlertAction(alert)}
                          style={{
                            width: "100%",
                            marginTop: "10px",
                            border: "1px solid rgba(96,165,250,0.28)",
                            borderRadius: "9px",
                            padding: "8px 10px",
                            background: "rgba(37,99,235,0.18)",
                            color: "#bfdbfe",
                            fontSize: "10px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          💧 Irrigate Plot {alert.plotId}
                        </button>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
        {/* =====================================================
    AI FARM ACTION HISTORY
===================================================== */}

        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "13px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                }}
              >
                📋 Recent Farm Actions
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "11px",
                  opacity: 0.55,
                }}
              >
                Actions performed from the AI Farm Command Center
              </div>
            </div>

            <div
              style={{
                padding: "5px 9px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {actionHistory.length} recent
            </div>
          </div>

          {actionHistory.length === 0 ? (
            <div
              style={{
                padding: "18px 12px",
                textAlign: "center",
                borderRadius: "11px",
                background: "rgba(255,255,255,0.025)",
                fontSize: "12px",
                opacity: 0.6,
              }}
            >
              No farm actions recorded yet.
              <div
                style={{
                  marginTop: "5px",
                  fontSize: "10px",
                  opacity: 0.7,
                }}
              >
                Irrigation and weather controls will appear here.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "8px",
              }}
            >
              {actionHistory.map((action) => (
                <div
                  key={action.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 11px",
                    borderRadius: "11px",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.055)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.06)",
                      fontSize: "17px",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {action.text}
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "10px",
                        opacity: 0.5,
                      }}
                    >
                      Farmer action
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      opacity: 0.55,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {action.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {actionFeedback && (
          <div
            style={{
              marginTop: "12px",
              padding: "13px",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.035))",
              border: "1px solid rgba(74,222,128,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(74,222,128,0.12)",
                  fontSize: "17px",
                  flexShrink: 0,
                }}
              >
                {actionFeedback.icon}
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  ✓ {actionFeedback.title}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "10px",
                    lineHeight: 1.45,
                    opacity: 0.65,
                  }}
                >
                  {actionFeedback.message}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#86efac",
                  }}
                >
                  ✓ ACTION CONFIRMED
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            WEATHER + AI INSIGHT
        ================================================= */}
        <style>
          {`
    @media (max-width: 800px) {
      .krishi-weather-insight-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }
    }
  `}
        </style>

        <section
          className="krishi-weather-insight-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          {/* WEATHER */}

          <div
            style={{
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                🌦️ Farm Weather
              </strong>

              <Link
                to="/weather"
                style={{
                  color: "#86efac",
                  fontSize: "10px",
                  textDecoration: "none",
                }}
              >
                View Weather →
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
                gap: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "38px",
                    fontWeight: 900,
                  }}
                >
                  {Number.isFinite(weather.temperature)
                    ? weather.temperature
                    : "--"}
                  <span
                    style={{
                      fontSize: "18px",
                      opacity: 0.6,
                    }}
                  >
                    °C
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.62,
                    marginTop: "3px",
                  }}
                >
                  {weatherLabel}
                </div>
              </div>

              <div
                style={{
                  fontSize: "40px",
                }}
              >
                {weather.isRaining ? "🌧️" : "🌤️"}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  padding: "9px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "12px",
                  }}
                >
                  💧 {weather.humidity ?? "--"}%
                </strong>

                <span
                  style={{
                    fontSize: "9px",
                    opacity: 0.55,
                  }}
                >
                  Humidity
                </span>
              </div>

              <div
                style={{
                  padding: "9px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "12px",
                  }}
                >
                  💨 {weather.windSpeed ?? "--"}
                </strong>

                <span
                  style={{
                    fontSize: "9px",
                    opacity: 0.55,
                  }}
                >
                  Wind
                </span>
              </div>

              <div
                style={{
                  padding: "9px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "12px",
                  }}
                >
                  {weather.isRaining ? "🌧️ ON" : "☀️ OFF"}
                </strong>

                <span
                  style={{
                    fontSize: "9px",
                    opacity: 0.55,
                  }}
                >
                  Rain
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {!weather.isRaining ? (
              <button
                type="button"
                onClick={startFarmRain}
                style={{
                  flex: 1,
                  border: "1px solid rgba(96,165,250,0.28)",
                  borderRadius: "9px",
                  padding: "9px 10px",
                  background: "rgba(37,99,235,0.18)",
                  color: "#bfdbfe",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🌧️ Start Rain
              </button>
            ) : (
              <button
                type="button"
                onClick={stopFarmRain}
                style={{
                  flex: 1,
                  border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: "9px",
                  padding: "9px 10px",
                  background: "rgba(127,29,29,0.20)",
                  color: "#fecaca",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ☀️ Stop Rain
              </button>
            )}
          </div>

          {/* AI INSIGHT */}

          <div
            style={{
              padding: "18px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.13), rgba(255,255,255,0.045))",
              border: "1px solid rgba(74,222,128,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                🤖 AI Farm Insight
              </strong>

              <span
                style={{
                  fontSize: "9px",
                  padding: "4px 7px",
                  borderRadius: "999px",
                  background: "rgba(74,222,128,0.12)",
                  color: "#86efac",
                }}
              >
                LIVE
              </span>
            </div>

            <div
              style={{
                marginTop: "15px",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              {priorityPlot
                ? `Plot ${priorityPlot.plotId} needs attention`
                : "Farm conditions are being monitored"}
            </div>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "12px",
                lineHeight: 1.6,
                opacity: 0.68,
              }}
            >
              {smartAction?.reason ||
                performance?.recommendation ||
                "Continue monitoring crop health, moisture, disease risk and weather conditions."}
            </p>

            {priorityPerformance?.limitingFactor && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  marginTop: "13px",
                  padding: "7px 9px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.07)",
                  fontSize: "10px",
                }}
              >
                ⚠️ Main constraint:
                <strong>{priorityPerformance.limitingFactor.label}</strong>
              </div>
            )}
            {/* =================================================
    PRIORITY ACTION DETAILS
================================================= */}

            {priorityPlot && (
              <div
                style={{
                  marginTop: "13px",
                  padding: "11px",
                  borderRadius: "11px",
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    opacity: 0.65,
                    marginBottom: "9px",
                  }}
                >
                  🎯 PRIORITY ACTION
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "7px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.045)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        opacity: 0.5,
                      }}
                    >
                      💧 Moisture
                    </div>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "12px",
                      }}
                    >
                      {Math.round(
                        Number(
                          farmState?.plots?.find(
                            (item) => item.id === priorityPlot.plotId,
                          )?.moisture ?? 0,
                        ),
                      )}
                      %
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.045)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        opacity: 0.5,
                      }}
                    >
                      🌱 Crop Health
                    </div>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "12px",
                        textTransform: "capitalize",
                      }}
                    >
                      {priorityPlot.health || "Monitoring"}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.045)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        opacity: 0.5,
                      }}
                    >
                      🦠 Disease
                    </div>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "12px",
                      }}
                    >
                      {farmState?.plots?.find(
                        (item) => item.id === priorityPlot.plotId,
                      )?.diseaseRisk || "Low"}
                    </strong>
                  </div>
                </div>

                {/* MOISTURE ACTION */}

                {priorityPerformance?.limitingFactor?.key === "moisture" &&
                  Number(
                    farmState?.plots?.find(
                      (item) => item.id === priorityPlot.plotId,
                    )?.moisture ?? 0,
                  ) < 60 && (
                    <button
                      type="button"
                      onClick={() => irrigatePlot(priorityPlot.plotId)}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        border: "1px solid rgba(96,165,250,0.28)",
                        borderRadius: "9px",
                        padding: "9px 10px",
                        background: "rgba(37,99,235,0.18)",
                        color: "#bfdbfe",
                        fontSize: "10px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      💧 Irrigate Priority Plot {priorityPlot.plotId}
                    </button>
                  )}
              </div>
            )}
            {smartAction && (
              <div
                style={{
                  marginTop: "13px",
                  padding: "12px",
                  borderRadius: "11px",
                  background: "rgba(74,222,128,0.055)",
                  border: "1px solid rgba(74,222,128,0.12)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    opacity: 0.65,
                    marginBottom: "9px",
                  }}
                >
                  🤖 SMART ACTION
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(74,222,128,0.10)",
                      fontSize: "17px",
                    }}
                  >
                    {smartAction.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      {smartAction.title}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "10px",
                        lineHeight: 1.45,
                        opacity: 0.65,
                      }}
                    >
                      {smartAction.reason}
                    </div>
                  </div>
                </div>

                {smartAction.action === "irrigate" && (
                  <button
                    type="button"
                    onClick={() => irrigatePlot(smartAction.plotId)}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      border: "1px solid rgba(96,165,250,0.28)",
                      borderRadius: "9px",
                      padding: "8px 10px",
                      background: "rgba(37,99,235,0.18)",
                      color: "#bfdbfe",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    💧 Apply Irrigation
                  </button>
                )}
              </div>
            )}

            {/* =====================================================
    AI DECISION LOG
===================================================== */}

            {decisionLog.length > 0 && (
              <div
                style={{
                  marginTop: "13px",
                  padding: "11px",
                  borderRadius: "11px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      opacity: 0.65,
                    }}
                  >
                    🧠 AI DECISION LOG
                  </div>

                  <div
                    style={{
                      fontSize: "9px",
                      padding: "4px 7px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.055)",
                      opacity: 0.65,
                    }}
                  >
                    EXPLAINABLE
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {decisionLog.map((decision, index) => (
                    <div
                      key={`${decision.label}-${index}`}
                      style={{
                        padding: "9px",
                        borderRadius: "9px",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.045)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "15px",
                          }}
                        >
                          {decision.icon}
                        </span>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {decision.label}
                        </span>

                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "10px",
                            fontWeight: 700,
                            opacity: 0.7,
                          }}
                        >
                          {decision.value}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "10px",
                          lineHeight: 1.45,
                          opacity: 0.65,
                        }}
                      >
                        <strong
                          style={{
                            opacity: 0.9,
                          }}
                        >
                          Why:
                        </strong>{" "}
                        {decision.reason}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "10px",
                          lineHeight: 1.45,
                        }}
                      >
                        <strong>Decision:</strong> {decision.decision}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >
              <Link
                to="/farm"
                style={{
                  textDecoration: "none",
                  color: "#062014",
                  background: "#4ade80",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                🌾 Inspect Farm
              </Link>

              <Link
                to="/disease"
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                🦠 Disease AI
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            FARM PERFORMANCE
        ================================================= */}

        {performance && (
          <section
            style={{
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: "14px",
                  }}
                >
                  📊 Farm Performance
                </strong>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "10px",
                    opacity: 0.55,
                  }}
                >
                  Combined Digital Twin performance indicator
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {performanceStatus.icon}
                {performance.status}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(180px, 1fr) repeat(3, minmax(100px, 0.45fr))",
                gap: "18px",
                alignItems: "center",
                marginTop: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    marginBottom: "7px",
                  }}
                >
                  <span
                    style={{
                      opacity: 0.65,
                    }}
                  >
                    Overall Performance
                  </span>

                  <strong>{performance.score}/100</strong>
                </div>

                <ScoreBar score={performance.score} height={8} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.55,
                  }}
                >
                  🌱 Growth
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "15px",
                  }}
                >
                  {performance.growthProgress}%
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.55,
                  }}
                >
                  🌾 Yield Potential
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "15px",
                  }}
                >
                  {performance.yieldPotential}
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.55,
                  }}
                >
                  ⚠️ Limiting Factor
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "12px",
                  }}
                >
                  {performance.limitingFactor?.label || "None"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            PLOT STATUS
        ================================================= */}

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              gap: "10px",
            }}
          >
            <div>
              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                🌾 Plot Intelligence
              </strong>

              <div
                style={{
                  fontSize: "10px",
                  opacity: 0.5,
                  marginTop: "3px",
                }}
              >
                Live status of every Digital Twin plot
              </div>
            </div>

            <Link
              to="/farm"
              style={{
                color: "#86efac",
                textDecoration: "none",
                fontSize: "10px",
              }}
            >
              Open 3D Farm →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            {dashboardPlots.map((plot) => {
              const status = getStatusStyle(plot.status);

              const source = plot.sourcePlot;

              const plotPerformance = plot.plotPerformance;

              const disease = getDiseaseStyle(source?.diseaseRisk);

              const growth = Number(
                source?.growth ?? plotPerformance?.readings?.growth ?? 0,
              );

              const moisture = Number(
                source?.moisture ?? plotPerformance?.readings?.moisture ?? 0,
              );

              const canIrrigate =
                plotPerformance?.limitingFactor?.key === "moisture" &&
                moisture < 60;

              return (
                <article
                  key={plot.plotId}
                  style={{
                    padding: "15px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${status.border}`,
                  }}
                >
                  {/* PLOT HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: "15px",
                        }}
                      >
                        🌾 Plot {plot.plotId}
                      </strong>

                      <div
                        style={{
                          fontSize: "10px",
                          opacity: 0.5,
                          marginTop: "2px",
                          textTransform: "capitalize",
                        }}
                      >
                        {plot.crop || source?.crop || "Crop"}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "5px 8px",
                        borderRadius: "999px",
                        background: status.background,
                        fontSize: "10px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status.icon} {plot.status}
                    </span>
                  </div>

                  {/* SCORES */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "9px",
                      marginTop: "14px",
                    }}
                  >
                    <div
                      style={{
                        padding: "9px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.045)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          opacity: 0.52,
                        }}
                      >
                        ❤️ Health
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontSize: "17px",
                        }}
                      >
                        {plot.score}
                        <span
                          style={{
                            fontSize: "10px",
                            opacity: 0.45,
                          }}
                        >
                          /100
                        </span>
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "9px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.045)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          opacity: 0.52,
                        }}
                      >
                        📈 Performance
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontSize: "17px",
                          color: getPerformanceColor(
                            plotPerformance?.score ?? 0,
                          ),
                        }}
                      >
                        {plotPerformance?.score ?? "--"}
                        <span
                          style={{
                            fontSize: "10px",
                            opacity: 0.45,
                            color: "#ffffff",
                          }}
                        >
                          /100
                        </span>
                      </strong>
                    </div>
                  </div>

                  {/* GROWTH */}

                  <div
                    style={{
                      marginTop: "13px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      <span
                        style={{
                          opacity: 0.58,
                        }}
                      >
                        🌱 Growth
                      </span>

                      <strong>{Math.round(growth)}%</strong>
                    </div>

                    <ScoreBar score={growth} height={5} />
                  </div>

                  {/* MOISTURE + DISEASE */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginTop: "11px",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "9px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          opacity: 0.5,
                        }}
                      >
                        💧 Moisture
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "3px",
                          fontSize: "12px",
                        }}
                      >
                        {Math.round(moisture)}%
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "9px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          opacity: 0.5,
                        }}
                      >
                        🦠 Disease
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "3px",
                          fontSize: "12px",
                        }}
                      >
                        {disease.icon} {disease.text}
                      </strong>
                    </div>
                  </div>

                  {/* LIMITING FACTOR */}

                  {plotPerformance?.limitingFactor && (
                    <div
                      style={{
                        marginTop: "11px",
                        fontSize: "10px",
                        padding: "8px 9px",
                        borderRadius: "9px",
                        background: "rgba(255,255,255,0.045)",
                      }}
                    >
                      ⚠️{" "}
                      <span
                        style={{
                          opacity: 0.6,
                        }}
                      >
                        Main constraint:
                      </span>{" "}
                      <strong>{plotPerformance.limitingFactor.label}</strong>
                    </div>
                  )}

                  {/* AI ACTION */}

                  <div
                    style={{
                      marginTop: "11px",
                      paddingTop: "10px",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        lineHeight: 1.5,
                        opacity: 0.7,
                      }}
                    >
                      🤖 {getPlotAction(plotPerformance, plot)}
                    </div>

                    {canIrrigate && (
                      <button
                        type="button"
                        onClick={() => irrigatePlot(plot.plotId)}
                        style={{
                          width: "100%",
                          marginTop: "9px",
                          border: "1px solid rgba(96,165,250,0.28)",
                          borderRadius: "9px",
                          padding: "9px 10px",
                          background: "rgba(37,99,235,0.18)",
                          color: "#bfdbfe",
                          fontSize: "10px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        💧 Irrigate Plot {plot.plotId}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section
          style={{
            marginTop: "18px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <strong
            style={{
              fontSize: "14px",
            }}
          >
            ⚡ Quick AI Tools
          </strong>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "9px",
              marginTop: "12px",
            }}
          >
            <Link to="/weather" style={quickActionStyle}>
              🌦️
              <span>Weather</span>
            </Link>

            <Link to="/crop" style={quickActionStyle}>
              🌱
              <span>Crop AI</span>
            </Link>

            <Link to="/disease" style={quickActionStyle}>
              🦠
              <span>Disease AI</span>
            </Link>

            <Link to="/soil" style={quickActionStyle}>
              🧪
              <span>Soil Test</span>
            </Link>

            <Link to="/farm" style={quickActionStyle}>
              🌾
              <span>3D Farm</span>
            </Link>
          </div>
        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div
          style={{
            textAlign: "center",
            marginTop: "22px",
            paddingBottom: "8px",
            fontSize: "9px",
            opacity: 0.35,
          }}
        >
          KrishiMitra AI • Digital Twin Farm Intelligence
        </div>
      </div>

      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>
        {`
          @media (max-width: 760px) {
            .krishi-dashboard-placeholder {
              display: block;
            }
          }

          @media (max-width: 700px) {
            body {
              overflow-x: hidden;
            }
          }

          @media (max-width: 820px) {
            .farm-dashboard-weather-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// =====================================================
// QUICK ACTION STYLE
// =====================================================

const quickActionStyle = {
  textDecoration: "none",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  padding: "11px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.07)",
  fontSize: "10px",
  fontWeight: 700,
};

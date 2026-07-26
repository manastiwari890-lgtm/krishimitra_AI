import { useMemo } from "react";

// =====================================================
// KRISHIMITRA AI
// ADAPTIVE 3D FARM QUALITY SYSTEM
// =====================================================
//
// Detects approximate device capability.
//
// QUALITY LEVELS:
//
// performance
// balanced
// high
//
// Later this controls:
// - DPR
// - shadows
// - clouds
// - rain particle count
// - irrigation effects
// - environmental detail
//
// =====================================================

export default function useFarmQuality() {
  const quality = useMemo(() => {
    if (typeof window === "undefined") {
      return "balanced";
    }

    // -----------------------------------------------
    // DEVICE INFORMATION
    // -----------------------------------------------

    const pixelRatio =
      window.devicePixelRatio || 1;

    const cpuCores =
      navigator.hardwareConcurrency || 4;

    const memory =
      navigator.deviceMemory || 4;

    const width =
      window.innerWidth;

    // -----------------------------------------------
    // MOBILE / SMALL SCREEN
    // -----------------------------------------------

    const smallScreen =
      width <= 768;

    // -----------------------------------------------
    // LOW POWER DEVICE
    // -----------------------------------------------

    if (
      cpuCores <= 4 ||
      memory <= 4 ||
      (smallScreen && pixelRatio >= 2.5)
    ) {
      return "performance";
    }

    // -----------------------------------------------
    // HIGH CAPABILITY DEVICE
    // -----------------------------------------------

    if (
      cpuCores >= 8 &&
      memory >= 8 &&
      !smallScreen
    ) {
      return "high";
    }

    // -----------------------------------------------
    // DEFAULT
    // -----------------------------------------------

    return "balanced";
  }, []);

  // =================================================
  // QUALITY CONFIGURATION
  // =================================================

  const settings = useMemo(() => {
    if (quality === "performance") {
      return {
        level: "performance",

        dpr: 1,

        shadows: false,

        shadowMapSize: 512,

        rainParticles: 300,

        cloudCount: 3,

        irrigationQuality: "low",
      };
    }

    if (quality === "high") {
      return {
        level: "high",

        dpr: 1.5,

        shadows: true,

        shadowMapSize: 1024,

        rainParticles: 1200,

        cloudCount: 7,

        irrigationQuality: "high",
      };
    }

    return {
      level: "balanced",

      dpr: 1.25,

      shadows: true,

      shadowMapSize: 768,

      rainParticles: 650,

      cloudCount: 5,

      irrigationQuality: "medium",
    };
  }, [quality]);

  return settings;
}
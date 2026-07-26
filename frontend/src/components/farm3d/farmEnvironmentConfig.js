// =====================================================
// KRISHIMITRA AI
// SHARED 3D FARM ENVIRONMENT CONFIGURATION
// =====================================================
//
// This file is the single source of truth for:
//
// - Cloud positions
// - Cloud scale
// - Cloud movement speed
// - Which clouds can produce rain
// - Rain coverage underneath clouds
//
// FarmClouds and FarmRain will BOTH use this data.
// =====================================================

export const FARM_CLOUDS = [
  {
    id: "cloud-1",

    position: [-10, 9, -5],

    scale: 1.15,

    speed: 0.11,

    rainCloud: true,

    rainRadius: 3.2,
  },

  {
    id: "cloud-2",

    position: [-4, 11, 2],

    scale: 1.4,

    speed: 0.08,

    rainCloud: false,

    rainRadius: 0,
  },

  {
    id: "cloud-3",

    position: [3, 9.5, -3],

    scale: 1,

    speed: 0.13,

    rainCloud: true,

    rainRadius: 2.8,
  },

  {
    id: "cloud-4",

    position: [9, 10.5, 4],

    scale: 1.25,

    speed: 0.09,

    rainCloud: true,

    rainRadius: 3.4,
  },

  {
    id: "cloud-5",

    position: [-8, 8.5, 7],

    scale: 0.9,

    speed: 0.14,

    rainCloud: false,

    rainRadius: 0,
  },

  {
    id: "cloud-6",

    position: [5, 12, 8],

    scale: 1.45,

    speed: 0.07,

    rainCloud: false,

    rainRadius: 0,
  },

  {
    id: "cloud-7",

    position: [12, 9, -7],

    scale: 1.05,

    speed: 0.12,

    rainCloud: true,

    rainRadius: 3,
  },
];


// =====================================================
// CLOUD MOVEMENT BOUNDARIES
// =====================================================

export const CLOUD_MIN_X = -22;

export const CLOUD_MAX_X = 22;


// =====================================================
// RAIN SETTINGS
// =====================================================

export const FARM_RAIN_SETTINGS = {
  bottomHeight: 0.25,

  fallSpeed: 10,

  windAngle: -0.08,
};
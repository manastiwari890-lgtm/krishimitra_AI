import * as THREE from "three";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";

import FarmTerrain from "./FarmTerrain";
import FarmFields from "./FarmFields";
import CropField from "./CropField";
import FarmVegetation from "./FarmVegetation";
import FarmGroundDetails from "./FarmGroundDetails";
import useFarmQuality from "./useFarmQuality";
import FarmClouds from "./FarmClouds";
import FarmRain from "./FarmRain";
import SmartIrrigation from "./SmartIrrigation";

import { useFarmState } from "../../farm/hooks/useFarmState";
import { useFarmController } from "../../farm/controller/useFarmController";
import FarmHealthPanel from "./FarmHealthPanel";

// =====================================================
// KRISHIMITRA AI
// SMART FARM - MOBILE PERFORMANCE V1
// =====================================================
//
// IMPORTANT:
//
// Desktop graphics are preserved.
//
// Mobile receives:
// - Lower DPR
// - Reduced shadow cost
// - Lower rendering resolution
// - Less expensive antialiasing
//
// Farm geometry and visual structure remain unchanged.
// =====================================================


// =====================================================
// FARM WORLD
// =====================================================

function FarmWorld({
  quality,
  rainEnabled,
  isMobile,
}) {
  return (
    <>
      {/* =================================================
          AMBIENT LIGHT
      ================================================= */}

      <ambientLight
        intensity={0.55}
      />

      {/* =================================================
          HEMISPHERE LIGHT
      ================================================= */}

      <hemisphereLight
        skyColor="#bde5ff"
        groundColor="#66503b"
        intensity={0.8}
      />

      {/* =================================================
          DIRECTIONAL LIGHT
      ================================================= */}

      <directionalLight
        position={[12, 18, 10]}
        intensity={2}

        // Desktop keeps existing shadow behaviour.
        // Mobile disables shadows for performance.
        castShadow={
          isMobile
            ? false
            : quality.shadows
        }

        shadow-mapSize-width={
          isMobile
            ? 512
            : quality.shadowMapSize
        }

        shadow-mapSize-height={
          isMobile
            ? 512
            : quality.shadowMapSize
        }

        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={45}

        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* =================================================
          SKY
      ================================================= */}

      <Sky
        distance={450000}
        sunPosition={[8, 12, 5]}
        turbidity={7}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* =================================================
          CLOUDS
      ================================================= */}

      <FarmClouds
        quality={quality}
        rainEnabled={rainEnabled}
      />

      {/* =================================================
          RAIN
      ================================================= */}

      {rainEnabled && (
        <FarmRain />
      )}

      {/* =================================================
          FARM TERRAIN
      ================================================= */}

      <FarmTerrain />

      {/* =================================================
          FARM FIELDS
      ================================================= */}

      <FarmFields />

      {/* =================================================
          VEGETATION
      ================================================= */}

      <FarmVegetation />

      {/* =================================================
          GROUND DETAILS
      ================================================= */}

      <FarmGroundDetails />

      {/* =================================================
          CROP FIELDS
      ================================================= */}

      <CropField
        plotId="A"
        position={[-4.2, 0, -3.7]}
      />

      <CropField
        plotId="B"
        position={[4.2, 0, -3.7]}
      />

      <CropField
        plotId="C"
        position={[-4.2, 0, 3.7]}
      />

      <CropField
        plotId="D"
        position={[4.2, 0, 3.7]}
      />

      {/* =================================================
          CAMERA CONTROLS
      ================================================= */}

      <OrbitControls
        makeDefault

        enableDamping={false}

        enablePan
        enableRotate
        enableZoom

        rotateSpeed={
          isMobile
            ? 0.35
            : 0.5
        }

        minDistance={6}
        maxDistance={38}

        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.08}

        target={[0, 0, 0]}
      />
    </>
  );
}


// =====================================================
// LOADING SCREEN
// =====================================================

function FarmLoadingScreen() {
  return null;
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Farm3DScene() {

  // ===================================================
  // FARM QUALITY
  // ===================================================

  const quality =
    useFarmQuality();

  // ===================================================
  // FARM STATE
  // ===================================================

  const {
    farmState,
  } = useFarmState();

  // ===================================================
  // CONTROLLER
  // ===================================================

  const controller =
    useFarmController();

  // ===================================================
  // RAIN
  // ===================================================

  const rainEnabled =
    farmState.weather.isRaining;

  // ===================================================
  // MOBILE DETECTION
  // ===================================================

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  // ===================================================
  // DETECT DEVICE
  // ===================================================

  useEffect(() => {

    const checkMobile =
      () => {

        setIsMobile(
          window.innerWidth <= 768
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
  // MOBILE RENDER SETTINGS
  // ===================================================

  const canvasDpr =
    isMobile
      ? Math.min(
          quality.dpr,
          1
        )
      : (
          rainEnabled
            ? Math.min(
                quality.dpr,
                1.25
              )
            : quality.dpr
        );

  const canvasShadows =
    isMobile
      ? false
      : quality.shadows;

  // ===================================================
  // CONTAINER
  // ===================================================

  return (

    <div
      style={{

        width:
          "100%",

        height:
          "650px",

        position:
          "relative",

        borderRadius:
          "24px",

        overflow:
          "hidden",

        background:
          "linear-gradient(180deg, #9ed7f5 0%, #dcefc7 100%)",

        boxShadow:
          "0 24px 70px rgba(0, 0, 0, 0.22)",

      }}
    >

      {/* =================================================
          THREE.JS CANVAS
      ================================================= */}

      <Canvas

        // Desktop retains existing behaviour.
        // Mobile disables expensive shadows.
        shadows={
          canvasShadows
        }

        // =================================================
        // FRAMELOOP
        // =================================================
        //
        // Static farm:
        // demand rendering.
        //
        // Rain:
        // continuous rendering.
        //
        // This keeps the normal farm inexpensive.
        // =================================================

        frameloop={
          rainEnabled
            ? "always"
            : "demand"
        }

        // =================================================
        // CAMERA
        // =================================================

        camera={{
          position: [
            13,
            10,
            15,
          ],

          fov:
            42,

          near:
            0.1,

          far:
            150,
        }}

        // =================================================
        // DEVICE PIXEL RATIO
        // =================================================

        dpr={
          canvasDpr
        }

        // =================================================
        // WEBGL
        // =================================================

        gl={{

          // Mobile:
          // disable antialiasing.
          //
          // Desktop:
          // preserve existing antialiasing.
          antialias:
            !isMobile,

          alpha:
            false,

          powerPreference:
            "high-performance",

          toneMapping:
            THREE.ACESFilmicToneMapping,

          toneMappingExposure:
            1.05,

          outputColorSpace:
            THREE.SRGBColorSpace,

        }}

        // =================================================
        // THREE INITIALIZATION
        // =================================================

        onCreated={({
          gl,
          scene,
        }) => {

          // ===============================================
          // SHADOWS
          // ===============================================

          gl.shadowMap.enabled =
            canvasShadows;

          gl.shadowMap.type =
            THREE.PCFShadowMap;

          // ===============================================
          // FOG
          // ===============================================

          scene.fog =
            new THREE.FogExp2(
              "#b8d8a8",
              0.012
            );

        }}

      >

        <Suspense
          fallback={
            <FarmLoadingScreen />
          }
        >

          <FarmWorld
            quality={quality}
            rainEnabled={
              rainEnabled
            }
            isMobile={
              isMobile
            }
          />

        </Suspense>

      </Canvas>


      {/* =================================================
          SMART IRRIGATION
      ================================================= */}

      <SmartIrrigation />
      <FarmHealthPanel />


      {/* =================================================
          WEATHER CONTROLS
      ================================================= */}

      <div
        style={{

          position:
            "absolute",

          top:
            "18px",

          right:
            "18px",

          zIndex:
            25,

          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "flex-end",

          gap:
            "8px",

        }}
      >

        {/* =================================================
            RAIN BUTTON
        ================================================= */}

        <button
          type="button"

          onClick={() => {

            if (
              rainEnabled
            ) {

              controller.stopRain();

            } else {

              controller.startRain();

            }

          }}

          style={{

            border:
              rainEnabled

                ? "1px solid rgba(147, 197, 253, 0.65)"

                : "1px solid rgba(255,255,255,0.16)",

            background:
              rainEnabled

                ? "rgba(30, 64, 175, 0.82)"

                : "rgba(7, 26, 18, 0.78)",

            color:
              "#ffffff",

            padding:
              "11px 16px",

            borderRadius:
              "14px",

            backdropFilter:
              "blur(12px)",

            cursor:
              "pointer",

            fontSize:
              "13px",

            fontWeight:
              "700",

            boxShadow:
              "0 8px 24px rgba(0,0,0,0.18)",

          }}
        >

          {rainEnabled
            ? "🌧 Stop Rain Simulation"
            : "🌧 Simulate Rain"}

        </button>


        {/* =================================================
            WEATHER STATUS
        ================================================= */}

        <div
          style={{

            padding:
              "6px 10px",

            borderRadius:
              "10px",

            background:
              "rgba(7, 26, 18, 0.68)",

            color:
              "rgba(255,255,255,0.82)",

            backdropFilter:
              "blur(10px)",

            fontSize:
              "11px",

            fontWeight:
              "600",

            pointerEvents:
              "none",

          }}
        >

          {rainEnabled
            ? "Simulation active"
            : "Manual weather preview"}

        </div>

      </div>


      {/* =================================================
          BOTTOM INSTRUCTION
      ================================================= */}

      <div
        style={{

          position:
            "absolute",

          left:
            "18px",

          bottom:
            "18px",

          padding:
            "10px 14px",

          borderRadius:
            "14px",

          background:
            "rgba(7, 26, 18, 0.72)",

          backdropFilter:
            "blur(10px)",

          color:
            "#ffffff",

          fontSize:
            "13px",

          fontWeight:
            "600",

          pointerEvents:
            "none",

          border:
            "1px solid rgba(255,255,255,0.12)",

        }}
      >

        🌾 Drag to explore • Scroll to zoom

      </div>

    </div>
  );
}
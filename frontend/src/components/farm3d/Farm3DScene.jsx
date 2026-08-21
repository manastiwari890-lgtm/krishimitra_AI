import * as THREE from "three";
import { Suspense } from "react";
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

// =====================================================
// KRISHIMITRA AI
// SMART FARM - IRRIGATION V1
// =====================================================

function FarmWorld({ quality, rainEnabled }) {
  return (
    <>
      <ambientLight intensity={0.55} />

      <hemisphereLight
        skyColor="#bde5ff"
        groundColor="#66503b"
        intensity={0.8}
      />

      <directionalLight
        position={[12, 18, 10]}
        intensity={2}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      <Sky
        distance={450000}
        sunPosition={[8, 12, 5]}
        turbidity={7}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Keep one cloud layer only. */}
      <FarmClouds
        quality={quality}
        rainEnabled={rainEnabled}
      />

      {rainEnabled && <FarmRain />}

      <FarmTerrain />

      <FarmFields />

      <FarmVegetation />

      <FarmGroundDetails />

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

      <OrbitControls
        makeDefault
        enableDamping={false}
        enablePan
        enableRotate
        enableZoom
        rotateSpeed={0.5}
        minDistance={6}
        maxDistance={38}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0, 0]}
      />
    </>
  );
}

function FarmLoadingScreen() {
  return null;
}

export default function Farm3DScene() {
  const quality = useFarmQuality();
  const { farmState } = useFarmState();
  const controller = useFarmController();

  const rainEnabled = farmState.weather.isRaining;

  return (
    <div
      style={{
        width: "100%",
        height: "650px",
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #9ed7f5 0%, #dcefc7 100%)",
        boxShadow:
          "0 24px 70px rgba(0, 0, 0, 0.22)",
      }}
    >
      <Canvas
        shadows={quality.shadows}
        frameloop={
          rainEnabled
            ? "always"
            : "demand"
        }
        camera={{
          position: [13, 10, 15],
          fov: 42,
          near: 0.1,
          far: 150,
        }}
        dpr={
          rainEnabled
            ? Math.min(quality.dpr, 1.25)
            : quality.dpr
        }
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping:
            THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace:
            THREE.SRGBColorSpace,
        }}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type =
            THREE.PCFShadowMap;

          scene.fog = new THREE.FogExp2(
            "#b8d8a8",
            0.012
          );
        }}
      >
        <Suspense fallback={<FarmLoadingScreen />}>
          <FarmWorld
            quality={quality}
            rainEnabled={rainEnabled}
          />
        </Suspense>
      </Canvas>

      {/* New smart irrigation dashboard. */}
      <SmartIrrigation />

      {/* Existing weather controls. */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          right: "18px",
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (rainEnabled) {
              controller.stopRain();
            } else {
              controller.startRain();
            }
          }}
          style={{
            border: rainEnabled
              ? "1px solid rgba(147, 197, 253, 0.65)"
              : "1px solid rgba(255,255,255,0.16)",
            background: rainEnabled
              ? "rgba(30, 64, 175, 0.82)"
              : "rgba(7, 26, 18, 0.78)",
            color: "#ffffff",
            padding: "11px 16px",
            borderRadius: "14px",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          {rainEnabled
            ? "🌧 Stop Rain Simulation"
            : "🌧 Simulate Rain"}
        </button>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: "10px",
            background:
              "rgba(7, 26, 18, 0.68)",
            color:
              "rgba(255,255,255,0.82)",
            backdropFilter: "blur(10px)",
            fontSize: "11px",
            fontWeight: "600",
            pointerEvents: "none",
          }}
        >
          {rainEnabled
            ? "Simulation active"
            : "Manual weather preview"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "18px",
          bottom: "18px",
          padding: "10px 14px",
          borderRadius: "14px",
          background:
            "rgba(7, 26, 18, 0.72)",
          backdropFilter: "blur(10px)",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: "600",
          pointerEvents: "none",
          border:
            "1px solid rgba(255,255,255,0.12)",
        }}
      >
        🌾 Drag to explore • Scroll to zoom
      </div>
    </div>
  );
}
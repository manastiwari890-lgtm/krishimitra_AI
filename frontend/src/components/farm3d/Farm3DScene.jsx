import * as THREE from "three";

import {
  Suspense,
} from "react";

import {
  Canvas,
} from "@react-three/fiber";

import {
  OrbitControls,
  Sky,
  Environment,
  ContactShadows,
} from "@react-three/drei";

import FarmTerrain from "./FarmTerrain";
import FarmFields from "./FarmFields";
import CropField from "./CropField";
import FarmVegetation from "./FarmVegetation";
import FarmGroundDetails from "./FarmGroundDetails";


// =====================================================
// KRISHIMITRA AI
// 3D SMART FARM
// MAIN SCENE
// =====================================================
//
// CURRENT 3D SYSTEM:
//
// 1. Natural terrain
// 2. Cultivated farm fields
// 3. Raised soil beds
// 4. Farm paths
// 5. Irrigation channels
// 6. Crop rendering
// 7. Natural vegetation
// 8. Ground/environment details
// 9. Environmental lighting
// 10. Camera controls
//
// Existing functionality is preserved.
// =====================================================


// =====================================================
// FARM WORLD
// =====================================================

function FarmWorld() {
  return (
    <>

      {/* ===============================================
          AMBIENT LIGHT
      =============================================== */}

      <ambientLight
        intensity={0.45}
      />


      {/* ===============================================
          NATURAL SKY / GROUND LIGHT
      =============================================== */}

      <hemisphereLight
        skyColor="#bde5ff"
        groundColor="#66503b"
        intensity={0.75}
      />


      {/* ===============================================
          SUNLIGHT
      =============================================== */}

      <directionalLight
        position={[
          12,
          18,
          10,
        ]}
        intensity={2.2}
        castShadow

        shadow-mapSize-width={
          2048
        }

        shadow-mapSize-height={
          2048
        }

        shadow-camera-left={
          -25
        }

        shadow-camera-right={
          25
        }

        shadow-camera-top={
          25
        }

        shadow-camera-bottom={
          -25
        }

        shadow-camera-near={
          0.5
        }

        shadow-camera-far={
          60
        }

        shadow-bias={
          -0.0002
        }
      />


      {/* ===============================================
          NATURAL SKY
      =============================================== */}

      <Sky
        distance={
          450000
        }

        sunPosition={[
          8,
          12,
          5,
        ]}

        turbidity={
          7
        }

        rayleigh={
          2
        }

        mieCoefficient={
          0.005
        }

        mieDirectionalG={
          0.8
        }
      />


      {/* ===============================================
          NATURAL FARM TERRAIN
      =============================================== */}

      <FarmTerrain />


      {/* ===============================================
          CULTIVATED FARM FIELD SYSTEM
      =============================================== */}

      <FarmFields />


      {/* ===============================================
          NATURAL ENVIRONMENTAL VEGETATION
      =============================================== */}

      <FarmVegetation />


      {/* ===============================================
          NATURAL GROUND DETAILS
      =============================================== */}

      <FarmGroundDetails />


      {/* ===============================================
          CROP FIELD 1
          HEALTHY
      =============================================== */}

      <CropField
        position={[
          -4.2,
          0,
          -3.7,
        ]}
        health="healthy"
        growth={0.9}
      />


      {/* ===============================================
          CROP FIELD 2
          HEALTHY
      =============================================== */}

      <CropField
        position={[
          4.2,
          0,
          -3.7,
        ]}
        health="healthy"
        growth={1}
      />


      {/* ===============================================
          CROP FIELD 3
          WARNING EXAMPLE
      =============================================== */}

      <CropField
        position={[
          -4.2,
          0,
          3.7,
        ]}
        health="warning"
        growth={0.82}
      />


      {/* ===============================================
          CROP FIELD 4
          HEALTHY
      =============================================== */}

      <CropField
        position={[
          4.2,
          0,
          3.7,
        ]}
        health="healthy"
        growth={0.95}
      />


      {/* ===============================================
          SOFT CONTACT SHADOW
      =============================================== */}

      <ContactShadows
        position={[
          0,
          0.01,
          0,
        ]}
        opacity={0.28}
        scale={35}
        blur={2.8}
        far={15}
      />


      {/* ===============================================
          CAMERA CONTROLS
      =============================================== */}

      <OrbitControls
        makeDefault

        enableDamping
        dampingFactor={0.06}

        enablePan
        enableRotate
        enableZoom

        minDistance={6}
        maxDistance={38}

        minPolarAngle={0.35}

        maxPolarAngle={
          Math.PI / 2.08
        }

        target={[
          0,
          0,
          0,
        ]}
      />

    </>
  );
}


// =====================================================
// LOADING FALLBACK
// =====================================================

function FarmLoadingScreen() {
  return null;
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Farm3DScene() {
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

      {/* =============================================
          THREE.JS CANVAS
      ============================================= */}

      <Canvas
        shadows

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
            1000,
        }}

        dpr={[
          1,
          2,
        ]}

        gl={{
          antialias:
            true,

          alpha:
            false,

          toneMapping:
            THREE.ACESFilmicToneMapping,

          toneMappingExposure:
            1.05,

          outputColorSpace:
            THREE.SRGBColorSpace,
        }}

        onCreated={({
          gl,
          scene,
        }) => {

          gl.shadowMap.enabled =
            true;

          gl.shadowMap.type =
            THREE.PCFSoftShadowMap;

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

          {/* ===========================================
              FARM WORLD
          =========================================== */}

          <FarmWorld />


          {/* ===========================================
              NATURAL ENVIRONMENT
          =========================================== */}

          <Environment
            preset="park"
            environmentIntensity={
              0.35
            }
          />

        </Suspense>

      </Canvas>


      {/* =============================================
          CAMERA HELP LABEL
      ============================================= */}

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
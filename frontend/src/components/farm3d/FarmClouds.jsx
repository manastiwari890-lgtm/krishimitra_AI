import * as THREE from "three";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";

import {
  FARM_CLOUDS,
  CLOUD_MIN_X,
  CLOUD_MAX_X,
  FARM_RAIN_SETTINGS,
} from "./farmEnvironmentConfig";


// =====================================================
// KRISHIMITRA AI
// CLOUD + CONTINUOUS LOCALIZED RAIN SYSTEM
// =====================================================
//
// FEATURES:
//
// - Moving lightweight clouds
// - Rain only from selected rain clouds
// - Rain follows moving cloud
// - Individual raindrop recycling
// - No whole rain-layer teleport
// - GPU InstancedMesh
// - Adaptive drop count
// - Darker rain clouds
//
// =====================================================


// =====================================================
// LOCALIZED CONTINUOUS CLOUD RAIN
// =====================================================

function CloudRain({
  radius = 3,
  cloudHeight = 9,
  quality,
}) {
  const rainRef = useRef(null);


  // ===================================================
  // ADAPTIVE DROP COUNT
  // ===================================================

  const dropCount =
    quality?.level === "performance"
      ? 40
      : quality?.level === "high"
        ? 85
        : 60;


  // ===================================================
  // DROP GEOMETRY
  // ===================================================

  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        0.022,
        0.55,
        0.022,
      ),
    [],
  );


  // ===================================================
  // DROP MATERIAL
  // ===================================================

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#9ed7f0",

        transparent: true,

        opacity: 0.72,

        depthWrite: false,

        depthTest: true,

        toneMapped: false,
      }),
    [],
  );


  // ===================================================
  // DROP DATA
  // ===================================================

  const drops = useMemo(() => {
    const result = [];


    for (
      let index = 0;
      index < dropCount;
      index += 1
    ) {

      // -----------------------------------------------
      // RANDOM POSITION BELOW CLOUD
      // -----------------------------------------------

      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        Math.sqrt(
          Math.random(),
        ) *
        radius;


      const x =
        Math.cos(angle) *
        distance;


      const z =
        Math.sin(angle) *
        distance;


      // -----------------------------------------------
      // IMPORTANT
      //
      // Drops begin throughout the complete distance
      // between cloud and ground.
      //
      // This means rain is already continuous when
      // simulation starts.
      // -----------------------------------------------

      const y =
        -Math.random() *
        cloudHeight;


      // -----------------------------------------------
      // NATURAL SPEED VARIATION
      // -----------------------------------------------

      const speed =
        THREE.MathUtils.randFloat(
          7,
          10,
        );


      // -----------------------------------------------
      // NATURAL LENGTH VARIATION
      // -----------------------------------------------

      const length =
        THREE.MathUtils.randFloat(
          0.7,
          1.25,
        );


      result.push({
        x,
        y,
        z,
        speed,
        length,
      });
    }


    return result;

  }, [
    dropCount,
    radius,
    cloudHeight,
  ]);


  // ===================================================
  // REUSABLE TEMP OBJECT
  // ===================================================

  const dummy = useMemo(
    () =>
      new THREE.Object3D(),
    [],
  );


  // ===================================================
  // INITIALIZE INSTANCE MATRICES
  // ===================================================

  useLayoutEffect(() => {
    const mesh =
      rainRef.current;


    if (!mesh) {
      return;
    }


    for (
      let index = 0;
      index < drops.length;
      index += 1
    ) {
      const drop =
        drops[index];


      // -----------------------------------------------
      // POSITION
      // -----------------------------------------------

      dummy.position.set(
        drop.x,
        drop.y,
        drop.z,
      );


      // -----------------------------------------------
      // WIND ANGLE
      // -----------------------------------------------

      dummy.rotation.set(
        0,
        0,
        FARM_RAIN_SETTINGS.windAngle,
      );


      // -----------------------------------------------
      // DROP SCALE
      // -----------------------------------------------

      dummy.scale.set(
        1,
        drop.length,
        1,
      );


      dummy.updateMatrix();


      mesh.setMatrixAt(
        index,
        dummy.matrix,
      );
    }


    // ===============================================
    // DYNAMIC INSTANCE BUFFER
    // ===============================================

    mesh.instanceMatrix.setUsage(
      THREE.DynamicDrawUsage,
    );


    mesh.instanceMatrix.needsUpdate =
      true;

  }, [
    drops,
    dummy,
  ]);


  // ===================================================
  // CONTINUOUS RAIN ANIMATION
  // ===================================================

  useFrame(
    (_state, delta) => {
      const mesh =
        rainRef.current;


      if (!mesh) {
        return;
      }


      // ===============================================
      // DELTA PROTECTION
      // ===============================================
      //
      // Prevent giant rain jumps when:
      //
      // - browser freezes briefly
      // - tab becomes inactive
      // - FPS suddenly drops
      //
      // ===============================================

      const safeDelta =
        Math.min(
          delta,
          0.05,
        );


      // ===============================================
      // UPDATE EACH INSTANCE
      // ===============================================

      for (
        let index = 0;
        index < drops.length;
        index += 1
      ) {
        const drop =
          drops[index];


        // ---------------------------------------------
        // MOVE DROP DOWN
        // ---------------------------------------------

        drop.y -=
          drop.speed *
          safeDelta;


        // ---------------------------------------------
        // INDIVIDUAL DROP RESET
        // ---------------------------------------------
        //
        // IMPORTANT:
        //
        // We DO NOT reset the entire rain field.
        //
        // Only the drop that reaches the ground
        // returns underneath the cloud.
        //
        // ---------------------------------------------

        if (
          drop.y <
          -cloudHeight
        ) {

          // ===========================================
          // SPAWN DIRECTLY UNDER CLOUD
          // ===========================================

          drop.y =
            THREE.MathUtils.randFloat(
              -0.2,
              -0.8,
            );


          // ===========================================
          // NEW HORIZONTAL POSITION
          // ===========================================

          const angle =
            Math.random() *
            Math.PI *
            2;


          const distance =
            Math.sqrt(
              Math.random(),
            ) *
            radius;


          drop.x =
            Math.cos(angle) *
            distance;


          drop.z =
            Math.sin(angle) *
            distance;


          // ===========================================
          // SLIGHT SPEED VARIATION
          // ===========================================

          drop.speed =
            THREE.MathUtils.randFloat(
              7,
              10,
            );
        }


        // ---------------------------------------------
        // UPDATE INSTANCE MATRIX
        // ---------------------------------------------

        dummy.position.set(
          drop.x,
          drop.y,
          drop.z,
        );


        dummy.rotation.set(
          0,
          0,
          FARM_RAIN_SETTINGS.windAngle,
        );


        dummy.scale.set(
          1,
          drop.length,
          1,
        );


        dummy.updateMatrix();


        mesh.setMatrixAt(
          index,
          dummy.matrix,
        );
      }


      // ===============================================
      // SEND UPDATED MATRICES TO GPU
      // ===============================================

      mesh.instanceMatrix.needsUpdate =
        true;
    },
  );


  // ===================================================
  // RENDER RAIN
  // ===================================================

  return (
    <instancedMesh
      ref={rainRef}

      args={[
        geometry,
        material,
        dropCount,
      ]}

      castShadow={false}

      receiveShadow={false}

      frustumCulled={false}

      renderOrder={10}
    />
  );
}


// =====================================================
// SINGLE FARM CLOUD
// =====================================================

function FarmCloud({
  position,

  scale = 1,

  speed = 0.15,

  rainCloud = false,

  rainRadius = 3,

  rainEnabled = false,

  quality,
}) {
  const cloudRef =
    useRef(null);


  // ===================================================
  // CLOUD MATERIAL
  // ===================================================

  const material = useMemo(
    () =>
      new THREE.MeshLambertMaterial({

        // ---------------------------------------------
        // RAIN CLOUD
        // ---------------------------------------------

        color:
          rainEnabled &&
          rainCloud
            ? "#7f8b91"
            : "#d9e1e3",


        transparent: true,


        opacity:
          rainEnabled &&
          rainCloud
            ? 0.92
            : 0.82,


        depthWrite: false,
      }),

    [
      rainEnabled,
      rainCloud,
    ],
  );


  // ===================================================
  // CLOUD GEOMETRY
  // ===================================================

  const geometry = useMemo(
    () =>
      new THREE.SphereGeometry(
        1,
        8,
        6,
      ),
    [],
  );


  // ===================================================
  // CLOUD MOVEMENT
  // ===================================================

  useFrame(
    (_state, delta) => {
      const cloud =
        cloudRef.current;


      if (!cloud) {
        return;
      }


      cloud.position.x +=
        speed *
        delta;


      // ===============================================
      // CLOUD LOOP
      // ===============================================

      if (
        cloud.position.x >
        CLOUD_MAX_X
      ) {
        cloud.position.x =
          CLOUD_MIN_X;
      }
    },
  );


  // ===================================================
  // RENDER CLOUD
  // ===================================================

  return (
    <group
      ref={cloudRef}

      position={
        position
      }

      scale={[
        scale,
        scale,
        scale,
      ]}
    >

      {/* =============================================
          LEFT CLOUD PUFF
      ============================================= */}

      <mesh
        geometry={geometry}

        material={material}

        position={[
          -1.2,
          0,
          0,
        ]}

        scale={[
          1.4,
          0.75,
          0.9,
        ]}

        castShadow={false}

        receiveShadow={false}
      />


      {/* =============================================
          CENTER CLOUD PUFF
      ============================================= */}

      <mesh
        geometry={geometry}

        material={material}

        position={[
          0,
          0.3,
          0,
        ]}

        scale={[
          1.7,
          1,
          1.1,
        ]}

        castShadow={false}

        receiveShadow={false}
      />


      {/* =============================================
          RIGHT CLOUD PUFF
      ============================================= */}

      <mesh
        geometry={geometry}

        material={material}

        position={[
          1.25,
          0,
          0,
        ]}

        scale={[
          1.35,
          0.7,
          0.85,
        ]}

        castShadow={false}

        receiveShadow={false}
      />


      {/* =============================================
          LOWER CLOUD BODY
      ============================================= */}

      <mesh
        geometry={geometry}

        material={material}

        position={[
          0,
          -0.25,
          0,
        ]}

        scale={[
          2.15,
          0.55,
          0.95,
        ]}

        castShadow={false}

        receiveShadow={false}
      />


      {/* =============================================
          LOCALIZED CONTINUOUS RAIN
      ============================================= */}

      {rainEnabled &&
        rainCloud && (
          <CloudRain
            radius={
              rainRadius
            }

            cloudHeight={
              Math.max(
                4,
                position[1] -
                  0.5,
              )
            }

            quality={
              quality
            }
          />
        )}

    </group>
  );
}


// =====================================================
// MAIN CLOUD SYSTEM
// =====================================================

export default function FarmClouds({
  quality,

  rainEnabled = false,
}) {

  // ===================================================
  // ADAPTIVE CLOUD COUNT
  // ===================================================

  const cloudCount =
    quality?.cloudCount ??
    5;


  // ===================================================
  // SHARED CLOUD CONFIGURATION
  // ===================================================

  const clouds =
    useMemo(
      () =>
        FARM_CLOUDS.slice(
          0,
          cloudCount,
        ),

      [
        cloudCount,
      ],
    );


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>

      {clouds.map(
        (cloud) => (

          <FarmCloud
            key={
              cloud.id
            }

            position={
              cloud.position
            }

            scale={
              cloud.scale
            }

            speed={
              cloud.speed
            }

            rainCloud={
              cloud.rainCloud
            }

            rainRadius={
              cloud.rainRadius
            }

            rainEnabled={
              rainEnabled
            }

            quality={
              quality
            }
          />

        ),
      )}

    </group>
  );
}
import * as THREE from "three";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";


// =====================================================
// KRISHIMITRA AI
// CONTINUOUS OPTIMIZED RAIN
// =====================================================
//
// Two overlapping GPU-instanced rain layers.
//
// Layer A falls
// Layer B follows behind
//
// When one layer passes the farm,
// it is recycled above the other.
//
// Result:
// CONTINUOUS RAIN
// =====================================================


const CLOUD_BASE_HEIGHT = 8.5;
const RAIN_HEIGHT = 8;

const RAIN_SPEED = 11;


// =====================================================
// SINGLE RAIN LAYER
// =====================================================

function RainLayer({
  count,
  startY,
}) {
  const meshRef = useRef(null);


  // ===================================================
  // DROP GEOMETRY
  // ===================================================

  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        0.025,
        0.7,
        0.025,
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

        opacity: 0.75,

        depthWrite: false,

        toneMapped: false,
      }),
    [],
  );


  // ===================================================
  // GENERATE STATIC INSTANCES
  // ===================================================

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }


    const dummy =
      new THREE.Object3D();


    for (
      let index = 0;
      index < count;
      index += 1
    ) {

      // -----------------------------------------------
      // RANDOM FARM POSITION
      // -----------------------------------------------

      const x =
        THREE.MathUtils.randFloat(
          -14,
          14,
        );

      const y =
        THREE.MathUtils.randFloat(
          0,
          CLOUD_BASE_HEIGHT,
        );

      const z =
        THREE.MathUtils.randFloat(
          -12,
          12,
        );


      dummy.position.set(
        x,
        y,
        z,
      );


      // -----------------------------------------------
      // SLIGHT WIND
      // -----------------------------------------------

      dummy.rotation.set(
        0,
        0,
        -0.08,
      );


      // -----------------------------------------------
      // LENGTH VARIATION
      // -----------------------------------------------

      const length =
        THREE.MathUtils.randFloat(
          0.75,
          1.35,
        );


      dummy.scale.set(
        1,
        length,
        1,
      );


      dummy.updateMatrix();


      mesh.setMatrixAt(
        index,
        dummy.matrix,
      );
    }


    mesh.instanceMatrix.needsUpdate =
      true;


    mesh.instanceMatrix.setUsage(
      THREE.StaticDrawUsage,
    );


    mesh.computeBoundingSphere();

  }, [count]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <instancedMesh
      ref={meshRef}

      args={[
        geometry,
        material,
        count,
      ]}

      position={[
        0,
        startY,
        0,
      ]}

      castShadow={false}

      receiveShadow={false}

      frustumCulled={false}

      renderOrder={10}
    />
  );
}


// =====================================================
// MAIN RAIN
// =====================================================

export default function FarmRain({
  quality,
  enabled = false,
  intensity = 1,
}) {
  const groupRef =
    useRef(null);


  // ===================================================
  // ADAPTIVE DROP COUNT
  // ===================================================

  const totalDrops =
    quality?.level === "performance"
      ? 120
      : quality?.level === "high"
        ? 300
        : 200;


  const adjustedDrops =
    Math.max(
      80,
      Math.floor(
        totalDrops * intensity,
      ),
    );


  // Half in each layer.

  const layerOneCount =
    Math.ceil(
      adjustedDrops / 2,
    );

  const layerTwoCount =
    Math.floor(
      adjustedDrops / 2,
    );


  // ===================================================
  // CONTINUOUS ANIMATION
  // ===================================================

  useFrame(
    (_state, delta) => {
      if (
        !enabled ||
        !groupRef.current
      ) {
        return;
      }


      const layers =
        groupRef.current.children;


      for (
        let index = 0;
        index < layers.length;
        index += 1
      ) {
        const layer =
          layers[index];


        layer.position.y -=
          RAIN_SPEED * delta;


        // ---------------------------------------------
        // RECYCLE ABOVE OTHER LAYER
        // ---------------------------------------------

        if (
          layer.position.y <
          -RAIN_HEIGHT
        ) {
          layer.position.y +=
            RAIN_HEIGHT * 2;
        }
      }
    },
  );


  // ===================================================
  // DISABLED
  // ===================================================

  if (!enabled) {
    return null;
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group ref={groupRef}>

      {/* LOWER RAIN FIELD */}

      <RainLayer
        count={layerOneCount}
        startY={0}
      />


      {/* UPPER RAIN FIELD */}

      <RainLayer
        count={layerTwoCount}
        startY={CLOUD_BASE_HEIGHT}
      />

    </group>
  );
}
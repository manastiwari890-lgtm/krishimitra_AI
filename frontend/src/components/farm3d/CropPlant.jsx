import * as THREE from "three";

import {
  useEffect,
  useMemo,
} from "react";

import {
  Clone,
  useGLTF,
} from "@react-three/drei";


// =====================================================
// KRISHIMITRA AI
// SMART 3D CROP PLANT
// =====================================================
//
// REAL MAIZE SYSTEM:
//
// - Real maize GLB
// - Cached GLTF loading
// - Multiple cloned plants
// - Growth scaling
// - Natural rotation support
// - Health visualization
// - Warning crop tint
// - Diseased crop tint
// - Shadows
//
// PRESERVED:
//
// - Procedural crop renderer
// - Healthy state
// - Warning state
// - Diseased state
// - Existing scale system
// =====================================================


// =====================================================
// MODEL PATH
// =====================================================

const MAIZE_MODEL_PATH =
  "/assets/farm3d/models/crops/maize_corn_plant.glb";


// =====================================================
// HEALTH COLORS
// =====================================================

function getHealthColors(health) {

  if (health === "warning") {
    return {
      stem: "#6f7630",
      leaf: "#a9a13b",
      leafDark: "#827c2d",
    };
  }


  if (health === "diseased") {
    return {
      stem: "#65552c",
      leaf: "#80632d",
      leafDark: "#594326",
    };
  }


  return {
    stem: "#386641",
    leaf: "#4f8f3a",
    leafDark: "#357a38",
  };
}


// =====================================================
// PROCEDURAL FALLBACK PLANT
// =====================================================

function ProceduralCropPlant({
  health = "healthy",
}) {

  const colors =
    useMemo(
      () =>
        getHealthColors(
          health
        ),
      [
        health,
      ]
    );


  return (
    <group>

      {/* STEM */}

      <mesh
        position={[
          0,
          0.48,
          0,
        ]}
        castShadow
      >

        <cylinderGeometry
          args={[
            0.035,
            0.05,
            0.95,
            7,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.stem
          }
          roughness={
            0.9
          }
        />

      </mesh>


      {/* LOWER LEFT LEAF */}

      <mesh
        position={[
          -0.18,
          0.38,
          0,
        ]}
        rotation={[
          0,
          0,
          0.75,
        ]}
        castShadow
      >

        <sphereGeometry
          args={[
            0.24,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.leafDark
          }
          roughness={
            0.9
          }
        />

      </mesh>


      {/* LOWER RIGHT LEAF */}

      <mesh
        position={[
          0.19,
          0.48,
          0.02,
        ]}
        rotation={[
          0,
          0,
          -0.72,
        ]}
        castShadow
      >

        <sphereGeometry
          args={[
            0.25,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.leaf
          }
          roughness={
            0.9
          }
        />

      </mesh>


      {/* UPPER LEFT LEAF */}

      <mesh
        position={[
          -0.14,
          0.67,
          0.02,
        ]}
        rotation={[
          0.1,
          0,
          0.65,
        ]}
        castShadow
      >

        <sphereGeometry
          args={[
            0.2,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.leaf
          }
          roughness={
            0.9
          }
        />

      </mesh>


      {/* UPPER RIGHT LEAF */}

      <mesh
        position={[
          0.14,
          0.77,
          -0.01,
        ]}
        rotation={[
          -0.1,
          0,
          -0.65,
        ]}
        castShadow
      >

        <sphereGeometry
          args={[
            0.18,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.leafDark
          }
          roughness={
            0.9
          }
        />

      </mesh>


      {/* TOP GROWTH */}

      <mesh
        position={[
          0,
          0.94,
          0,
        ]}
        scale={[
          0.7,
          1,
          0.7,
        ]}
        castShadow
      >

        <sphereGeometry
          args={[
            0.16,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={
            colors.leaf
          }
          roughness={
            0.9
          }
        />

      </mesh>

    </group>
  );
}


// =====================================================
// REAL MAIZE PLANT
// =====================================================

function RealMaizePlant({
  health = "healthy",
}) {

  const gltf =
    useGLTF(
      MAIZE_MODEL_PATH
    );


  // ===================================================
  // CLONE MODEL FOR THIS PLANT
  // ===================================================
  //
  // This is important.
  //
  // We do NOT directly modify gltf.scene materials,
  // because every plant uses the cached GLB.
  //
  // Each plant receives its own scene/material clone so
  // warning plants can be yellow while healthy plants
  // remain green.
  // ===================================================

  const plantScene =
    useMemo(() => {

      const clonedScene =
        gltf.scene.clone(
          true
        );


      clonedScene.traverse(
        (object) => {

          if (!object.isMesh) {
            return;
          }


          object.castShadow =
            true;

          object.receiveShadow =
            true;


          // ===========================================
          // CLONE MATERIAL
          // ===========================================

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material =
              object.material.map(
                (material) =>
                  material.clone()
              );

          } else if (
            object.material
          ) {

            object.material =
              object.material.clone();
          }
        }
      );


      return clonedScene;

    }, [
      gltf.scene,
    ]);


  // ===================================================
  // APPLY HEALTH APPEARANCE
  // ===================================================

  useEffect(() => {

    plantScene.traverse(
      (object) => {

        if (
          !object.isMesh ||
          !object.material
        ) {
          return;
        }


        const materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [
                object.material,
              ];


        materials.forEach(
          (material) => {

            // =========================================
            // VEGETATION SUPPORT
            // =========================================

            material.side =
              THREE.DoubleSide;


            if (
              material.map
            ) {

              material.map.anisotropy =
                8;

              material.map.needsUpdate =
                true;
            }


            // =========================================
            // HEALTH COLOR
            // =========================================

            if (
              material.color
            ) {

              if (
                health ===
                "warning"
              ) {

                // Yellow-green stressed crop.

                material.color.set(
                  "#b7a84c"
                );

              } else if (
                health ===
                "diseased"
              ) {

                // Brown / dry crop.

                material.color.set(
                  "#80613b"
                );

              } else {

                // Healthy crops keep a neutral material
                // multiplier so original GLB textures
                // remain dominant.

                material.color.set(
                  "#ffffff"
                );
              }
            }


            // =========================================
            // ROUGHNESS RESPONSE
            // =========================================

            if (
              health ===
              "diseased"
            ) {

              material.roughness =
                Math.max(
                  material.roughness ??
                    0.8,
                  0.9
                );
            }


            material.needsUpdate =
              true;
          }
        );

      }
    );

  }, [
    plantScene,
    health,
  ]);


  return (
    <primitive
      object={
        plantScene
      }
    />
  );
}


// =====================================================
// MAIN CROP PLANT
// =====================================================

export default function CropPlant({
  position = [
    0,
    0,
    0,
  ],

  scale = 1,

  health = "healthy",

  useRealModel = true,

  rotation = 0,
}) {

  // ===================================================
  // MODEL NORMALIZATION
  // ===================================================

  const realModelScale =
    0.32;


  const finalRealScale =
    realModelScale *
    scale;


  // ===================================================
  // NATURAL ROTATION
  // ===================================================
  //
  // If CropField doesn't provide a rotation yet,
  // derive a deterministic one from position.
  // ===================================================

  const naturalRotation =
    useMemo(() => {

      if (
        rotation !== 0
      ) {
        return rotation;
      }


      const seed =
        position[0] *
          12.9898 +
        position[2] *
          78.233;


      return (
        Math.sin(
          seed
        ) *
        0.22
      );

    }, [
      position,
      rotation,
    ]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group
      position={
        position
      }

      rotation={[
        0,
        naturalRotation,
        0,
      ]}
    >

      {useRealModel ? (

        <group
          scale={[
            finalRealScale,
            finalRealScale,
            finalRealScale,
          ]}
        >

          <RealMaizePlant
            health={
              health
            }
          />

        </group>

      ) : (

        <group
          scale={[
            scale,
            scale,
            scale,
          ]}
        >

          <ProceduralCropPlant
            health={
              health
            }
          />

        </group>

      )}

    </group>
  );
}


// =====================================================
// PRELOAD MAIZE MODEL
// =====================================================

useGLTF.preload(
  MAIZE_MODEL_PATH
);
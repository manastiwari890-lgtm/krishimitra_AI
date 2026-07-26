import * as THREE from "three";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  useGLTF,
} from "@react-three/drei";


// =====================================================
// KRISHIMITRA AI
// GPU INSTANCED CROP FIELD
// PERFORMANCE PASS 4
// =====================================================
//
// GOAL:
//
// Instead of:
// 35 CropPlant components
// -> 35 cloned GLTF scene trees
//
// We use:
// 1 GLB
// -> extract model meshes once
// -> InstancedMesh for each model mesh
// -> GPU handles repeated plants
//
// PRESERVES:
// - Real maize GLB
// - Original geometry
// - Original textures
// - Health colouring
// - Growth variation
// - Rotation variation
// - Existing field layout
//
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const MAIZE_MODEL_PATH =
  "/assets/farm3d/models/crops/maize_corn_plant.glb";

const REAL_MODEL_SCALE = 0.32;


// =====================================================
// MATERIAL CACHE
// =====================================================
//
// Prevents creating duplicate materials every render.
//
// One material is created for:
//
// original material + health state
//
// =====================================================

const materialCache = new Map();


// =====================================================
// CREATE HEALTH MATERIAL
// =====================================================

function getHealthMaterial(
  originalMaterial,
  health,
) {
  const cacheKey =
    `${originalMaterial.uuid}-${health}`;

  if (
    materialCache.has(
      cacheKey,
    )
  ) {
    return materialCache.get(
      cacheKey,
    );
  }


  // ===================================================
  // CLONE ONCE
  // ===================================================

  const material =
    originalMaterial.clone();


  // ===================================================
  // LEAF SUPPORT
  // ===================================================

  material.side =
    THREE.DoubleSide;


  // ===================================================
  // TEXTURE OPTIMIZATION
  // ===================================================

  if (material.map) {
    material.map.anisotropy =
      Math.min(
        material.map.anisotropy || 1,
        4,
      );
  }


  // ===================================================
  // HEALTH APPEARANCE
  // ===================================================

  if (material.color) {

    if (
      health === "warning"
    ) {
      material.color.set(
        "#b7a84c",
      );
    }

    else if (
      health === "diseased"
    ) {
      material.color.set(
        "#80613b",
      );
    }

    else {
      material.color.set(
        "#ffffff",
      );
    }
  }


  // ===================================================
  // DISEASE ROUGHNESS
  // ===================================================

  if (
    health === "diseased" &&
    "roughness" in material
  ) {
    material.roughness =
      Math.max(
        material.roughness ?? 0.8,
        0.9,
      );
  }


  material.needsUpdate =
    true;


  // ===================================================
  // CACHE MATERIAL
  // ===================================================

  materialCache.set(
    cacheKey,
    material,
  );


  return material;
}


// =====================================================
// INSTANCED MODEL PART
// =====================================================
//
// Every mesh contained inside the maize GLB gets one
// InstancedMesh.
//
// Example:
//
// Maize GLB:
//
// Mesh 1 -> 35 GPU instances
// Mesh 2 -> 35 GPU instances
// Mesh 3 -> 35 GPU instances
//
// This preserves complex GLB models while eliminating
// separate GLTF scene clones for every plant.
//
// =====================================================

function CropMeshInstances({
  part,
  plants,
  health,
}) {

  const meshRef =
    useRef(null);


  // ===================================================
  // MATERIAL
  // ===================================================

  const material =
    useMemo(
      () =>
        getHealthMaterial(
          part.material,
          health,
        ),
      [
        part.material,
        health,
      ],
    );


  // ===================================================
  // BUILD INSTANCE MATRICES
  // ===================================================

  useLayoutEffect(
    () => {

      const mesh =
        meshRef.current;


      if (!mesh) {
        return;
      }


      // =================================================
      // REUSABLE OBJECTS
      // =================================================

      const plantMatrix =
        new THREE.Matrix4();

      const finalMatrix =
        new THREE.Matrix4();

      const position =
        new THREE.Vector3();

      const quaternion =
        new THREE.Quaternion();

      const rotation =
        new THREE.Euler();

      const scale =
        new THREE.Vector3();


      // =================================================
      // APPLY EVERY PLANT TRANSFORM
      // =================================================

      plants.forEach(
        (
          plant,
          index,
        ) => {

          // =============================================
          // POSITION
          // =============================================

          position.set(
            plant.position[0],
            plant.position[1],
            plant.position[2],
          );


          // =============================================
          // ROTATION
          // =============================================

          rotation.set(
            0,
            plant.rotation || 0,
            0,
          );

          quaternion.setFromEuler(
            rotation,
          );


          // =============================================
          // SCALE
          // =============================================

          const plantScale =
            REAL_MODEL_SCALE *
            plant.scale;


          scale.set(
            plantScale,
            plantScale,
            plantScale,
          );


          // =============================================
          // CREATE PLANT MATRIX
          // =============================================

          plantMatrix.compose(
            position,
            quaternion,
            scale,
          );


          // =============================================
          // PRESERVE ORIGINAL GLB MESH TRANSFORM
          // =============================================
          //
          // The Sketchfab model contains nested groups.
          //
          // part.matrix contains the original complete
          // world transform of this mesh inside the GLB.
          //
          // =============================================

          finalMatrix.multiplyMatrices(
            plantMatrix,
            part.matrix,
          );


          // =============================================
          // SEND MATRIX TO GPU INSTANCE
          // =============================================

          mesh.setMatrixAt(
            index,
            finalMatrix,
          );
        },
      );


      // =================================================
      // UPDATE GPU BUFFER
      // =================================================

      mesh.instanceMatrix.needsUpdate =
        true;


      // =================================================
      // STATIC DRAW USAGE
      // =================================================
      //
      // Plants do not currently move every frame.
      //
      // =================================================

      mesh.instanceMatrix.setUsage(
        THREE.StaticDrawUsage,
      );


      // =================================================
      // UPDATE BOUNDING VOLUME
      // =================================================

      if (
        typeof mesh.computeBoundingSphere ===
        "function"
      ) {
        mesh.computeBoundingSphere();
      }

    },
    [
      plants,
      part.matrix,
    ],
  );


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <instancedMesh
      ref={meshRef}

      args={[
        part.geometry,
        material,
        plants.length,
      ]}

      castShadow={false}

      receiveShadow={false}

      frustumCulled
    />
  );
}


// =====================================================
// MAIN INSTANCED CROP FIELD
// =====================================================

export default function InstancedCropField({
  plants = [],
  health = "healthy",
}) {

  // ===================================================
  // LOAD MODEL
  // ===================================================

  const gltf =
    useGLTF(
      MAIZE_MODEL_PATH,
    );


  // ===================================================
  // EXTRACT MODEL PARTS
  // ===================================================

  const modelParts =
    useMemo(
      () => {

        const parts = [];


        // ===============================================
        // UPDATE MODEL TRANSFORMS
        // ===============================================
        //
        // Required because Sketchfab GLBs often contain
        // multiple nested groups.
        //
        // ===============================================

        gltf.scene.updateMatrixWorld(
          true,
        );


        // ===============================================
        // FIND EVERY MESH
        // ===============================================

        gltf.scene.traverse(
          (object) => {

            if (
              !object.isMesh
            ) {
              return;
            }


            if (
              !object.geometry
            ) {
              return;
            }


            if (
              !object.material
            ) {
              return;
            }


            // ===========================================
            // MULTI-MATERIAL SAFETY
            // ===========================================
            //
            // Current maize model appears to use the
            // single "Maize" material.
            //
            // If a future crop model uses multiple
            // materials on one mesh, we skip that mesh
            // rather than breaking rendering.
            //
            // ===========================================

            if (
              Array.isArray(
                object.material,
              )
            ) {
              return;
            }


            // ===========================================
            // STORE MODEL PART
            // ===========================================

            parts.push({

              id:
                object.uuid,

              geometry:
                object.geometry,

              material:
                object.material,

              matrix:
                object.matrixWorld.clone(),

            });
          },
        );


        return parts;

      },
      [
        gltf.scene,
      ],
    );


  // ===================================================
  // EMPTY SAFETY
  // ===================================================

  if (
    plants.length === 0
  ) {
    return null;
  }


  // ===================================================
  // RENDER MODEL PARTS
  // ===================================================

  return (
    <group>

      {modelParts.map(
        (part) => (

          <CropMeshInstances
            key={
              part.id
            }

            part={
              part
            }

            plants={
              plants
            }

            health={
              health
            }
          />

        ),
      )}

    </group>
  );
}


// =====================================================
// PRELOAD MODEL
// =====================================================

useGLTF.preload(
  MAIZE_MODEL_PATH,
);
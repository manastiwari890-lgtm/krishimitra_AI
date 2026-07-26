import * as THREE from "three";

import { useMemo } from "react";

import { useGLTF } from "@react-three/drei";

// =====================================================
// KRISHIMITRA AI
// OPTIMIZED SMART 3D CROP PLANT
// =====================================================
//
// PERFORMANCE PASS 2
//
// Major changes:
//
// - GLB is loaded once through useGLTF cache
// - Shared geometries are preserved
// - Materials are prepared once per health state
// - No per-plant material cloning
// - No per-plant useEffect traversal
// - receiveShadow removed from crop leaves
// - Original GLB textures preserved
//
// CropField architecture remains compatible.
// =====================================================

// =====================================================
// MODEL PATH
// =====================================================

const MAIZE_MODEL_PATH = "/assets/farm3d/models/crops/maize_corn_plant.glb";

// =====================================================
// SHARED MATERIAL CACHE
// =====================================================
//
// Materials only need to exist once for:
//
// healthy
// warning
// diseased
//
// Every plant can reuse them.
// =====================================================

const materialCache = new Map();

// =====================================================
// CREATE OPTIMIZED MATERIAL
// =====================================================

function createOptimizedMaterial(originalMaterial, health) {
  const cacheKey = `${originalMaterial.uuid}-${health}`;

  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey);
  }

  // Clone ONCE per material + health state.

  const material = originalMaterial.clone();

  // ===================================================
  // LEAF SUPPORT
  // ===================================================

  material.side = THREE.DoubleSide;

  // ===================================================
  // TEXTURE OPTIMIZATION
  // ===================================================

  if (material.map) {
    // 4 is enough for vegetation.
    // Previous value was 8.

    material.map.anisotropy = Math.min(material.map.anisotropy || 1, 4);
  }

  // ===================================================
  // HEALTH APPEARANCE
  // ===================================================

  if (material.color) {
    if (health === "warning") {
      material.color.set("#b7a84c");
    } else if (health === "diseased") {
      material.color.set("#80613b");
    } else {
      material.color.set("#ffffff");
    }
  }

  // ===================================================
  // DISEASE ROUGHNESS
  // ===================================================

  if (health === "diseased") {
    material.roughness = Math.max(material.roughness ?? 0.8, 0.9);
  }

  material.needsUpdate = true;

  materialCache.set(cacheKey, material);

  return material;
}

// =====================================================
// REAL MAIZE PLANT
// =====================================================

function RealMaizePlant({ health = "healthy" }) {
  const gltf = useGLTF(MAIZE_MODEL_PATH);
  console.log("MAIZE GLTF SCENE:", gltf.scene);

  // ===================================================
  // PREPARE MODEL
  // ===================================================
  //
  // Geometry remains shared.
  //
  // Materials are reused between plants of the same
  // health state.
  //
  // ===================================================

  const plantScene = useMemo(() => {
    // Scene structure is cloned,
    // but geometry remains shared.

    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      // ===========================================
      // SHADOW OPTIMIZATION
      // ===========================================

      object.castShadow = false;

      // Crop leaves don't need to receive expensive
      // shadows from every surrounding object.

      object.receiveShadow = false;

      // ===========================================
      // SHARED MATERIALS
      // ===========================================

      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) =>
          createOptimizedMaterial(material, health),
        );
      } else if (object.material) {
        object.material = createOptimizedMaterial(object.material, health);
      }

      // ===========================================
      // FRUSTUM CULLING
      // ===========================================

      object.frustumCulled = true;
    });

    return clonedScene;
  }, [gltf.scene, health]);

  return <primitive object={plantScene} />;
}

// =====================================================
// PROCEDURAL FALLBACK
// =====================================================

function ProceduralCropPlant({ health = "healthy" }) {
  const colors = useMemo(() => {
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
  }, [health]);

  return (
    <group>
      {/* STEM */}

      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.95, 6]} />

        <meshStandardMaterial color={colors.stem} roughness={0.9} />
      </mesh>

      {/* LOWER LEFT LEAF */}

      <mesh position={[-0.18, 0.38, 0]} rotation={[0, 0, 0.75]}>
        <sphereGeometry args={[0.24, 6, 4]} />

        <meshStandardMaterial color={colors.leafDark} roughness={0.9} />
      </mesh>

      {/* LOWER RIGHT LEAF */}

      <mesh position={[0.19, 0.48, 0.02]} rotation={[0, 0, -0.72]}>
        <sphereGeometry args={[0.25, 6, 4]} />

        <meshStandardMaterial color={colors.leaf} roughness={0.9} />
      </mesh>

      {/* UPPER LEFT LEAF */}

      <mesh position={[-0.14, 0.67, 0.02]} rotation={[0.1, 0, 0.65]}>
        <sphereGeometry args={[0.2, 6, 4]} />

        <meshStandardMaterial color={colors.leaf} roughness={0.9} />
      </mesh>

      {/* UPPER RIGHT LEAF */}

      <mesh position={[0.14, 0.77, -0.01]} rotation={[-0.1, 0, -0.65]}>
        <sphereGeometry args={[0.18, 6, 4]} />

        <meshStandardMaterial color={colors.leafDark} roughness={0.9} />
      </mesh>

      {/* TOP */}

      <mesh position={[0, 0.94, 0]} scale={[0.7, 1, 0.7]}>
        <sphereGeometry args={[0.16, 6, 4]} />

        <meshStandardMaterial color={colors.leaf} roughness={0.9} />
      </mesh>
    </group>
  );
}

// =====================================================
// MAIN CROP PLANT
// =====================================================

export default function CropPlant({
  position = [0, 0, 0],

  scale = 1,

  health = "healthy",

  useRealModel = true,

  rotation = 0,
}) {
  // ===================================================
  // REAL MODEL SCALE
  // ===================================================

  const realModelScale = 0.32;

  const finalRealScale = realModelScale * scale;

  // ===================================================
  // NATURAL ROTATION
  // ===================================================

  const naturalRotation = useMemo(() => {
    if (rotation !== 0) {
      return rotation;
    }

    const seed = position[0] * 12.9898 + position[2] * 78.233;

    return Math.sin(seed) * 0.22;
  }, [position, rotation]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group position={position} rotation={[0, naturalRotation, 0]}>
      {useRealModel ? (
        <group scale={[finalRealScale, finalRealScale, finalRealScale]}>
          <RealMaizePlant health={health} />
        </group>
      ) : (
        <group scale={[scale, scale, scale]}>
          <ProceduralCropPlant health={health} />
        </group>
      )}
    </group>
  );
}

// =====================================================
// PRELOAD
// =====================================================

useGLTF.preload(MAIZE_MODEL_PATH);

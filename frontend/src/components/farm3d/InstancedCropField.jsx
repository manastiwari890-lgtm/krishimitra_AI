import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";

// =====================================================
// KRISHIMITRA AI
// REAL MAIZE FIELD
// =====================================================
//
// IMPORTANT:
// - Keeps the existing real maize model.
// - Keeps plant positions.
// - Keeps plant count.
// - Keeps growth scaling.
// - Keeps spacing.
// - Keeps real corn/cob mesh.
// - ONLY fixes the visual color of the corn/cob.
//
// =====================================================

const FARM_PLANTS_MODEL_PATH =
  "/assets/farm3d/models/crops/farm_plants_models_mobile_game_ready_lowpoly.glb";

const MAIZE_MODEL_NAME = "Corn_Plants_0";
const CORN_MODEL_NAME = "Corn_low_Plants_0";

const MAX_PLANT_HEIGHT = 1.6;

// Corn appears only late in the growth cycle.
const CORN_START_GROWTH = 0.72;

const materialCache = new Map();

// =====================================================
// HEALTH MATERIAL
// =====================================================

function getHealthMaterial(originalMaterial, health) {
  if (!originalMaterial) {
    return null;
  }

  const key = `${originalMaterial.uuid}-${health}`;

  if (materialCache.has(key)) {
    return materialCache.get(key);
  }

  const material = originalMaterial.clone();

  material.side = THREE.DoubleSide;

  // Keep the original texture quality.
  if (material.map) {
    material.map.anisotropy = Math.min(
      material.map.anisotropy || 1,
      4,
    );
  }

  // ---------------------------------------------------
  // HEALTH COLOR
  // ---------------------------------------------------

  if (material.color) {
    if (health === "warning") {
      material.color.set("#b7a84c");
    } else if (health === "diseased") {
      material.color.set("#80613b");
    } else {
      // Healthy = preserve original GLB appearance.
      material.color.set("#ffffff");
    }
  }

  material.needsUpdate = true;

  materialCache.set(key, material);

  return material;
}

// =====================================================
// CORN / COB MATERIAL
// =====================================================
//
// The original GLB cob uses a green material.
// We deliberately remove the green texture from the cob
// and use a natural golden-yellow material.
//
// This changes ONLY the color.
// Geometry remains untouched.
// =====================================================

function getCornMaterial(originalMaterial) {
  if (!originalMaterial) {
    return null;
  }

  const key = `${originalMaterial.uuid}-golden-corn`;

  if (materialCache.has(key)) {
    return materialCache.get(key);
  }

  const material = originalMaterial.clone();

  material.side = THREE.DoubleSide;

  // IMPORTANT:
  // The original cob texture is green.
  // Remove it so it cannot override the golden color.
  material.map = null;

  if (material.color) {
    material.color.set("#E5B83F");
  }

  if ("roughness" in material) {
    material.roughness = 0.72;
  }

  if ("metalness" in material) {
    material.metalness = 0;
  }

  material.needsUpdate = true;

  materialCache.set(key, material);

  return material;
}

// =====================================================
// PREPARE REAL MAIZE MESH
// =====================================================

function preparePlantGeometry(mesh, scene) {
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(mesh);

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const geometry = mesh.geometry.clone();

  geometry.applyMatrix4(mesh.matrixWorld);

  geometry.translate(
    -center.x,
    -box.min.y,
    -center.z,
  );

  const height = Math.max(
    size.y,
    0.0001,
  );

  const normalize =
    MAX_PLANT_HEIGHT / height;

  geometry.scale(
    normalize,
    normalize,
    normalize,
  );

  return {
    geometry,
    material: mesh.material,
  };
}

// =====================================================
// PREPARE REAL CORN / COB MESH
// =====================================================

function prepareCobGeometry(mesh, scene) {
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(mesh);

  const center = new THREE.Vector3();

  box.getCenter(center);

  const geometry = mesh.geometry.clone();

  geometry.applyMatrix4(mesh.matrixWorld);

  // Center the real cob geometry.
  geometry.translate(
    -center.x,
    -center.y,
    -center.z,
  );

  // Keep the existing orientation.
  geometry.rotateY(Math.PI / 2);

  // Keep the existing cob size.
  geometry.scale(
    0.72,
    0.72,
    0.72,
  );

  return {
    geometry,
    material: mesh.material,
  };
}

// =====================================================
// INSTANCED MAIZE PLANTS
// =====================================================

function MaizeInstances({
  geometry,
  material,
  plants,
  modelScale,
}) {
  const meshRef = useRef(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const matrix = new THREE.Matrix4();

    const position = new THREE.Vector3();

    const quaternion =
      new THREE.Quaternion();

    const rotation =
      new THREE.Euler();

    const scale =
      new THREE.Vector3();

    plants.forEach((plant, index) => {
      // -------------------------------------------------
      // POSITION
      // -------------------------------------------------

      position.set(
        plant.position?.[0] ?? 0,
        plant.position?.[1] ?? 0,
        plant.position?.[2] ?? 0,
      );

      // -------------------------------------------------
      // ROTATION
      // -------------------------------------------------

      rotation.set(
        0,
        plant.rotation ?? 0,
        0,
      );

      quaternion.setFromEuler(
        rotation,
      );

      // -------------------------------------------------
      // SCALE
      // -------------------------------------------------

      let widthScale = 1;
      let heightScale = 1;

      if (Array.isArray(plant.scale)) {
        widthScale = Number.isFinite(
          plant.scale[0],
        )
          ? plant.scale[0]
          : 1;

        heightScale = Number.isFinite(
          plant.scale[1],
        )
          ? plant.scale[1]
          : 1;
      } else if (
        Number.isFinite(plant.scale)
      ) {
        widthScale = plant.scale;
        heightScale = plant.scale;
      }

      widthScale =
        THREE.MathUtils.clamp(
          widthScale,
          0.55,
          1,
        );

      heightScale =
        THREE.MathUtils.clamp(
          heightScale,
          0.1,
          1,
        );

      scale.set(
        modelScale * widthScale,
        modelScale * heightScale,
        modelScale * widthScale,
      );

      matrix.compose(
        position,
        quaternion,
        scale,
      );

      mesh.setMatrixAt(
        index,
        matrix,
      );
    });

    mesh.instanceMatrix.needsUpdate = true;

    mesh.computeBoundingSphere();
  }, [plants, modelScale]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        geometry,
        material,
        plants.length,
      ]}
      castShadow={false}
      receiveShadow={false}
      frustumCulled={false}
    />
  );
}

// =====================================================
// INSTANCED REAL CORN EARS
// =====================================================
//
// ONE real cob per plant.
//
// Positioning and growth behavior are unchanged.
// Only the material/color has been corrected.
// =====================================================

function CornInstances({
  geometry,
  material,
  plants,
  modelScale,
}) {
  const meshRef = useRef(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const matrix =
      new THREE.Matrix4();

    const position =
      new THREE.Vector3();

    const quaternion =
      new THREE.Quaternion();

    const rotation =
      new THREE.Euler();

    const scale =
      new THREE.Vector3();

    plants.forEach((plant, index) => {
      // -------------------------------------------------
      // HEIGHT / GROWTH
      // -------------------------------------------------

      let heightScale = 1;

      if (Array.isArray(plant.scale)) {
        heightScale = Number.isFinite(
          plant.scale[1],
        )
          ? plant.scale[1]
          : 1;
      } else if (
        Number.isFinite(plant.scale)
      ) {
        heightScale = plant.scale;
      }

      heightScale =
        THREE.MathUtils.clamp(
          heightScale,
          0.1,
          1,
        );

      const growth =
        THREE.MathUtils.clamp(
          (heightScale - 0.15) / 0.70,
          0,
          1,
        );

      // -------------------------------------------------
      // HIDE CORN UNTIL MATURITY
      // -------------------------------------------------

      if (
        growth <
        CORN_START_GROWTH
      ) {
        scale.set(
          0,
          0,
          0,
        );

        matrix.compose(
          new THREE.Vector3(
            plant.position?.[0] ?? 0,
            plant.position?.[1] ?? 0,
            plant.position?.[2] ?? 0,
          ),
          new THREE.Quaternion(),
          scale,
        );

        mesh.setMatrixAt(
          index,
          matrix,
        );

        return;
      }

      // -------------------------------------------------
      // CORN MATURITY
      // -------------------------------------------------

      const cobMaturity =
        THREE.MathUtils.clamp(
          (growth -
            CORN_START_GROWTH) /
            (1 -
              CORN_START_GROWTH),
          0,
          1,
        );

      // -------------------------------------------------
      // BASE POSITION
      // -------------------------------------------------

      position.set(
        plant.position?.[0] ?? 0,
        plant.position?.[1] ?? 0,
        plant.position?.[2] ?? 0,
      );

      // -------------------------------------------------
      // ROTATION
      // -------------------------------------------------

      rotation.set(
        0,
        plant.rotation ?? 0,
        THREE.MathUtils.degToRad(
          -12,
        ),
      );

      quaternion.setFromEuler(
        rotation,
      );

      // -------------------------------------------------
      // CORN HEIGHT
      // -------------------------------------------------

      const localHeight =
        0.78 +
        cobMaturity * 0.06;

      const localSide =
        0.095 +
        cobMaturity * 0.025;

      const angle =
        plant.rotation ?? 0;

      position.x +=
        Math.cos(angle) *
        localSide;

      position.z +=
        Math.sin(angle) *
        localSide;

      position.y +=
        localHeight *
        modelScale *
        heightScale;

      // -------------------------------------------------
      // CORN SIZE
      // -------------------------------------------------

      const cobSize =
        THREE.MathUtils.lerp(
          0.72,
          0.92,
          cobMaturity,
        );

      scale.set(
        cobSize,
        cobSize,
        cobSize,
      );

      matrix.compose(
        position,
        quaternion,
        scale,
      );

      mesh.setMatrixAt(
        index,
        matrix,
      );
    });

    mesh.instanceMatrix.needsUpdate = true;

    mesh.computeBoundingSphere();
  }, [plants, modelScale]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        geometry,
        material,
        plants.length,
      ]}
      castShadow={false}
      receiveShadow={false}
      frustumCulled={false}
    />
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function InstancedCropField({
  plants = [],
  health = "healthy",
}) {
  const gltf = useGLTF(
    FARM_PLANTS_MODEL_PATH,
  );

  const {
    maizeGeometry,
    maizeMaterial,
    cornGeometry,
    cornMaterial,
    modelScale,
  } = useMemo(() => {
    let maizeMesh = null;
    let cornMesh = null;

    // -------------------------------------------------
    // FIND REAL GLB MESHES
    // -------------------------------------------------

    gltf.scene.traverse(
      (object) => {
        if (!object.isMesh) {
          return;
        }

        if (
          object.name ===
          MAIZE_MODEL_NAME
        ) {
          maizeMesh = object;
        }

        if (
          object.name ===
          CORN_MODEL_NAME
        ) {
          cornMesh = object;
        }
      },
    );

    // -------------------------------------------------
    // SAFETY CHECK
    // -------------------------------------------------

    if (!maizeMesh) {
      console.error(
        `[KrishiMitra] ${MAIZE_MODEL_NAME} not found.`,
      );
    }

    if (!cornMesh) {
      console.error(
        `[KrishiMitra] ${CORN_MODEL_NAME} not found.`,
      );
    }

    if (
      !maizeMesh ||
      !cornMesh
    ) {
      return {
        maizeGeometry: null,
        maizeMaterial: null,
        cornGeometry: null,
        cornMaterial: null,
        modelScale: 1,
      };
    }

    // -------------------------------------------------
    // PREPARE PLANT
    // -------------------------------------------------

    const plant =
      preparePlantGeometry(
        maizeMesh,
        gltf.scene,
      );

    // -------------------------------------------------
    // PREPARE CORN
    // -------------------------------------------------

    const cob =
      prepareCobGeometry(
        cornMesh,
        gltf.scene,
      );

    return {
      maizeGeometry:
        plant.geometry,

      // Health affects ONLY the maize plant.
      maizeMaterial:
        getHealthMaterial(
          plant.material,
          health,
        ),

      cornGeometry:
        cob.geometry,

      // IMPORTANT:
      // Corn gets its own golden material.
      cornMaterial:
        getCornMaterial(
          cob.material,
        ),

      modelScale: 1,
    };
  }, [
    gltf.scene,
    health,
  ]);

  // ---------------------------------------------------
  // SAFETY
  // ---------------------------------------------------

  if (
    !plants.length ||
    !maizeGeometry ||
    !maizeMaterial ||
    !cornGeometry ||
    !cornMaterial
  ) {
    return null;
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (
    <group>
      <MaizeInstances
        geometry={maizeGeometry}
        material={maizeMaterial}
        plants={plants}
        modelScale={modelScale}
      />

      <CornInstances
        geometry={cornGeometry}
        material={cornMaterial}
        plants={plants}
        modelScale={modelScale}
      />
    </group>
  );
}

// =====================================================
// PRELOAD
// =====================================================

useGLTF.preload(
  FARM_PLANTS_MODEL_PATH,
);
import * as THREE from "three";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useGLTF,
} from "@react-three/drei";


// =====================================================
// KRISHIMITRA AI
// OPTIMIZED NATURAL FARM VEGETATION
// =====================================================
//
// CURRENT SYSTEM:
//
// - Real GLB trees
// - Corrected natural tree materials
// - Tree shadows disabled for performance
// - Instanced bushes
// - Instanced grass
// - Shared geometry/materials
//
// PERFORMANCE:
// - No tree shadow rendering
// - No grass shadows
// - No bush shadows
// - Bushes + grass use InstancedMesh
//
// =====================================================


// =====================================================
// TREE MODEL
// =====================================================

const TREE_MODEL_PATH =
  "/assets/farm3d/models/trees/realistic_tree.glb";


// =====================================================
// TREE MATERIAL HELPERS
// =====================================================

function isLeafMaterial(
  object,
  material
) {

  const materialName =
    (
      material?.name ||
      ""
    ).toLowerCase();


  const objectName =
    (
      object?.name ||
      ""
    ).toLowerCase();


  const combinedName =
    `${materialName} ${objectName}`;


  // ===================================================
  // TRY MODEL NAMES FIRST
  // ===================================================

  if (
    combinedName.includes("leaf") ||
    combinedName.includes("leaves") ||
    combinedName.includes("foliage") ||
    combinedName.includes("branch") ||
    combinedName.includes("crown")
  ) {

    return true;
  }


  // ===================================================
  // TRANSPARENT / ALPHA TEXTURES ARE VERY OFTEN LEAVES
  // ===================================================

  if (
    material?.alphaMap ||
    material?.transparent ||
    material?.alphaTest > 0
  ) {

    return true;
  }


  return false;
}


// =====================================================
// PREPARE TREE MATERIAL
// =====================================================

function prepareTreeMaterial(
  object,
  sourceMaterial
) {

  if (
    !sourceMaterial
  ) {

    return sourceMaterial;
  }


  // Clone once for this tree scene.
  //
  // This prevents us from modifying the original
  // cached GLTF material.

  const material =
    sourceMaterial.clone();


  const leafMaterial =
    isLeafMaterial(
      object,
      material
    );


  // ===================================================
  // COMMON SETTINGS
  // ===================================================

  material.side =
    THREE.DoubleSide;


  material.depthWrite =
    true;


  material.depthTest =
    true;


  material.transparent =
    false;


  // ===================================================
  // TEXTURE SETTINGS
  // ===================================================

  if (
    material.map
  ) {

    material.map.anisotropy =
      Math.min(
        material.map.anisotropy || 1,
        4
      );


    material.map.colorSpace =
      THREE.SRGBColorSpace;


    material.map.needsUpdate =
      true;
  }


  // ===================================================
  // LEAF MATERIAL
  // ===================================================

  if (
    leafMaterial
  ) {

    // -------------------------------------------------
    // Keep original leaf texture if available.
    // -------------------------------------------------

    material.color.set(
      "#4f7f3d"
    );


    // -------------------------------------------------
    // Alpha cutout
    //
    // This is important for foliage textures.
    //
    // It removes transparent background areas instead
    // of blending them as ugly white/black rectangles.
    // -------------------------------------------------

    material.alphaTest =
      0.45;


    material.transparent =
      false;


    material.opacity =
      1;


    // -------------------------------------------------
    // Natural foliage surface
    // -------------------------------------------------

    material.roughness =
      0.88;


    material.metalness =
      0;


    // -------------------------------------------------
    // Leaves should not glow.
    // -------------------------------------------------

    if (
      material.emissive
    ) {

      material.emissive.set(
        "#000000"
      );


      material.emissiveIntensity =
        0;
    }
  }


  // ===================================================
  // TRUNK / WOOD MATERIAL
  // ===================================================

  else {

    // Preserve texture but slightly tint it toward
    // natural bark.

    material.color.set(
      "#7a6653"
    );


    material.alphaTest =
      0;


    material.transparent =
      false;


    material.opacity =
      1;


    material.roughness =
      0.95;


    material.metalness =
      0;


    if (
      material.emissive
    ) {

      material.emissive.set(
        "#000000"
      );


      material.emissiveIntensity =
        0;
    }
  }


  material.needsUpdate =
    true;


  return material;
}


// =====================================================
// REAL TREE
// =====================================================

function FarmTree({
  position,
  scale,
  rotation,
}) {

  const gltf =
    useGLTF(
      TREE_MODEL_PATH
    );


  // ===================================================
  // PREPARE TREE
  // ===================================================

  const tree =
    useMemo(() => {

      const cloned =
        gltf.scene.clone(
          true
        );


      cloned.traverse(
        (object) => {

          if (
            !object.isMesh
          ) {

            return;
          }


          // ===========================================
          // PERFORMANCE
          // ===========================================

          object.castShadow =
            false;


          object.receiveShadow =
            false;


          object.frustumCulled =
            true;


          // ===========================================
          // MATERIALS
          // ===========================================

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material =
              object.material.map(
                (material) =>
                  prepareTreeMaterial(
                    object,
                    material
                  )
              );

          } else {

            object.material =
              prepareTreeMaterial(
                object,
                object.material
              );
          }
        }
      );


      return cloned;

    }, [
      gltf.scene,
    ]);


  // ===================================================
  // TREE SCALE
  // ===================================================

  const finalScale =
    0.32 *
    scale;


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <primitive

      object={
        tree
      }

      position={
        position
      }

      rotation={[
        0,
        rotation,
        0,
      ]}

      scale={[
        finalScale,
        finalScale,
        finalScale,
      ]}

    />

  );
}


// =====================================================
// INSTANCED BUSHES
// =====================================================

function InstancedBushes({
  bushes,
}) {

  const centerRef =
    useRef();

  const leftRef =
    useRef();

  const rightRef =
    useRef();


  // ===================================================
  // SHARED GEOMETRY
  // ===================================================

  const geometries =
    useMemo(
      () => ({

        center:
          new THREE.IcosahedronGeometry(
            0.55,
            1
          ),

        left:
          new THREE.IcosahedronGeometry(
            0.45,
            1
          ),

        right:
          new THREE.IcosahedronGeometry(
            0.43,
            1
          ),

      }),
      []
    );


  // ===================================================
  // SHARED MATERIALS
  // ===================================================

  const materials =
    useMemo(
      () => ({

        center:
          new THREE.MeshStandardMaterial({
            color:
              "#376b35",

            roughness:
              1,

            metalness:
              0,
          }),

        left:
          new THREE.MeshStandardMaterial({
            color:
              "#477c3d",

            roughness:
              1,

            metalness:
              0,
          }),

        right:
          new THREE.MeshStandardMaterial({
            color:
              "#2f6534",

            roughness:
              1,

            metalness:
              0,
          }),

      }),
      []
    );


  // ===================================================
  // INSTANCE MATRICES
  // ===================================================

  useEffect(() => {

    const dummy =
      new THREE.Object3D();


    bushes.forEach(
      (
        position,
        index
      ) => {

        const bushScale =
          0.8 +
          (
            index % 4
          ) *
          0.08;


        // =============================================
        // CENTER
        // =============================================

        dummy.position.set(
          position[0],
          position[1] +
            0.35 *
            bushScale,
          position[2]
        );


        dummy.rotation.set(
          0,
          0,
          0
        );


        dummy.scale.set(
          bushScale,
          0.7 *
            bushScale,
          0.85 *
            bushScale
        );


        dummy.updateMatrix();


        centerRef.current.setMatrixAt(
          index,
          dummy.matrix
        );


        // =============================================
        // LEFT
        // =============================================

        dummy.position.set(

          position[0] -
            0.32 *
            bushScale,

          position[1] +
            0.3 *
            bushScale,

          position[2] +
            0.05 *
            bushScale
        );


        dummy.rotation.set(
          0,
          0,
          0
        );


        dummy.scale.set(
          0.75 *
            bushScale,

          0.65 *
            bushScale,

          0.7 *
            bushScale
        );


        dummy.updateMatrix();


        leftRef.current.setMatrixAt(
          index,
          dummy.matrix
        );


        // =============================================
        // RIGHT
        // =============================================

        dummy.position.set(

          position[0] +
            0.34 *
            bushScale,

          position[1] +
            0.28 *
            bushScale,

          position[2] -
            0.04 *
            bushScale
        );


        dummy.rotation.set(
          0,
          0,
          0
        );


        dummy.scale.set(
          0.7 *
            bushScale,

          0.62 *
            bushScale,

          0.7 *
            bushScale
        );


        dummy.updateMatrix();


        rightRef.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );


    centerRef.current.instanceMatrix.needsUpdate =
      true;


    leftRef.current.instanceMatrix.needsUpdate =
      true;


    rightRef.current.instanceMatrix.needsUpdate =
      true;

  }, [
    bushes,
  ]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>

      <instancedMesh

        ref={
          centerRef
        }

        args={[
          geometries.center,
          materials.center,
          bushes.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />


      <instancedMesh

        ref={
          leftRef
        }

        args={[
          geometries.left,
          materials.left,
          bushes.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />


      <instancedMesh

        ref={
          rightRef
        }

        args={[
          geometries.right,
          materials.right,
          bushes.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />

    </>
  );
}


// =====================================================
// INSTANCED GRASS
// =====================================================

function InstancedGrass({
  grass,
}) {

  const bladeOneRef =
    useRef();

  const bladeTwoRef =
    useRef();

  const bladeThreeRef =
    useRef();


  // ===================================================
  // SHARED GEOMETRY
  // ===================================================

  const geometries =
    useMemo(
      () => ({

        one:
          new THREE.ConeGeometry(
            0.07,
            0.42,
            4
          ),

        two:
          new THREE.ConeGeometry(
            0.065,
            0.46,
            4
          ),

        three:
          new THREE.ConeGeometry(
            0.065,
            0.5,
            4
          ),

      }),
      []
    );


  // ===================================================
  // SHARED MATERIALS
  // ===================================================

  const materials =
    useMemo(
      () => ({

        one:
          new THREE.MeshStandardMaterial({
            color:
              "#5d873c",

            roughness:
              1,

            metalness:
              0,
          }),

        two:
          new THREE.MeshStandardMaterial({
            color:
              "#6a9444",

            roughness:
              1,

            metalness:
              0,
          }),

        three:
          new THREE.MeshStandardMaterial({
            color:
              "#4f7b37",

            roughness:
              1,

            metalness:
              0,
          }),

      }),
      []
    );


  // ===================================================
  // INSTANCE MATRICES
  // ===================================================

  useEffect(() => {

    const dummy =
      new THREE.Object3D();


    grass.forEach(
      (
        item,
        index
      ) => {

        const [
          x,
          y,
          z,
        ] =
          item.position;


        const scale =
          item.scale;


        const rotation =
          item.rotation;


        // =============================================
        // BLADE 1
        // =============================================

        dummy.position.set(

          x -
            0.08 *
            scale,

          y +
            0.18 *
            scale,

          z
        );


        dummy.rotation.set(
          0,
          rotation,
          -0.18
        );


        dummy.scale.setScalar(
          scale
        );


        dummy.updateMatrix();


        bladeOneRef.current.setMatrixAt(
          index,
          dummy.matrix
        );


        // =============================================
        // BLADE 2
        // =============================================

        dummy.position.set(

          x +
            0.08 *
            scale,

          y +
            0.2 *
            scale,

          z +
            0.03 *
            scale
        );


        dummy.rotation.set(
          0,
          rotation,
          0.18
        );


        dummy.scale.setScalar(
          scale
        );


        dummy.updateMatrix();


        bladeTwoRef.current.setMatrixAt(
          index,
          dummy.matrix
        );


        // =============================================
        // BLADE 3
        // =============================================

        dummy.position.set(

          x,

          y +
            0.23 *
            scale,

          z -
            0.07 *
            scale
        );


        dummy.rotation.set(
          0,
          rotation,
          0
        );


        dummy.scale.setScalar(
          scale
        );


        dummy.updateMatrix();


        bladeThreeRef.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );


    bladeOneRef.current.instanceMatrix.needsUpdate =
      true;


    bladeTwoRef.current.instanceMatrix.needsUpdate =
      true;


    bladeThreeRef.current.instanceMatrix.needsUpdate =
      true;

  }, [
    grass,
  ]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>

      <instancedMesh

        ref={
          bladeOneRef
        }

        args={[
          geometries.one,
          materials.one,
          grass.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />


      <instancedMesh

        ref={
          bladeTwoRef
        }

        args={[
          geometries.two,
          materials.two,
          grass.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />


      <instancedMesh

        ref={
          bladeThreeRef
        }

        args={[
          geometries.three,
          materials.three,
          grass.length,
        ]}

        castShadow={
          false
        }

        receiveShadow={
          false
        }

      />

    </>
  );
}


// =====================================================
// MAIN VEGETATION SYSTEM
// =====================================================

export default function FarmVegetation() {


  // ===================================================
  // TREE LOCATIONS
  // ===================================================

  const trees =
    useMemo(
      () => [

        {
          position:
            [-17, 0, -13],

          scale:
            1.25,

          rotation:
            0.3,
        },

        {
          position:
            [-13.5, 0, -16],

          scale:
            0.95,

          rotation:
            1.1,
        },

        {
          position:
            [-8.5, 0, -17],

          scale:
            1.15,

          rotation:
            2.2,
        },

        {
          position:
            [9, 0, -17],

          scale:
            1.1,

          rotation:
            0.8,
        },

        {
          position:
            [14, 0, -15],

          scale:
            1.3,

          rotation:
            1.7,
        },

        {
          position:
            [17, 0, -10],

          scale:
            0.95,

          rotation:
            2.6,
        },

        {
          position:
            [-18, 0, 4],

          scale:
            1.1,

          rotation:
            0.5,
        },

        {
          position:
            [18, 0, 3],

          scale:
            1.2,

          rotation:
            1.4,
        },

        {
          position:
            [-16, 0, 13],

          scale:
            1.15,

          rotation:
            2.1,
        },

        {
          position:
            [15, 0, 14],

          scale:
            1,

          rotation:
            0.9,
        },

      ],
      []
    );


  // ===================================================
  // BUSH LOCATIONS
  // ===================================================

  const bushes =
    useMemo(
      () => [

        [-14.5, 0, -11],
        [-11.5, 0, -13],
        [-5.5, 0, -14],
        [4.5, 0, -14.5],
        [11.5, 0, -12],
        [14.5, 0, -8],

        [-15.5, 0, -2],
        [-15, 0, 7],

        [15.5, 0, -2],
        [15, 0, 8],

        [-12.5, 0, 12.5],
        [-7.5, 0, 13],

        [8, 0, 13],
        [12, 0, 11.8],

      ],
      []
    );


  // ===================================================
  // GRASS GENERATION
  // ===================================================

  const grass =
    useMemo(
      () => {

        const generatedGrass =
          [];


        for (
          let index = 0;
          index < 70;
          index += 1
        ) {

          const angle =
            index *
            2.399;


          const radius =
            12 +
            (
              index % 11
            ) *
            0.75;


          const x =
            Math.cos(
              angle
            ) *
            radius;


          const z =
            Math.sin(
              angle
            ) *
            radius;


          // ===========================================
          // KEEP GRASS OUTSIDE CULTIVATED CENTRE
          // ===========================================

          if (
            Math.abs(x) < 12 &&
            Math.abs(z) < 10
          ) {

            continue;
          }


          const scale =
            0.65 +
            (
              (
                index *
                17
              ) %
              10
            ) /
            20;


          generatedGrass.push({

            id:
              index,

            position: [
              x,
              0,
              z,
            ],

            scale,

            rotation:
              angle *
              0.7,

          });
        }


        return generatedGrass;

      },
      []
    );


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>


      {/* ===============================================
          REAL TREES
      =============================================== */}

      {trees.map(
        (
          tree,
          index
        ) => (

          <FarmTree

            key={
              `tree-${index}`
            }

            position={
              tree.position
            }

            scale={
              tree.scale
            }

            rotation={
              tree.rotation
            }

          />

        )
      )}


      {/* ===============================================
          INSTANCED BUSHES
      =============================================== */}

      <InstancedBushes
        bushes={
          bushes
        }
      />


      {/* ===============================================
          INSTANCED GRASS
      =============================================== */}

      <InstancedGrass
        grass={
          grass
        }
      />


    </group>
  );
}


// =====================================================
// PRELOAD TREE MODEL
// =====================================================

useGLTF.preload(
  TREE_MODEL_PATH
);
import {
    useEffect,
    useMemo,
  } from "react";
  
  import * as THREE from "three";
  
  import {
    Clone,
    useGLTF,
  } from "@react-three/drei";
  
  
  // =====================================================
  // KRISHIMITRA AI
  // NATURAL FARM VEGETATION SYSTEM
  // =====================================================
  //
  // CURRENT:
  //
  // - Real GLB boundary trees
  // - Procedural tree fallback
  // - Existing bushes preserved
  // - Existing grass clusters preserved
  // - Natural tree rotation
  // - Natural tree scale variation
  // - Shadow support
  // - Cached GLTF loading
  //
  // FUTURE:
  //
  // - Multiple tree species
  // - Real shrubs
  // - Real grass assets
  // - Wind animation
  // - Seasonal vegetation
  // - Weather response
  // - Distance-based LOD
  // =====================================================
  
  
  // =====================================================
  // MODEL PATH
  // =====================================================
  
  const TREE_MODEL_PATH =
    "/assets/farm3d/models/trees/realistic_tree.glb";
  
  
  // =====================================================
  // PROCEDURAL TREE
  // =====================================================
  //
  // IMPORTANT:
  //
  // This is your ORIGINAL tree system.
  //
  // It is intentionally preserved so later we can use:
  //
  // performanceMode = "low"
  //
  // or use it as a fallback/background vegetation system.
  // =====================================================
  
  function ProceduralFarmTree({
    position = [0, 0, 0],
    scale = 1,
    rotation = 0,
  }) {
    return (
      <group
        position={position}
        scale={scale}
        rotation={[
          0,
          rotation,
          0,
        ]}
      >
  
        {/* ===============================================
            TREE TRUNK
        =============================================== */}
  
        <mesh
          position={[
            0,
            1.25,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry
            args={[
              0.18,
              0.28,
              2.5,
              8,
            ]}
          />
  
          <meshStandardMaterial
            color="#65452f"
            roughness={1}
            metalness={0}
          />
        </mesh>
  
  
        {/* ===============================================
            LOWER CANOPY
        =============================================== */}
  
        <mesh
          position={[
            0,
            2.65,
            0,
          ]}
          scale={[
            1.25,
            0.8,
            1.1,
          ]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry
            args={[
              1.05,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#315f32"
            roughness={0.95}
          />
        </mesh>
  
  
        {/* ===============================================
            LEFT CANOPY
        =============================================== */}
  
        <mesh
          position={[
            -0.65,
            2.8,
            0.08,
          ]}
          scale={[
            0.9,
            0.75,
            0.85,
          ]}
          castShadow
        >
          <icosahedronGeometry
            args={[
              0.8,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#3c7138"
            roughness={0.95}
          />
        </mesh>
  
  
        {/* ===============================================
            RIGHT CANOPY
        =============================================== */}
  
        <mesh
          position={[
            0.62,
            2.9,
            -0.08,
          ]}
          scale={[
            0.88,
            0.78,
            0.9,
          ]}
          castShadow
        >
          <icosahedronGeometry
            args={[
              0.82,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#427a3c"
            roughness={0.95}
          />
        </mesh>
  
  
        {/* ===============================================
            TOP CANOPY
        =============================================== */}
  
        <mesh
          position={[
            0.05,
            3.5,
            0,
          ]}
          scale={[
            0.85,
            0.72,
            0.82,
          ]}
          castShadow
        >
          <icosahedronGeometry
            args={[
              0.8,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#397038"
            roughness={0.95}
          />
        </mesh>
  
      </group>
    );
  }
  
  
  // =====================================================
  // REAL TREE MODEL
  // =====================================================
  
  function RealFarmTree() {
  
    // ===================================================
    // LOAD CACHED GLB
    // ===================================================
  
    const gltf =
      useGLTF(
        TREE_MODEL_PATH
      );
  
  
    // ===================================================
    // PREPARE MODEL
    // ===================================================
  
    useEffect(() => {
  
      gltf.scene.traverse(
        (object) => {
  
          if (!object.isMesh) {
            return;
          }
  
  
          object.castShadow =
            true;
  
          object.receiveShadow =
            true;
  
  
          if (!object.material) {
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
              // TREE LEAF MATERIAL SUPPORT
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
              // ALPHA-CUTOUT SUPPORT
              // =========================================
              //
              // Many vegetation GLBs use transparent
              // leaf cards. Alpha testing gives cleaner
              // foliage than standard transparency.
              // =========================================
  
              if (
                material.map &&
                (
                  material.transparent ||
                  material.alphaMap
                )
              ) {
  
                material.alphaTest =
                  Math.max(
                    material.alphaTest || 0,
                    0.35
                  );
              }
  
  
              material.needsUpdate =
                true;
            }
          );
        }
      );
  
    }, [
      gltf,
    ]);
  
  
    return (
      <Clone
        object={
          gltf.scene
        }
  
        deep
  
        castShadow
  
        receiveShadow
      />
    );
  }
  
  
  // =====================================================
  // TREE CONTROLLER
  // =====================================================
  
  function FarmTree({
    position = [0, 0, 0],
  
    scale = 1,
  
    rotation = 0,
  
    useRealModel = true,
  }) {
  
    // ===================================================
    // REAL TREE NORMALIZATION
    // ===================================================
    //
    // GLB models use their own native dimensions.
    //
    // We keep normalization isolated here so if the tree
    // appears too large/small, we only change ONE value.
    // ===================================================
  
    const realTreeBaseScale =
      0.32;
  
  
    const finalScale =
      realTreeBaseScale *
      scale;
  
  
    return (
      <group
        position={
          position
        }
  
        rotation={[
          0,
          rotation,
          0,
        ]}
      >
  
        {useRealModel ? (
  
          <group
            scale={[
              finalScale,
              finalScale,
              finalScale,
            ]}
          >
            <RealFarmTree />
          </group>
  
        ) : (
  
          <ProceduralFarmTree
            scale={
              scale
            }
          />
  
        )}
  
      </group>
    );
  }
  
  
  // =====================================================
  // BUSH
  // =====================================================
  //
  // Existing bush system preserved.
  // =====================================================
  
  function FarmBush({
    position = [0, 0, 0],
  
    scale = 1,
  }) {
  
    return (
      <group
        position={
          position
        }
  
        scale={
          scale
        }
      >
  
        <mesh
          position={[
            0,
            0.35,
            0,
          ]}
  
          scale={[
            1,
            0.7,
            0.85,
          ]}
  
          castShadow
  
          receiveShadow
        >
  
          <icosahedronGeometry
            args={[
              0.55,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#376b35"
            roughness={1}
          />
  
        </mesh>
  
  
        <mesh
          position={[
            -0.32,
            0.3,
            0.05,
          ]}
  
          scale={[
            0.75,
            0.65,
            0.7,
          ]}
  
          castShadow
        >
  
          <icosahedronGeometry
            args={[
              0.45,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#477c3d"
            roughness={1}
          />
  
        </mesh>
  
  
        <mesh
          position={[
            0.34,
            0.28,
            -0.04,
          ]}
  
          scale={[
            0.7,
            0.62,
            0.7,
          ]}
  
          castShadow
        >
  
          <icosahedronGeometry
            args={[
              0.43,
              1,
            ]}
          />
  
          <meshStandardMaterial
            color="#2f6534"
            roughness={1}
          />
  
        </mesh>
  
      </group>
    );
  }
  
  
  // =====================================================
  // GRASS CLUSTER
  // =====================================================
  //
  // Existing grass system preserved.
  // =====================================================
  
  function GrassCluster({
    position = [0, 0, 0],
  
    scale = 1,
  
    rotation = 0,
  }) {
  
    return (
      <group
        position={
          position
        }
  
        scale={
          scale
        }
  
        rotation={[
          0,
          rotation,
          0,
        ]}
      >
  
        <mesh
          position={[
            -0.08,
            0.18,
            0,
          ]}
  
          rotation={[
            0,
            0,
            -0.18,
          ]}
  
          castShadow
        >
  
          <coneGeometry
            args={[
              0.07,
              0.42,
              4,
            ]}
          />
  
          <meshStandardMaterial
            color="#5d873c"
            roughness={1}
          />
  
        </mesh>
  
  
        <mesh
          position={[
            0.08,
            0.2,
            0.03,
          ]}
  
          rotation={[
            0,
            0,
            0.18,
          ]}
  
          castShadow
        >
  
          <coneGeometry
            args={[
              0.065,
              0.46,
              4,
            ]}
          />
  
          <meshStandardMaterial
            color="#6a9444"
            roughness={1}
          />
  
        </mesh>
  
  
        <mesh
          position={[
            0,
            0.23,
            -0.07,
          ]}
  
          castShadow
        >
  
          <coneGeometry
            args={[
              0.065,
              0.5,
              4,
            ]}
          />
  
          <meshStandardMaterial
            color="#4f7b37"
            roughness={1}
          />
  
        </mesh>
  
      </group>
    );
  }
  
  
  // =====================================================
  // MAIN VEGETATION SYSTEM
  // =====================================================
  
  export default function FarmVegetation() {
  
    // ===================================================
    // TREE LOCATIONS
    // ===================================================
    //
    // Original positions preserved.
    //
    // Extra modelScale gives us more control over the
    // visual variation of real trees.
    // ===================================================
  
    const trees = useMemo(
      () => [
        {
          position: [
            -17,
            0,
            -13,
          ],
          scale: 1.25,
          rotation: 0.3,
        },
  
        {
          position: [
            -13.5,
            0,
            -16,
          ],
          scale: 0.95,
          rotation: 1.1,
        },
  
        {
          position: [
            -8.5,
            0,
            -17,
          ],
          scale: 1.15,
          rotation: 2.2,
        },
  
        {
          position: [
            9,
            0,
            -17,
          ],
          scale: 1.1,
          rotation: 0.8,
        },
  
        {
          position: [
            14,
            0,
            -15,
          ],
          scale: 1.3,
          rotation: 1.7,
        },
  
        {
          position: [
            17,
            0,
            -10,
          ],
          scale: 0.95,
          rotation: 2.6,
        },
  
        {
          position: [
            -18,
            0,
            4,
          ],
          scale: 1.1,
          rotation: 0.5,
        },
  
        {
          position: [
            18,
            0,
            3,
          ],
          scale: 1.2,
          rotation: 1.4,
        },
  
        {
          position: [
            -16,
            0,
            13,
          ],
          scale: 1.15,
          rotation: 2.1,
        },
  
        {
          position: [
            15,
            0,
            14,
          ],
          scale: 1,
          rotation: 0.9,
        },
      ],
      []
    );
  
  
    // ===================================================
    // BUSH LOCATIONS
    // ===================================================
  
    const bushes = useMemo(
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
  
    const grass = useMemo(
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
  
  
          // =============================================
          // KEEP GRASS OUTSIDE CULTIVATED CENTRE
          // =============================================
  
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
            REAL BOUNDARY TREES
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
  
              useRealModel
            />
  
          )
        )}
  
  
        {/* ===============================================
            EXISTING BOUNDARY BUSHES
        =============================================== */}
  
        {bushes.map(
          (
            position,
            index
          ) => (
  
            <FarmBush
              key={
                `bush-${index}`
              }
  
              position={
                position
              }
  
              scale={
                0.8 +
                (
                  index % 4
                ) *
                0.08
              }
            />
  
          )
        )}
  
  
        {/* ===============================================
            EXISTING NATURAL GRASS
        =============================================== */}
  
        {grass.map(
          (item) => (
  
            <GrassCluster
              key={
                `grass-${item.id}`
              }
  
              position={
                item.position
              }
  
              scale={
                item.scale
              }
  
              rotation={
                item.rotation
              }
            />
  
          )
        )}
  
      </group>
    );
  }
  
  
  // =====================================================
  // PRELOAD TREE MODEL
  // =====================================================
  
  useGLTF.preload(
    TREE_MODEL_PATH
  );
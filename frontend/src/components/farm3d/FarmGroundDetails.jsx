import { useMemo } from "react";


// =====================================================
// KRISHIMITRA AI
// FARM GROUND DETAILS
// =====================================================
//
// Adds small environmental details that make the
// procedural farm feel less empty and artificial.
//
// CURRENT:
// - Natural stones
// - Grass-edge patches
// - Dry soil clumps
// - Field boundary markers
// - Path-side details
//
// FUTURE:
// - Real texture maps
// - Fallen leaves
// - Farm tools
// - Fences
// - Water structures
// - GLB environmental props
// =====================================================


// =====================================================
// NATURAL STONE
// =====================================================

function FarmStone({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
}) {
  return (
    <mesh
      position={position}
      scale={[
        scale,
        scale * 0.55,
        scale * 0.8,
      ]}
      rotation={[
        0.1,
        rotation,
        0.08,
      ]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry
        args={[0.22, 0]}
      />

      <meshStandardMaterial
        color="#777266"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}


// =====================================================
// SOIL CLUMP
// =====================================================

function SoilClump({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
}) {
  return (
    <mesh
      position={position}
      scale={[
        scale,
        scale * 0.45,
        scale * 0.7,
      ]}
      rotation={[
        0,
        rotation,
        0,
      ]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry
        args={[0.18, 0]}
      />

      <meshStandardMaterial
        color="#62432d"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}


// =====================================================
// WILD GRASS PATCH
// =====================================================

function WildGrassPatch({
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
      <mesh
        position={[
          -0.12,
          0.18,
          0,
        ]}
        rotation={[
          0,
          0,
          -0.2,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.055,
            0.42,
            4,
          ]}
        />

        <meshStandardMaterial
          color="#668b3f"
          roughness={1}
        />
      </mesh>


      <mesh
        position={[
          0.02,
          0.23,
          0.02,
        ]}
        rotation={[
          0.05,
          0,
          0.05,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.06,
            0.52,
            4,
          ]}
        />

        <meshStandardMaterial
          color="#779b49"
          roughness={1}
        />
      </mesh>


      <mesh
        position={[
          0.14,
          0.17,
          -0.04,
        ]}
        rotation={[
          0,
          0,
          0.22,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.05,
            0.4,
            4,
          ]}
        />

        <meshStandardMaterial
          color="#527a38"
          roughness={1}
        />
      </mesh>


      <mesh
        position={[
          -0.03,
          0.15,
          -0.12,
        ]}
        rotation={[
          -0.1,
          0,
          -0.12,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.045,
            0.36,
            4,
          ]}
        />

        <meshStandardMaterial
          color="#86a654"
          roughness={1}
        />
      </mesh>
    </group>
  );
}


// =====================================================
// FIELD BOUNDARY POST
// =====================================================

function BoundaryPost({
  position = [0, 0, 0],
  rotation = 0,
}) {
  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      <mesh
        position={[
          0,
          0.42,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            0.065,
            0.085,
            0.84,
            7,
          ]}
        />

        <meshStandardMaterial
          color="#755438"
          roughness={1}
        />
      </mesh>


      <mesh
        position={[
          0,
          0.86,
          0,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.09,
            0.16,
            7,
          ]}
        />

        <meshStandardMaterial
          color="#66452f"
          roughness={1}
        />
      </mesh>
    </group>
  );
}


// =====================================================
// MAIN GROUND DETAIL SYSTEM
// =====================================================

export default function FarmGroundDetails() {

  // ===================================================
  // STONES
  // ===================================================

  const stones = useMemo(
    () => [
      [-11.8, 0.05, -8.8],
      [-10.5, 0.05, 9.2],
      [-13.2, 0.05, 5.8],
      [12.4, 0.05, -8.7],
      [13.6, 0.05, 7.4],
      [9.8, 0.05, 10.5],
      [-7.8, 0.05, 11.2],
      [7.2, 0.05, -11],
      [-14.4, 0.05, -4],
      [14.2, 0.05, 3.5],
    ],
    []
  );


  // ===================================================
  // SOIL CLUMPS
  // ===================================================

  const soilClumps = useMemo(
    () => [
      [-7.3, 0.16, -7.1],
      [-3.5, 0.16, -7.2],
      [3.1, 0.16, -7],
      [7.1, 0.16, -6.9],

      [-7.4, 0.16, 7],
      [-3.3, 0.16, 7.1],
      [3.2, 0.16, 7],
      [7.3, 0.16, 6.9],
    ],
    []
  );


  // ===================================================
  // WILD GRASS
  // ===================================================

  const wildGrass = useMemo(
    () => [
      [-11.7, 0, -9.6],
      [-9.2, 0, -10.7],
      [-6.4, 0, -11.1],
      [-2.5, 0, -11.3],
      [2.3, 0, -11.2],
      [6.2, 0, -11],
      [9.6, 0, -10.4],
      [11.8, 0, -9],

      [-12.4, 0, 9],
      [-9.8, 0, 10.4],
      [-6.7, 0, 11],
      [-2.8, 0, 11.3],
      [2.8, 0, 11.2],
      [6.5, 0, 10.9],
      [9.7, 0, 10.2],
      [12, 0, 8.8],

      [-13.5, 0, -6],
      [-13.7, 0, 0],
      [-13.4, 0, 6],

      [13.5, 0, -6],
      [13.7, 0, 0],
      [13.4, 0, 6],
    ],
    []
  );


  // ===================================================
  // FIELD POSTS
  // ===================================================

  const posts = useMemo(
    () => [
      [-12.7, 0, -9.7],
      [12.7, 0, -9.7],
      [-12.7, 0, 9.7],
      [12.7, 0, 9.7],

      [-12.7, 0, -3.3],
      [-12.7, 0, 3.3],

      [12.7, 0, -3.3],
      [12.7, 0, 3.3],
    ],
    []
  );


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>

      {/* NATURAL STONES */}

      {stones.map(
        (
          position,
          index
        ) => (
          <FarmStone
            key={`stone-${index}`}
            position={position}
            scale={
              0.75 +
              (index % 4) * 0.13
            }
            rotation={
              index * 0.72
            }
          />
        )
      )}


      {/* CULTIVATED SOIL CLUMPS */}

      {soilClumps.map(
        (
          position,
          index
        ) => (
          <SoilClump
            key={`soil-${index}`}
            position={position}
            scale={
              0.7 +
              (index % 3) * 0.14
            }
            rotation={
              index * 0.9
            }
          />
        )
      )}


      {/* FIELD-EDGE GRASS */}

      {wildGrass.map(
        (
          position,
          index
        ) => (
          <WildGrassPatch
            key={`wild-grass-${index}`}
            position={position}
            scale={
              0.75 +
              (index % 5) * 0.08
            }
            rotation={
              index * 0.61
            }
          />
        )
      )}


      {/* BOUNDARY POSTS */}

      {posts.map(
        (
          position,
          index
        ) => (
          <BoundaryPost
            key={`post-${index}`}
            position={position}
            rotation={
              index * 0.17
            }
          />
        )
      )}

    </group>
  );
}
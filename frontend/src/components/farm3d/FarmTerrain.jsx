import * as THREE from "three";

import {
  useMemo,
} from "react";

import {
  useTexture,
} from "@react-three/drei";


// =====================================================
// KRISHIMITRA AI
// NATURAL 3D FARM TERRAIN
// =====================================================
//
// CURRENT:
//
// - Procedural natural terrain
// - PBR grass landscape
// - PBR cultivated soil
// - Grass boundaries
// - Normal mapping
// - Roughness mapping
// - Texture tiling
//
// FUTURE:
//
// - Terrain material blending
// - Seasonal vegetation
// - Moisture-dependent soil
// - Weather-dependent terrain
// =====================================================


export default function FarmTerrain() {

  // ===================================================
  // LOAD SOIL TEXTURES
  // ===================================================

  const [
    soilColor,
    soilNormal,
    soilRoughness,
  ] = useTexture([
    "/assets/farm3d/textures/soil/soil_color.jpg",
    "/assets/farm3d/textures/soil/soil_normal.png",
    "/assets/farm3d/textures/soil/soil_roughness.jpg",
  ]);


  // ===================================================
  // LOAD GRASS TEXTURES
  // ===================================================

  const [
    grassColor,
    grassNormal,
    grassRoughness,
  ] = useTexture([
    "/assets/farm3d/textures/grass/grass_color.jpg",
    "/assets/farm3d/textures/grass/grass_normal.png",
    "/assets/farm3d/textures/grass/grass_roughness.png",
  ]);


  // ===================================================
  // CONFIGURE TEXTURES
  // ===================================================

  useMemo(() => {

    const soilTextures = [
      soilColor,
      soilNormal,
      soilRoughness,
    ];


    soilTextures.forEach(
      (texture) => {

        texture.wrapS =
          THREE.RepeatWrapping;

        texture.wrapT =
          THREE.RepeatWrapping;

        texture.repeat.set(
          4,
          3
        );

        texture.anisotropy =
          8;

        texture.needsUpdate =
          true;
      }
    );


    const grassTextures = [
      grassColor,
      grassNormal,
      grassRoughness,
    ];


    grassTextures.forEach(
      (texture) => {

        texture.wrapS =
          THREE.RepeatWrapping;

        texture.wrapT =
          THREE.RepeatWrapping;

        texture.repeat.set(
          12,
          12
        );

        texture.anisotropy =
          8;

        texture.needsUpdate =
          true;
      }
    );


    // ===============================================
    // COLOR SPACE
    // ===============================================

    soilColor.colorSpace =
      THREE.SRGBColorSpace;

    grassColor.colorSpace =
      THREE.SRGBColorSpace;


    soilNormal.colorSpace =
      THREE.NoColorSpace;

    soilRoughness.colorSpace =
      THREE.NoColorSpace;

    grassNormal.colorSpace =
      THREE.NoColorSpace;

    grassRoughness.colorSpace =
      THREE.NoColorSpace;


    soilColor.needsUpdate =
      true;

    soilNormal.needsUpdate =
      true;

    soilRoughness.needsUpdate =
      true;

    grassColor.needsUpdate =
      true;

    grassNormal.needsUpdate =
      true;

    grassRoughness.needsUpdate =
      true;

  }, [
    soilColor,
    soilNormal,
    soilRoughness,
    grassColor,
    grassNormal,
    grassRoughness,
  ]);


  // ===================================================
  // PROCEDURAL TERRAIN GEOMETRY
  // ===================================================

  const terrainGeometry = useMemo(() => {

    const geometry =
      new THREE.PlaneGeometry(
        60,
        60,
        80,
        80
      );


    const positions =
      geometry.attributes.position;


    for (
      let i = 0;
      i < positions.count;
      i += 1
    ) {

      const x =
        positions.getX(i);

      const y =
        positions.getY(i);


      const distanceFromCenter =
        Math.sqrt(
          x * x +
          y * y
        );


      // Keep the actual cultivated region relatively
      // flat while creating subtle natural elevation
      // farther away from the farm.

      const outerStrength =
        THREE.MathUtils.clamp(
          (
            distanceFromCenter -
            12
          ) / 18,
          0,
          1
        );


      const waveOne =
        Math.sin(
          x * 0.32
        ) * 0.28;


      const waveTwo =
        Math.cos(
          y * 0.27
        ) * 0.22;


      const waveThree =
        Math.sin(
          (
            x +
            y
          ) * 0.16
        ) * 0.18;


      const smallerVariation =
        Math.sin(
          x * 0.7 +
          y * 0.35
        ) * 0.08;


      const height =
        (
          waveOne +
          waveTwo +
          waveThree +
          smallerVariation
        ) *
        outerStrength;


      positions.setZ(
        i,
        height
      );
    }


    positions.needsUpdate =
      true;


    geometry.computeVertexNormals();


    return geometry;

  }, []);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>


      {/* ===============================================
          PBR NATURAL GRASS LAND
      =============================================== */}

      <mesh
        geometry={
          terrainGeometry
        }

        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}

        position={[
          0,
          -0.14,
          0,
        ]}

        receiveShadow
      >

        <meshStandardMaterial
          map={
            grassColor
          }

          normalMap={
            grassNormal
          }

          roughnessMap={
            grassRoughness
          }

          normalScale={
            new THREE.Vector2(
              0.55,
              0.55
            )
          }

          roughness={
            1
          }

          metalness={
            0
          }
        />

      </mesh>


      {/* ===============================================
          PBR CENTRAL FARM SOIL
      =============================================== */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}

        position={[
          0,
          -0.045,
          0,
        ]}

        receiveShadow
      >

        <planeGeometry
          args={[
            25,
            19,
            1,
            1,
          ]}
        />


        <meshStandardMaterial
          map={
            soilColor
          }

          normalMap={
            soilNormal
          }

          roughnessMap={
            soilRoughness
          }

          normalScale={
            new THREE.Vector2(
              0.7,
              0.7
            )
          }

          roughness={
            1
          }

          metalness={
            0
          }
        />

      </mesh>


      {/* ===============================================
          LEFT GRASS BORDER
      =============================================== */}

      <mesh
        position={[
          -13.1,
          -0.02,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            1.2,
            0.08,
            20,
          ]}
        />

        <meshStandardMaterial
          map={grassColor}
          normalMap={grassNormal}
          roughnessMap={
            grassRoughness
          }
          roughness={1}
          metalness={0}
        />
      </mesh>


      {/* ===============================================
          RIGHT GRASS BORDER
      =============================================== */}

      <mesh
        position={[
          13.1,
          -0.02,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            1.2,
            0.08,
            20,
          ]}
        />

        <meshStandardMaterial
          map={grassColor}
          normalMap={grassNormal}
          roughnessMap={
            grassRoughness
          }
          roughness={1}
          metalness={0}
        />
      </mesh>


      {/* ===============================================
          FRONT GRASS BORDER
      =============================================== */}

      <mesh
        position={[
          0,
          -0.02,
          10.1,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            27.4,
            0.08,
            1.2,
          ]}
        />

        <meshStandardMaterial
          map={grassColor}
          normalMap={grassNormal}
          roughnessMap={
            grassRoughness
          }
          roughness={1}
          metalness={0}
        />
      </mesh>


      {/* ===============================================
          BACK GRASS BORDER
      =============================================== */}

      <mesh
        position={[
          0,
          -0.02,
          -10.1,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            27.4,
            0.08,
            1.2,
          ]}
        />

        <meshStandardMaterial
          map={grassColor}
          normalMap={grassNormal}
          roughnessMap={
            grassRoughness
          }
          roughness={1}
          metalness={0}
        />
      </mesh>

    </group>
  );
}
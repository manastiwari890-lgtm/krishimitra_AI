import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

// =====================================================
// KRISHIMITRA AI
// HIGH QUALITY + OPTIMIZED FARM TERRAIN
// =====================================================
//
// FEATURES
//
// ✓ Smooth procedural terrain
// ✓ 4K-ready PBR textures
// ✓ Proper sRGB color management
// ✓ Normal mapping
// ✓ Roughness mapping
// ✓ Anisotropic filtering
// ✓ Mipmap filtering
// ✓ Controlled texture repetition
// ✓ Smooth central cultivated area
// ✓ Natural outer terrain
// ✓ No unnecessary terrain subdivisions
//
// IMPORTANT
//
// Texture quality is improved WITHOUT increasing
// terrain geometry.
//
// This keeps the farm smooth AND performant.
// =====================================================

export default function FarmTerrain() {

  // ===================================================
  // THREE.JS RENDERER
  // ===================================================

  const { gl } = useThree();


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
  // TEXTURE CONFIGURATION
  // ===================================================

  useEffect(() => {

    const maxAnisotropy =
      gl.capabilities.getMaxAnisotropy();


    // ===============================================
    // SOIL TEXTURES
    // ===============================================

    const soilTextures = [
      soilColor,
      soilNormal,
      soilRoughness,
    ];


    soilTextures.forEach((texture) => {

      texture.wrapS =
        THREE.RepeatWrapping;

      texture.wrapT =
        THREE.RepeatWrapping;


      // Controlled repetition.
      // Higher values make the texture look repetitive.
      // Lower values preserve the 4K detail better.

      texture.repeat.set(
        3.2,
        2.6
      );


      texture.anisotropy =
        Math.min(
          16,
          maxAnisotropy
        );


      texture.minFilter =
        THREE.LinearMipmapLinearFilter;

      texture.magFilter =
        THREE.LinearFilter;


      texture.generateMipmaps =
        true;


      texture.needsUpdate =
        true;
    });


    // ===============================================
    // GRASS TEXTURES
    // ===============================================

    const grassTextures = [
      grassColor,
      grassNormal,
      grassRoughness,
    ];


    grassTextures.forEach((texture) => {

      texture.wrapS =
        THREE.RepeatWrapping;

      texture.wrapT =
        THREE.RepeatWrapping;


      // Grass can repeat more frequently
      // because the camera sees a larger area.

      texture.repeat.set(
        8,
        8
      );


      texture.anisotropy =
        Math.min(
          16,
          maxAnisotropy
        );


      texture.minFilter =
        THREE.LinearMipmapLinearFilter;

      texture.magFilter =
        THREE.LinearFilter;


      texture.generateMipmaps =
        true;


      texture.needsUpdate =
        true;
    });


    // ===============================================
    // COLOR SPACE
    // ===============================================

    soilColor.colorSpace =
      THREE.SRGBColorSpace;

    grassColor.colorSpace =
      THREE.SRGBColorSpace;


    // ===============================================
    // NON-COLOR TEXTURES
    // ===============================================

    soilNormal.colorSpace =
      THREE.NoColorSpace;

    soilRoughness.colorSpace =
      THREE.NoColorSpace;

    grassNormal.colorSpace =
      THREE.NoColorSpace;

    grassRoughness.colorSpace =
      THREE.NoColorSpace;


    // ===============================================
    // UPDATE
    // ===============================================

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
    gl,
    soilColor,
    soilNormal,
    soilRoughness,
    grassColor,
    grassNormal,
    grassRoughness,
  ]);


  // ===================================================
  // TERRAIN GEOMETRY
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


      // =============================================
      // DISTANCE FROM FARM CENTER
      // =============================================

      const distanceFromCenter =
        Math.sqrt(
          x * x +
          y * y
        );


      // =============================================
      // KEEP FARM AREA SMOOTH
      // =============================================

      const outerStrength =
        THREE.MathUtils.clamp(
          (
            distanceFromCenter -
            12
          ) / 18,
          0,
          1
        );


      // =============================================
      // LARGE NATURAL WAVES
      // =============================================

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
          (x + y) * 0.16
        ) * 0.18;


      // =============================================
      // SMALL NATURAL VARIATION
      // =============================================

      const smallerVariation =
        Math.sin(
          x * 0.7 +
          y * 0.35
        ) * 0.08;


      // =============================================
      // FINAL HEIGHT
      // =============================================

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


    // Recalculate smooth normals.

    geometry.computeVertexNormals();


    // Helps avoid unnecessary memory retention.

    geometry.computeBoundingSphere();


    return geometry;

  }, []);


  // ===================================================
  // MATERIALS
  // ===================================================

  const grassMaterial =
    useMemo(() => {

      return (
        <meshStandardMaterial
          map={grassColor}
          normalMap={grassNormal}
          roughnessMap={grassRoughness}

          normalScale={
            new THREE.Vector2(
              0.48,
              0.48
            )
          }

          roughness={0.95}
          metalness={0}

          envMapIntensity={0.55}
        />
      );

    }, [
      grassColor,
      grassNormal,
      grassRoughness,
    ]);


  const soilMaterial =
    useMemo(() => {

      return (
        <meshStandardMaterial
          map={soilColor}
          normalMap={soilNormal}
          roughnessMap={soilRoughness}

          normalScale={
            new THREE.Vector2(
              0.62,
              0.62
            )
          }

          roughness={0.96}
          metalness={0}

          envMapIntensity={0.5}
        />
      );

    }, [
      soilColor,
      soilNormal,
      soilRoughness,
    ]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>


      {/* =================================================
          NATURAL OUTER GRASS TERRAIN
      ================================================= */}

      <mesh
        geometry={terrainGeometry}

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

        {grassMaterial}

      </mesh>


      {/* =================================================
          CENTRAL CULTIVATED FARM SOIL
      ================================================= */}

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

        {soilMaterial}

      </mesh>


      {/* =================================================
          LEFT GRASS BORDER
      ================================================= */}

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

        {grassMaterial}

      </mesh>


      {/* =================================================
          RIGHT GRASS BORDER
      ================================================= */}

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

        {grassMaterial}

      </mesh>


      {/* =================================================
          FRONT GRASS BORDER
      ================================================= */}

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

        {grassMaterial}

      </mesh>


      {/* =================================================
          BACK GRASS BORDER
      ================================================= */}

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

        {grassMaterial}

      </mesh>

    </group>
  );
}
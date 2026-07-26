import * as THREE from "three";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";


// =====================================================
// KRISHIMITRA AI
// OPTIMIZED FARM GROUND DETAILS
// PERFORMANCE PASS 4
// =====================================================
//
// Improvements:
//
// - Stones use InstancedMesh
// - Soil clumps use InstancedMesh
// - Wild grass uses InstancedMesh
// - Boundary posts use InstancedMesh
// - Shared geometries
// - Shared materials
// - Tiny decorative shadows removed
// - Original positions preserved
//
// =====================================================


// =====================================================
// INSTANCED STONES
// =====================================================

function InstancedStones({ stones }) {
  const meshRef = useRef(null);

  const geometry = useMemo(
    () => new THREE.DodecahedronGeometry(0.22, 0),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#777266",
        roughness: 1,
        metalness: 0,
      }),
    [],
  );

  useEffect(() => {
    if (!meshRef.current) {
      return;
    }

    const dummy = new THREE.Object3D();

    stones.forEach((position, index) => {
      const stoneScale =
        0.75 + (index % 4) * 0.13;

      dummy.position.set(
        position[0],
        position[1],
        position[2],
      );

      dummy.rotation.set(
        0.1,
        index * 0.72,
        0.08,
      );

      dummy.scale.set(
        stoneScale,
        stoneScale * 0.55,
        stoneScale * 0.8,
      );

      dummy.updateMatrix();

      meshRef.current.setMatrixAt(
        index,
        dummy.matrix,
      );
    });

    meshRef.current.instanceMatrix.needsUpdate =
      true;

    meshRef.current.computeBoundingSphere();
  }, [stones]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        geometry,
        material,
        stones.length,
      ]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}


// =====================================================
// INSTANCED SOIL CLUMPS
// =====================================================

function InstancedSoilClumps({
  soilClumps,
}) {
  const meshRef = useRef(null);

  const geometry = useMemo(
    () => new THREE.DodecahedronGeometry(0.18, 0),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#62432d",
        roughness: 1,
        metalness: 0,
      }),
    [],
  );

  useEffect(() => {
    if (!meshRef.current) {
      return;
    }

    const dummy = new THREE.Object3D();

    soilClumps.forEach(
      (position, index) => {
        const clumpScale =
          0.7 + (index % 3) * 0.14;

        dummy.position.set(
          position[0],
          position[1],
          position[2],
        );

        dummy.rotation.set(
          0,
          index * 0.9,
          0,
        );

        dummy.scale.set(
          clumpScale,
          clumpScale * 0.45,
          clumpScale * 0.7,
        );

        dummy.updateMatrix();

        meshRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );
      },
    );

    meshRef.current.instanceMatrix.needsUpdate =
      true;

    meshRef.current.computeBoundingSphere();
  }, [soilClumps]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        geometry,
        material,
        soilClumps.length,
      ]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}


// =====================================================
// INSTANCED WILD GRASS
// =====================================================

function InstancedWildGrass({
  wildGrass,
}) {
  const bladeOneRef = useRef(null);
  const bladeTwoRef = useRef(null);
  const bladeThreeRef = useRef(null);
  const bladeFourRef = useRef(null);

  const geometries = useMemo(
    () => ({
      one: new THREE.ConeGeometry(
        0.055,
        0.42,
        4,
      ),

      two: new THREE.ConeGeometry(
        0.06,
        0.52,
        4,
      ),

      three: new THREE.ConeGeometry(
        0.05,
        0.4,
        4,
      ),

      four: new THREE.ConeGeometry(
        0.045,
        0.36,
        4,
      ),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      one: new THREE.MeshStandardMaterial({
        color: "#668b3f",
        roughness: 1,
      }),

      two: new THREE.MeshStandardMaterial({
        color: "#779b49",
        roughness: 1,
      }),

      three: new THREE.MeshStandardMaterial({
        color: "#527a38",
        roughness: 1,
      }),

      four: new THREE.MeshStandardMaterial({
        color: "#86a654",
        roughness: 1,
      }),
    }),
    [],
  );

  useEffect(() => {
    const refs = [
      bladeOneRef.current,
      bladeTwoRef.current,
      bladeThreeRef.current,
      bladeFourRef.current,
    ];

    if (refs.some((mesh) => !mesh)) {
      return;
    }

    const dummy = new THREE.Object3D();

    wildGrass.forEach(
      (position, index) => {
        const patchScale =
          0.75 + (index % 5) * 0.08;

        const patchRotation =
          index * 0.61;

        // ---------------------------------------------
        // BLADE 1
        // ---------------------------------------------

        dummy.position.set(
          position[0] -
            0.12 * patchScale,
          position[1] +
            0.18 * patchScale,
          position[2],
        );

        dummy.rotation.set(
          0,
          patchRotation,
          -0.2,
        );

        dummy.scale.setScalar(
          patchScale,
        );

        dummy.updateMatrix();

        bladeOneRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );


        // ---------------------------------------------
        // BLADE 2
        // ---------------------------------------------

        dummy.position.set(
          position[0] +
            0.02 * patchScale,
          position[1] +
            0.23 * patchScale,
          position[2] +
            0.02 * patchScale,
        );

        dummy.rotation.set(
          0.05,
          patchRotation,
          0.05,
        );

        dummy.scale.setScalar(
          patchScale,
        );

        dummy.updateMatrix();

        bladeTwoRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );


        // ---------------------------------------------
        // BLADE 3
        // ---------------------------------------------

        dummy.position.set(
          position[0] +
            0.14 * patchScale,
          position[1] +
            0.17 * patchScale,
          position[2] -
            0.04 * patchScale,
        );

        dummy.rotation.set(
          0,
          patchRotation,
          0.22,
        );

        dummy.scale.setScalar(
          patchScale,
        );

        dummy.updateMatrix();

        bladeThreeRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );


        // ---------------------------------------------
        // BLADE 4
        // ---------------------------------------------

        dummy.position.set(
          position[0] -
            0.03 * patchScale,
          position[1] +
            0.15 * patchScale,
          position[2] -
            0.12 * patchScale,
        );

        dummy.rotation.set(
          -0.1,
          patchRotation,
          -0.12,
        );

        dummy.scale.setScalar(
          patchScale,
        );

        dummy.updateMatrix();

        bladeFourRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );
      },
    );

    refs.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate =
        true;

      mesh.computeBoundingSphere();
    });
  }, [wildGrass]);

  return (
    <>
      <instancedMesh
        ref={bladeOneRef}
        args={[
          geometries.one,
          materials.one,
          wildGrass.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />

      <instancedMesh
        ref={bladeTwoRef}
        args={[
          geometries.two,
          materials.two,
          wildGrass.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />

      <instancedMesh
        ref={bladeThreeRef}
        args={[
          geometries.three,
          materials.three,
          wildGrass.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />

      <instancedMesh
        ref={bladeFourRef}
        args={[
          geometries.four,
          materials.four,
          wildGrass.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />
    </>
  );
}


// =====================================================
// INSTANCED BOUNDARY POSTS
// =====================================================

function InstancedBoundaryPosts({
  posts,
}) {
  const postRef = useRef(null);
  const topRef = useRef(null);

  const geometries = useMemo(
    () => ({
      post: new THREE.CylinderGeometry(
        0.065,
        0.085,
        0.84,
        7,
      ),

      top: new THREE.ConeGeometry(
        0.09,
        0.16,
        7,
      ),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      post: new THREE.MeshStandardMaterial({
        color: "#755438",
        roughness: 1,
      }),

      top: new THREE.MeshStandardMaterial({
        color: "#66452f",
        roughness: 1,
      }),
    }),
    [],
  );

  useEffect(() => {
    if (
      !postRef.current ||
      !topRef.current
    ) {
      return;
    }

    const dummy = new THREE.Object3D();

    posts.forEach(
      (position, index) => {
        const rotation =
          index * 0.17;

        // ---------------------------------------------
        // POST
        // ---------------------------------------------

        dummy.position.set(
          position[0],
          position[1] + 0.42,
          position[2],
        );

        dummy.rotation.set(
          0,
          rotation,
          0,
        );

        dummy.scale.set(1, 1, 1);

        dummy.updateMatrix();

        postRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );


        // ---------------------------------------------
        // TOP
        // ---------------------------------------------

        dummy.position.set(
          position[0],
          position[1] + 0.86,
          position[2],
        );

        dummy.rotation.set(
          0,
          rotation,
          0,
        );

        dummy.scale.set(1, 1, 1);

        dummy.updateMatrix();

        topRef.current.setMatrixAt(
          index,
          dummy.matrix,
        );
      },
    );

    postRef.current.instanceMatrix.needsUpdate =
      true;

    topRef.current.instanceMatrix.needsUpdate =
      true;

    postRef.current.computeBoundingSphere();
    topRef.current.computeBoundingSphere();
  }, [posts]);

  return (
    <>
      <instancedMesh
        ref={postRef}
        args={[
          geometries.post,
          materials.post,
          posts.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />

      <instancedMesh
        ref={topRef}
        args={[
          geometries.top,
          materials.top,
          posts.length,
        ]}
        castShadow={false}
        receiveShadow={false}
      />
    </>
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
    [],
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
    [],
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
    [],
  );


  // ===================================================
  // BOUNDARY POSTS
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
    [],
  );


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group>

      <InstancedStones
        stones={stones}
      />

      <InstancedSoilClumps
        soilClumps={soilClumps}
      />

      <InstancedWildGrass
        wildGrass={wildGrass}
      />

      <InstancedBoundaryPosts
        posts={posts}
      />

    </group>
  );
}
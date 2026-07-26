import { useMemo } from "react";

import CropPlant from "./CropPlant";


// =====================================================
// KRISHIMITRA AI
// OPTIMIZED 3D CROP FIELD SYSTEM
// =====================================================
//
// PERFORMANCE PASS 1
//
// Improvements:
// - Reduced default crop density
// - Deterministic plant variation
// - Deterministic rotation
// - Memoized plant generation
// - Preserves health system
// - Preserves growth system
// - Preserves real GLB crop rendering
//
// Future optimization:
// - Full InstancedMesh crop rendering
// - Distance based LOD
// =====================================================


export default function CropField({
  position = [0, 0, 0],

  width = 6.4,

  depth = 5.6,

  // Reduced from 7 × 9 = 63 plants
  // to 5 × 7 = 35 plants per plot.
  //
  // Four plots:
  // BEFORE = 252 plants
  // NOW    = 140 plants

  rows = 5,

  plantsPerRow = 7,

  health = "healthy",

  growth = 1,
}) {

  // ===================================================
  // GENERATE PLANTS
  // ===================================================

  const plants = useMemo(() => {

    const generatedPlants = [];

    const xSpacing =
      width / plantsPerRow;

    const zSpacing =
      depth / rows;


    for (
      let row = 0;
      row < rows;
      row += 1
    ) {

      for (
        let plant = 0;
        plant < plantsPerRow;
        plant += 1
      ) {

        // =============================================
        // POSITION
        // =============================================

        const x =
          -width / 2 +
          xSpacing / 2 +
          plant * xSpacing;

        const z =
          -depth / 2 +
          zSpacing / 2 +
          row * zSpacing;


        // =============================================
        // DETERMINISTIC VARIATION
        // =============================================

        const seed =
          row * 12.9898 +
          plant * 78.233;


        const variation =
          Math.sin(seed);


        // =============================================
        // SCALE
        // =============================================

        const plantScale =
          growth *
          (
            0.86 +
            Math.abs(variation) *
            0.16
          );


        // =============================================
        // ROTATION
        // =============================================

        const rotation =
          Math.sin(
            seed * 1.37
          ) * 0.22;


        generatedPlants.push({

          id:
            `${row}-${plant}`,

          position: [
            x,
            0.2,
            z,
          ],

          scale:
            plantScale,

          rotation,
        });
      }
    }


    return generatedPlants;

  }, [
    width,
    depth,
    rows,
    plantsPerRow,
    growth,
  ]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group
      position={
        position
      }
    >

      {plants.map(
        (plant) => (

          <CropPlant
            key={
              plant.id
            }

            position={
              plant.position
            }

            scale={
              plant.scale
            }

            rotation={
              plant.rotation
            }

            health={
              health
            }
          />

        )
      )}

    </group>
  );
}
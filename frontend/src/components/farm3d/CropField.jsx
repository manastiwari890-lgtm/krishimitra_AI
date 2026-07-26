import { useMemo } from "react";

import CropPlant from "./CropPlant";


// =====================================================
// KRISHIMITRA AI
// 3D CROP FIELD SYSTEM
// =====================================================
//
// Generates plants across a single farm plot.
//
// CURRENT:
// - Multiple crop rows
// - Multiple plants per row
// - Growth scaling
// - Health status
// - Natural plant-size variation
//
// FUTURE:
// - Different crop species
// - Growth stages
// - Disease visualization
// - Soil moisture response
// - Irrigation response
// - Weather response
// - Farm intelligence integration
// =====================================================


// =====================================================
// CROP FIELD COMPONENT
// =====================================================

export default function CropField({
  position = [0, 0, 0],

  width = 6.4,

  depth = 5.6,

  rows = 7,

  plantsPerRow = 9,

  health = "healthy",

  growth = 1,
}) {

  // ===================================================
  // GENERATE PLANT POSITIONS
  // ===================================================

  const plants = useMemo(() => {

    const generatedPlants = [];


    // =================================================
    // CALCULATE PLANT SPACING
    // =================================================

    const xSpacing =
      width / plantsPerRow;

    const zSpacing =
      depth / rows;


    // =================================================
    // GENERATE ROWS
    // =================================================

    for (
      let row = 0;
      row < rows;
      row += 1
    ) {

      // ===============================================
      // GENERATE PLANTS INSIDE EACH ROW
      // ===============================================

      for (
        let plant = 0;
        plant < plantsPerRow;
        plant += 1
      ) {

        // =============================================
        // X POSITION
        // =============================================

        const x =
          -width / 2 +
          xSpacing / 2 +
          plant * xSpacing;


        // =============================================
        // Z POSITION
        // =============================================

        const z =
          -depth / 2 +
          zSpacing / 2 +
          row * zSpacing;


        // =============================================
        // NATURAL SIZE VARIATION
        // =============================================
        //
        // This prevents every plant from looking
        // completely identical.
        //
        // We use deterministic variation rather than
        // Math.random() so plants don't move/change
        // every time React renders.
        // =============================================

        const variation =
          Math.sin(
            row * 12.9898 +
            plant * 78.233
          );


        const plantScale =
          growth *
          (
            0.84 +
            Math.abs(
              variation
            ) * 0.18
          );


        // =============================================
        // STORE GENERATED PLANT
        // =============================================

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

        });
      }
    }


    // =================================================
    // RETURN GENERATED FIELD
    // =================================================

    return generatedPlants;

  }, [
    width,
    depth,
    rows,
    plantsPerRow,
    growth,
  ]);


  // ===================================================
  // RENDER CROP FIELD
  // ===================================================

  return (
    <group
      position={
        position
      }
    >

      {/* ===============================================
          CROP PLANTS
      =============================================== */}

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

            health={
              health
            }
          />

        )
      )}

    </group>
  );
}
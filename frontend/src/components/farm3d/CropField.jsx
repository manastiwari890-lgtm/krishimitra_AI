import { useMemo } from "react";

import InstancedCropField from "./InstancedCropField";

import { useFarmState } from "../../farm/hooks/useFarmState";

import {
  getCropConfig,
} from "./cropConfig";

// =====================================================
// KRISHIMITRA AI
// SPECIES-AWARE CROP FIELD
// =====================================================
//
// RULES:
//
// 1. Every plot contains 35 plants.
// 2. 5 rows × 7 plants.
// 3. Positions never change.
// 4. Growth never changes plant count.
// 5. Growth never changes spacing.
// 6. All plants of the plot grow together.
// 7. Each species has its own growth configuration.
// 8. Each species has its own maximum height.
// 9. Plants never merge.
// =====================================================

const DEFAULT_ROWS = 5;
const DEFAULT_PLANTS_PER_ROW = 7;

// =====================================================
// NORMALIZE GROWTH
// =====================================================

function normalizeGrowth(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      value / 100,
    ),
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function CropField({
  plotId,

  position = [0, 0, 0],

  width = 6.4,

  depth = 5.6,

  rows = DEFAULT_ROWS,

  plantsPerRow = DEFAULT_PLANTS_PER_ROW,
}) {

  // ===================================================
  // FARM STATE
  // ===================================================

  const { farmState } =
    useFarmState();

  // ===================================================
  // CURRENT PLOT
  // ===================================================

  const plot =
    farmState.plots.find(
      (currentPlot) =>
        currentPlot.id === plotId,
    ) ??
    farmState.plots[0];

  // ===================================================
  // CROP TYPE
  // ===================================================

  const cropType =
    plot?.crop ?? "maize";

  const cropConfig =
    getCropConfig(
      cropType,
    );

  // ===================================================
  // HEALTH
  // ===================================================

  const health =
    plot?.health ?? "healthy";

  // ===================================================
  // GROWTH
  // ===================================================

  const normalizedGrowth =
    normalizeGrowth(
      plot?.growth,
    );

  // ===================================================
  // HEIGHT
  // ===================================================
  //
  // Example:
  //
  // growth = 0
  // → 15% height
  //
  // growth = 100
  // → 85% height
  //
  // The maximum comes from the crop configuration.
  // ===================================================

  const heightScale =
    cropConfig.minHeight +
    (
      cropConfig.maxHeight -
      cropConfig.minHeight
    ) *
    normalizedGrowth;

  // ===================================================
  // GENERATE FIXED GRID
  // ===================================================

  const plants = useMemo(() => {

    const generatedPlants = [];

    // -------------------------------------------------
    // IMPORTANT:
    //
    // We deliberately keep the grid fixed.
    //
    // Never derive plant count from growth.
    // -------------------------------------------------

    const safeRows =
      DEFAULT_ROWS;

    const safePlantsPerRow =
      DEFAULT_PLANTS_PER_ROW;

    const xSpacing =
      width /
      safePlantsPerRow;

    const zSpacing =
      depth /
      safeRows;

    // -------------------------------------------------
    // 35 PLANTS
    // -------------------------------------------------

    for (
      let row = 0;
      row < safeRows;
      row += 1
    ) {

      for (
        let plant = 0;
        plant < safePlantsPerRow;
        plant += 1
      ) {

        const x =
          -width / 2 +
          xSpacing / 2 +
          plant * xSpacing;

        const z =
          -depth / 2 +
          zSpacing / 2 +
          row * zSpacing;

        // =============================================
        // DETERMINISTIC ROTATION
        // =============================================

        const seed =
          row * 12.9898 +
          plant * 78.233;

        const rotation =
          Math.sin(
            seed * 1.37,
          ) * 0.08;

        generatedPlants.push({

          id:
            `${plotId}-${row}-${plant}`,

          position: [
            x,
            0,
            z,
          ],

          rotation,

          // =========================================
          // WIDTH
          // =========================================

          widthScale:
            cropConfig.widthScale,

          // =========================================
          // HEIGHT
          // =========================================

          heightScale,
        });
      }
    }

    return generatedPlants;

  }, [
    plotId,
    width,
    depth,
    heightScale,
    cropConfig.widthScale,
  ]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <group
      position={position}
    >

      <InstancedCropField

        plants={
          plants
        }

        health={
          health
        }

        cropType={
          cropType
        }

        cropConfig={
          cropConfig
        }

      />

    </group>
  );
}
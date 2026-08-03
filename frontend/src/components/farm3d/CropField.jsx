import { useMemo } from "react";

import InstancedCropField from "./InstancedCropField";

import { useFarmState } from "../../farm/hooks/useFarmState";

// =====================================================
// KRISHIMITRA AI
// DATA-DRIVEN CROP FIELD
// =====================================================

export default function CropField({
  plotId,

  position = [0, 0, 0],

  width = 6.4,

  depth = 5.6,

  rows = 5,

  plantsPerRow = 7,
}) {
  // ===================================================
  // FARM STATE
  // ===================================================

  const { farmState } = useFarmState();

  const plot =
    farmState.plots.find((plot) => plot.id === plotId) ??
    farmState.plots[0];

  // ===================================================
  // CURRENT STATE
  // ===================================================

  const health = plot.health;

  // Temporary growth value.
  // Later this will come from plot.growth.

  const growth = 1;

  // ===================================================
  // GENERATE PLANTS
  // ===================================================

  const plants = useMemo(() => {
    const generatedPlants = [];

    const xSpacing = width / plantsPerRow;

    const zSpacing = depth / rows;

    for (let row = 0; row < rows; row += 1) {
      for (let plant = 0; plant < plantsPerRow; plant += 1) {
        const x =
          -width / 2 +
          xSpacing / 2 +
          plant * xSpacing;

        const z =
          -depth / 2 +
          zSpacing / 2 +
          row * zSpacing;

        const seed =
          row * 12.9898 +
          plant * 78.233;

        const variation = Math.sin(seed);

        const plantScale =
          growth *
          (0.86 + Math.abs(variation) * 0.16);

        const rotation =
          Math.sin(seed * 1.37) * 0.22;

        generatedPlants.push({
          id: `${row}-${plant}`,

          position: [x, 0.2, z],

          scale: plantScale,

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

  return (
    <group position={position}>
      <InstancedCropField
        plants={plants}
        health={health}
      />
    </group>
  );
}
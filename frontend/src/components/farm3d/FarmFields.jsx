import * as THREE from "three";

import {
  useMemo,
  useState,
} from "react";

import {
  Html,
  useTexture,
} from "@react-three/drei";


// =====================================================
// KRISHIMITRA AI
// SMART INTERACTIVE FARM FIELD SYSTEM
// =====================================================
//
// PRESERVED:
//
// - Four cultivated plots
// - PBR soil
// - Raised soil beds
// - Furrows
// - PBR walking paths
// - Irrigation channels
// - Water
//
// ADDED:
//
// - Plot identity
// - Plot data
// - Hover detection
// - Click selection
// - Selected plot highlighting
// - Smart plot information panel
//
// FUTURE:
//
// - Backend soil data
// - Weather integration
// - AI crop recommendation
// - Disease detection integration
// - Real irrigation recommendations
// =====================================================


// =====================================================
// SINGLE RAISED SOIL BED
// =====================================================

function SoilBed({
  position,
  length = 6.8,
  soilTextures,
}) {

  const {
    color,
    normal,
    roughness,
  } = soilTextures;


  return (
    <group position={position}>

      {/* ===============================================
          RAISED CULTIVATED SOIL
      =============================================== */}

      <mesh
        position={[
          0,
          0.09,
          0,
        ]}
        castShadow
        receiveShadow
      >

        <boxGeometry
          args={[
            length,
            0.18,
            0.48,
          ]}
        />


        <meshStandardMaterial
          map={color}
          normalMap={normal}
          roughnessMap={roughness}
          normalScale={
            new THREE.Vector2(
              0.55,
              0.55
            )
          }
          roughness={1}
          metalness={0}
          color="#8a684d"
        />

      </mesh>


      {/* ===============================================
          LIGHTER TOP SOIL
      =============================================== */}

      <mesh
        position={[
          0,
          0.19,
          0,
        ]}
        receiveShadow
      >

        <boxGeometry
          args={[
            length - 0.08,
            0.035,
            0.42,
          ]}
        />


        <meshStandardMaterial
          map={color}
          normalMap={normal}
          roughnessMap={roughness}
          normalScale={
            new THREE.Vector2(
              0.7,
              0.7
            )
          }
          roughness={1}
          metalness={0}
          color="#a27c5c"
        />

      </mesh>

    </group>
  );
}


// =====================================================
// SMART FARM PLOT
// =====================================================

function FarmPlot({
  position,

  plot,

  soilTextures,

  width = 7.2,

  depth = 6.5,

  rows = 8,

  selected,

  hovered,

  onSelect,

  onHover,
}) {

  // ===================================================
  // GENERATE BEDS
  // ===================================================

  const beds = useMemo(() => {

    const result = [];

    const usableDepth =
      depth - 0.7;

    const spacing =
      usableDepth / rows;


    for (
      let index = 0;
      index < rows;
      index += 1
    ) {

      const z =
        -usableDepth / 2 +
        spacing / 2 +
        index * spacing;


      result.push({
        id: index,

        position: [
          0,
          0,
          z,
        ],
      });
    }


    return result;

  }, [
    depth,
    rows,
  ]);


  // ===================================================
  // HIGHLIGHT COLOR
  // ===================================================

  const highlightColor =
    selected
      ? "#38d875"
      : "#8cf5af";


  return (
    <group position={position}>


      {/* ===============================================
          PLOT BASE
      =============================================== */}

      <mesh
        position={[
          0,
          0.035,
          0,
        ]}

        receiveShadow

        onPointerOver={(event) => {

          event.stopPropagation();

          onHover(
            plot.id
          );

          document.body.style.cursor =
            "pointer";
        }}

        onPointerOut={(event) => {

          event.stopPropagation();

          onHover(
            null
          );

          document.body.style.cursor =
            "default";
        }}

        onClick={(event) => {

          event.stopPropagation();

          onSelect(
            plot.id
          );
        }}
      >

        <boxGeometry
          args={[
            width,
            0.07,
            depth,
          ]}
        />


        <meshStandardMaterial
          map={
            soilTextures.color
          }

          normalMap={
            soilTextures.normal
          }

          roughnessMap={
            soilTextures.roughness
          }

          normalScale={
            new THREE.Vector2(
              0.6,
              0.6
            )
          }

          roughness={1}

          metalness={0}

          color={
            selected
              ? "#8a765c"
              : hovered
                ? "#80694e"
                : "#75573f"
          }
        />

      </mesh>


      {/* ===============================================
          INVISIBLE INTERACTION SURFACE
      ===============================================
          
          Raised slightly above the beds so clicking
          anywhere within the plot selects the plot.
      =============================================== */}

      <mesh
        position={[
          0,
          0.28,
          0,
        ]}

        onPointerOver={(event) => {

          event.stopPropagation();

          onHover(
            plot.id
          );

          document.body.style.cursor =
            "pointer";
        }}

        onPointerOut={(event) => {

          event.stopPropagation();

          onHover(
            null
          );

          document.body.style.cursor =
            "default";
        }}

        onClick={(event) => {

          event.stopPropagation();

          onSelect(
            plot.id
          );
        }}
      >

        <boxGeometry
          args={[
            width,
            0.08,
            depth,
          ]}
        />


        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />

      </mesh>


      {/* ===============================================
          RAISED SOIL ROWS
      =============================================== */}

      {beds.map(
        (bed) => (

          <SoilBed
            key={
              bed.id
            }

            position={
              bed.position
            }

            length={
              width - 0.5
            }

            soilTextures={
              soilTextures
            }
          />

        )
      )}


      {/* ===============================================
          HOVER / SELECTION BORDER
      =============================================== */}

      {(selected || hovered) && (

        <mesh
          position={[
            0,
            0.245,
            0,
          ]}

          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
        >

          <planeGeometry
            args={[
              width + 0.18,
              depth + 0.18,
            ]}
          />


          <meshBasicMaterial
            color={
              highlightColor
            }

            transparent

            opacity={
              selected
                ? 0.16
                : 0.07
            }

            depthWrite={
              false
            }

            side={
              THREE.DoubleSide
            }
          />

        </mesh>

      )}


      {/* ===============================================
          SELECTED PLOT BORDER
      =============================================== */}

      {selected && (

        <lineSegments
          position={[
            0,
            0.27,
            0,
          ]}
        >

          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                width,
                0.12,
                depth
              ),
            ]}
          />


          <lineBasicMaterial
            color="#39e681"
          />

        </lineSegments>

      )}


      {/* ===============================================
          PLOT LABEL
      =============================================== */}

      <Html
        position={[
          -width / 2 + 0.55,
          0.7,
          -depth / 2 + 0.45,
        ]}

        center

        distanceFactor={
          12
        }

        style={{
          pointerEvents:
            "none",
        }}
      >

        <div
          style={{
            padding:
              "5px 9px",

            borderRadius:
              "8px",

            background:
              selected
                ? "rgba(14, 104, 55, 0.92)"
                : "rgba(18, 55, 35, 0.78)",

            color:
              "#ffffff",

            fontSize:
              "11px",

            fontWeight:
              "700",

            whiteSpace:
              "nowrap",

            boxShadow:
              "0 4px 14px rgba(0,0,0,0.22)",

            border:
              selected
                ? "1px solid rgba(112,255,169,0.65)"
                : "1px solid rgba(255,255,255,0.12)",
          }}
        >

          {plot.name}

        </div>

      </Html>

    </group>
  );
}


// =====================================================
// WALKING PATH
// =====================================================

function FarmPath({
  position,
  size,
  pathTextures,
}) {

  return (
    <mesh
      position={
        position
      }

      receiveShadow
    >

      <boxGeometry
        args={[
          size[0],
          0.055,
          size[1],
        ]}
      />


      <meshStandardMaterial
        map={
          pathTextures.color
        }

        normalMap={
          pathTextures.normal
        }

        roughnessMap={
          pathTextures.roughness
        }

        normalScale={
          new THREE.Vector2(
            0.65,
            0.65
          )
        }

        roughness={1}

        metalness={0}

        color="#d2c0a0"
      />

    </mesh>
  );
}


// =====================================================
// IRRIGATION CHANNEL
// =====================================================

function IrrigationChannel({
  position,
  length,
  soilTextures,
}) {

  return (
    <group position={position}>


      {/* ===============================================
          CHANNEL SOIL
      =============================================== */}

      <mesh
        position={[
          0,
          0.015,
          0,
        ]}

        receiveShadow
      >

        <boxGeometry
          args={[
            length,
            0.06,
            0.42,
          ]}
        />


        <meshStandardMaterial
          map={
            soilTextures.color
          }

          normalMap={
            soilTextures.normal
          }

          roughnessMap={
            soilTextures.roughness
          }

          normalScale={
            new THREE.Vector2(
              0.45,
              0.45
            )
          }

          roughness={1}

          metalness={0}

          color="#69513d"
        />

      </mesh>


      {/* ===============================================
          WATER
      =============================================== */}

      <mesh
        position={[
          0,
          0.055,
          0,
        ]}
      >

        <boxGeometry
          args={[
            length - 0.1,
            0.035,
            0.25,
          ]}
        />


        <meshPhysicalMaterial
          color="#5fa8b8"

          roughness={0.16}

          metalness={0}

          transmission={0.15}

          transparent

          opacity={0.82}

          clearcoat={0.7}

          clearcoatRoughness={
            0.15
          }
        />

      </mesh>

    </group>
  );
}


// =====================================================
// SMART PLOT INFORMATION PANEL
// =====================================================

function SmartPlotPanel({
  plot,
  onClose,
}) {

  if (!plot) {
    return null;
  }


  const healthColor =
    plot.health === "healthy"
      ? "#64e68a"
      : plot.health === "warning"
        ? "#ffd166"
        : "#ff7777";


  return (
    <Html
      position={[
        0,
        3.3,
        0,
      ]}

      center

      distanceFactor={
        10
      }

      zIndexRange={[
        100,
        0,
      ]}
    >

      <div
        style={{
          width:
            "260px",

          padding:
            "16px",

          borderRadius:
            "18px",

          background:
            "rgba(7, 30, 20, 0.94)",

          backdropFilter:
            "blur(14px)",

          color:
            "#ffffff",

          border:
            "1px solid rgba(120,255,170,0.18)",

          boxShadow:
            "0 18px 50px rgba(0,0,0,0.35)",

          fontFamily:
            "Inter, Arial, sans-serif",

          userSelect:
            "none",
        }}
      >

        {/* =============================================
            HEADER
        ============================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            marginBottom:
              "12px",
          }}
        >

          <div>

            <div
              style={{
                fontSize:
                  "16px",

                fontWeight:
                  "800",
              }}
            >
              🌾 {plot.name}
            </div>


            <div
              style={{
                fontSize:
                  "12px",

                color:
                  "#a7c8b4",

                marginTop:
                  "3px",
              }}
            >
              {plot.crop}
            </div>

          </div>


          <button
            type="button"

            onClick={
              onClose
            }

            style={{
              width:
                "28px",

              height:
                "28px",

              borderRadius:
                "50%",

              border:
                "1px solid rgba(255,255,255,0.12)",

              background:
                "rgba(255,255,255,0.07)",

              color:
                "#ffffff",

              cursor:
                "pointer",

              fontSize:
                "15px",
            }}
          >
            ×
          </button>

        </div>


        {/* =============================================
            HEALTH
        ============================================= */}

        <div
          style={{
            padding:
              "9px 10px",

            borderRadius:
              "10px",

            background:
              "rgba(255,255,255,0.05)",

            marginBottom:
              "10px",

            display:
              "flex",

            justifyContent:
              "space-between",

            fontSize:
              "12px",
          }}
        >

          <span>
            Crop Health
          </span>

          <strong
            style={{
              color:
                healthColor,

              textTransform:
                "capitalize",
            }}
          >
            {plot.health}
          </strong>

        </div>


        {/* =============================================
            SOIL DATA
        ============================================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap:
              "8px",

            marginBottom:
              "10px",
          }}
        >

          <DataBox
            label="Moisture"
            value={`${plot.moisture}%`}
          />

          <DataBox
            label="Soil pH"
            value={plot.ph}
          />

          <DataBox
            label="Nitrogen"
            value={plot.nitrogen}
          />

          <DataBox
            label="Phosphorus"
            value={plot.phosphorus}
          />

          <DataBox
            label="Potassium"
            value={plot.potassium}
          />

          <DataBox
            label="Disease Risk"
            value={plot.diseaseRisk}
          />

        </div>


        {/* =============================================
            IRRIGATION STATUS
        ============================================= */}

        <div
          style={{
            padding:
              "10px",

            borderRadius:
              "10px",

            background:
              plot.irrigationRequired
                ? "rgba(255,174,66,0.12)"
                : "rgba(82,213,130,0.10)",

            border:
              plot.irrigationRequired
                ? "1px solid rgba(255,174,66,0.20)"
                : "1px solid rgba(82,213,130,0.18)",

            fontSize:
              "12px",

            lineHeight:
              "1.5",
          }}
        >

          <strong>
            💧 Irrigation
          </strong>

          <div
            style={{
              marginTop:
                "3px",

              color:
                "#c6ded0",
            }}
          >

            {
              plot.irrigationRequired
                ? "Irrigation recommended"
                : "Irrigation not required"
            }

          </div>

        </div>


        {/* =============================================
            DEVELOPMENT STATUS
        ============================================= */}

        <div
          style={{
            marginTop:
              "10px",

            fontSize:
              "10px",

            color:
              "#799b88",

            textAlign:
              "center",
          }}
        >
          Prototype data • Backend integration next
        </div>

      </div>

    </Html>
  );
}


// =====================================================
// DATA BOX
// =====================================================

function DataBox({
  label,
  value,
}) {

  return (
    <div
      style={{
        padding:
          "8px",

        borderRadius:
          "9px",

        background:
          "rgba(255,255,255,0.045)",

        border:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >

      <div
        style={{
          fontSize:
            "9px",

          color:
            "#89aa98",

          marginBottom:
            "3px",

          textTransform:
            "uppercase",

          letterSpacing:
            "0.5px",
        }}
      >
        {label}
      </div>


      <div
        style={{
          fontSize:
            "13px",

          fontWeight:
            "700",

          color:
            "#ffffff",
        }}
      >
        {value}
      </div>

    </div>
  );
}


// =====================================================
// COMPLETE SMART FARM FIELD LAYOUT
// =====================================================

export default function FarmFields() {

  // ===================================================
  // INTERACTION STATE
  // ===================================================

  const [
    selectedPlotId,
    setSelectedPlotId,
  ] = useState(null);


  const [
    hoveredPlotId,
    setHoveredPlotId,
  ] = useState(null);


  // ===================================================
  // SMART FARM DATA
  // ===================================================
  //
  // TEMPORARY PROTOTYPE DATA.
  //
  // Later this object will be populated using:
  //
  // soil API
  // weather API
  // crop recommendation model
  // disease detection model
  // irrigation logic
  // ===================================================

  const plots =
    useMemo(
      () => [
        {
          id:
            "plot-a",

          name:
            "Plot A",

          crop:
            "Maize",

          position: [
            -4.2,
            0,
            -3.7,
          ],

          health:
            "healthy",

          moisture:
            68,

          ph:
            6.7,

          nitrogen:
            72,

          phosphorus:
            48,

          potassium:
            61,

          diseaseRisk:
            "Low",

          irrigationRequired:
            false,
        },


        {
          id:
            "plot-b",

          name:
            "Plot B",

          crop:
            "Maize",

          position: [
            4.2,
            0,
            -3.7,
          ],

          health:
            "healthy",

          moisture:
            61,

          ph:
            6.5,

          nitrogen:
            65,

          phosphorus:
            51,

          potassium:
            58,

          diseaseRisk:
            "Low",

          irrigationRequired:
            false,
        },


        {
          id:
            "plot-c",

          name:
            "Plot C",

          crop:
            "Maize",

          position: [
            -4.2,
            0,
            3.7,
          ],

          health:
            "warning",

          moisture:
            39,

          ph:
            6.2,

          nitrogen:
            49,

          phosphorus:
            42,

          potassium:
            55,

          diseaseRisk:
            "Medium",

          irrigationRequired:
            true,
        },


        {
          id:
            "plot-d",

          name:
            "Plot D",

          crop:
            "Maize",

          position: [
            4.2,
            0,
            3.7,
          ],

          health:
            "healthy",

          moisture:
            73,

          ph:
            6.8,

          nitrogen:
            76,

          phosphorus:
            54,

          potassium:
            67,

          diseaseRisk:
            "Low",

          irrigationRequired:
            false,
        },
      ],
      []
    );


  // ===================================================
  // SELECTED PLOT
  // ===================================================

  const selectedPlot =
    useMemo(
      () =>
        plots.find(
          (plot) =>
            plot.id ===
            selectedPlotId
        ) || null,
      [
        plots,
        selectedPlotId,
      ]
    );


  // ===================================================
  // LOAD PBR SOIL
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
  // LOAD PBR PATH
  // ===================================================

  const [
    pathColor,
    pathNormal,
    pathRoughness,
  ] = useTexture([
    "/assets/farm3d/textures/paths/path_color.jpg",
    "/assets/farm3d/textures/paths/path_normal.png",
    "/assets/farm3d/textures/paths/path_roughness.jpg",
  ]);


  // ===================================================
  // CONFIGURE TEXTURES
  // ===================================================

  useMemo(() => {

    const soilMaps = [
      soilColor,
      soilNormal,
      soilRoughness,
    ];


    soilMaps.forEach(
      (texture) => {

        texture.wrapS =
          THREE.RepeatWrapping;

        texture.wrapT =
          THREE.RepeatWrapping;

        texture.repeat.set(
          3,
          3
        );

        texture.anisotropy =
          8;

        texture.needsUpdate =
          true;
      }
    );


    const pathMaps = [
      pathColor,
      pathNormal,
      pathRoughness,
    ];


    pathMaps.forEach(
      (texture) => {

        texture.wrapS =
          THREE.RepeatWrapping;

        texture.wrapT =
          THREE.RepeatWrapping;

        texture.repeat.set(
          5,
          5
        );

        texture.anisotropy =
          8;

        texture.needsUpdate =
          true;
      }
    );


    soilColor.colorSpace =
      THREE.SRGBColorSpace;

    pathColor.colorSpace =
      THREE.SRGBColorSpace;


    soilNormal.colorSpace =
      THREE.NoColorSpace;

    soilRoughness.colorSpace =
      THREE.NoColorSpace;

    pathNormal.colorSpace =
      THREE.NoColorSpace;

    pathRoughness.colorSpace =
      THREE.NoColorSpace;


    soilColor.needsUpdate =
      true;

    soilNormal.needsUpdate =
      true;

    soilRoughness.needsUpdate =
      true;

    pathColor.needsUpdate =
      true;

    pathNormal.needsUpdate =
      true;

    pathRoughness.needsUpdate =
      true;

  }, [
    soilColor,
    soilNormal,
    soilRoughness,
    pathColor,
    pathNormal,
    pathRoughness,
  ]);


  // ===================================================
  // MATERIAL COLLECTIONS
  // ===================================================

  const soilTextures =
    useMemo(
      () => ({
        color:
          soilColor,

        normal:
          soilNormal,

        roughness:
          soilRoughness,
      }),
      [
        soilColor,
        soilNormal,
        soilRoughness,
      ]
    );


  const pathTextures =
    useMemo(
      () => ({
        color:
          pathColor,

        normal:
          pathNormal,

        roughness:
          pathRoughness,
      }),
      [
        pathColor,
        pathNormal,
        pathRoughness,
      ]
    );


  // ===================================================
  // RENDER FARM
  // ===================================================

  return (
    <group
      position={[
        0,
        0,
        0,
      ]}
    >


      {/* ===============================================
          FOUR SMART FARM PLOTS
      =============================================== */}

      {plots.map(
        (plot) => (

          <FarmPlot
            key={
              plot.id
            }

            plot={
              plot
            }

            position={
              plot.position
            }

            soilTextures={
              soilTextures
            }

            selected={
              selectedPlotId ===
              plot.id
            }

            hovered={
              hoveredPlotId ===
              plot.id
            }

            onSelect={
              setSelectedPlotId
            }

            onHover={
              setHoveredPlotId
            }
          />

        )
      )}


      {/* ===============================================
          CENTRAL WALKING PATH
      =============================================== */}

      <FarmPath
        position={[
          0,
          0.11,
          0,
        ]}

        size={[
          1.05,
          15,
        ]}

        pathTextures={
          pathTextures
        }
      />


      {/* ===============================================
          HORIZONTAL WALKING PATH
      =============================================== */}

      <FarmPath
        position={[
          0,
          0.115,
          0,
        ]}

        size={[
          16,
          1.05,
        ]}

        pathTextures={
          pathTextures
        }
      />


      {/* ===============================================
          OUTER FRONT PATH
      =============================================== */}

      <FarmPath
        position={[
          0,
          0.08,
          7.7,
        ]}

        size={[
          18,
          0.9,
        ]}

        pathTextures={
          pathTextures
        }
      />


      {/* ===============================================
          IRRIGATION CHANNELS
      =============================================== */}

      <IrrigationChannel
        position={[
          -4.2,
          0.11,
          7.05,
        ]}

        length={
          7.3
        }

        soilTextures={
          soilTextures
        }
      />


      <IrrigationChannel
        position={[
          4.2,
          0.11,
          7.05,
        ]}

        length={
          7.3
        }

        soilTextures={
          soilTextures
        }
      />


      {/* ===============================================
          SELECTED SMART PLOT PANEL
      =============================================== */}

      {selectedPlot && (

        <group
          position={
            selectedPlot.position
          }
        >

          <SmartPlotPanel
            plot={
              selectedPlot
            }

            onClose={() =>
              setSelectedPlotId(
                null
              )
            }
          />

        </group>

      )}

    </group>
  );
}
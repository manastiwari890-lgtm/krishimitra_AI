import * as THREE from "three";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Html,
  useTexture,
} from "@react-three/drei";
import { useFarmState } from "../../farm/hooks/useFarmState";
import { useFrame } from "@react-three/fiber";


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
  flowEnabled = true,
  flowDirection = 1,
}) {
  const waterRef = useRef(null);
  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uFlow: { value: flowEnabled ? 1 : 0 },
      uDirection: { value: flowDirection },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(normalMatrix * normal);
        vec3 p = position;
        float wave = sin((uv.x * 20.0 + uv.y * 7.0)) * 0.006;
        p.y += wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uFlow;
      uniform float uDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        float t = uTime * (0.28 + uFlow * 0.72) * uDirection;
        vec2 uv = vUv;
        float rippleA = sin((uv.x * 34.0 + uv.y * 10.0) - t * 5.0);
        float rippleB = sin((uv.x * 72.0 - uv.y * 18.0) - t * 9.0);
        float caustic = smoothstep(0.35, 0.95, rippleA * 0.5 + rippleB * 0.25 + 0.45);
        float diagonal = smoothstep(0.42, 0.9, sin((uv.x + uv.y * 0.8) * 28.0 - t * 7.0) * 0.5 + 0.5);
        vec3 deep = vec3(0.015, 0.20, 0.24);
        vec3 mid = vec3(0.025, 0.43, 0.48);
        vec3 light = vec3(0.20, 0.72, 0.72);
        vec3 col = mix(deep, mid, caustic * 0.72);
        col = mix(col, light, diagonal * 0.22);
        float edge = smoothstep(0.02, 0.12, min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y)));
        float spec = pow(max(dot(normalize(vWorldNormal), normalize(vec3(-0.3, 0.85, 0.45))), 0.0), 14.0);
        col += spec * 0.28;
        float alpha = 0.94 * (0.78 + edge * 0.22);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  }), [flowDirection, flowEnabled]);

  useFrame((_, delta) => {
    if (!waterRef.current) return;
    waterRef.current.material.uniforms.uTime.value += delta;
    waterRef.current.material.uniforms.uFlow.value += ((flowEnabled ? 1 : 0) - waterRef.current.material.uniforms.uFlow.value) * Math.min(1, delta * 4);
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[length, 0.08, 0.58]} />
        <meshStandardMaterial
          map={soilTextures.color}
          normalMap={soilTextures.normal}
          roughnessMap={soilTextures.roughness}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={0.96}
          color="#604a38"
        />
      </mesh>

      {/* Raised canal banks */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.12, side * 0.29]} receiveShadow castShadow>
          <boxGeometry args={[length, 0.18, 0.12]} />
          <meshStandardMaterial color="#76563b" roughness={0.9} />
        </mesh>
      ))}

      <mesh
        ref={waterRef}
        position={[0, 0.09, 0]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[Math.max(0.2, length - 0.12), 0.42, 1, 8]} />
        <shaderMaterial
          uniforms={shader.uniforms}
          vertexShader={shader.vertexShader}
          fragmentShader={shader.fragmentShader}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Soft foam along the banks */}
      {[-1, 1].map((side) => (
        <mesh key={`foam-${side}`} position={[0, 0.102, side * 0.205]}>
          <planeGeometry args={[Math.max(0.2, length - 0.25), 0.045]} />
          <meshBasicMaterial color="#b9f4ed" transparent opacity={0.34} />
        </mesh>
      ))}
    </group>
  );
}

// =====================================================
// IRRIGATION PUMP + CONTROL GATE
// =====================================================

function IrrigationPump({ position, active, onToggle }) {
  const rotorRef = useRef(null);

  useFrame((_, delta) => {
    if (!rotorRef.current) return;
    if (active) rotorRef.current.rotation.z -= delta * 5.5;
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.7, 18]} />
        <meshStandardMaterial color="#416c6c" roughness={0.42} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.16, 16]} />
        <meshStandardMaterial color="#273d40" roughness={0.35} metalness={0.6} />
      </mesh>
      <group ref={rotorRef} position={[0, 0.84, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((r) => (
          <mesh key={r} rotation={[0, 0, r]}>
            <boxGeometry args={[0.08, 0.52, 0.035]} />
            <meshStandardMaterial color="#d6e4df" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.65, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 1.1, 14]} />
        <meshStandardMaterial color="#557d7d" roughness={0.3} metalness={0.55} />
      </mesh>
      <FacilityLabel title={active ? "Pump ON" : "Pump OFF"} subtitle="Click to control water" />
    </group>
  );
}

function CanalGate({ position, open, onToggle }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.72, 0.9, 0.12]} />
        <meshStandardMaterial color={open ? "#527c68" : "#263b38"} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.22, 0.045, 8, 20]} />
        <meshStandardMaterial color="#c4a76a" roughness={0.35} metalness={0.55} />
      </mesh>
      <FacilityLabel title={open ? "Gate Open" : "Gate Closed"} subtitle="Click to control flow" />
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
         Live Digital Twin • Simulation active
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
// KRISHIMITRA AI
// LIGHTWEIGHT FARM WORLD FACILITIES
// =====================================================

function FacilityLabel({ title, subtitle }) {
  return (
    <Html
      center
      distanceFactor={12}
      position={[0, 2.5, 0]}
      style={{
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          padding: "6px 10px",
          borderRadius: "9px",
          background: "rgba(8, 30, 20, 0.88)",
          border: "1px solid rgba(126, 255, 183, 0.45)",
          color: "#f5fff8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          boxShadow: "0 5px 16px rgba(0,0,0,.28)",
        }}
      >
        {title}
        {subtitle ? (
          <span
            style={{
              display: "block",
              marginTop: "2px",
              fontSize: "9px",
              opacity: 0.7,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </Html>
  );
}

function FacilityButton({ position, label, onClick }) {
  return (
    <Html
      center
      distanceFactor={11}
      position={position}
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        style={{
          border: "1px solid rgba(155,255,197,.55)",
          background: "rgba(7, 39, 26, .92)",
          color: "#eafff1",
          padding: "7px 10px",
          borderRadius: "10px",
          fontSize: "10px",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,.25)",
        }}
      >
        {label}
      </button>
    </Html>
  );
}

function FarmHouse({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Farmhouse"); }}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[3.2, 1.6, 2.7]} />
        <meshStandardMaterial color="#d9c7a1" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.35, 1.3, 4]} />
        <meshStandardMaterial color="#6d3f25" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 1.38]}>
        <boxGeometry args={[0.65, 1.05, 0.08]} />
        <meshStandardMaterial color="#4a2b1d" roughness={0.9} />
      </mesh>
      <mesh position={[-1.05, 0.9, 1.39]}>
        <boxGeometry args={[0.6, 0.55, 0.06]} />
        <meshStandardMaterial color="#8ed9df" roughness={0.25} metalness={0.05} />
      </mesh>
      <FacilityLabel title="Farmhouse" subtitle="Operations" />
    </group>
  );
}

function Barn({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Barn"); }}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[3.8, 2, 3]} />
        <meshStandardMaterial color="#8f4e31" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <coneGeometry args={[2.15, 3.9, 4]} />
        <meshStandardMaterial color="#4d3026" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.95, 1.53]}>
        <boxGeometry args={[1.35, 1.35, 0.08]} />
        <meshStandardMaterial color="#3a251d" roughness={0.95} />
      </mesh>
      <FacilityLabel title="Barn" subtitle="Storage & livestock" />
    </group>
  );
}

function Greenhouse({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Greenhouse"); }}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[4.2, 2.1, 2.7]} />
        <meshStandardMaterial
          color="#a9e7df"
          transparent
          opacity={0.34}
          roughness={0.12}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 2.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.0, 1.0, 4]} />
        <meshStandardMaterial
          color="#b9f3ea"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
      {[-1.25, 0, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.12, 0.65, 1.9]} />
          <meshStandardMaterial color="#2f8b57" roughness={0.85} />
        </mesh>
      ))}
      <FacilityLabel title="Greenhouse" subtitle="Protected crops" />
    </group>
  );
}

function StorageShed({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Storage"); }}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.6, 1.5, 2.2]} />
        <meshStandardMaterial color="#b18a5a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <coneGeometry args={[1.85, 0.95, 4]} />
        <meshStandardMaterial color="#6c4b30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.68, 1.13]}>
        <boxGeometry args={[0.7, 1.0, 0.07]} />
        <meshStandardMaterial color="#4c3727" roughness={0.92} />
      </mesh>
      <FacilityLabel title="Tool Shed" subtitle="Equipment" />
    </group>
  );
}

function WaterTank({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Water Tank"); }}>
      <mesh position={[0, 1.65, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 3.3, 20]} />
        <meshStandardMaterial color="#d6d9d4" roughness={0.42} metalness={0.15} />
      </mesh>
      <mesh position={[0, 3.35, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.16, 20]} />
        <meshStandardMaterial color="#56717b" roughness={0.55} metalness={0.35} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation) => (
        <mesh
          key={rotation}
          position={[Math.cos(rotation) * 1.45, 1.15, Math.sin(rotation) * 1.45]}
        >
          <boxGeometry args={[0.12, 2.3, 0.12]} />
          <meshStandardMaterial color="#5d5e5a" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
      <FacilityLabel title="Water Tank" subtitle="Irrigation supply" />
    </group>
  );
}

function CattlePen({ position, onSelect }) {
  const posts = [];
  const xs = [-2, 0, 2];
  const zs = [-1.2, 1.2];
  xs.forEach((x) => {
    zs.forEach((z) => posts.push([x, 0.65, z]));
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Cattle Area"); }}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.18, 3.1]} />
        <meshStandardMaterial color="#705338" roughness={1} />
      </mesh>
      {posts.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 1.3, 8]} />
          <meshStandardMaterial color="#5a3925" roughness={0.95} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((y) => (
        <group key={y}>
          <mesh position={[0, y, -1.2]}>
            <boxGeometry args={[4.3, 0.08, 0.08]} />
            <meshStandardMaterial color="#805c3a" roughness={0.95} />
          </mesh>
          <mesh position={[0, y, 1.2]}>
            <boxGeometry args={[4.3, 0.08, 0.08]} />
            <meshStandardMaterial color="#805c3a" roughness={0.95} />
          </mesh>
        </group>
      ))}
      <FacilityLabel title="Cattle Area" subtitle="Livestock" />
    </group>
  );
}

function TractorShed({ position, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect("Tractor Shed"); }}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[3.6, 2.1, 3]} />
        <meshStandardMaterial color="#5f6c5f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.28, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.2, 1.0, 4]} />
        <meshStandardMaterial color="#34483b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 1.53]}>
        <boxGeometry args={[1.65, 1.45, 0.08]} />
        <meshStandardMaterial color="#222b25" roughness={0.8} />
      </mesh>
      <FacilityLabel title="Tractor Shed" subtitle="Machinery" />
    </group>
  );
}

function FarmerNPC({ position }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.08;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.72, 6, 10]} />
        <meshStandardMaterial color="#4b7652" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#b87955" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.12, 16]} />
        <meshStandardMaterial color="#8c633b" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.16, 0]}>
        <coneGeometry args={[0.34, 0.28, 16]} />
        <meshStandardMaterial color="#8c633b" roughness={0.95} />
      </mesh>
      <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.09, 0.5, 5, 8]} />
        <meshStandardMaterial color="#4b7652" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 1.2, 0]} rotation={[0, 0, 0.35]}>
        <capsuleGeometry args={[0.09, 0.5, 5, 8]} />
        <meshStandardMaterial color="#4b7652" roughness={0.9} />
      </mesh>
      <FacilityLabel title="Farmer" subtitle="Field worker" />
    </group>
  );
}

function FacilityActionPanel({ facility, onClose }) {
  if (!facility) return null;

  const actions = {
    Farmhouse: ["Farm overview", "Weather station", "Daily report"],
    Barn: ["Livestock", "Feed stock", "Storage"],
    Greenhouse: ["Protected crops", "Temperature", "Ventilation"],
    Storage: ["Seeds", "Fertilizer", "Tools"],
    "Water Tank": ["Water level", "Pump", "Irrigation"],
    "Cattle Area": ["Animal count", "Feed", "Health"],
    "Tractor Shed": ["Tractor", "Fuel", "Maintenance"],
  }[facility] || ["Open"];

  return (
    <Html
      center
      distanceFactor={10}
      position={[0, 4.5, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <div
        style={{
          width: 220,
          padding: 12,
          borderRadius: 14,
          background: "rgba(7, 27, 18, .95)",
          border: "1px solid rgba(123, 255, 178, .45)",
          color: "#f3fff7",
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 15px 35px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>{facility}</strong>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: "rgba(255,255,255,.08)",
              color: "#fff",
              borderRadius: 8,
              cursor: "pointer",
              width: 26,
              height: 26,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
          {actions.map((action) => (
            <button
              type="button"
              key={action}
              onClick={() => {}}
              style={{
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.06)",
                color: "#eafff0",
                padding: "7px 9px",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </Html>
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

  const [
    activeFacility,
    setActiveFacility,
  ] = useState(null);

  const [waterFlowEnabled, setWaterFlowEnabled] = useState(true);
  const [gateOpen, setGateOpen] = useState(true);

  // ===================================================
  // FARM STATE
  // ===================================================
  // ===================================================
  // FARM STATE
  // ===================================================
  
  const { farmState } = useFarmState();
  
  // ===================================================
  // ORIGINAL 3D FARM LAYOUT
  // ===================================================
  
  const plotLayout = useMemo(
    () => [
      {
        id: "plot-a",
        stateId: "A",
        name: "Plot A",
        crop: "Maize",
        position: [-4.2, 0, -3.7],
  
        ph: 6.7,
        nitrogen: 72,
        phosphorus: 48,
        potassium: 61,
        diseaseRisk: "Low",
        irrigationRequired: false,
      },
  
      {
        id: "plot-b",
        stateId: "B",
        name: "Plot B",
        crop: "Maize",
        position: [4.2, 0, -3.7],
  
        ph: 6.5,
        nitrogen: 65,
        phosphorus: 51,
        potassium: 58,
        diseaseRisk: "Low",
        irrigationRequired: false,
      },
  
      {
        id: "plot-c",
        stateId: "C",
        name: "Plot C",
        crop: "Maize",
        position: [-4.2, 0, 3.7],
  
        ph: 6.2,
        nitrogen: 49,
        phosphorus: 42,
        potassium: 55,
        diseaseRisk: "Medium",
        irrigationRequired: true,
      },
  
      {
        id: "plot-d",
        stateId: "D",
        name: "Plot D",
        crop: "Maize",
        position: [4.2, 0, 3.7],
  
        ph: 6.8,
        nitrogen: 76,
        phosphorus: 54,
        potassium: 67,
        diseaseRisk: "Low",
        irrigationRequired: false,
      },
    ],
    [],
  );
  
  // ===================================================
  // MERGE LIVE DIGITAL TWIN STATE
  // ===================================================
  
  const plots = useMemo(
    () =>
      plotLayout.map((layoutPlot) => {
        const livePlot = farmState.plots.find(
          (plot) =>
            plot.id === layoutPlot.stateId,
        );
  
        return {
          ...layoutPlot,
  
          // Live values from Digital Twin
          ...(livePlot || {}),
  
          // Keep the original visual ID
          id: layoutPlot.id,
  
          // Keep original display information
          name: layoutPlot.name,
          position: layoutPlot.position,
        };
      }),
    [plotLayout, farmState.plots],
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
        flowEnabled={waterFlowEnabled && gateOpen}
        flowDirection={-1}
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
        flowEnabled={waterFlowEnabled && gateOpen}
        flowDirection={1}
      />

      <IrrigationPump
        position={[-6.9, 0.2, 7.0]}
        active={waterFlowEnabled}
        onToggle={() => setWaterFlowEnabled((value) => !value)}
      />

      <CanalGate
        position={[0, 0.12, 7.02]}
        open={gateOpen}
        onToggle={() => setGateOpen((value) => !value)}
      />


      {/* ===============================================
          FARM WORLD FACILITIES
      =============================================== */}

      <FarmHouse
        position={[-10.5, 0, -7.2]}
        onSelect={setActiveFacility}
      />

      <Barn
        position={[10.5, 0, -7.2]}
        onSelect={setActiveFacility}
      />

      <Greenhouse
        position={[-10.2, 0, 3.8]}
        onSelect={setActiveFacility}
      />

      <StorageShed
        position={[10.2, 0, 3.8]}
        onSelect={setActiveFacility}
      />

      <WaterTank
        position={[0, 0, -9.2]}
        onSelect={setActiveFacility}
      />

      <TractorShed
        position={[-10.4, 0, 8.8]}
        onSelect={setActiveFacility}
      />

      <CattlePen
        position={[10.2, 0, 8.8]}
        onSelect={setActiveFacility}
      />

      <FarmerNPC
        position={[0, 0.12, 8.75]}
      />

      {/* ===============================================
          3D FACILITY QUICK-ACTION BUTTONS
      =============================================== */}

      <FacilityButton
        position={[-10.5, 3.1, -7.2]}
        label="FARM"
        onClick={() => setActiveFacility("Farmhouse")}
      />

      <FacilityButton
        position={[10.5, 3.1, -7.2]}
        label="BARN"
        onClick={() => setActiveFacility("Barn")}
      />

      <FacilityButton
        position={[-10.2, 3.05, 3.8]}
        label="GROW"
        onClick={() => setActiveFacility("Greenhouse")}
      />

      <FacilityButton
        position={[10.2, 2.7, 3.8]}
        label="STORE"
        onClick={() => setActiveFacility("Storage")}
      />

      <FacilityButton
        position={[0, 4.0, -9.2]}
        label="WATER"
        onClick={() => setActiveFacility("Water Tank")}
      />

      <FacilityButton
        position={[-6.9, 1.7, 7.0]}
        label={waterFlowEnabled ? "PUMP ON" : "PUMP OFF"}
        onClick={() => setWaterFlowEnabled((value) => !value)}
      />

      <FacilityButton
        position={[0, 1.75, 7.0]}
        label={gateOpen ? "GATE OPEN" : "GATE CLOSED"}
        onClick={() => setGateOpen((value) => !value)}
      />

      <FacilityButton
        position={[-10.4, 3.0, 8.8]}
        label="TRACTOR"
        onClick={() => setActiveFacility("Tractor Shed")}
      />

      <FacilityButton
        position={[10.2, 2.5, 8.8]}
        label="CATTLE"
        onClick={() => setActiveFacility("Cattle Area")}
      />

      {activeFacility && (
        <FacilityActionPanel
          facility={activeFacility}
          onClose={() => setActiveFacility(null)}
        />
      )}

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
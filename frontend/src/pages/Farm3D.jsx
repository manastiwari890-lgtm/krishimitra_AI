import PageNavigation from "../components/navigation/PageNavigation";
import Farm3DScene from "../components/farm3d/Farm3DScene";

// =====================================================
// KRISHIMITRA AI
// 3D SMART FARM PAGE
// =====================================================

export default function Farm3D() {
  return (
    <>
      <PageNavigation />
    <main className="farm3d-page">
      <section
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "32px 24px 60px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              color: "#4ade80",
              fontWeight: "700",
              letterSpacing: "0.12em",
              marginBottom: "8px",
            }}
          >
            KRISHIMITRA DIGITAL FARM
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
            }}
          >
            🌾 3D Smart Farm
          </h1>

          <p
            style={{
              marginTop: "12px",
              maxWidth: "750px",
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            Interactive visualization of farm plots, crops,
            soil conditions, weather and crop health.
          </p>
        </div>

        <Farm3DScene />
      </section>
    </main>
    </>
  );
}
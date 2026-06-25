import { ImageResponse } from "next/og";

// f05 — dynamic Open Graph / Twitter card image (1200×630).
export const alt = "Armed Capital — FP&A & Demand Forecasting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0e16",
          padding: "72px",
          fontFamily: "monospace",
          color: "#e6edf3",
          backgroundImage:
            "linear-gradient(rgba(31,42,58,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(31,42,58,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30 }}>
          <span style={{ color: "#1bd17a" }}>{">_"}</span>
          <span style={{ marginLeft: 14, color: "#e6edf3" }}>armed_capital</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#1bd17a", marginBottom: 18 }}>
            $ armed-capital --forecast --rolling 12mo
          </div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1 }}>
            FP&A &amp; demand forecasting
            <br />
            for companies that{" "}
            <span style={{ color: "#1bd17a" }}>make real things</span>.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#8b97a8" }}>
          Rolling forecasts · order recommendations · ABC · days-on-hand KPIs
        </div>
      </div>
    ),
    { ...size },
  );
}

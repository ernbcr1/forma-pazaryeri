import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background:
            "linear-gradient(135deg, #03111f 0%, #061a2e 48%, #0b2540 100%)",
          color: "white",
          display: "flex",
          padding: "70px",
          position: "relative",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            borderRadius: "999px",
            background: "rgba(117, 170, 219, 0.18)",
            right: "-120px",
            top: "-130px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            left: "-120px",
            bottom: "-140px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
            <div
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "26px",
                background: "white",
                color: "#03111f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              elF
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "42px", fontWeight: 900 }}>
                elFormazione
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "22px",
                  color: "#b9cce0",
                }}
              >
                Est. 2020 · Original Football Marketplace
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                maxWidth: "900px",
                fontSize: "76px",
                lineHeight: 0.95,
                fontWeight: 900,
                letterSpacing: "-4px",
              }}
            >
              Orijinal futbol ürünleri için kalite kontrollü pazar yeri.
            </div>

            <div
              style={{
                marginTop: "34px",
                display: "flex",
                gap: "16px",
                fontSize: "24px",
                color: "#dbeafe",
              }}
            >
              <span>Forma</span>
              <span>·</span>
              <span>Krampon</span>
              <span>·</span>
              <span>Atkı</span>
              <span>·</span>
              <span>Koleksiyon</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
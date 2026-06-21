import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          background: "#ffffff",
          color: "#03111f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 900,
          borderRadius: "18px",
          letterSpacing: "-1px",
        }}
      >
        elF
      </div>
    ),
    {
      ...size,
    }
  );
}
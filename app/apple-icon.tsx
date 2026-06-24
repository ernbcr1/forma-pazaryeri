import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elformazione.com";

  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "42px",
          overflow: "hidden",
        }}
      >
        <img
          src={`${siteUrl}/elf-icon.jpg`}
          alt="elFormazione"
          width="180"
          height="180"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
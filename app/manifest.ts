import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "elFormazione",
    short_name: "elF",
    description:
      "Orijinal forma, antrenman ürünü, krampon, atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü futbol pazar yeri.",
    start_url: "/",
    display: "standalone",
    background_color: "#03111f",
    theme_color: "#03111f",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
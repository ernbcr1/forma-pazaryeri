import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://elformazione.com";

  const routes = [
    "",
    "/listings",
    "/create-listing",
    "/auth",
    "/help",
    "/rules",
    "/terms",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/listings" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/listings" ? 0.9 : 0.6,
  }));
}
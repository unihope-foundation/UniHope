import type { MetadataRoute } from "next";

const siteUrl = "https://unihopefoundation.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/our-work",
    "/volunteer",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
import type { MetadataRoute } from "next";

const siteUrl = "https://unihopefoundation.org";
const entries = [
  { path: "/", lastModified: "2026-10-22" },
  { path: "/about", lastModified: "2026-10-22" },
  { path: "/our-work", lastModified: "2026-10-22" },
  { path: "/donate", lastModified: "2026-10-22" },
  { path: "/volunteer", lastModified: "2026-10-22" },
  { path: "/contact", lastModified: "2026-10-22" },
  { path: "/privacy-policy", lastModified: "2026-10-21" },
  { path: "/terms-of-service", lastModified: "2026-10-21" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return entries.map(({ path, lastModified }) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    lastModified: new Date(lastModified),
  }));
}

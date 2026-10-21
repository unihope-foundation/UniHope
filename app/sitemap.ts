

// app/sitemap.ts
import type { MetadataRoute } from "next";

const siteUrl = "https://unihopefoundation.org";

// Add "/donate" here once the Donate page is live and returns 200.
const paths = [
  "/",
  "/about",
  "/our-work",
  "/volunteer",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
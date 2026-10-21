import type { MetadataRoute } from "next";

const siteUrl = "https://unihopefoundation.org";
const lastModified = new Date("2026-10-21T18:01:54+05:30");

const paths = [
  "/",
  "/about",
  "/our-work",
  "/donate",
  "/volunteer",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
  }));
}

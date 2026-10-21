import type { Metadata } from "next";
import { AboutUs } from "@/components/AboutUs";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why UNIHOPE Foundation was started, and the vision, mission and values that guide our work.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | UNIHOPE Foundation",
    description:
      "Why UNIHOPE Foundation was started, and the vision, mission and values that guide our work.",
    url: "https://unihopefoundation.org/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | UNIHOPE Foundation",
    description:
      "Why UNIHOPE Foundation was started, and the vision, mission and values that guide our work.",
  },
};

export default function AboutPage() {
  return <AboutUs />;
}

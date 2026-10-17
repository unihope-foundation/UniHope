import type { Metadata } from "next";
import { AboutUs } from "@/components/AboutUs";

export const metadata: Metadata = {
  title: "About Us • UniHope Foundation",
  description: "Learn about UniHope Foundation, our vision, values, leadership, and our commitment to sustainable community impact in Chennai.",
};

export default function AboutPage() {
  return <AboutUs />;
}

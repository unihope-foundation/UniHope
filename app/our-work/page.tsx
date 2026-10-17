import type { Metadata } from "next";
import { OurWork } from "@/components/OurWork";

export const metadata: Metadata = {
  title: "Our Work • UniHope Foundation",
  description: "Explore the ten pillars of service and community programs driven by UniHope Foundation across Chennai and Tamil Nadu.",
};

export default function OurWorkPage() {
  return <OurWork />;
}

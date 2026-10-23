import type { Metadata } from "next";
import { OurWork } from "@/components/OurWork";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Explore UNIHOPE Foundation's community welfare work in Chennai and its ten focus areas, including health, education, livelihoods, women and children, and the environment.",
  alternates: { canonical: "/our-work" },
  openGraph: {
    title: "Our Work | UNIHOPE Foundation",
    description:
      "Explore UNIHOPE Foundation's community welfare work in Chennai and its ten focus areas, including health, education, livelihoods, women and children, and the environment.",
    url: "https://unihopefoundation.org/our-work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work | UNIHOPE Foundation",
    description:
      "Explore UNIHOPE Foundation's community welfare work in Chennai and its ten focus areas, including health, education, livelihoods, women and children, and the environment.",
  },
};

export default function OurWorkPage() {
  return (
    <main>
      <OurWork />
    </main>
  );
}

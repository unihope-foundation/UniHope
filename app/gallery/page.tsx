import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery | Community Outreach & Impact Moments",
  description:
    "Explore UNIHOPE Foundation's photo gallery showcasing community welfare, education drives, healthcare camps, and volunteer moments in Chennai and Tamil Nadu.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | UNIHOPE Foundation",
    description:
      "Captured moments from UNIHOPE Foundation's community outreach, education, and volunteer initiatives across Chennai.",
    url: "https://unihopefoundation.org/gallery",
    type: "website",
  },
};

export default function GalleryPage() {
  return (
    <main>
      <Gallery />
    </main>
  );
}

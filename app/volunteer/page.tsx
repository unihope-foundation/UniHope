import type { Metadata } from "next";
import { Volunteer } from "@/components/Volunteer";

export const metadata: Metadata = {
  title: "Volunteer in Chennai",
  description:
    "Explore volunteer opportunities with UNIHOPE Foundation in Chennai. Give your time, skills or support and register to get involved.",
  alternates: { canonical: "/volunteer" },
  openGraph: {
    title: "Volunteer in Chennai | UNIHOPE Foundation",
    description:
      "Explore volunteer opportunities with UNIHOPE Foundation in Chennai. Give your time, skills or support and register to get involved.",
    url: "https://unihopefoundation.org/volunteer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer in Chennai | UNIHOPE Foundation",
    description:
      "Explore volunteer opportunities with UNIHOPE Foundation in Chennai. Give your time, skills or support and register to get involved.",
  },
};

export default function VolunteerPage() {
  return <Volunteer />;
}

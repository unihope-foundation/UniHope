import type { Metadata } from "next";
import { Volunteer } from "@/components/Volunteer";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Give your time, skills or support. Register to volunteer with UNIHOPE Foundation.",
  alternates: {
    canonical: "/volunteer",
  },
  openGraph: {
    title: "Volunteer | UNIHOPE Foundation",
    description:
      "Give your time, skills or support. Register to volunteer with UNIHOPE Foundation.",
    url: "https://unihopefoundation.org/volunteer",
    type: "website",
    siteName: "UNIHOPE Foundation",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer | UNIHOPE Foundation",
    description:
      "Give your time, skills or support. Register to volunteer with UNIHOPE Foundation.",
  },
};

export default function VolunteerPage() {
  return <Volunteer />;
}

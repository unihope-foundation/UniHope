import type { Metadata } from "next";
import { TermsOfService } from "@/components/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for using this website, donating and volunteering with UNIHOPE Foundation.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    title: "Terms of Service | UNIHOPE Foundation",
    description:
      "The rules for using this website, donating and volunteering with UNIHOPE Foundation.",
    url: "https://unihopefoundation.org/terms-of-service",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | UNIHOPE Foundation",
    description:
      "The rules for using this website, donating and volunteering with UNIHOPE Foundation.",
  },
};

export default function TermsOfServicePage() {
  return <TermsOfService />;
}

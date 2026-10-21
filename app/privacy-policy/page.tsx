import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How UNIHOPE Foundation collects, uses and protects your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | UNIHOPE Foundation",
    description:
      "How UNIHOPE Foundation collects, uses and protects your personal information.",
    url: "https://unihopefoundation.org/privacy-policy",
    type: "website",
    siteName: "UNIHOPE Foundation",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | UNIHOPE Foundation",
    description:
      "How UNIHOPE Foundation collects, uses and protects your personal information.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}

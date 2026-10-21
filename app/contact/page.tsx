import type { Metadata } from "next";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to UNIHOPE Foundation or find our registered office in Vadapalani, Chennai.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | UNIHOPE Foundation",
    description:
      "Write to UNIHOPE Foundation or find our registered office in Vadapalani, Chennai.",
    url: "https://unihopefoundation.org/contact",
    type: "website",
    siteName: "UNIHOPE Foundation",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | UNIHOPE Foundation",
    description:
      "Write to UNIHOPE Foundation or find our registered office in Vadapalani, Chennai.",
  },
};

export default function ContactPage() {
  return <Contact />;
}

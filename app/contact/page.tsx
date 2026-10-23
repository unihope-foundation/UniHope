import type { Metadata } from "next";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact UNIHOPE Foundation in Vadapalani, Chennai, for general questions, volunteer enquiries and CSR or institutional partnership enquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | UNIHOPE Foundation",
    description:
      "Contact UNIHOPE Foundation in Vadapalani, Chennai, for general questions, volunteer enquiries and CSR or institutional partnership enquiries.",
    url: "https://unihopefoundation.org/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | UNIHOPE Foundation",
    description:
      "Contact UNIHOPE Foundation in Vadapalani, Chennai, for general questions, volunteer enquiries and CSR or institutional partnership enquiries.",
  },
};

export default function ContactPage() {
  return <Contact />;
}

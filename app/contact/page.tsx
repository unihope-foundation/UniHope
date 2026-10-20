import type { Metadata } from "next";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact Us • UniHope Foundation",
  description:
    "Get in touch with UNIHOPE Foundation in Vadapalani, Chennai. Call +91 91501 49339 or write to unihopefoundation.official@gmail.com for inquiries, partnerships, or volunteering.",
};

export default function ContactPage() {
  return <Contact />;
}

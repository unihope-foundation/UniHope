import type { Metadata } from "next";
import { TermsOfService } from "@/components/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service • UniHope Foundation",
  description:
    "Review the terms, conditions, and statutory rules for using the website, donating, and volunteering with UNIHOPE Foundation.",
};

export default function TermsOfServicePage() {
  return <TermsOfService />;
}

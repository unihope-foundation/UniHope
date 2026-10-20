import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy • UniHope Foundation",
  description:
    "Learn how UNIHOPE Foundation collects, uses, and safeguards donor and volunteer information in strict accordance with Indian statutory and charitable trust regulations.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}

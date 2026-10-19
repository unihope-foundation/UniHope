import { FileText, Receipt, Scale, ShieldCheck, Users, type LucideIcon } from "lucide-react";

export const REG_NO = "R/Chennai North Joint I/Book-4/228/2026";
export const HELPLINE = "+91 91501 49339";
export const VOLUNTEER_FORM_URL = "https://forms.gle/E7G9Sta8sb3eQm9w8";

export const HERO_IMAGE = {
  src: "/assets/Community gathering Chennai.svg",
  alt: "Community gathering in Chennai",
};

export type Commitment = { icon: LucideIcon; title: string; text: string };
export const COMMITMENTS: Commitment[] = [
  {
    icon: ShieldCheck,
    title: "Direct allocation",
    text: "Your contributions directly fund verified community initiatives, medicines, and welfare camps in Chennai.",
  },
  {
    icon: Receipt,
    title: "Immediate Digital Receipt",
    text: "Instant acknowledgement and official trust receipt sent directly to your registered email address.",
  },
  {
    icon: Scale,
    title: "Registered charitable trust",
    text: `Administered under Reg. No. ${REG_NO}.`,
  },
];

export type TrustCard = { icon: LucideIcon; title: string; text: string; footer: string };
export const TRUST_CARDS: TrustCard[] = [
  {
    icon: ShieldCheck,
    title: "Transparent allocation",
    text: "Every rupee is accounted for and directed to the work we set out to do.",
    footer: "Verifiable disbursements",
  },
  {
    icon: Users,
    title: "Community driven",
    text: "Programs are planned with the people they serve.",
    footer: "Direct local stakeholder guidance",
  },
  {
    icon: FileText,
    title: "Registered trust",
    text: `UNIHOPE Foundation is a registered charitable trust. Reg. No. ${REG_NO}.`,
    footer: "Registered 2026",
  },
];

export type FaqItem = { question: string; answer: string };
export const FAQ: FaqItem[] = [
  {
    question: "How can I donate?",
    answer:
      "Choose an amount, pick where you would like it to go, and enter your name, email and phone number. Then choose how you want to pay: UPI or QR code, bank transfer (NEFT or RTGS), or online payment. Your receipt is sent to your email.",
  },
  {
    question: "Is there a minimum amount?",
    answer:
      "You can give any amount. Choose ₹500, ₹1,000, ₹2,500 or ₹5,000, or select Other and enter the amount you would like to give.",
  },
  {
    question: "Can I donate anonymously?",
    answer:
      'Yes. Tick "Hide my name (donate anonymously)" on the donation form and your name will not be shown publicly. We still record your details to send your receipt and keep our accounts.',
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "You can pay by UPI or QR code, by bank transfer (NEFT or RTGS), or through online payment. Choose your method under Payment Method on the donation form.",
  },
  {
    question: "Will I receive a receipt?",
    answer:
      `Yes. A receipt is sent to the email address you enter on the donation form, so please check that it is correct. If you do not receive it, write to unihopefoundation.official@gmail.com or call ${HELPLINE}.`,
  },
  {
    question: "How will my donation be used?",
    answer:
      "You decide where it goes. If you choose a purpose such as Education, Healthcare, Hunger Relief, Community Welfare, Environment or Empowerment, we use your donation for that purpose. If you choose General Fund, we use it where the need is greatest.",
  },
];

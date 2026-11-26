import type { Metadata } from "next";
import { OurWork } from "@/components/OurWork";

export const metadata: Metadata = {
  title: "Our Work | Youth Skills, Education & Community Welfare NGO in Chennai",
  description:
    "Explore UNIHOPE Foundation's community welfare work in Vadapalani, Chennai and across Tamil Nadu. Discover our 10 pillars: youth skill development, free child education, healthcare camps, women empowerment, and humanitarian relief.",
  keywords: [
    "UNIHOPE Foundation",
    "NGO in Chennai",
    "community welfare Tamil Nadu",
    "youth skill development NGO Chennai",
    "free education NGO Chennai",
    "healthcare camps Vadapalani",
    "women and child welfare NGO",
    "charitable trust Chennai 12A 80G",
    "humanitarian relief Tamil Nadu",
  ],
  alternates: { canonical: "/our-work" },
  openGraph: {
    title: "Our Work | UNIHOPE Foundation Chennai",
    description:
      "Discover UNIHOPE Foundation's 10 pillars of community welfare in Chennai & Tamil Nadu: youth skills, education, healthcare, women empowerment, and crisis relief.",
    url: "https://unihopefoundation.org/our-work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work | UNIHOPE Foundation Chennai",
    description:
      "Youth skills, free education, healthcare camps, and community welfare across Chennai & Tamil Nadu.",
  },
};

const ourWorkJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Our Work - UNIHOPE Foundation",
  url: "https://unihopefoundation.org/our-work",
  description:
    "Community welfare initiatives by UNIHOPE Foundation in Chennai and Tamil Nadu across 10 core pillars including youth skills, education, healthcare, women welfare, and environment.",
  publisher: {
    "@type": "NGO",
    name: "UNIHOPE Foundation",
    url: "https://unihopefoundation.org",
    areaServed: ["Chennai", "Vadapalani", "Tamil Nadu", "India"],
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Ten Pillars of Service",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Health and humanitarian support" },
      { "@type": "ListItem", position: 2, name: "Education and knowledge" },
      { "@type": "ListItem", position: 3, name: "Skills and livelihood" },
      { "@type": "ListItem", position: 4, name: "Women and child welfare" },
      { "@type": "ListItem", position: 5, name: "Support for vulnerable people" },
      { "@type": "ListItem", position: 6, name: "Mental health and rehabilitation" },
      { "@type": "ListItem", position: 7, name: "Community development" },
      { "@type": "ListItem", position: 8, name: "Environment" },
      { "@type": "ListItem", position: 9, name: "Research and awareness" },
      { "@type": "ListItem", position: 10, name: "Partnerships" },
    ],
  },
};

export default function OurWorkPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ourWorkJsonLd) }}
      />
      <OurWork />
    </main>
  );
}

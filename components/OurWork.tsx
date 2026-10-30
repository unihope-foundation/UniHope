"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ourWorkBanner from "@/assets/our-work-banner.svg";
import { MapPin, ArrowUpRight } from "lucide-react";
import { TickerRibbon } from "@/components/TickerRibbon";
import OurWorkHero from "./hero/OurworkHero";
export interface PillarItem {
  id: string;
  pillarNumber: string;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
}

const PILLARS: PillarItem[] = [
  {
    id: "01",
    pillarNumber: "PILLAR 01",
    title: "Health and humanitarian support",
    subtitle: "Help with healthcare when you need it most.",
    description:
      "We support medical assistance for people who cannot afford to pay for it, health awareness programmes and blood donation awareness. We also support with humanitarian help when a crisis hits.",
    badges: ["Medical assistance", "Health camps", "Emergency relief"],
  },
  {
    id: "02",
    pillarNumber: "PILLAR 02",
    title: "Education and knowledge",
    subtitle: "Learning tools and guidance so that a child can thrive.",
    description:
      "Scholarships, textbooks, uniforms, evening study centres, and foundational learning support for students from underprivileged backgrounds.",
    badges: ["Scholarships", "School kits", "Study centres"],
  },
  {
    id: "03",
    pillarNumber: "PILLAR 03",
    title: "Skills and livelihood",
    subtitle: "Skill training that helps earn a living.",
    description:
      "Vocational courses, digital literacy, sewing and tailoring, and micro-entrepreneurship mentoring for youth and women.",
    badges: ["Vocational courses", "Job training", "Micro-enterprise"],
  },
  {
    id: "04",
    pillarNumber: "PILLAR 04",
    title: "Women and child welfare",
    subtitle: "Stronger women, safer children.",
    description:
      "Empowering self-help groups, addressing child nutrition deficiencies, and creating safe, dignified spaces for vulnerable women and girls.",
    badges: ["Nutrition care", "Self-help groups", "Safety nets"],
  },
  {
    id: "05",
    pillarNumber: "PILLAR 05",
    title: "Support for vulnerable people",
    subtitle: "Dignity for people who are easy to overlook.",
    description:
      "Direct aid, groceries, mobility aids, and elderly care for neglected senior citizens, differently-abled persons, and abandoned individuals.",
    badges: ["Elderly care", "Mobility support", "Ration kits"],
  },
  {
    id: "06",
    pillarNumber: "PILLAR 06",
    title: "Mental health and rehabilitation",
    subtitle: "Taking care of mind and recovery.",
    description:
      "De-stigmatizing mental health, providing professional community counseling, stress workshops, and psychosocial support.",
    badges: ["Counseling", "Awareness camps", "Wellness circles"],
  },
  {
    id: "07",
    pillarNumber: "PILLAR 07",
    title: "Community development",
    subtitle: "Good neighbourhood, built together.",
    description:
      "Clean water installations, sanitation facilities, community hall revamps, and disaster preparedness in underserved settlements.",
    badges: ["Clean water", "Sanitation", "Civic amenities"],
  },
  {
    id: "08",
    pillarNumber: "PILLAR 08",
    title: "Environment",
    subtitle: "Living spaces that are greener and healthier.",
    description:
      "Urban afforestation, tree sapling plantation drives, community compost pits, and environmental education in local schools.",
    badges: ["Tree planting", "Waste management", "Eco-clubs"],
  },
  {
    id: "09",
    pillarNumber: "PILLAR 09",
    title: "Research and awareness",
    subtitle: "Understanding community challenges better.",
    description:
      "Conducting ground-level socio-economic surveys, identifying unmet local needs, and raising civic awareness on rights and schemes.",
    badges: ["Surveys", "Policy awareness", "Impact audits"],
  },
  {
    id: "10",
    pillarNumber: "PILLAR 10",
    title: "Partnerships",
    subtitle: "Work better by working together.",
    description:
      "Collaborating with local hospitals, universities, corporate CSR arms, and partner charities to maximize collective community impact.",
    badges: ["CSR alignment", "Institutional tie-ups", "NGO networks"],
  },
];

export function OurWork({ className = "" }: { className?: string }) {
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  const togglePillar = (id: string) => {
    setOpenPillar((current) => (current === id ? null : id));
  };

  return (
    <div className={`flex flex-col min-h-screen bg-white ${className}`}>
      {/* ========================================================= */}
      {/* 1. HERO SECTION & BANNER IMAGE                            */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:pt-12 sm:pb-14 sm:px-6 lg:px-8">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
            Our Work
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A2540]">
            Community welfare work
          </h1>
          <p className="mt-2 text-xs sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            Creating hope. Empowering lives. Building a better society.
          </p>
        </div>

        {/* Large Horizontal Banner Photo (class.svg) */}
        <div className="mt-6 sm:mt-8 relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
          <div className="relative aspect-[16/10] sm:aspect-[1198/518] min-h-[220px] sm:min-h-[440px] w-full">
            <Image
              src={ourWorkBanner}
              alt="UNIHOPE community gathering in Chennai"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Caption Banner */}
        <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 rounded-xl bg-[#F4F5F7] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-sm text-gray-600 border border-gray-100">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A2540] shrink-0" />
          <span>
            UNIHOPE&apos;s presence in Vadapalani, Chennai and rural pockets across Tamil Nadu.
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TICKER RIBBON                                          */}
      {/* ========================================================= */}
      <TickerRibbon />

      {/* ========================================================= */}
      {/* 3. TEN PILLARS OF SERVICE (Accordion Cards)               */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-20 sm:px-6 lg:px-8">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
            Guiding Charter
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0A2540]">
            Ten pillars of service
          </h2>
          <p className="mt-2 text-xs sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            The permanent foundational focus areas and operating objectives
            established in our registered charter.
          </p>
        </div>

        {/* 10 Pillars Grid */}
        <div className="mt-8 grid grid-cols-1 items-start gap-6 md:mt-12 md:grid-cols-12">
          {PILLARS.map((pillar, index) => {
            const isOpen = openPillar === pillar.id;
            const span =
              index % 4 === 0 || index % 4 === 3
                ? "md:col-span-7"
                : "md:col-span-5";
            const detailsId = `pillar-details-${pillar.id}`;

            return (
              <article
                key={pillar.id}
                className={`group flex min-h-[312px] flex-col justify-between rounded-[20px] border border-[#D9D3C5] bg-[#FBFAF6] p-6 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#B9AE99] hover:bg-white hover:shadow-[0_16px_36px_rgba(41,39,34,0.10)] motion-reduce:transition-none sm:p-8 ${span}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-3xl leading-none tracking-tight text-[#19181A] sm:text-[38px]">
                      {pillar.id}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {pillar.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-md border border-[#D9D3C5] bg-[#F0EDE5] px-2.5 py-1.5 text-[9px] font-semibold leading-none tracking-wide text-[#292722] sm:text-[10px]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="mt-5 font-sans text-xl font-bold leading-tight text-[#19181A] sm:text-[23px]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 max-w-[480px] text-sm leading-[1.55] text-[#68656D] sm:text-base">
                    {pillar.subtitle}
                  </p>
                </div>

                <div
                  id={detailsId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-5 border-t border-[#D9D3C5] pt-4 text-sm leading-relaxed text-[#68656D] sm:pt-5 sm:text-base">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => togglePillar(pillar.id)}
                  className="mt-5 flex w-full cursor-pointer items-center justify-between border-t border-[#D9D3C5] pt-4 text-left sm:pt-5"
                >
                  <span className="text-sm font-semibold text-[#19181A] sm:text-base">
                    {isOpen ? "Close details" : "Explore pillar"}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#19181A] text-white transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none sm:h-14 sm:w-14"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                      <path
                        d="M5.5 14.5 14 6m0 0H7m7 0v7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </section>
      {/* <OurWorkHero /> */}
      {/* ========================================================= */}
      {/* 4. PRE-FOOTER CTA ("Want to be part of it?")              */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F5F7] p-6 sm:p-14 text-center max-w-4xl mx-auto shadow-xs border border-gray-200">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#0A2540]">
            Want to be part of it?
          </h2>
          <p className="mt-2 text-xs sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Every one of these areas needs people. Tell us where you can help.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#071D33] active:scale-[0.98]"
            >
              Donate
            </Link>
            <Link
              href="/volunteer"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-800 shadow-xs transition hover:border-gray-900 active:scale-[0.98]"
            >
              Become a volunteer
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurWork;
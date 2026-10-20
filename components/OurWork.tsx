"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ourWorkBanner from "@/assets/our-work-banner.svg";
import {
  Activity,
  GraduationCap,
  Briefcase,
  Users,
  HandHeart,
  Smile,
  Home as HomeIcon,
  Leaf,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export interface PillarItem {
  id: string;
  pillarNumber: string;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  icon: React.ReactNode;
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
    icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "02",
    pillarNumber: "PILLAR 02",
    title: "Education and knowledge",
    subtitle: "Learning tools and guidance so that a child can thrive.",
    description:
      "Scholarships, textbooks, uniforms, evening study centres, and foundational learning support for students from underprivileged backgrounds.",
    badges: ["Scholarships", "School kits", "Study centres"],
    icon: <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "03",
    pillarNumber: "PILLAR 03",
    title: "Skills and livelihood",
    subtitle: "Skill training that helps earn a living.",
    description:
      "Vocational courses, digital literacy, sewing and tailoring, and micro-entrepreneurship mentoring for youth and women.",
    badges: ["Vocational courses", "Job training", "Micro-enterprise"],
    icon: <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "04",
    pillarNumber: "PILLAR 04",
    title: "Women and child welfare",
    subtitle: "Stronger women, safer children.",
    description:
      "Empowering self-help groups, addressing child nutrition deficiencies, and creating safe, dignified spaces for vulnerable women and girls.",
    badges: ["Nutrition care", "Self-help groups", "Safety nets"],
    icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "05",
    pillarNumber: "PILLAR 05",
    title: "Support for vulnerable people",
    subtitle: "Dignity for people who are easy to overlook.",
    description:
      "Direct aid, groceries, mobility aids, and elderly care for neglected senior citizens, differently-abled persons, and abandoned individuals.",
    badges: ["Elderly care", "Mobility support", "Ration kits"],
    icon: <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "06",
    pillarNumber: "PILLAR 06",
    title: "Mental health and rehabilitation",
    subtitle: "Taking care of mind and recovery.",
    description:
      "De-stigmatizing mental health, providing professional community counseling, stress workshops, and psychosocial support.",
    badges: ["Counseling", "Awareness camps", "Wellness circles"],
    icon: <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "07",
    pillarNumber: "PILLAR 07",
    title: "Community development",
    subtitle: "Good neighbourhood, built together.",
    description:
      "Clean water installations, sanitation facilities, community hall revamps, and disaster preparedness in underserved settlements.",
    badges: ["Clean water", "Sanitation", "Civic amenities"],
    icon: <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "08",
    pillarNumber: "PILLAR 08",
    title: "Environment",
    subtitle: "Living spaces that are greener and healthier.",
    description:
      "Urban afforestation, tree sapling plantation drives, community compost pits, and environmental education in local schools.",
    badges: ["Tree planting", "Waste management", "Eco-clubs"],
    icon: <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "09",
    pillarNumber: "PILLAR 09",
    title: "Research and awareness",
    subtitle: "Understanding community challenges better.",
    description:
      "Conducting ground-level socio-economic surveys, identifying unmet local needs, and raising civic awareness on rights and schemes.",
    badges: ["Surveys", "Policy awareness", "Impact audits"],
    icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
  {
    id: "10",
    pillarNumber: "PILLAR 10",
    title: "Partnerships",
    subtitle: "Work better by working together.",
    description:
      "Collaborating with local hospitals, universities, corporate CSR arms, and partner charities to maximize collective community impact.",
    badges: ["CSR alignment", "Institutional tie-ups", "NGO networks"],
    icon: <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />,
  },
];

export function OurWork({ className = "" }: { className?: string }) {
  // Default first pillar open as shown in mockup
  const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({
    "01": true,
  });

  const togglePillar = (id: string) => {
    setOpenPillars((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
            Our work
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
      <div className="w-full bg-[#FF8000] py-3.5 overflow-hidden select-none shadow-xs">
        <div className="flex whitespace-nowrap text-xs sm:text-sm font-extrabold tracking-widest text-[#0A2540] uppercase justify-around px-4">
          <span>TOGETHER, WE BUILD HOPE</span>
          <span className="mx-2">•</span>
          <span>EVERY DREAM COUNTS</span>
          <span className="mx-2">•</span>
          <span>TRANSFORMING LIVES</span>
          <span className="hidden sm:inline mx-2">•</span>
          <span className="hidden sm:inline">TOGETHER, WE BUILD HOPE</span>
          <span className="hidden md:inline mx-2">•</span>
          <span className="hidden md:inline">EVERY DREAM COUNTS</span>
        </div>
      </div>

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

        {/* 10 Pillars Grid (Single column on mobile, 2 columns on lg) */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-3.5 sm:gap-6 lg:grid-cols-2 items-start">
          {PILLARS.map((pillar) => {
            const isOpen = !!openPillars[pillar.id];

            return (
              <div
                key={pillar.id}
                className={`rounded-2xl border transition-all duration-200 bg-white shadow-xs ${
                  isOpen
                    ? "border-[#0A2540]/30 ring-1 ring-[#0A2540]/10 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => togglePillar(pillar.id)}
                  className="w-full flex items-start justify-between p-4 sm:p-6 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-gray-100">
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-[#2E7D32] uppercase">
                        {pillar.pillarNumber}
                      </span>
                      <h3 className="mt-0.5 text-sm sm:text-lg font-bold text-[#0A2540] leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] sm:text-sm text-gray-500">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2 sm:ml-3 shrink-0 pt-1 text-gray-400">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A2540]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                </button>

                {/* Accordion Expanded Content */}
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100/80">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5 sm:mt-3">
                      {pillar.description}
                    </p>

                    {/* Sub-Badges */}
                    {pillar.badges && pillar.badges.length > 0 && (
                      <div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                        {pillar.badges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center rounded-full border border-gray-200 bg-slate-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-gray-700"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

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

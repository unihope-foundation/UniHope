import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import miniclassImg from "@/assets/miniclass.svg";
import studentsImg from "@/assets/students.svg";
import classImg from "@/assets/class.svg";
import {
  Activity,
  GraduationCap,
  Briefcase,
  Users,
  HandHeart,
  Smile,
  Home as HomeIcon,
  Leaf,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { TickerRibbon } from "@/components/TickerRibbon";

const homeTitle = "UNIHOPE Foundation | Registered Charitable Trust in Chennai";
const homeDescription =
  "UNIHOPE Foundation is a registered charitable trust in Chennai working on education, healthcare, livelihoods and community welfare. Donate or volunteer.";

export const metadata: Metadata = {
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "https://unihopefoundation.org/",
    type: "website",
    siteName: "UNIHOPE Foundation",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
  },
};

export default function Home() {
  const focusAreas = [
    {
      icon: <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Healthcare",
      description: "Primary medical support and health camps for marginalized families.",
    },
    {
      icon: <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Education",
      description: "Scholarships, tuition support, and school kits for young learners.",
    },
    {
      icon: <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Skills and livelihood",
      description: "Vocational training and micro-enterprise development.",
    },
    {
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Women and children",
      description: "Safety nets, nutritional care, and skill empowerment.",
    },
    {
      icon: <HandHeart className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Vulnerable people",
      description: "Direct relief and shelter assistance for the elderly and disabled.",
    },
    {
      icon: <Smile className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Mental health",
      description: "Community counseling, awareness sessions, and emotional wellness support.",
    },
    {
      icon: <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Community welfare",
      description: "Disaster relief, sanitation facilities, and clean drinking water.",
    },
    {
      icon: <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A2540]" />,
      title: "Environment",
      description: "Tree plantation drives, waste management, and green education.",
    },
  ];

  const stats = [
    { value: "2024", label: "Year registered" },
    { value: "10", label: "Focus areas" },
    { value: "Chennai", label: "Headquartered in" },
    {
      value: "Registered charitable trust",
      label: "Reg. No. R/Chennai North Joint I/Book-4/228/2026",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        {/* Mobile View Structure (< lg) */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* Headline Card */}
          <div className="flex flex-col justify-center rounded-[2rem] bg-[#F4F5F7] p-6 sm:p-10">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
              Registered Charitable Trust, Chennai
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-4xl leading-tight">
              A fair start for every person in our community.
            </h1>
          </div>

          {/* Photo */}
          <div className="relative overflow-hidden rounded-[2rem] shadow-xs aspect-[586/418] w-full">
            <Image
              src={miniclassImg}
              alt="Outdoor village classroom in Tamil Nadu"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Paragraph and CTAs */}
          <div className="flex flex-col">
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              UniHope Foundation is a grassroots initiative in Chennai, dedicated to
              uplifting vulnerable individuals and families through targeted
              education, healthcare, and livelihood support.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0A2540] py-3.5 px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#071D33] active:scale-[0.98]"
              >
                Donate
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white py-3.5 px-6 text-sm font-semibold text-gray-800 shadow-xs transition hover:border-gray-900 active:scale-[0.98]"
              >
                Read the constitution
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop View Structure (>= lg) */}
        <div className="hidden lg:block">
          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="flex flex-col justify-center rounded-[2rem] bg-[#F4F5F7] p-12 lg:col-span-6 lg:p-14">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
                Registered Charitable Trust, Chennai
              </span>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0A2540] lg:text-[44px] lg:leading-[1.18]">
                A fair start for every person in our community.
              </h2>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] lg:col-span-6 shadow-xs aspect-[586/418] w-full">
              <Image
                src={miniclassImg}
                alt="Outdoor village classroom in Tamil Nadu"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="mt-6 grid grid-cols-12 gap-6 items-center">
            <div className="relative overflow-hidden rounded-[2rem] lg:col-span-5 shadow-xs aspect-[376/282] w-full">
              <Image
                src={studentsImg}
                alt="Two smiling students studying with notebooks"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center lg:col-span-7 lg:pl-8">
              <p className="text-lg leading-relaxed text-gray-600 max-w-xl">
                UniHope Foundation is a grassroots initiative in Chennai, dedicated to
                uplifting vulnerable individuals and families through targeted
                education, healthcare, and livelihood support.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#071D33] active:scale-[0.98]"
                >
                  Donate
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-xs transition hover:border-gray-900 active:scale-[0.98]"
                >
                  Read the constitution
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* ========================================================= */}
           {/* 2. TICKER RIBBON                                          */}
           {/* ========================================================= */}
         
           <section>
           <TickerRibbon />
           </section>

      {/* ========================================================= */}
      {/* 3. KEY STATS SECTION                                      */}
      {/* ========================================================= */}
      <section className="w-full bg-[#F8F9FA] border-y border-gray-100 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0A2540]">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-gray-500 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHERE YOUR HELP GOES                                   */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
            Our Work
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0A2540]">
            Where your help goes
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
            We stand with vulnerable communities to provide dignity, opportunity, and hope.
          </p>
        </div>

        {/* 8 Cards Grid (Horizontal on mobile, vertical on sm/lg) */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {focusAreas.map((area) => (
            <div
              key={area.title}
              className="group flex flex-row sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl border border-gray-100 bg-white p-5 sm:p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-200"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-gray-100 group-hover:bg-blue-50/70 transition-colors">
                {area.icon}
              </div>
              <div className="flex-1 sm:mt-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
                  {area.title}
                </h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed text-gray-500">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* See All Work CTA */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link
            href="/our-work"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 sm:py-2.5 text-sm font-semibold text-gray-800 shadow-xs transition hover:border-gray-900 active:scale-[0.98]"
          >
            See all our work
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. WHY WE STARTED                                         */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-sm flex flex-col">
          {/* Background Image Banner */}
          <div className="relative aspect-[16/10] sm:aspect-[1198/518] min-h-[220px] sm:min-h-[440px] w-full">
            <Image
              src={classImg}
              alt="UniHope village classroom story"
              fill
              className="object-cover"
            />
          </div>

          {/* Story Card (Stacked on mobile, floating on lg) */}
          <div className="relative lg:absolute lg:left-10 lg:top-1/2 lg:-translate-y-1/2 pt-4 sm:pt-6 lg:pt-0">
            <div className="max-w-lg rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-10 shadow-lg lg:shadow-xl border border-gray-100">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
                Our Story
              </span>
              <h3 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0A2540]">
                Why we started
              </h3>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-base leading-relaxed text-gray-600">
                Our journey started from a simple conviction: no one in our
                community should be left behind without access to basic dignity,
                education, and health. A small group of committed individuals came
                together to create systematic change.
              </p>

              {/* Callout Quote */}
              <div className="mt-4 sm:mt-6 rounded-xl bg-[#F8F9FA] p-3.5 sm:p-4 border-l-3 border-[#2E7D32] italic text-xs sm:text-sm text-gray-700">
                “The measure of a society is how it treats its most vulnerable members.”
              </div>

              <div className="mt-5 sm:mt-6">
                <Link
                  href="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 sm:py-2 text-xs font-semibold text-gray-800 shadow-xs transition hover:border-gray-900"
                >
                  Read our story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PRE-FOOTER CTA                                         */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#0A2540] p-8 sm:p-14 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center sm:text-left">
          <div>
            {/* Top Badge Icon */}
            <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white mb-4">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              There is a place for you here
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-blue-100/80">
              You do not have to do everything. You only have to do something.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0A2540] shadow-sm transition hover:bg-gray-100 hover:shadow-md active:scale-[0.98]"
            >
              Donate now
            </Link>
            <Link
              href="/volunteer"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
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

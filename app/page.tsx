import React from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
  const focusAreas = [
    {
      icon: <Activity className="h-6 w-6 text-[#0A2540]" />,
      title: "Healthcare",
      description: "Primary medical support and health camps for marginalized families.",
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-[#0A2540]" />,
      title: "Education",
      description: "Scholarships, tuition support, and school kits for young learners.",
    },
    {
      icon: <Briefcase className="h-6 w-6 text-[#0A2540]" />,
      title: "Skills and livelihood",
      description: "Vocational training and micro-enterprise development.",
    },
    {
      icon: <Users className="h-6 w-6 text-[#0A2540]" />,
      title: "Women and children",
      description: "Safety nets, nutritional care, and skill empowerment.",
    },
    {
      icon: <HandHeart className="h-6 w-6 text-[#0A2540]" />,
      title: "Vulnerable people",
      description: "Direct relief and shelter assistance for the elderly and disabled.",
    },
    {
      icon: <Smile className="h-6 w-6 text-[#0A2540]" />,
      title: "Mental health",
      description: "Community counseling, awareness sessions, and emotional wellness support.",
    },
    {
      icon: <HomeIcon className="h-6 w-6 text-[#0A2540]" />,
      title: "Community welfare",
      description: "Disaster relief, sanitation facilities, and clean drinking water.",
    },
    {
      icon: <Leaf className="h-6 w-6 text-[#0A2540]" />,
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
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        {/* Row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Headline Card */}
          <div className="flex flex-col justify-center rounded-[2rem] bg-[#F4F5F7] p-8 sm:p-12 lg:col-span-6 lg:p-14">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
              Registered Charitable Trust, Chennai
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-4xl lg:text-[44px] lg:leading-[1.18]">
              A fair start for every person in our community.
            </h1>
          </div>

          {/* Hero Top-Right Image (miniclass.svg) */}
          <div className="relative overflow-hidden rounded-[2rem] lg:col-span-6 shadow-xs aspect-[586/418] w-full">
            <Image
              src="/miniclass.svg"
              alt="Outdoor village classroom in Tamil Nadu"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Hero Bottom-Left Image (students.svg) */}
          <div className="relative overflow-hidden rounded-[2rem] lg:col-span-5 shadow-xs aspect-[376/282] w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
            <Image
              src="/students.svg"
              alt="Two smiling students studying with notebooks"
              fill
              className="object-cover"
            />
          </div>

          {/* Hero Description & CTAs */}
          <div className="flex flex-col justify-center lg:col-span-7 lg:pl-8">
            <p className="text-base sm:text-lg leading-relaxed text-gray-600 max-w-xl">
              UniHope Foundation is a grassroots initiative in Chennai, dedicated to
              uplifting vulnerable individuals and families through targeted
              education, healthcare, and livelihood support.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#071D33] hover:shadow-md active:scale-[0.98]"
              >
                Donate
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-xs transition-all duration-200 hover:border-gray-900 active:scale-[0.98]"
              >
                Read the constitution
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TICKER RIBBON (Together, We Build Hope...)             */}
      {/* ========================================================= */}
      <div className="w-full bg-[#FF8000] py-3.5 overflow-hidden select-none shadow-xs">
        <div className="flex whitespace-nowrap text-xs sm:text-sm font-extrabold tracking-widest text-[#0A2540] uppercase justify-around px-4">
          <span>TOGETHER, WE BUILD HOPE</span>
          <span className="mx-2">•</span>
          <span>EVERY DREAM COUNTS</span>
          <span className="mx-2">•</span>
          <span>TRANSFORMING LIVES</span>
          <span className="mx-2">•</span>
          <span className="hidden sm:inline">TOGETHER, WE BUILD HOPE</span>
          <span className="hidden sm:inline mx-2">•</span>
          <span className="hidden md:inline">EVERY DREAM COUNTS</span>
          <span className="hidden md:inline mx-2">•</span>
          <span className="hidden lg:inline">TRANSFORMING LIVES</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KEY STATS SECTION                                      */}
      {/* ========================================================= */}
      <section className="w-full bg-[#F8F9FA] border-y border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2540]">
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
      {/* 4. WHERE YOUR HELP GOES (Causes / Focus Areas)             */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
            Our Work
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-4xl">
            Where your help goes
          </h2>
          <p className="mt-2 text-base text-gray-600 max-w-2xl">
            We stand with vulnerable communities to provide dignity, opportunity, and hope.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((area) => (
            <div
              key={area.title}
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-200"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-gray-100 group-hover:bg-blue-50/70 transition-colors">
                  {area.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#0A2540]">
                  {area.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* See All Work CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/our-work"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-2.5 text-sm font-semibold text-gray-800 shadow-xs transition-all duration-200 hover:border-gray-900 active:scale-[0.98]"
          >
            See all our work
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. WHY WE STARTED (Story Banner with class.svg)            */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-sm">
          {/* Background Image Banner (class.svg) */}
          <div className="relative aspect-[1198/518] min-h-[460px] sm:min-h-[500px] w-full">
            <Image
              src="/class.svg"
              alt="UniHope village classroom story"
              fill
              className="object-cover"
            />
          </div>

          {/* Overlaid White Story Card */}
          <div className="relative lg:absolute lg:left-10 lg:top-1/2 lg:-translate-y-1/2 p-6 sm:p-8 lg:p-0">
            <div className="max-w-lg rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-gray-100">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
                Our Story
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2540]">
                Why we started
              </h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600">
                Our journey started from a simple conviction: no one in our
                community should be left behind without access to basic dignity,
                education, and health. A small group of committed individuals came
                together to create systematic change.
              </p>

              {/* Callout Quote */}
              <div className="mt-6 border-l-2 border-[#2E7D32] pl-4 italic text-sm text-gray-600">
                “The measure of a society is how it treats its most vulnerable members.”
              </div>

              <div className="mt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2 text-xs font-semibold text-gray-800 shadow-xs transition-all duration-200 hover:border-gray-900"
                >
                  Read our story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PRE-FOOTER CTA ("There is a place for you here")       */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-[#0A2540] px-8 py-12 sm:px-14 sm:py-16 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              There is a place for you here
            </h2>
            <p className="mt-3 text-base sm:text-lg text-blue-100/80">
              You do not have to do everything. You only have to do something.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0A2540] shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md active:scale-[0.98]"
            >
              Donate now
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
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

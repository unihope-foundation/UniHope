import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowUpRight,
  User,
  ShieldCheck,
  Heart,
  Users,
  GraduationCap,
  Activity,
  Briefcase,
  Leaf,
  Smile,
  Home as HomeIcon,
  HandHeart,
  Target,
  Sparkles,
} from "lucide-react";
import { TickerRibbon } from "@/components/TickerRibbon";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { delay } from "@/lib/motion";

export interface TeamMember {
  name: string;
  role: string;
  designation?: string;
}

export interface AboutUsProps {
  className?: string;
}

const DEFAULT_OBJECTIVES = [
  {
    icon: <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Direct education aid for children",
  },
  {
    icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Comprehensive healthcare & camps",
  },
  {
    icon: <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Vocational skill training for youth",
  },
  {
    icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Sustainable women empowerment",
  },
  {
    icon: <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Nutritional relief for the vulnerable",
  },
  {
    icon: <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Mental health & wellness support",
  },
  {
    icon: <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Community welfare & sanitation",
  },
  {
    icon: <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />,
    title: "Environmental conservation drives",
  },
];

const DEFAULT_VALUES = [
  {
    title: "Compassion",
    description: "Putting human dignity and empathy at the center of every community decision.",
    icon: <Heart className="h-5 w-5 text-[#2E7D32]" />,
  },
  {
    title: "Transparency",
    description: "Unwavering commitment to open accounts, public reporting, and audited funds.",
    icon: <ShieldCheck className="h-5 w-5 text-[#2E7D32]" />,
  },
  {
    title: "Integrity",
    description: "Doing what is right, honest, and ethical, even when no one is watching.",
    icon: <Target className="h-5 w-5 text-[#2E7D32]" />,
  },
  {
    title: "Community",
    description: "Working alongside grassroots families and leaders as true equal partners.",
    icon: <Users className="h-5 w-5 text-[#2E7D32]" />,
  },
  {
    title: "Impact",
    description: "Creating measurable, long-term self-sufficiency rather than temporary relief.",
    icon: <Sparkles className="h-5 w-5 text-[#2E7D32]" />,
  },
];

const DEFAULT_TEAM: TeamMember[] = [
  { name: "Abubacker Siddique", role: "Founder & Managing Trustee", designation: "Trustee" },
  { name: "Trustee Member", role: "Treasurer & Finance", designation: "Trustee" },
  { name: "Trustee Member", role: "Healthcare Operations", designation: "Trustee" },
  { name: "Trustee Member", role: "Education Initiatives", designation: "Trustee" },
  { name: "Trustee Member", role: "Community Outreach", designation: "Trustee" },
  { name: "Trustee Member", role: "Youth & Skill Development", designation: "Trustee" },
  { name: "Trustee Member", role: "Legal & Compliance", designation: "Trustee" },
  { name: "Trustee Member", role: "Volunteer Coordination", designation: "Trustee" },
];

export function AboutUs({ className = "" }: AboutUsProps) {
  return (
    <div className={`flex flex-col min-h-screen bg-white ${className}`}>
      {/* ========================================================= */}
      {/* 1. HERO HEADER                                            */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:pt-10 sm:pb-8 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-[#F4F5F7] py-8 px-5 sm:py-12 sm:px-12 shadow-xs">
          <span
            className="anim-fade-up text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]"
            style={delay(0)}
          >
            About
          </span>
          <h1
            className="anim-fade-up mt-2.5 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A2540] leading-tight"
            style={delay(60)}
          >
            About UNIHOPE Foundation
          </h1>
          <p
            className="anim-fade-up mt-2.5 text-xs sm:text-base text-gray-600"
            style={delay(120)}
          >
            A registered charitable trust in Chennai, Tamil Nadu.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TICKER RIBBON                                          */}
      {/* ========================================================= */}
      <TickerRibbon />

      {/* ========================================================= */}
      {/* 3. ORIGIN STORY SECTION (with community-gathering.svg)    */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
              Origin
            </span>
            <h2 className="mt-2.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A2540] leading-tight">
              Why UNIHOPE Foundation was started
            </h2>
            <div className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4 text-sm sm:text-lg leading-relaxed text-gray-600">
              <p>
                UniHope Foundation was established in Chennai with a singular, clear
                conviction: that basic human dignity, education, and healthcare
                should not be a privilege determined by accident of birth.
              </p>
              <p>
                Witnessing the stark challenges faced by low-income families and
                first-generation school-goers across marginalized neighborhoods, a
                group of committed professionals and community leaders came together
                to build a transparent, action-oriented institution dedicated to
                sustainable grassroots empowerment.
              </p>
            </div>

            {/* Charitable Trust Badge */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3.5 rounded-2xl bg-slate-50 border border-gray-100 p-4 max-w-md shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2540]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-xs text-gray-600 leading-snug">
                <span className="font-semibold text-gray-900 block">Registered Charitable Trust</span>
                Chennai North Joint I/Book-4/228/2026
              </div>
            </div>
          </div>

          {/* Right Image Column (community-gathering.svg) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative overflow-hidden rounded-[2rem] shadow-sm aspect-[454/568] w-full max-w-md mx-auto">
              <Image
                src="/assets/community-gathering.svg"
                alt="Community gathering in Chennai"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. VISION & OBJECTIVES (Deep Navy Box)                     */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <Reveal className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#0A2540] p-6 sm:p-14 lg:p-16 text-white shadow-xl">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#4ADE80]">
            Vision
          </span>
          <h2 className="mt-2.5 text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight max-w-3xl leading-snug">
            Creating hope. Empowering lives. Building a better society.
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-blue-200/80">
            Objectives of the trust:
          </p>

          {/* 8 Objectives Grid (Single column on mobile, 2 columns on sm+) */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6">
            {DEFAULT_OBJECTIVES.map((obj, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-5 transition hover:bg-white/10"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/10">
                  {obj.icon}
                </div>
                <span className="text-xs sm:text-base font-semibold text-white/95">
                  {obj.title}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ========================================================= */}
      {/* 5. GOVERNANCE & TRANSPARENCY                              */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
              Governance
            </span>
            <h2 className="mt-2.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A2540] leading-tight">
              Trust us. Transparent. For a lasting impact.
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
            <p className="text-sm sm:text-lg text-gray-600 leading-relaxed">
              We operate under rigorous governance standards ensuring every rupee
              contributed directly supports our target beneficiaries without
              unnecessary operational waste.
            </p>

            {/* Checkmark List */}
            <div className="space-y-3 sm:space-y-3.5">
              <div className="flex items-start gap-3 text-xs sm:text-base text-gray-700">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span>100% of public donations directly fund field programs</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-base text-gray-700">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span>Complete audited annual accounts and reports open to public</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-base text-gray-700">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span>Community-first decision making with ground-verified needs</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/governance"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3 sm:py-2.5 text-sm font-semibold text-gray-800 shadow-xs transition hover:border-gray-900 active:scale-[0.98]"
              >
                Read our charter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. WHAT GUIDES US (Values)                                */}
      {/* ========================================================= */}
      <section className="w-full bg-[#F8F9FA] border-y border-gray-100 py-12 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-5">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
                Our Values
              </span>
              <h2 className="mt-2.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A2540]">
                What guides us
              </h2>
              <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-gray-600 leading-relaxed max-w-md">
                Our values define how we work, how we treat the people we serve,
                and how we steward the resources entrusted to us.
              </p>
            </Reveal>

            {/* Values Items List */}
            <RevealGroup className="lg:col-span-7 space-y-4 sm:space-y-6" itemAs="div">
              {DEFAULT_VALUES.map((val) => (
                <div
                  key={val.title}
                  className="flex items-start gap-4 rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-gray-100 transition hover:shadow-md"
                >
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    {val.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-[#0A2540]">
                      {val.title}
                    </h3>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FROM THE FOUNDER (Quote Card)                          */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-6 sm:p-14 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <Reveal delay={100} className="max-w-2xl w-full">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
              From the Founder
            </span>
            <div className="mt-3 sm:mt-4 border-l-3 sm:border-l-4 border-[#FF8000] pl-4 sm:pl-6 py-1">
              <p className="text-base sm:text-2xl font-bold leading-relaxed text-[#0A2540] italic">
                “UNIHOPE was founded on the belief that no person should be denied
                basic human dignity and the opportunity for a better future.”
              </p>
            </div>
            <div className="mt-4 sm:mt-6 pl-4 sm:pl-6">
              <h4 className="font-extrabold text-[#0A2540] text-sm sm:text-base">
                Abubacker Siddique
              </h4>
              <p className="text-xs text-gray-500">
                Founder & Managing Trustee, UniHope Foundation
              </p>
            </div>
          </Reveal>

          {/* Profile Photo Placeholder */}
          <Reveal variant="fade" className="flex h-44 w-full sm:w-48 sm:h-48 md:w-48 md:h-48 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-slate-100 border border-gray-200 text-gray-400 shadow-inner">
            <User className="h-14 w-14 sm:h-16 sm:w-16" />
          </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. THE PEOPLE BEHIND UNIHOPE (Team Grid)                  */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2E7D32]">
            Leadership
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A2540]">
            The people behind UNIHOPE
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-gray-600 max-w-2xl">
            A dedicated team of professionals, social workers, and community leaders.
          </p>
        </div>

        {/* 8 Cards Grid (2 columns on mobile!) */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {DEFAULT_TEAM.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs transition hover:shadow-md"
            >
              {/* Photo Placeholder */}
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl bg-slate-100 text-gray-400 mb-3 sm:mb-4 shadow-inner">
                <User className="h-8 w-8 sm:h-12 sm:w-12" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-[#0A2540] truncate">
                {member.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-[#2E7D32] font-semibold mt-0.5 leading-tight">
                {member.role}
              </p>
              {member.designation && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                  {member.designation}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. EVERYONE CAN CONTRIBUTE (Pre-Footer CTA)               */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
        <Reveal className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F5F7] p-6 sm:p-14 text-center max-w-4xl mx-auto shadow-xs border border-gray-200">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#0A2540]">
            Everyone can contribute
          </h2>
          <p className="mt-2.5 text-xs sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Whether through volunteering your skills or donating to our causes, your help transforms lives.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-[#071D33] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
            >
              Donate
            </Link>
            <Link
              href="/volunteer"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-800 shadow-xs transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-gray-900 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
            >
              Become a volunteer
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export default AboutUs;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ContactHeroProps {
  className?: string;
  contactSectionId?: string;
}

export function ContactHero({
  className = "",
  contactSectionId = "contact-section",
}: ContactHeroProps) {
  const scrollToContactForm = () => {
    const el = document.getElementById(contactSectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Contact UNIHOPE Foundation"
      className={`relative w-full min-h-[540px] sm:min-h-[600px] lg:min-h-[660px] overflow-hidden bg-[#0A2540] flex flex-col justify-between ${className}`}
    >
      {/* Full-Bleed Background Photo */}
      <Image
        src="/Heros/contact-hero.jpg"
        alt="Smiling children supported by UNIHOPE Foundation community outreach"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Edge-Focused Brand Scrims: keep center faces bright while ensuring crisp text contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0A2540]/85 via-[#0A2540]/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-[#0A2540]/90 via-[#0A2540]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[#0A2540]/15" />

      {/* Inner Editorial Grid matching Reference Wireframe (Top-Left Title + Bottom-Right Copy & CTAs) */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        {/* TOP-LEFT: Subtitle + Display Headline */}
        <div className="max-w-xl">
          <span className="inline-block font-plusJakartaSans text-xs sm:text-[13px] font-bold tracking-[0.18em] uppercase text-[#EAA945]">
            CONTACT UNIHOPE
          </span>

          <h1 className="mt-2.5 font-outfit text-3xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.1] tracking-[-0.025em] text-white drop-shadow-sm">
            Connect with us to
            <br />
            transform lives together
          </h1>
        </div>

        {/* BOTTOM-RIGHT: Description + Side-by-Side CTAs */}
        <div className="mt-16 sm:mt-24 self-end max-w-[440px]">
          <p className="font-plusJakartaSans text-sm sm:text-base leading-relaxed text-white/95 drop-shadow-xs">
            Have a question, volunteer idea, or CSR partnership inquiry? Reach
            out to our Vadapalani, Chennai team—every conversation helps bring
            education, healthcare, and hope to more families.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToContactForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EAA945] px-5 py-3 font-plusJakartaSans text-sm font-semibold text-[#0A2540] shadow-md transition hover:bg-[#dc9b36] active:scale-[0.98] cursor-pointer"
            >
              <span>Get in touch</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>

            <Link
              href="/our-work"
              className="inline-flex items-center justify-center rounded-lg border border-white/80 bg-[#0A2540]/45 backdrop-blur-sm px-5 py-3 font-plusJakartaSans text-sm font-semibold text-white transition hover:bg-white hover:text-[#0A2540] active:scale-[0.98]"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactHero;

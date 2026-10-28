"use client";


const COLORS = {
  light: {
    primaryBtnBg: "#2B711B",
    primaryBtnText: "#FFFFFF",
    primaryBtnHoverBg: "#529D26",
    primaryBtnActiveBg: "#02285C",
    secondaryBtnBg: "rgba(247, 247, 247, 0.05)",
    secondaryBtnHoverBg: "rgba(247, 247, 247, 0.15)",
    secondaryBtnActiveBg: "rgba(247, 247, 247, 0.25)",
  },
} as const;

const VIDEO = {
  src: "/3.mp4",
  poster: "/registry/runwayml-com-hero-0/video-poster.png",
} as const;

/**
 * 네비게이션 링크
 */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Impact", href: "#impact" },
  { label: "Programs", href: "#programs" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * 리서치 영역 링크
 */
const RESEARCH_AREAS = [
  { label: "Healthcare & Humanitarian Support", href: "#healthcare" },
  { label: "Education & Knowledge", href: "#education" },
  { label: "Women & Child Welfare", href: "#welfare" },
  { label: "Community Development", href: "#community" },
] as const;

// ============================================================================
// END CUSTOMIZATION
// ============================================================================

import { motion } from "motion/react";
import { ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  mode?: "light" | "dark";
  logoText?: string;
  navLinks?: readonly { label: string; href: string }[];
  title?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  researchAreas?: readonly { label: string; href: string }[];
  loginText?: string;
  loginHref?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
  videoSrc?: string;
  videoPoster?: string;
}

export default function Hero({
  mode = "light",
  logoText = "UNIHOPE",
  navLinks = NAV_LINKS,
  title = "Creating Hope.\nEmpowering Lives.",
  primaryButtonText = "Donate Now",
  primaryButtonHref = "#contact",
  secondaryButtonText = "Join Us",
  secondaryButtonHref = "#about",
  researchAreas = RESEARCH_AREAS,
  ctaButtonText = "Contact Us",
  ctaButtonHref = "#contact",
  videoSrc = VIDEO.src,
  videoPoster = VIDEO.poster,
}: HeroProps) {
  void mode;
  const colors = COLORS.light;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative bg-[#FBF8F3] pb-6 pt-0 transition-all duration-200">
     
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <motion.a
              href="#"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d2a1d] sm:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/UNIHOPE_LOGO.svg"
                alt="UNIHOPE logo"
                className="h-8 w-auto object-contain sm:h-10"
              />
              <span className="text-[#1d2a1d]">{logoText}</span>
            </motion.a>

            {/* Center Navigation */}
            <div className="hidden items-center gap-4 md:flex lg:gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#1d2a1d]/80 transition-colors hover:text-[#1d2a1d] sm:text-xs lg:text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.a
                href={ctaButtonHref}
                className="hidden items-center justify-center rounded-lg bg-[#2B711B] px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-[#529D26] sm:px-4 sm:text-xs md:inline-flex lg:px-5 lg:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {ctaButtonText}
              </motion.a>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--unihope-border)] text-[var(--unihope-navy)] transition-colors hover:bg-[var(--unihope-background)] md:hidden"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {menuOpen && (
            <motion.div
              id="mobile-navigation"
              className="border-t border-[#1d2a1d]/10 pb-4 pt-2 md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="border-b border-[#1d2a1d]/10 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#1d2a1d]/80 transition-colors hover:text-[#1d2a1d]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={ctaButtonHref}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#2B711B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#529D26]"
                  onClick={() => setMenuOpen(false)}
                >
                  {ctaButtonText}
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto flex h-[78vh] min-h-[500px] max-h-[760px] w-full flex-col items-center justify-center overflow-hidden text-white lg:max-h-[900px] lg:min-h-[620px] xl:h-[90vh]">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 mt-16 transition-all duration-200 lg:mt-16">
          <div className="mx-auto h-full w-full max-w-[1600px] lg:px-4">
            <div className="relative h-full w-full overflow-hidden rounded-none lg:rounded-xl">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                loop
                muted
                autoPlay
                poster={videoPoster}
                preload="auto"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[#012A5F]/45" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-end px-4 pb-8 pt-24 sm:px-5 md:px-6 lg:px-8 lg:pb-12 xl:pb-16">
          <div className="mx-auto flex w-full flex-col gap-7 md:gap-8 lg:w-[87.5%] lg:flex-row lg:items-end lg:justify-between">
            {/* Left Content */}
            <div className="max-w-xl md:max-w-2xl">
              <motion.h1
                className="mb-5 text-4xl !leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {title.split("\n").map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </motion.h1>

              <motion.div
                className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <a
                  href={primaryButtonHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold leading-6 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#529D26] sm:w-auto sm:text-base"
                  style={{
                    backgroundColor: colors.primaryBtnBg,
                    color: colors.primaryBtnText,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.primaryBtnHoverBg)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.primaryBtnBg)
                  }
                >
                  {primaryButtonText}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={secondaryButtonHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold leading-6 text-white outline outline-1 outline-white/75 backdrop-blur transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#529D26] sm:w-auto sm:text-base"
                  style={{
                    backgroundColor: colors.secondaryBtnBg,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.secondaryBtnHoverBg)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.secondaryBtnBg)
                  }
                >
                  {secondaryButtonText}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </motion.div>
            </div>

            {/* Right Content - Research Areas */}
            <motion.div
              className="mt-2 w-full max-w-sm md:max-w-md lg:mt-0 lg:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <div
                className="flex flex-col gap-2.5 sm:gap-3.5"
                role="tablist"
                aria-label="Research areas"
              >
                {researchAreas.map((area, index) => (
                  <a
                    key={area.label}
                    href={area.href}
                    className="group flex w-full items-center justify-start"
                  >
                    <h3
                      className="flex items-center text-[11px] font-medium uppercase tracking-[0.12em] text-white/75 opacity-80 transition-all duration-200 group-hover:opacity-100 sm:text-xs lg:text-sm"
                      role="tab"
                      aria-selected={index === 0}
                      tabIndex={index === 0 ? 0 : -1}
                    >
                      {area.label}
                      <span className="ml-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                        ↗
                      </span>
                    </h3>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
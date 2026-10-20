"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  FileText,
  Heart,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Info,
  CheckCircle2,
} from "lucide-react";

interface SectionItem {
  id: string;
  num: string;
  title: string;
}

const SECTIONS: SectionItem[] = [
  { id: "about-these-terms", num: "01", title: "About these terms" },
  { id: "using-the-website", num: "02", title: "Using the website" },
  { id: "donations", num: "03", title: "Donations" },
  { id: "volunteering", num: "04", title: "Volunteering" },
  { id: "our-content", num: "05", title: "Our content" },
  { id: "links-to-other-sites", num: "06", title: "Links to other sites" },
  { id: "what-we-cannot-promise", num: "07", title: "What we cannot promise" },
  { id: "changes-to-these-terms", num: "08", title: "Changes to these terms" },
  { id: "governing-law", num: "09", title: "Governing law" },
  { id: "contact", num: "10", title: "Contact" },
];

export function TermsOfService() {
  const [activeSection, setActiveSection] = useState("about-these-terms");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-w-full min-h-screen bg-[#F7F6F4] text-[#171717] selection:bg-[#012A5F] selection:text-white">
      <div className="w-full pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-10 lg:gap-14">
          {/* ========================================================= */}
          {/* 1. HEADER BANNER CARD                                     */}
          {/* ========================================================= */}
          <div className="rounded-[20px] border border-[#D6D6D6] bg-[#EEEDEC] p-8 sm:p-12 lg:p-14 shadow-xs">
            <div className="flex flex-col items-start max-w-3xl">
              <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-2">
                LEGAL
              </span>

              <h1 className="text-[#012A5F] font-outfit text-3xl sm:text-5xl lg:text-[56px] font-semibold leading-tight sm:leading-[1.1] tracking-[-0.025em] pb-4">
                Terms of Service
              </h1>

              <p className="text-[#5A5A5A] font-plusJakartaSans text-base sm:text-lg leading-relaxed pb-6">
                The rules for using this website, donating and volunteering with
                UNIHOPE Foundation.
              </p>

              {/* Last Updated Pill */}
              <div className="inline-flex py-1.5 px-3.5 items-center gap-2 rounded-full border border-[#D6D6D6] bg-white shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-[#5A5A5A]" />
                <span className="text-[#5A5A5A] font-plusJakartaSans text-xs sm:text-[13px] font-medium leading-none">
                  Last updated: March 15, 2026
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. MOBILE TABLE OF CONTENTS                               */}
          {/* ========================================================= */}
          <div className="lg:hidden w-full">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[#D6D6D6] bg-white text-[#012A5F] font-plusJakartaSans text-sm font-semibold shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#2B711B] text-xs uppercase tracking-wider font-bold">
                  ON THIS PAGE:
                </span>
                <span className="truncate">
                  {SECTIONS.find((s) => s.id === activeSection)?.title ||
                    "Table of Contents"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileMenuOpen && (
              <div className="mt-2 p-3 rounded-xl border border-[#D6D6D6] bg-white shadow-lg space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left text-sm transition-colors ${
                      activeSection === sec.id
                        ? "bg-[#EEEDEC] text-[#012A5F] font-bold"
                        : "text-[#5A5A5A] hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-mono text-xs text-[#2B711B]">
                      {sec.num}
                    </span>
                    <span>{sec.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. MAIN CONTENT WITH DESKTOP STICKY SIDEBAR               */}
          {/* ========================================================= */}
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-14 w-full">
            {/* Desktop Sticky Left Sidebar (ON THIS PAGE) */}
            <aside className="hidden lg:flex flex-col w-80 shrink-0 sticky top-28 z-20">
              <div className="flex flex-col rounded-[20px] border border-[#D6D6D6] bg-white p-6 shadow-[0_8px_24px_rgba(1,42,95,0.06)]">
                <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-4">
                  ON THIS PAGE
                </span>

                <nav className="flex flex-col gap-1 pb-4">
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollTo(sec.id)}
                        className={`flex py-2 px-3 items-center gap-2.5 rounded-[10px] text-left transition-all cursor-pointer ${
                          isActive
                            ? "border-l-2 border-l-[#012A5F] bg-[#EEEDEC] text-[#012A5F] font-semibold shadow-xs"
                            : "text-[#5A5A5A] hover:bg-gray-50 hover:text-gray-900 font-normal"
                        }`}
                      >
                        <span
                          className={`font-mono text-[13px] ${
                            isActive
                              ? "text-[#2B711B] font-bold"
                              : "text-[rgba(90,90,90,0.70)]"
                          }`}
                        >
                          {sec.num}
                        </span>
                        <span
                          className={`font-plusJakartaSans text-sm leading-snug truncate ${
                            isActive
                              ? "text-[#012A5F] font-semibold"
                              : "text-[#5A5A5A]"
                          }`}
                        >
                          {sec.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="bg-[#E3E1DD] w-full h-px my-2" />

                <div className="pt-2">
                  <p className="text-[#5A5A5A] font-plusJakartaSans text-xs leading-relaxed">
                    Registered Charitable Trust · Reg. No. R/Chennai North Joint
                    I/Book-4/228/2026
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content Articles */}
            <main className="flex flex-col gap-12 max-w-3xl flex-1 w-full">
              {/* 01 About these terms */}
              <section id="about-these-terms" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    01
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    About these terms
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  UNIHOPE Foundation is a registered charitable trust in Chennai,
                  Tamil Nadu, India. By browsing our website, making a donation or
                  applying to volunteer, you agree to these terms. If you do not
                  accept these terms, please do not use this website.
                </p>
              </section>

              {/* 02 Using the website */}
              <section id="using-the-website" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    02
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Using the website
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We provide this website to share our charitable work, invite
                  voluntary participation and receive contributions. You agree to
                  use this website lawfully and respectfully. You must not
                  attempt to disrupt the website, access unauthorized servers or
                  data, or submit false or harmful information.
                </p>
              </section>

              {/* 03 Donations */}
              <section id="donations" className="flex flex-col gap-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    03
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Donations
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  All voluntary contributions made to UNIHOPE Foundation are
                  processed through verified, secure banking and payment channels.
                  Donations are accounted for in the trust&apos;s statutory records in
                  compliance with Indian law.
                </p>

                {/* Callout box */}
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-xs">
                  <div className="flex justify-center items-center shrink-0 rounded-full bg-white w-9 h-9 text-[#012A5F] shadow-xs mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-[#43474F] font-plusJakartaSans text-sm sm:text-[15px] font-semibold leading-relaxed">
                    Every donation is voluntary. If you choose a specific
                    purpose, we use the money for that purpose.
                  </p>
                </div>

                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Upon receipt of a contribution, an official digital receipt is
                  sent to the email address provided. Donors are responsible for
                  providing accurate contact and personal identification details.
                </p>
              </section>

              {/* 04 Volunteering */}
              <section id="volunteering" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    04
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Volunteering
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Volunteering with UNIHOPE Foundation is voluntary and
                  coordinated through our official registration channels.
                  Participation does not create an employment relationship.
                  Volunteers agree to uphold community dignity, mutual respect and
                  safe practices during all field initiatives.
                </p>
              </section>

              {/* 05 Our content */}
              <section id="our-content" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    05
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Our content
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  All text, photographs, logos and materials published on this
                  website are the property of UNIHOPE Foundation or used with
                  permission. You may share materials for non-commercial
                  educational or civic awareness purposes provided clear credit is
                  given to the trust.
                </p>
              </section>

              {/* 06 Links to other sites */}
              <section id="links-to-other-sites" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    06
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Links to other sites
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Our website may link to third-party services—including payment
                  gateways, Google Forms for volunteer coordination, and Google
                  Maps for office directions. The trust is not responsible for the
                  privacy practices or content of external sites.
                </p>
              </section>

              {/* 07 What we cannot promise */}
              <section
                id="what-we-cannot-promise"
                className="flex flex-col gap-3 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    07
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    What we cannot promise
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We work hard to keep website information accurate and current.
                  However, this platform is provided on an &apos;as is&apos; basis.
                  We cannot promise uninterrupted availability or that
                  transmission will be completely free of technical errors beyond
                  our reasonable control.
                </p>
              </section>

              {/* 08 Changes to these terms */}
              <section
                id="changes-to-these-terms"
                className="flex flex-col gap-3 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    08
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Changes to these terms
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  The trust may periodically update these terms to align with
                  legal standards and operational needs. Revisions will be
                  published on this page with an updated effective date.
                  Continued use confirms your agreement.
                </p>
              </section>

              {/* 09 Governing law */}
              <section id="governing-law" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    09
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Governing law
                  </h2>
                </div>
                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  These terms follow the laws of India. Any dispute will be
                  handled by the competent civil courts located in Chennai, Tamil
                  Nadu, India.
                </p>
              </section>

              {/* 10 Contact */}
              <section id="contact" className="flex flex-col gap-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-xl sm:text-[28px] font-semibold leading-none">
                    10
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Contact
                  </h2>
                </div>

                <p className="text-[#43474F] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  If you have questions about these terms or wish to discuss
                  trust matters, please contact us.
                </p>

                <div className="flex flex-col items-start gap-4 rounded-[20px] border border-[#D6D6D6] bg-white p-6 sm:p-8 shadow-[0_8px_24px_rgba(1,42,95,0.06)] w-full">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[#012A5F] font-outfit text-xl font-semibold">
                      Questions about our terms?
                    </h3>
                    <p className="text-[#5A5A5A] font-plusJakartaSans text-sm">
                      Reach out to the registered trust office directly.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 py-3 w-full border-y border-gray-100 my-1">
                    {/* Office */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F] mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <p className="text-[#43474F] font-plusJakartaSans text-sm leading-relaxed">
                        2nd Floor, No. 73, S Sivan Kovil Street, opp. Ambiga
                        Driving School, Ottagapalayam, Sector 15, Vadapalani,
                        Chennai, Tamil Nadu 600026
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <a
                        href="tel:+919150149339"
                        className="text-[#43474F] font-plusJakartaSans text-sm hover:underline hover:text-[#012A5F]"
                      >
                        +91 91501 49339
                      </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <a
                        href="mailto:unihopefoundation.official@gmail.com"
                        className="text-[#43474F] font-plusJakartaSans text-sm hover:underline hover:text-[#012A5F] break-all"
                      >
                        unihopefoundation.official@gmail.com
                      </a>
                    </div>
                  </div>

                  <a
                    href="mailto:unihopefoundation.official@gmail.com?subject=Terms%20of%20Service%20Inquiry"
                    className="inline-flex py-2.5 px-6 items-center gap-2 rounded-full border border-[#43474F] text-[#43474F] hover:bg-[#012A5F] hover:text-white hover:border-[#012A5F] transition-all font-plusJakartaSans text-sm font-semibold mt-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email us</span>
                  </a>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;

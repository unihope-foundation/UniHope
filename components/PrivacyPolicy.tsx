"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Lock,
  ShieldCheck,
  Camera,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
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
  { id: "who-we-are", num: "01", title: "Who we are" },
  { id: "what-we-collect", num: "02", title: "What we collect" },
  { id: "how-we-use-it", num: "03", title: "How we use it" },
  { id: "payments", num: "04", title: "Payments" },
  { id: "who-we-share-it-with", num: "05", title: "Who we share it with" },
  { id: "cookies", num: "06", title: "Cookies" },
  { id: "photographs-and-videos", num: "07", title: "Photographs and videos" },
  { id: "how-we-protect-data", num: "08", title: "How we protect data" },
  { id: "how-long-we-keep-it", num: "09", title: "How long we keep it" },
  { id: "your-rights", num: "10", title: "Your rights" },
  { id: "children", num: "11", title: "Children" },
  { id: "changes-to-this-policy", num: "12", title: "Changes to this policy" },
  { id: "contact", num: "13", title: "Contact" },
];

export function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("who-we-are");
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
                Privacy Policy
              </h1>

              <p className="text-[#3D3D3D] font-plusJakartaSans text-base sm:text-lg leading-relaxed pb-6">
                How UNIHOPE Foundation collects, uses and protects your personal
                information.
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
          {/* 2. MOBILE TABLE OF CONTENTS (COLLAPSIBLE)                 */}
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
            <main className="flex flex-col gap-14 max-w-3xl flex-1 w-full">
              {/* 01 Who we are */}
              <section id="who-we-are" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    01
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Who we are
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  UNIHOPE Foundation is a registered charitable trust based in
                  Chennai, Tamil Nadu, India. Official registration number:
                  R/Chennai North Joint I/Book-4/228/2026. Registered office: 2nd
                  Floor, No. 73, S Sivan Kovil Street, opp. Ambiga Driving School,
                  Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026.
                </p>
              </section>

              {/* 02 What we collect */}
              <section id="what-we-collect" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    02
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    What we collect
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We collect only the information reasonably required to process
                  financial contributions, administer volunteer enrollments, and
                  coordinate ongoing civic programs. Depending on your voluntary
                  interaction with our trust, we may record:
                </p>

                <ul className="flex flex-col gap-2.5 pt-1 pl-4 sm:pl-6 text-[#3D3D3D] font-plusJakartaSans text-[15px] sm:text-[16px] leading-[26px]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Full name and verified contact details (email address and
                      phone number).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Postal address (when provided for mandatory statutory tax
                      documentation).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Donation transaction details (settlement identifiers,
                      contribution sum, and date).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Volunteer application responses and personal skills
                      disclosures.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Communication queries and formal correspondence submitted
                      through our web portal.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Basic technical log data (standard access logs collected
                      solely for operational server integrity).
                    </span>
                  </li>
                </ul>
              </section>

              {/* 03 How we use it */}
              <section id="how-we-use-it" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    03
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    How we use it
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  The data gathered by UNIHOPE Foundation is strictly restricted
                  to non-profit administrative and charitable operational
                  workflows:
                </p>

                <ul className="flex flex-col gap-2.5 pt-1 pl-4 sm:pl-6 text-[#3D3D3D] font-plusJakartaSans text-[15px] sm:text-[16px] leading-[26px]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Process financial contributions and issue formal
                      regulatory donation receipts.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Coordinate community outreach, field schedules, and
                      localized volunteer activities.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Respond promptly and accurately to direct public inquiries
                      and correspondence.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#2B711B] font-bold">•</span>
                    <span>
                      Maintain statutory, tax, and legal compliance required for
                      a registered charitable trust in India.
                    </span>
                  </li>
                </ul>
              </section>

              {/* 04 Payments */}
              <section id="payments" className="flex flex-col gap-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    04
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Payments
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  All electronic contributions are handled exclusively via
                  verified and certified banking settlement mechanisms. The
                  trust does not operate an independent payment gateway or retain
                  sensitive transaction credentials.
                </p>

                {/* Zero Credential Box */}
                <div className="flex items-start gap-4 p-5 sm:p-6 rounded-xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-xs">
                  <div className="flex justify-center items-center shrink-0 rounded-full border border-[#D6D6D6] bg-white w-10 h-10 text-[#012A5F]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[#012A5F] font-outfit text-base font-semibold">
                      Zero Financial Credential Storage
                    </h3>
                    <p className="text-[#3D3D3D] font-plusJakartaSans text-sm leading-relaxed">
                      Your banking credentials, debit or credit card security
                      numbers, CVVs, and UPI PINs are processed directly by
                      authorized payment aggregators and regulated banking
                      networks. The trust never accesses, collects, or retains
                      your financial passwords or secret authentication data on
                      any local server.
                    </p>
                  </div>
                </div>
              </section>

              {/* 05 Who we share it with */}
              <section
                id="who-we-share-it-with"
                className="flex flex-col gap-4 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    05
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Who we share it with
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We never sell, lease, rent, or trade your personal details to
                  commercial third parties. Data is shared strictly on a
                  confidential need-to-know basis with authorized trustees and
                  core staff, banking and settlement partners, and statutory
                  auditing authorities as mandated by government regulation.
                </p>

                {/* Short note on information */}
                <div className="flex items-start gap-4 p-5 sm:p-6 rounded-xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-xs">
                  <div className="flex justify-center items-center shrink-0 rounded-full border border-[#D6D6D6] bg-white w-10 h-10 text-[#012A5F]">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[#012A5F] font-outfit text-base font-semibold">
                      A short note on your information
                    </h3>
                    <p className="text-[#3D3D3D] font-plusJakartaSans text-sm leading-relaxed">
                      UNIHOPE Foundation does not sell, rent, commercialize, or
                      trade personal donor or volunteer information to any
                      commercial advertising agency, marketing firm, or data
                      broker.
                    </p>
                  </div>
                </div>
              </section>

              {/* 06 Cookies */}
              <section id="cookies" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    06
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Cookies
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Our web platform uses strictly essential technical cookies
                  required for secure network navigation and valid form session
                  delivery. We do not implement third-party advertising cookies,
                  cross-site telemetry networks, or non-essential behavioural
                  surveillance scripts.
                </p>
              </section>

              {/* 07 Photographs and videos */}
              <section
                id="photographs-and-videos"
                className="flex flex-col gap-4 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    07
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Photographs and videos
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Community visual documentation is conducted under respectful,
                  transparent, and ethical oversight. All media collected during
                  grass-roots outreach, educational sessions, or distribution
                  drives adheres to strict protection standards.
                </p>

                <div className="flex items-center gap-4 p-5 sm:p-6 rounded-xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-xs">
                  <div className="flex justify-center items-center shrink-0 rounded-full border border-[#D6D6D6] bg-white w-10 h-10 text-[#012A5F]">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-[#3D3D3D] font-plusJakartaSans text-sm sm:text-[15px] leading-relaxed">
                    We ask permission before photographing anyone, and we take
                    extra care with children and people in vulnerable
                    situations.
                  </p>
                </div>
              </section>

              {/* 08 How we protect your information */}
              <section
                id="how-we-protect-data"
                className="flex flex-col gap-4 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    08
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    How we protect your information
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We apply rigorous administrative, technical, and
                  institutional measures to defend your records against
                  unapproved exposure, loss, alteration, or illegitimate
                  processing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Access Limitation */}
                  <div className="flex flex-col items-start p-5 sm:p-6 rounded-xl border border-[#D6D6D6] bg-white shadow-xs">
                    <div className="flex justify-center items-center rounded-full bg-[#EEEDEC] w-10 h-10 text-[#012A5F] mb-3">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-[#012A5F] font-outfit text-base font-semibold pb-1.5">
                      Access Limitation
                    </h3>
                    <p className="text-[#3D3D3D] font-plusJakartaSans text-sm leading-relaxed">
                      Physical and electronic records are restricted strictly to
                      authorized trustees requiring operational knowledge.
                    </p>
                  </div>

                  {/* Encrypted Channels */}
                  <div className="flex flex-col items-start p-5 sm:p-6 rounded-xl border border-[#D6D6D6] bg-white shadow-xs">
                    <div className="flex justify-center items-center rounded-full bg-[#EEEDEC] w-10 h-10 text-[#012A5F] mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-[#012A5F] font-outfit text-base font-semibold pb-1.5">
                      Encrypted Channels
                    </h3>
                    <p className="text-[#3D3D3D] font-plusJakartaSans text-sm leading-relaxed">
                      Data transmission across all web properties operates over
                      certified, secure Transport Layer Security (HTTPS).
                    </p>
                  </div>
                </div>
              </section>

              {/* 09 How long we keep it */}
              <section
                id="how-long-we-keep-it"
                className="flex flex-col gap-3 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    09
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    How long we keep it
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  Contribution records are retained in direct compliance with
                  Indian taxation laws and statutory book-keeping guidelines for
                  a registered charitable trust. General communication logs and
                  ad-hoc inquiries are deleted once your query has been resolved
                  and no administrative obligation remains.
                </p>
              </section>

              {/* 10 Your rights */}
              <section id="your-rights" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    10
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Your rights
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  You maintain complete autonomy over your personal records held
                  by UNIHOPE Foundation. You may at any point request
                  verification of the personal contact details retained by the
                  trust, request rectification of erroneous data, or request
                  permanent withdrawal and deletion from non-statutory volunteer
                  registries.
                </p>
              </section>

              {/* 11 Children */}
              <section id="children" className="flex flex-col gap-3 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    11
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Children
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  We do not knowingly solicit personal contact information from
                  children under 18 years of age without explicit guardian
                  verification and written consent. If you believe a minor has
                  submitted personal contact details without parental approval,
                  please notify our registered office promptly for immediate
                  removal.
                </p>
              </section>

              {/* 12 Changes to this policy */}
              <section
                id="changes-to-this-policy"
                className="flex flex-col gap-3 scroll-mt-28"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    12
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Changes to this policy
                  </h2>
                </div>
                <p className="text-[#3D3D3D] font-plusJakartaSans text-[16px] sm:text-[17px] leading-[28.9px]">
                  This statement undergoes periodic review to align with
                  evolving statutory frameworks in India and the growth of our
                  grassroots programs. Any modifications will be posted here
                  along with an updated effective date. Continued engagement with
                  our services confirms your acknowledgement of the revised terms.
                </p>
              </section>

              {/* 13 Contact */}
              <section id="contact" className="flex flex-col gap-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="text-[#2B711B] font-outfit text-lg font-semibold leading-none">
                    13
                  </span>
                  <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight">
                    Contact
                  </h2>
                </div>

                <div className="flex flex-col items-start gap-3 rounded-[20px] border border-[#D6D6D6] bg-white p-6 sm:p-8 shadow-[0_8px_24px_rgba(1,42,95,0.06)]">
                  <h3 className="text-[#012A5F] font-outfit text-xl sm:text-[22px] font-semibold leading-snug">
                    Questions about your information?
                  </h3>
                  <p className="text-[#5A5A5A] font-plusJakartaSans text-sm sm:text-base leading-relaxed">
                    Reach out to the trust directly for data inquiries or
                    privacy concerns.
                  </p>

                  <div className="flex flex-col gap-4 py-3 w-full border-y border-gray-100 my-2">
                    {/* Office */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F] mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#012A5F] font-plusJakartaSans text-sm font-semibold">
                          Office
                        </span>
                        <p className="text-[#3D3D3D] font-plusJakartaSans text-sm leading-relaxed">
                          2nd Floor, No. 73, S Sivan Kovil Street, opp. Ambiga
                          Driving School, Ottagapalayam, Sector 15, Vadapalani,
                          Chennai, Tamil Nadu 600026
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#012A5F] font-plusJakartaSans text-sm font-semibold">
                          Phone
                        </span>
                        <a
                          href="tel:+919150149339"
                          className="text-[#3D3D3D] font-plusJakartaSans text-sm hover:underline hover:text-[#012A5F]"
                        >
                          +91 91501 49339
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex justify-center items-center shrink-0 rounded-full bg-[#EEEDEC] w-9 h-9 text-[#012A5F]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#012A5F] font-plusJakartaSans text-sm font-semibold">
                          Email
                        </span>
                        <a
                          href="mailto:unihopefoundation.official@gmail.com"
                          className="text-[#3D3D3D] font-plusJakartaSans text-sm hover:underline hover:text-[#012A5F] break-all"
                        >
                          unihopefoundation.official@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <a
                    href="mailto:unihopefoundation.official@gmail.com?subject=Privacy%20Policy%20Inquiry"
                    className="inline-flex py-2.5 px-6 items-center gap-2 rounded-full border border-[#3D3D3D] text-[#3D3D3D] hover:bg-[#012A5F] hover:text-white hover:border-[#012A5F] transition-all font-plusJakartaSans text-sm font-semibold mt-1"
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

export default PrivacyPolicy;

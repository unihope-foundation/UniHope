"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Send,
  Check,
  ChevronDown,
  Building,
  Heart,
  ExternalLink,
} from "lucide-react";

export function Contact() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "General enquiry",
    message: "",
    agreedToPrivacy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToPrivacy) {
      alert("Please agree to the Privacy Policy to send your message.");
      return;
    }

    setFormStatus("submitting");
    setTimeout(() => {
      setFormStatus("success");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "General enquiry",
        message: "",
        agreedToPrivacy: false,
      });
    }, 1200);
  };

  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=73+S+Sivan+Kovil+Street+Vadapalani+Chennai+Tamil+Nadu+600026";

  return (
    <div className="flex flex-col min-w-full min-h-screen bg-[#F7F6F4] text-[#171717] selection:bg-[#012A5F] selection:text-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative w-full pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Subtle grid backdrop pattern */}
        <div className="absolute inset-0 opacity-[3%] pointer-events-none bg-[radial-gradient(#012A5F_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-start max-w-2xl">
            <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-2.5">
              CONTACT US
            </span>

            <h1 className="text-[#012A5F] font-outfit text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-tight sm:leading-[1.1] lg:leading-[64px] tracking-[-0.025em] pb-3.5">
              Let&apos;s connect
            </h1>

            <p className="text-[#5A5A5A] font-plusJakartaSans text-base sm:text-lg leading-relaxed">
              Have a question, an idea, or want to help? Write to us. We will reply as
              soon as we can.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. RIBBON MARQUEE (WARM ORANGE)                           */}
      {/* ========================================================= */}
      <div className="w-full bg-[#F88C29] py-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)] overflow-hidden select-none">
        <div className="animate-ticker flex items-center">
          {Array.from({ length: 4 }).map((_, repeatIdx) => (
            <div key={repeatIdx} className="flex items-center gap-6 shrink-0 px-3">
              <span className="text-[#171717] font-outfit text-base sm:text-xl font-bold tracking-[0.05em] uppercase">
                TOGETHER, WE BUILD HOPE
              </span>
              <span className="text-[#171717] font-outfit text-xs font-bold">•</span>
              <span className="text-[#171717] font-outfit text-base sm:text-xl font-bold tracking-[0.05em] uppercase">
                EVERY DREAM COUNTS
              </span>
              <span className="text-[#171717] font-outfit text-xs font-bold">•</span>
              <span className="text-[#171717] font-outfit text-base sm:text-xl font-bold tracking-[0.05em] uppercase">
                TRANSFORMING LIVES
              </span>
              <span className="text-[#171717] font-outfit text-xs font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN CONTACT GRID                                      */}
      {/* ========================================================= */}
      <section className="w-full py-12 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Phone, Email, Registered Office & Map */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              {/* Phone & Email Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Phone Card */}
                <div className="flex flex-col items-start rounded-[20px] border border-[#D6D6D6] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(1,42,95,0.06)] hover:border-[#012A5F]/40 transition-colors">
                  <div className="flex justify-center items-center rounded-full bg-[#EEEDEC] w-11 h-11 mb-4 text-[#012A5F]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-[#5A5A5A] font-plusJakartaSans text-xs font-semibold tracking-[0.05em] uppercase pb-1">
                    PHONE
                  </span>
                  <a
                    href="tel:+919150149339"
                    className="text-[#012A5F] font-outfit text-lg sm:text-xl font-semibold leading-tight tracking-[-0.025em] hover:underline"
                  >
                    +91 91501 49339
                  </a>
                </div>

                {/* Email Card */}
                <div className="flex flex-col items-start rounded-[20px] border border-[#D6D6D6] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(1,42,95,0.06)] hover:border-[#012A5F]/40 transition-colors">
                  <div className="flex justify-center items-center rounded-full bg-[#EEEDEC] w-11 h-11 mb-4 text-[#012A5F]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[#5A5A5A] font-plusJakartaSans text-xs font-semibold tracking-[0.05em] uppercase pb-1">
                    EMAIL
                  </span>
                  <a
                    href="mailto:unihopefoundation.official@gmail.com"
                    className="text-[#012A5F] font-outfit text-sm sm:text-base font-semibold leading-tight tracking-[-0.025em] break-all hover:underline"
                  >
                    unihopefoundation.official@gmail.com
                  </a>
                </div>
              </div>

              {/* Registered Office & Visual Map Card */}
              <div className="flex flex-col items-start rounded-[20px] border border-[#D6D6D6] bg-white p-6 sm:p-7 shadow-[0_8px_24px_rgba(1,42,95,0.06)] w-full">
                <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-1.5">
                  REGISTERED OFFICE
                </span>

                <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-snug pb-2">
                  Vadapalani, Chennai
                </h2>

                <p className="text-[#3D3D3D] font-plusJakartaSans text-sm sm:text-[15px] leading-relaxed pb-2.5">
                  2nd Floor, No. 73, S Sivan Kovil Street, opp. Ambiga Driving School,
                  Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026
                </p>

                <p className="text-[#5A5A5A] font-plusJakartaSans text-xs sm:text-[13px] pb-5">
                  Reg. No. R/Chennai North Joint I/Book-4/228/2026
                </p>

                {/* Google Maps Button */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex py-3 px-6 justify-center items-center gap-2 rounded-full border border-[#3D3D3D] text-[#012A5F] hover:bg-[#012A5F] hover:text-white hover:border-[#012A5F] transition-all font-plusJakartaSans text-sm font-semibold mb-6"
                >
                  <span>Open in Google Maps</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {/* Styled Vadapalani Vector Map View */}
                <div className="w-full h-[240px] sm:h-[260px] rounded-[20px] border border-[#D6D6D6] bg-[#ECE9E4] overflow-hidden relative shadow-inner">
                  {/* Schematic Background Roads & Blocks */}
                  <div className="absolute inset-0 bg-[#E8E5DF]">
                    {/* Green zone accents */}
                    <div className="absolute top-0 left-0 w-28 h-10 bg-[#DDE4DB] rounded-br-3xl" />
                    <div className="absolute bottom-0 right-0 w-24 h-12 bg-[#E1E6DD] rounded-tl-3xl" />

                    {/* Major Road 1: Inner Ring Road (Angled) */}
                    <div className="absolute -top-6 left-16 w-8 h-80 bg-white rotate-12 shadow-sm" />
                    <div className="absolute -top-6 left-[70px] w-5 h-80 bg-[#DDD7CC] rotate-12" />

                    {/* Major Road 2: Arcot Road (Horizontal) */}
                    <div className="absolute top-28 -left-6 w-full h-8 bg-white shadow-sm" />
                    <div className="absolute top-[118px] -left-6 w-full h-4 bg-[#DDD7CC]" />

                    {/* Secondary Cross Street */}
                    <div className="absolute top-10 left-28 w-44 h-4 bg-white rotate-[-3deg]" />
                    <div className="absolute top-[42px] left-28 w-44 h-2 bg-[#E5E0D8] rotate-[-3deg]" />

                    {/* Street Labels */}
                    <span className="absolute top-10 left-12 text-[9px] font-bold text-[#7A7873] uppercase tracking-wider rotate-12 select-none">
                      Inner Ring Road
                    </span>
                    <span className="absolute top-24 left-2 text-[9px] font-bold text-[#7A7873] uppercase tracking-wider select-none">
                      Arcot Road
                    </span>
                    <span className="absolute top-[78px] right-14 text-[9px] font-extrabold text-[#9C6B38] uppercase tracking-wider select-none">
                      S Sivan Kovil St
                    </span>

                    {/* Building Blocks */}
                    <div className="absolute top-14 right-16 w-16 h-10 bg-[#DCD6CA]/70 rounded-md" />
                    <div className="absolute top-12 right-36 w-14 h-11 bg-[#DCD6CA]/70 rounded-md" />
                    <div className="absolute bottom-10 right-20 w-20 h-8 bg-[#DCD6CA]/70 rounded-md" />
                  </div>

                  {/* Marker Pin: UNIHOPE Foundation */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                    <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#012A5F] text-white shadow-lg border border-white/20">
                      <Heart className="w-3.5 h-3.5 fill-[#2B711B] text-[#2B711B]" />
                      <span className="font-plusJakartaSans text-[11px] font-bold tracking-tight">
                        UNIHOPE Foundation
                      </span>
                    </div>
                    {/* Pin pointer triangle */}
                    <div className="w-2.5 h-2.5 bg-[#012A5F] rotate-45 -mt-1.5 shadow-sm" />
                    <div className="w-2 h-2 rounded-full bg-[#012A5F]/40 mt-1" />
                  </div>

                  {/* Bottom Map Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/95 border border-[#D6D6D6] shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#012A5F]" />
                    <span className="text-[#012A5F] font-plusJakartaSans text-[11px] font-semibold">
                      Vadapalani, Chennai
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Send a Message Form */}
            <div className="lg:col-span-7 w-full rounded-[20px] border border-[#D6D6D6] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_8px_24px_rgba(1,42,95,0.06)]">
              <div className="pb-6">
                <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-tight tracking-[-0.025em] pb-1">
                  Send a message
                </h2>
                <p className="text-[#5A5A5A] font-plusJakartaSans text-sm sm:text-[15px] leading-relaxed">
                  Questions, ideas or offers of help are all welcome.
                </p>
              </div>

              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex justify-center items-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-xs">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-[#012A5F] font-outfit text-2xl font-semibold mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-[#43474F] font-plusJakartaSans text-sm max-w-md mb-6 leading-relaxed">
                    Thank you for reaching out to UNIHOPE Foundation. Our team has
                    received your inquiry and will respond within 24 to 48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormStatus("idle")}
                    className="cursor-pointer rounded-full bg-[#012A5F] px-7 py-3 text-sm font-semibold text-white hover:bg-[#071D33] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
                  {/* Full Name */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="text-[#BA1A1A] font-plusJakartaSans text-sm font-semibold leading-6">
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full h-[52px] px-5 rounded-[48px] border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Email address */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="text-[#BA1A1A] font-plusJakartaSans text-sm font-semibold leading-6">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full h-[52px] px-5 rounded-[48px] border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Phone number */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="text-[#3D3D3D] font-plusJakartaSans text-sm font-semibold leading-6">
                      Phone number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 Mobile number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full h-[52px] px-5 rounded-[48px] border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div className="flex flex-col items-start gap-1 w-full relative">
                    <label className="text-[#3D3D3D] font-plusJakartaSans text-sm font-semibold leading-6">
                      Subject
                    </label>
                    <div className="relative w-full">
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full h-[52px] px-5 pr-10 rounded-[48px] border border-[#8A8A8A] bg-white text-[#1B1C1C] font-plusJakartaSans text-sm focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] appearance-none cursor-pointer"
                      >
                        <option>General enquiry</option>
                        <option>Volunteer Opportunities</option>
                        <option>CSR & Institutional Partnerships</option>
                        <option>Donations & Tax Exemptions</option>
                        <option>Community Camp Request</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#5A5A5A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="text-[#BA1A1A] font-plusJakartaSans text-sm font-semibold leading-6">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we assist or collaborate?"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full p-4 rounded-[24px] sm:rounded-[32px] border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={formData.agreedToPrivacy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agreedToPrivacy: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-[#767676] text-[#012A5F] focus:ring-[#012A5F]"
                    />
                    <span className="text-[#012A5F] font-plusJakartaSans text-sm leading-snug">
                      I agree to the{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="underline hover:text-[#071D33]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Send Message Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="cursor-pointer text-nowrap inline-flex min-w-[180px] py-0 px-8 justify-center items-center gap-2 rounded-full bg-[#012A5F] text-white hover:bg-[#071D33] active:scale-[0.98] transition-all h-12 shadow-sm disabled:opacity-60"
                    >
                      <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                        {formStatus === "submitting" ? "Sending..." : "Send message"}
                      </span>
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRE-FOOTER BANNER ("Want to help in another way?")      */}
      {/* ========================================================= */}
      <section className="w-full bg-[#EEEDEC] py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-t border-[#E3E1DD]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col items-start max-w-xl">
            <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-[28px] font-semibold leading-snug tracking-[-0.025em] pb-1">
              Want to help in another way?
            </h2>
            <p className="text-[#5A5A5A] font-plusJakartaSans text-sm sm:text-base leading-relaxed">
              Join our ground volunteers or empower social initiatives across Tamil Nadu.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              href="/volunteer"
              className="cursor-pointer text-nowrap flex py-0 px-6 justify-center items-center gap-1.5 rounded-full border border-[#3D3D3D] text-[#012A5F] hover:bg-white hover:border-[#012A5F] active:scale-[0.98] transition-all h-12 font-plusJakartaSans text-sm font-semibold"
            >
              <span>Become a volunteer</span>
              <ArrowUpRight className="w-4 h-4 text-[#012A5F]" />
            </Link>

            <Link
              href="/donate"
              className="cursor-pointer text-nowrap flex py-0 px-7 justify-center items-center rounded-full bg-[#012A5F] text-white hover:bg-[#071D33] shadow-sm active:scale-[0.98] transition-all h-12 font-plusJakartaSans text-sm font-semibold"
            >
              Donate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

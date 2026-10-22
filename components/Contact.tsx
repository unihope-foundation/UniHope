"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ArrowUpRight,
  Send,
  Check,
  ChevronDown,
} from "lucide-react";
import TickerRibbon from "./TickerRibbon";

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
              Contact UNIHOPE Foundation
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
      
<TickerRibbon />
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

              

                <iframe
                  title="UNIHOPE Foundation on Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8224077381533!2d80.20828817371721!3d13.046973587275383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267b010e0cfcb%3A0x5f463f6e74bc75ac!2sUnihope%20Foundation!5e0!3m2!1sen!2sin!4v1792497413383!5m2!1sen!2sin"
                  className="h-[240px] w-full rounded-[20px] border-0 sm:h-[260px]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
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
                    <label className="text-[#3D3D3D] font-plusJakartaSans text-sm font-semibold leading-6">
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
                    <label className="text-[#3D3D3D] font-plusJakartaSans text-sm font-semibold leading-6">
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
                    <label className="text-[#3D3D3D] font-plusJakartaSans text-sm font-semibold leading-6">
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

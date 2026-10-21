import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface FooterProps {
  brandName?: string;
  subBrandName?: string;
  tagline?: React.ReactNode;
  officeTitle?: string;
  quickLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  addressLines?: string[];
  phone?: string;
  email?: string;
  workingHours?: string;
  registrationText?: string;
  copyrightYear?: number | string;
  className?: string;
}

const DEFAULT_QUICK_LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About the Trust", href: "/about" },
  { label: "Our Work & Focus Areas", href: "/our-work" },
  { label: "Volunteer Application ↗", href: "/volunteer" },
  { label: "Statutory Donations", href: "/donate" },
];

const DEFAULT_LEGAL_LINKS: FooterLink[] = [
  { label: "Statutory Disclosures", href: "/disclosures" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const DEFAULT_ADDRESS_LINES = [
  "Vadapalani, Chennai, Tamil Nadu 600026, India",
];

// Clean SVGs for social media matching the screenshot
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="15" x="2" y="4.5" rx="4" />
      <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.5l7.3-8.4L1.9 2h6.5l4.4 6.9L18.9 2Zm-1.1 18h1.7L7.4 3.9H5.6L17.8 20Z" />
    </svg>
  );
}

export function Footer({
  brandName = "UNIHOPE",
  subBrandName = "FOUNDATION",
  tagline = "A registered social and charitable trust committed to authentic social advancement, health accessibility, and grassroots community empowerment across Tamil Nadu.",
  officeTitle = "REGISTERED OFFICE",
  quickLinks = DEFAULT_QUICK_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  addressLines = DEFAULT_ADDRESS_LINES,
  phone = "+91 9143380 0000",
  email = "unihopefoundation.official@gmail.com",
  workingHours = "Monday - Saturday: 09:30 AM - 05:30 PM IST",
  registrationText = "Registered Charitable Trust - Reg. No. R/Chennai North Joint I/Book-4/228/2026",
  copyrightYear = "2026",
  className = "",
}: FooterProps) {
  const socialIcons: SocialLink[] = [
    {
      icon: <GlobeIcon className="h-4 w-4" />,
      href: "https://unihopefoundation.org/",
      label: "Website",
    },
    {
      icon: <InstagramIcon className="h-4 w-4" />,
      href: "https://www.instagram.com/unihopefoundation.official",
      label: "Instagram",
    },
    {
      icon: <YoutubeIcon className="h-4 w-4" />,
      href: "https://www.youtube.com/@UNIHOPEFoundation",
      label: "YouTube",
    },
    {
      icon: <FacebookIcon className="h-4 w-4" />,
      href: "https://www.facebook.com/share/19L4K3tHiY/?mibextid=wwXIfr",
      label: "Facebook",
    },
    {
      icon: <XIcon className="h-4 w-4" />,
      href: "https://x.com/unihopefdn",
      label: "X",
    },
  ];

  return (
    <footer className={`w-full bg-[#072648] text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand, Tagline & Socials */}
          <div className="flex flex-col space-y-6">
            {/* Brand Logo */}
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2.5 select-none sm:gap-3"
            >
              <Image
                src="/UNIHOPE_LOGO.svg"
                alt="UNIHOPE Foundation"
                width={769}
                height={769}
                className="h-12 w-12 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14"
              />
              <div className="flex min-w-0 flex-col leading-none">
                <span className="truncate text-lg font-extrabold tracking-tight text-white sm:text-xl">
                  {brandName}
                </span>
                <span className="mt-1 text-[10px] font-bold tracking-[0.14em] text-[#4ADE80] sm:text-[11px] sm:tracking-[0.2em]">
                  {subBrandName}
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-blue-100/80">
              {tagline}
            </p>

            {/* Social Icons (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pt-1">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-white">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-blue-100/75 transition-colors duration-200 hover:text-white hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Registered Office & Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-white">
              {officeTitle}
            </h3>
            <div className="mt-6 space-y-3.5 text-xs sm:text-sm leading-relaxed text-blue-100/75">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  {addressLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              {phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#4ADE80] shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition hover:text-white"
                  >
                    {phone}
                  </a>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#4ADE80] shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="transition hover:text-white break-all"
                  >
                    {email}
                  </a>
                </div>
              )}

              {workingHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#4ADE80] shrink-0" />
                  <span>{workingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Legal
            </h3>
            <ul className="mt-6 space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/75 transition-colors duration-200 hover:text-white hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Social Icons */}
        <div className="flex sm:hidden items-center justify-center gap-3 pt-8 border-t border-white/10 mt-8">
          {socialIcons.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="w-full bg-[#041527] border-t border-white/5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p className="text-xs text-blue-200/60 font-normal">
            {registrationText}
          </p>
          <p className="text-xs text-blue-200/60 font-normal">
            © {copyrightYear} {brandName} Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

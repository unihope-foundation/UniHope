import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

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
  quickLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  addressLines?: string[];
  phone?: string;
  email?: string;
  registrationText?: string;
  copyrightYear?: number | string;
  className?: string;
}

const DEFAULT_QUICK_LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Get Involved", href: "/volunteer" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
];

const DEFAULT_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const DEFAULT_ADDRESS_LINES = [
  "2nd Floor, No. 73, S Sivan Kovil Street,",
  "opp. Ambiga Driving School,",
  "Ottagapalayam, Sector 15,",
  "Vadapalani, Chennai, Tamil Nadu",
  "600026",
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

function HashIcon({ className = "w-4 h-4" }: { className?: string }) {
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
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

export function Footer({
  brandName = "UNIHOPE",
  subBrandName = "FOUNDATION",
  tagline = (
    <>
      Together, We Build Hope. Every Dream Counts.
      <br />
      Transforming Lives.
    </>
  ),
  quickLinks = DEFAULT_QUICK_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  addressLines = DEFAULT_ADDRESS_LINES,
  phone = "+91 91501 49339",
  email = "unihopefoundation.official@gmail.com",
  registrationText = "Registered Charitable Trust - Reg. No. R/Chennai North Joint I/Book-4/228/2026",
  copyrightYear = "2026",
  className = "",
}: FooterProps) {
  const socialIcons: SocialLink[] = [
    {
      icon: <InstagramIcon className="h-4 w-4" />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <GlobeIcon className="h-4 w-4" />,
      href: "https://unihope.org",
      label: "Website",
    },
    {
      icon: <YoutubeIcon className="h-4 w-4" />,
      href: "https://youtube.com",
      label: "YouTube",
    },
    {
      icon: <HashIcon className="h-4 w-4" />,
      href: "#",
      label: "Social",
    },
  ];

  return (
    <footer className={`w-full bg-[#072648] text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand, Tagline & Socials */}
          <div className="flex flex-col space-y-6 lg:col-span-4">
            {/* Brand Logo */}
            <Link href="/" className="group flex items-center gap-3 select-none">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0A2540] shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Heart className="h-5 w-5 fill-[#0A2540] text-[#0A2540]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  {brandName}
                </span>
                <span className="mt-1 text-[11px] font-bold tracking-[0.2em] text-[#4ADE80]">
                  {subBrandName}
                </span>
              </div>
            </Link>

            {/* Tagline Box */}
            <div className="rounded-xl bg-[#041B33] p-4 border border-white/10 max-w-sm">
              <p className="text-xs sm:text-sm leading-relaxed text-blue-100/90 font-medium">
                {tagline}
              </p>
            </div>

            {/* Social Icons (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
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
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-white">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-3">
              {quickLinks.map((link) => (
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

          {/* Column 3: Information & Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-white">
              Information
            </h3>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-blue-100/75">
              <div>
                {addressLines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

              {phone && (
                <p>
                  <span className="text-white/90 font-medium">Phone:</span>{" "}
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition hover:text-white"
                  >
                    {phone}
                  </a>
                </p>
              )}

              {email && (
                <p className="break-all">
                  <span className="text-white/90 font-medium">Email:</span>{" "}
                  <a
                    href={`mailto:${email}`}
                    className="transition hover:text-white"
                  >
                    {email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Column 4: Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-widest uppercase text-white">
              Legal
            </h3>
            <ul className="mt-6 space-y-3">
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

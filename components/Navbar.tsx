"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  brandName?: string;
  subBrandName?: string;
  navItems?: NavItem[];
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Volunteer ", href: "/volunteer" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({
  brandName = "UNIHOPE",
  subBrandName = "FOUNDATION",
  navItems = DEFAULT_NAV_ITEMS,
  ctaText = "Donate",
  ctaHref = "/donate",
  onCtaClick,
  className = "",
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all ${className}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex min-w-0 items-center gap-2.5 select-none sm:gap-3"
        >
          <Image
            src="/UNIHOPE_LOGO.svg"
            alt="UNIHOPE Foundation"
            width={769}
            height={769}
            priority
            className="h-11 w-11 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14"
          />

          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-lg font-extrabold tracking-tight text-[#0A2540] sm:text-xl">
              {brandName}
            </span>
            <span className="mt-1 text-[10px] font-bold tracking-[0.14em] text-[#2E7D32] sm:text-[11px] sm:tracking-[0.18em]">
              {subBrandName}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative text-[15px] transition-colors duration-200 py-1 ${
                  isActive
                    ? "font-bold text-[#0A2540]"
                    : "font-medium text-gray-700 hover:text-[#0A2540]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#0A2540] transition-all duration-200 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Action (Desktop Donate CTA) */}
        <div className="hidden md:flex items-center">
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#071D33] hover:shadow-md active:scale-[0.98]"
            >
              {ctaText}
            </button>
          ) : (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#071D33] hover:shadow-md active:scale-[0.98]"
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* Mobile Action & Hamburger Button */}
        <div className="flex items-center gap-2.5 md:hidden">
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#071D33] active:scale-[0.98]"
            >
              {ctaText}
            </button>
          ) : (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#071D33] active:scale-[0.98]"
            >
              {ctaText}
            </Link>
          )}

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 hover:text-[#0A2540]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-6 shadow-xl md:hidden animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#0A2540]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            {onCtaClick ? (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  onCtaClick();
                }}
                className="w-full flex items-center justify-center rounded-full bg-[#0A2540] py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#071D33]"
              >
                {ctaText}
              </button>
            ) : (
              <Link
                href={ctaHref}
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center rounded-full bg-[#0A2540] py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#071D33]"
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

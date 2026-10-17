"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";

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
  { label: "Volunteer", href: "/volunteer" },
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
          className="group flex items-center gap-3 select-none"
        >
          {/* Logo Icon Badge */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A2540] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>

          {/* Logo Text */}
          <div className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tight text-[#0A2540]">
              {brandName}
            </span>
            <span className="mt-1 text-[11px] font-bold tracking-[0.18em] text-[#2E7D32]">
              {subBrandName}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative text-[15px] font-medium text-gray-700 transition-colors duration-200 hover:text-[#0A2540]"
            >
              <span>{item.label}</span>
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#0A2540] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
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

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 hover:text-[#0A2540]"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
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

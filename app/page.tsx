import React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Users, Globe2, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Hero Section Preview */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-[#2E7D32] ring-1 ring-emerald-600/20 mb-6">
              <Heart className="h-3.5 w-3.5 fill-[#2E7D32]" />
              <span>UniHope Foundation • Together for a Better Tomorrow</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0A2540] sm:text-5xl lg:text-6xl">
              Bringing Hope & Sustainable Change to Communities
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              We empower underprivileged communities through education, healthcare,
              and sustainable livelihood programs. Join hands with us to build a future full of opportunity.
            </p>

            {/* Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-full bg-[#0A2540] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#071D33] hover:shadow-lg active:scale-[0.98]"
              >
                Donate Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/our-work"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-[#0A2540]"
              >
                Explore Our Work
              </Link>
            </div>
          </div>

          {/* Quick Highlight Cards */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0A2540]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Community First</h3>
                <p className="text-sm text-gray-500">Grassroots initiatives driven by local leaders</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#2E7D32]">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Global Reach</h3>
                <p className="text-sm text-gray-500">Sustainable programs spanning multiple regions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">100% Transparent</h3>
                <p className="text-sm text-gray-500">Every donation accounted for with open audits</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { DonateFaq } from "@/components/DonateFaq";
import { DonationForm } from "@/components/DonationForm";
import { COMMITMENTS, FAQ, HELPLINE, HERO_IMAGE, REG_NO, TRUST_CARDS } from "@/content/donate";
import TickerRibbon from "@/components/TickerRibbon";

export const metadata: Metadata = {
  title: "Donate | UNIHOPE Foundation",
  description:
    "Support education, healthcare, hunger relief and community welfare through UNIHOPE Foundation.",
};

const eyebrow = "text-[13px] font-semibold leading-[19.5px] tracking-[0.08em] text-[#2B711B]";
const card =
  "rounded-[20px] border border-[#D6D6D6] bg-white shadow-[0_8px_24px_rgba(1,42,95,0.06)]";

export default function DonatePage() {
  return (
    <main className="bg-[#F7F6F4]">
      {/* 1. Hero, commitment and donation form */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6">
          {/* Intro and photo */}
          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <div className="flex flex-col gap-3">
              <p className={eyebrow}>DIRECT GIVING</p>
              <h1 className="font-outfit text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-[#012A5F] sm:text-5xl lg:text-[56px]">
                Give hope. Create opportunity.
              </h1>
              <p className="text-base leading-7 text-[#3D3D3D] sm:text-lg">
                Your support helps UNIHOPE respond to real needs and make a real difference.
              </p>
            </div>
            <div className="relative h-56 w-full overflow-hidden rounded-3xl border border-[#D6D6D6] bg-[#EEEDEC] sm:h-72 lg:h-80">
              <Image
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                fill
                priority
                sizes="(min-width: 1200px) 552px, (min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Donation form: second on mobile, right column on desktop */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <DonationForm />
          </div>

        

          {/* Commitment and registration line */}
          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2">
            <div className={`${card} flex flex-col gap-6 p-5 sm:p-8`}>
              <div className="flex flex-col gap-1">
                <p className={eyebrow}>OUR COMMITMENT</p>
                <h2 className="font-outfit text-2xl font-semibold leading-9 text-[#012A5F]">
                  Direct &amp; Accountable Giving
                </h2>
              </div>
              <ul className="flex flex-col gap-5">
                {COMMITMENTS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EEEDEC]">
                      <Icon aria-hidden="true" className="size-5 text-[#012A5F]" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1 pt-[3px]">
                      <p className="font-outfit text-lg font-semibold leading-[24.75px] text-[#012A5F]">
                        {title}
                      </p>
                      <p className="text-[15px] leading-[22px] text-[#3D3D3D]">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex items-start gap-2.5 rounded-3xl border border-[#D6D6D6] bg-white px-4 py-3 text-[13px] font-medium leading-5 text-[#012A5F] shadow-[0_4px_16px_rgba(1,42,95,0.04)] sm:items-center sm:rounded-full">
              <BadgeCheck aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-[#2B711B] sm:mt-0" />
              <span>
                Registered Charitable Trust · Reg. No. {REG_NO} · Assistance Helpline {HELPLINE}
              </span>
            </p>
          </div>
        </div>
      </section>
        <TickerRibbon />

      {/* 2. Trust cards */}
      <section className="border-y border-[#D6D6D6] bg-[#EEEDEC] py-16 lg:py-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8">
          <div className="flex max-w-[672px] flex-col gap-2">
            <p className={eyebrow}>STATUTORY STEWARDSHIP</p>
            <h2 className="font-outfit text-3xl font-semibold leading-tight tracking-[-0.015em] text-[#012A5F] lg:text-[40px] lg:leading-[48px]">
              Built on trust and absolute accountability
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {TRUST_CARDS.map(({ icon: Icon, title, text, footer }) => (
              <li key={title} className={`${card} flex flex-col justify-between gap-6 p-6 sm:p-8`}>
                <div className="flex flex-col gap-4">
                  <span className="grid size-11 place-items-center rounded-full bg-[#EEEDEC]">
                    <Icon aria-hidden="true" className="size-5 text-[#012A5F]" />
                  </span>
                  <h3 className="font-outfit text-[22px] font-semibold leading-[33px] text-[#012A5F]">
                    {title}
                  </h3>
                  <p className="text-[15px] leading-6 text-[#3D3D3D]">{text}</p>
                </div>
                <p className="flex items-center gap-2 border-t border-[#D6D6D6] pt-4 text-[13px] font-semibold leading-[19.5px] text-[#3D3D3D]">
                  <CheckCircle2 aria-hidden="true" className="size-[17px] shrink-0 text-[#2B711B]" />
                  {footer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. FAQ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8">
          <div className="mx-auto flex max-w-[672px] flex-col items-center gap-3 text-center">
            <p className={eyebrow}>TRANSPARENCY &amp; GIVING</p>
            <h2 className="font-outfit text-3xl font-semibold leading-tight tracking-[-0.015em] text-[#012A5F] lg:text-[40px] lg:leading-[48px]">
              Answers to common donation questions
            </h2>
          </div>
          <DonateFaq items={FAQ} />
        </div>
      </section>
    </main>
  );
}

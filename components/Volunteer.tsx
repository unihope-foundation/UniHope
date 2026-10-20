"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import communityGathering from "@/assets/community-gathering.svg";
import studentsImg from "@/assets/students.svg";
import classImg from "@/assets/class.svg";
import {
  Clock,
  Briefcase,
  Package,
  DoorOpen,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Check,
  CheckCircle2,
  X,
  Mail,
  Phone,
  User,
  Heart,
  Sparkles,
} from "lucide-react";

export interface ContributionPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CONTRIBUTION_PATHS: ContributionPath[] = [
  {
    id: "time",
    title: "Give your time",
    description: "Join an event, a drive or a regular activity in your community.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-[#012A5F]"
      >
        <path
          d="M12.1917 13.475L13.475 12.1917L10.0833 8.8V4.58333H8.25V9.53333L12.1917 13.475ZM9.16667 18.3333C7.89861 18.3333 6.70694 18.0927 5.59167 17.6115C4.47639 17.1302 3.50625 16.4771 2.68125 15.6521C1.85625 14.8271 1.20312 13.8569 0.721875 12.7417C0.240625 11.6264 0 10.4347 0 9.16667C0 7.89861 0.240625 6.70694 0.721875 5.59167C1.20312 4.47639 1.85625 3.50625 2.68125 2.68125C3.50625 1.85625 4.47639 1.20312 5.59167 0.721875C6.70694 0.240625 7.89861 0 9.16667 0C10.4347 0 11.6264 0.240625 12.7417 0.721875C13.8569 1.20312 14.8271 1.85625 15.6521 2.68125C16.4771 3.50625 17.1302 4.47639 17.6115 5.59167C18.0927 6.70694 18.3333 7.89861 18.3333 9.16667C18.3333 10.4347 18.0927 11.6264 17.6115 12.7417C17.1302 13.8569 16.4771 14.8271 15.6521 15.6521C14.8271 16.4771 13.8569 17.1302 12.7417 17.6115C11.6264 18.0927 10.4347 18.3333 9.16667 18.3333ZM9.16667 16.5C11.1986 16.5 12.9288 15.7858 14.3573 14.3573C15.7858 12.9288 16.5 11.1986 16.5 9.16667C16.5 7.13472 15.7858 5.40451 14.3573 3.97604C12.9288 2.54757 11.1986 1.83333 9.16667 1.83333C7.13472 1.83333 5.40451 2.54757 3.97604 3.97604C2.54757 5.40451 1.83333 7.13472 1.83333 9.16667C1.83333 11.1986 2.54757 12.9288 3.97604 14.3573C5.40451 15.7858 7.13472 16.5 9.16667 16.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "skill",
    title: "Share a skill",
    description:
      "Teaching, design, medical knowledge, writing, accounts or tech. If you can do it, we can use it.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 18 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-[#012A5F]"
      >
        <path
          d="M2.75 18.3333V14.3917C1.87917 13.5972 1.20312 12.6691 0.721875 11.6073C0.240625 10.5455 0 9.42639 0 8.25C0 5.95833 0.802083 4.01042 2.40625 2.40625C4.01042 0.802083 5.95833 0 8.25 0C10.1597 0 11.8517 0.561458 13.326 1.68438C14.8003 2.80729 15.759 4.27014 16.2021 6.07292L17.3937 10.7708C17.4701 11.0611 17.4167 11.3247 17.2333 11.5615C17.05 11.7983 16.8056 11.9167 16.5 11.9167H14.6667V14.6667C14.6667 15.1708 14.4872 15.6024 14.1281 15.9615C13.7691 16.3205 13.3375 16.5 12.8333 16.5H11V18.3333H9.16667V14.6667H12.8333V10.0833H15.3083L14.4375 6.53125C14.0861 5.14097 13.3375 4.01042 12.1917 3.13958C11.0458 2.26875 9.73194 1.83333 8.25 1.83333C6.47778 1.83333 4.96528 2.45208 3.7125 3.68958C2.45972 4.92708 1.83333 6.43194 1.83333 8.20417C1.83333 9.12083 2.02049 9.99167 2.39479 10.8167C2.7691 11.6417 3.3 12.375 3.9875 13.0167L4.58333 13.5667V18.3333H2.75ZM7.33333 11.9167H9.16667L9.30417 10.7708C9.42639 10.725 9.53715 10.6715 9.63646 10.6104C9.73576 10.5493 9.82361 10.4806 9.9 10.4042L10.9542 10.8625L11.8708 9.30417L10.9542 8.61667C10.9847 8.49444 11 8.37222 11 8.25C11 8.12778 10.9847 8.00556 10.9542 7.88333L11.8708 7.19583L10.9542 5.6375L9.9 6.09583C9.82361 6.01944 9.73576 5.95069 9.63646 5.88958C9.53715 5.82847 9.42639 5.775 9.30417 5.72917L9.16667 4.58333H7.33333L7.19583 5.72917C7.07361 5.775 6.96285 5.82847 6.86354 5.88958C6.76424 5.95069 6.67639 6.01944 6.6 6.09583L5.54583 5.6375L4.62917 7.19583L5.54583 7.88333C5.51528 8.00556 5.5 8.12778 5.5 8.25C5.5 8.37222 5.51528 8.49444 5.54583 8.61667L4.62917 9.30417L5.54583 10.8625L6.6 10.4042C6.67639 10.4806 6.76424 10.5493 6.86354 10.6104C6.96285 10.6715 7.07361 10.725 7.19583 10.7708L7.33333 11.9167ZM8.25 9.625C7.86806 9.625 7.5434 9.49132 7.27604 9.22396C7.00868 8.9566 6.875 8.63194 6.875 8.25C6.875 7.86806 7.00868 7.5434 7.27604 7.27604C7.5434 7.00868 7.86806 6.875 8.25 6.875C8.63194 6.875 8.9566 7.00868 9.22396 7.27604C9.49132 7.5434 9.625 7.86806 9.625 8.25C9.625 8.63194 9.49132 8.9566 9.22396 9.22396C8.9566 9.49132 8.63194 9.625 8.25 9.625Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "resources",
    title: "Give resources",
    description:
      "Donate, or sponsor essential supplies when a campaign needs them.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-[#012A5F]"
      >
        <path
          d="M2.75 18.3333C2.24583 18.3333 1.81424 18.1538 1.45521 17.7948C1.09618 17.4358 0.916667 17.0042 0.916667 16.5V6.16458C0.641667 5.99653 0.420139 5.77882 0.252083 5.51146C0.0840278 5.2441 0 4.93472 0 4.58333V1.83333C0 1.32917 0.179514 0.897569 0.538542 0.538542C0.897569 0.179514 1.32917 0 1.83333 0H16.5C17.0042 0 17.4358 0.179514 17.7948 0.538542C18.1538 0.897569 18.3333 1.32917 18.3333 1.83333V4.58333C18.3333 4.93472 18.2493 5.2441 18.0812 5.51146C17.9132 5.77882 17.6917 5.99653 17.4167 6.16458V16.5C17.4167 17.0042 17.2372 17.4358 16.8781 17.7948C16.5191 18.1538 16.0875 18.3333 15.5833 18.3333H2.75ZM2.75 6.41667V16.5H15.5833V6.41667H2.75ZM1.83333 4.58333H16.5V1.83333H1.83333V4.58333ZM6.41667 11H11.9167V9.16667H6.41667V11Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "door",
    title: "Open a door",
    description:
      "Introduce us to a school, a company, a hospital or someone who can help.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 21 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-[#012A5F]"
      >
        <path
          d="M9.97792 16.5C10.039 16.5 10.1001 16.4847 10.1613 16.4542C10.2224 16.4236 10.2682 16.3931 10.2987 16.3625L17.8154 8.84583C17.9987 8.6625 18.1324 8.45625 18.2165 8.22708C18.3005 7.99792 18.3425 7.76875 18.3425 7.53958C18.3425 7.29514 18.3005 7.06215 18.2165 6.84062C18.1324 6.6191 17.9987 6.42431 17.8154 6.25625L13.9196 2.36042C13.7515 2.17708 13.5567 2.0434 13.3352 1.95938C13.1137 1.87535 12.8807 1.83333 12.6362 1.83333C12.4071 1.83333 12.1779 1.87535 11.9487 1.95938C11.7196 2.0434 11.5133 2.17708 11.33 2.36042L11.0779 2.6125L12.7738 4.33125C13.0029 4.54514 13.171 4.78958 13.2779 5.06458C13.3849 5.33958 13.4383 5.62986 13.4383 5.93542C13.4383 6.57708 13.2206 7.11562 12.7852 7.55104C12.3498 7.98646 11.8112 8.20417 11.1696 8.20417C10.864 8.20417 10.5699 8.15069 10.2873 8.04375C10.0047 7.93681 9.75639 7.77639 9.5425 7.5625L7.82375 5.86667L3.81333 9.87708C3.7675 9.92292 3.73312 9.97257 3.71021 10.026C3.68729 10.0795 3.67583 10.1368 3.67583 10.1979C3.67583 10.3201 3.72167 10.4309 3.81333 10.5302C3.905 10.6295 4.01194 10.6792 4.13417 10.6792C4.19528 10.6792 4.25639 10.6639 4.3175 10.6333C4.37861 10.6028 4.42444 10.5722 4.455 10.5417L7.57167 7.425L8.855 8.70833L5.76125 11.825C5.71542 11.8708 5.68104 11.9205 5.65812 11.974C5.63521 12.0274 5.62375 12.0847 5.62375 12.1458C5.62375 12.2681 5.66958 12.375 5.76125 12.4667C5.85292 12.5583 5.95986 12.6042 6.08208 12.6042C6.14319 12.6042 6.20431 12.5889 6.26542 12.5583C6.32653 12.5278 6.37236 12.4972 6.40292 12.4667L9.51958 9.37292L10.8029 10.6562L7.70917 13.7729C7.66333 13.8035 7.62896 13.8493 7.60604 13.9104C7.58312 13.9715 7.57167 14.0326 7.57167 14.0938C7.57167 14.216 7.6175 14.3229 7.70917 14.4146C7.80083 14.5062 7.90778 14.5521 8.03 14.5521C8.09111 14.5521 8.1484 14.5406 8.20187 14.5177C8.25535 14.4948 8.305 14.4604 8.35083 14.4146L11.4675 11.3208L12.7508 12.6042L9.63417 15.7208C9.58833 15.7667 9.55396 15.8163 9.53104 15.8698C9.50813 15.9233 9.49667 15.9806 9.49667 16.0417C9.49667 16.1639 9.54632 16.2708 9.64563 16.3625C9.74493 16.4542 9.85569 16.5 9.97792 16.5ZM9.955 18.3333C9.38972 18.3333 8.88937 18.1462 8.45396 17.7719C8.01854 17.3976 7.76264 16.9278 7.68625 16.3625C7.16681 16.2861 6.73139 16.0722 6.38 15.7208C6.02861 15.3694 5.81472 14.934 5.73833 14.4146C5.21889 14.3382 4.78729 14.1205 4.44354 13.7615C4.09979 13.4024 3.88972 12.9708 3.81333 12.4667C3.23278 12.3903 2.75917 12.1382 2.3925 11.7104C2.02583 11.2826 1.8425 10.7785 1.8425 10.1979C1.8425 9.89236 1.89979 9.59826 2.01437 9.31563C2.12896 9.03299 2.29319 8.78472 2.50708 8.57083L7.82375 3.27708L10.8258 6.27917C10.8564 6.325 10.9022 6.35938 10.9633 6.38229C11.0244 6.40521 11.0856 6.41667 11.1467 6.41667C11.2842 6.41667 11.3988 6.37465 11.4904 6.29063C11.5821 6.2066 11.6279 6.09583 11.6279 5.95833C11.6279 5.89722 11.6165 5.83611 11.5935 5.775C11.5706 5.71389 11.5363 5.66806 11.4904 5.6375L8.21333 2.36042C8.04528 2.17708 7.85049 2.0434 7.62896 1.95938C7.40743 1.87535 7.17444 1.83333 6.93 1.83333C6.70083 1.83333 6.47167 1.87535 6.2425 1.95938C6.01333 2.0434 5.80708 2.17708 5.62375 2.36042L2.3925 5.61458C2.255 5.75208 2.14042 5.9125 2.04875 6.09583C1.95708 6.27917 1.89597 6.4625 1.86542 6.64583C1.83486 6.82917 1.83486 7.01632 1.86542 7.20729C1.89597 7.39826 1.95708 7.57778 2.04875 7.74583L0.719583 9.075C0.459861 8.72361 0.268889 8.33785 0.146667 7.91771C0.0244444 7.49757 -0.0213889 7.07361 0.00916667 6.64583C0.0397222 6.21806 0.146667 5.80174 0.33 5.39687C0.513333 4.99201 0.765417 4.62917 1.08625 4.30833L4.3175 1.07708C4.68417 0.725694 5.09285 0.458333 5.54354 0.275C5.99424 0.0916667 6.45639 0 6.93 0C7.40361 0 7.86576 0.0916667 8.31646 0.275C8.76715 0.458333 9.16819 0.725694 9.51958 1.07708L9.77167 1.32917L10.0238 1.07708C10.3904 0.725694 10.7991 0.458333 11.2498 0.275C11.7005 0.0916667 12.1626 0 12.6362 0C13.1099 0 13.572 0.0916667 14.0227 0.275C14.4734 0.458333 14.8744 0.725694 15.2258 1.07708L19.0987 4.95C19.4501 5.30139 19.7175 5.70625 19.9008 6.16458C20.0842 6.62292 20.1758 7.08889 20.1758 7.5625C20.1758 8.03611 20.0842 8.49826 19.9008 8.94896C19.7175 9.39965 19.4501 9.80069 19.0987 10.1521L11.5821 17.6458C11.3682 17.8597 11.1199 18.0278 10.8373 18.15C10.5547 18.2722 10.2606 18.3333 9.955 18.3333Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "exp",
    question: "Do I need prior experience?",
    answer:
      "No prior experience is necessary. We provide orientation and match opportunities to your comfort level, schedule, and areas of interest.",
  },
  {
    id: "time-needed",
    question: "How much time do I need to give?",
    answer:
      "As little as a few hours a month for weekend drives, or regular weekly commitments if you are leading study centres, tutoring, or vocational classes. Every hour makes a tangible difference.",
  },
  {
    id: "location",
    question: "Can I volunteer if I live outside Chennai?",
    answer:
      "Yes! Remote and hybrid volunteering options are available, including digital content creation, curriculum drafting, web/tech support, tele-counseling, fundraising outreach, and translation.",
  },
  {
    id: "registered",
    question: "Is UNIHOPE a registered organisation?",
    answer:
      "Yes, UNIHOPE Foundation is a registered Charitable Trust under the Indian Trusts Act (Reg. No. R/Chennai North Joint I/Book-4/228/2026), governed with complete statutory transparency.",
  },
  {
    id: "cert",
    question: "Will I receive a volunteer certificate?",
    answer:
      "Yes, after completing a minimum required volunteer tenure or initiative milestone, we provide official volunteer service certificates and recommendation letters upon request.",
  },
  {
    id: "onboarding",
    question: "How does onboarding work?",
    answer:
      "Once you submit the registration form, our community coordinator will reach out over WhatsApp or phone to introduce ongoing drives and schedule a brief introductory orientation.",
  },
];

export function Volunteer() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerFormStatus, setPartnerFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [volunteerFormStatus, setVolunteerFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [partnerFormData, setPartnerFormData] = useState({
    organisationName: "",
    contactPerson: "",
    workEmail: "",
    phone: "",
    message: "",
    agreedToPrivacy: false,
  });

  const [volunteerFormData, setVolunteerFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    cityArea: "Vadapalani, Chennai",
    interestArea: "Education & Children",
    availability: "Weekend Drives",
    note: "",
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerFormData.agreedToPrivacy) {
      alert("Please accept the privacy policy to continue.");
      return;
    }
    setPartnerFormStatus("submitting");
    setTimeout(() => {
      setPartnerFormStatus("success");
      setPartnerFormData({
        organisationName: "",
        contactPerson: "",
        workEmail: "",
        phone: "",
        message: "",
        agreedToPrivacy: false,
      });
    }, 1200);
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerFormStatus("submitting");
    setTimeout(() => {
      setVolunteerFormStatus("success");
      setTimeout(() => {
        setIsModalOpen(false);
        setVolunteerFormStatus("idle");
      }, 2000);
    }, 1200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-w-full min-h-screen bg-[#F7F6F4] text-[#171717] selection:bg-[#012A5F] selection:text-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative w-full pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start z-10">
              <div className="inline-flex items-center gap-1.5 pb-3">
                <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold tracking-[0.08em] uppercase">
                  GET INVOLVED
                </span>
              </div>

              <h1 className="text-[#012A5F] font-outfit text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-tight sm:leading-[1.1] lg:leading-[64px] tracking-[-0.02em] pb-5">
                Join UNIHOPE
              </h1>

              <p className="text-[#43474F] font-plusJakartaSans text-base sm:text-lg leading-relaxed max-w-[480px] pb-8">
                You don&apos;t need to do everything. You just need to do something.
                Time, skills, resources or support, there is a place waiting for
                you.
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer text-nowrap flex py-0 px-6 sm:px-7 justify-center items-center gap-2 rounded-full bg-[#012A5F] text-white shadow-md hover:bg-[#071D33] hover:shadow-lg active:scale-[0.98] transition-all h-12"
                >
                  <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                    Register as a volunteer
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("partnerships")}
                  className="cursor-pointer text-nowrap flex py-0 px-6 justify-center items-center rounded-full border border-[#43474F] bg-transparent text-[#012A5F] hover:bg-white hover:border-[#012A5F] active:scale-[0.98] transition-all h-12"
                >
                  <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                    Partner with us
                  </span>
                </button>
              </div>
            </div>

            {/* Right Image Card & Location Pill */}
            <div className="lg:col-span-6 flex flex-col items-start gap-4 w-full">
              <div className="relative rounded-3xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-[0_8px_24px_rgba(1,42,95,0.06)] w-full h-[320px] sm:h-[400px] lg:h-[420px] overflow-hidden group">
                <Image
                  src={communityGathering}
                  alt="UNIHOPE Community Outreach in Chennai"
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex py-2.5 px-4 items-center gap-2.5 rounded-xl border border-[#D6D6D6] bg-[#EEEDEC] shadow-xs">
                <MapPin className="w-4 h-4 text-[#012A5F] shrink-0" />
                <span className="text-[#012A5F] font-plusJakartaSans text-xs sm:text-sm font-semibold leading-5">
                  Community First · Vadapalani &amp; Chennai Outreach
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. RIBBON MARQUEE (ORANGE)                                */}
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
      {/* 3. PATHS OF CONTRIBUTION ("Four ways to help")             */}
      {/* ========================================================= */}
      <section className="w-full bg-white border-t border-[#E3E1DD] py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col items-start pb-12 max-w-2xl">
            <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-3">
              PATHS OF CONTRIBUTION
            </span>
            <h2 className="text-[#012A5F] font-outfit text-3xl sm:text-4xl lg:text-[40px] font-semibold leading-tight tracking-[-0.015em] pb-3">
              Four ways to help
            </h2>
            <p className="text-[#5A5A5A] font-plusJakartaSans text-base leading-[26px]">
              Choose how you would like to walk alongside our communities.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTRIBUTION_PATHS.map((path) => (
              <div
                key={path.id}
                className="flex flex-col items-start justify-between rounded-[20px] border border-[#D6D6D6] bg-white p-6 shadow-[0_8px_24px_rgba(1,42,95,0.06)] hover:shadow-xl hover:border-[#012A5F]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex justify-center items-center rounded-xl bg-[#EEEDEC] w-12 h-12 mb-5">
                    {path.icon}
                  </div>
                  <h3 className="text-[#012A5F] font-outfit text-xl font-semibold leading-[26px] pb-2">
                    {path.title}
                  </h3>
                  <p className="text-[#43474F] font-plusJakartaSans text-sm sm:text-base leading-relaxed">
                    {path.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. VOLUNTEER REGISTRATION ("Become a volunteer")          */}
      {/* ========================================================= */}
      <section
        id="volunteer-registration"
        className="w-full bg-[#F7F6F4] py-16 sm:py-24 px-4 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[20px] sm:rounded-3xl border border-[#D6D6D6] bg-white p-6 sm:p-10 lg:p-12 shadow-[0_8px_24px_rgba(1,42,95,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Image Card */}
              <div className="lg:col-span-5 w-full">
                <div className="relative rounded-3xl border border-[#D6D6D6] bg-[#EEEDEC] w-full h-[320px] sm:h-[380px] overflow-hidden shadow-inner group">
                  <Image
                    src={studentsImg}
                    alt="Volunteers and students at UNIHOPE study camp"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Right Steps & Action */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-2">
                  VOLUNTEER REGISTRATION
                </span>
                <h2 className="text-[#012A5F] font-outfit text-2xl sm:text-3xl lg:text-[28px] font-semibold leading-tight pb-3">
                  Become a volunteer
                </h2>
                <p className="text-[#43474F] font-plusJakartaSans text-base leading-[26px] pb-6">
                  Tell us a little about yourself and where you would like to help.
                  It takes about two minutes.
                </p>

                {/* 3 Step Checklist */}
                <div className="w-full border-t border-[#E3E1DD] mb-8">
                  <div className="flex py-3.5 items-center gap-3 border-b border-[#E3E1DD]">
                    <CheckCircle2 className="w-5 h-5 text-[#266C16] shrink-0" />
                    <span className="text-[#1B1C1C] font-plusJakartaSans text-sm sm:text-base leading-6">
                      Share your contact details
                    </span>
                  </div>

                  <div className="flex py-3.5 items-center gap-3 border-b border-[#E3E1DD]">
                    <CheckCircle2 className="w-5 h-5 text-[#266C16] shrink-0" />
                    <span className="text-[#1B1C1C] font-plusJakartaSans text-sm sm:text-base leading-6">
                      Choose the areas you would like to help with
                    </span>
                  </div>

                  <div className="flex py-3.5 items-center gap-3 border-b border-[#E3E1DD]">
                    <CheckCircle2 className="w-5 h-5 text-[#266C16] shrink-0" />
                    <span className="text-[#1B1C1C] font-plusJakartaSans text-sm sm:text-base leading-6">
                      We will get in touch with you
                    </span>
                  </div>
                </div>

                {/* Action Button & Note */}
                <div className="flex flex-col items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer text-nowrap flex py-0 px-8 justify-center items-center gap-2 rounded-full bg-[#012A5F] text-white shadow-md hover:bg-[#071D33] hover:shadow-lg active:scale-[0.98] transition-all h-12"
                  >
                    <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                      Open registration form
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </button>
                  <p className="text-[#5A5A5A] font-plusJakartaSans text-xs leading-4">
                    Opens interactive registration. We respect your privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. PARTNERSHIPS ("Work with us")                          */}
      {/* ========================================================= */}
      <section
        id="partnerships"
        className="w-full bg-[#EEEDEC] py-16 sm:py-24 px-4 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Description & Institutional Collaboration Box */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-3">
                PARTNERSHIPS
              </span>
              <h2 className="text-[#012A5F] font-outfit text-3xl sm:text-4xl lg:text-[40px] font-semibold leading-tight tracking-[-0.015em] pb-4">
                Work with us
              </h2>
              <p className="text-[#43474F] font-plusJakartaSans text-base leading-[26px]">
                If you represent a company, school, college, hospital or NGO, tell
                us how you would like to work with us.
              </p>

              {/* Institutional Collaboration Card */}
              <div className="mt-8 w-full rounded-xl border border-[#D6D6D6] bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center rounded-lg bg-[#EEEDEC] w-8 h-8 text-[#012A5F]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-[#012A5F] font-plusJakartaSans text-sm font-semibold leading-5">
                    Institutional Collaboration
                  </h3>
                </div>
                <p className="text-[#5A5A5A] font-plusJakartaSans text-xs leading-[20px]">
                  We design structured programs for CSR mandates, student
                  volunteer chapters, and diagnostic camp partnerships with local
                  healthcare institutions.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Partner Enquiry Form */}
            <div className="lg:col-span-7 w-full rounded-[20px] border border-[#D6D6D6] bg-white p-6 sm:p-8 shadow-[0_8px_24px_rgba(1,42,95,0.06)]">
              {partnerFormStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex justify-center items-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-[#012A5F] font-outfit text-2xl font-semibold mb-2">
                    Enquiry Sent Successfully!
                  </h3>
                  <p className="text-[#43474F] font-plusJakartaSans text-sm max-w-md mb-6 leading-relaxed">
                    Thank you for reaching out. Our partnerships team will review
                    your collaboration details and connect with you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPartnerFormStatus("idle")}
                    className="cursor-pointer rounded-full bg-[#012A5F] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#071D33]"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePartnerSubmit} className="flex flex-col gap-5 w-full">
                  {/* Organisation Name */}
                  <div className="flex flex-col items-start gap-1.5 w-full">
                    <label className="text-[#43474F] font-plusJakartaSans text-sm font-semibold leading-5">
                      Organisation name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chennai Public School, Anna Nagar"
                      value={partnerFormData.organisationName}
                      onChange={(e) =>
                        setPartnerFormData({
                          ...partnerFormData,
                          organisationName: e.target.value,
                        })
                      }
                      className="w-full h-[50px] px-4 rounded-xl border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Contact Person & Work Email (2 cols on sm+) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-col items-start gap-1.5 w-full">
                      <label className="text-[#43474F] font-plusJakartaSans text-sm font-semibold leading-5">
                        Contact person
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={partnerFormData.contactPerson}
                        onChange={(e) =>
                          setPartnerFormData({
                            ...partnerFormData,
                            contactPerson: e.target.value,
                          })
                        }
                        className="w-full h-[50px] px-4 rounded-xl border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                      />
                    </div>

                    <div className="flex flex-col items-start gap-1.5 w-full">
                      <label className="text-[#43474F] font-plusJakartaSans text-sm font-semibold leading-5">
                        Work email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@organization.org"
                        value={partnerFormData.workEmail}
                        onChange={(e) =>
                          setPartnerFormData({
                            ...partnerFormData,
                            workEmail: e.target.value,
                          })
                        }
                        className="w-full h-[50px] px-4 rounded-xl border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col items-start gap-1.5 w-full">
                    <label className="text-[#43474F] font-plusJakartaSans text-sm font-semibold leading-5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={partnerFormData.phone}
                      onChange={(e) =>
                        setPartnerFormData({
                          ...partnerFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full h-[50px] px-4 rounded-xl border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col items-start gap-1.5 w-full">
                    <label className="text-[#43474F] font-plusJakartaSans text-sm font-semibold leading-5">
                      How would you like to work with us?
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us briefly about your program, CSR goals, or community drive initiative..."
                      value={partnerFormData.message}
                      onChange={(e) =>
                        setPartnerFormData({
                          ...partnerFormData,
                          message: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl border border-[#8A8A8A] bg-white text-[#171717] font-plusJakartaSans text-sm placeholder:text-[rgba(90,90,90,0.60)] focus:outline-none focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F]"
                    />
                  </div>

                  {/* Privacy Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={partnerFormData.agreedToPrivacy}
                      onChange={(e) =>
                        setPartnerFormData({
                          ...partnerFormData,
                          agreedToPrivacy: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-[#767676] text-[#012A5F] focus:ring-[#012A5F]"
                    />
                    <span className="text-[#012A5F] font-plusJakartaSans text-xs leading-4">
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

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={partnerFormStatus === "submitting"}
                      className="cursor-pointer text-nowrap flex py-0 px-8 justify-center items-center rounded-full border border-[#43474F] bg-[#012A5F] text-white hover:bg-[#071D33] active:scale-[0.98] transition-all h-12 shadow-sm disabled:opacity-60"
                    >
                      <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                        {partnerFormStatus === "submitting"
                          ? "Sending..."
                          : "Send enquiry"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FAQ ACCORDION ("COMMON QUESTIONS")                     */}
      {/* ========================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col items-start pb-12">
            <span className="text-[#2B711B] font-plusJakartaSans text-[13px] font-semibold leading-[18px] tracking-[0.08em] uppercase pb-3">
              COMMON QUESTIONS
            </span>
            <h2 className="text-[#012A5F] font-outfit text-3xl sm:text-4xl lg:text-[40px] font-semibold leading-tight tracking-[-0.015em]">
              Frequently asked questions about volunteering
            </h2>
          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-3.5 w-full">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white ${
                    isOpen
                      ? "border-[#012A5F] shadow-sm"
                      : "border-[#D6D6D6] hover:border-gray-400"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="text-[#012A5F] font-plusJakartaSans text-base font-semibold leading-[26px] pr-4">
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-[#012A5F]">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 transition-transform" />
                      ) : (
                        <ChevronDown className="w-5 h-5 transition-transform" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[#43474F] font-plusJakartaSans text-sm sm:text-base leading-relaxed border-t border-gray-100 animate-fadeIn">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PRE-FOOTER CTA ("Want to be part of it?")               */}
      {/* ========================================================= */}
      <section className="w-full bg-[#F7F6F4] border-t border-[#E3E1DD] py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#244775] bg-[#012A5F] p-8 sm:p-12 lg:p-14 shadow-[0_8px_24px_rgba(1,42,95,0.06)] text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Action Column */}
              <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
                <h2 className="font-outfit text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.015em] pb-4">
                  Want to be part of it?
                </h2>
                <p className="text-white/80 font-plusJakartaSans text-base leading-[26px] max-w-xl pb-8">
                  Every small hand extended changes a destiny. Whether you offer
                  an hour or an ongoing commitment, your presence creates ripple
                  effects across our communities.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer text-nowrap flex py-0 px-8 justify-center items-center gap-2 rounded-full bg-white text-[#012A5F] hover:bg-gray-100 shadow-md active:scale-[0.98] transition-all h-12"
                  >
                    <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                      Become a volunteer
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[#012A5F]" />
                  </button>

                  <Link
                    href="/donate"
                    className="cursor-pointer text-nowrap flex py-0 px-8 justify-center items-center rounded-full border border-white/40 hover:bg-white/10 text-white active:scale-[0.98] transition-all h-12"
                  >
                    <span className="font-plusJakartaSans text-sm font-semibold leading-5">
                      Donate
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:col-span-5 w-full">
                <div className="relative rounded-3xl border border-white/20 bg-[#012A5F] w-full h-[220px] sm:h-[280px] overflow-hidden shadow-lg group">
                  <Image
                    src={classImg}
                    alt="Educational drive support"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. VOLUNTEER REGISTRATION MODAL                           */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {volunteerFormStatus === "success" ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex justify-center items-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-[#012A5F] font-outfit text-2xl font-semibold mb-2">
                  Registration Received!
                </h3>
                <p className="text-gray-600 font-plusJakartaSans text-sm leading-relaxed">
                  Thank you for stepping up, {volunteerFormData.fullName || "friend"}!
                  Our volunteer coordinator will contact you via WhatsApp or phone.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-[#2B711B] font-plusJakartaSans text-xs font-semibold tracking-wider uppercase">
                    JOIN THE CAUSE
                  </span>
                  <h3 className="text-[#012A5F] font-outfit text-2xl font-semibold mt-1">
                    Volunteer Application
                  </h3>
                  <p className="text-gray-600 font-plusJakartaSans text-xs mt-1">
                    Fill out this quick form. We will match you with active drives in Chennai.
                  </p>
                </div>

                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={volunteerFormData.fullName}
                      onChange={(e) =>
                        setVolunteerFormData({
                          ...volunteerFormData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 91501 49339"
                        value={volunteerFormData.phone}
                        onChange={(e) =>
                          setVolunteerFormData({
                            ...volunteerFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={volunteerFormData.email}
                        onChange={(e) =>
                          setVolunteerFormData({
                            ...volunteerFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Interest Area
                      </label>
                      <select
                        value={volunteerFormData.interestArea}
                        onChange={(e) =>
                          setVolunteerFormData({
                            ...volunteerFormData,
                            interestArea: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none bg-white"
                      >
                        <option>Education & Children</option>
                        <option>Health Camps & Awareness</option>
                        <option>Skills & Livelihood</option>
                        <option>Women Empowerment</option>
                        <option>Elderly & Vulnerable Care</option>
                        <option>Tech & Digital Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Availability
                      </label>
                      <select
                        value={volunteerFormData.availability}
                        onChange={(e) =>
                          setVolunteerFormData({
                            ...volunteerFormData,
                            availability: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none bg-white"
                      >
                        <option>Weekend Drives</option>
                        <option>Weekday Evenings</option>
                        <option>Flexible / As Needed</option>
                        <option>Remote Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Skills or Brief Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tell us what you love doing or any previous volunteering..."
                      value={volunteerFormData.note}
                      onChange={(e) =>
                        setVolunteerFormData({
                          ...volunteerFormData,
                          note: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#012A5F] focus:ring-1 focus:ring-[#012A5F] outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={volunteerFormStatus === "submitting"}
                      className="w-full flex items-center justify-center rounded-full bg-[#012A5F] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#071D33] active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {volunteerFormStatus === "submitting"
                        ? "Submitting Application..."
                        : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Volunteer;

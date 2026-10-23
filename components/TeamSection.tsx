
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";




type TeamMember = {
  name: string;
  image: string;
  role: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  // 1. President

  // 2–3. Office Bearers
  {
    name: "Venkatesh A",
    role: "Secretary / Community Outreach Coordinator",
    image: "/Teams/Venkatesh%20A.jpeg",
  },
  {
    name: "Sundareswaran V",
    role: "Treasurer / Events & Campaigns Coordinator",
    image: "/Teams/Sundareshwaran%20V.jpeg",
  },

  // 4–5. Trustees
  {
    name: "Umamaheswari K",
    role: "Trustee / Women & Child Welfare Coordinator",
    image: "/Teams/Umamageshwari%20K.svg",
  },
  {
    name: "Santhoshkumar B",
    role: "Trustee / Volunteer Coordinator",
    image: "/Teams/Santhosh%20Kumar.svg",
  },

  // 6–11. Core Community Programs
  {
    name: "Mohamed Yousuf Azarudeen M B",
    role: "Social Welfare Programme Coordinator",
    image: "/Teams/Azarudeen.jpg",
  },
  {
    name: "Prabu Kumaran",
    role: "Education & Youth Development Coordinator",
    image: "/Teams/prabu%20Kumaran.png",
  },
  {
    name: "Vasanthakumar S",
    role: "Healthcare & Blood Donation Coordinator",
    image: "/Teams/Vasanth%20kumar.svg",
  },
  {
    name: "Balamurali G",
    role: "Community Development Coordinator",
    image: "/Teams/Balamurali%20G.svg",
  },
  {
    name: "Mathavan Loganathan",
    role: "Community Development Coordinator",
    image: "/Teams/Mathavan%20Loganathan.svg",
  },
  {
    name: "Navaneethan L",
    role: "Food Donation & Humanitarian Aid Coordinator",
    image: "/Teams/Navaneethan%20L.svg",
  },

  // 12–16. Finance, Field Operations & Partnerships
  {
    name: "Boopathi M",
    role: "Finance & Donor Relations Coordinator",
    image: "/Teams/Boopathi%20M.svg",
  },
  {
    name: "Gowtham V M",
    role: "Field Operations Coordinator",
    image: "/Teams/Gowtham%20V%20M%20_.svg",
  },
  {
    name: "Ananthan S",
    role: "Public Relations & Partnerships Coordinator",
    image: "/Teams/Ananthan%20S.svg",
  },
  {
    name: "Revanth Anbalagan",
    role: "Public Relations & Partnerships Coordinator",
    image: "/Teams/Revanth%20Anbalagan.svg",
  },
  {
    name: "Venkatesh M",
    role: "Volunteer Engagement Coordinator",
    image: "/Teams/Venkatesh%20M.svg",
  },

  // 17–21. Operations & Support
  {
    name: "Udhaya Karthik E",
    role: "Logistics & Materials Coordinator",
    image: "/Teams/Udhaya%20Karthik%20E.svg",
  },
  {
    name: "Selvam D",
    role: "Logistics & Materials Coordinator",
    image: "/Teams/Selvam.svg",
  },
  {
    name: "Nandhakumar R",
    role: "Documentation & Reporting Coordinator",
    image: "/Teams/Nandhakumar%20R.svg",
  },
  {
    name: "Sivaneswaran G",
    role: "Digital Media & Communications Coordinator",
    image: "/Teams/Sivaneswaran%20G.svg",
  },
  {
    name: "Ari Vishnu R",
    role: "Website & Technology Coordinator",
    image: "/Teams/Ari%20Vishnu%20R.svg",
  },
];

export function TeamSection() {
  return (
    <section
      aria-labelledby="team-heading"
      className="overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section introduction */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#2E7D32]">
            <Users className="h-4 w-4" aria-hidden="true" />
            Our Team
          </div>

          <h2
            id="team-heading"
            className="text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-4xl lg:text-5xl"
          >
            Meet the people behind UNIHOPE
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Meet all 21 members of the UNIHOPE Foundation team.
          </p>

          {/* Functional navigation */}
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/volunteer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#256628] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
            >
              Become a Volunteer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:border-[#2E7D32] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Responsive team grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.name}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={member.image}
                  alt={`${member.name}, UNIHOPE Foundation team member`}
                  fill
                  sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw"
                  className={`object-cover object-top transition-transform duration-300 ${
                    member.name === "Prabu Kumaran"
                      ? "scale-[0.88] group-hover:scale-[0.92]"
                      : "group-hover:scale-[1.03]"
                  }`}
                />
              </div>
              <div className="relative z-10 border-t border-slate-100 bg-white p-2 transition-colors group-hover:bg-white sm:absolute sm:inset-x-2 sm:bottom-2 sm:rounded-lg sm:border sm:border-white/80 sm:bg-white/90 sm:p-2.5 sm:shadow-sm sm:backdrop-blur-sm sm:group-hover:bg-white/95">
                <h3 className="line-clamp-2 break-words text-xs font-bold leading-4 text-[#171717] sm:text-sm sm:leading-5">
                  {member.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 break-words text-[10px] font-semibold leading-4 text-[#2B711B] sm:mt-1 sm:text-xs sm:leading-5">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

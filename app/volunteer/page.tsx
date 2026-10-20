import type { Metadata } from "next";
import { Volunteer } from "@/components/Volunteer";

export const metadata: Metadata = {
  title: "Volunteer & Get Involved • UniHope Foundation",
  description:
    "Join UNIHOPE Foundation as a volunteer or partner with us in Chennai. Give your time, share a skill, or collaborate on community healthcare, education, and welfare drives.",
};

export default function VolunteerPage() {
  return <Volunteer />;
}

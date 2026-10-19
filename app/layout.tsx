import type { Metadata } from "next";
import "./globals.css";
import "@/styles/motion.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MotionInit } from "@/components/motion/MotionInit";

export const metadata: Metadata = {
  title: "UniHope Foundation",
  description: "Empowering communities and inspiring hope through sustainable action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <MotionInit />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-gray-900"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

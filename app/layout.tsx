import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Plus_Jakarta_Sans, DM_Sans, Inter, Onest, Source_Serif_4, Open_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/motion.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MotionInit } from "@/components/motion/MotionInit";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unihopefoundation.org"),
  title: {
    default: "UNIHOPE Foundation | Registered Charitable Trust in Chennai",
    template: "%s | UNIHOPE Foundation",
  },
  description:
    "UNIHOPE Foundation is a registered charitable trust in Chennai supporting education, healthcare, livelihoods and community welfare.",
  openGraph: {
    title: "UNIHOPE Foundation | Registered Charitable Trust in Chennai",
    description:
      "UNIHOPE Foundation is a registered charitable trust in Chennai supporting education, healthcare, livelihoods and community welfare.",
    url: "https://unihopefoundation.org",
    siteName: "UNIHOPE Foundation",
    locale: "en_IN",
    type: "website",
  },
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "UNIHOPE Foundation",
      url: "https://unihopefoundation.org",
      logo: "https://unihopefoundation.org/UNIHOPE_LOGO.svg",
      email: "unihopefoundation.official@gmail.com",
      telephone: "+91 91501 49339",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "2nd Floor, No. 73, S Sivan Kovil Street, opp. Ambiga Driving School, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026",
        addressLocality: "Chennai",
        addressRegion: "Tamil Nadu",
        postalCode: "600026",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.instagram.com/unihopefoundation.official",
        "https://www.youtube.com/@UNIHOPEFoundation",
        "https://x.com/unihopefdn",
        "https://www.facebook.com/share/19L4K3tHiY/?mibextid=wwXIfr",
      ],
    },
    {
      "@type": "WebSite",
      name: "UNIHOPE Foundation",
      url: "https://unihopefoundation.org",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${plusJakartaSans.variable} ${dmSans.variable} ${inter.variable} ${onest.variable} ${sourceSerif.variable} ${openSans.variable} h-full antialiased`}
      suppressHydrationWarning >

      <head>
        <MotionInit />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-gray-900"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

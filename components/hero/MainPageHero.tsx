

"use client";

import { useId, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

const IMAGES = {
    mission: "/Heros/empower-children.jpg",
    education: "/Heros/education-hope.jpg",
    healthcare: "/our-work/maternal-health.jpg",
    gallery: "/Heros/gallery-circle.jpg",
    donate: "/Heros/india-donate.jpg",
};

/**
 * Computes a mathematically smooth S-curved tabbed card outline.
 *
 * - `left`: Tab on the top-left, stepping down to a lower shoulder on the top-right.
 * - `right`: Tab on the top-right, stepping down to a lower shoulder on the top-left.
 *
 * Uses continuous circular arcs with matching tangents (C1 continuity) so the
 * transition between tab and shoulder has a smooth concave fillet (scoop).
 */
function getTabPath(w: number, h: number, side: "left" | "right") {
    const width = Math.max(w || 250, 60);
    const height = Math.max(h || 380, 60);
    const rS = 15; // Radius of both convex and concave S-curve arcs
    const tabH = rS * 2; // 30px height of tab above the shoulder
    const tabW = Math.round(width * 0.52); // Tab width spans 52% of card
    const rCorner = 32; // Corner radius for top and bottom card corners

    if (side === "left") {
        return [
            `M 0 ${rCorner}`,
            `A ${rCorner} ${rCorner} 0 0 1 ${rCorner} 0`,
            `L ${tabW - rS} 0`,
            `A ${rS} ${rS} 0 0 1 ${tabW} ${rS}`,
            `A ${rS} ${rS} 0 0 0 ${tabW + rS} ${tabH}`,
            `L ${width - rCorner} ${tabH}`,
            `A ${rCorner} ${rCorner} 0 0 1 ${width} ${tabH + rCorner}`,
            `L ${width} ${height - rCorner}`,
            `A ${rCorner} ${rCorner} 0 0 1 ${width - rCorner} ${height}`,
            `L ${rCorner} ${height}`,
            `A ${rCorner} ${rCorner} 0 0 1 0 ${height - rCorner}`,
            `Z`,
        ].join(" ");
    } else {
        return [
            `M 0 ${tabH + rCorner}`,
            `A ${rCorner} ${rCorner} 0 0 1 ${rCorner} ${tabH}`,
            `L ${width - tabW - rS} ${tabH}`,
            `A ${rS} ${rS} 0 0 0 ${width - tabW} ${tabH - rS}`,
            `A ${rS} ${rS} 0 0 1 ${width - tabW + rS} 0`,
            `L ${width - rCorner} 0`,
            `A ${rCorner} ${rCorner} 0 0 1 ${width} ${rCorner}`,
            `L ${width} ${height - rCorner}`,
            `A ${rCorner} ${rCorner} 0 0 1 ${width - rCorner} ${height}`,
            `L ${rCorner} ${height}`,
            `A ${rCorner} ${rCorner} 0 0 1 0 ${height - rCorner}`,
            `Z`,
        ].join(" ");
    }
}

/**
 * Responsive container clipped dynamically to the S-curved tab profile.
 * Applies the SVG clipPath to both solid-color containers and full-bleed images.
 */
function TabFrame({
    children,
    side = "left",
    initialHeight = 380,
    initialWidth = 260,
    className = "",
    style = {},
}: {
    children: React.ReactNode;
    side?: "left" | "right";
    initialHeight?: number;
    initialWidth?: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number }>({
        w: initialWidth,
        h: initialHeight,
    });
    const rawId = useId();
    const clipId = `tab-clip-${side}-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const updateSize = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
            }
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const pathData = getTabPath(size.w, size.h, side);

    return (
        <>
            <svg
                className="pointer-events-none absolute h-0 w-0"
                style={{ position: "absolute", width: 0, height: 0 }}
                aria-hidden="true"
            >
                <defs>
                    <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                        <path d={pathData} />
                    </clipPath>
                </defs>
            </svg>
            <div
                ref={containerRef}
                className={`relative overflow-hidden ${className}`}
                style={{
                    ...style,
                    clipPath: `url(#${clipId})`,
                    WebkitClipPath: `url(#${clipId})`,
                }}
            >
                {children}
            </div>
        </>
    );
}

/**
 * Reusable rounded button pill with directional arrow circle.
 */
function ArrowPillButton({
    href,
    label,
    variant = "white",
}: {
    href: string;
    label: string;
    variant?: "white" | "dark" | "grey" | "lime";
}) {
    const styles = {
        white: {
            container: "bg-white/15 hover:bg-white/25 text-white",
            circle: "bg-[#EAA945] text-[#0A2540]",
        },
        dark: {
            container: "bg-[#012A5F] hover:bg-[#0A2540] text-white",
            circle: "bg-[#EAA945] text-[#0A2540]",
        },
        grey: {
            container: "bg-[#0A2540]/10 hover:bg-[#0A2540]/20 text-[#0A2540]",
            circle: "bg-[#0A2540] text-white",
        },
        lime: {
            container: "bg-[#2E7D32] hover:bg-[#236327] text-white font-semibold shadow-sm",
            circle: "bg-white text-[#2E7D32]",
        },
    }[variant];

    return (
        <Link
            href={href}
            aria-label={label}
            className={`group/btn flex h-[58px] items-center justify-between gap-3 rounded-full pl-5 pr-2 transition-all duration-300 ${styles.container}`}
        >
            <span className="text-sm font-medium tracking-tight sm:text-[14px]">
                {label}
            </span>
            <span
                className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/btn:rotate-45 ${styles.circle}`}
            >
                <ArrowUpRight size={26} strokeWidth={2.4} />
            </span>
        </Link>
    );
}

export default function MainPageHero() {
    return (
        <section
            aria-labelledby="our-work-heading"
            className="relative w-full overflow-hidden bg-white px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8 lg:pt-10 lg:pb-14"
        >
            <div className="mx-auto max-w-[1360px]">

                {/* ========================================================= */}
                {/* 1. SECTION HEADING                                        */}
                {/* ========================================================= */}
                <header className="relative z-10 mx-auto mb-8 max-w-[740px] text-center sm:mb-10 lg:mb-12">
                    <h1
                        id="our-work-heading"
                        className="font-serif text-[28px] leading-[1.16] tracking-[-0.03em] text-[#0A2540] sm:text-[40px] lg:text-[46px]"
                    >
                        Building a Better Future Through
                        <br className="hidden sm:block" />
                        Education, Care &amp; Community
                    </h1>

                    <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-[1.65] text-[#43474F] sm:text-[15.5px]">
                        UniHope Foundation works towards creating meaningful
                        change through education, healthcare, community
                        development and support for children and families.
                        Together, we can build a more inclusive and hopeful future.
                    </p>
                </header>

                {/* ========================================================= */}
                {/* 2. MAIN 5-COLUMN BENTO GRID                               */}
                {/* ========================================================= */}
                <div className="relative z-10 grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.22fr_1fr_1fr] xl:gap-4">

                    {/* ----------------------------------------------------- */}
                    {/* COLUMN 1 (Top Left Tab + Bottom Pill)                 */}
                    {/* ----------------------------------------------------- */}
                    <div className="flex min-w-0 flex-col gap-3.5">

                        {/* Top Card: Mission Impact Image Card (Full Bleed) */}
                        <TabFrame
                            side="left"
                            initialHeight={340}
                            className="group h-[320px] sm:h-[340px] xl:h-[375px] w-full bg-[#0A2540] shadow-sm transition-transform duration-500 hover:-translate-y-1"
                        >
                            <Image
                                src={IMAGES.mission}
                                alt="Volunteer distributing treats to smiling community children"
                                fill
                                sizes="(max-width: 640px) 100vw, 20vw"
                                priority
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient overlay for readability and rich contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/70" />

                            <div className="relative z-10 flex h-full flex-col justify-between p-6 pt-5">
                                <div>
                                    <span className="font-serif text-[52px] font-bold leading-none tracking-tight text-white drop-shadow-md sm:text-[56px]">
                                        95%
                                    </span>

                                    <p className="mt-4 text-[13px] leading-[1.6] text-white/95 drop-shadow-sm sm:text-[13.5px]">
                                        Empowering children, supporting families and
                                        strengthening communities through verified,
                                        transparent social initiatives in Chennai.
                                    </p>
                                </div>

                                <div className="mt-auto pt-4">
                                    <ArrowPillButton
                                        href="/about"
                                        label="Learn More"
                                        variant="white"
                                    />
                                </div>
                            </div>
                        </TabFrame>

                        {/* Bottom Card: Spread the Love */}
                        <Link
                            href="/donate"
                            className="group flex h-[110px] sm:h-[120px] xl:h-[135px] items-center justify-center gap-3.5 rounded-[34px] bg-[#0A2540] px-6 text-white shadow-sm transition-all duration-300 hover:bg-[#012A5F] hover:shadow-md"
                        >
                            {/* Signature Smiley Icon */}
                            <svg
                                width="44"
                                height="44"
                                viewBox="0 0 44 44"
                                fill="none"
                                className="shrink-0 transition-transform duration-300 group-hover:scale-110"
                                aria-hidden="true"
                            >
                                <rect x="12" y="10" width="4" height="13" rx="2" fill="white" />
                                <rect x="28" y="10" width="4" height="13" rx="2" fill="white" />
                                <path
                                    d="M 9 26 C 14 36, 30 36, 35 26"
                                    stroke="white"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <span className="font-serif text-[21px] font-bold leading-[1.05] tracking-tight text-white">
                                SPREAD
                                <br />
                                THE LOVE
                            </span>
                        </Link>
                    </div>

                    {/* ----------------------------------------------------- */}
                    {/* COLUMN 2 (Image Card - Left Tab: Education)           */}
                    {/* ----------------------------------------------------- */}
                    <TabFrame
                        side="left"
                        initialHeight={365}
                        className="group h-[340px] sm:h-[365px] xl:h-[405px] w-full bg-[#0A2540] shadow-sm transition-transform duration-500 hover:-translate-y-1"
                    >
                        <Image
                            src={IMAGES.education}
                            alt="Children holding HOPE slates in village classroom"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                            priority
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Gradient shade at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Bottom Text Overlay */}
                        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                            <h3 className="font-serif text-[20px] font-bold leading-[1.25] tracking-tight text-white drop-shadow-md sm:text-[22px]">
                                Free maternal Education after child birth education
                            </h3>
                        </div>

                        <Link
                            href="/our-work"
                            aria-label="Free maternal Education after child birth education"
                            className="absolute inset-0 z-20"
                        />
                    </TabFrame>

                    {/* ----------------------------------------------------- */}
                    {/* COLUMN 3 (Center Pill Card: Join 1000+ Donate)        */}
                    {/* ----------------------------------------------------- */}
                    <div className="group relative flex h-[250px] sm:h-[265px] xl:h-[285px] w-full flex-col justify-between overflow-hidden rounded-[38px] bg-gradient-to-b from-[#FBFAF6] to-[#EDEAE0] p-6 shadow-sm transition-transform duration-500 hover:-translate-y-1 sm:p-7 border border-[#D9D3C5]">
                        {/* Subtle India Map Community Art Watermark */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 mix-blend-multiply transition-transform duration-700 group-hover:scale-105">
                            <Image
                                src={IMAGES.donate}
                                alt="India Community Support Map"
                                fill
                                sizes="(max-width: 640px) 100vw, 25vw"
                                className="object-contain p-3"
                            />
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
                            <h2 className="font-serif text-[30px] font-bold leading-[1.18] tracking-tight text-[#0A2540] sm:text-[34px]">
                                Join 1000+
                                <br />
                                People donate
                            </h2>
                        </div>

                        <div className="relative z-10">
                            <ArrowPillButton
                                href="/donate"
                                label="Join Community"
                                variant="grey"
                            />
                        </div>
                    </div>

                    {/* ----------------------------------------------------- */}
                    {/* COLUMN 4 (Image Card - Right Tab: Medication)         */}
                    {/* ----------------------------------------------------- */}
                    <TabFrame
                        side="right"
                        initialHeight={365}
                        className="group h-[340px] sm:h-[365px] xl:h-[405px] w-full bg-[#0A2540] shadow-sm transition-transform duration-500 hover:-translate-y-1"
                    >
                        <Image
                            src={IMAGES.healthcare}
                            alt="Pregnant woman holding medicine bottle representing maternal health support"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Gradient shade at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

                        {/* Bottom Text Overlay */}
                        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                            <h3 className="font-serif text-[20px] font-bold leading-[1.25] tracking-tight text-white drop-shadow-md sm:text-[22px]">
                                Sponsored Medication for over 1000+ women
                            </h3>
                        </div>

                        <Link
                            href="/our-work"
                            aria-label="Sponsored Medication for over 1000+ women"
                            className="absolute inset-0 z-20"
                        />
                    </TabFrame>

                    {/* ----------------------------------------------------- */}
                    {/* COLUMN 5 (Top Right Tab + Bottom Pill)                */}
                    {/* ----------------------------------------------------- */}
                    <div className="flex min-w-0 flex-col gap-3.5">

                        {/* Top Card: Gallery Image Card (Full Size / Full Bleed) */}
                        <TabFrame
                            side="right"
                            initialHeight={340}
                            className="group h-[320px] sm:h-[340px] xl:h-[375px] w-full bg-[#0A2540] shadow-sm transition-transform duration-500 hover:-translate-y-1"
                        >
                            <Image
                                src={IMAGES.gallery}
                                alt="Community volunteers joining hands in unity looking up towards the sky"
                                fill
                                sizes="(max-width: 640px) 100vw, 20vw"
                                priority
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Subtle edge-only gradient overlays so center photo stays clear */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/45" />

                            <div className="relative z-10 flex h-full flex-col justify-between p-5 pt-10 sm:p-6 sm:pt-11">
                                <Link href="/gallery" className="inline-block w-fit">
                                    <h2 className="font-serif text-[24px] font-bold leading-none tracking-tight text-white drop-shadow-md transition-colors hover:text-[#EAA945] sm:text-[28px]">
                                        Gallery
                                    </h2>
                                </Link>

                                <div className="pt-2">
                                    <ArrowPillButton
                                        href="/gallery"
                                        label="See all our moments"
                                        variant="lime"
                                    />
                                </div>
                            </div>
                        </TabFrame>

                        {/* Bottom Card: Home for Maternal Help */}
                        <Link
                            href="/our-work"
                            className="group flex h-[110px] sm:h-[120px] xl:h-[135px] items-center justify-center gap-3.5 rounded-[34px] bg-[#0A2540] px-6 text-white shadow-sm transition-all duration-300 hover:bg-[#2E7D32] hover:shadow-md"
                        >
                            <Heart
                                size={40}
                                strokeWidth={2.4}
                                className="shrink-0 text-[#EAA945] transition-transform duration-300 group-hover:scale-110"
                                fill="none"
                            />

                            <span className="font-serif text-[20px] font-bold leading-[1.05] tracking-tight text-[#EAA945]">
                                Home for
                                <br />
                                Maternal Help
                            </span>
                        </Link>
                    </div>

                </div>

                {/* ========================================================= */}
                {/* 3. BOTTOM CTA                                             */}
                {/* ========================================================= */}
                <div className="mt-8 flex justify-center sm:mt-10 lg:mt-12">
                    <Link
                        href="/donate"
                        className="group inline-flex items-center gap-3 rounded-full bg-[#0A2540] px-8 py-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#012A5F] hover:shadow-lg sm:text-[15px]"
                    >
                        <span>Support Our Mission</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAA945] text-[#0A2540] transition-transform duration-300 group-hover:rotate-45">
                            <ArrowUpRight size={18} strokeWidth={2.5} />
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
}


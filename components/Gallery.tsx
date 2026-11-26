"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ui/container-scroll-gallery";
import { TickerRibbon } from "@/components/TickerRibbon";
import { CircularGallery } from "./CircularGallery";

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  tag: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "01",
    src: "/gallery/gallery-01.jpg",
    alt: "UNIHOPE Foundation community outreach moments in Chennai",
    caption: "Community Outreach Drive",
    tag: "Chennai Outreach",
  },
  {
    id: "02",
    src: "/gallery/gallery-02.jpg",
    alt: "UNIHOPE volunteers and coordinators engaging with local families",
    caption: "Volunteer Field Engagement",
    tag: "Volunteers",
  },
  {
    id: "03",
    src: "/gallery/gallery-03.jpg",
    alt: "UNIHOPE Foundation educational and welfare support session",
    caption: "Learning & Welfare Support",
    tag: "Education",
  },
  {
    id: "04",
    src: "/gallery/gallery-04.jpg",
    alt: "UNIHOPE community gathering and distribution event",
    caption: "Community Distribution Drive",
    tag: "Community Care",
  },
  {
    id: "05",
    src: "/gallery/gallery-05.jpg",
    alt: "UNIHOPE Foundation coordinators serving underserved neighbourhoods",
    caption: "Grassroots Coordination",
    tag: "Field Work",
  },
  {
    id: "06",
    src: "/gallery/gallery-06.jpg",
    alt: "UNIHOPE youth and community empowerment initiative",
    caption: "Empowering Communities",
    tag: "Impact",
  },
  {
    id: "07",
    src: "/gallery/gallery-07.jpg",
    alt: "UNIHOPE Foundation medical and humanitarian aid activity",
    caption: "Health & Humanitarian Aid",
    tag: "Healthcare",
  },
  {
    id: "08",
    src: "/gallery/gallery-08.jpg",
    alt: "UNIHOPE volunteers collaborating on neighbourhood support",
    caption: "Together for Hope",
    tag: "Teamwork",
  },
  {
    id: "09",
    src: "/gallery/gallery-09.jpg",
    alt: "UNIHOPE Foundation children and family support program",
    caption: "Supporting Families & Youth",
    tag: "Welfare",
  },
  {
    id: "10",
    src: "/gallery/gallery-10.jpg",
    alt: "UNIHOPE Foundation Vadapalani community service milestone",
    caption: "Serving Across Tamil Nadu",
    tag: "Milestones",
  },
];

// Split into 3 columns for the 3D scroll showcase
const COL_1 = [GALLERY_PHOTOS[0], GALLERY_PHOTOS[3], GALLERY_PHOTOS[6], GALLERY_PHOTOS[9]];
const COL_2 = [GALLERY_PHOTOS[1], GALLERY_PHOTOS[4], GALLERY_PHOTOS[7]];
const COL_3 = [GALLERY_PHOTOS[2], GALLERY_PHOTOS[5], GALLERY_PHOTOS[8]];

export function Gallery() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const openLightbox = (photoId: string) => {
    const idx = GALLERY_PHOTOS.findIndex((p) => p.id === photoId);
    if (idx !== -1) setSelectedIdx(idx);
  };

  const closeLightbox = () => setSelectedIdx(null);

  const handlePrev = () => {
    setSelectedIdx((prev) =>
      prev === null ? null : prev === 0 ? GALLERY_PHOTOS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIdx((prev) =>
      prev === null ? null : prev === GALLERY_PHOTOS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFAF6] text-[#19181A]">
      {/* ========================================================= */}
      {/* 1. ANIMATED STAGGERED HEADER                              */}
      {/* ========================================================= */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12 lg:px-8">
        <ContainerStagger className="flex flex-col items-center text-center">
          <ContainerAnimated>
            <h1 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A2540] max-w-3xl leading-[1.1]">
              Stories of Hope, Care &amp; Community Action
            </h1>
          </ContainerAnimated>

          <ContainerAnimated>
            <p className="mt-4 max-w-2xl font-plusJakartaSans text-sm sm:text-base lg:text-lg text-[#43474F] leading-relaxed">
              Every photograph captures real moments from UNIHOPE Foundation&apos;s
              outreach drives, educational initiatives, healthcare camps, and
              volunteer efforts across Chennai and Tamil Nadu.
            </p>
          </ContainerAnimated>
        </ContainerStagger>
      </section>

      {/* ========================================================= */}
      {/* 2. 3D PERSPECTIVE SCROLL GALLERY                          */}
      {/* ========================================================= */}
      <section aria-label="3D Scroll Photo Showcase" className="w-full px-3 sm:px-6 lg:px-8">
        <ContainerScroll className="min-h-[160vh] sm:min-h-[190vh] mx-auto max-w-7xl">
          <ContainerSticky className="top-20 flex h-[78vh] sm:h-[85vh] items-center justify-center rounded-3xl bg-[#0A2540] p-2.5 sm:p-4 shadow-2xl">
            <GalleryContainer className="gap-2.5 sm:gap-4">
              {/* Column 1 */}
              <GalleryCol yRange={["0%", "-18%"]} className="gap-2.5 sm:gap-4">
                {COL_1.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openLightbox(photo.id)}
                    className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#012A5F] cursor-pointer text-left"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 380px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                ))}
              </GalleryCol>

              {/* Column 2 */}
              <GalleryCol yRange={["-10%", "8%"]} className="gap-2.5 sm:gap-4">
                {COL_2.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openLightbox(photo.id)}
                    className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#012A5F] cursor-pointer text-left"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 380px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                ))}
              </GalleryCol>

              {/* Column 3 */}
              <GalleryCol yRange={["0%", "-14%"]} className="gap-2.5 sm:gap-4">
                {COL_3.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openLightbox(photo.id)}
                    className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#012A5F] cursor-pointer text-left"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 380px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                ))}
              </GalleryCol>
            </GalleryContainer>
          </ContainerSticky>
        </ContainerScroll>
      </section>

      <TickerRibbon />

      {/* ========================================================= */}
      {/* 3. FEATURED REELS & MOTION GALLERY (CircularGallery)      */}
      {/* ========================================================= */}
      <CircularGallery />

      {/* ========================================================= */}
      {/* 4. FULL PHOTO ARCHIVE GRID (CLICK TO ZOOM)                */}
      {/* ========================================================= */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#2E7D32]">
              Field Archive
            </span>
            <h2 className="mt-2 font-outfit text-2xl sm:text-4xl font-bold tracking-tight text-[#0A2540]">
              All Captured Moments
            </h2>
          </div>
          <p className="text-sm text-[#43474F] max-w-md">
            Click any photograph to view it full-screen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className="group relative overflow-hidden rounded-2xl border border-[#D9D3C5] bg-white text-left shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A2540]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#0A2540]/85 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EAA945]">
                  {photo.tag}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-outfit text-base font-semibold text-[#0A2540]">
                  {photo.caption}
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#2E7D32] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRE-FOOTER CTA                                         */}
      {/* ========================================================= */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#0A2540] p-8 sm:p-14 text-center text-white shadow-xl">
          <h2 className="font-outfit text-2xl sm:text-4xl font-bold">
            Be part of the next chapter
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Join UNIHOPE Foundation as a volunteer or supporter and help create
            more moments of dignity and hope across Chennai.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#EAA945] px-8 py-3.5 text-sm font-bold text-[#0A2540] shadow-md transition hover:bg-[#dc9b36]"
            >
              Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0A2540]"
            >
              Become a Volunteer
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. LIGHTBOX MODAL                                         */}
      {/* ========================================================= */}
      {selectedIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={GALLERY_PHOTOS[selectedIdx].caption}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close gallery preview"
            className="absolute top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[82vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[#0A2540]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[65vh] sm:h-[75vh] w-full">
              <Image
                src={GALLERY_PHOTOS[selectedIdx].src}
                alt={GALLERY_PHOTOS[selectedIdx].alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between bg-[#0A2540] px-5 py-3.5 text-white border-t border-white/10">
              <div>
                <p className="font-outfit text-base font-semibold">
                  {GALLERY_PHOTOS[selectedIdx].caption}
                </p>
                <p className="text-xs text-[#EAA945]">
                  {GALLERY_PHOTOS[selectedIdx].tag}
                </p>
              </div>
              <span className="text-xs text-white/70">
                {selectedIdx + 1} / {GALLERY_PHOTOS.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Gallery;

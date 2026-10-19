"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** 0 reveals as soon as the element touches the viewport, which also works for very tall elements. */
  threshold?: number;
  rootMargin?: string;
  /** Reveal once and stop observing (default). */
  once?: boolean;
};

export function useInView<T extends Element = HTMLElement>({
  threshold = 0,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Tells the CSS that scripts are running, which switches off the 3 second failsafe.
    document.documentElement.dataset.motion = "ready";

    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setInView(true); // never leave content hidden
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

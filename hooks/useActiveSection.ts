"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section nearest the top of the viewport.
 * Use it for the Privacy Policy and Terms "On this page" list.
 */
export function useActiveSection(ids: string[], rootMargin = "-20% 0px -65% 0px") {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const idsKey = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const elements = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visibleTops = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleTops.set(entry.target.id, entry.boundingClientRect.top);
          else visibleTops.delete(entry.target.id);
        }
        if (visibleTops.size > 0) {
          const [nearest] = [...visibleTops.entries()].sort((a, b) => a[1] - b[1]);
          setActive(nearest[0]);
        }
      },
      { rootMargin, threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey, rootMargin]);

  return active;
}

"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type RevealProps = {
  children: ReactNode;
  /** Element to render, for example "section", "li", "h2". Default "div". */
  as?: ElementType;
  className?: string;
  /** Delay in milliseconds, for example 100 for the second item in a pair. */
  delay?: number;
  /** "up" fades and rises 16px. "fade" only fades (use for forms and large panels). */
  variant?: "up" | "fade";
};

export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  const classes = ["reveal", variant === "fade" ? "reveal-fade" : "", inView ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={classes} style={style}>
      {children}
    </Tag>
  );
}

"use client";

import { Children, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type RevealGroupProps = {
  children: ReactNode;
  /** The grid or list element. Put your grid classes here. */
  as?: ElementType;
  /** Wrapper around each child. Use "li" when `as` is "ul" or "ol". */
  itemAs?: ElementType;
  className?: string;
  /** Classes for each wrapper. Add "h-full" so cards fill equal-height grid cells. */
  itemClassName?: string;
  /** Delay between items in milliseconds. */
  step?: number;
  /** The delay stops growing after this many items, so long lists never feel slow. */
  maxSteps?: number;
};

/**
 * Staggered reveal. One observer watches the group. Each child is wrapped, so a card's own
 * hover transform and transition are never overridden.
 */
export function RevealGroup({
  children,
  as: Tag = "div",
  itemAs: Item = "div",
  className = "",
  itemClassName = "",
  step = 60,
  maxSteps = 7,
}: RevealGroupProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag ref={ref} className={["reveal-group", inView ? "is-visible" : "", className].filter(Boolean).join(" ")}>
      {Children.toArray(children).map((child, index) => (
        <Item
          key={index}
          className={["reveal-item", itemClassName].filter(Boolean).join(" ")}
          style={{ "--reveal-delay": `${Math.min(index, maxSteps) * step}ms` } as CSSProperties}
        >
          {child}
        </Item>
      ))}
    </Tag>
  );
}

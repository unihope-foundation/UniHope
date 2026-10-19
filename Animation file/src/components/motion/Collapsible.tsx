import type { ReactNode } from "react";

type CollapsibleProps = {
  open: boolean;
  /** Same id that your trigger button uses in aria-controls. */
  id?: string;
  /** Id of the trigger button. Adds role="region" for screen readers. */
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Smooth height animation for an accordion panel. It does not render the trigger.
 * Keep your existing button with aria-expanded and aria-controls, and wrap only the panel content:
 *
 *   <Collapsible open={isOpen} id={panelId} labelledBy={buttonId}>
 *     <div className="px-5 pb-5">...</div>   // padding goes on this inner div, not on Collapsible
 *   </Collapsible>
 */
export function Collapsible({ open, id, labelledBy, className = "", children }: CollapsibleProps) {
  return (
    <div
      id={id}
      role={labelledBy ? "region" : undefined}
      aria-labelledby={labelledBy}
      data-open={open}
      className={["collapsible", className].filter(Boolean).join(" ")}
    >
      <div className="collapsible-inner">{children}</div>
    </div>
  );
}

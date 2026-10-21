"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/content/donate";

export function DonateFaq({ items }: { items: readonly FaqItem[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto flex w-full max-w-[840px] flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-button-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={item.question}
            className={`rounded-xl border bg-white transition-colors duration-150 motion-reduce:transition-none ${
              isOpen ? "border-[#012A5F]" : "border-[#D6D6D6]"
            }`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012A5F]"
              >
                <span className="text-base font-semibold leading-6 text-[#012A5F]">
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-5 shrink-0 text-[#012A5F] transition-transform duration-300 motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div
                className={`min-h-0 overflow-hidden transition-[visibility] duration-0 ${
                  isOpen ? "visible delay-0" : "invisible delay-300"
                }`}
              >
                <p className="px-5 pb-5 text-[15px] leading-6 text-[#3D3D3D]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

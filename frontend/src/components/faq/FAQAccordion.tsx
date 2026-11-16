'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS, FAQ_TITLE, FAQItem } from '@/data/faqs';

interface FAQAccordionProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  showHeading?: boolean;
  className?: string;
  defaultOpenId?: string | null;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items = FAQS,
  title = FAQ_TITLE,
  subtitle,
  showHeading = true,
  className = '',
  defaultOpenId = null,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    if (defaultOpenId) {
      return { [defaultOpenId]: true };
    }
    return {};
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={`w-full ${className}`}>
      {showHeading && (
        <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black font-medium font-primary mb-2">
            HELP &amp; ASSISTANCE
          </p>
          <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-normal text-black tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="font-secondary text-xs sm:text-sm text-[#333333] mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-line/70 divide-y divide-line/70">
        {items.map((item, idx) => {
          const isOpen = !!openIds[item.id];
          const numStr = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={item.id}
              className="group transition-colors duration-200 hover:bg-[#faf9f6]/80 -mx-2 sm:-mx-4 px-2 sm:px-4"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full py-4 sm:py-5 flex items-center justify-between text-left gap-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="font-primary text-[11px] sm:text-xs text-black font-medium tracking-[0.16em] shrink-0">
                    {numStr}
                  </span>
                  <span className="font-primary text-[15px] sm:text-[17px] lg:text-[18px] font-medium text-black tracking-tight group-hover:text-black transition-colors">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#333333]/60 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-black' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${item.id}`}
                  className="pb-5 pl-7 sm:pl-9 pr-4 sm:pr-8 space-y-3.5 animate-in fade-in duration-200"
                >
                  <p className="font-secondary text-[13px] sm:text-[14px] text-[#333333] leading-[1.7]">
                    {item.answer}
                  </p>
                  <div>
                    <Link
                      href={item.actionHref}
                      className="group/link inline-flex items-center gap-1.5 text-xs font-primary font-medium uppercase tracking-[0.15em] text-black hover:text-black underline underline-offset-4 transition-colors"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

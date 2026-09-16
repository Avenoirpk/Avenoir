"use client";

import React, { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: "Kitne din mein delivery hoti hai?",
    answer:
      "Har order 4 se 8 working days mein deliver hota hai, aur aap apna order day-by-day track kar sakte hain.",
  },
  {
    question: "Shipping charges kitne hain?",
    answer: "Har order pe shipping bilkul free hai — koi extra charge nahi.",
  },
  {
    question: "Agar product pasand na aaye to return ho sakta hai?",
    answer: "Ji haan, easy return aur refund policy hai — koi sawal nahi poocha jayega.",
  },
  {
    question: "Payment kaise karni hai?",
    answer:
      "Abhi ke liye payment Venmo ke zariye manual transfer se hoti hai. Checkout ke waqt payment screenshot upload karna zaroori hai, jis ke baad hi order confirm hota hai.",
  },
];

export default function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Frequently Asked Questions",
}: {
  items?: FaqItem[];
  title?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-6 md:px-12 py-20">
      <h2 className="font-display text-3xl text-navy mb-10 text-center" data-aos="fade-up">
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-navy/10 bg-white/60 overflow-hidden"
              data-aos="fade-up"
              data-aos-delay={index * 60}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(isActive ? null : index)}
                aria-expanded={isActive}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium text-navy">{item.question}</span>
                <span
                  className={`shrink-0 text-xl text-gold transition-transform duration-300 ${
                    isActive ? "rotate-45" : "rotate-0"
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm text-navy/60 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

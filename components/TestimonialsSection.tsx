"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: "Ayesha K.",
    location: "Lahore",
    rating: 5,
    text: "Bag ki quality bohat achi thi, delivery bhi time pe aa gayi. Bilkul photos jaisa product mila.",
  },
  {
    name: "Bilal R.",
    location: "Karachi",
    rating: 5,
    text: "Shoes order ki thi, comfortable aur stylish dono. Free shipping ka bhi faida mila.",
  },
  {
    name: "Sana M.",
    location: "Islamabad",
    rating: 4,
    text: "Return process bohat easy tha jab size change karwana pada. Support responsive hai.",
  },
];

export default function TestimonialsSection({
  items = DEFAULT_TESTIMONIALS,
}: {
  items?: Testimonial[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [items.length]);

  const active = items[index];

  return (
    <section className="border-y border-navy/10 bg-white/40">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 text-center">
        <p className="uppercase tracking-[0.2em] text-xs text-gold mb-4">What Our Customers Say</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < active.rating ? "fill-gold text-gold" : "text-navy/20"}
                />
              ))}
            </div>

            <p className="font-display text-xl md:text-2xl text-navy leading-relaxed mb-6">
              &ldquo;{active.text}&rdquo;
            </p>

            <p className="text-sm font-semibold text-navy">{active.name}</p>
            <p className="text-xs text-navy/50">{active.location}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-gold" : "w-1.5 bg-navy/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

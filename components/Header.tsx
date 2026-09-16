"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/products";

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-[73px] bg-cream/95 backdrop-blur-md border-b border-navy/10">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12">

        {/* AVENOIR LOGO */}
        <Link
          href="/"
          aria-label="Avenoir Home"
          className="flex h-10 min-w-[150px] items-center"
        >
          <span className="font-display text-2xl leading-none tracking-[0.22em] text-navy">
            AVENOIR
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="group relative whitespace-nowrap pb-1 text-sm font-medium text-navy/80 transition-colors duration-200 hover:text-gold"
            >
              {category}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex min-w-[150px] items-center justify-end gap-5 text-navy">
          <Link
            href="/account"
            className="hidden text-sm transition-colors duration-200 hover:text-gold sm:block"
          >
            Account
          </Link>

          <Link
            href="/login"
            className="hidden text-sm transition-colors duration-200 hover:text-gold sm:block"
          >
            Login
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            className="relative text-sm transition-colors duration-200 hover:text-gold"
          >
            Cart

            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1.4, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-IN DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 top-[73px] z-40 bg-black/30 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-[73px] z-50 flex h-[calc(100%-73px)] w-72 flex-col gap-1 bg-cream p-6 shadow-2xl md:hidden"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="mb-4 self-end text-navy/50"
              >
                <X size={20} />
              </button>

              {categories.map((category, i) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(category)}`}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-navy/10 py-3 text-sm font-medium text-navy/80"
                  >
                    {category}
                  </Link>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 flex flex-col gap-3">
                <Link href="/account" onClick={() => setMenuOpen(false)} className="text-sm text-navy/70">Account</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-navy/70">Login</Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

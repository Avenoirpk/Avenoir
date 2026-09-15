"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/products";

export default function Header() {
  const { count } = useCart();

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
              className="whitespace-nowrap border-b-2 border-transparent pb-1 text-sm font-medium text-navy/80 transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              {category}
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
            className="text-sm transition-colors duration-200 hover:text-gold"
          >
            Login
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            className="relative text-sm transition-colors duration-200 hover:text-gold"
          >
            Cart

            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

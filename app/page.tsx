import Link from "next/link";
import Image from "next/image";
import { bestSellers, categories, products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ShimmerButton from "@/components/ShimmerButton";
import NumberTicker from "@/components/NumberTicker";
import HeroSwiper from "@/components/HeroSwiper";
import BestSellerSwiper from "@/components/BestSellerSwiper";
import AnimatedHeading from "@/components/AnimatedHeading";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqAccordion from "@/components/FaqAccordion";

const categoryImage = (cat: string) => products.find((p) => p.category === cat)?.image ?? "";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div data-aos="fade-right">
          <p className="uppercase tracking-[0.2em] text-xs text-gold mb-4">New Season Edit</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight text-navy mb-6">
            <AnimatedHeading>Considered pieces,</AnimatedHeading>
            <br />
            <AnimatedHeading delay={0.35}>worn every day.</AnimatedHeading>
          </h1>
          <p className="text-navy/60 max-w-md mb-8">
            Bags, shoes, jewelry and more — designed with quiet detail and made to outlast trends.
          </p>
          <div className="flex gap-4">
            <Link href="/shop"><ShimmerButton>Shop the Edit</ShimmerButton></Link>
            <Link href="/shop"><ShimmerButton variant="outline">Best Sellers</ShimmerButton></Link>
          </div>
        </div>
        <div data-aos="fade-left">
          <HeroSwiper />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-navy/10 bg-white/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-display text-3xl text-navy"><NumberTicker value={12000} suffix="+" /></div>
            <p className="text-xs text-navy/50 mt-1 uppercase tracking-wide">Happy Customers</p>
          </div>
          <div>
            <div className="font-display text-3xl text-navy"><NumberTicker value={4} suffix="–8 days" /></div>
            <p className="text-xs text-navy/50 mt-1 uppercase tracking-wide">Delivery Time</p>
          </div>
          <div>
            <div className="font-display text-3xl text-navy"><NumberTicker value={100} suffix="% Free" /></div>
            <p className="text-xs text-navy/50 mt-1 uppercase tracking-wide">Shipping</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <h2 className="font-display text-3xl text-navy mb-10" data-aos="fade-up">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="group relative overflow-hidden rounded-3xl aspect-square"
              data-aos="fade-up"
              data-aos-delay={i * 60}
            >
              <Image
                src={categoryImage(cat)}
                alt={cat}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-navy/30 group-hover:bg-navy/50 transition-colors" />
              <span className="absolute bottom-4 left-4 text-cream font-display text-xl">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between mb-10" data-aos="fade-up">
          <h2 className="font-display text-3xl text-navy">Best Sellers</h2>
          <Link href="/shop" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <BestSellerSwiper products={bestSellers} />
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-3 gap-8" data-aos="fade-up">
        <div className="bg-white/60 rounded-3xl p-8 text-center">
          <p className="text-2xl mb-2">🚚</p>
          <h3 className="font-semibold text-navy mb-1">Free Shipping</h3>
          <p className="text-sm text-navy/50">On every single order, nationwide.</p>
        </div>
        <div className="bg-white/60 rounded-3xl p-8 text-center">
          <p className="text-2xl mb-2">↩️</p>
          <h3 className="font-semibold text-navy mb-1">Easy Returns</h3>
          <p className="text-sm text-navy/50">Hassle-free returns and refunds.</p>
        </div>
        <div className="bg-white/60 rounded-3xl p-8 text-center">
          <p className="text-2xl mb-2">📦</p>
          <h3 className="font-semibold text-navy mb-1">Tracked Delivery</h3>
          <p className="text-sm text-navy/50">Day-by-day updates, 4–8 working days.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* FAQ */}
      <FaqAccordion />
    </>
  );
}

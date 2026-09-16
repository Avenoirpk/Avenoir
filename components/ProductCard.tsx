"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const secondImage = product.images?.find((src) => src !== product.image);

  useEffect(() => {
    checkWishlist();
  }, [product.id]);

  async function checkWishlist() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsWishlisted(false);
        return;
      }

      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", String(product.id))
        .maybeSingle();

      if (error) {
        console.error("Wishlist check error:", error);
        return;
      }

      setIsWishlisted(Boolean(data));
    } catch (error) {
      console.error("Wishlist check error:", error);
    }
  }

  async function toggleWishlist(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/login?redirect=/shop`;
        return;
      }

      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", String(product.id));

        if (error) {
          console.error("Wishlist remove error:", error);
          alert("Could not remove this product from wishlist.");
          return;
        }

        setIsWishlisted(false);
        return;
      }

      const { error } = await supabase
        .from("wishlists")
        .insert({
          user_id: user.id,
          product_id: String(product.id),
        });

      if (error) {
        console.error("Wishlist add error:", error);

        if (
          error.code === "23505" ||
          error.message?.toLowerCase().includes("duplicate")
        ) {
          setIsWishlisted(true);
          return;
        }

        alert("Could not add this product to wishlist.");
        return;
      }

      setIsWishlisted(true);
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Wishlist update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.article
      className="group relative block"
      data-aos="fade-up"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* PRODUCT IMAGE */}
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={false}
              className={`object-cover transition-[transform,opacity] duration-[600ms] ease-out group-hover:scale-110 ${
                secondImage && isHovered ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                className={`object-cover scale-110 transition-opacity duration-500 ease-out ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            )}

            {product.bestSeller && (
              <span className="absolute left-3 top-3 rounded-full bg-[#d4af37] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black shadow-sm">
                Best Seller
              </span>
            )}

            <AnimatePresence>
              {isHovered && (
                <motion.button
                  type="button"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/product/${product.id}`;
                  }}
                  className="absolute bottom-3 left-3 right-3 z-40 hidden items-center justify-center gap-2 rounded-full bg-navy py-2.5 text-xs font-semibold uppercase tracking-wide text-cream shadow-lg md:flex"
                >
                  <ShoppingBag size={15} strokeWidth={1.8} />
                  Add to Cart
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <motion.button
          type="button"
          onClick={toggleWishlist}
          disabled={loading}
          whileTap={{ scale: 0.8 }}
          animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`
            absolute right-3 top-3 z-50
            flex h-12 w-12 items-center justify-center
            rounded-full
            border border-black/10
            shadow-xl
            transition-colors duration-200
            hover:scale-110
            disabled:cursor-not-allowed
            disabled:opacity-60
            ${
              isWishlisted
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-black hover:text-white"
            }
          `}
        >
          <Heart
            size={23}
            strokeWidth={1.8}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-black"
            }
          />
        </motion.button>
      </div>

      {/* PRODUCT INFORMATION */}
      <Link
        href={`/product/${product.id}`}
        className="block"
      >
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.15em] text-black/45">
            {product.category}
          </p>

          <h3 className="mt-1 font-medium text-black">
            {product.name}
          </h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold text-black">
              Rs {product.price.toLocaleString()}
            </span>

            {product.oldPrice && (
              <span className="text-xs text-black/40 line-through">
                Rs {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

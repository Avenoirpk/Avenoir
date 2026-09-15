"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check whether this product is already in the user's wishlist
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

      // User is not logged in
      if (!user) {
        window.location.href = `/login?redirect=/shop`;
        return;
      }

      // Remove from wishlist
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

      // Add to wishlist
      const { error } = await supabase
        .from("wishlists")
        .insert({
          user_id: user.id,
          product_id: String(product.id),
        });

      if (error) {
        console.error("Wishlist add error:", error);

        // Duplicate wishlist protection
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
    <article
      className="group relative block"
      data-aos="fade-up"
    >
      {/* PRODUCT IMAGE */}
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={false}
              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* BEST SELLER */}
            {product.bestSeller && (
              <span className="absolute left-3 top-3 rounded-full bg-[#d4af37] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black shadow-sm">
                Best Seller
              </span>
            )}
          </div>
        </Link>

        {/* WISHLIST HEART */}
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={loading}
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
            transition-all duration-200
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
        </button>
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
    </article>
  );
}

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

  useEffect(() => {
    let mounted = true;

    async function loadWishlistStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", String(product.id))
        .maybeSingle();

      if (!error && mounted) {
        setIsWishlisted(Boolean(data));
      }
    }

    loadWishlistStatus();

    return () => {
      mounted = false;
    };
  }, [product.id]);

  async function toggleWishlist(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/login?redirect=/product/${product.id}`;
      return;
    }

    setLoading(true);

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", String(product.id));

        if (error) {
          console.error("Wishlist delete error:", error);
          alert(error.message);
          return;
        }

        setIsWishlisted(false);
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({
            user_id: user.id,
            product_id: String(product.id),
          });

        if (error) {
          console.error("Wishlist insert error:", error);
          alert(error.message);
          return;
        }

        setIsWishlisted(true);
      }
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
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {product.bestSeller && (
              <span className="absolute left-3 top-3 rounded-full bg-[#d4af37] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                Best Seller
              </span>
            )}
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={loading}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-lg transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart
            size={21}
            strokeWidth={1.8}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-black"
            }
          />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="block">
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

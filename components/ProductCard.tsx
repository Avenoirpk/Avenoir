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
    checkWishlist();
  }, [product.id]);

  async function checkWishlist() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", String(product.id))
        .maybeSingle();

      setIsWishlisted(!!data);
    } catch (error) {
      console.error("Wishlist check error:", error);
    }
  }

  async function toggleWishlist(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
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
          alert(error.message);
          return;
        }

        setIsWishlisted(false);
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: String(product.id),
        });

        if (error) {
          console.error("Wishlist add error:", error);
          alert(error.message);
          return;
        }

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      alert("Wishlist update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group block" data-aos="fade-up">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative overflow-hidden rounded-3xl bg-white/60 aspect-[4/5]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.12]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            {product.bestSeller && (
              <span className="absolute top-3 left-3 bg-gold text-navy text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                Best Seller
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={loading}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition disabled:opacity-60"
        >
          <Heart
            size={18}
            strokeWidth={1.7}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-navy"
            }
          />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="block">
        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-navy/50">
            {product.category}
          </p>

          <h3 className="font-medium text-navy">{product.name}</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-navy">
              Rs {product.price.toLocaleString()}
            </span>

            {product.oldPrice && (
              <span className="text-xs text-navy/40 line-through">
                Rs {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

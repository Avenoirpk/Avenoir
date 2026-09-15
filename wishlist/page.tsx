"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { products, Product } from "@/lib/products";

type WishlistRow = {
  id: string;
  product_id: string;
};

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserEmail(null);
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("wishlists")
      .select("id, product_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist load error:", error);
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    const rows = (data || []) as WishlistRow[];

    const matchedProducts = rows
      .map((row) =>
        products.find(
          (product) => String(product.id) === String(row.product_id)
        )
      )
      .filter(Boolean) as Product[];

    setWishlistProducts(matchedProducts);
    setLoading(false);
  }

  async function removeFromWishlist(productId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Remove wishlist error:", error);
      return;
    }

    setWishlistProducts((current) =>
      current.filter((product) => String(product.id) !== productId)
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm tracking-[0.2em] text-black/50">
            LOADING WISHLIST...
          </p>
        </div>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-6 py-32">
        <div className="mx-auto max-w-xl text-center">
          <Heart className="mx-auto mb-6 h-12 w-12 stroke-[1]" />

          <h1 className="text-4xl font-light tracking-tight">
            Your Wishlist
          </h1>

          <p className="mt-4 text-black/60">
            Please sign in to view and save your favorite pieces.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-3 bg-black px-7 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-black/80"
          >
            SIGN IN
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-8">
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-black/50">
              AVENOIR COLLECTION
            </p>

            <h1 className="text-5xl font-light tracking-tight">
              Your Wishlist
            </h1>
          </div>

          <p className="text-sm text-black/50">
            {wishlistProducts.length}{" "}
            {wishlistProducts.length === 1 ? "item" : "items"}
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="py-24 text-center">
            <Heart className="mx-auto mb-6 h-14 w-14 stroke-[1]" />

            <h2 className="text-2xl font-light">Your wishlist is empty</h2>

            <p className="mt-3 text-black/55">
              Save pieces you love and find them here anytime.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-black px-7 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-black/80"
            >
              EXPLORE COLLECTION
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(String(product.id))}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur transition hover:bg-black hover:text-white"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                    {product.category}
                  </p>

                  <Link href={`/product/${product.id}`}>
                    <h3 className="mt-2 text-sm font-medium">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-sm text-black/65">
                    ${product.price.toFixed(2)}
                  </p>

                  <Link
                    href={`/product/${product.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-black underline underline-offset-4"
                  >
                    VIEW PRODUCT
                    <ShoppingBag size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

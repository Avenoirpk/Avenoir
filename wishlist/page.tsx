"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type WishlistItem = {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    image_url?: string;
    images?: string[];
  } | null;
};

export default function WishlistPage() {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("wishlists")
        .select(
          `
          id,
          product_id,
          products (
            id,
            name,
            slug,
            price,
            image_url,
            images
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Wishlist loading error:", error);
        setMessage("Unable to load wishlist.");
        return;
      }

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.products,
      }));

      setItems(formatted);
    } catch (error) {
      console.error("Wishlist error:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(item: WishlistItem) {
    try {
      setRemoving(item.product_id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", item.product_id);

      if (error) {
        alert(error.message);
        return;
      }

      setItems((current) =>
        current.filter((wishlistItem) => wishlistItem.product_id !== item.product_id)
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);
      alert("Unable to remove item.");
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-black/10 rounded-xl" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-4">
                <div className="aspect-[4/5] bg-black/10 rounded-2xl" />
                <div className="h-5 bg-black/10 rounded" />
                <div className="h-4 w-20 bg-black/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-14">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
            Your Selection
          </p>

          <h1 className="font-display text-4xl md:text-5xl text-navy">
            Wishlist
          </h1>

          <p className="text-navy/55 mt-2">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <Link
          href="/shop"
          className="text-sm text-navy/60 hover:text-gold underline transition"
        >
          Continue Shopping
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white/60 border border-black/5 rounded-3xl">
          <h2 className="font-display text-3xl text-navy mb-3">
            Your wishlist is empty
          </h2>

          <p className="text-navy/55 mb-7">
            Save your favorite pieces here for later.
          </p>

          <Link
            href="/shop"
            className="inline-flex rounded-full bg-navy text-white px-7 py-3 text-sm hover:bg-navy/90 transition"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;

            if (!product) return null;

            const image =
              product.image_url ||
              product.images?.[0] ||
              "/placeholder.jpg";

            const productLink = product.slug
              ? `/product/${product.slug}`
              : `/product/${product.id}`;

            return (
              <div key={item.id} className="group">
                <Link href={productLink} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5 mb-4">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    />
                  </div>

                  <h3 className="text-sm font-medium text-navy group-hover:text-gold transition">
                    {product.name}
                  </h3>

                  <p className="text-sm text-navy/60 mt-1">
                    ${Number(product.price || 0).toFixed(2)}
                  </p>
                </Link>

                <button
                  onClick={() => removeItem(item)}
                  disabled={removing === item.product_id}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
                >
                  {removing === item.product_id
                    ? "Removing..."
                    : "Remove from Wishlist"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

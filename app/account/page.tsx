"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ShimmerButton from "@/components/ShimmerButton";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

type Order = {
  id: string;
  status: string;
  total_amount?: number;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setOrders([]);
        router.replace("/login");
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            null,
          phone: session.user.phone || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function loadAccount() {
    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login");
        return;
      }

      const authUser = session.user;

      let profileData: UserProfile | null = null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      profileData = profile;

      setUser({
        id: authUser.id,
        email: profileData?.email || authUser.email,
        full_name:
          profileData?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          null,
        phone: profileData?.phone || authUser.phone || null,
        avatar_url:
          profileData?.avatar_url ||
          authUser.user_metadata?.avatar_url ||
          null,
      });

      const { data: orderData } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      setOrders(orderData || []);
    } catch (error) {
      console.error("Account loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(error.message);
        return;
      }

      localStorage.removeItem("avenoir_user");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-56 bg-black/10 rounded-xl" />
          <div className="h-5 w-72 bg-black/10 rounded-xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-32 bg-black/10 rounded-3xl" />
            <div className="h-32 bg-black/10 rounded-3xl" />
            <div className="h-32 bg-black/10 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-navy mb-4">
          You&apos;re not logged in
        </h1>

        <p className="text-navy/60 mb-8">
          Please log in to view your account.
        </p>

        <Link href="/login">
          <ShimmerButton>Go to Login</ShimmerButton>
        </Link>
      </div>
    );
  }

  const displayName =
    user.full_name || user.email?.split("@")[0] || "Avenoir Customer";

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-14">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10"
        data-aos="fade-up"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
            Welcome back
          </p>

          <h1 className="font-display text-4xl md:text-5xl text-navy">
            My Account
          </h1>

          <p className="text-navy/55 mt-2">
            {displayName}
            {user.email ? ` · ${user.email}` : ""}
          </p>
        </div>

        <button
          onClick={logout}
          disabled={loggingOut}
          className="border border-navy/15 rounded-full px-6 py-3 text-sm text-navy hover:bg-navy hover:text-white transition disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/70 border border-black/5 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-navy/45 mb-2">
            Orders
          </p>
          <p className="text-3xl font-display text-navy">{orders.length}</p>
        </div>

        <div className="bg-white/70 border border-black/5 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-navy/45 mb-2">
            Wishlist
          </p>
          <p className="text-3xl font-display text-navy">0</p>
        </div>

        <div className="bg-white/70 border border-black/5 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-navy/45 mb-2">
            Account Status
          </p>
          <p className="text-lg font-semibold text-green-700">Active</p>
        </div>
      </div>

      <div className="bg-white/60 border border-black/5 rounded-3xl p-6 md:p-8 mb-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl text-navy">
              Personal Information
            </h2>
            <p className="text-sm text-navy/50 mt-1">
              Your registered account details
            </p>
          </div>

          <Link
            href="/account/profile"
            className="text-sm underline text-navy hover:text-gold transition"
          >
            Edit Profile
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-navy/40 mb-1">
              Name
            </p>
            <p className="text-navy">
              {user.full_name || "Not added yet"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-navy/40 mb-1">
              Email
            </p>
            <p className="text-navy break-all">
              {user.email || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-navy/40 mb-1">
              Phone
            </p>
            <p className="text-navy">
              {user.phone || "Not added yet"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-navy/40 mb-1">
              Customer ID
            </p>
            <p className="text-xs text-navy/60 break-all">{user.id}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl text-navy">
              Order History
            </h2>
            <p className="text-sm text-navy/50 mt-1">
              Your recent Avenoir orders
            </p>
          </div>

          <Link
            href="/shop"
            className="text-sm underline text-navy hover:text-gold transition"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/60 border border-black/5 rounded-3xl p-8 text-center">
            <p className="text-navy/55 mb-5">
              No orders yet. Your purchases will appear here.
            </p>

            <Link href="/shop">
              <ShimmerButton>Start Shopping</ShimmerButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/track?order=${order.id}`}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 border border-black/5 rounded-2xl p-5 hover:bg-white transition"
              >
                <div>
                  <p className="font-medium text-navy break-all">
                    Order #{order.id}
                  </p>

                  <p className="text-xs text-navy/50 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  {typeof order.total_amount === "number" && (
                    <span className="text-sm text-navy/65">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  )}

                  <span className="text-sm capitalize text-gold">
                    {order.status || "Pending"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

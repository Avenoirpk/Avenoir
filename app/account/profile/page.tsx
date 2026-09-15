"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShimmerButton from "@/components/ShimmerButton";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      setFullName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );

      setPhone(profile?.phone || user.phone || "");
    } catch (err) {
      console.error("Profile loading error:", err);
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        throw profileError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
        },
      });

      if (authError) {
        console.warn("Auth metadata update warning:", authError.message);
      }

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 900);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setError(err?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-64 bg-black/10 rounded-xl" />
          <div className="h-16 bg-black/10 rounded-2xl" />
          <div className="h-16 bg-black/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-14">
      <Link
        href="/account"
        className="text-sm text-navy/55 hover:text-gold transition"
      >
        ← Back to Account
      </Link>

      <div className="mt-8 mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
          Account Settings
        </p>

        <h1 className="font-display text-4xl md:text-5xl text-navy">
          Edit Profile
        </h1>

        <p className="text-navy/55 mt-2">
          Keep your personal information up to date.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="bg-white/70 border border-black/5 rounded-3xl p-6 md:p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-navy/50 cursor-not-allowed"
          />

          <p className="text-xs text-navy/40 mt-2">
            Email cannot be changed from this page.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-navy outline-none focus:border-gold transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+92 300 1234567"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-navy outline-none focus:border-gold transition"
          />
        </div>

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-navy text-white py-3.5 text-sm font-medium hover:bg-navy/90 transition disabled:opacity-50"
          >
            {saving ? "Saving Profile..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

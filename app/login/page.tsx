"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (loginError) {
          throw new Error(loginError.message);
        }

        router.push("/account");
        router.refresh();
      } else {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (signupError) {
          throw new Error(signupError.message);
        }

        if (data.session) {
          router.push("/account");
          router.refresh();
        } else {
          setMessage(
            "Account created successfully. You can now log in with your email and password."
          );
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] bg-[#f8f7f4] px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] lg:grid-cols-2">
        <div className="hidden min-h-[650px] bg-[#111] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9a96e]">
              AVENOIR
            </p>
            <h1 className="mt-8 max-w-md font-serif text-5xl leading-tight">
              Considered fashion. Personal expression.
            </h1>
          </div>

          <p className="max-w-sm text-sm leading-7 text-white/60">
            Create your private Avenoir account to manage orders, save your
            favorite pieces and enjoy a seamless shopping experience.
          </p>
        </div>

        <div className="flex min-h-[650px] items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[#a3834d]">
                {mode === "login" ? "Welcome back" : "Join Avenoir"}
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#151515]">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {mode === "login"
                  ? "Enter your details to access your account."
                  : "Create an account to track orders and save your favorites."}
              </p>
            </div>

            <div className="mb-8 flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className={`-mb-px flex-1 border-b-2 pb-3 text-sm font-medium transition ${
                  mode === "login"
                    ? "border-[#151515] text-[#151515]"
                    : "border-transparent text-gray-400"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className={`-mb-px flex-1 border-b-2 pb-3 text-sm font-medium transition ${
                  mode === "signup"
                    ? "border-[#151515] text-[#151515]"
                    : "border-transparent text-gray-400"
                }`}
              >
                Create account
              </button>
            </div>

            {error && (
              <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#151515]"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#151515]"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#151515]"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Repeat your password"
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#151515]"
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#151515] px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#a3834d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-xs uppercase tracking-wider text-gray-500 transition hover:text-black"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

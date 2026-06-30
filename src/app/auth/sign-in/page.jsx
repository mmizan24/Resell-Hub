"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getSignInErrorMessage(error) {
  const messages = {
    INVALID_EMAIL: "Please enter a valid email address.",
    INVALID_EMAIL_OR_PASSWORD:
      "The email or password you entered is incorrect.",
    EMAIL_NOT_VERIFIED:
      "Please verify your email address before signing in.",
  };

  if (error.code && messages[error.code]) {
    return messages[error.code];
  }

  if (error.status === 429) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  if (error.status >= 500) {
    return "The authentication server is unavailable. Please try again later.";
  }

  return error.message || "Unable to sign in. Please try again.";
}

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: formData.get("email").trim(),
        password: formData.get("password"),
      });

      if (signInError) {
        setError(getSignInErrorMessage(signInError));
        return;
      }

      const dashboardPath =
        data?.user?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";

      router.replace(dashboardPath);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to manage your ResellHub account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              autoFocus
              required
              disabled={isPending}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New to ResellHub?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

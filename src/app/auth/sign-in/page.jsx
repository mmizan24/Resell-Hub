"use client";

import { authClient } from "@/lib/auth-client";
import { getDashboardPathForRole } from "@/lib/roles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GOOGLE_ROLES = [
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];

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
  const [googleRole, setGoogleRole] = useState("seller");

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

      const dashboardPath = getDashboardPathForRole(data?.user?.role);

      router.replace(dashboardPath);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsPending(true);

    try {
      const callbackURL = typeof window !== "undefined"
        ? `${window.location.origin}/auth/google-complete?role=${encodeURIComponent(googleRole)}`
        : `/auth/google-complete?role=${encodeURIComponent(googleRole)}`;

      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (response?.data?.url) {
        window.location.assign(response.data.url);
        return;
      }

      if (response?.error) {
        setError(response.error.message || "Unable to start Google sign-in. Please try again.");
      }
    } catch {
      setError("Unable to start Google sign-in. Please try again.");
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

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-blue-950">Continue with Google</p>
          <p className="mt-1 text-sm text-slate-600">
            Pick how you want to use ResellHub before signing in with Google.
          </p>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Role
            <select
              value={googleRole}
              onChange={(event) => setGoogleRole(event.target.value)}
              disabled={isPending}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {GOOGLE_ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.95h5.6c-.25 1.34-1.02 2.48-2.17 3.24l3.52 2.73C20.02 18.2 21 15.9 21 13.07c0-.67-.06-1.32-.18-1.95H12Z" />
              <path fill="#34A853" d="M5.57 14.26l-.84.64-2.97 2.31A11.99 11.99 0 0 0 12 22c3.24 0 5.96-1.06 7.94-2.87l-3.52-2.73c-.97.66-2.22 1.05-4.42 1.05-2.71 0-4.99-1.83-5.81-4.19Z" />
              <path fill="#FBBC05" d="M2.88 7.8A11.93 11.93 0 0 0 1 12c0 1.41.25 2.76.76 4.02l3.81-2.95A7.17 7.17 0 0 1 5.2 12c0-.7.11-1.38.31-2.02L2.88 7.8Z" />
              <path fill="#4285F4" d="M12 4.8c1.76 0 3.35.61 4.61 1.8l3.45-3.45C18.58 1.25 15.82 0 12 0 7.52 0 3.63 2.52 1.76 6.22l3.82 2.96C6.41 6.66 8.9 4.8 12 4.8Z" />
            </svg>
            {isPending ? "Connecting..." : `Continue as ${googleRole}`}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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

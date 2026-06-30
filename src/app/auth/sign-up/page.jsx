"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getSignUpErrorMessage(error) {
  const messages = {
    INVALID_EMAIL: "Please enter a valid email address.",
    PASSWORD_TOO_SHORT: "Your password must contain at least 8 characters.",
    PASSWORD_TOO_LONG: "Your password cannot exceed 128 characters.",
    USER_ALREADY_EXISTS: "An account with this email address already exists.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
      "An account with this email address already exists. Please sign in instead.",
  };

  if (error.code && messages[error.code]) {
    return messages[error.code];
  }

  if (error.status === 429) {
    return "Too many sign-up attempts. Please wait a moment and try again.";
  }

  if (error.status >= 500) {
    return "The authentication server is unavailable. Please try again later.";
  }

  return error.message || "Unable to create your account. Please try again.";
}

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Industry Standard: Fetch real-time active session status from BetterAuth
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name").trim();
    const role = formData.get("role");

    if (!name) {
      setError("Please enter your name.");
      setIsPending(false);
      return;
    }

    if (!["seller", "buyer", "admin"].includes(role)) {
      setError("Please select a valid role.");
      setIsPending(false);
      return;
    }

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email: formData.get("email").trim(),
        password: formData.get("password"),
        role,
      });

      if (signUpError) {
        setError(getSignUpErrorMessage(signUpError));
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleSignOut() {
    try {
      setIsLoggingOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.refresh();
          },
        },
      });
    } catch {
      setError("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Prevent UI flickering while checking if the user session is active
  if (isSessionLoading) {
    return (
      <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-16">
        <div className="text-sm font-medium text-slate-500 animate-pulse">Loading...</div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        
        {/* CASE 1: USER IS ALREADY LOGGED IN */}
        {session ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-950">Already Authenticated</h1>
            <p className="mt-2 text-sm text-slate-600">
              You are signed in as <span className="font-semibold text-slate-800">{session.user?.email}</span>.
            </p>
            
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="block w-full text-center rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800"
              >
                Go to Dashboard
              </Link>
              
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        ) : (
          
          /* CASE 2: USER IS NOT LOGGED IN (SHOW REGISTRATION FORM) */
          <>
            <h1 className="text-2xl font-bold text-blue-950">Create an account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Join ResellHub to start buying and reselling products.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  required
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Role
                <select
                  name="role"
                  defaultValue="seller"
                  required
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="font-semibold text-blue-700">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  productId,
  available = true,
  className = "",
}) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const user = session?.user;

  async function handleCheckout() {
    setError("");

    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user.role !== "buyer") {
      setError("Sign in with a buyer account to purchase products.");
      return;
    }

    setIsRedirecting(true);

    try {
      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.url) {
        throw new Error(
          result?.message || "Checkout could not be started.",
        );
      }

      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started.",
      );
      setIsRedirecting(false);
    }
  }

  const isDisabled =
    !available || isSessionPending || isRedirecting;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isDisabled}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {!available
          ? "Out of stock"
          : isRedirecting
            ? "Opening secure checkout..."
            : "Buy with Stripe"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

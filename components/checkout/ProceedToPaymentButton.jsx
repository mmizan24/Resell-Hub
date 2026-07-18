"use client";

import { useState } from "react";

export function ProceedToPaymentButton({ productId, quantity, className = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleProceed() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.url) {
        throw new Error(result?.message || "Checkout could not be started.");
      }

      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleProceed}
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isLoading ? "Redirecting to Stripe..." : "Proceed to payment"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

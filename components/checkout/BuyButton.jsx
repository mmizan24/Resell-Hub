"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  productId,
  available = true,
  stockCount = 1,
  unitPrice = 0,
  className = "",
}) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const user = session?.user;
  const rawStockCount = Number.isInteger(stockCount) && stockCount > 0 ? stockCount : 0;
  const maxQuantity = rawStockCount > 0 ? rawStockCount : 1;
  const numericUnitPrice = Number(unitPrice);
  const isStockAvailable = available && rawStockCount > 0;
  const selectedQuantity = Math.min(Math.max(1, quantity), maxQuantity);
  const totalAmount = Number.isFinite(numericUnitPrice) ? numericUnitPrice * selectedQuantity : null;

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

    if (!Number.isInteger(selectedQuantity) || selectedQuantity < 1 || selectedQuantity > maxQuantity) {
      setError("Please choose a valid quantity.");
      return;
    }

    setIsRedirecting(true);
    router.push(
      `/checkout?productId=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(selectedQuantity)}`,
    );
  }

  const isDisabled =
          !isStockAvailable || isSessionPending || isRedirecting;

  return (
    <div className={className}>
      <label className="mb-3 block text-sm font-medium text-slate-700">
        Quantity
        <input
          type="number"
          min="1"
          max={maxQuantity}
          step="1"
          value={selectedQuantity}
          onChange={(event) => {
            const nextValue = Number.parseInt(event.target.value, 10);
            if (Number.isInteger(nextValue)) {
              setQuantity(Math.min(Math.max(1, nextValue), maxQuantity));
            } else if (event.target.value === "") {
              setQuantity(1);
            }
          }}
          disabled={!isStockAvailable || isSessionPending || isRedirecting}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        />
      </label>
      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-600">Selected total</span>
          <span className="font-semibold text-slate-900">
            {Number.isFinite(totalAmount)
              ? `BDT ${totalAmount.toLocaleString("en-BD")}`
              : "Price unavailable"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {rawStockCount} item{rawStockCount === 1 ? "" : "s"} left in stock.
        </p>
      </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isDisabled}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
          {!isStockAvailable
          ? "Out of stock"
          : isRedirecting
            ? "Reviewing checkout..."
            : "Proceed to checkout"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

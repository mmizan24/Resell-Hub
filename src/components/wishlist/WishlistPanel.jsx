"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useWishlist } from "./useWishlist";

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice)
    ? `৳ ${numericPrice.toLocaleString("en-BD")}`
    : "Price unavailable";
}

export function WishlistPanel({ userId, compact = false }) {
  const { items, savedCount, remove, clear } = useWishlist(userId);

  const totalValue = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.price);
        return Number.isFinite(price) ? sum + price : sum;
      }, 0),
    [items],
  );

  return (
    <section id="wishlist" className="mt-10 scroll-mt-24">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Wishlist
          </p>
          <h2 className="mt-1 text-2xl font-bold text-blue-950">
            Saved for later
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Keep products here when you are not ready to buy yet.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {savedCount} saved
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            Potential total: {formatPrice(totalValue)}
          </span>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Clear wishlist
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-800">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-slate-500">
            Save products from sellers to compare them later.
          </p>
        </div>
      ) : (
        <div className={`mt-6 grid gap-5 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-2"}`}>
          {items.map((item) => {
            const image =
              Array.isArray(item.images) && typeof item.images[0] === "string"
                ? item.images[0]
                : null;

            return (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${item.title} product photo`}
                        fill
                        unoptimized
                        sizes="120px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
                        Image unavailable
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {item.category || "Other"}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Sold by {item.sellerInfo?.name || "Unknown seller"}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {item.quantity || 1} left
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {formatPrice(item.price)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {item.condition || "Condition not set"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/products/${item._id}`}
                        className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        View product
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item._id)}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

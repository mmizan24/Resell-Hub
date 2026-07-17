"use client";

import { useWishlist } from "./useWishlist";

function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className="h-4 w-4" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistButton({ product, userId, className = "" }) {
  const { save, remove, isSaved } = useWishlist(userId);
  const saved = isSaved(product?._id);

  function toggleWishlist() {
    if (saved) {
      remove(product?._id);
      return;
    }

    save(product);
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
        saved
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      } ${className}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <HeartIcon filled={saved} />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

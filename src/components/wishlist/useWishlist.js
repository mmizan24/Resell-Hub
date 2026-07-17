"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addToWishlist,
  clearWishlist,
  getWishlistSnapshot,
  removeFromWishlist,
  wishlistStorageKey,
} from "./wishlist-store";

export function useWishlist(userId) {
  const storageKey = useMemo(() => wishlistStorageKey(userId), [userId]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    function syncWishlist(event) {
      if (event?.type === "storage") {
        if (event.key === storageKey) {
          setItems(getWishlistSnapshot(userId));
        }
        return;
      }

      if (event?.detail?.userId && event.detail.userId !== (userId || "guest")) {
        return;
      }

      setItems(getWishlistSnapshot(userId));
    }

    syncWishlist();

    window.addEventListener("storage", syncWishlist);
    window.addEventListener("resellhub:wishlist-updated", syncWishlist);

    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener("resellhub:wishlist-updated", syncWishlist);
    };
  }, [storageKey, userId]);

  function save(product) {
    const next = addToWishlist(userId, product);
    setItems(next);
    return next;
  }

  function remove(productId) {
    const next = removeFromWishlist(userId, productId);
    setItems(next);
    return next;
  }

  function clear() {
    clearWishlist(userId);
    setItems([]);
  }

  const isSaved = (productId) => items.some((item) => item._id === String(productId));

  return {
    items,
    savedCount: items.length,
    save,
    remove,
    clear,
    isSaved,
  };
}

"use client";

const STORAGE_PREFIX = "resellhub:wishlist:";

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || "guest"}`;
}

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProduct(product) {
  if (!product?._id) return null;

  return {
    _id: String(product._id),
    title: product.title || "Untitled product",
    price: product.price ?? null,
    category: product.category || "Other",
    condition: product.condition || "",
    status: product.status || "",
    quantity: Number.isInteger(product.quantity) ? product.quantity : 1,
    images: Array.isArray(product.images) ? product.images : [],
    sellerInfo: product.sellerInfo || {},
    createdAt: product.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
  };
}

function readWishlist(userId) {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(getStorageKey(userId));
  return safeParse(raw).filter((item) => item && item._id);
}

function writeWishlist(userId, items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent("resellhub:wishlist-updated", {
      detail: { userId: userId || "guest" },
    }),
  );
}

export function getWishlistSnapshot(userId) {
  return readWishlist(userId);
}

export function addToWishlist(userId, product) {
  const item = normalizeProduct(product);
  if (!item) return [];

  const current = readWishlist(userId);
  const next = [item, ...current.filter((entry) => entry._id !== item._id)];
  writeWishlist(userId, next);
  return next;
}

export function removeFromWishlist(userId, productId) {
  const current = readWishlist(userId);
  const next = current.filter((item) => item._id !== String(productId));
  writeWishlist(userId, next);
  return next;
}

export function clearWishlist(userId) {
  writeWishlist(userId, []);
}

export function isProductSaved(userId, productId) {
  return readWishlist(userId).some((item) => item._id === String(productId));
}

export function wishlistStorageKey(userId) {
  return getStorageKey(userId);
}

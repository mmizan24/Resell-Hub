import "server-only";

import { validateProductPayload } from "@/lib/product-data";
import { ObjectId } from "mongodb";

const backendBaseUrl = (process.env.API_URL?.trim() || "http://127.0.0.1:5000").replace(/\/$/, "");
const backendApiBase = backendBaseUrl ? `${backendBaseUrl}/api` : "";

function buildBackendUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendApiBase}${normalizedPath}`;
}

async function readJson(response) {
  const data = await response.json().catch(() => null);
  return data;
}

async function requestBackend(path, options = {}) {
  const response = await fetch(buildBackendUrl(path), {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "The product service is unavailable.";
    throw new Error(message);
  }

  return payload;
}

export async function getProducts() {
  const remote = await requestBackend("/products");
  return Array.isArray(remote?.data) ? remote.data : [];
}

export async function getAvailableProducts() {
  const remote = await requestBackend("/products/available");
  return Array.isArray(remote?.data) ? remote.data : [];
}

export async function getProductById(id) {
  if (typeof id !== "string" || !id.trim()) {
    return null;
  }

  const remote = await requestBackend(`/products/${encodeURIComponent(id)}`);
  return remote?.data || null;
}

export async function getSellerProducts(userId) {
  const remote = await requestBackend(
    `/seller/products?userId=${encodeURIComponent(userId || "")}`,
  );
  return Array.isArray(remote?.data) ? remote.data : [];
}

export async function createSellerProduct(product) {
  const validation = validateProductPayload(product);

  if (validation.error) {
    return { error: validation.error, status: 422 };
  }

  const remote = await requestBackend("/seller/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...validation.data,
      sellerInfo: product.sellerInfo,
    }),
  });

  return { data: remote?.data || null, message: remote?.message || "Product added successfully." };
}

function ensureProductId(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new Error("Invalid product id.");
  }
}

export async function updateSellerProduct({ id, sellerId, payload }) {
  ensureProductId(id);

  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    return { error: "Product not found or you do not own this product.", status: 404 };
  }

  if (existingProduct.sellerInfo?.userId && existingProduct.sellerInfo.userId !== sellerId) {
    return { error: "Product not found or you do not own this product.", status: 404 };
  }

  const keepsExistingImages =
    Array.isArray(payload?.images) &&
    Array.isArray(existingProduct.images) &&
    payload.images.length === existingProduct.images.length &&
    payload.images.every((value, index) => value === existingProduct.images[index]);

  const validation = validateProductPayload(payload, {
    requireImgBB: !keepsExistingImages,
  });

  if (validation.error) {
    return { error: validation.error, status: 422 };
  }

  const remote = await requestBackend(
    `/seller/products/${encodeURIComponent(id)}?sellerId=${encodeURIComponent(sellerId || "")}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validation.data),
    },
  );

  return { data: remote?.data || null, message: remote?.message || "Product updated successfully." };
}

export async function listAdminProducts() {
  const remote = await requestBackend("/admin/products");
  return Array.isArray(remote?.data) ? remote.data : [];
}

export async function updateAdminProduct(id, payload) {
  ensureProductId(id);

  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    return { error: "Product not found.", status: 404 };
  }

  const validation = validateProductPayload(
    {
      ...existingProduct,
      ...payload,
      images: Array.isArray(payload?.images)
        ? payload.images
        : Array.isArray(existingProduct.images)
          ? existingProduct.images
          : [],
    },
    {
      requireImgBB: false,
    },
  );

  if (validation.error) {
    return { error: validation.error, status: 422 };
  }

  const remote = await requestBackend(`/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validation.data),
  });

  return { data: remote?.data || null, message: remote?.message || "Product updated." };
}

export async function markProductSold(productId, soldToUserId, soldAt, soldQuantity = 1) {
  ensureProductId(productId);

  await requestBackend(`/products/${encodeURIComponent(productId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "out of stock",
      soldToUserId,
      soldAt: soldAt?.toISOString?.() || new Date().toISOString(),
      soldQuantity,
    }),
  });
}

export async function deleteAdminProduct(id) {
  ensureProductId(id);

  const remote = await requestBackend(`/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return { data: remote?.data || null, message: remote?.message || "Product deleted." };
}

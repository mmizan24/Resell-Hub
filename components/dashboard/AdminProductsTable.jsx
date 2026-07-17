"use client";

import { useEffect, useMemo, useState } from "react";

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const EMPTY_FORM = {
  title: "",
  category: "",
  condition: "",
  price: "",
  quantity: "",
  description: "",
  status: "available",
};

function adminApi(path) {
  const url = new URL(path, BACKEND_ORIGIN);
  return url.toString();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function AdminProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("newest");

  const totalQuantity = useMemo(
    () =>
      products.reduce((sum, product) => {
        const quantity = Number.isInteger(product.quantity) ? product.quantity : 0;
        return sum + quantity;
      }, 0),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (!term) return true;

      const haystack = [
        product.title,
        product.category,
        product.condition,
        product.status,
        product.price,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });

    const sorted = [...filtered];

    switch (sortMode) {
      case "name-asc":
        return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "name-desc":
        return sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "price-asc":
        return sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
      case "price-desc":
        return sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
      default:
        return sorted;
    }
  }, [products, searchTerm, sortMode]);

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to load products right now.");
      }

      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function hydrateProducts() {
      try {
        const response = await fetch("/api/admin/products", {
          credentials: "include",
        });
        const result = await response.json().catch(() => null);

        if (!active) return;

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Unable to load products right now.");
        }

        setProducts(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (active) {
          setMessageType("error");
          setMessage(error?.message || "Unable to load products right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void hydrateProducts();

    return () => {
      active = false;
    };
  }, []);

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      title: product.title || "",
      category: product.category || "",
      condition: product.condition || "",
      price: product.price ?? "",
      quantity: product.quantity ?? 1,
      description: product.description || "",
      status: product.status || "available",
    });
  }

  async function saveProduct() {
    if (!editingId) return;
    setSavingId(editingId);
    setMessage("");

    try {
      const response = await fetch(adminApi(`/api/admin/products/${editingId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          condition: form.condition,
          price: toNumber(form.price),
          quantity: Math.max(0, Math.min(999, Math.trunc(toNumber(form.quantity, 1)))),
          description: form.description,
          status: form.status,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Update failed");
      }

      setMessageType("success");
      setMessage("Product updated successfully.");
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to update product.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm("Delete this product from the marketplace?");
    if (!confirmed) return;

    setSavingId(productId);
    setMessage("");

    try {
      const response = await fetch(adminApi(`/api/admin/products/${productId}`), {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Delete failed");
      }

      setMessageType("success");
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to delete product.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section id="products" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-950">All products</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review, update, and remove listings directly from the backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Listings: {products.length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            Total quantity: {totalQuantity}
          </span>
        </div>
      </div>

      {message ? (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_220px]">
        <label className="block text-sm font-medium text-slate-700">
          Search products
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, category, condition, status, or price"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Sort by
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="newest">Newest first</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading products...</p>
      ) : visibleProducts.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No products match your search.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {visibleProducts.map((product) => (
            <article key={product._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  {editingId === product._id ? (
                    <>
                      <input
                        className="w-full rounded border border-slate-300 px-2 py-1 text-base font-semibold"
                        value={form.title}
                        onChange={(event) => setForm({ ...form, title: event.target.value })}
                      />
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          className="rounded border border-slate-300 px-2 py-1"
                          placeholder="Category"
                          value={form.category}
                          onChange={(event) => setForm({ ...form, category: event.target.value })}
                        />
                        <input
                          className="rounded border border-slate-300 px-2 py-1"
                          placeholder="Condition"
                          value={form.condition}
                          onChange={(event) => setForm({ ...form, condition: event.target.value })}
                        />
                        <input
                          className="rounded border border-slate-300 px-2 py-1"
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={form.price}
                          onChange={(event) => setForm({ ...form, price: event.target.value })}
                        />
                        <input
                          className="rounded border border-slate-300 px-2 py-1"
                          type="number"
                          min="0"
                          max="999"
                          placeholder="Quantity"
                          value={form.quantity}
                          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                        />
                        <select
                          className="rounded border border-slate-300 px-2 py-1"
                          value={form.status}
                          onChange={(event) => setForm({ ...form, status: event.target.value })}
                        >
                          <option value="available">Available</option>
                          <option value="out of stock">Out of stock</option>
                        </select>
                      </div>
                      <textarea
                        className="mt-3 w-full rounded border border-slate-300 px-2 py-1"
                        rows={3}
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {product.title || "Untitled product"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {product.description || "No description provided."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {product.category || "Uncategorized"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {product.condition || "Unknown"}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                          {Number.isInteger(product.quantity) ? product.quantity : 0} left
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                          {product.status || "available"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {editingId === product._id ? (
                    <>
                      <button
                        type="button"
                        className="rounded bg-blue-700 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                        onClick={saveProduct}
                        disabled={savingId === product._id}
                      >
                        {savingId === product._id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="rounded border px-3 py-1.5"
                        onClick={() => setEditingId(null)}
                        disabled={savingId === product._id}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="rounded border border-blue-200 px-3 py-1.5 text-blue-700"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded border border-rose-200 px-3 py-1.5 text-rose-700"
                        onClick={() => deleteProduct(product._id)}
                        disabled={savingId === product._id}
                      >
                        {savingId === product._id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

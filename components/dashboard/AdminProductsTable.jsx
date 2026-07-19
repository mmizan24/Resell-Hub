"use client";

import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "../../src/components/ui/PaginationControls";
import { paginateItems } from "../../src/lib/pagination";

const EMPTY_FORM = {
  title: "",
  category: "",
  condition: "",
  price: "",
  quantity: "",
  description: "",
  status: "available",
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function approvalTone(status) {
  const normalized = (status || "pending").toLowerCase();

  if (normalized === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "rejected") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

function approvalLabel(status) {
  const normalized = (status || "pending").toLowerCase();
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  return "Pending approval";
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
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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
      const matchesApproval =
        approvalFilter === "all" ||
        (product.approvalStatus || "pending").toLowerCase() === approvalFilter;

      if (!matchesApproval) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        product.title,
        product.category,
        product.condition,
        product.status,
        product.approvalStatus,
        product.price,
        product.sellerInfo?.name,
        product.sellerInfo?.email,
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
  }, [products, searchTerm, sortMode, approvalFilter]);

  const paginatedProducts = useMemo(
    () => paginateItems(visibleProducts, currentPage, pageSize),
    [currentPage, visibleProducts],
  );

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
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
        const response = await fetch("/api/admin/products", { cache: "no-store" });
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

  async function updateProduct(productId, payload, successMessage) {
    setSavingId(productId);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Update failed");
      }

      setMessageType("success");
      setMessage(successMessage || "Product updated successfully.");
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to update product.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveProduct() {
    if (!editingId) return;

    await updateProduct(editingId, {
      title: form.title,
      category: form.category,
      condition: form.condition,
      price: toNumber(form.price),
      quantity: Math.max(0, Math.min(999, Math.trunc(toNumber(form.quantity, 1)))),
      description: form.description,
      status: form.status,
    });
  }

  async function approveProduct(productId) {
    await updateProduct(productId, { approvalStatus: "approved" }, "Product approved successfully.");
  }

  async function rejectProduct(productId) {
    const confirmed = window.confirm("Reject this product listing?");
    if (!confirmed) return;

    await updateProduct(productId, { approvalStatus: "rejected" }, "Product rejected successfully.");
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm("Delete this product from the marketplace?");
    if (!confirmed) return;

    setSavingId(productId);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
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
          <h2 className="text-xl font-bold text-blue-950">Product moderation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Approve new seller listings, edit product details, or remove listings directly from the marketplace.
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
            placeholder="Search by title, seller, or approval status"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Filter approval
          <select
            value={approvalFilter}
            onChange={(event) => setApprovalFilter(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_220px]">
        <label className="block text-sm font-medium text-slate-700 md:col-start-2">
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
          {paginatedProducts.items.map((product) => {
            const approvalStatus = (product.approvalStatus || "pending").toLowerCase();

            return (
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
                          <span className={`rounded-full px-2.5 py-1 font-semibold ${approvalTone(approvalStatus)}`}>
                            {approvalLabel(approvalStatus)}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                            {Number.isInteger(product.quantity) ? product.quantity : 0} left
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                            {product.status || "available"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Seller: {product.sellerInfo?.name || "Unknown seller"}
                        </p>
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
                        {approvalStatus !== "approved" ? (
                          <button
                            type="button"
                            className="rounded border border-emerald-200 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-50"
                            onClick={() => approveProduct(product._id)}
                            disabled={savingId === product._id}
                          >
                            {savingId === product._id ? "Approving..." : "Approve"}
                          </button>
                        ) : null}
                        {approvalStatus !== "rejected" ? (
                          <button
                            type="button"
                            className="rounded border border-amber-200 px-3 py-1.5 text-amber-700 transition hover:bg-amber-50"
                            onClick={() => rejectProduct(product._id)}
                            disabled={savingId === product._id}
                          >
                            Reject
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="rounded border border-blue-200 px-3 py-1.5 text-blue-700 transition hover:bg-blue-50"
                          onClick={() => startEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded border border-rose-200 px-3 py-1.5 text-rose-700 transition hover:bg-rose-50"
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
            );
          })}
        </div>
      )}

      {paginatedProducts.totalPages > 1 ? (
        <PaginationControls
          page={paginatedProducts.page}
          totalPages={paginatedProducts.totalPages}
          totalItems={paginatedProducts.totalItems}
          startIndex={paginatedProducts.startIndex}
          endIndex={paginatedProducts.endIndex}
          itemLabel="products"
          onPageChange={setCurrentPage}
        />
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

export function AdminProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", condition: "", price: "", description: "", status: "" });
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      const json = await res.json();
      if (res.ok && json?.success) {
        setProducts(json.data || []);
      }
    } catch {
      setMessage("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      title: product.title || "",
      category: product.category || "",
      condition: product.condition || "",
      price: product.price ?? "",
      description: product.description || "",
      status: product.status || "available",
    });
  }

  async function saveProduct() {
    if (!editingId) return;
    setMessage("");

    try {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          condition: form.condition,
          price: Number(form.price),
          description: form.description,
          status: form.status,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Update failed");
      setMessage("Product updated successfully.");
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "Unable to update product.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-950">All products</h2>
          <p className="mt-1 text-sm text-slate-600">Review and edit any listing across the marketplace.</p>
        </div>
      </div>

      {message ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p> : null}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No products found.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {products.map((product) => (
            <article key={product._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  {editingId === product._id ? (
                    <>
                      <input className="w-full rounded border border-slate-300 px-2 py-1 text-base font-semibold" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input className="rounded border border-slate-300 px-2 py-1" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
                        <input className="rounded border border-slate-300 px-2 py-1" placeholder="Condition" value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })} />
                        <input className="rounded border border-slate-300 px-2 py-1" type="number" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
                        <select className="rounded border border-slate-300 px-2 py-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                          <option value="available">Available</option>
                          <option value="out of stock">Out of stock</option>
                        </select>
                      </div>
                      <textarea className="mt-3 w-full rounded border border-slate-300 px-2 py-1" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-slate-900">{product.title || "Untitled product"}</h3>
                      <p className="mt-1 text-sm text-slate-600">{product.description || "No description provided."}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{product.category || "Uncategorized"}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{product.condition || "Unknown"}</span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{product.status || "available"}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === product._id ? (
                    <>
                      <button className="rounded bg-blue-700 px-3 py-1.5 text-white" onClick={saveProduct}>Save</button>
                      <button className="rounded border px-3 py-1.5" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="rounded border border-blue-200 px-3 py-1.5 text-blue-700" onClick={() => startEdit(product)}>Edit</button>
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

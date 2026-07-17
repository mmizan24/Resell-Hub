"use client";

import { useEffect, useState } from "react";

function displayValue(value) {
  return value || "N/A";
}

function statusClass(status) {
  return status === "paid"
    ? "bg-emerald-50 text-emerald-700"
    : status === "cancelled"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
}

export function AdminOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ orderStatus: "", paymentStatus: "", amountTotal: "", currency: "" });

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders", { credentials: "include" });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Unable to load orders.");
    }

    return json.data || [];
  }

  useEffect(() => {
    let active = true;

    async function loadOrdersAsync() {
      try {
        const data = await fetchOrders();
        if (active) {
          setOrders(data);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || "Unable to load orders right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrdersAsync();

    return () => {
      active = false;
    };
  }, []);

  function startEdit(order) {
    setEditingId(order._id);
    setForm({
      orderStatus: order.orderStatus || "pending",
      paymentStatus: order.paymentStatus || "pending",
      amountTotal: order.amountTotal ?? "",
      currency: order.currency || "bdt",
    });
  }

  async function saveOrder() {
    if (!editingId) return;
    setMessage("");

    try {
      const res = await fetch(`/api/admin/orders/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderStatus: form.orderStatus,
          paymentStatus: form.paymentStatus,
          amountTotal: Number(form.amountTotal),
          currency: form.currency,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Update failed");
      setMessage("Order updated successfully.");
      setEditingId(null);
      setOrders(await fetchOrders());
    } catch (error) {
      setMessage(error.message || "Unable to update order.");
    }
  }

  return (
    <section id="orders" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-blue-950">Buyer orders</h2>
        <p className="mt-1 text-sm text-slate-600">Review and edit every buyer purchase request and payment state.</p>
      </div>

      {message ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p> : null}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No orders found.</p>
      ) : (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {orders.map((order) => (
              <article key={order._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {editingId === order._id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</span>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.amountTotal}
                          onChange={(event) => setForm({ ...form, amountTotal: event.target.value })}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Currency</span>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.currency}
                          onChange={(event) => setForm({ ...form, currency: event.target.value })}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order status</span>
                        <select
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.orderStatus}
                          onChange={(event) => setForm({ ...form, orderStatus: event.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment status</span>
                        <select
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.paymentStatus}
                          onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={saveOrder}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{displayValue(order.buyerInfo?.name)}</div>
                        <div className="mt-1 text-sm text-slate-600">{displayValue(order.buyerInfo?.email)}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.orderStatus)}`}>
                        {order.orderStatus || "pending"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-slate-400">Product</span>
                        {displayValue(order.product?.title)}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="block text-xs uppercase tracking-wide text-slate-400">Amount</span>
                          {displayValue(order.amountTotal)} {displayValue(order.currency).toLowerCase()}
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-wide text-slate-400">Payment</span>
                          {displayValue(order.paymentStatus)}
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-wide text-slate-400">Seller</span>
                          {displayValue(order.sellerInfo?.name)}
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-wide text-slate-400">Date</span>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
                        onClick={() => startEdit(order)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Buyer</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {orders.map((order) => (
                    <tr key={order._id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{displayValue(order.buyerInfo?.name)}</div>
                        <div className="text-xs text-slate-500">{displayValue(order.buyerInfo?.email)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{displayValue(order.product?.title)}</div>
                        <div className="text-xs text-slate-500">{displayValue(order.sellerInfo?.name)}</div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === order._id ? (
                          <div className="space-y-2">
                            <input
                              className="w-full rounded border border-slate-300 px-2 py-1"
                              value={form.amountTotal}
                              onChange={(event) => setForm({ ...form, amountTotal: event.target.value })}
                            />
                            <input
                              className="w-full rounded border border-slate-300 px-2 py-1"
                              value={form.currency}
                              onChange={(event) => setForm({ ...form, currency: event.target.value })}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-blue-700">{displayValue(order.amountTotal)}</div>
                            <div className="text-xs text-slate-500">{displayValue(order.currency)}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === order._id ? (
                          <div className="space-y-2">
                            <select
                              className="w-full rounded border border-slate-300 px-2 py-1"
                              value={form.orderStatus}
                              onChange={(event) => setForm({ ...form, orderStatus: event.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                              className="w-full rounded border border-slate-300 px-2 py-1"
                              value={form.paymentStatus}
                              onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="unpaid">Unpaid</option>
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.orderStatus)}`}>
                              {order.orderStatus || "pending"}
                            </span>
                            <div className="text-xs text-slate-500">{displayValue(order.paymentStatus)}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className="px-4 py-3">
                        {editingId === order._id ? (
                          <div className="flex gap-2">
                            <button type="button" className="rounded bg-blue-700 px-3 py-1.5 text-white" onClick={saveOrder}>
                              Save
                            </button>
                            <button type="button" className="rounded border px-3 py-1.5" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="rounded border border-blue-200 px-3 py-1.5 text-blue-700" onClick={() => startEdit(order)}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

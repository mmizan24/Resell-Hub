"use client";

import { useEffect, useState } from "react";

export function AdminOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ orderStatus: "", paymentStatus: "", amountTotal: "", currency: "" });

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      const json = await res.json();
      if (res.ok && json?.success) {
        setOrders(json.data || []);
      } else {
        setMessage(json?.message || "Unable to load orders.");
      }
    } catch {
      setMessage("Unable to load orders right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
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
      await loadOrders();
    } catch (error) {
      setMessage(error.message || "Unable to update order.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
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
                      <div className="font-semibold text-slate-900">{order.buyerInfo?.name || "Unknown buyer"}</div>
                      <div className="text-xs text-slate-500">{order.buyerInfo?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{order.product?.title || "Untitled product"}</div>
                      <div className="text-xs text-slate-500">{order.sellerInfo?.name || "Unknown seller"}</div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === order._id ? (
                        <div className="space-y-2">
                          <input className="w-full rounded border border-slate-300 px-2 py-1" value={form.amountTotal} onChange={(event) => setForm({ ...form, amountTotal: event.target.value })} />
                          <input className="w-full rounded border border-slate-300 px-2 py-1" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-blue-700">{order.amountTotal ?? "—"}</div>
                          <div className="text-xs text-slate-500">{order.currency || "bdt"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === order._id ? (
                        <div className="space-y-2">
                          <select className="w-full rounded border border-slate-300 px-2 py-1" value={form.orderStatus} onChange={(event) => setForm({ ...form, orderStatus: event.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <select className="w-full rounded border border-slate-300 px-2 py-1" value={form.paymentStatus} onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.orderStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {order.orderStatus || "pending"}
                          </span>
                          <div className="text-xs text-slate-500">{order.paymentStatus || "pending"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {editingId === order._id ? (
                        <div className="flex gap-2">
                          <button className="rounded bg-blue-700 px-3 py-1.5 text-white" onClick={saveOrder}>Save</button>
                          <button className="rounded border px-3 py-1.5" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="rounded border border-blue-200 px-3 py-1.5 text-blue-700" onClick={() => startEdit(order)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

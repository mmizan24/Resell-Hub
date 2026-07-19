"use client";

import { useEffect, useMemo, useState } from "react";
import { OrderStatusFlow } from "./OrderStatusFlow";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { paginateItems } from "@/lib/pagination";

const ORDER_STATUS_FLOW = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

function normalizeOrderStatus(status) {
  const value = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (value === "paid") return "pending";
  return ORDER_STATUS_FLOW.includes(value) ? value : "pending";
}

function formatMoney(amount, currency) {
  if (!Number.isFinite(Number(amount))) {
    return "BDT 0";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: (currency || "bdt").toUpperCase(),
  }).format(Number(amount) / 100);
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SellerOrdersPanel({ sellerId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [savingId, setSavingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/seller/orders", { cache: "no-store" });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Orders could not be loaded.");
        }

        if (active) {
          setOrders(Array.isArray(result.data) ? result.data : []);
          setMessage("");
        }
      } catch (error) {
        if (active) {
          setMessageType("error");
          setMessage(error?.message || "Orders could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [sellerId]);

  const ordersByStatus = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = normalizeOrderStatus(order.orderStatus);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, processing: 0, shipped: 0, delivered: 0 },
    );
  }, [orders]);

  const paginatedOrders = useMemo(
    () => paginateItems(orders, currentPage, pageSize),
    [currentPage, orders],
  );

  async function advanceOrder(orderId, currentStatus) {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(normalizeOrderStatus(currentStatus));
    const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];

    if (!nextStatus) {
      return;
    }

    setSavingId(orderId);
    setMessage("");

    try {
      const response = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Order status could not be updated.");
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: normalizeOrderStatus(result.data?.orderStatus || nextStatus), statusHistory: result.data?.statusHistory || order.statusHistory }
            : order,
        ),
      );
      setMessageType("success");
      setMessage(`Order moved to ${STATUS_LABELS[nextStatus]}.`);
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Order status could not be updated.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <section id="manage-orders" className="mt-10 scroll-mt-24">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Orders
          </p>
          <h2 className="mt-1 text-2xl font-bold text-blue-950">Order tracking</h2>
          <p className="mt-2 text-sm text-slate-600">
            Track buyer-confirmed purchases and move each order through the fulfillment flow.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <StatChip label="Pending" value={ordersByStatus.pending} tone="amber" />
          <StatChip label="Accepted" value={ordersByStatus.accepted} tone="blue" />
          <StatChip label="Processing" value={ordersByStatus.processing} tone="violet" />
          <StatChip label="Shipped" value={ordersByStatus.shipped} tone="cyan" />
          <StatChip label="Delivered" value={ordersByStatus.delivered} tone="emerald" />
        </div>
      </div>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No confirmed buyer orders are available yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedOrders.items.map((order) => {
              const currentStatus = normalizeOrderStatus(order.orderStatus);
              const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
              const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];

              return (
                <article key={order._id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {order.product?.title || "Product order"}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {formatMoney(order.amountTotal, order.currency)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Buyer: {order.buyerInfo?.name || "Unknown buyer"} ·{" "}
                        {order.buyerInfo?.email || "No email available"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Order placed {formatDate(order.createdAt)} · Payment status:{" "}
                        {order.paymentStatus || "unpaid"}
                      </p>

                      <div className="mt-4">
                        <OrderStatusFlow status={currentStatus} />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Current stage
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {STATUS_LABELS[currentStatus] || "Pending"}
                      </span>

                      {nextStatus ? (
                        <button
                          type="button"
                          onClick={() => advanceOrder(order._id, currentStatus)}
                          disabled={savingId === order._id}
                          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {savingId === order._id
                            ? "Updating..."
                            : `Mark ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                          Delivered
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {paginatedOrders.totalPages > 1 ? (
        <PaginationControls
          page={paginatedOrders.page}
          totalPages={paginatedOrders.totalPages}
          totalItems={paginatedOrders.totalItems}
          startIndex={paginatedOrders.startIndex}
          endIndex={paginatedOrders.endIndex}
          itemLabel="orders"
          onPageChange={setCurrentPage}
        />
      ) : null}
    </section>
  );
}

function StatChip({ label, value, tone }) {
  const styles = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className={`rounded-xl px-3 py-2 ${styles[tone] || styles.blue}`}>
      <div className="text-xs font-semibold uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}

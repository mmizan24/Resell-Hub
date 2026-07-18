"use client";

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

const STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  accepted: "border-blue-200 bg-blue-50 text-blue-800",
  processing: "border-violet-200 bg-violet-50 text-violet-800",
  shipped: "border-cyan-200 bg-cyan-50 text-cyan-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function normalizeOrderStatus(status) {
  const value = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (value === "paid") return "pending";
  return ORDER_STATUS_FLOW.includes(value) ? value : "pending";
}

export function OrderStatusFlow({ status }) {
  const currentStatus = normalizeOrderStatus(status);
  const activeIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Order progress</p>
          <p className="mt-1 text-xs text-slate-500">
            {STATUS_LABELS[currentStatus] || "Pending"} is the current stage.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[currentStatus] || STATUS_STYLES.pending}`}
        >
          {STATUS_LABELS[currentStatus] || "Pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {ORDER_STATUS_FLOW.map((step, index) => {
          const isComplete = activeIndex > index;
          const isCurrent = activeIndex === index;

          return (
            <div
              key={step}
              className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition ${
                isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isCurrent
                    ? STATUS_STYLES[step] || STATUS_STYLES.pending
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span className="block uppercase tracking-wide">
                {index + 1}
              </span>
              <span className="mt-1 block text-sm">
                {STATUS_LABELS[step] || step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

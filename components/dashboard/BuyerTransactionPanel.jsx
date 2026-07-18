import Link from "next/link";

function formatMoney(amount, currency) {
  if (!Number.isFinite(amount)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: (currency || "bdt").toUpperCase(),
  }).format(amount / 100);
}

function formatDate(value) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BuyerTransactionPanel({ payments = [] }) {
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amountTotal || 0), 0);
  const latestPayment = payments[0] || null;
  const paidCount = payments.filter((payment) => payment.paymentStatus === "paid").length;

  return (
    <section className="mt-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Transactions" value={payments.length} helper="All recorded payment attempts." />
        <MetricCard label="Successful payments" value={paidCount} helper="Payments completed through Stripe." />
        <MetricCard label="Total value" value={formatMoney(totalAmount)} helper="Gross paid amount across records." />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Transaction Management</h2>
            <p className="mt-1 text-sm text-slate-600">
              Review transaction ID, payment amount, payment date, and payment status in one place.
            </p>
          </div>
          {latestPayment?.orderId && (
            <Link
              href={`/dashboard/buyer/orders/${latestPayment.orderId}`}
              className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Latest order
            </Link>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No payment records are available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment._id || payment.transactionId} className="align-top">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      <div className="max-w-[220px] break-all">{payment.transactionId}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {payment.product?.title || "Purchased product"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Quantity: {payment.quantity || 1}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-blue-700">
                      {formatMoney(Number(payment.amountTotal || 0), payment.currency)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : payment.paymentStatus === "failed"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {payment.paymentStatus || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

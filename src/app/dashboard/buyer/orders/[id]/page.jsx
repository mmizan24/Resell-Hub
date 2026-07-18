import { OrderStatusFlow } from "@/components/orders/OrderStatusFlow";
import { auth } from "@/lib/auth";
import { getBuyerOrderById } from "@/lib/orders";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order details | ResellHub",
};

export default async function BuyerOrderDetailsPage({ params }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user || user.role !== "buyer") {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Order details</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in with a buyer account to view this order.
          </p>
        </div>
      </section>
    );
  }

  const order = await getBuyerOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  return (
    <section className="bg-slate-50 px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard/buyer#my-orders" className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
          Back to my orders
        </Link>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Order details
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {order.product?.title || "Purchased product"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            A complete record of the purchase, payment, and fulfillment progress.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <OrderStatusFlow status={order.orderStatus} />
              <dl className="mt-6 space-y-4 text-sm">
                <SummaryRow label="Order ID" value={order._id} />
                <SummaryRow label="Product" value={order.product?.title || "Unavailable"} />
                <SummaryRow label="Quantity" value={order.quantity || 1} />
                <SummaryRow label="Total amount" value={formatMoney(Number(order.amountTotal || 0), order.currency)} strong />
                <SummaryRow label="Payment status" value={order.paymentStatus || "pending"} />
                <SummaryRow label="Created" value={formatDate(order.createdAt)} />
                <SummaryRow label="Updated" value={formatDate(order.updatedAt)} />
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Buyer and seller
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <SummaryRow label="Buyer" value={order.buyerInfo?.name || user.name || "Buyer"} />
                <SummaryRow label="Seller" value={order.sellerInfo?.name || "Seller"} />
                <SummaryRow label="Transaction" value={order.paymentIntentId || "Unavailable"} />
              </dl>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/buyer/payments"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to payment history
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? "text-base font-bold text-slate-950" : "font-medium text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}

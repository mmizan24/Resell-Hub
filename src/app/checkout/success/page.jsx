import { auth } from "@/lib/auth";
import { fulfillCheckout } from "@/lib/orders";
import { headers } from "next/headers";
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

function formatDateTime(value) {
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
  title: "Payment successful | ResellHub",
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = typeof params?.session_id === "string" ? params.session_id : "";
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const buyer = session?.user;

  if (!buyer || buyer.role !== "buyer") {
    return (
      <StatusCard
        eyebrow="Sign in required"
        title="Confirm your payment"
        message="Sign in with the buyer account used for this purchase to view the payment receipt."
        href="/auth/sign-in"
        linkLabel="Sign in"
      />
    );
  }

  if (!sessionId) {
    return (
      <StatusCard
        eyebrow="Invalid checkout"
        title="The payment session is missing"
        message="Return to your dashboard and try purchasing the product again."
        href="/dashboard/buyer"
        linkLabel="Buyer dashboard"
      />
    );
  }

  let result;

  try {
    result = await fulfillCheckout(sessionId, buyer.id);
  } catch (error) {
    console.error("Unable to confirm Checkout success:", error);
  }

  if (!result) {
    return (
      <StatusCard
        eyebrow="Confirmation unavailable"
        title="We could not verify the payment"
        message="Your card may not have been charged yet. Check Stripe and your buyer dashboard before trying again."
        href="/dashboard/buyer#my-orders"
        linkLabel="View my orders"
      />
    );
  }

  if (!result.paid) {
    return (
      <StatusCard
        eyebrow="Payment processing"
        title="Stripe is confirming your payment"
        message="Your order remains pending. Check your buyer dashboard again shortly."
        href="/dashboard/buyer#my-orders"
        linkLabel="View my orders"
      />
    );
  }

  const payment = result.payment || {};
  const amount = formatMoney(
    Number(payment.amountTotal ?? result.checkoutSession?.amount_total),
    payment.currency || result.checkoutSession?.currency,
  );
  const transactionId =
    payment.transactionId ||
    payment.paymentIntentId ||
    result.checkoutSession?.payment_intent ||
    result.checkoutSession?.id;

  return (
    <section className="bg-slate-50 px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Payment successful
          </span>
          <h1 className="mt-5 text-3xl font-bold text-slate-950">
            Your order has been confirmed
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Stripe processed your payment securely. Your order record and transaction history
            have been saved.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order summary
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <SummaryRow label="Product" value={payment.product?.title || "Purchased product"} />
                <SummaryRow label="Quantity" value={payment.quantity || 1} />
                <SummaryRow label="Payment amount" value={amount} strong />
                <SummaryRow label="Transaction ID" value={transactionId || "Unavailable"} />
                <SummaryRow label="Payment date" value={formatDateTime(payment.paymentDate || payment.createdAt)} />
                <SummaryRow label="Status" value="Paid" />
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Delivery information
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <SummaryRow label="Buyer" value={buyer.name || "Not provided"} />
                <SummaryRow label="Email" value={buyer.email || "Not provided"} />
                <SummaryRow label="Phone" value={buyer.phoneNumber || "Not provided"} />
                <SummaryRow label="Location" value={buyer.location || "Not provided"} />
              </dl>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/dashboard/buyer/orders/${payment.orderId || payment.stripeSessionId || sessionId}`}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View order details
            </Link>
            <Link
              href="/dashboard/buyer#my-orders"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to my orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Transaction record
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Stored payment details
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>- Secure Stripe charge completed.</li>
            <li>- Order status saved on the server.</li>
            <li>- Payment history updated for future reference.</li>
            <li>- Buyer can revisit the transaction anytime.</li>
          </ul>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-sm text-slate-100">
            <p className="font-semibold text-emerald-300">Transaction ID</p>
            <p className="mt-2 break-all text-slate-200">
              {transactionId || "Unavailable"}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatusCard({ eyebrow, title, message, href, linkLabel }) {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
          {eyebrow}
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {message}
        </p>
        <Link
          href={href}
          className="mt-7 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {linkLabel}
        </Link>
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

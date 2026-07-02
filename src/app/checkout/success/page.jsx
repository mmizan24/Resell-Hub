import { auth } from "@/lib/auth";
import { fulfillCheckout } from "@/lib/orders";
import { headers } from "next/headers";
import Link from "next/link";

function formatPaidAmount(amount, currency) {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: (currency || "bdt").toUpperCase(),
  }).format(amount / 100);
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment successful | ResellHub",
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const { session_id: sessionId } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const buyer = session?.user;

  if (!buyer || buyer.role !== "buyer") {
    return (
      <StatusCard
        eyebrow="Sign in required"
        title="Confirm your payment"
        message="Sign in with the buyer account used for this purchase to view the payment result."
        href="/auth/sign-in"
        linkLabel="Sign in"
        tone="warning"
      />
    );
  }

  if (typeof sessionId !== "string") {
    return (
      <StatusCard
        eyebrow="Invalid checkout"
        title="The payment session is missing"
        message="Return to your dashboard and try purchasing the product again."
        href="/dashboard/buyer"
        linkLabel="Buyer dashboard"
        tone="warning"
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
        message="Your card has not necessarily been charged. Check Stripe and your buyer dashboard before trying again."
        href="/dashboard/buyer#my-orders"
        linkLabel="View my orders"
        tone="error"
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
        tone="warning"
      />
    );
  }

  const paidAmount = formatPaidAmount(
    result.checkoutSession.amount_total,
    result.checkoutSession.currency,
  );

  return (
    <StatusCard
      eyebrow="Payment successful"
      title="Your order is confirmed"
      message={
        paidAmount
          ? `${paidAmount} was paid successfully through Stripe.`
          : "Your payment was completed successfully through Stripe."
      }
      href="/dashboard/buyer#my-orders"
      linkLabel="View my orders"
      tone="success"
    />
  );
}

function StatusCard({
  eyebrow,
  title,
  message,
  href,
  linkLabel,
  tone,
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
  };

  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${tones[tone]}`}
        >
          {eyebrow}
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {message}
        </p>
        <Link
          href={href}
          className="mt-7 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {linkLabel}
        </Link>
      </div>
    </section>
  );
}

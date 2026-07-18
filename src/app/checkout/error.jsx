"use client";

import Link from "next/link";

export default function CheckoutError({ error, reset }) {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-700">
          Checkout error
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">
          We could not load the payment page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {error?.message || "Please try again or return to the products page."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Try again
          </button>
          <Link
            href="/products"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}

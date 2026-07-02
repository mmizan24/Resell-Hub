import { ObjectId } from "mongodb";
import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled | ResellHub",
};

export default async function CheckoutCancelPage({ searchParams }) {
  const { product_id: productId } = await searchParams;
  const productHref =
    typeof productId === "string" && ObjectId.isValid(productId)
      ? `/products/${productId}`
      : "/dashboard/buyer";

  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
          Checkout cancelled
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">
          No payment was made
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Your Stripe Checkout session was cancelled. You can return to the
          product or continue browsing.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={productHref}
            className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Return to product
          </Link>
          <Link
            href="/dashboard/buyer#all-seller-products"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}

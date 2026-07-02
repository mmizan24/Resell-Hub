import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Product not found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          This listing is unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The product may have been removed, or the link may be incorrect.
        </p>
        <Link
          href="/products"
          className="mt-7 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Browse products
        </Link>
      </div>
    </section>
  );
}

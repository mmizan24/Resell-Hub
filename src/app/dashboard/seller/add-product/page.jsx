"use client";

import { ProductForm } from "../../../../../components/dashboard/ProductForm";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function SellerAddProductPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <section className="flex min-h-90 items-center justify-center px-5 py-12">
        <p className="text-sm font-medium text-slate-500">Loading add product page...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Add Product</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in as a seller to add a new product listing.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (user.role !== "seller" && user.role !== "admin") {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Seller access only</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page is available only for seller accounts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">Add a product</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Create a new listing with a focused product entry form.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <ProductForm seller={user} />
        </div>
      </div>
    </section>
  );
}

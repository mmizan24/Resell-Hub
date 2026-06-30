"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const DASHBOARD_CARDS = [
  { label: "Total orders", value: "0", description: "Orders you have placed." },
  { label: "Wishlist Count", value: "0", description: "Products saved for later." },
  { label: "Recent Purchases", value: "0", description: "Latest completed purchases." },
];

export default function BuyerDashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <section className="flex min-h-[360px] items-center justify-center px-5 py-12">
        <p className="text-sm font-medium text-slate-500">Loading buyer dashboard...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Buyer Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in as a buyer to view your orders, wishlist, and purchases.
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

  if (user.role !== "buyer") {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Buyer access only</h1>
          <p className="mt-2 text-sm text-slate-600">
            This dashboard is available only for buyer accounts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-8 md:px-8 md:py-10">
      <div className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Buyer Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Welcome back, {user.name?.split(" ")[0] || "Buyer"}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Keep track of your orders, saved products, and recent purchases.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {DASHBOARD_CARDS.map((card) => (
            <div key={card.label} className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-blue-950">{card.value}</p>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>

        <div id="all-seller-products" className="mt-8 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-blue-950">ALL seller products</h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse available products from sellers across ResellHub.
          </p>
        </div>
      </div>
    </section>
  );
}

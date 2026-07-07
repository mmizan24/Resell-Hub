"use client";

import { ProductForm } from "../../../../components/dashboard/ProductForm";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { SellerProductsTable } from "../../../../components/dashboard/SellerProductsTable";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function SellerDashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <section className="flex min-h-[360px] items-center justify-center px-5 py-12">
        <p className="text-sm font-medium text-slate-500">Loading seller dashboard...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in as a seller to manage your products and orders.
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
            This dashboard is available only for seller accounts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-8 md:px-8 md:py-10">
      <div className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Welcome back, {user.name?.split(" ")[0] || "Seller"}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your listed products, review incoming orders, and track sales performance from one place.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div id="all-products" className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-blue-950">All products</h2>
            <p className="mt-2 text-sm text-slate-600">Review every product listed in your store.</p>
          </div>
          <div id="my-product" className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-blue-950">My Product</h2>
            <p className="mt-2 text-sm text-slate-600">Add, edit, and manage your own listings.</p>
          </div>
          <div id="manage-orders" className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-blue-950">Manage Orders</h2>
            <p className="mt-2 text-sm text-slate-600">Track buyer requests and order progress.</p>
          </div>
          <div id="sales-analytics" className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-blue-950">Sales Analytics</h2>
            <p className="mt-2 text-sm text-slate-600">Monitor your selling activity and performance.</p>
          </div>
        </div>

        <div className="mt-8">
          <ProfileEditor key={user?.id || user?.email || "seller-profile"} user={user} />
        </div>

        <ProductForm seller={user} />
        <SellerProductsTable />
      </div>
    </section>
  );
}

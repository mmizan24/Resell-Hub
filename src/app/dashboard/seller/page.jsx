import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { SellerSalesAnalyticsPanel } from "@/components/orders/SellerSalesAnalyticsPanel";
import { SellerProductsTable } from "../../../../components/dashboard/SellerProductsTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  const displayName =
    typeof user?.name === "string" && user.name.trim()
      ? user.name.trim().split(/\s+/)[0]
      : "Seller";

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
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Welcome back, {displayName}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review your products and sales performance from one place. Add product
          listings and manage orders from the dedicated dashboard pages.
        </p>

        <div className="mt-8">
          <ProfileEditor key={user?.id || user?.email || "seller-profile"} user={user} />
        </div>

        <SellerProductsTable seller={user} />
        <SellerSalesAnalyticsPanel sellerId={user.id} />
      </div>
    </section>
  );
}

import { BuyerProductCatalog } from "../../../../components/dashboard/BuyerProductCatalog";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { auth } from "@/lib/auth";
import { getBuyerOrders } from "@/lib/orders";
import { getAvailableProducts } from "@/lib/products";
import { headers } from "next/headers";
import Link from "next/link";

function formatPriceFromMinorUnits(amount, currency) {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: (currency || "bdt").toUpperCase(),
  }).format(amount / 100);
}

export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Buyer Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in as a buyer to browse products and manage orders.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (user.role !== "buyer" && user.role !== "admin") {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">
            Buyer access only
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with a buyer account to purchase products.
          </p>
        </div>
      </section>
    );
  }

  const [products, orders] = await Promise.all([
    getAvailableProducts(),
    getBuyerOrders(user.id),
  ]);
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "paid",
  );

  return (
    <section className="px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Buyer Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Welcome back, {user.name?.split(" ")[0] || "Buyer"}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Browse seller listings and manage purchases from one place.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total orders</p>
            <p className="mt-3 text-3xl font-bold text-blue-950">
              {orders.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Checkout attempts and completed orders.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Completed purchases
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-950">
              {paidOrders.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Payments confirmed by Stripe.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Available products
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-950">
              {products.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Active listings from sellers.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <ProfileEditor key={user?.id || user?.email || "buyer-profile"} user={user} />
        </div>

        <BuyerProductCatalog products={products} />

        <section id="my-orders" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-blue-950">My orders</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your most recent Stripe Checkout activity.
          </p>

          {orders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              You have not placed an order yet.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <article
                    key={order._id}
                    className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {order.product?.title || "Product order"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-BD",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "Date unavailable"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-bold text-blue-700">
                        {formatPriceFromMinorUnits(
                          order.amountTotal,
                          order.currency,
                        )}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Paid"
                          : "Payment pending"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div
            id="payment-history"
            className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-bold text-blue-950">
              Payment history
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Paid orders appear in the order history above.
            </p>
          </div>
          <div
            id="profile-management"
            className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-bold text-blue-950">
              Profile management
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Stripe uses your account email during secure Checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

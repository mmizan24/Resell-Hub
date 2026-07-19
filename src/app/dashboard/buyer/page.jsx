import { BuyerProductCatalog } from "../../../../components/dashboard/BuyerProductCatalog";
import { ProductServiceNotice } from "../../../../components/Home/ProductServiceNotice";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { WishlistPanel } from "../../../components/wishlist/WishlistPanel";
import { BuyerReviewPanel } from "../../../components/reviews/BuyerReviewPanel";
import { OrderStatusFlow } from "@/components/orders/OrderStatusFlow";
import { auth } from "@/lib/auth";
import { getBuyerOrders } from "@/lib/orders";
import { getAvailableProducts } from "@/lib/products";
import { getBuyerReviews } from "@/lib/reviews";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { normalizePage, paginateItems } from "@/lib/pagination";
import { headers } from "next/headers";
import Image from "next/image";
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

export default async function BuyerDashboardPage({ searchParams }) {
  const params = await searchParams;
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

  const [productsResult, ordersResult, reviewsResult] = await Promise.allSettled([
    getAvailableProducts(),
    getBuyerOrders(user.id),
    getBuyerReviews(user.id),
  ]);

  const products =
    productsResult.status === "fulfilled" ? productsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  const reviews = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
  const ordersPage = normalizePage(params?.page, 1);
  const paginatedOrders = paginateItems(orders, ordersPage, 5);
  const productsLoadFailed = productsResult.status === "rejected";
  const ordersLoadFailed = ordersResult.status === "rejected";
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "paid",
  );
  const activeOrders = orders.filter(
    (order) => (order.orderStatus || "pending") !== "delivered",
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
              Active tracking items
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-950">
              {activeOrders.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Orders still moving through the fulfillment flow.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <ProfileEditor key={user?.id || user?.email || "buyer-profile"} user={user} />
        </div>

        {productsLoadFailed ? (
          <ProductServiceNotice title="Available products are temporarily unavailable" />
        ) : (
          <BuyerProductCatalog products={products} userId={user.id} />
        )}

        <WishlistPanel userId={user.id} />

        <BuyerReviewPanel paidOrders={paidOrders} reviews={reviews} />

        <section id="my-orders" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-blue-950">My orders</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your most recent Stripe Checkout activity.
          </p>

          {ordersLoadFailed ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-900 shadow-sm">
              Your orders are temporarily unavailable because the backend API is offline.
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              You have not placed an order yet.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {paginatedOrders.items.map((order) => (
                  <article
                    key={order._id}
                    className="grid gap-4 p-5 lg:grid-cols-[120px_minmax(0,1fr)_360px] lg:items-start"
                  >
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {order.product?.image ? (
                        <Image
                          src={order.product.image}
                          alt={order.product?.title || "Product order"}
                          width={240}
                          height={180}
                          unoptimized
                          className="h-28 w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs font-medium text-slate-400">
                          Image unavailable
                        </div>
                      )}
                    </div>

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
                      <div className="mt-4">
                        <OrderStatusFlow status={order.orderStatus} />
                      </div>
                    </div>

                    <div className="space-y-3 lg:text-right">
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
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Current status
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {(order.orderStatus || "pending")
                            .charAt(0)
                            .toUpperCase()}
                          {(order.orderStatus || "pending").slice(1)}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Your seller will move this order from pending to accepted,
                          processing, shipped, and delivered.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            {paginatedOrders.totalPages > 1 ? (
              <div className="px-5 pb-5">
                <PaginationLinks
                  basePath="/dashboard/buyer"
                  searchParams={ordersPage > 1 ? { page: ordersPage } : {}}
                  page={paginatedOrders.page}
                  totalPages={paginatedOrders.totalPages}
                  totalItems={paginatedOrders.totalItems}
                  startIndex={paginatedOrders.startIndex}
                  endIndex={paginatedOrders.endIndex}
                  itemLabel="orders"
                />
              </div>
            ) : null}
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
              Review your Stripe transactions, payment status, and transaction IDs.
            </p>
            <Link
              href="/dashboard/buyer/payments"
              className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Open payment history
            </Link>
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

"use client";

import { useEffect, useMemo, useState } from "react";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "BDT 0";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(amount);
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {sublabel ? <p className="mt-1 text-sm text-slate-500">{sublabel}</p> : null}
    </div>
  );
}

export function SellerSalesAnalyticsPanel({ sellerId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        const response = await fetch("/api/seller/analytics", { cache: "no-store" });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Analytics could not be loaded.");
        }

        if (active) {
          setAnalytics(result.data || null);
          setError("");
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError?.message || "Analytics could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [sellerId]);

  const maxTopRevenue = useMemo(() => {
    const topProducts = analytics?.topProducts || [];
    return Math.max(1, ...topProducts.map((item) => Number(item.revenue) || 0));
  }, [analytics]);

  return (
    <section id="sales-analytics" className="mt-10 scroll-mt-24">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Sales analytics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-blue-950">
            Seller performance
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Visual sales summary for monthly revenue and top-selling products.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading sales analytics...
        </div>
      ) : analytics ? (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total revenue"
              value={formatCurrency(analytics.summary?.totalRevenue)}
              sublabel="Paid orders only"
            />
            <StatCard
              label="Total orders"
              value={analytics.summary?.totalOrders || 0}
              sublabel="Confirmed purchases"
            />
            <StatCard
              label="Units sold"
              value={analytics.summary?.totalQuantity || 0}
              sublabel="Across all paid orders"
            />
            <StatCard
              label="Average order"
              value={formatCurrency(analytics.summary?.averageOrderValue)}
              sublabel="Average paid order value"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Monthly sales trend
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Revenue over the last six months.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  BDT
                </span>
              </div>

              <div className="mt-6 flex min-h-[280px] items-end gap-3 overflow-x-auto pb-2">
                {(analytics.monthlyTrend || []).map((item) => (
                  <div key={item.key} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
                    <div className="flex h-[220px] w-full items-end justify-center">
                      <div
                        className="w-full max-w-[56px] rounded-t-2xl bg-gradient-to-t from-blue-700 to-sky-400 shadow-[0_16px_32px_rgba(37,99,235,0.18)] transition hover:opacity-90"
                        style={{ height: `${Math.max(4, item.barHeight || 0)}%` }}
                        title={`${item.label}: ${formatCurrency(item.revenue)}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {(analytics.monthlyTrend || []).slice(-3).map((item) => (
                  <div key={item.key} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-base font-bold text-slate-900">
                      {formatCurrency(item.revenue)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.orders} orders
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Top selling products
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Highest revenue products in your store.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {(analytics.topProducts || []).length > 0 ? (
                  analytics.topProducts.map((product, index) => {
                    const revenue = Number(product.revenue) || 0;
                    const width = (revenue / maxTopRevenue) * 100;

                    return (
                      <div key={product.productId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              #{index + 1}
                            </p>
                            <h4 className="mt-1 text-sm font-bold text-slate-900">
                              {product.title}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-700">
                              {formatCurrency(revenue)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.quantity} sold
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400"
                            style={{ width: `${Math.max(5, width)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No paid orders are available yet, so there is no sales chart to show.
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No analytics data available.
        </div>
      )}
    </section>
  );
}

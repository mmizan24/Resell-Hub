import { ProductServiceNotice } from "../../../components/Home/ProductServiceNotice";
import { getSellerDirectory } from "@/lib/marketplace";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { normalizePage, paginateItems } from "@/lib/pagination";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All sellers | ResellHub",
  description: "Browse the full ResellHub seller directory.",
};

function getInitials(value) {
  return String(value || "Seller")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function SellersPage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";
  const page = normalizePage(params?.page, 1);
  const pageSize = 12;

  let sellers = [];
  let loadError = null;

  try {
    sellers = await getSellerDirectory({ limit: 200, search: q });
  } catch (error) {
    loadError = error;
  }

  const paginatedSellers = paginateItems(sellers, page, pageSize);
  const totalListings = sellers.reduce((sum, seller) => sum + Number(seller.productCount || 0), 0);
  const totalSales = sellers.reduce((sum, seller) => sum + Number(seller.orderCount || seller.soldCount || 0), 0);
  const averageRating = sellers.length
    ? sellers.reduce((sum, seller) => sum + Number(seller.averageRating || 0), 0) / sellers.length
    : 0;

  return (
    <main className="bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Seller directory
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">All sellers</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Explore the sellers powering the marketplace, ranked by live backend activity.
              </p>
            </div>

            <form className="flex w-full max-w-md gap-3 md:w-auto" method="get">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search seller name, location, or category"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-80"
              />
              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Sellers" value={sellers.length} tone="blue" />
            <StatCard label="Listings" value={totalListings} tone="emerald" />
            <StatCard label="Sales" value={totalSales} tone="amber" />
            <StatCard label="Average rating" value={averageRating ? averageRating.toFixed(1) : "N/A"} tone="violet" />
          </div>
        </div>

        {loadError ? (
          <div className="mt-6">
            <ProductServiceNotice title="Seller data is temporarily unavailable" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {paginatedSellers.items.map((seller) => (
              <article
                key={seller._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {seller.photo ? (
                      <Image
                        src={seller.photo}
                        alt={seller.name}
                        width={64}
                        height={64}
                        unoptimized
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-base font-bold text-blue-700">
                        {getInitials(seller.name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="truncate text-lg font-bold text-slate-950">{seller.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{seller.location || "Bangladesh"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {seller.averageRating ? seller.averageRating.toFixed(1) : "New"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-950">{seller.productCount || 0}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">Listings</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-950">{seller.orderCount || seller.soldCount || 0}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">Sales</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-950">{seller.categoryCount || 0}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">Categories</p>
                      </div>
                    </div>

                    {seller.categories?.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {seller.categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {seller.sampleTitles?.length > 0 ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        Latest listings: {seller.sampleTitles.join(" • ")}
                      </p>
                    ) : null}

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Verified through marketplace activity
                      </p>
                      <Link
                        href="/products"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Browse products
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {paginatedSellers.totalPages > 1 ? (
          <PaginationLinks
            basePath="/sellers"
            searchParams={q ? { q } : {}}
            page={paginatedSellers.page}
            totalPages={paginatedSellers.totalPages}
            totalItems={paginatedSellers.totalItems}
            startIndex={paginatedSellers.startIndex}
            endIndex={paginatedSellers.endIndex}
            itemLabel="sellers"
          />
        ) : null}
      </section>
    </main>
  );
}

function StatCard({ label, value, tone }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.blue}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

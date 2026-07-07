import { BuyButton } from "../checkout/BuyButton";
import Image from "next/image";
import Link from "next/link";

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice)
    ? `৳ ${numericPrice.toLocaleString("en-BD")}`
    : "Price unavailable";
}

export function BuyerProductCatalog({ products }) {
  return (
    <section id="all-seller-products" className="mt-10 scroll-mt-24">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Marketplace
        </p>
        <h2 className="mt-1 text-2xl font-bold text-blue-950">
          All seller products
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Browse available listings and pay securely through Stripe Checkout.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-slate-700">
            No products are currently available.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Check back after sellers add new listings.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const image =
              Array.isArray(product.images) &&
              typeof product.images[0] === "string"
                ? product.images[0]
                : null;

            return (
              <article
                key={product._id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] border-b border-slate-100 bg-slate-50">
                  {image ? (
                    <Image
                      src={image}
                      alt={`${product.title} product photo`}
                      fill
                      unoptimized
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                      Image unavailable
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white">
                    {product.category || "Other"}
                  </span>
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {product.status === "available" ? "Available" : "Out of stock"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500">
                    {product.condition || "Condition not specified"} · Sold by{" "}
                    {product.sellerInfo?.name || "ResellHub seller"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-2xl font-bold text-blue-700">
                    {formatPrice(product.price)}
                  </p>

                  <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
                    <Link
                      href={`/products/${product._id}`}
                      className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Details
                    </Link>
                    <BuyButton productId={product._id} available={product.status === "available"} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

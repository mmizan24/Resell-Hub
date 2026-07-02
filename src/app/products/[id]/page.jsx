import { ProductGallery } from "../../../../components/products/ProductGallery";
import { BuyButton } from "../../../../components/checkout/BuyButton";
import { getProductById } from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  return `৳ ${numericPrice.toLocaleString("en-BD")}`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product not found | ResellHub",
    };
  }

  return {
    title: `${product.title} | ResellHub`,
    description:
      product.description?.slice(0, 160) ||
      `View ${product.title} on ResellHub.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const isAvailable = product.status === "available";
  const seller = product.sellerInfo || {};

  return (
    <section className="bg-slate-50 px-5 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link href="/" className="transition hover:text-blue-700">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="transition hover:text-blue-700">
            Products
          </Link>
          <span aria-hidden="true">/</span>
          <span className="max-w-56 truncate font-medium text-slate-700">
            {product.title}
          </span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-12">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {product.category || "Uncategorized"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {product.condition || "Condition not specified"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {isAvailable ? "Available" : "Out of stock"}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
                {product.title}
              </h1>
              <p className="mt-5 text-3xl font-bold text-blue-700">
                {formatPrice(product.price)}
              </p>
              <BuyButton
                productId={product._id}
                available={isAvailable}
                className="mt-6"
              />

              <div className="mt-7 border-t border-slate-100 pt-7">
                <h2 className="text-lg font-bold text-slate-900">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {product.description || "No description was provided."}
                </p>
              </div>
            </div>

            <aside className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Seller information
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                {seller.name || "ResellHub seller"}
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                {seller.email && (
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="mt-1 break-all font-medium text-slate-800">
                      {seller.email}
                    </dd>
                  </div>
                )}
                {seller.phone && (
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {seller.phone}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {seller.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className={`rounded-lg px-4 py-3 text-center text-sm font-semibold text-white transition ${
                      isAvailable
                        ? "bg-blue-700 hover:bg-blue-800"
                        : "pointer-events-none bg-slate-300"
                    }`}
                    aria-disabled={!isAvailable}
                  >
                    Call seller
                  </a>
                )}
                {seller.email && (
                  <a
                    href={`mailto:${seller.email}?subject=${encodeURIComponent(
                      `ResellHub enquiry: ${product.title}`,
                    )}`}
                    className="rounded-lg border border-blue-200 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Email seller
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

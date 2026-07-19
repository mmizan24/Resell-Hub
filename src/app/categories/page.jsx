import Link from "next/link";
import { ProductServiceNotice } from "../../../components/Home/ProductServiceNotice";
import { getProducts } from "@/lib/products";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { normalizePage, paginateItems } from "@/lib/pagination";

export const metadata = {
  title: "Categories | ResellHub",
  description: "Browse products by category on ResellHub.",
};

export const dynamic = "force-dynamic";

const CATEGORY_META = [
  {
    name: "Electronics",
    description: "Phones, accessories, audio gear, and everyday tech.",
    accent: "from-sky-50 to-white border-sky-100 text-sky-700",
  },
  {
    name: "Mobile Phones",
    description: "Smartphones, feature phones, and mobile bundles.",
    accent: "from-indigo-50 to-white border-indigo-100 text-indigo-700",
  },
  {
    name: "Fashion",
    description: "Clothing, shoes, bags, and style essentials.",
    accent: "from-rose-50 to-white border-rose-100 text-rose-700",
  },
  {
    name: "Furniture",
    description: "Chairs, tables, storage, and home furniture.",
    accent: "from-amber-50 to-white border-amber-100 text-amber-700",
  },
  {
    name: "Vehicles",
    description: "Cars, bikes, parts, and mobility listings.",
    accent: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
  },
  {
    name: "Home & Living",
    description: "Kitchen, decor, appliances, and daily home items.",
    accent: "from-violet-50 to-white border-violet-100 text-violet-700",
  },
  {
    name: "Sports",
    description: "Fitness gear, outdoor equipment, and sports items.",
    accent: "from-cyan-50 to-white border-cyan-100 text-cyan-700",
  },
  {
    name: "Books",
    description: "Study books, novels, guides, and learning material.",
    accent: "from-slate-50 to-white border-slate-200 text-slate-700",
  },
  {
    name: "Other",
    description: "Everything else that still deserves a good listing.",
    accent: "from-stone-50 to-white border-stone-200 text-stone-700",
  },
];

function buildCategoryStats(products) {
  const stats = new Map();

  CATEGORY_META.forEach((category) => {
    stats.set(category.name, {
      ...category,
      count: 0,
      sample: [],
    });
  });

  products.forEach((product) => {
    const name = product.category || "Other";
    const current = stats.get(name) || {
      name,
      description: "Browse this category on ResellHub.",
      accent: "from-slate-50 to-white border-slate-200 text-slate-700",
      count: 0,
      sample: [],
    };

    current.count += 1;
    if (product.title && current.sample.length < 3) {
      current.sample.push(product.title);
    }
    stats.set(name, current);
  });

  return Array.from(stats.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function CategoriesPage({ searchParams }) {
  const params = await searchParams;
  const page = normalizePage(params?.page, 1);
  const pageSize = 6;

  let products = [];
  let loadError = null;

  try {
    products = await getProducts();
  } catch (error) {
    loadError = error;
  }

  const categories = buildCategoryStats(products);
  const paginatedCategories = paginateItems(categories, page, pageSize);
  const totalListings = products.length;
  const activeCategories = categories.filter((category) => category.count > 0).length;
  const topCategory = categories[0];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Categories</p>
              <h1 className="mt-2 text-3xl font-bold text-blue-950">Shop by category</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                If you want to browse category-wise, this page gives you a clean entry point into the marketplace.
                Pick a category and jump straight into the filtered product list.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              View all products
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm text-slate-600">Total listings</p>
              <p className="mt-2 text-3xl font-bold text-blue-950">{totalListings}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm text-slate-600">Active categories</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{activeCategories}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm text-slate-600">Top category</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">{topCategory?.name || "N/A"}</p>
              <p className="mt-1 text-xs text-slate-500">{topCategory?.count || 0} listings</p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-sm text-slate-600">Browse style</p>
              <p className="mt-2 text-xl font-bold text-violet-700">Category-first shopping</p>
              <p className="mt-1 text-xs text-slate-500">Fast filtering, cleaner discovery</p>
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="mt-6">
            <ProductServiceNotice title="Category data is temporarily unavailable" />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedCategories.items.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${category.accent} no-underline`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-950">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-700">
                  {category.count} items
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(category.sample.length > 0 ? category.sample : ["No live listings yet"]).map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                Browse listings <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>

        {paginatedCategories.totalPages > 1 ? (
          <PaginationLinks
            basePath="/categories"
            searchParams={{ page }}
            page={paginatedCategories.page}
            totalPages={paginatedCategories.totalPages}
            totalItems={paginatedCategories.totalItems}
            startIndex={paginatedCategories.startIndex}
            endIndex={paginatedCategories.endIndex}
            itemLabel="categories"
          />
        ) : null}
      </section>
    </main>
  );
}

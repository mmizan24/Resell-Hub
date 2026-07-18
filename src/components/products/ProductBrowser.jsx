"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function ProductImage({ src, title }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <div className="text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto h-10 w-10" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.182 0l5.16 5.16m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm12-11.25h.008v.008h-.008V8.25Z"
            />
          </svg>
          <p className="mt-2 text-xs font-medium">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!hasLoaded ? (
        <div className="absolute inset-0 animate-pulse bg-slate-100" aria-hidden="true" />
      ) : null}
      <Image
        src={src}
        alt={`${title} product photo`}
        fill
        unoptimized
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasError(true)}
        className={`object-contain p-3 transition duration-500 group-hover:scale-[1.03] ${
          hasLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

function StarRow({ value }) {
  const rating = Number(value);
  const filled = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 0;

  return (
    <div className="flex items-center gap-0.5" aria-label={filled ? `${filled} out of 5 stars` : "No reviews"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${star <= filled ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
          aria-hidden="true"
        >
          <path
            d="m12 17.27 5.18 3.13-1.39-5.89L20.5 10.2l-6.03-.51L12 4.25 9.53 9.69 3.5 10.2l4.71 4.31-1.39 5.89L12 17.27Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product, reviewSummary }) {
  const image =
    Array.isArray(product.images) && typeof product.images[0] === "string"
      ? product.images[0]
      : null;
  const stockCount = Number.isInteger(product.quantity) ? product.quantity : 1;
  const priceValue = toNumber(product.price);
  const availability = (product.status || "").toLowerCase() === "available";
  const reviewCount = reviewSummary?.count || 0;
  const averageRating = reviewSummary?.averageRating || null;
  const latestReview = reviewSummary?.latestReviews?.[0] || null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-white">
        <ProductImage src={image} title={product.title || "Product"} />
        <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
          {product.category || "Uncategorized"}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            (product.condition || "").toLowerCase() === "new"
              ? "bg-emerald-100 text-emerald-700"
              : (product.condition || "").toLowerCase() === "good"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {product.condition || "Condition not set"}
        </span>
        <span
          className={`absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            availability ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {availability ? "Available" : "Out of stock"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
          {stockCount} left
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
            {product.title || "Untitled product"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            by {product.sellerInfo?.name || "Unknown seller"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          {reviewCount > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRow value={averageRating} />
                  <span className="text-xs font-semibold text-slate-700">
                    {averageRating ? averageRating.toFixed(1) : "0.0"}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {reviewCount} review{reviewCount === 1 ? "" : "s"}
                </span>
              </div>
              {latestReview?.comments ? (
                <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                  “{latestReview.comments}”
                </p>
              ) : (
                <p className="text-xs text-slate-500">Ratings are available for this product.</p>
              )}
              <Link
                href={`/products/${product._id}#reviews`}
                className="inline-flex text-xs font-semibold text-blue-700 transition hover:text-blue-800"
              >
                Read all reviews
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">No reviews yet</p>
              <p className="text-xs leading-5 text-slate-500">
                Be the first buyer to share feedback after purchase.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-blue-700">৳ {priceValue.toLocaleString("en-BD")}</p>
            <p className="text-xs text-slate-500">Balance remaining: {stockCount}</p>
          </div>
          <Link
            href={`/products/${product._id}`}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white no-underline transition hover:bg-blue-700"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductBrowser({ products = [], initialCategory = "", reviewSummaries = {} }) {
  const categoryOptions = useMemo(() => {
    const categories = new Set(["All categories"]);

    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category);
      }
    });

    return Array.from(categories);
  }, [products]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sellerTerm, setSellerTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All categories");
  const [sortMode, setSortMode] = useState("newest");
  const [condition, setCondition] = useState("all");
  const [availability, setAvailability] = useState("all");

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sellerQuery = sellerTerm.trim().toLowerCase();
    const activeCategory = selectedCategory.toLowerCase();

    const filtered = products.filter((product) => {
      const fields = [
        product.title,
        product.category,
        product.condition,
        product.status,
        product.price,
        product.description,
        product.sellerInfo?.name,
        product.sellerInfo?.email,
        product.sellerInfo?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || fields.includes(term);
      const matchesSeller =
        !sellerQuery ||
        [
          product.sellerInfo?.name,
          product.sellerInfo?.email,
          product.sellerInfo?.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(sellerQuery);
      const matchesCategory =
        selectedCategory === "All categories" ||
        (product.category || "").toLowerCase() === activeCategory;
      const matchesCondition =
        condition === "all" || (product.condition || "").toLowerCase() === condition;
      const matchesAvailability =
        availability === "all" ||
        (availability === "available"
          ? (product.status || "").toLowerCase() === "available"
          : (product.status || "").toLowerCase() !== "available");

      return matchesSearch && matchesSeller && matchesCategory && matchesCondition && matchesAvailability;
    });

    const sorted = [...filtered];

    switch (sortMode) {
      case "newest":
        sorted.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return bDate - aDate;
        });
        break;
      case "price-asc":
        sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
        break;
      case "title-asc":
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      default:
        break;
    }

    return sorted;
  }, [availability, condition, products, searchTerm, sellerTerm, selectedCategory, sortMode]);

  const resetFilters = () => {
    setSearchTerm("");
    setSellerTerm("");
    setSelectedCategory("All categories");
    setSortMode("newest");
    setCondition("all");
    setAvailability("all");
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Marketplace</p>
            <h1 className="mt-2 text-3xl font-bold text-blue-950">Browse all products</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search by product name or seller, narrow by category, and sort by price so buyers can find the right listing faster.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {filteredProducts.length} listings shown
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, category, price, condition..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</span>
            <input
              value={sellerTerm}
              onChange={(event) => setSellerTerm(event.target.value)}
              placeholder="Search seller name or email..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Condition</span>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All conditions</option>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="used">Used</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="title-asc">Name: A to Z</option>
              <option value="title-desc">Name: Z to A</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAvailability("all")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              availability === "all" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All listings
          </button>
          <button
            type="button"
            onClick={() => setAvailability("available")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              availability === "available" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Available only
          </button>
          <button
            type="button"
            onClick={() => setAvailability("sold")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              availability === "sold" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Out of stock
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              reviewSummary={reviewSummaries?.[product._id]}
            />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
            No products match your filters.
          </div>
        )}
      </div>
    </section>
  );
}

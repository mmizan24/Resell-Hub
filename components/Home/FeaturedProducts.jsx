"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function ProductImage({ src, title }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto h-10 w-10"
            aria-hidden="true"
          >
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
      {!hasLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-slate-100"
          aria-hidden="true"
        />
      )}
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

function ProductCard({ product, index }) {
  const image =
    Array.isArray(product.images) && typeof product.images[0] === "string"
      ? product.images[0]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-white">
        <ProductImage src={image} title={product.title || "Product"} />
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {product.category}
        </span>
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
          product.condition === "New"        ? "bg-green-100 text-green-700"
          : product.condition === "Good"     ? "bg-blue-100 text-blue-700"
          : product.condition === "Fair"     ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-600"
        }`}>
          {product.condition}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold text-sm leading-snug mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3">
          by {product.sellerInfo?.name || "Unknown seller"}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-blue-700 text-lg font-bold">
            ৳ {product.price?.toLocaleString()}
          </p>
          <Link
            href={`/products/${product._id}`}
            className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedProducts({
  products = [],
  eyebrow = "Fresh listings",
  title = "Featured products",
  showViewAll = true,
}) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-5">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
              {eyebrow}
            </p>
            <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold">
              {title}
            </h2>
          </div>
          {showViewAll && (
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all no-underline"
            >
              View all →
            </Link>
          )}
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-1">Be the first to list something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors no-underline"
            >
              View all products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

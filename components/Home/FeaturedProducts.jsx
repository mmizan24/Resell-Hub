"use client";

import { motion } from "motion/react";
import Link from "next/link";

function ProductCard({ product, index }) {
  const image = product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {product.category === "Electronics"   ? "💻"
            : product.category === "Mobile Phones"? "📱"
            : product.category === "Fashion"      ? "👗"
            : product.category === "Furniture"    ? "🛋️"
            : product.category === "Vehicles"     ? "🚗"
            : "🏷️"}
          </div>
        )}
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

export function FeaturedProducts({ products }) {
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
              Fresh listings
            </p>
            <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold">
              Featured products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all no-underline"
          >
            View all →
          </Link>
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

        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors no-underline"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
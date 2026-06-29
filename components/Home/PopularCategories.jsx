"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function PopularCategories({ categories = [] }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Browse by type
          </p>
          <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold mb-3">
            Popular categories
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            Find what you need fast — from everyday essentials to rare finds.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border ${cat.bg} ${cat.border} hover:shadow-md transition-all duration-200 no-underline group`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <div className="text-center">
                  <p className="text-gray-800 font-semibold text-sm">{cat.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{cat.count} listings</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

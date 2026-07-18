"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

function starString(rating) {
  const numeric = Number(rating);
  const clamped = Number.isFinite(numeric) ? Math.max(0, Math.min(5, Math.round(numeric))) : 0;
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

function getInitials(value) {
  return String(value || "Seller")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TrustedSellers({ sellers = [] }) {
  const fallback = [
    { _id: "s1", name: "Nusrat Jahan", location: "Dhaka", productCount: 24, orderCount: 58, averageRating: 4.9 },
    { _id: "s2", name: "Arif Hossain", location: "Chittagong", productCount: 18, orderCount: 43, averageRating: 4.8 },
    { _id: "s3", name: "Sumaiya Akter", location: "Sylhet", productCount: 31, orderCount: 72, averageRating: 5.0 },
    { _id: "s4", name: "Tanvir Ahmed", location: "Rajshahi", productCount: 12, orderCount: 29, averageRating: 4.7 },
    { _id: "s5", name: "Farida Begum", location: "Khulna", productCount: 9, orderCount: 21, averageRating: 4.8 },
    { _id: "s6", name: "Sabbir Rahman", location: "Comilla", productCount: 15, orderCount: 37, averageRating: 4.9 },
  ];

  const displaySellers = sellers.length > 0 ? sellers : fallback;

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Top rated
          </p>
          <h2 className="mb-3 text-3xl font-bold text-gray-900 lg:text-4xl">
            Trusted sellers
          </h2>
          <p className="mx-auto max-w-md text-base text-gray-500">
            Buy with confidence from our highest-rated community sellers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displaySellers.map((seller, i) => (
            <motion.div
              key={seller._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative shrink-0">
                {seller.photo ? (
                  <Image
                    src={seller.photo}
                    alt={seller.name}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                    {getInitials(seller.name)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{seller.name}</p>
                <p className="mb-2 text-xs text-gray-400">{seller.location}</p>
                <div className="mb-3 text-xs text-yellow-400">
                  {starString(seller.averageRating || seller.rating || 0)}{" "}
                  <span className="ml-1 text-gray-400">
                    {seller.averageRating || seller.rating || "New"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{seller.productCount || 0}</p>
                    <p className="text-[10px] text-gray-400">Listings</p>
                  </div>
                  <div className="w-px bg-gray-100" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{seller.orderCount || seller.soldCount || 0}</p>
                    <p className="text-[10px] text-gray-400">Sales</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href="/sellers"
            className="inline-block rounded-xl border-2 border-blue-600 px-8 py-3 text-sm font-semibold text-blue-600 no-underline transition-colors hover:bg-blue-600 hover:text-white"
          >
            View all sellers →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function HeroSection({ stats = {} }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 min-h-[92vh] flex items-center overflow-hidden">

      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-blue-500/20 rounded-full" />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 w-full py-20 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left: text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Bangladesh&apos;s #1 resell marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            Buy & Sell{" "}
            <span className="relative">
              <span className="text-blue-200">Pre-owned</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>{" "}
            <br />Goods with Confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg"
          >
            From electronics to furniture — discover thousands of quality
            second-hand products from trusted sellers across Bangladesh.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <Link
              href="/products"
              className="bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors no-underline text-sm shadow-lg"
            >
              Browse products →
            </Link>
            <Link
              href="/auth/sign-up"
              className="border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors no-underline text-sm"
            >
              Start selling
            </Link>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { label: "Products listed", value: stats.totalProducts?.toLocaleString() || "0" },
              { label: "Active sellers",  value: stats.totalSellers?.toLocaleString()  || "0" },
              { label: "Happy buyers",    value: stats.totalBuyers?.toLocaleString()   || "0" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white text-2xl font-bold leading-none">{s.value}+</p>
                <p className="text-blue-200 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: floating product cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:flex relative h-[480px] items-center justify-center"
        >
          {/* Main card */}
          <div className="absolute bg-white rounded-2xl shadow-2xl p-5 w-64 top-12 left-8 z-10">
            <div className="w-full h-36 bg-blue-100 rounded-xl mb-3 flex items-center justify-center text-4xl">💻</div>
            <p className="text-gray-800 font-semibold text-sm">Dell Inspiron 15</p>
            <p className="text-blue-600 font-bold text-lg mt-1">৳ 35,000</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-green-500 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">Good condition</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="absolute bg-white rounded-2xl shadow-xl p-4 w-52 bottom-16 left-0 z-20">
            <div className="w-full h-28 bg-pink-50 rounded-xl mb-3 flex items-center justify-center text-3xl">👗</div>
            <p className="text-gray-800 font-semibold text-sm">Designer Dress</p>
            <p className="text-blue-600 font-bold">৳ 1,200</p>
          </div>
          {/* Card 3 */}
          <div className="absolute bg-white rounded-2xl shadow-xl p-4 w-52 top-8 right-0 z-10">
            <div className="w-full h-28 bg-amber-50 rounded-xl mb-3 flex items-center justify-center text-3xl">📱</div>
            <p className="text-gray-800 font-semibold text-sm">iPhone 13 Pro</p>
            <p className="text-blue-600 font-bold">৳ 68,000</p>
          </div>
          {/* Badge: verified */}
          <div className="absolute bottom-8 right-4 bg-blue-600 text-white rounded-xl px-4 py-3 shadow-lg z-30">
            <p className="text-xs font-bold">✓ Verified seller</p>
            <p className="text-[10px] text-blue-200 mt-0.5">Safe & secure payment</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

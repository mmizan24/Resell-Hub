"use client";

import { motion } from "motion/react";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export function HeroSection({ stats = {}, heroImage = "", heroTitle = "", heroCategory = "" }) {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -left-48 h-[500px] w-[500px] rounded-full bg-blue-500/20" />
        <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-blue-400/10" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2"
          >
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white">Bangladesh&apos;s #1 resell marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight text-white lg:text-6xl"
          >
            Buy & Sell{" "}
            <span className="relative">
              <span className="text-blue-200">Pre-owned</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>{" "}
            <br />
            Goods with Confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-lg text-lg leading-relaxed text-blue-100"
          >
            From electronics to furniture - discover thousands of quality second-hand products from trusted sellers across Bangladesh.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12 flex flex-wrap gap-3"
          >
            <Link
              href="/products"
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 no-underline shadow-lg transition-colors hover:bg-blue-50"
            >
              Browse products &rarr;
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-xl border-2 border-white/40 px-7 py-3.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/10"
            >
              Start selling
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { label: "Products listed", value: stats.totalProducts?.toLocaleString() || "0" },
              { label: "Active sellers", value: stats.totalSellers?.toLocaleString() || "0" },
              { label: "Happy buyers", value: stats.totalBuyers?.toLocaleString() || "0" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold leading-none text-white">{s.value}+</p>
                <p className="mt-1 text-xs text-blue-200">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden h-[480px] items-center justify-center lg:flex"
        >
          <div className="relative h-full w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl">
            {heroImage ? (
              <img
                src={heroImage}
                alt={heroTitle || "Featured product"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(8, 25, 54, 0.12) 0%, rgba(8, 25, 54, 0.55) 100%), linear-gradient(135deg, rgba(29, 78, 216, 0.25), rgba(14, 165, 233, 0.2))",
                }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.28),transparent_36%)]" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4">
              <div className="rounded-full border border-white/20 bg-white/18 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                {heroCategory || "Curated marketplace"}
              </div>
              <div className="rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Verified product
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="max-w-sm rounded-2xl border border-white/15 bg-slate-950/40 p-4 backdrop-blur-md">
                <p className="text-lg font-semibold text-white">{heroTitle || "A product buyers already trust"}</p>
                <p className="mt-1 text-sm text-blue-100/90">
                  Real marketplace photo, shown here as a featured listing from your current product feed.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Real product photo", "Fast search", "Secure checkout"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

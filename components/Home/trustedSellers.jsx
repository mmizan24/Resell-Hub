"use client";

import { motion } from "motion/react";
import Link from "next/link";

const STARS = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

export function TrustedSellers({ sellers = [] }) {
  const fallback = [
    { _id: "s1", name: "Nusrat Jahan",   photo: "https://i.pravatar.cc/100?img=5", location: "Dhaka",      productCount: 24, orderCount: 58, rating: "4.9" },
    { _id: "s2", name: "Arif Hossain",   photo: "https://i.pravatar.cc/100?img=3", location: "Chittagong", productCount: 18, orderCount: 43, rating: "4.8" },
    { _id: "s3", name: "Sumaiya Akter",  photo: "https://i.pravatar.cc/100?img=9", location: "Sylhet",     productCount: 31, orderCount: 72, rating: "5.0" },
    { _id: "s4", name: "Tanvir Ahmed",   photo: "https://i.pravatar.cc/100?img=7", location: "Rajshahi",   productCount: 12, orderCount: 29, rating: "4.7" },
    { _id: "s5", name: "Farida Begum",   photo: "https://i.pravatar.cc/100?img=6", location: "Khulna",     productCount: 9,  orderCount: 21, rating: "4.8" },
    { _id: "s6", name: "Sabbir Rahman",  photo: "https://i.pravatar.cc/100?img=8", location: "Comilla",    productCount: 15, orderCount: 37, rating: "4.9" },
  ];

  const displaySellers = sellers.length > 0 ? sellers : fallback;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-5">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Top rated
          </p>
          <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold mb-3">
            Trusted sellers
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Buy with confidence from our highest-rated community sellers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displaySellers.map((seller, i) => (
            <motion.div
              key={seller._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-all"
            >
              <div className="relative shrink-0">
                <img
                  src={seller.photo}
                  alt={seller.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">✓</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 font-bold text-sm truncate">{seller.name}</p>
                <p className="text-gray-400 text-xs mb-2">{seller.location}</p>
                <div className="text-yellow-400 text-xs mb-3">{STARS(parseFloat(seller.rating))} <span className="text-gray-400 ml-1">{seller.rating}</span></div>
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-gray-900 text-sm font-bold">{seller.productCount}</p>
                    <p className="text-gray-400 text-[10px]">Listings</p>
                  </div>
                  <div className="w-px bg-gray-100" />
                  <div className="text-center">
                    <p className="text-gray-900 text-sm font-bold">{seller.orderCount}</p>
                    <p className="text-gray-400 text-[10px]">Sales</p>
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
          className="text-center mt-10"
        >
          <Link
            href="/sellers"
            className="inline-block border-2 border-blue-600 text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors no-underline text-sm"
          >
            View all sellers →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

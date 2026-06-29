"use client";

import { motion } from "motion/react";

const STARS = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export function SuccessStories({ stories = [] }) {
  const fallback = [
    { _id: "f1", reviewerInfo: { name: "Md. Rakib Hasan" }, rating: 5, comment: "Found a great laptop at half the market price. The seller was honest and the product was exactly as described!", photo: "https://i.pravatar.cc/100?img=1", location: "Dhaka", role: "buyer" },
    { _id: "f2", reviewerInfo: { name: "Nusrat Jahan" }, rating: 5, comment: "I sold my old furniture within 3 days of listing. ShopHub made the whole process smooth and safe.", photo: "https://i.pravatar.cc/100?img=5", location: "Chittagong", role: "seller" },
    { _id: "f3", reviewerInfo: { name: "Arif Hossain" }, rating: 4, comment: "Bought a barely used phone for my son. Saved almost ৳20,000 compared to buying new. Highly recommend!", photo: "https://i.pravatar.cc/100?img=3", location: "Sylhet", role: "buyer" },
  ];

  const displayStories = stories.length > 0 ? stories : fallback;

  return (
    <section className="py-20 bg-blue-700">
      <div className="max-w-7xl mx-auto px-5">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">
            Real people, real results
          </p>
          <h2 className="text-white text-3xl lg:text-4xl font-bold mb-3">
            Success stories
          </h2>
          <p className="text-blue-200 text-base max-w-lg mx-auto">
            Hear from buyers and sellers who found value through ShopHub.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStories.slice(0, 6).map((story, i) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-colors"
            >
              <div className="text-yellow-400 text-sm mb-3">
                {STARS(story.rating)}
              </div>
              <p className="text-white text-sm leading-relaxed mb-5 italic">
                &ldquo;{story.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={story.photo || `https://i.pravatar.cc/100?u=${story._id}`}
                  alt={story.reviewerInfo?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <p className="text-white font-semibold text-sm">
                    {story.reviewerInfo?.name}
                  </p>
                  <p className="text-blue-200 text-xs">
                    {story.role === "seller" ? "Seller" : "Buyer"} · {story.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

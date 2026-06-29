"use client";

import { motion } from "motion/react";

const IMPACTS = [
  { icon: "♻️", title: "Waste reduced",      stat: "4.2 tons",  desc: "Of electronic waste diverted from landfills through second-hand sales." },
  { icon: "🌿", title: "CO₂ saved",           stat: "12,000 kg", desc: "Carbon emissions avoided by choosing pre-owned over brand-new products." },
  { icon: "💧", title: "Water conserved",     stat: "3.8M litres", desc: "Water saved by avoiding new manufacturing processes." },
  { icon: "🤝", title: "Circular economy",    stat: "18,000+",   desc: "Products given a second life, keeping money in local communities." },
];

export function SustainabilitySection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-green-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Eco impact
            </p>
            <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold mb-4">
              Shopping second-hand <br />
              <span className="text-green-600">saves the planet</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Every pre-owned purchase on ShopHub is a vote for a more
              sustainable Bangladesh. Together we&apos;re building a circular
              economy, one product at a time.
            </p>
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <span className="text-3xl">🌱</span>
              <p className="text-green-800 text-sm font-medium leading-snug">
                ShopHub offsets 1 kg of CO₂ for every 10 orders completed —
                powered by our Green Pledge program.
              </p>
            </div>
          </motion.div>

          {/* Right: impact grid */}
          <div className="grid grid-cols-2 gap-4">
            {IMPACTS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-green-50 border border-green-100 rounded-2xl p-5"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <p className="text-green-700 text-xl font-bold mb-1">{item.stat}</p>
                <p className="text-gray-700 text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
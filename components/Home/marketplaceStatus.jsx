"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString();
    });
  }, [spring]);

  return <span ref={ref}>0</span>;
}

const STAT_CARDS = (stats) => [
  {
    icon: "📦",
    label: "Total products",
    value: stats.totalProducts || 0,
    suffix: "+",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "🏪",
    label: "Verified sellers",
    value: stats.totalSellers || 0,
    suffix: "+",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: "🛒",
    label: "Happy buyers",
    value: stats.totalBuyers || 0,
    suffix: "+",
    color: "from-green-500 to-green-600",
  },
  {
    icon: "✅",
    label: "Completed orders",
    value: stats.completedOrders || 0,
    suffix: "+",
    color: "from-amber-500 to-amber-600",
  },
];

export function MarketplaceStats({ stats = {} }) {
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
            By the numbers
          </p>
          <h2 className="text-gray-900 text-3xl lg:text-4xl font-bold">
            Marketplace at a glance
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STAT_CARDS(stats).map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                {card.icon}
              </div>
              <p className="text-gray-900 text-3xl font-bold mb-1">
                <AnimatedNumber value={card.value} />{card.suffix}
              </p>
              <p className="text-gray-500 text-sm">{card.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

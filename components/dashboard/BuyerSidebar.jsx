"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const BUYER_LINKS = [
  { href: "/dashboard/buyer#all-seller-products", label: "ALL seller products" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/dashboard/buyer#reviews", label: "Reviews" },
  { href: "/dashboard/buyer#my-orders", label: "My Orders" },
  { href: "/dashboard/buyer#payment-history", label: "Payment History" },
  { href: "/dashboard/buyer#profile-management", label: "Profile Management" },
];

export function BuyerSidebar() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending || user?.role !== "buyer") {
    return null;
  }

  return (
    <aside className="w-full border-b border-blue-100 bg-white px-4 py-4 shadow-sm md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="md:sticky md:top-20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Buyer Dashboard
          </p>
          <h2 className="mt-1 text-lg font-bold text-blue-950">
            Shopping Panel
          </h2>
        </div>

        <nav aria-label="Buyer dashboard navigation">
          <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            {BUYER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

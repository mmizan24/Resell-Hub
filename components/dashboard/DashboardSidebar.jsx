"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SIDEBAR_LINKS = [
  { href: "/dashboard/seller", label: "Overview" },
  { href: "/dashboard/seller/add-product", label: "Add Product" },
  { href: "/dashboard/seller#my-products", label: "My Products" },
  { href: "/dashboard/seller/manage-orders", label: "Manage Orders" },
  { href: "/dashboard/seller#sales-analytics", label: "Sales Analytics" },
];

const SECTION_IDS = SIDEBAR_LINKS.map((item) => item.href.split("#")[1]).filter(Boolean);

export function DashboardSidebar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || pathname !== "/dashboard/seller") {
      return undefined;
    }

    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && SECTION_IDS.includes(hash)) {
        setActiveSection(hash);
      }
    };

    updateFromHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id && SECTION_IDS.includes(visibleEntry.target.id)) {
          setActiveSection(visibleEntry.target.id);
          window.history.replaceState(null, "", `#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    );

    const observedSections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);

    observedSections.forEach((section) => observer.observe(section));

    window.addEventListener("hashchange", updateFromHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [pathname]);

  if (isPending || user?.role !== "seller") {
    return null;
  }

  return (
    <aside className="w-full border-b border-blue-100 bg-white px-4 py-4 shadow-sm md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="md:sticky md:top-20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Seller Dashboard
          </p>
          <h2 className="mt-1 text-lg font-bold text-blue-950">
            Manage Store
          </h2>
        </div>

        <nav aria-label="Seller dashboard navigation">
          <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            {SIDEBAR_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    const hash = item.href.split("#")[1];
                    if (hash) {
                      setActiveSection(hash);
                    } else {
                      setActiveSection("");
                    }
                  }}
                  aria-current={
                    (item.href === "/dashboard/seller" && pathname === "/dashboard/seller") ||
                    (item.href === "/dashboard/seller/add-product" && pathname === "/dashboard/seller/add-product") ||
                    (item.href === "/dashboard/seller/manage-orders" && pathname === "/dashboard/seller/manage-orders") ||
                    (item.href.includes("#") &&
                      pathname === "/dashboard/seller" &&
                      activeSection === item.href.split("#")[1])
                      ? "page"
                      : undefined
                  }
                  className={`block rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    (item.href === "/dashboard/seller" && pathname === "/dashboard/seller") ||
                    (item.href === "/dashboard/seller/add-product" && pathname === "/dashboard/seller/add-product") ||
                    (item.href === "/dashboard/seller/manage-orders" && pathname === "/dashboard/seller/manage-orders") ||
                    (item.href.includes("#") &&
                      pathname === "/dashboard/seller" &&
                      activeSection === item.href.split("#")[1])
                      ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-transparent text-slate-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
                  }`}
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

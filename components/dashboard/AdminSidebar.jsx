"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 11.5V6.75A2.75 2.75 0 0 1 6.75 4H11v7.5H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 4h4.25A2.75 2.75 0 0 1 20 6.75V11h-7V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 13h7v7H6.75A2.75 2.75 0 0 1 4 17.25V13Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 13h7v4.25A2.75 2.75 0 0 1 17.25 20H13v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M16.5 20a4.5 4.5 0 0 0-9 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 20a3.5 3.5 0 0 0-2.6-3.38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4.5 8.5 12 4l7.5 4.5v8L12 21l-7.5-4.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 4v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m4.9 8.1 7.1 4.2 7.1-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M6 7h15l-1.5 8H8L6 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M6 7 5 4H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINKS = [
  { href: "/dashboard/admin", label: "Overview", icon: DashboardIcon },
  { href: "/dashboard/admin/manage-users", label: "Manage Users", icon: UsersIcon },
  { href: "/dashboard/admin/manage-products", label: "Manage Products", icon: BoxIcon },
  { href: "/dashboard/admin/manage-orders", label: "Manage Orders", icon: OrdersIcon },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`sticky top-6 w-full self-start transition-all duration-300 ${collapsed ? "max-w-[88px]" : "max-w-[220px]"}`}>
      <nav
        aria-label="Admin dashboard navigation"
        className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ${
          collapsed ? "p-2" : "p-3"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end"} gap-2 pb-3`}>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <div className="space-y-1.5">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm" : ""
                } ${collapsed ? "justify-center gap-0 px-2.5 py-2.5" : "gap-2.5 px-2.5 py-2.5"}`}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? link.label : undefined}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                  <Icon />
                </span>
                <span className={collapsed ? "sr-only" : "block"}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

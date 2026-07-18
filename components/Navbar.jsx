"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Avatar, Dropdown, Label, Separator } from "@heroui/react";
import { useSession, signOut } from "@/lib/auth-client";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Categories",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/about-us",
    label: "About Us",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
  },
  {
    href: "/contact-us",
    label: "Contact Us",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h6"/>
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="21" y2="14"/><line x1="14" y1="18" x2="21" y2="18"/><line x1="14" y1="22" x2="21" y2="22"/>
      </svg>
    ),
  },
];

const PROFILE_MENU = [
  {
    id: "profile",
    label: "My profile",
    href: "/profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Account settings",
    href: "/settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
  {
    id: "orders",
    label: "My orders",
    href: "/orders",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      </svg>
    ),
  },
  {
    id: "wishlist",
    label: "Wishlist",
    href: "/wishlist",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

// ── Reusable sign-out SVG icon ──────────────────────
function SignOutIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );

  const user         = session?.user;
  const isAuthLoading = !isHydrated || isPending;
  const userRole = user?.role || "seller";
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const dashboardHref =
    user?.role === "seller"
      ? "/dashboard/seller"
      : user?.role === "buyer"
        ? "/dashboard/buyer"
        : user?.role === "admin"
          ? "/dashboard/admin"
          : "/auth/sign-in";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  async function handleSignOut() {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            setMobileOpen(false);
            router.push("/auth/sign-in");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Signout failed:", err);
    }
  }

  return (
    <header className="w-full bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 no-underline group"
        >
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#1D4ED8"/>
              <path d="M10 14.5L7.5 12L6.5 13L10 16.5L17.5 9L16.5 8L10 14.5Z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-base tracking-tight">
              Resell<span className="text-blue-200">Hub</span>
            </span>
            <span className="text-blue-300 text-[10px] tracking-widest uppercase font-medium">
              Store
            </span>
          </div>
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const navHref = label === "Dashboard" ? dashboardHref : href;
            const isActive =
              label === "Dashboard"
                ? pathname.startsWith("/dashboard")
                : href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={navHref}
                className={[
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 no-underline",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className={isActive ? "text-white" : "text-blue-200"}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right section ── */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Loading skeleton */}
          {isAuthLoading && (
            <div className="w-24 h-9 rounded-lg bg-white/10 animate-pulse" />
          )}

          {/* ══════════════════════════════════
              LOGGED OUT
              Login + Register (no sign out)
          ══════════════════════════════════ */}
          {!isAuthLoading && !user && (
            <div className="flex items-center gap-2">
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="Open user profile menu"
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-2 text-white transition-all duration-150 hover:border-white/40 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21a8 8 0 0 0-16 0"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <span className="hidden text-sm font-medium lg:inline">Profile</span>
                  <svg className="h-3.5 w-3.5 text-blue-200" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 6l4 4 4-4H4z"/>
                  </svg>
                </Dropdown.Trigger>

                <Dropdown.Popover className="mt-2 w-64 overflow-hidden rounded-2xl border border-blue-100 bg-white p-0 shadow-2xl">
                  <Dropdown.Menu className="p-0 outline-none">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-3.5">
                      <p className="text-sm font-semibold text-white">User profile</p>
                      <p className="mt-0.5 text-xs text-blue-200">Sign in to manage your account</p>
                    </div>
                    <div className="py-1.5">
                      {PROFILE_MENU.map(({ id, label, href, icon }) => (
                        <Dropdown.Item
                          key={id}
                          id={`guest-${id}`}
                          textValue={label}
                          onAction={() => router.push(href)}
                          className="outline-none"
                        >
                          <div className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-blue-800 transition-colors duration-100 hover:bg-blue-50">
                            <span className="shrink-0 text-blue-400">{icon}</span>
                            <Label className="cursor-pointer text-sm font-medium text-blue-800">{label}</Label>
                          </div>
                        </Dropdown.Item>
                      ))}
                    </div>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              <Link
                href="/auth/sign-in"
                className="hidden sm:flex items-center gap-1.5 border border-white/35 text-white bg-transparent hover:bg-white/10 hover:border-white/60 text-sm font-medium px-4 h-9 rounded-lg transition-all duration-150 no-underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </Link>

              <Link
                href="/auth/sign-up"
                className="flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-4 h-9 rounded-lg shadow-sm transition-all duration-150 no-underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Register
              </Link>
            </div>
          )}

          {/* ══════════════════════════════════
              LOGGED IN
              Profile dropdown + Sign out btn
              (Login/Register hidden entirely)
          ══════════════════════════════════ */}
          {!isAuthLoading && user && (
            <div className="flex items-center gap-2">

              {/* Profile dropdown */}
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="Open account menu"
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-white/10 py-1.5 pl-1.5 pr-3 outline-none transition-all duration-150 hover:border-white/40 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <Avatar.Image
                      src={user.image ?? undefined}
                      alt={user.name ?? "User"}
                    />
                    <Avatar.Fallback className="bg-blue-200 text-blue-900 text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm font-semibold leading-none">
                        {user.name?.split(" ")[0]}
                      </span>
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-blue-50">
                        {roleLabel}
                      </span>
                    </div>
                    <span className="text-blue-200 text-[10px] mt-0.5">My account</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-blue-200 ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 6l4 4 4-4H4z"/>
                  </svg>
                </Dropdown.Trigger>

                <Dropdown.Popover className="w-64 mt-2 rounded-2xl shadow-2xl border border-blue-100 bg-white overflow-hidden p-0">
                  <Dropdown.Menu className="p-0 outline-none">

                    {/* User info header */}
                    <div className="px-4 py-3.5 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-sm font-semibold truncate">{user.name}</span>
                        <span className="text-blue-200 text-xs truncate">{user.email}</span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-100">
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      {PROFILE_MENU.map(({ id, label, href, icon }) => (
                        <Dropdown.Item
                          key={id}
                          id={id}
                          textValue={label}
                          onAction={() => router.push(href)}
                          className="outline-none"
                        >
                          <div className="flex items-center gap-3 px-4 py-2.5 text-blue-800 hover:bg-blue-50 cursor-pointer transition-colors duration-100">
                            <span className="text-blue-400 shrink-0">{icon}</span>
                            <Label className="text-sm text-blue-800 font-medium cursor-pointer">{label}</Label>
                          </div>
                        </Dropdown.Item>
                      ))}

                      <Separator className="my-1.5 border-blue-100 mx-3"/>

                      <Dropdown.Item
                        id="signout"
                        textValue="Sign out"
                        onAction={handleSignOut}
                        className="outline-none"
                      >
                        <div className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-100">
                          <span className="text-red-400 shrink-0"><SignOutIcon size={15}/></span>
                          <Label className="text-sm text-red-600 font-medium cursor-pointer">Sign out</Label>
                        </div>
                      </Dropdown.Item>
                    </div>

                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              {/* ── Standalone Sign out button — desktop only ── */}
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 border border-red-400/50 bg-red-500/10 text-red-200 hover:bg-red-500/25 hover:border-red-400/70 hover:text-white text-sm font-medium px-3.5 h-9 rounded-lg transition-all duration-150"
              >
                <SignOutIcon size={14}/>
                <span>Sign out</span>
              </button>

            </div>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            className="order-first p-2 text-white transition-colors duration-150 hover:bg-white/10 md:hidden rounded-lg"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* ── Mobile nav menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-blue-800 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const navHref = label === "Dashboard" ? dashboardHref : href;
            const isActive =
              label === "Dashboard"
                ? pathname.startsWith("/dashboard")
                : href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={navHref}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className={isActive ? "text-white" : "text-blue-300"}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}

          {/* Mobile: logged out → Login + Register */}
          {!isAuthLoading && !user && (
            <div className="flex gap-2 pt-3 mt-1 border-t border-white/10">
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-white/30 text-white text-sm font-medium no-underline hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-white text-blue-700 text-sm font-semibold no-underline hover:bg-blue-50 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile: logged in → Sign out only */}
          {!isAuthLoading && user && (
            <div className="pt-3 mt-1 border-t border-white/10">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-400/45 bg-red-500/10 text-red-200 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                <SignOutIcon size={15}/>
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

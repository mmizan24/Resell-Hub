import Link from "next/link";

const QUICK_LINKS = [
  { href: "/",           label: "Home",         icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { href: "/products",   label: "Products",     icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" },
  { href: "/categories", label: "Categories",   icon: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z" },
  { href: "/dashboard",  label: "Dashboard",    icon: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v4H3z M14 14h7v4h-7z" },
  { href: "/wishlist",   label: "Wishlist",     icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { href: "/cart",       label: "Cart",         icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18" },
  { href: "/orders",     label: "Track order",  icon: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3 M9 21H20a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" },
  { href: "/help",       label: "Help center",  icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z",
  },
  {
    label: "Twitter / X",
    href: "https://x.com",
    path: "M4 4l16 16 M4 20L20 4",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02V8.98l5.75 3.02-5.75 3.02z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  },
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "bKash", "Nagad", "Rocket"];

const BOTTOM_LINKS = [
  { href: "/privacy",  label: "Privacy policy"  },
  { href: "/terms",    label: "Terms of service" },
  { href: "/cookies",  label: "Cookie policy"    },
  { href: "/sitemap",  label: "Sitemap"          },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-blue-700">
      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-5 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Column 1: Brand info ── */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                    fill="#1D4ED8"
                  />
                  <path
                    d="M10 14.5L7.5 12L6.5 13L10 16.5L17.5 9L16.5 8L10 14.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-xl tracking-tight">
                  Resell<span className="text-blue-200">Hub</span>
                </span>
                <span className="text-blue-300 text-[10px] tracking-widest uppercase font-medium mt-0.5">
                  Online store
                </span>
              </div>
            </Link>

            <p className="text-blue-200 text-sm leading-relaxed mb-5">
              Your trusted online marketplace for quality products across every
              category. Delivering excellence to your doorstep since 2020.
            </p>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-2 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-blue-100 text-xs font-medium">Secure and trusted shopping</span>
            </div>

            {/* Newsletter */}
            <p className="text-blue-300 text-xs uppercase tracking-widest font-semibold mb-3">
              Newsletter
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email for newsletter"
                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-300 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
              <button className="bg-white text-blue-700 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors shrink-0">
                Join
              </button>
            </div>
          </div>

          {/* ── Column 2: Quick links ── */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5">
              Quick links
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              {QUICK_LINKS.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2.5 text-blue-200 hover:text-white text-sm no-underline transition-colors duration-150 group"
                  >
                    <span className="text-blue-400 group-hover:text-blue-200 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Contact information ── */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5">
              Contact us
            </h3>
            <ul className="space-y-4 list-none p-0">

              {/* Address */}
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Address</p>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    House 12, Road 5<br />
                    Uttara, Dhaka 1230<br />
                    Bangladesh
                  </p>
                </div>
              </li>

              {/* Phone */}
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Phone</p>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    +880 1700-000000<br />
                    +880 1800-000000
                  </p>
                </div>
              </li>

              {/* Email */}
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Email</p>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    support@resellhub.com<br />
                    hello@resellhub.com
                  </p>
                </div>
              </li>

              {/* Hours */}
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Business hours</p>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Sat – Thu: 9am – 6pm<br />
                    Friday: Closed
                  </p>
                </div>
              </li>

            </ul>
          </div>

          {/* ── Column 4: Social + Payment ── */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5">
              Follow us
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-5">
              Stay connected for the latest deals, new arrivals, and community
              highlights.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5 mb-8 flex-wrap">
              {SOCIAL_LINKS.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-blue-200 hover:bg-white/20 hover:border-white/35 hover:text-white transition-all duration-150"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Payment methods */}
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3">
              We accept
            </h3>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-blue-100 text-xs font-semibold"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* App download badges */}
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mt-7 mb-3">
              Download app
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                aria-label="Get ResellHub on Google Play"
                className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 hover:bg-white/18 transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                <div>
                  <p className="text-blue-300 text-[9px] uppercase tracking-wider leading-none mb-0.5">Get it on</p>
                  <p className="text-white text-xs font-semibold leading-none">Google Play</p>
                </div>
              </a>
              <a
                href="#"
                aria-label="Download ResellHub on the App Store"
                className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 hover:bg-white/18 transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v8M8 12h8"/>
                </svg>
                <div>
                  <p className="text-blue-300 text-[9px] uppercase tracking-wider leading-none mb-0.5">Download on the</p>
                  <p className="text-white text-xs font-semibold leading-none">App Store</p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-5">
        <div className="h-px bg-white/10" />
      </div>

      {/* ── Copyright bar ── */}
      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-blue-300 text-xs text-center sm:text-left">
          © {year} ResellHub. All rights reserved. Made with care in Bangladesh.
        </p>
        <nav className="flex items-center gap-5 flex-wrap justify-center">
          {BOTTOM_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-blue-300 hover:text-white text-xs no-underline transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

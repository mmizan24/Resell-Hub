import Link from "next/link";

export const metadata = {
  title: "About Us | ResellHub",
  description: "Learn more about ResellHub and how the marketplace works.",
};

export default function AboutUsPage() {
  return (
    <main className="bg-slate-50 px-4 py-8 md:px-5 md:py-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                About Us
              </p>
              <h1 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
                Built for honest resale, fast discovery, and safe buying.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                ResellHub helps buyers discover quality pre-owned and new items
                from trusted sellers, while giving sellers a clean marketplace
                to manage listings, orders, and customer feedback.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-700">What we do</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    We connect real sellers with real buyers through a simple,
                    modern marketplace experience.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold text-emerald-700">Why it matters</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Good buying decisions need clear product details, reviews,
                    and a buying flow people can trust.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Browse products
                </Link>
                <Link
                  href="/contact-us"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Contact team
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-6 text-white md:p-8 lg:p-10">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
                  Marketplace values
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Transparency</p>
                    <p className="mt-1 text-sm leading-6 text-blue-100">
                      Clear pricing, stock, category, and review visibility.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Trust</p>
                    <p className="mt-1 text-sm leading-6 text-blue-100">
                      Buyer feedback is visible and tied to real purchases.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Efficiency</p>
                    <p className="mt-1 text-sm leading-6 text-blue-100">
                      Sellers can manage products, reviews, and orders in one place.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

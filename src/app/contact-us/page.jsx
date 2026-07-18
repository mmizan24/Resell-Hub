import Link from "next/link";

export const metadata = {
  title: "Contact Us | ResellHub",
  description: "Get in touch with the ResellHub team.",
};

const CONTACT_CARDS = [
  {
    label: "Email",
    value: "support@resellhub.com",
    href: "mailto:support@resellhub.com",
    note: "For marketplace help and account questions.",
  },
  {
    label: "Phone",
    value: "+880 1700-000000",
    href: "tel:+8801700000000",
    note: "Available during business hours.",
  },
  {
    label: "Location",
    value: "Uttara, Dhaka, Bangladesh",
    href: "https://maps.google.com",
    note: "Main support and operations office.",
  },
];

export default function ContactUsPage() {
  return (
    <main className="bg-slate-50 px-4 py-8 md:px-5 md:py-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Contact Us
              </p>
              <h1 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
                We’re here when you need help.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                Whether you need support with orders, listings, reviews, or
                account access, the ResellHub team is ready to help.
              </p>

              <div className="mt-8 space-y-4">
                {CONTACT_CARDS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white md:p-8 lg:p-10">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
                  Quick support
                </p>
                <h2 className="mt-3 text-2xl font-bold">
                  Reach the right team faster
                </h2>
                <p className="mt-3 text-sm leading-7 text-blue-100">
                  Use email for account and marketplace issues, phone for urgent
                  help, and the dashboard for order and product actions.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-semibold text-white">Order help</p>
                    <p className="mt-1 text-sm text-blue-100">
                      Use your buyer dashboard to review purchases and reviews.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-semibold text-white">Seller support</p>
                    <p className="mt-1 text-sm text-blue-100">
                      Manage products, stock, and buyer feedback from seller dashboard.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/buyer"
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                  >
                    Buyer dashboard
                  </Link>
                  <Link
                    href="/dashboard/seller"
                    className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Seller dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

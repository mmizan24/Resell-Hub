import { WishlistPanel } from "../../components/wishlist/WishlistPanel";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export const metadata = {
  title: "Wishlist | ResellHub",
  description: "Saved products for future buying.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  return (
    <main className="bg-slate-50 px-4 py-8 md:px-5">
      <div className="mx-auto w-full max-w-7xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Wishlist</p>
              <h1 className="mt-2 text-3xl font-bold text-blue-950">Your saved products</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Keep products here for later comparison or future buying decisions.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Continue browsing
            </Link>
          </div>

          {!user ? (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
              You are viewing a guest wishlist. Sign in to keep it tied to your account on this device.
            </div>
          ) : null}
        </section>

        <WishlistPanel userId={user?.id} />
      </div>
    </main>
  );
}

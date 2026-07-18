import { AdminProductsTable } from "../../../../../components/dashboard/AdminProductsTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user || (user.role || "").toLowerCase() !== "admin") {
    return null;
  }

  return user;
}

export default async function AdminManageProductsPage() {
  const user = await getAdminUser();

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-950">Manage Products</h1>
          <p className="mt-2 text-sm text-slate-600">Please sign in as an admin to manage marketplace listings.</p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">Manage products</h1>
        <p className="mt-2 text-sm text-slate-600">
          Approve new seller listings, edit product details, or remove listings from the marketplace.
        </p>
      </section>

      <AdminProductsTable />
    </main>
  );
}

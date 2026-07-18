import { BuyerTransactionPanel } from "../../../../../components/dashboard/BuyerTransactionPanel";
import { ProductServiceNotice } from "../../../../../components/Home/ProductServiceNotice";
import { auth } from "@/lib/auth";
import { getBuyerPayments } from "@/lib/orders";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment history | ResellHub",
};

export default async function BuyerPaymentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Payment history</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in as a buyer to view your transactions.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (user.role !== "buyer" && user.role !== "admin") {
    return (
      <section className="px-5 py-12 md:px-8">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Buyer access only</h1>
          <p className="mt-2 text-sm text-slate-600">
            Only buyer accounts can view the payment history panel.
          </p>
        </div>
      </section>
    );
  }

  let payments = [];
  let loadError = null;

  try {
    payments = await getBuyerPayments(user.id);
  } catch (error) {
    loadError = error;
  }

  if (loadError) {
    return (
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <ProductServiceNotice title="Payment history is temporarily unavailable" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Buyer dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Payment history</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review every Stripe transaction, payment amount, payment date, and payment status.
        </p>

        <BuyerTransactionPanel payments={payments} />
      </div>
    </section>
  );
}

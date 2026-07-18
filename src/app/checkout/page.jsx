import { ProceedToPaymentButton } from "../../../components/checkout/ProceedToPaymentButton";
import { ProductServiceNotice } from "../../../components/Home/ProductServiceNotice";
import { auth } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isInteger(quantity) && quantity > 0 && quantity <= 999) {
    return quantity;
  }
  return 1;
}

function formatPrice(price) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(numericPrice);
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | ResellHub",
};

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const productId = typeof params?.productId === "string" ? params.productId : "";
  const requestedQuantity = normalizeQuantity(params?.quantity);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const buyer = session?.user;

  if (!buyer) {
    return (
      <ProtectedNotice
        eyebrow="Sign in required"
        title="Continue to secure checkout"
        message="Please sign in with your buyer account to review the order summary and continue to Stripe."
        href="/auth/sign-in"
        linkLabel="Sign in"
      />
    );
  }

  if (buyer.role !== "buyer") {
    return (
      <ProtectedNotice
        eyebrow="Buyer access only"
        title="This checkout is reserved for buyers"
        message="Only buyer accounts can pay for products through the secure checkout flow."
        href="/dashboard/buyer"
        linkLabel="Go to buyer dashboard"
      />
    );
  }

  if (!productId) {
    notFound();
  }

  let product;

  try {
    product = await getProductById(productId);
  } catch (error) {
    return <ProductServiceNotice title="Checkout data is temporarily unavailable" />;
  }

  if (!product || (product.approvalStatus || "pending") !== "approved") {
    notFound();
  }

  const stockCount = Number.isInteger(product.quantity) && product.quantity > 0 ? product.quantity : 0;
  if (stockCount <= 0) {
    return (
      <ProtectedNotice
        eyebrow="Out of stock"
        title="This product is currently unavailable"
        message="The seller no longer has stock for this item. Please return to the marketplace and choose another product."
        href="/products"
        linkLabel="Browse products"
      />
    );
  }

  const quantity = Math.min(requestedQuantity, Math.max(stockCount, 1));
  const unitPrice = Number(product.price);
  const totalPrice = Number.isFinite(unitPrice) ? unitPrice * quantity : null;
  const sellerName = product.sellerInfo?.name || "ResellHub seller";

  return (
    <section className="bg-slate-50 px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Review your order before paying
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Stripe will be used for secure card payment after you confirm the summary below.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order summary
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <SummaryRow label="Product name" value={product.title} />
                <SummaryRow label="Seller" value={sellerName} />
                <SummaryRow label="Product price" value={formatPrice(unitPrice)} />
                <SummaryRow label="Quantity" value={quantity} />
                <SummaryRow label="Available balance" value={stockCount} />
                <SummaryRow label="Total amount" value={formatPrice(totalPrice)} strong />
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Delivery information
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <SummaryRow label="Buyer name" value={buyer.name || "Not provided"} />
                <SummaryRow label="Email" value={buyer.email || "Not provided"} />
                <SummaryRow label="Phone" value={buyer.phoneNumber || "Not provided"} />
                <SummaryRow label="Location" value={buyer.location || "Not provided"} />
              </dl>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ProceedToPaymentButton
              productId={productId}
              quantity={quantity}
              className="sm:flex-1"
            />
            <Link
              href={`/products/${productId}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel checkout
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Payment security
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Protected payment route
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>- Secure Stripe checkout for card authorization.</li>
            <li>- Buyer-only route protection before payment starts.</li>
            <li>- Payment intent and transaction record saved on the server.</li>
            <li>- Validation for quantity, stock balance, and product status.</li>
          </ul>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-sm text-slate-100">
            <p className="font-semibold text-amber-300">Next step</p>
            <p className="mt-2 leading-6 text-slate-200">
              Confirm the summary, then Stripe will collect the payment securely and bring you
              back to the success page.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? "text-base font-bold text-slate-950" : "font-medium text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}

function ProtectedNotice({ eyebrow, title, message, href, linkLabel }) {
  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
          {eyebrow}
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {message}
        </p>
        <Link
          href={href}
          className="mt-7 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {linkLabel}
        </Link>
      </div>
    </section>
  );
}

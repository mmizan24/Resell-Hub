import { ProductBrowser } from "../../components/products/ProductBrowser";
import { ProductServiceNotice } from "../../../components/Home/ProductServiceNotice";
import { getProducts } from "@/lib/products";
import { getProductReviewSummaries } from "@/lib/reviews";

export const metadata = {
  title: "Products | ResellHub",
  description: "Browse products listed on ResellHub.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }) {
  let products = [];
  let reviewSummaries = {};
  let loadError = null;

  try {
    products = await getProducts();
  } catch (error) {
    loadError = error;
  }

  if (!loadError) {
    try {
      reviewSummaries = await getProductReviewSummaries(
        products.map((product) => product._id),
      );
    } catch (error) {
      console.error("Unable to load product review summaries:", error);
      reviewSummaries = {};
    }
  }

  const initialCategory =
    typeof searchParams?.category === "string" ? searchParams.category : "";

  return (
    <main className="bg-slate-50">
      {loadError ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <ProductServiceNotice title="All products are temporarily unavailable" />
        </div>
      ) : (
        <ProductBrowser
          products={products}
          initialCategory={initialCategory}
          reviewSummaries={reviewSummaries}
        />
      )}
    </main>
  );
}

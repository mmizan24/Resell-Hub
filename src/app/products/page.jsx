import { FeaturedProducts } from "../../../components/Home/FeaturedProducts";
import { ProductServiceNotice } from "../../../components/Home/ProductServiceNotice";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Products | ResellHub",
  description: "Browse products listed on ResellHub.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products = [];
  let loadError = null;

  try {
    products = await getProducts();
  } catch (error) {
    loadError = error;
  }

  return (
    <main>
      {loadError ? (
        <ProductServiceNotice title="All products are temporarily unavailable" />
      ) : (
        <FeaturedProducts
          products={products}
          eyebrow="Marketplace"
          title="All products"
          showViewAll={false}
        />
      )}
    </main>
  );
}

import { FeaturedProducts } from "../../../components/Home/FeaturedProducts";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Products | ResellHub",
  description: "Browse products listed on ResellHub.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main>
      <FeaturedProducts
        products={products}
        eyebrow="Marketplace"
        title="All products"
        showViewAll={false}
      />
    </main>
  );
}

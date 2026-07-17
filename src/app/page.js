import { FeaturedProducts } from "../../components/Home/FeaturedProducts";
import { HeroSection } from "../../components/Home/HeroSection";
import { MarketplaceStats } from "../../components/Home/marketplaceStatus";
import { PopularCategories } from "../../components/Home/PopularCategories";
import { ProductServiceNotice } from "../../components/Home/ProductServiceNotice";
import { SuccessStories } from "../../components/Home/successStories";
import { TrustedSellers } from "../../components/Home/trustedSellers";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products = [];
  let loadError = null;

  try {
    products = await getProducts();
  } catch (error) {
    loadError = error;
  }

  return (
    <>
      <HeroSection />
      {loadError ? (
        <ProductServiceNotice title="Featured products are temporarily unavailable" />
      ) : (
        <FeaturedProducts products={products.slice(0, 8)} />
      )}
      <PopularCategories />
      <MarketplaceStats />
      <TrustedSellers />
      <SuccessStories />
    </>
  );
}

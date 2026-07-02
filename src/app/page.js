import { FeaturedProducts } from "../../components/Home/FeaturedProducts";
import { HeroSection } from "../../components/Home/HeroSection";
import { MarketplaceStats } from "../../components/Home/marketplaceStatus";
import { PopularCategories } from "../../components/Home/PopularCategories";
import { SuccessStories } from "../../components/Home/successStories";
import { TrustedSellers } from "../../components/Home/trustedSellers";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={products.slice(0, 8)} />
      <PopularCategories />
      <MarketplaceStats />
      <TrustedSellers />
      <SuccessStories />
    </>
  );
}

import { FeaturedProducts } from "../../components/Home/FeaturedProducts";
import { HeroSection } from "../../components/Home/HeroSection";
import { MarketplaceStats } from "../../components/Home/marketplaceStatus";
import { PopularCategories } from "../../components/Home/PopularCategories";
import { ProductServiceNotice } from "../../components/Home/ProductServiceNotice";
import { SuccessStories } from "../../components/Home/successStories";
import { TrustedSellers } from "../../components/Home/trustedSellers";
import { getProducts } from "@/lib/products";
import {
  getMarketplaceOverview,
  getPopularCategories,
  getTrustedSellers,
} from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [productsResult, overviewResult, sellersResult, categoriesResult] = await Promise.allSettled([
    getProducts(),
    getMarketplaceOverview(),
    getTrustedSellers({ limit: 6 }),
    getPopularCategories({ limit: 8 }),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const overview = overviewResult.status === "fulfilled" ? overviewResult.value : null;
  const sellers = sellersResult.status === "fulfilled" ? sellersResult.value : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const loadError = productsResult.status === "rejected" ? productsResult.reason : null;
  const heroProduct = products.find(
    (product) => Array.isArray(product?.images) && typeof product.images[0] === "string" && product.images[0].trim(),
  );

  return (
    <>
      <HeroSection
        stats={overview || {}}
        heroImage={heroProduct?.images?.[0] || ""}
        heroTitle={heroProduct?.title || "Featured marketplace product"}
        heroCategory={heroProduct?.category || "Top listing"}
      />
      {loadError ? (
        <ProductServiceNotice title="Featured products are temporarily unavailable" />
      ) : (
        <FeaturedProducts products={products.slice(0, 8)} />
      )}
      <PopularCategories categories={categories} />
      <MarketplaceStats stats={overview || {}} />
      <TrustedSellers sellers={sellers} />
      <SuccessStories />
    </>
  );
}

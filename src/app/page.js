import { FeaturedProducts } from "../../components/Home/FeaturedProducts";
import { HeroSection } from "../../components/Home/HeroSection";
import { MarketplaceStats } from "../../components/Home/marketplaceStatus";
import { PopularCategories } from "../../components/Home/PopularCategories";
import { SuccessStories } from "../../components/Home/successStories";
import { TrustedSellers } from "../../components/Home/trustedSellers";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <PopularCategories />
      <MarketplaceStats />
      <TrustedSellers />
      <SuccessStories />
    </>
  );
}


import HeroBanner from "@/components/HeroBanner";
import AiPromoBanner from "@/components/AiPromoBanner";
import NewReleases from "@/components/NewReleases";
import Bestsellers from "@/components/Bestsellers";

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-gutter pb-section">
      <HeroBanner />
      <AiPromoBanner />
      <NewReleases />
      <Bestsellers />
    </div>
  );
}

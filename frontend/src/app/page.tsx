import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { LifestyleDiscovery } from '@/components/home/LifestyleDiscovery';
import { AboutZimor } from '@/components/home/AboutZimor';
import { ZimorEdit } from '@/components/home/ZimorEdit';
import { GiftingBanner } from '@/components/home/GiftingBanner';

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <FeaturedProducts />
      <LifestyleDiscovery />
      <AboutZimor />
      <ZimorEdit />
      <GiftingBanner />
    </main>
  );
}


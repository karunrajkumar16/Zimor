import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { LifestyleDiscovery } from '@/components/home/LifestyleDiscovery';
import { AboutZimor } from '@/components/home/AboutZimor';
import { ShopByVideo } from '@/components/home/ShopByVideo';

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <FeaturedProducts />
      <LifestyleDiscovery />
      <AboutZimor />
      <ShopByVideo />
    </main>
  );
}


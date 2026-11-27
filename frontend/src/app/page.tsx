import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { LifestyleDiscovery } from '@/components/home/LifestyleDiscovery';
import { AboutZimor } from '@/components/home/AboutZimor';
import { ShopByVideo } from '@/components/home/ShopByVideo';
import { apiFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getHomepageContent() {
  try {
    const res = await apiFetch('/api/content/homepage', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.content?.data || null;
  } catch (err) {
    console.error('[HomePage SSR] Error fetching homepage content:', err);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageContent();

  return (
    <main>
      <HeroBanner
        initialSlides={data?.heroSlides || data?.slides}
      />
      <FeaturedProducts />
      <LifestyleDiscovery
        initialLifestyle={data?.lifestyle}
        initialCrafted={data?.craftedInIndia}
      />
      <AboutZimor
        initialSpotlight={data?.spotlight}
      />
      <ShopByVideo />
    </main>
  );
}

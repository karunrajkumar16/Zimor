import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { Product } from '@/types';
import { BACKEND_URL } from '@/lib/api';

export const dynamicParams = true;

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/slug/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.product) {
        if (data.product.isPublished === false) return null;
        return {
          ...data.product,
          id: data.product.id || data.product._id,
        };
      }
    }
  } catch (err) {
    console.error(`[PDP] Failed fetching live product for slug "${slug}":`, err);
  }

  return null;
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.products)) {
        return data.products.map((p: any) => ({ slug: p.slug }));
      }
    }
  } catch { }

  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found — Zimor India',
    };
  }

  return {
    title: `${product.name} — Zimor India`,
    description: product.description,
    openGraph: {
      title: `${product.name} — Zimor India`,
      description: product.description,
      images: [
        {
          url: product.images?.[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
          width: 1200,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

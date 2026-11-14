import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { ProductDetailView } from '@/components/product/ProductDetailView';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
          url: product.images[0]?.url || '/products/delo-1.jpg',
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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

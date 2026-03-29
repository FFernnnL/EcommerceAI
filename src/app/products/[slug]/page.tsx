import { notFound } from 'next/navigation';
import { Star, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import productsData from '@/data/products.json';
import { Product } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import AskAIButton from '@/components/products/AskAIButton';

const allProducts = productsData as unknown as Product[];

export function generateStaticParams() {
  return allProducts.map((product) => ({
    slug: product.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <ProductImage
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* SKU & Stock */}
            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className="text-gray-500">SKU: {product.sku}</span>
              <span
                className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">{key}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ask AI Button */}
            <div className="mb-6">
              <AskAIButton productName={product.name} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                2-Year Warranty
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                30-Day Returns
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-5 w-5 text-blue-600" />
                Secure Packaging
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

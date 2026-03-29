// Product service - mock implementation for price lookup and recommendations

import productsData from '@/data/products.json';
import { Product } from '@/types/product';

const products = productsData as unknown as Product[];

export function getProductPrice(skuId: string) {
  const product = products.find((p) => p.sku === skuId);

  if (!product) {
    return {
      success: false,
      message: `Product with SKU ${skuId} not found.`,
    };
  }

  return {
    success: true,
    product: {
      name: product.name,
      sku: product.sku,
      price: product.price,
      originalPrice: product.originalPrice || null,
      inStock: product.inStock,
    },
  };
}

export function getProductRecommendations(useCase: string, budgetMax?: number) {
  const useCaseLower = useCase.toLowerCase();

  // Simple keyword-based matching
  const scored = products.map((product) => {
    let score = 0;
    const desc = `${product.name} ${product.description} ${product.category} ${product.shortDescription}`.toLowerCase();

    // Match keywords
    const keywords = useCaseLower.split(/\s+/);
    for (const kw of keywords) {
      if (desc.includes(kw)) score += 2;
      if (product.category.toLowerCase().includes(kw)) score += 3;
    }

    // Common use case mappings
    if (useCaseLower.includes('programming') || useCaseLower.includes('coding') || useCaseLower.includes('development')) {
      if (product.category === 'Laptops') score += 5;
      if (product.category === 'Monitors') score += 4;
      if (product.category === 'Accessories') score += 3;
    }
    if (useCaseLower.includes('gaming')) {
      if (product.category === 'Laptops') score += 5;
      if (product.category === 'Monitors') score += 4;
      if (product.category === 'Accessories') score += 3;
    }
    if (useCaseLower.includes('music') || useCaseLower.includes('audio') || useCaseLower.includes('podcast')) {
      if (product.category === 'Audio') score += 5;
    }
    if (useCaseLower.includes('fitness') || useCaseLower.includes('exercise') || useCaseLower.includes('health')) {
      if (product.category === 'Wearables') score += 5;
    }
    if (useCaseLower.includes('office') || useCaseLower.includes('work') || useCaseLower.includes('productivity')) {
      if (product.category === 'Laptops') score += 4;
      if (product.category === 'Monitors') score += 4;
      if (product.category === 'Accessories') score += 3;
    }

    // Budget filter
    if (budgetMax && product.price > budgetMax) {
      score = -1;
    }

    return { product, score };
  });

  const recommended = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (recommended.length === 0) {
    return {
      success: true,
      recommendations: [],
      message: budgetMax
        ? `No matching products found within $${budgetMax} budget for "${useCase}".`
        : `No matching products found for "${useCase}".`,
    };
  }

  return {
    success: true,
    recommendations: recommended.map((r) => ({
      name: r.product.name,
      price: r.product.price,
      category: r.product.category,
      shortDescription: r.product.shortDescription,
      slug: r.product.slug,
      relevanceScore: r.score,
    })),
  };
}

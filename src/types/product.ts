export interface Product {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  featured: boolean;
  inStock: boolean;
  tags: string[];
}

export interface KnowledgeEntry {
  id: string;
  category: "product_spec" | "troubleshooting" | "policy" | "faq";
  title: string;
  keywords: string[];
  content: string;
  relatedProductSku?: string;
  priority: number;
}

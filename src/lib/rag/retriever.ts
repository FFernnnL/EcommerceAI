// Semantic search and Top-K retrieval using TF-IDF

import { tokenizeAndStem } from './tokenizer';
import { buildIndex, TFIDFIndex } from './indexer';
import { KnowledgeEntry } from '@/types/knowledge';

// Import all knowledge base JSON files
import productSpecs from '@/data/knowledge/product-specs.json';
import troubleshooting from '@/data/knowledge/troubleshooting.json';
import shippingPolicy from '@/data/knowledge/shipping-policy.json';
import returnPolicy from '@/data/knowledge/return-policy.json';
import warrantyPolicy from '@/data/knowledge/warranty-policy.json';
import faq from '@/data/knowledge/faq.json';

let cachedIndex: TFIDFIndex | null = null;

function getAllKnowledge(): KnowledgeEntry[] {
  return [
    ...(productSpecs as unknown as KnowledgeEntry[]),
    ...(troubleshooting as unknown as KnowledgeEntry[]),
    ...(shippingPolicy as unknown as KnowledgeEntry[]),
    ...(returnPolicy as unknown as KnowledgeEntry[]),
    ...(warrantyPolicy as unknown as KnowledgeEntry[]),
    ...(faq as unknown as KnowledgeEntry[]),
  ];
}

function getIndex(): TFIDFIndex {
  if (!cachedIndex) {
    cachedIndex = buildIndex(getAllKnowledge());
  }
  return cachedIndex;
}

export interface RetrievalResult {
  entry: KnowledgeEntry;
  score: number;
}

export function retrieve(
  query: string,
  topK: number = 3,
  categories?: KnowledgeEntry["category"][]
): RetrievalResult[] {
  const index = getIndex();
  const queryTokens = tokenizeAndStem(query);

  if (queryTokens.length === 0) return [];

  // Calculate query TF
  const queryTF = new Map<string, number>();
  for (const token of queryTokens) {
    queryTF.set(token, (queryTF.get(token) || 0) + 1);
  }
  const maxQueryTF = Math.max(...queryTF.values(), 1);

  // Calculate query vector norm
  let queryNorm = 0;
  for (const [term, tf] of queryTF.entries()) {
    const idf = index.inverseDocFrequency.get(term) || 0;
    const tfidf = (tf / maxQueryTF) * idf;
    queryNorm += tfidf * tfidf;
  }
  queryNorm = Math.sqrt(queryNorm);

  if (queryNorm === 0) return [];

  // Score each document using cosine similarity
  const scores: { docIndex: number; score: number }[] = [];

  for (let docIndex = 0; docIndex < index.documents.length; docIndex++) {
    const docTF = index.termFrequency.get(docIndex);
    const docNorm = index.documentNorms.get(docIndex);
    if (!docTF || !docNorm || docNorm === 0) continue;

    let dotProduct = 0;
    for (const [term, qTF] of queryTF.entries()) {
      const dTF = docTF.get(term) || 0;
      if (dTF === 0) continue;
      const idf = index.inverseDocFrequency.get(term) || 0;
      dotProduct += (qTF / maxQueryTF) * idf * dTF * idf;
    }

    const similarity = dotProduct / (queryNorm * docNorm);

    // Keyword boost: extra score if document tags match query terms
    let tagBoost = 0;
    const docKeywords = (index.documents[docIndex].keywords || []).map((t) => t.toLowerCase());
    for (const token of queryTokens) {
      if (docKeywords.some((kw) => kw.includes(token) || token.includes(kw))) {
        tagBoost += 0.1;
      }
    }

    const finalScore = similarity + tagBoost;
    if (finalScore > 0.01) {
      scores.push({ docIndex, score: finalScore });
    }
  }

  // Filter by categories if specified
  let filteredScores = scores;
  if (categories && categories.length > 0) {
    const categorySet = new Set(categories);
    filteredScores = scores.filter(({ docIndex }) =>
      categorySet.has(index.documents[docIndex].category)
    );
  }

  // Sort by score descending and return top-K
  filteredScores.sort((a, b) => b.score - a.score);

  return filteredScores.slice(0, topK).map(({ docIndex, score }) => ({
    entry: index.documents[docIndex],
    score,
  }));
}

export function formatContext(results: RetrievalResult[]): string {
  if (results.length === 0) return '';

  return results
    .map(
      (r) =>
        `[${r.entry.category}] ${r.entry.title}:\n${r.entry.content}`
    )
    .join('\n\n---\n\n');
}

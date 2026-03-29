// TF-IDF index builder for RAG knowledge base

import { tokenizeAndStem } from './tokenizer';
import { KnowledgeEntry } from '@/types/knowledge';

export interface TFIDFIndex {
  documents: KnowledgeEntry[];
  termFrequency: Map<number, Map<string, number>>; // docIndex -> term -> frequency
  inverseDocFrequency: Map<string, number>; // term -> IDF
  documentNorms: Map<number, number>; // docIndex -> norm for cosine similarity
}

export function buildIndex(documents: KnowledgeEntry[]): TFIDFIndex {
  const termFrequency = new Map<number, Map<string, number>>();
  const documentFrequency = new Map<string, number>(); // how many docs contain term
  const N = documents.length;

  // Calculate term frequency for each document
  documents.forEach((doc, docIndex) => {
    const text = `${doc.title} ${doc.title} ${doc.content} ${(doc.keywords || []).join(' ')}`;
    const tokens = tokenizeAndStem(text);
    const tf = new Map<string, number>();

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normalize TF
    const maxTF = Math.max(...tf.values(), 1);
    for (const [term, count] of tf.entries()) {
      tf.set(term, count / maxTF);
    }

    termFrequency.set(docIndex, tf);

    // Count document frequency
    const uniqueTerms = new Set(tokens);
    for (const term of uniqueTerms) {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    }
  });

  // Calculate IDF
  const inverseDocFrequency = new Map<string, number>();
  for (const [term, df] of documentFrequency.entries()) {
    inverseDocFrequency.set(term, Math.log((N + 1) / (df + 1)) + 1);
  }

  // Calculate document norms for cosine similarity
  const documentNorms = new Map<number, number>();
  for (const [docIndex, tf] of termFrequency.entries()) {
    let norm = 0;
    for (const [term, tfValue] of tf.entries()) {
      const idf = inverseDocFrequency.get(term) || 0;
      const tfidf = tfValue * idf;
      norm += tfidf * tfidf;
    }
    documentNorms.set(docIndex, Math.sqrt(norm));
  }

  return { documents, termFrequency, inverseDocFrequency, documentNorms };
}

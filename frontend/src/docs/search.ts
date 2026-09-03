import { DOC_ARTICLES } from '@/docs/registry';

export interface DocSearchHit {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function searchDocs(query: string, limit = 12): DocSearchHit[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const hits: DocSearchHit[] = [];
  for (const article of DOC_ARTICLES) {
    const hay = normalize(
      [
        article.title,
        article.description,
        article.category,
        ...article.keywords,
        ...article.roles,
        ...article.sections.map((s) => s.title),
      ].join(' '),
    );
    if (!hay.includes(q) && !q.split(' ').every((part) => hay.includes(part))) continue;

    let score = 0;
    if (normalize(article.title).includes(q)) score += 10;
    if (article.keywords.some((k) => normalize(k).includes(q))) score += 5;
    if (normalize(article.description).includes(q)) score += 3;
    score += article.sections.filter((s) => normalize(s.title).includes(q)).length;

    hits.push({
      slug: article.slug,
      title: article.title,
      category: article.category,
      excerpt: article.description,
      score,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

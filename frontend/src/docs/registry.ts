import { domainArticles } from '@/docs/content/domain';
import { gettingStartedArticles } from '@/docs/content/gettingStarted';
import { roleArticles } from '@/docs/content/roles';
import type { DocArticle } from '@/docs/types';

export const DOC_ARTICLES: DocArticle[] = [
  ...gettingStartedArticles,
  ...roleArticles,
  ...domainArticles,
];

const bySlug = new Map(DOC_ARTICLES.map((a) => [a.slug, a]));

export function getDocArticle(slug: string): DocArticle | undefined {
  return bySlug.get(slug);
}

export function getAllDocSlugs(): string[] {
  return DOC_ARTICLES.map((a) => a.slug);
}

/** Product route → docs slug for contextual help */
export const PRODUCT_DOCS_LINKS: Record<string, string> = {
  '/control-tower': 'getting-started/overview',
  '/shipments': 'execution/shipments',
  '/exceptions': 'execution/exceptions',
  '/incidents': 'execution/exceptions',
  '/planning': 'planning/overview',
  '/planning/transport': 'planning/overview',
  '/planning/supply': 'planning/overview',
  '/planning/demand': 'planning/overview',
  '/scenarios': 'scenarios/overview',
  '/supplier/dashboard': 'roles/supplier',
  '/carrier/dashboard': 'roles/carrier',
  '/admin': 'roles/administrator',
};

export function resolveDocsSlugForPath(pathname: string): string | null {
  const normalized = pathname.split('?')[0] ?? pathname;
  if (PRODUCT_DOCS_LINKS[normalized]) return PRODUCT_DOCS_LINKS[normalized];
  const prefix = Object.keys(PRODUCT_DOCS_LINKS)
    .sort((a, b) => b.length - a.length)
    .find((p) => normalized === p || normalized.startsWith(`${p}/`));
  return prefix ? PRODUCT_DOCS_LINKS[prefix] : null;
}

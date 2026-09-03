import type { ReactNode } from 'react';

export type DocStatus = 'implemented' | 'partial' | 'mock' | 'planned';

export type DocRole =
  | 'ADMIN'
  | 'SUPPLY_CHAIN_MANAGER'
  | 'SUPPLY_PLANNER'
  | 'LOGISTICS_MANAGER'
  | 'ANALYST'
  | 'SUPPLIER'
  | 'CARRIER'
  | 'DEVELOPER'
  | 'ALL';

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  roles: DocRole[];
  status: DocStatus;
  lastUpdated: string;
  keywords: string[];
  productRoutes?: string[];
  prev?: string;
  next?: string;
}

export interface DocSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface DocArticle extends DocMeta {
  sections: DocSection[];
}

export interface DocNavItem {
  slug?: string;
  title: string;
  status?: DocStatus;
  children?: DocNavItem[];
}

export interface DocNavGroup {
  id: string;
  title: string;
  items: DocNavItem[];
}

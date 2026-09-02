import type { ReactNode } from 'react';

export interface HorizontalScrollItem {
  id: string;
  number?: string;
  title: string;
  description: string;
  image?: string;
  content?: ReactNode;
}

export interface HorizontalScrollSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  items: HorizontalScrollItem[];
  className?: string;
}

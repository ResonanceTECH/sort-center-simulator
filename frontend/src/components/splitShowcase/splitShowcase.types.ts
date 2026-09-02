export interface SplitShowcaseStat {
  label: string;
  value: string;
}

export interface SplitShowcaseItem {
  id: string;
  number?: string;
  title: string;
  description: string;
  image: string;
  tags?: readonly string[];
  stats?: readonly SplitShowcaseStat[];
}

export interface SplitShowcaseSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  items: SplitShowcaseItem[];
}

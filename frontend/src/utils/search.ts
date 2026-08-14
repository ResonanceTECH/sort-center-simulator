export function matchesSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

export function filterBySearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
): T[] {
  if (!query.trim()) return items;
  return items.filter((item) => matchesSearch(getSearchText(item), query));
}

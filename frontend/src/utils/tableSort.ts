export type SortDir = 'asc' | 'desc';

function readSortValue(row: unknown, sortBy: string): string | number {
  if (row == null || typeof row !== 'object') return '';

  const record = row as Record<string, unknown>;
  const direct = record[sortBy];

  if (direct != null && typeof direct === 'object' && 'value' in (direct as object)) {
    const metric = direct as { value?: string | number };
    return metric.value ?? '';
  }

  if (typeof direct === 'number' || typeof direct === 'string') return direct;
  if (typeof direct === 'boolean') return direct ? 1 : 0;
  return String(direct ?? '');
}

/** Server-side sort helper — apply before pagination slice. */
export function sortRows<T>(
  items: T[],
  sortBy?: string,
  sortDir: SortDir = 'asc',
): T[] {
  if (!sortBy) return items;

  const factor = sortDir === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const av = readSortValue(a, sortBy);
    const bv = readSortValue(b, sortBy);

    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * factor;
    }

    return String(av).localeCompare(String(bv), 'ru', { numeric: true }) * factor;
  });
}

export function paginateRows<T>(
  items: T[],
  page = 0,
  pageSize = 25,
): { items: T[]; total: number; page: number; pageSize: number } {
  const total = items.length;
  const start = page * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

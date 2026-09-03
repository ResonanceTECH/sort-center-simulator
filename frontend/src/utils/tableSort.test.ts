import { describe, expect, it } from 'vitest';
import { paginateRows, sortRows } from '@/utils/tableSort';

describe('tableSort', () => {
  it('sortRows orders strings asc/desc', () => {
    const rows = [{ name: 'Charlie' }, { name: 'Alpha' }, { name: 'Bravo' }];
    expect(sortRows(rows, 'name', 'asc').map((r) => r.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(sortRows(rows, 'name', 'desc').map((r) => r.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('sortRows reads metric.value fields', () => {
    const rows = [
      { otif: { value: 91 } },
      { otif: { value: 84 } },
      { otif: { value: 95 } },
    ];
    expect(sortRows(rows, 'otif', 'asc').map((r) => r.otif.value)).toEqual([84, 91, 95]);
  });

  it('paginateRows slices after sort contract', () => {
    const all = Array.from({ length: 30 }, (_, i) => ({ id: i }));
    const page = paginateRows(all, 1, 10);
    expect(page.total).toBe(30);
    expect(page.items).toHaveLength(10);
    expect(page.items[0]?.id).toBe(10);
  });
});

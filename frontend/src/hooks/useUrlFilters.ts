import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlFilters<T extends Record<string, string | undefined>>(
  defaults: T,
): [T, (updates: Partial<T>) => void, (key: keyof T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const value = searchParams.get(String(key));
      if (value != null && value !== '') {
        result[key] = value as T[keyof T];
      }
    }
    return result;
  }, [searchParams, defaults]);

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value == null || value === '') {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilter = useCallback(
    (key: keyof T) => {
      setFilters({ [key]: undefined } as Partial<T>);
    },
    [setFilters],
  );

  return [filters, setFilters, clearFilter];
}

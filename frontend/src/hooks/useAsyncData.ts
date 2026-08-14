import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/utils/error';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface UseAsyncDataResult<T> extends AsyncState<T> {
  retry: () => void;
}

export function useAsyncData<T>(fetcher: () => Promise<T>): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetcher();
      if (mountedRef.current) {
        setState({ data, error: null, loading: false });
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, error: getErrorMessage(err), loading: false });
      }
    }
  }, [fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  return { ...state, retry };
}


import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Runs an async function on mount / when deps change.
 * Exposes data, loading, error, reload and setData.
 */
export function useAsync(fn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({
    data: null,
    loading: enabled,
    error: null,
  });

  const fnRef = useRef(fn);
  const requestId = useRef(0);

  fnRef.current = fn;

  const run = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    try {
      const data = await fnRef.current();

      return {
        data,
        loading: false,
        error: null,
        requestId: currentRequest,
      };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error,
        requestId: currentRequest,
      };
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestId.current += 1;

      setState({
        data: null,
        loading: false,
        error: null,
      });

      return;
    }

    let cancelled = false;

    run().then((next) => {
      if (!cancelled && next.requestId === requestId.current) {
        setState({
          data: next.data,
          loading: next.loading,
          error: next.error,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [...deps, enabled, run]);

  const reload = useCallback(async () => {
    if (!enabled) return;

    const next = await run();

    if (next.requestId === requestId.current) {
      setState({
        data: next.data,
        loading: next.loading,
        error: next.error,
      });
    }
  }, [run, enabled]);

  const setData = useCallback((updater) => {
    setState((previous) => ({
      ...previous,
      data:
        typeof updater === "function"
          ? updater(previous.data)
          : updater,
    }));
  }, []);

  return {
    ...state,
    reload,
    setData,
  };
}

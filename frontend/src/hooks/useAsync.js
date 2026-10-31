import { useCallback, useEffect, useRef, useState } from "react";

/** Runs an async function on mount / when deps change. Exposes data, loading, error, reload and setData. */
export function useAsync(fn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async (silent = false) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      return { data, loading: false, error: null };
    } catch (e) {
      return { data: null, loading: false, error: e };
    }
  }, []);

  useEffect(() => {
    if (!enabled) { setState({ data: null, loading: false, error: null }); return undefined; }
    let cancelled = false;
    run().then((next) => { if (!cancelled) setState(next); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  const reload = useCallback(() => run().then(setState), [run]);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })), []);
  return { ...state, reload, setData };
}

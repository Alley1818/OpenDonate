import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/index.js";

const PAGE_SIZE = 12;
const MAX_PAGES_PER_LOAD = 4;

// Each feed is keyed by its viewer and filters so a new scope starts at offset zero.
export function usePostPages({ userId, match }) {
  const cursor = useRef({ offset: 0, seen: new Set() });
  const request = useRef(null);
  const [state, setState] = useState({ items: [], initial: true, busy: false, error: null, more: true });

  const load = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const { signal } = controller;
    const current = cursor.current;
    setState((previous) => ({ ...previous, busy: true, error: null }));

    try {
      const matches = [];
      let more = true;
      for (let page = 0; page < MAX_PAGES_PER_LOAD && more && !matches.length; page += 1) {
        const results = await api.posts.page({ userId, offset: current.offset, limit: PAGE_SIZE, signal });
        if (signal.aborted) return;
        for (const post of results) {
          if (current.seen.has(post.id)) continue;
          if (match(post)) matches.push(post);
          current.seen.add(post.id);
        }
        current.offset += results.length;
        more = results.length === PAGE_SIZE;
      }
      setState((previous) => ({
        items: [...previous.items, ...matches], initial: false, busy: false, error: null, more,
      }));
    } catch (error) {
      if (!signal.aborted) setState((previous) => ({ ...previous, initial: false, busy: false, error }));
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [userId, match]);

  useEffect(() => {
    load();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [load]);

  const update = (post) => setState((previous) => ({
    ...previous, items: previous.items.map((item) => (item.id === post.id ? post : item)),
  }));

  return { ...state, load, update };
}

import { useState, useEffect, useCallback } from 'react';
import type { CatalogFeed, CatalogItem } from '../types/catalog';

type FeedState =
  | { status: 'loading' }
  | { status: 'success'; items: CatalogItem[]; version: number; generatedAt: string }
  | { status: 'error' };

// Version-keyed cache: reuse the parsed array across remounts when the feed
// hasn't republished, so we avoid rebuilding identical data. Never used as a
// stale fallback on error.
let cache: { version: number; items: CatalogItem[] } | null = null;

export function useCatalogFeed() {
  const [state, setState] = useState<FeedState>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setNonce(n => n + 1);
  }, []);

  useEffect(() => {
    const url = import.meta.env.VITE_CATALOG_FEED_URL as string | undefined;
    if (!url || url.includes('YOUR_SCRIPT_ID')) {
      console.error('VITE_CATALOG_FEED_URL is not configured in .env');
      setState({ status: 'error' });
      return;
    }

    let cancelled = false;

    fetch(url, { redirect: 'follow' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CatalogFeed>;
      })
      .then(feed => {
        if (cancelled) return;
        // Error envelope: ignore items entirely.
        if (feed.error || !Array.isArray(feed.items)) {
          console.error('Catalog feed returned error:', feed.error ?? 'malformed payload');
          setState({ status: 'error' });
          return;
        }
        const items =
          cache && cache.version === feed.version ? cache.items : feed.items;
        cache = { version: feed.version, items };
        setState({
          status: 'success',
          items,
          version: feed.version,
          generatedAt: feed.generatedAt,
        });
      })
      .catch(err => {
        console.error('Catalog feed fetch failed:', err);
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { ...state, retry };
}

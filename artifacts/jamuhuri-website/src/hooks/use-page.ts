import { useState, useEffect } from "react";

interface PageData {
  pageName: string;
  pageTitle: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  heroImage: string | null;
  heroButton: string | null;
  heroButtonText: string | null;
  bodyContent: string | null;
  footerContent: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: string | null;
}

const cache = new Map<string, PageData>();

export function usePage(name: string) {
  const [data, setData] = useState<PageData | null>(cache.get(name) || null);
  const [loading, setLoading] = useState(!cache.has(name));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(name)) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/pages/${name}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => {
        if (cancelled) return;
        cache.set(name, d);
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [name]);

  return { data, loading, error };
}

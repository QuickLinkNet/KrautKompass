import { useEffect, useState } from 'react';
import { systemApi } from '../../api/endpoints';
import type { Meta, Option } from '../../api/types';

let cache: Promise<Meta> | null = null;

/** Bewertungs-Vokabular (Wirkungen, Konsumformen …), einmal pro Sitzung geladen. */
export function useMeta(): Meta | null {
  const [meta, setMeta] = useState<Meta | null>(null);
  useEffect(() => {
    cache ??= systemApi.meta().catch((e: unknown) => {
      cache = null;
      throw e;
    });
    let active = true;
    cache.then((m) => active && setMeta(m)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return meta;
}

export function labelFor(options: Option[] | undefined, key: string): string {
  return options?.find((o) => o.key === key)?.label ?? key;
}

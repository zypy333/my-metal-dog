import { useCallback, useEffect, useState } from 'react';

import { loadJson, saveJson } from '@/lib/storage';

const STORAGE_KEY = 'metal-dog:selected-gyms:v2';

export function useSelectedGyms() {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadJson<number[]>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      setIds(Array.isArray(stored) ? stored : []);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((next: number[]) => {
    setIds(next);
    void saveJson(STORAGE_KEY, next);
  }, []);

  return { ids, ready, update };
}

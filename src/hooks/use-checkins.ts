import { useCallback, useEffect, useState } from 'react';

import { shiftDateKey } from '@/lib/date';
import { loadJson, saveJson } from '@/lib/storage';
import type { CheckinMap, MuscleCategoryId } from '@/lib/types';

const STORAGE_KEY = 'metal-dog:checkins:v1';

/** 首启是否铺示例签到；已发布版本应为 false，避免新用户看到假打卡数据 */
const SEED_DEMO_CHECKINS = false;

function buildDemoCheckins(): CheckinMap {
  return {
    [shiftDateKey(1)]: ['chest', 'cardio'],
    [shiftDateKey(3)]: ['back', 'arms'],
    [shiftDateKey(6)]: ['legs', 'lower'],
    [shiftDateKey(9)]: ['shoulder', 'upper'],
  };
}

export function useCheckins() {
  const [entries, setEntries] = useState<CheckinMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadJson<CheckinMap>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;

      if (stored && typeof stored === 'object') {
        setEntries(stored);
        setReady(true);
        return;
      }

      const seeded = SEED_DEMO_CHECKINS ? buildDemoCheckins() : {};
      setEntries(seeded);
      setReady(true);
      void saveJson(STORAGE_KEY, seeded);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setDay = useCallback((dateKey: string, categories: MuscleCategoryId[]) => {
    setEntries((previous) => {
      const next = { ...previous };
      if (categories.length > 0) {
        next[dateKey] = categories;
      } else {
        delete next[dateKey];
      }
      void saveJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { entries, ready, setDay };
}

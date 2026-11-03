import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchGymDirectory } from '@/lib/api';
import type { DirectoryProvince, Gym } from '@/lib/types';

export function useGymDirectory() {
  const [directory, setDirectory] = useState<DirectoryProvince[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchGymDirectory()
      .then((data) => {
        if (!cancelled) setDirectory(data);
      })
      .catch(() => {
        if (!cancelled) setError('门店列表加载失败，请检查网络后重试');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const gyms = useMemo<Gym[]>(
    () => directory?.flatMap((province) => province.cities.flatMap((city) => city.gyms)) ?? [],
    [directory]
  );

  const findGym = useCallback(
    (gymId: number) => gyms.find((gym) => gym.id === gymId),
    [gyms]
  );

  const reload = useCallback(() => {
    setError(null);
    fetchGymDirectory()
      .then(setDirectory)
      .catch(() => setError('门店列表加载失败，请检查网络后重试'));
  }, []);

  return {
    directory,
    gyms,
    findGym,
    loading: directory === null && error === null,
    error,
    reload,
  };
}

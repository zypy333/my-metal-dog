import type { DirectoryProvince, Gym, GymStats } from './types';

/** 金属狗 App 内的品牌 ID，出现在所有业务路径里 */
const BRAND_ID = 1041;
const API_HOST = 'https://api.sbooy.com';
const MOTION_HOST = 'https://motion.sbooy.com';
/** App 实际 UA，照抄避免被当成异常流量（浏览器端会被忽略） */
const USER_AGENT = 'uni-app jinshugouapp';

type RawStadium = {
  id: number;
  name: string;
  /** "省,市,区" */
  ads: string;
  gps?: string;
};

type ThermometerCache = {
  time?: number;
  data?: Record<string, string>;
};

type ThermometerReading = {
  temperature: number | null;
  humidity: number | null;
  sensorUpdatedAt: number | null;
};

function toGym(raw: RawStadium): Gym {
  const parts = (raw.ads ?? '').split(',');
  const province = parts[0]?.trim() || '未知省份';
  const city = parts[1]?.trim() || province;
  return {
    id: raw.id,
    name: raw.name,
    address: (raw.ads ?? '').replace(/,/g, ' '),
    province,
    city,
  };
}

function groupByRegion(gyms: Gym[]): DirectoryProvince[] {
  const provinces = new Map<string, Map<string, Gym[]>>();

  for (const gym of gyms) {
    let cities = provinces.get(gym.province);
    if (!cities) {
      cities = new Map<string, Gym[]>();
      provinces.set(gym.province, cities);
    }
    const list = cities.get(gym.city);
    if (list) {
      list.push(gym);
    } else {
      cities.set(gym.city, [gym]);
    }
  }

  return [...provinces.entries()].map(([name, cities]) => ({
    name,
    cities: [...cities.entries()].map(([cityName, cityGyms]) => ({
      name: cityName,
      gyms: cityGyms,
    })),
  }));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`请求失败（HTTP ${response.status}）`);
  }
  return (await response.json()) as T;
}

function parsePeople(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text !== '' && Number.isFinite(Number(text))) return Number(text);
  }
  return null;
}

async function fetchCurrentPeople(stadiumId: number): Promise<number | null> {
  const raw = await fetchJson<unknown>(
    `${API_HOST}/card/${BRAND_ID}/${stadiumId}/public/signUp/statistics/currentOnlinePopulationStadium?type=level5`
  );
  return parsePeople(raw);
}

/** 温湿度 data 的值是「字符串形式的 JSON」，需要二次解析 */
async function fetchThermometer(stadiumId: number): Promise<ThermometerReading | null> {
  const payload = await fetchJson<ThermometerCache>(
    `${MOTION_HOST}/v1/cache/getFromTopic?topic=${BRAND_ID}_${stadiumId}.thermometer`
  );
  const readings = payload?.data ? Object.values(payload.data) : [];
  const rawReading = readings[0];
  if (!rawReading) return null;

  try {
    const parsed = JSON.parse(rawReading) as {
      time?: number;
      data?: { temperature?: number; humidity?: number };
    };
    return {
      temperature: typeof parsed.data?.temperature === 'number' ? parsed.data.temperature : null,
      humidity: typeof parsed.data?.humidity === 'number' ? parsed.data.humidity : null,
      sensorUpdatedAt: parsed.time ?? payload.time ?? null,
    };
  } catch {
    return null;
  }
}

let directoryRequest: Promise<DirectoryProvince[]> | null = null;

/** 全量门店列表（约 1065 家，一次返回），会话内只请求一次 */
export function fetchGymDirectory(): Promise<DirectoryProvince[]> {
  if (!directoryRequest) {
    directoryRequest = fetchJson<RawStadium[]>(`${API_HOST}/gym/${BRAND_ID}/0/public/stadiumList`)
      .then((raw) => groupByRegion(raw.map(toGym)))
      .catch((error: unknown) => {
        directoryRequest = null;
        throw error;
      });
  }
  return directoryRequest;
}

export async function fetchGymStats(gymIds: number[]): Promise<GymStats[]> {
  const results = await Promise.all(
    gymIds.map(async (gymId) => {
      const [peopleResult, thermometerResult] = await Promise.allSettled([
        fetchCurrentPeople(gymId),
        fetchThermometer(gymId),
      ]);

      const thermometer = thermometerResult.status === 'fulfilled' ? thermometerResult.value : null;

      return {
        gymId,
        currentPeople: peopleResult.status === 'fulfilled' ? peopleResult.value : null,
        temperature: thermometer?.temperature ?? null,
        humidity: thermometer?.humidity ?? null,
        sensorUpdatedAt: thermometer?.sensorUpdatedAt ?? null,
        updatedAt: Date.now(),
      } satisfies GymStats;
    })
  );

  return results;
}

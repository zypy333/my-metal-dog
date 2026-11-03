/** 训练部位分类 */
export type MuscleCategoryId =
  | 'chest'
  | 'shoulder'
  | 'back'
  | 'legs'
  | 'arms'
  | 'upper'
  | 'lower'
  | 'cardio';

export type MuscleCategory = {
  id: MuscleCategoryId;
  label: string;
  color: string;
};

/** 门店目录条目，来自 stadiumList 接口 */
export type Gym = {
  id: number;
  name: string;
  address: string;
  province: string;
  city: string;
};

export type DirectoryCity = {
  name: string;
  gyms: Gym[];
};

export type DirectoryProvince = {
  name: string;
  cities: DirectoryCity[];
};

/** 门店实时数据；null 表示该字段缺失或读取失败 */
export type GymStats = {
  gymId: number;
  currentPeople: number | null;
  /** 摄氏度 */
  temperature: number | null;
  /** 相对湿度百分比 */
  humidity: number | null;
  /** 温湿度探头上报时间（Unix 秒） */
  sensorUpdatedAt: number | null;
  /** 本次拉取时间 */
  updatedAt: number;
};

/** dateKey(YYYY-MM-DD) -> 当天签到的分类 */
export type CheckinMap = Record<string, MuscleCategoryId[]>;

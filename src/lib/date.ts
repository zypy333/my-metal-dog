function pad2(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

/** 本地时区的 YYYY-MM-DD，避免 toISOString 的时区偏移 */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function shiftDateKey(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toDateKey(date);
}

/** "2026-10-31" -> "10月31日" */
export function formatMonthDay(key: string) {
  const [, month, day] = key.split('-');
  return `${Number(month)}月${Number(day)}日`;
}

export function monthKey(year: number, month: number) {
  return `${year}-${pad2(month + 1)}`;
}

export type CalendarCell = {
  key: string;
  day: number;
  inMonth: boolean;
  isFuture: boolean;
};

/** 以周一为起点的 6 行 × 7 列月视图 */
export function buildMonthCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const today = todayKey();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, month, 1 - offset + index);
    const key = toDateKey(date);
    cells.push({
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isFuture: key > today,
    });
  }

  return cells;
}

export function formatRelativeTime(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return '刚刚更新';
  if (minutes < 60) return `${minutes} 分钟前更新`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前更新`;
  return `${Math.floor(hours / 24)} 天前更新`;
}

import type { MuscleCategory, MuscleCategoryId } from './types';

export const MUSCLE_CATEGORIES: MuscleCategory[] = [
  { id: 'chest', label: '胸', color: '#EF4444' },
  { id: 'shoulder', label: '肩', color: '#F59E0B' },
  { id: 'back', label: '背', color: '#10B981' },
  { id: 'legs', label: '腿', color: '#3B82F6' },
  { id: 'arms', label: '手', color: '#8B5CF6' },
  { id: 'upper', label: '上肢', color: '#06B6D4' },
  { id: 'lower', label: '下肢', color: '#65A30D' },
  { id: 'cardio', label: '有氧', color: '#EC4899' },
];

export const CATEGORY_MAP = Object.fromEntries(
  MUSCLE_CATEGORIES.map((item) => [item.id, item])
) as Record<MuscleCategoryId, MuscleCategory>;

/** 按固定分类顺序排序，保证同一天的标签顺序稳定 */
export function sortCategories(ids: MuscleCategoryId[]): MuscleCategoryId[] {
  return MUSCLE_CATEGORIES.filter((item) => ids.includes(item.id)).map((item) => item.id);
}

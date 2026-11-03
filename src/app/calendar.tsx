import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckinModal } from '@/components/checkin-modal';
import { Palette, Spacing } from '@/constants/theme';
import { CATEGORY_MAP, sortCategories } from '@/lib/categories';
import { buildMonthCells, monthKey, todayKey } from '@/lib/date';
import type { MuscleCategoryId } from '@/lib/types';
import { useCheckins } from '@/hooks/use-checkins';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function CalendarScreen() {
  const { entries, ready, setDay } = useCheckins();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [editor, setEditor] = useState<{ dateKey: string; mode: 'add' | 'edit' } | null>(null);
  const [draft, setDraft] = useState<MuscleCategoryId[]>([]);

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor]);
  const todayDateKey = todayKey();

  const monthCheckinCount = useMemo(() => {
    const prefix = monthKey(cursor.year, cursor.month);
    return Object.keys(entries).filter((key) => key.startsWith(prefix)).length;
  }, [entries, cursor]);

  const changeMonth = (delta: number) => {
    setCursor((previous) => {
      const date = new Date(previous.year, previous.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const goToday = () => {
    const date = new Date();
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  const openEditor = (dateKey: string, mode: 'add' | 'edit') => {
    setDraft(entries[dateKey] ?? []);
    setEditor({ dateKey, mode });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>训练日历</Text>
          <Text style={styles.subtitle}>
            {ready ? `本月已签到 ${monthCheckinCount} 天` : '正在读取签到记录…'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.calendarCard}>
            <View style={styles.monthRow}>
              <Pressable hitSlop={8} onPress={() => changeMonth(-1)}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color={Palette.textSecondary}
                />
              </Pressable>
              <Text style={styles.monthLabel}>
                {cursor.year}年{cursor.month + 1}月
              </Text>
              <Pressable hitSlop={8} onPress={() => changeMonth(1)}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Palette.textSecondary}
                />
              </Pressable>
              <Pressable style={styles.todayButton} onPress={goToday}>
                <Text style={styles.todayText}>今天</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((label) => (
                <Text key={label} style={styles.weekLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell) => {
                const categories = (entries[cell.key] ?? []).map((id) => CATEGORY_MAP[id]);
                const signed = categories.length > 0;
                const isToday = cell.key === todayDateKey;

                return (
                  <Pressable
                    key={cell.key}
                    disabled={cell.isFuture}
                    delayLongPress={280}
                    onPress={() => openEditor(cell.key, 'add')}
                    onLongPress={() => openEditor(cell.key, 'edit')}
                    style={[styles.cell, !cell.inMonth && styles.cellDimmed]}>
                    <View
                      style={[
                        styles.dayCircle,
                        signed && styles.dayCircleSigned,
                        isToday && !signed && styles.dayCircleToday,
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          signed && styles.dayTextSigned,
                          isToday && !signed && styles.dayTextToday,
                          !cell.inMonth && !signed && !isToday && styles.dayTextMuted,
                          cell.isFuture && styles.dayTextMuted,
                        ]}>
                        {cell.day}
                      </Text>
                    </View>
                    <View style={styles.tagWrap}>
                      {categories.slice(0, 2).map((category) => (
                        <Text
                          key={category.id}
                          style={[styles.tagText, { color: category.color }]}
                          numberOfLines={1}>
                          {category.label}
                        </Text>
                      ))}
                      {categories.length > 2 && (
                        <Text style={styles.moreText}>+{categories.length - 2}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.footnote}>签到记录保存在本机，点击日期可随时调整</Text>
        </ScrollView>
      </View>

      {editor && (
        <CheckinModal
          dateKey={editor.dateKey}
          mode={editor.mode}
          draft={draft}
          onToggle={(id) =>
            setDraft((previous) =>
              previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
            )
          }
          onClose={() => setEditor(null)}
          onClear={() => {
            setDay(editor.dateKey, []);
            setEditor(null);
          }}
          onSave={() => {
            setDay(editor.dateKey, sortCategories(draft));
            setEditor(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  calendarCard: {
    backgroundColor: Palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.three,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  monthLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  weekLabel: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.one,
  },
  cell: {
    width: '14.2857%',
    minHeight: 62,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  cellDimmed: {
    opacity: 0.35,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSigned: {
    backgroundColor: Palette.primary,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  dayTextSigned: {
    color: '#fff',
  },
  dayTextToday: {
    color: Palette.primary,
  },
  dayTextMuted: {
    color: Palette.textMuted,
    fontWeight: '500',
  },
  tagWrap: {
    alignItems: 'center',
    marginTop: 2,
    gap: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  moreText: {
    fontSize: 9,
    color: Palette.textMuted,
    lineHeight: 11,
  },
  footnote: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});

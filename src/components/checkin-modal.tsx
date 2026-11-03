import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { MUSCLE_CATEGORIES } from '@/lib/categories';
import { formatMonthDay } from '@/lib/date';
import type { MuscleCategoryId } from '@/lib/types';

type Props = {
  dateKey: string;
  mode: 'add' | 'edit';
  draft: MuscleCategoryId[];
  onToggle: (id: MuscleCategoryId) => void;
  onClose: () => void;
  onClear: () => void;
  onSave: () => void;
};

export function CheckinModal({ dateKey, mode, draft, onToggle, onClose, onClear, onSave }: Props) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{formatMonthDay(dateKey)}</Text>
            <Text style={styles.mode}>{mode === 'edit' ? '编辑签到' : '签到'}</Text>
          </View>
          <Text style={styles.subtitle}>
            {mode === 'edit' ? '调整当天练过的部位，可取消已签到的分类' : '可多选，再次点击可取消'}
          </Text>

          <View style={styles.grid}>
            {MUSCLE_CATEGORIES.map((category) => {
              const selected = draft.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => onToggle(category.id)}
                  style={[
                    styles.categoryChip,
                    selected && {
                      borderColor: category.color,
                      backgroundColor: `${category.color}1A`,
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <Text style={[styles.categoryText, selected && { color: category.color }]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === 'edit' && (
            <Pressable onPress={onClear} style={styles.clearRow} hitSlop={6}>
              <MaterialCommunityIcons name="trash-can-outline" size={14} color={Palette.danger} />
              <Text style={styles.clearText}>清空当天签到</Text>
            </Pressable>
          )}

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveText}>保存</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  mode: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
    marginTop: Spacing.one,
  },
  categoryChip: {
    width: '23.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  clearText: {
    fontSize: 12,
    color: Palette.danger,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Palette.background,
  },
  cancelText: {
    fontSize: 15,
    color: Palette.textSecondary,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Palette.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

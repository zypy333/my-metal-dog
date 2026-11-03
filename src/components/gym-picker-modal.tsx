import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';
import type { DirectoryProvince } from '@/lib/types';

type Props = {
  directory: DirectoryProvince[];
  selectedIds: number[];
  onClose: () => void;
  onConfirm: (ids: number[]) => void;
};

export function GymPickerModal({ directory, selectedIds, onClose, onConfirm }: Props) {
  const allGyms = useMemo(
    () => directory.flatMap((province) => province.cities.flatMap((city) => city.gyms)),
    [directory]
  );

  const [draft, setDraft] = useState<number[]>(selectedIds);
  const [provinceName, setProvinceName] = useState(() => {
    const anchor = allGyms.find((gym) => selectedIds.includes(gym.id));
    return anchor?.province ?? directory[0]?.name ?? '';
  });
  const [cityName, setCityName] = useState(() => {
    const anchor = allGyms.find((gym) => selectedIds.includes(gym.id));
    return anchor?.city ?? directory[0]?.cities[0]?.name ?? '';
  });

  const province = directory.find((item) => item.name === provinceName) ?? directory[0];
  const city = province?.cities.find((item) => item.name === cityName) ?? province?.cities[0];

  if (!province || !city) return null;

  const chooseProvince = (name: string) => {
    const nextProvince = directory.find((item) => item.name === name);
    setProvinceName(name);
    if (nextProvince) setCityName(nextProvince.cities[0].name);
  };

  const toggleGym = (gymId: number) => {
    setDraft((previous) =>
      previous.includes(gymId) ? previous.filter((id) => id !== gymId) : [...previous, gymId]
    );
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable hitSlop={8} onPress={onClose}>
              <Text style={styles.headerGhost}>取消</Text>
            </Pressable>
            <Text style={styles.headerTitle}>选择健身房</Text>
            <Pressable hitSlop={8} onPress={() => onConfirm(draft)}>
              <Text style={styles.headerPrimary}>完成</Text>
            </Pressable>
          </View>

          <View style={styles.regionBlock}>
            <View style={styles.regionTitleRow}>
              <Text style={styles.sectionLabel}>省份</Text>
              <Text style={styles.selectedCount}>已选 {draft.length} 家</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {directory.map((item) => {
                const active = item.name === province.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => chooseProvince(item.name)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionLabel}>城市</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {province.cities.map((item) => {
                const active = item.name === city.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => setCityName(item.name)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView contentContainerStyle={styles.listContent}>
            <Text style={styles.listCaption}>
              {city.name} · 共 {city.gyms.length} 家
            </Text>
            {city.gyms.map((gym) => {
              const checked = draft.includes(gym.id);
              return (
                <Pressable
                  key={gym.id}
                  onPress={() => toggleGym(gym.id)}
                  style={[styles.gymRow, checked && styles.gymRowChecked]}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <MaterialCommunityIcons name="check" size={15} color="#fff" />}
                  </View>
                  <View style={styles.gymText}>
                    <Text style={styles.gymName} numberOfLines={1}>
                      {gym.name}
                    </Text>
                    <Text style={styles.gymAddress} numberOfLines={1}>
                      {gym.address}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerGhost: {
    fontSize: 15,
    color: Palette.textSecondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  headerPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.primary,
  },
  regionBlock: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  regionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  selectedCount: {
    fontSize: 12,
    color: Palette.primary,
    fontWeight: '600',
  },
  chipRow: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.background,
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  listCaption: {
    fontSize: 12,
    color: Palette.textMuted,
    marginBottom: Spacing.one,
  },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  gymRowChecked: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primarySoft,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  gymText: {
    flex: 1,
    gap: 2,
  },
  gymName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  gymAddress: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
});

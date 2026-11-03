import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GymCard } from '@/components/gym-card';
import { GymPickerModal } from '@/components/gym-picker-modal';
import { Palette, Spacing } from '@/constants/theme';
import { useGymDirectory } from '@/hooks/use-gym-directory';
import { useSelectedGyms } from '@/hooks/use-selected-gyms';
import { fetchGymStats } from '@/lib/api';
import { formatRelativeTime } from '@/lib/date';
import type { Gym, GymStats } from '@/lib/types';

export default function GymListScreen() {
  const { ids, ready, update } = useSelectedGyms();
  const { directory, gyms, loading: directoryLoading, error: directoryError, reload } =
    useGymDirectory();
  const [stats, setStats] = useState<Record<number, GymStats>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadStats = useCallback(async (gymIds: number[]) => {
    if (gymIds.length === 0) return;
    const next = await fetchGymStats(gymIds);
    setStats(Object.fromEntries(next.map((item) => [item.gymId, item])));
  }, []);

  useEffect(() => {
    if (!ready || ids.length === 0) return;

    let cancelled = false;
    fetchGymStats(ids).then((next) => {
      if (cancelled) return;
      setStats(Object.fromEntries(next.map((item) => [item.gymId, item])));
    });

    return () => {
      cancelled = true;
    };
  }, [ready, ids]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadStats(ids);
    } finally {
      setRefreshing(false);
    }
  }, [ids, loadStats]);

  const selectedGyms = useMemo(
    () =>
      ids
        .map((id) => gyms.find((gym) => gym.id === id))
        .filter((gym): gym is Gym => gym !== undefined),
    [ids, gyms]
  );

  const latestUpdatedAt = useMemo(() => {
    const timestamps = Object.values(stats).map((item) => item.updatedAt);
    return timestamps.length > 0 ? Math.max(...timestamps) : null;
  }, [stats]);

  const loadingFirst = ids.length > 0 && Object.keys(stats).length === 0;
  const subtitle =
    ids.length === 0
      ? '还没有添加常去的门店'
      : `${ids.length} 家常去${latestUpdatedAt ? ` · ${formatRelativeTime(latestUpdatedAt)}` : ''}`;

  const renderBody = () => {
    if (directoryLoading || !ready || loadingFirst) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.primary} />
          <Text style={styles.centeredText}>正在读取门店数据…</Text>
        </View>
      );
    }

    if (directoryError) {
      return (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="cloud-off-outline" size={36} color={Palette.textMuted} />
          <Text style={styles.emptyTitle}>门店列表加载失败</Text>
          <Text style={styles.emptyDesc}>{directoryError}</Text>
          <Pressable style={styles.emptyButton} onPress={reload}>
            <Text style={styles.emptyButtonText}>重新加载</Text>
          </Pressable>
        </View>
      );
    }

    if (selectedGyms.length === 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>还没有常去的健身房</Text>
          <Text style={styles.emptyDesc}>点击右上角「选择健身房」，按省市勾选你的常去门店</Text>
          <Pressable style={styles.emptyButton} onPress={() => setPickerOpen(true)}>
            <Text style={styles.emptyButtonText}>选择健身房</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.cards}>
        {selectedGyms.map((gym) => (
          <GymCard key={gym.id} gym={gym} stats={stats[gym.id]} />
        ))}
        <Text style={styles.footnote}>下拉或点击右上角刷新，可更新人数与温湿度</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>我的健身房</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing || ids.length === 0}>
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={refreshing || ids.length === 0 ? Palette.textMuted : Palette.primary}
              />
            </Pressable>
            <Pressable
              style={styles.selectButton}
              onPress={() => setPickerOpen(true)}
              disabled={directory === null}>
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={styles.selectText}>选择健身房</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Palette.primary}
              colors={[Palette.primary]}
            />
          }>
          {renderBody()}
        </ScrollView>
      </View>

      {pickerOpen && directory && (
        <GymPickerModal
          directory={directory}
          selectedIds={ids}
          onClose={() => setPickerOpen(false)}
          onConfirm={(nextIds) => {
            update(nextIds);
            setPickerOpen(false);
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
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  titleBlock: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  selectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  cards: {
    gap: Spacing.two,
  },
  footnote: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.three,
  },
  centeredText: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.three,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: Spacing.two,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

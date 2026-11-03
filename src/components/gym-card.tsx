import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/date';
import type { Gym, GymStats } from '@/lib/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  gym: Gym;
  stats?: GymStats;
};

export function GymCard({ gym, stats }: Props) {
  const items: { icon: IconName; value: string; label: string }[] = [
    {
      icon: 'account-multiple-outline',
      value: stats?.currentPeople != null ? `${stats.currentPeople}` : '—',
      label: '当前人数',
    },
    {
      icon: 'thermometer',
      value: stats?.temperature != null ? `${stats.temperature.toFixed(1)}°C` : '—',
      label: '温度',
    },
    {
      icon: 'water-percent',
      value: stats?.humidity != null ? `${stats.humidity.toFixed(1)}%` : '—',
      label: '湿度',
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {gym.name}
        </Text>
        <Text style={styles.updated}>{stats ? formatRelativeTime(stats.updatedAt) : '读取中'}</Text>
      </View>

      <View style={styles.addressRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={14} color={Palette.textMuted} />
        <Text style={styles.address} numberOfLines={1}>
          {gym.address}
        </Text>
      </View>

      <View style={styles.statsRow}>
        {items.map((item) => (
          <View key={item.label} style={styles.statPill}>
            <View style={styles.statValueRow}>
              <MaterialCommunityIcons name={item.icon} size={15} color={Palette.primary} />
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  updated: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: Palette.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: Palette.background,
    borderRadius: 12,
    paddingVertical: Spacing.two,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  statLabel: {
    fontSize: 10,
    color: Palette.textMuted,
  },
});

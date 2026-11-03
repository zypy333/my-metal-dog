import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { Palette } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarStyle: {
          backgroundColor: Palette.surface,
          borderTopColor: Palette.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: Palette.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '健身房',
          tabBarIcon: ({ color, size }) => (
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <MaterialCommunityIcons name="dumbbell" size={size} color={color as string} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '日历',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={size}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: '关于',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="information-outline"
              size={size}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

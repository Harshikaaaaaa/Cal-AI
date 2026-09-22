import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalAi } from '../constants/calAiTheme';
import { useScan } from '../context/ScanContext';

const TABS = [
  { name: 'index', label: 'Home', icon: '🏠' },
  { name: 'explore', label: 'Progress', icon: '📊' },
  { name: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { openScan } = useScan();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          if (routeIndex === -1) return null;
          const isFocused = state.index === routeIndex;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, !isFocused && styles.tabIconInactive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.fab} onPress={openScan} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: CalAi.tabBar,
    borderTopWidth: 1,
    borderTopColor: CalAi.tabBarBorder,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabIconInactive: {
    opacity: 0.45,
  },
  tabLabel: {
    fontSize: 11,
    color: CalAi.tabInactive,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: CalAi.tabActive,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: Platform.OS === 'ios' ? 4 : 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CalAi.fab,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});

import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '../components/CustomTabBar';
import { ScanModal } from '../components/ScanModal';
import { NutritionProvider } from '../context/NutritionContext';
import { ScanProvider, useScan } from '../context/ScanContext';

function TabNavigator() {
  const { scanVisible, closeScan } = useScan();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Progress' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
      <ScanModal visible={scanVisible} onClose={closeScan} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <NutritionProvider>
      <ScanProvider>
        <TabNavigator />
      </ScanProvider>
    </NutritionProvider>
  );
}

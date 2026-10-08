import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="fullHistory"
      tabBar={() => null}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="bills/index" />
      <Tabs.Screen name="transactions/index" />
      <Tabs.Screen name="payment-methods/index" />
    </Tabs>
  );
}

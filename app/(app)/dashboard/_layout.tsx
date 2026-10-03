import { Stack } from 'expo-router';

// Sign-in is already enforced by the parent (app) layout before this one renders.
export default function DashboardLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="routines" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

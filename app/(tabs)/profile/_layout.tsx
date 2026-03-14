import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="my-routines" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

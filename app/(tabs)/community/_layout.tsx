import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="groups" />
      <Stack.Screen name="groups/[id]/index" />
      <Stack.Screen name="groups/[id]/chat" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="salons" />
      <Stack.Screen name="salons/[id]" />
      <Stack.Screen name="products" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="products/cart" />
      <Stack.Screen name="blog" />
      <Stack.Screen name="blog/[slug]" />
    </Stack>
  );
}

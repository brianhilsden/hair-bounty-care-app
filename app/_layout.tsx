import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import { ToastProvider } from '../components/ui/Toast';
import { registerForPushNotificationsAsync } from './notifications';
import { notificationsApi } from '../lib/api/notifications';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();

    // Register push token whenever auth state changes to authenticated
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.isAuthenticated && !prev.isAuthenticated) {
        registerForPushNotificationsAsync().then((token) => {
          if (token) notificationsApi.registerPushToken(token).catch(() => {});
        });
      }
    });

    // Also register immediately if already authenticated on mount
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) notificationsApi.registerPushToken(token).catch(() => {});
      });
    }

    return () => unsub();
  }, [checkAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
        <StatusBar style="light" backgroundColor="#3F2D25" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#3F2D25' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
        </Stack>
        </ToastProvider>
      </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

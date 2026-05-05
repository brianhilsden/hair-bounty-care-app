import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

function handleNotificationTap(data: any, router: ReturnType<typeof useRouter>) {
  const { type, orderId, badgeId, referredUserId } = data ?? {};
  if (!type) return;

  if (type?.startsWith('order_') && orderId) {
    router.push(`/explore/orders/${orderId}`);
  } else if (type === 'badge_earned') {
    router.push('/(tabs)/home');
  } else if (type === 'streak_milestone' || type === 'streak_broken' || type === 'streak_at_risk') {
    router.push('/(tabs)/home');
  } else if (type === 'group_post') {
    router.push('/(tabs)/community');
  } else if (type === 'referral_joined') {
    router.push('/profile/referrals');
  } else if (type === 'monthly_progress') {
    router.push('/(tabs)/home/progress');
  }
}
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import { ToastProvider } from '../components/ui/Toast';
import { registerForPushNotificationsAsync } from './notifications';
import { notificationsApi } from '../lib/api/notifications';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Deep link: tapping a push notification navigates to the right screen
  useEffect(() => {
    if (!isAuthenticated) return;

    // Handle notification tap when app is already open
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as any;
      handleNotificationTap(data, router);
    });

    // Handle notification tap that launched the app from killed/background state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = (response.notification.request.content.data ?? {}) as any;
      handleNotificationTap(data, router);
    });

    return () => sub.remove();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log('[PushToken] got token:', token);
        if (token) {
          return notificationsApi.registerPushToken(token)
            .then(() => console.log('[PushToken] registered successfully'))
            .catch((err) => console.error('[PushToken] register failed:', err));
        } else {
          console.warn('[PushToken] no token returned — check permissions and projectId');
        }
      })
      .catch((err) => console.error('[PushToken] getExpoPushToken failed:', err));
  }, [isAuthenticated]);

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

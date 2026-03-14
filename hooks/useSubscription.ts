import { useAuthStore, Subscription } from '../store/authStore';

type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'none';

export function useSubscription() {
  const subscription = useAuthStore((s) => s.subscription);

  function getStatus(): SubscriptionStatus {
    if (!subscription) return 'none';
    if (subscription.status === 'TRIAL') return 'trial';
    if (subscription.status === 'ACTIVE') return 'active';
    return 'expired';
  }

  function isActive(): boolean {
    if (!subscription) return false;
    return subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
  }

  function daysRemaining(): number | null {
    if (!subscription) return null;
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  function isPremiumFeatureAllowed(): boolean {
    return isActive();
  }

  return {
    subscription,
    status: getStatus(),
    isActive: isActive(),
    daysRemaining: daysRemaining(),
    isTrial: subscription?.status === 'TRIAL',
    isPremiumFeatureAllowed: isPremiumFeatureAllowed(),
    plan: subscription?.plan ?? null,
  };
}
